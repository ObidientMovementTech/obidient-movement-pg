import { query } from '../config/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getSignedFileUrl, uploadBufferToS3 } from '../utils/s3Upload.js';

// ──── Get app info (public) ────
export const getAppInfo = async (req, res) => {
  try {
    const result = await query(
      `SELECT key, value FROM app_settings WHERE key IN ('app_current_version', 'app_file_size', 'app_release_notes', 'app_released_at')`
    );

    const info = {};
    result.rows.forEach(row => { info[row.key] = row.value; });

    res.json({
      success: true,
      version: info.app_current_version || '1.0.0',
      fileSize: info.app_file_size || '',
      releaseNotes: info.app_release_notes || '',
      releasedAt: info.app_released_at || '',
    });
  } catch (error) {
    console.error('getAppInfo error:', error);
    res.status(500).json({ message: 'Failed to fetch app info' });
  }
};

// ──── Request download token (authenticated) ────
export const requestDownloadToken = async (req, res) => {
  try {
    const userId = req.userId;

    // Rate limit: max 10 downloads per user per hour
    const recentDownloads = await query(
      `SELECT COUNT(*) as count FROM app_downloads 
       WHERE user_id = $1 AND downloaded_at > NOW() - INTERVAL '1 hour'`,
      [userId]
    );

    if (parseInt(recentDownloads.rows[0].count) >= 10) {
      return res.status(429).json({
        message: 'Download limit reached. Please try again later.',
      });
    }

    // Generate short-lived download token (5 min)
    const jti = uuidv4();
    const downloadToken = jwt.sign(
      { userId, purpose: 'app-download', jti },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ success: true, downloadToken });
  } catch (error) {
    console.error('requestDownloadToken error:', error);
    res.status(500).json({ message: 'Failed to generate download token' });
  }
};

// ──── Download APK file (token-validated) ────
export const downloadApp = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Download token is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired download token' });
    }

    if (decoded.purpose !== 'app-download') {
      return res.status(401).json({ message: 'Invalid token purpose' });
    }

    // Get S3 key from settings
    const s3KeyResult = await query(
      `SELECT value FROM app_settings WHERE key = 'app_s3_key'`
    );

    if (!s3KeyResult.rows.length || !s3KeyResult.rows[0].value) {
      return res.status(404).json({ message: 'App file not available. Please contact admin.' });
    }

    const s3Key = s3KeyResult.rows[0].value;

    // Get current version
    const versionResult = await query(
      `SELECT value FROM app_settings WHERE key = 'app_current_version'`
    );
    const version = versionResult.rows[0]?.value || '1.0.0';

    // Log the download
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    await query(
      `INSERT INTO app_downloads (user_id, version, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [decoded.userId, version, ip, userAgent]
    );

    // Generate pre-signed URL (60 seconds) with branded filename
    const brandedName = `Obidient-Movement-v${version}.apk`;
    const signedUrl = await getSignedFileUrl(s3Key, 60, { downloadFilename: brandedName });

    // Redirect to S3 pre-signed URL
    res.redirect(302, signedUrl);
  } catch (error) {
    console.error('downloadApp error:', error);
    res.status(500).json({ message: 'Download failed' });
  }
};

// ──── Admin: Get download stats ────
export const getDownloadStats = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_downloads,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) FILTER (WHERE downloaded_at > NOW() - INTERVAL '24 hours') as today,
        COUNT(*) FILTER (WHERE downloaded_at > NOW() - INTERVAL '7 days') as this_week,
        COUNT(*) FILTER (WHERE downloaded_at > NOW() - INTERVAL '30 days') as this_month
      FROM app_downloads
    `);

    res.json({ success: true, stats: stats.rows[0] });
  } catch (error) {
    console.error('getDownloadStats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ──── Admin: Get download logs (paginated) ────
export const getDownloadLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = '';
    const params = [limit, offset];

    if (search) {
      whereClause = `WHERE u.name ILIKE $3 OR u.email ILIKE $3`;
      params.push(`%${search}%`);
    }

    const downloads = await query(
      `SELECT d.id, d.version, d.ip_address, d.user_agent, d.downloaded_at,
              u.name as user_name, u.email as user_email
       FROM app_downloads d
       JOIN users u ON u.id = d.user_id
       ${whereClause}
       ORDER BY d.downloaded_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM app_downloads d
       JOIN users u ON u.id = d.user_id
       ${whereClause}`,
      search ? [`%${search}%`] : []
    );

    res.json({
      success: true,
      downloads: downloads.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    });
  } catch (error) {
    console.error('getDownloadLogs error:', error);
    res.status(500).json({ message: 'Failed to fetch download logs' });
  }
};

// ──── Admin: Upload APK to S3 ────
export const uploadApk = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'APK file is required' });
    }

    const version = req.body.version;
    const releaseNotes = req.body.releaseNotes || '';

    if (!version) {
      return res.status(400).json({ message: 'Version is required' });
    }

    // Upload to S3 under app-releases folder
    const fileName = `obidient-movement-v${version}.apk`;
    const s3Url = await uploadBufferToS3(req.file.buffer, fileName, {
      folder: 'app-releases',
      contentType: 'application/vnd.android.package-archive',
    });

    // Extract S3 key from URL
    const url = new URL(s3Url);
    const s3Key = url.pathname.substring(1);

    // Calculate file size
    const fileSizeMB = (req.file.buffer.length / (1024 * 1024)).toFixed(1) + ' MB';

    // Update app settings
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('app_current_version', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [version]
    );
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('app_s3_key', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [s3Key]
    );
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('app_file_size', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [fileSizeMB]
    );
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('app_release_notes', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [releaseNotes]
    );
    await query(
      `INSERT INTO app_settings (key, value, updated_at) VALUES ('app_released_at', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
      [new Date().toISOString()]
    );

    res.json({
      success: true,
      message: 'APK uploaded successfully',
      version,
      fileSize: fileSizeMB,
      s3Key,
    });
  } catch (error) {
    console.error('uploadApk error:', error);
    res.status(500).json({ message: 'Failed to upload APK' });
  }
};
