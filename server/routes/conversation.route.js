import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getOnlineStatus,
  getChatContacts,
  toggleReaction,
  deleteMessage,
} from '../controllers/conversation.controller.js';

const router = Router();

// Conversation list + create
router.get('/', protect, getConversations);
router.post('/', protect, getOrCreateConversation);

// Contacts eligible for chat
router.get('/contacts', protect, getChatContacts);

// Online presence check
router.get('/online', protect, getOnlineStatus);

// Messages within a conversation
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);

// Reactions & deletion
router.post('/:convId/messages/:msgId/reactions', protect, toggleReaction);
router.delete('/:convId/messages/:msgId', protect, deleteMessage);

export default router;
