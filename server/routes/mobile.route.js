import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';
import {
  mobileLogin,
  getMobileFeeds,
  sendLeadershipMessage,
  getMyMessages,
  registerPushToken,
  createMobileFeed,
  updateMobileFeed,
  deleteMobileFeed,
  updatePushSettings,
  uploadMobileFeedImage,
  getMobileNotifications,
  markMobileNotificationRead
} from '../controllers/mobile.controller.js';

const router = express.Router();

// Health check
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API is working!',
    timestamp: new Date().toISOString()
  });
});

// Authentication
router.post('/auth/login', mobileLogin);

// Feeds/Alerts
router.get('/feeds', protect, getMobileFeeds);
router.post('/feeds', protect, isAdmin, createMobileFeed); // For admin users
router.put('/feeds/:id', protect, isAdmin, updateMobileFeed); // Update feed (admin only)
router.delete('/feeds/:id', protect, isAdmin, deleteMobileFeed); // Delete feed (admin only)
router.post('/feeds/upload-image', protect, isAdmin, parseFileUpload('file'), uploadMobileFeedImage);

// Leadership Messaging
router.post('/messages/leadership', protect, sendLeadershipMessage);
router.get('/messages/my-messages', protect, getMyMessages);

// Push Notifications
router.post('/push/register-token', protect, registerPushToken);
router.put('/push/settings', protect, updatePushSettings);

// Notifications (unified system)
router.get('/notifications', protect, getMobileNotifications);
router.put('/notifications/:id/read', protect, markMobileNotificationRead);

export default router;
