import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import {
  getDefaultSettings,
  updateDefaultSettings,
  uploadBannerImage
} from '../controllers/defaultVotingBlocSettings.controller.js';
import {
  getSyncStatus,
  checkOutdatedBlocs,
  syncVotingBloc,
  syncAllOutdatedBlocs,
  updateSyncPreferences
} from '../controllers/templateSync.controller.js';
import { cleanupDuplicateAutoBlocs } from '../controllers/auth.controller.js';
import { submitManualResult, uploadAdminEvidence } from '../controllers/adminManualResult.controller.js';
import adminUserManagementRoutes from './adminUserManagement.route.js';
import monitorKeyRoutes from './monitorKey.route.js';

const router = express.Router();

// Admin routes for managing default voting bloc settings
router.get('/default-settings', protect, isAdmin, getDefaultSettings);
router.put('/default-settings', protect, isAdmin, updateDefaultSettings);
router.post('/upload-banner', protect, isAdmin, parseFileUpload('image'), uploadBannerImage);

// Template sync routes
router.get('/sync/status', protect, isAdmin, getSyncStatus);
router.get('/sync/outdated-blocs', protect, isAdmin, checkOutdatedBlocs);
router.post('/sync/voting-bloc/:votingBlocId', protect, isAdmin, syncVotingBloc);
router.post('/sync/all-outdated', protect, isAdmin, syncAllOutdatedBlocs);
router.put('/sync/preferences/:votingBlocId', protect, isAdmin, updateSyncPreferences);

// User management routes
router.use('/user-management', adminUserManagementRoutes);

// Monitor key management routes
router.use('/monitor-key', monitorKeyRoutes);

// Manual result upload (admin-only, bypasses monitor key)
router.post('/manual-result-upload', protect, isAdmin, submitManualResult);
router.post('/upload-evidence', protect, isAdmin, parseFileUpload('evidence'), uploadAdminEvidence);

// Cleanup and maintenance routes
router.post('/cleanup/duplicate-auto-blocs', protect, isAdmin, cleanupDuplicateAutoBlocs);

export default router;
