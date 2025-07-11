import express from 'express';
import {
  sendAdminBroadcast,
  getAdminBroadcasts,
  getAdminBroadcastById,
  updateAdminBroadcast,
  deleteAdminBroadcast
} from '../controllers/adminBroadcast.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Admin broadcast routes
router.post('/send', protect, sendAdminBroadcast);
router.get('/', protect, getAdminBroadcasts);
router.get('/:id', protect, getAdminBroadcastById);
router.put('/:id', protect, updateAdminBroadcast);
router.delete('/:id', protect, deleteAdminBroadcast);

export default router;
