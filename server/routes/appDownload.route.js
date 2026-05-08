import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import {
  getAppInfo,
  requestDownloadToken,
  downloadApp,
  getDownloadStats,
  getDownloadLogs,
  uploadApk,
} from '../controllers/appDownload.controller.js';

const router = express.Router();

// Public: get app version/size info
router.get('/info', getAppInfo);

// Authenticated: request a short-lived download token
router.post('/request-token', protect, requestDownloadToken);

// Token-validated: download the APK (redirects to S3 pre-signed URL)
router.get('/file', downloadApp);

// Admin: download statistics
router.get('/downloads/stats', protect, isAdmin, getDownloadStats);

// Admin: paginated download logs
router.get('/downloads', protect, isAdmin, getDownloadLogs);

// Admin: upload new APK
router.post('/upload', protect, isAdmin, parseFileUpload('file'), uploadApk);

export default router;
