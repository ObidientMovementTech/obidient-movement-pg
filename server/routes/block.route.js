import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  blockUser,
  unblockUser,
  getBlockedUsers,
} from '../controllers/block.controller.js';

const router = Router();

// List blocked users (must be before /:id routes)
router.get('/blocked', protect, getBlockedUsers);

// Block / unblock a user
router.post('/:id/block', protect, blockUser);
router.delete('/:id/block', protect, unblockUser);

export default router;
