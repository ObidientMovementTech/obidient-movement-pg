import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyCoordinators,
  checkChatRateLimit,
  getUnreadCount,
} from '../controllers/chat.controller.js';

const router = Router();

// GET /api/chat/my-coordinators — Get the user's coordinator chain (Ward → LGA → State → National)
router.get('/my-coordinators', protect, getMyCoordinators);

// GET /api/chat/unread-count — Get unread message count for widget badge
router.get('/unread-count', protect, getUnreadCount);

// The actual send/receive/respond endpoints reuse the existing mobile messaging system:
//   POST   /mobile/messages/leadership         → sendLeadershipMessage
//   GET    /mobile/messages/leadership         → getLeadershipMessages (coordinator inbox)
//   POST   /mobile/messages/:messageId/respond → respondToLeadershipMessage
//   PUT    /mobile/messages/:messageId/read    → markMessageAsRead
//   GET    /mobile/messages/my-messages        → getMyMessages
//
// The checkChatRateLimit middleware is exported for use in mobile routes if needed.

export default router;
