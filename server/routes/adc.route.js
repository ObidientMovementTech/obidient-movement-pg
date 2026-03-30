import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';
import {
  submitAdcCard,
  getAdcStatus,
  getAdcSubmissions,
  approveAdc,
  rejectAdc,
} from '../controllers/adc.controller.js';

const router = express.Router();

// User routes
router.get('/status', protect, getAdcStatus);
router.post('/submit-card', protect, submitAdcCard);

// Admin routes
router.get('/submissions', protect, isAdmin, getAdcSubmissions);
router.patch('/:userId/approve', protect, isAdmin, approveAdc);
router.patch('/:userId/reject', protect, isAdmin, rejectAdc);

export default router;
