/**
 * Bulk Sync Endpoint for Offline Monitoring Submissions
 * Processes queued submissions from offline clients
 */

import { getClient } from '../config/db.js';
import { logger } from '../middlewares/security.middleware.js';
import { monitoringService, MONITOR_SUBMISSION_TYPES } from '../services/monitoringService.js';
import { deriveMonitoringScopeFromUser } from '../utils/monitoringScope.js';

/**
 * Validate submission type
 */
const isValidSubmissionType = (type) => {
  return Object.values(MONITOR_SUBMISSION_TYPES).includes(type);
};

/**
 * Process a single submission from the queue
 * Returns result with success status and details
 */
const processSingleSubmission = async (client, userId, submission, userScope) => {
  try {
    const {
      submissionType,
      clientSubmissionId,
      submissionData,
      attachments = [],
      createdAt,
      electionId
    } = submission;

    // Validate submission type
    if (!isValidSubmissionType(submissionType)) {
      return {
        success: false,
        clientSubmissionId,
        error: 'INVALID_TYPE',
        message: `Invalid submission type: ${submissionType}`
      };
    }

    // Check for duplicate using client_submission_id
    if (clientSubmissionId) {
      const existingCheck = await client.query(
        `SELECT id, submission_id 
         FROM monitor_submissions
         WHERE user_id = $1 
           AND client_submission_id = $2
         LIMIT 1`,
        [userId, clientSubmissionId]
      );

      if (existingCheck.rows.length > 0) {
        logger.info('Skipping duplicate submission during bulk sync', {
          userId,
          clientSubmissionId,
          existingId: existingCheck.rows[0].submission_id
        });

        return {
          success: true,
          duplicate: true,
          clientSubmissionId,
          submissionId: existingCheck.rows[0].submission_id,
          message: 'Submission already processed'
        };
      }
    }

    // Generate submission ID
    const submissionId = `SUB-${crypto.randomUUID()}`;

    // Build scope snapshot from user or submission data
    const scopeSnapshot = {
      state: userScope.stateLabel || userScope.state,
      stateCode: userScope.state,
      lga: userScope.lgaLabel || userScope.lga,
      lgaCode: userScope.lga,
      ward: userScope.wardLabel || userScope.ward,
      wardCode: userScope.ward,
      pollingUnitName: userScope.pollingUnitLabel || userScope.pollingUnit,
      pollingUnitCode: userScope.pollingUnit,
      ...submissionData.scope
    };

    // Extract polling unit code
    const pollingUnitCode = scopeSnapshot.pollingUnitCode ||
      submissionData.puCode ||
      submissionData.pollingUnitCode ||
      null;

    // Insert submission
    const insertResult = await client.query(
      `INSERT INTO monitor_submissions (
        submission_id,
        user_id,
        election_id,
        polling_unit_code,
        scope_snapshot,
        submission_type,
        submission_data,
        attachments,
        status,
        client_submission_id,
        synced_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, NOW())
      RETURNING id, submission_id`,
      [
        submissionId,
        userId,
        electionId || null,
        pollingUnitCode,
        JSON.stringify(scopeSnapshot),
        submissionType,
        JSON.stringify(submissionData),
        JSON.stringify(attachments),
        'submitted',
        clientSubmissionId || null,
        createdAt || new Date().toISOString()
      ]
    );

    logger.info('Bulk sync submission processed', {
      userId,
      submissionId,
      type: submissionType,
      clientSubmissionId
    });

    return {
      success: true,
      duplicate: false,
      clientSubmissionId,
      submissionId: insertResult.rows[0].submission_id,
      submissionType,
      message: 'Submission synced successfully'
    };

  } catch (error) {
    logger.error('Error processing bulk sync submission', {
      userId,
      clientSubmissionId: submission.clientSubmissionId,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      clientSubmissionId: submission.clientSubmissionId,
      error: 'PROCESSING_ERROR',
      message: error.message
    };
  }
};

/**
 * Bulk sync endpoint
 * POST /monitoring/bulk-sync
 * 
 * Accepts array of queued submissions from offline clients
 * Processes them chronologically with deduplication
 * 
 * Request body:
 * {
 *   submissions: [
 *     {
 *       submissionType: 'polling_unit_info',
 *       clientSubmissionId: 'offline-uuid-123',
 *       submissionData: { ... },
 *       attachments: [ ... ],
 *       electionId: 'election-id',
 *       createdAt: '2025-11-05T10:30:00Z'
 *     },
 *     ...
 *   ]
 * }
 */
export const bulkSyncSubmissions = async (req, res) => {
  const client = await getClient();

  try {
    const userId = req.user.id;
    const { submissions } = req.body;

    // Validation
    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'submissions must be a non-empty array'
      });
    }

    if (submissions.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 submissions per bulk sync request'
      });
    }

    // Get user scope for submissions
    const userResult = await client.query(
      `SELECT 
         id,
         designation,
         "votingState",
         "votingLGA",
         "votingWard",
         "votingPU",
         monitoring_location
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    let userScope;

    try {
      userScope = deriveMonitoringScopeFromUser(user);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'User monitoring scope invalid',
        error: error.message
      });
    }

    // Sort submissions by createdAt (chronological order)
    const sortedSubmissions = [...submissions].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateA - dateB;
    });

    await client.query('BEGIN');

    // Process submissions sequentially
    const results = [];
    let successCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;

    for (const submission of sortedSubmissions) {
      const result = await processSingleSubmission(
        client,
        userId,
        submission,
        userScope
      );

      results.push(result);

      if (result.success) {
        if (result.duplicate) {
          duplicateCount++;
        } else {
          successCount++;
        }
      } else {
        failedCount++;
      }
    }

    await client.query('COMMIT');

    logger.info('Bulk sync completed', {
      userId,
      total: submissions.length,
      success: successCount,
      duplicates: duplicateCount,
      failed: failedCount
    });

    res.json({
      success: true,
      message: 'Bulk sync completed',
      summary: {
        total: submissions.length,
        synced: successCount,
        duplicates: duplicateCount,
        failed: failedCount
      },
      results
    });

  } catch (error) {
    await client.query('ROLLBACK');

    logger.error('Error in bulk sync', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      message: 'Failed to process bulk sync',
      error: error.message
    });

  } finally {
    client.release();
  }
};

export default bulkSyncSubmissions;
