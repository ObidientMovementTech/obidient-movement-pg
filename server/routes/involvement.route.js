import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { verifyRecaptcha } from '../middlewares/recaptcha.middleware.js';
import {
  submitInterest,
  getInterests,
  getInterestById,
  updateInterestStatus,
  deleteInterest,
  getInterestStats,
} from '../controllers/involvement.controller.js';

const router = express.Router();

// Rate limit for public form submission: 3 per IP per hour
const involvementRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: submit interest form
router.post('/submit', involvementRateLimit, verifyRecaptcha, submitInterest);

// Admin: list all interests (with filters + pagination)
router.get('/interests', protect, isAdmin, getInterests);

// Admin: interest stats
router.get('/stats', protect, isAdmin, getInterestStats);

// Admin: get single interest
router.get('/interests/:id', protect, isAdmin, getInterestById);

// Admin: update interest status / notes
router.patch('/interests/:id/status', protect, isAdmin, updateInterestStatus);

// Admin: delete interest
router.delete('/interests/:id', protect, isAdmin, deleteInterest);

export default router;
