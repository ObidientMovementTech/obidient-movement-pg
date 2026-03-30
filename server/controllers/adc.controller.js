import { query } from '../config/db.js';
import { uploadBufferToS3 } from '../utils/s3Upload.js';

// Helper: upload base64 image to S3
const uploadBase64ToS3 = async (base64String, filename, folder) => {
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  return uploadBufferToS3(buffer, filename, { folder, contentType: 'image/jpeg' });
};

// ──── Submit ADC membership card (user) ────
export const submitAdcCard = async (req, res) => {
  try {
    const userId = req.userId;
    const { cardImage } = req.body; // base64 string

    if (!cardImage) {
      return res.status(400).json({ message: 'Card image is required' });
    }

    // Check current status — don't allow re-submit if already verified
    const userResult = await query('SELECT "adcStatus" FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (userResult.rows[0].adcStatus === 'verified') {
      return res.status(400).json({ message: 'ADC membership already verified' });
    }

    // Upload to S3
    const imageUrl = await uploadBase64ToS3(
      cardImage,
      `adc-card-${userId}.jpg`,
      'adc-cards'
    );

    // Update user
    await query(
      `UPDATE users
       SET "adcStatus" = 'pending',
           "adcCardImage" = $2,
           "adcRejectionReason" = NULL,
           "adcSubmittedAt" = NOW()
       WHERE id = $1`,
      [userId, imageUrl]
    );

    res.json({ success: true, status: 'pending', imageUrl });
  } catch (error) {
    console.error('submitAdcCard error:', error);
    res.status(500).json({ message: 'Failed to submit ADC card' });
  }
};

// ──── Get ADC status (user) ────
export const getAdcStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await query(
      'SELECT "adcStatus", "adcCardImage", "adcRejectionReason", "adcSubmittedAt" FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, ...result.rows[0] });
  } catch (error) {
    console.error('getAdcStatus error:', error);
    res.status(500).json({ message: 'Failed to fetch ADC status' });
  }
};

// ──── Admin: Get all ADC submissions ────
export const getAdcSubmissions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    let whereClause = '"adcStatus" != \'not_registered\'';
    const params = [];
    let paramIdx = 1;

    if (status !== 'all') {
      whereClause += ` AND "adcStatus" = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIdx} OR email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT id, name, email, phone, "profileImage",
              "adcStatus", "adcCardImage", "adcRejectionReason",
              "adcSubmittedAt", "adcReviewedAt",
              "votingState", "votingLGA", designation
       FROM users
       WHERE ${whereClause}
       ORDER BY "adcSubmittedAt" DESC NULLS LAST
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    // Stats
    const statsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE "adcStatus" = 'pending') AS pending,
        COUNT(*) FILTER (WHERE "adcStatus" = 'verified') AS verified,
        COUNT(*) FILTER (WHERE "adcStatus" = 'rejected') AS rejected
      FROM users
      WHERE "adcStatus" != 'not_registered'
    `);

    res.json({
      success: true,
      submissions: result.rows,
      stats: statsResult.rows[0],
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      },
    });
  } catch (error) {
    console.error('getAdcSubmissions error:', error);
    res.status(500).json({ message: 'Failed to fetch ADC submissions' });
  }
};

// ──── Admin: Approve ADC ────
export const approveAdc = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `UPDATE users
       SET "adcStatus" = 'verified',
           "adcRejectionReason" = NULL,
           "adcReviewedAt" = NOW()
       WHERE id = $1
       RETURNING id, name, "adcStatus"`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('approveAdc error:', error);
    res.status(500).json({ message: 'Failed to approve ADC registration' });
  }
};

// ──── Admin: Reject ADC ────
export const rejectAdc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const result = await query(
      `UPDATE users
       SET "adcStatus" = 'rejected',
           "adcRejectionReason" = $2,
           "adcReviewedAt" = NOW()
       WHERE id = $1
       RETURNING id, name, "adcStatus"`,
      [userId, reason || 'Card image could not be verified']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('rejectAdc error:', error);
    res.status(500).json({ message: 'Failed to reject ADC registration' });
  }
};
