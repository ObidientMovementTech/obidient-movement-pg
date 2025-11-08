import { v4 as uuidv4 } from 'uuid';
import { getClient } from '../config/db.js';
import { uploadToS3 } from '../utils/s3Upload.js';

const MONITOR_SUBMISSION_TYPES = {
  POLLING_UNIT_INFO: 'polling_unit_info',
  RESULT_TRACKING: 'result_tracking'
};

// Helper to safely stringify JSON values
const stringifyJson = (value, fallback) => JSON.stringify(value ?? fallback ?? null);

/**
 * Admin Manual Result Upload
 * Bypasses monitor key validation for admin-submitted results
 */
export const submitManualResult = async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      electionId,
      pollingUnitCode,
      pollingUnitName,
      ward,
      lga,
      state,
      stats,
      evidence
    } = req.body;

    // Validate required fields
    if (!electionId || !pollingUnitCode || !pollingUnitName) {
      return res.status(400).json({
        success: false,
        message: 'Election ID, polling unit code, and polling unit name are required'
      });
    }

    // Generate submission ID
    const submissionId = `ADMIN-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const userId = req.user.id; // Admin user

    // 1. Create or update polling unit submission
    const scopeSnapshot = {
      pollingUnitCode,
      pollingUnitName,
      ward: ward || '',
      lga: lga || '',
      state: state || ''
    };

    const puSubmissionData = {
      submission_id: submissionId,
      user_id: userId,
      election_id: electionId,
      polling_unit_code: pollingUnitCode,
      submission_type: MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
      scope_snapshot: scopeSnapshot,
      submission_data: {
        puCode: pollingUnitCode,
        puName: pollingUnitName,
        ward: ward || '',
        lga: lga || '',
        state: state || '',
        submittedBy: 'admin',
        submittedAt: new Date().toISOString()
      },
      attachments: [],
      status: 'submitted'
    };

    // Check if polling unit submission exists
    const existingPU = await client.query(
      `SELECT id FROM monitor_submissions 
       WHERE submission_id = $1 AND submission_type = $2`,
      [submissionId, MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO]
    );

    if (existingPU.rows.length === 0) {
      await client.query(
        `INSERT INTO monitor_submissions 
         (submission_id, user_id, election_id, polling_unit_code, submission_type, scope_snapshot, submission_data, attachments, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, NOW())`,
        [
          submissionId,
          userId,
          electionId,
          pollingUnitCode,
          MONITOR_SUBMISSION_TYPES.POLLING_UNIT_INFO,
          stringifyJson(puSubmissionData.scope_snapshot, {}),
          stringifyJson(puSubmissionData.submission_data, {}),
          stringifyJson(puSubmissionData.attachments, []),
          puSubmissionData.status
        ]
      );
    }

    // 2. Create result tracking submission
    // Match the structure of regular monitor submissions for compatibility
    const resultSubmissionData = {
      submissionId,
      officerName: null,
      resultAnnouncerPhoto: null,
      partyAgents: [],
      reporterName: 'Admin Manual Entry',
      reporterPhone: null,
      announcementDate: new Date().toISOString().split('T')[0],
      timeAnnounced: new Date().toTimeString().split(' ')[0],
      stats: {
        registered: stats?.registered ?? null,
        accredited: stats?.accredited ?? null,
        valid: stats?.valid ?? null,
        rejected: stats?.rejected ?? null,
        total: stats?.total ?? null,
        votesPerParty: stats?.votesPerParty || [],
      },
      discrepancies: null,
      signedByAgents: null,
      agentsSignedCount: null,
      resultPosted: null,
      bvasSeen: null,
      evidence: {
        ec8aPhoto: evidence?.ec8aPhoto || null,
        announcementVideo: evidence?.announcementVideo || null,
        wallPhoto: evidence?.wallPhoto || null,
        reporterSelfie: null,
        additional: [],
      },
      notes: 'Manually uploaded by admin',
      submittedAt: new Date().toISOString(),
      submittedBy: 'admin'
    };

    const attachments = [];
    if (evidence?.ec8aPhoto) attachments.push(evidence.ec8aPhoto);
    if (evidence?.announcementVideo) attachments.push(evidence.announcementVideo);
    if (evidence?.wallPhoto) attachments.push(evidence.wallPhoto);

    // Check if result tracking already exists
    const existingResult = await client.query(
      `SELECT id FROM monitor_submissions
       WHERE submission_id = $1 AND submission_type = $2`,
      [submissionId, MONITOR_SUBMISSION_TYPES.RESULT_TRACKING]
    );

    if (existingResult.rows.length > 0) {
      // Update existing
      await client.query(
        `UPDATE monitor_submissions
         SET election_id = $1,
             polling_unit_code = $2,
             scope_snapshot = $3::jsonb,
             submission_data = $4::jsonb,
             attachments = $5::jsonb,
             status = 'submitted',
             updated_at = NOW()
         WHERE submission_id = $6
           AND submission_type = $7`,
        [
          electionId,
          pollingUnitCode,
          stringifyJson(scopeSnapshot, {}),
          stringifyJson(resultSubmissionData, {}),
          stringifyJson(attachments, []),
          submissionId,
          MONITOR_SUBMISSION_TYPES.RESULT_TRACKING
        ]
      );
    } else {
      // Insert new
      await client.query(
        `INSERT INTO monitor_submissions 
         (submission_id, user_id, election_id, polling_unit_code, submission_type, scope_snapshot, submission_data, attachments, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, $9, NOW())`,
        [
          submissionId,
          userId,
          electionId,
          pollingUnitCode,
          MONITOR_SUBMISSION_TYPES.RESULT_TRACKING,
          stringifyJson(scopeSnapshot, {}),
          stringifyJson(resultSubmissionData, {}),
          stringifyJson(attachments, []),
          'submitted'
        ]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Manual result uploaded successfully',
      data: {
        submissionId,
        pollingUnitCode,
        pollingUnitName
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting manual result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload manual result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Admin-only evidence upload endpoint (bypasses monitoring key check)
 * Used for manual result upload by administrators
 */
export const uploadAdminEvidence = async (req, res) => {
  try {
    // File is already parsed via parseFileUpload middleware
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file size (max 50MB for videos, 10MB for images)
    const maxSize = req.file.mimetype.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, MP4, MOV allowed'
      });
    }

    // Upload to S3
    const fileUrl = await uploadToS3(req.file, {
      folder: 'admin-manual-evidence'
    });

    // Log the upload for audit trail
    console.log(`✅ Admin evidence uploaded by user ${req.user.id}:`, {
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    // Return the uploaded file URL (same structure as monitoring upload)
    res.status(200).json({
      success: true,
      message: 'Evidence uploaded successfully',
      data: {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error uploading admin evidence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload evidence',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  submitManualResult
};
