import express from 'express';
import { protect, authenticateUser } from '../middlewares/auth.middleware.js';
import {
  uploadProfileImage,
  updateMe,
  updateUser,
  requestPasswordChange,
  verifyOTP,
  changePassword,
  sendEmailVerification,
  setup2FA,
  verify2FA,
  disable2FA,
  requestEmailChange,
  verifyEmailChange,
  updateNotificationPreferences,
  deleteAccount,
  getProfileCompletion,
  checkUsernameAvailability,
  getPollingUnitMembers
} from '../controllers/user.controller.js'
import { parseFileUpload } from '../utils/s3Upload.js';

const router = express.Router();

// Use serverless-compatible file upload middleware instead of multer
router.post('/upload-profile-image', protect, parseFileUpload('file'), uploadProfileImage);
router.patch('/me', protect, updateMe);

// Username availability check
router.get('/check-username', protect, checkUsernameAvailability);

// Profile completion (safe read-only endpoint)
router.get('/profile-completion', protect, getProfileCompletion);

// Polling unit members
router.get('/polling-unit-members', protect, getPollingUnitMembers);

// Password change endpoints
router.post('/change-password-request', authenticateUser, requestPasswordChange);
router.post('/verify-otp', authenticateUser, verifyOTP);
router.post('/change-password', authenticateUser, changePassword);

// Email verification
router.post('/send-email-verification', protect, sendEmailVerification);

// Two-factor authentication
router.post('/setup-2fa', protect, setup2FA);
router.post('/verify-2fa', protect, verify2FA);
router.post('/disable-2fa', protect, disable2FA);

// Email change
router.post('/change-email-request', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);

// Notification preferences
router.patch('/notification-preferences', protect, updateNotificationPreferences);

// Account deletion
router.post('/delete-account', protect, deleteAccount);

export default router;
