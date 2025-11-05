import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { monitoringController } from '../controllers/monitoring.controller.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import { bulkSyncSubmissions } from '../controllers/bulkSync.controller.js';

const router = express.Router();

// All monitoring routes require authentication and active monitoring key
router.use(protect);

// Eligible designations for monitoring access
const MONITORING_DESIGNATIONS = [
  'National Coordinator',
  'State Coordinator',
  'LGA Coordinator',
  'Ward Coordinator',
  'Polling Unit Agent',
  'Vote Defender'
];

// Middleware to check for active monitoring key and validate monitoring scope
const requireActiveMonitorKey = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if user has an active monitoring key and fetch monitoring data
    const { query } = await import('../config/db.js');
    const result = await query(
      `SELECT 
         monitor_unique_key, 
         key_status, 
         designation,
         monitoring_location,
         "votingState",
         "votingLGA",
         "votingWard",
         "votingPU"
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (!result.rows[0]) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Check 1: Verify designation is eligible for monitoring
    if (!user.designation || !MONITORING_DESIGNATIONS.includes(user.designation)) {
      return res.status(403).json({
        success: false,
        message: 'Your designation is not eligible for monitoring access',
        details: `Only ${MONITORING_DESIGNATIONS.join(', ')} have monitoring access`
      });
    }

    // Check 2: Verify monitoring key exists and is active
    if (!user.monitor_unique_key || user.key_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Active monitoring key required to access this resource',
        details: 'Please contact an administrator to activate your monitoring key'
      });
    }

    // Check 3: Extract monitoring location (with fallback to voting fields)
    let monitoringScope = null;

    // Try to parse monitoring_location JSON first
    if (user.monitoring_location && typeof user.monitoring_location === 'object') {
      monitoringScope = {
        source: 'monitoring_location',
        state: user.monitoring_location.state || null,
        stateLabel: user.monitoring_location.stateLabel || user.monitoring_location.state || null,
        lga: user.monitoring_location.lga || null,
        lgaLabel: user.monitoring_location.lgaLabel || user.monitoring_location.lga || null,
        ward: user.monitoring_location.ward || null,
        wardLabel: user.monitoring_location.wardLabel || user.monitoring_location.ward || null,
        pollingUnit: user.monitoring_location.pollingUnit || null,
        pollingUnitLabel: user.monitoring_location.pollingUnitLabel || user.monitoring_location.pollingUnit || null,
        level: user.monitoring_location.level || null,
        designation: user.designation
      };
    }

    // Fallback to voting fields if monitoring_location is not set
    if (!monitoringScope || !monitoringScope.pollingUnit) {
      monitoringScope = {
        source: 'voting_fields',
        state: user.votingState || null,
        stateLabel: user.votingState || null,
        lga: user.votingLGA || null,
        lgaLabel: user.votingLGA || null,
        ward: user.votingWard || null,
        wardLabel: user.votingWard || null,
        pollingUnit: user.votingPU || null,
        pollingUnitLabel: user.votingPU || null,
        level: null, // No level in fallback
        designation: user.designation
      };
    }

    // Check 4: Verify polling unit is set (required for submissions)
    if (!monitoringScope.pollingUnit) {
      return res.status(403).json({
        success: false,
        message: 'Polling unit assignment required for monitoring access',
        details: 'Your account does not have a polling unit assigned. Please contact an administrator.'
      });
    }

    // Attach validated monitoring scope to request
    req.monitoringScope = monitoringScope;
    req.monitoringKey = user.monitor_unique_key;

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

// Bulk sync - Process multiple queued submissions from offline clients
router.post('/bulk-sync', bulkSyncSubmissions);

// ================================
// DATA RETRIEVAL ROUTES
// ================================

// Get submission status
router.get('/submission/:submissionId', monitoringController.getSubmissionStatus);

// Get user's submissions
router.get('/submissions', monitoringController.getUserSubmissions);

// Get submission details with all forms
router.get('/submission/:submissionId/details', monitoringController.getSubmissionDetails);

// ================================
// MONITORING DASHBOARD STATUS ROUTES
// ================================

// Get monitoring dashboard status (PU completion check + form statuses)
router.get('/status', requireActiveMonitorKey, monitoringController.getMonitoringStatus);

// Get recent submissions summary
router.get('/recent-submissions', requireActiveMonitorKey, monitoringController.getRecentSubmissions);

export default router;
