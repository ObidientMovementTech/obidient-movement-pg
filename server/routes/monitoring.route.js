import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { monitoringController } from '../controllers/monitoring.controller.js';
import { parseFileUpload } from '../utils/s3Upload.js';

const router = express.Router();

// All monitoring routes require authentication and active monitoring key
router.use(protect);

// Middleware to check for active monitoring key
const requireActiveMonitorKey = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user has an active monitoring key
    const { query } = await import('../config/db.js');
    const result = await query(
      'SELECT monitor_unique_key, key_status FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0] || result.rows[0].key_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Active monitoring key required to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking monitor key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify monitoring access'
    });
  }
};

router.use(requireActiveMonitorKey);

// ================================
// FORM SUBMISSION ROUTES
// ================================

// Submit polling unit information
router.post('/polling-unit', monitoringController.submitPollingUnitInfo);

// Submit officer arrival report
router.post('/officer-arrival', monitoringController.submitOfficerArrival);

// Submit result tracking
router.post('/result-tracking', monitoringController.submitResultTracking);

// Submit incident report
router.post('/incident-report', monitoringController.submitIncidentReport);

// Upload evidence (photos/videos)
router.post('/upload-evidence', parseFileUpload('evidence'), monitoringController.uploadEvidence);

// ================================
// DATA RETRIEVAL ROUTES
// ================================

// Get submission status
router.get('/submission/:submissionId', monitoringController.getSubmissionStatus);

// Get user's submissions
router.get('/submissions', monitoringController.getUserSubmissions);

// Get submission details with all forms
router.get('/submission/:submissionId/details', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const { query } = await import('../config/db.js');

    // Get polling unit info
    const puResult = await query(`
      SELECT * FROM polling_unit_submissions 
      WHERE submission_id = $1 AND monitor_user_id = $2
    `, [submissionId, userId]);

    if (puResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get officer arrival data
    const officerResult = await query(`
      SELECT * FROM officer_arrival_reports WHERE submission_id = $1
    `, [submissionId]);

    // Get result tracking data
    const resultResult = await query(`
      SELECT * FROM result_tracking_reports WHERE submission_id = $1
    `, [submissionId]);

    // Get incident reports
    const incidentResult = await query(`
      SELECT * FROM incident_reports WHERE submission_id = $1
    `, [submissionId]);

    // Get submission status
    const statusResult = await query(`
      SELECT * FROM submission_status WHERE submission_id = $1
    `, [submissionId]);

    res.status(200).json({
      success: true,
      data: {
        pollingUnit: puResult.rows[0],
        officerArrival: officerResult.rows[0] || null,
        resultTracking: resultResult.rows[0] || null,
        incidentReports: incidentResult.rows,
        status: statusResult.rows[0] || null
      }
    });

  } catch (error) {
    console.error('Error getting submission details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get submission details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ================================
// MONITORING DASHBOARD STATUS ROUTES
// ================================

// Get monitoring dashboard status (PU completion check + form statuses)
router.get('/status', requireActiveMonitorKey, monitoringController.getMonitoringStatus);

// Get recent submissions summary
router.get('/recent-submissions', requireActiveMonitorKey, monitoringController.getRecentSubmissions);

export default router;
