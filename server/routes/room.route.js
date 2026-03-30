import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyRooms,
  getRoomMessages,
  sendRoomMessage,
  deleteRoomMessage,
  muteUser,
  unmuteUser,
  pinMessage,
  banUser,
  getRoomMembers,
  getPinnedMessages,
  cleanupRoom,
} from '../controllers/room.controller.js';

const router = Router();

// User's eligible rooms (lazy-created)
router.get('/my-rooms', protect, getMyRooms);

// Messages within a room
router.get('/:id/messages', protect, getRoomMessages);
router.post('/:id/messages', protect, sendRoomMessage);

// Pinned messages
router.get('/:id/pinned', protect, getPinnedMessages);

// Members list
router.get('/:id/members', protect, getRoomMembers);

// Delete own message or admin moderation
router.delete('/:id/messages/:msgId', protect, deleteRoomMessage);

// Admin: moderation
router.post('/:id/mute/:userId', protect, muteUser);
router.post('/:id/unmute/:userId', protect, unmuteUser);
router.post('/:id/pin/:msgId', protect, pinMessage);
router.post('/:id/ban/:userId', protect, banUser);
router.delete('/:id/cleanup', protect, cleanupRoom);

export default router;
