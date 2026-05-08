import express from 'express';
import multer from 'multer';
import {
  sendAdminBroadcast,
  getAdminBroadcasts,
  getAdminBroadcastById,
  updateAdminBroadcast,
  deleteAdminBroadcast,
  cancelBroadcast,
  streamBroadcastProgress,
  getBroadcastEmailLogs,
  getBroadcastEmailStats,
  retryBroadcastEmails,
  uploadBroadcastImage
} from '../controllers/adminBroadcast.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Multer memory storage for image uploads (max 1MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
});

// Admin broadcast routes
router.post('/send', protect, sendAdminBroadcast);
router.post('/upload-image', protect, upload.single('image'), uploadBroadcastImage);
router.get('/', protect, getAdminBroadcasts);
router.get('/:id', protect, getAdminBroadcastById);
router.put('/:id', protect, updateAdminBroadcast);
router.delete('/:id', protect, deleteAdminBroadcast);

// Email delivery tracking & control
router.post('/:id/cancel', protect, cancelBroadcast);
router.get('/:id/progress/stream', protect, streamBroadcastProgress);
router.get('/:id/email-logs', protect, getBroadcastEmailLogs);
router.get('/:id/email-stats', protect, getBroadcastEmailStats);
router.post('/:id/retry', protect, retryBroadcastEmails);

export default router;
