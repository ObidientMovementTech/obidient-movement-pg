import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import { verifyRecaptcha } from '../middlewares/recaptcha.middleware.js';
import { query } from '../config/db.js';
import {
  submitInterest,
  getInterests,
  getInterestById,
  updateInterestStatus,
  deleteInterest,
  getInterestStats,
} from '../controllers/involvement.controller.js';

const router = express.Router();

// Middleware: allow admin OR Directorate Head, and attach designation info to req
const isAdminOrDirectorateHead = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const result = await query(
      `SELECT role, designation, "assignedDirectorate" FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

    const { role, designation, assignedDirectorate } = result.rows[0];
    req.userDesignation = designation;
    req.userDirectorate = assignedDirectorate;

    if (role === 'admin' || designation === 'Directorate Head') {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Admin or Directorate Head required.' });
  } catch (err) {
    console.error('isAdminOrDirectorateHead error:', err);
    return res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
};

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

// Authenticated: submit interest form (user must be logged in)
router.post('/submit', protect, involvementRateLimit, verifyRecaptcha, submitInterest);

// Admin or Directorate Head: list interests (scoped for directorate heads)
router.get('/interests', protect, isAdminOrDirectorateHead, getInterests);

// Admin or Directorate Head: interest stats (scoped for directorate heads)
router.get('/stats', protect, isAdminOrDirectorateHead, getInterestStats);

// Admin or Directorate Head: get single interest
router.get('/interests/:id', protect, isAdminOrDirectorateHead, getInterestById);

// Admin or Directorate Head: update interest status / notes
router.patch('/interests/:id/status', protect, isAdminOrDirectorateHead, updateInterestStatus);

// Admin only: delete interest
router.delete('/interests/:id', protect, isAdmin, deleteInterest);

export default router;
