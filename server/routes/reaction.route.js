import { Router } from 'express';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  toggleReaction,
  getReactions,
  getReactionsBatch,
} from '../controllers/reaction.controller.js';

const router = Router();

// POST /api/reactions — Toggle a reaction (auth required)
router.post('/', protect, toggleReaction);

// GET /api/reactions/:targetType/:targetId — Get counts + optional user reaction
router.get('/:targetType/:targetId', optionalAuth, getReactions);

// POST /api/reactions/batch — Batch get counts (auth optional for user reactions)
router.post('/batch', optionalAuth, getReactionsBatch);

export default router;
