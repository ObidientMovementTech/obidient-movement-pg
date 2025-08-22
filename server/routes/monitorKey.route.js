import express from 'express';
import { isAdmin, protect } from '../middlewares/auth.middleware.js';
// import { adminMiddleware } from '../middlewares/admin.middleware.js';
import { monitorKeyController } from '../controllers/monitorKey.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes for managing monitoring keys
router.post('/assign/:userId', isAdmin, monitorKeyController.assignMonitorKey);
router.put('/revoke/:userId', isAdmin, monitorKeyController.revokeMonitorKey);
router.get('/elections', isAdmin, monitorKeyController.getActiveElections);

// User routes for monitoring access
router.post('/verify', monitorKeyController.verifyMonitorKey);
router.get('/access', monitorKeyController.getMonitoringAccess);

export default router;
