import express from 'express';
import {
  submitKYC,
  getMyKYC,
  editKYC,
  getAllKYC,
  approveKYC,
  rejectKYC,
  savePersonalInfoStep,
  saveValidIDStep,
  saveSelfieStep
} from '../controllers/kyc.controller.js';
import { protect, authenticateUser } from '../middlewares/auth.middleware.js';
import isAdmin from '../middlewares/admin.middleware.js';

const router = express.Router();

// User routes - using serverless compatible approach (no multer)
router.post('/submit', protect, submitKYC);
router.get('/me', authenticateUser, getMyKYC);
router.patch('/edit', protect, editKYC);
// New step-by-step routes
router.patch('/save-step/personal-info', protect, savePersonalInfoStep);
router.patch('/save-step/valid-id', protect, saveValidIDStep);
router.patch('/save-step/selfie', protect, saveSelfieStep);

// Admin routes - protected by both auth and admin middlewares
router.get('/all', protect, isAdmin, getAllKYC);
router.patch('/:userId/approve', protect, isAdmin, approveKYC);
router.patch('/:userId/reject', protect, isAdmin, rejectKYC);

export default router;
