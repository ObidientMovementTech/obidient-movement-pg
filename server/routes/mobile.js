import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  mobileLogin,
  getMobileFeeds,
  sendLeadershipMessage,
  getMyMessages,
  registerPushToken,
  createMobileFeed,
  updatePushSettings
} from '../controllers/mobile.controller.js';

const router = express.Router();

// Authentication
router.post('/auth/login', mobileLogin);

// Feeds/Alerts
router.get('/feeds', protect, getMobileFeeds);
router.post('/feeds', protect, createMobileFeed); // For admin users

// Leadership Messaging
router.post('/messages/leadership', protect, sendLeadershipMessage);
router.get('/messages/my-messages', protect, getMyMessages);

// Push Notifications
router.post('/push/register-token', protect, registerPushToken);
router.put('/push/settings', protect, updatePushSettings);

export default router;
