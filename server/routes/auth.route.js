import express from 'express';
import {
  registerUser,
  loginUser,
  confirmEmail,
  forgotPassword,
  resetPassword,
  logoutUser,
  getCurrentUser,
  resendConfirmationEmail,
  verify2FALogin,
} from '../controllers/auth.controller.js';
import { protect, authenticateUser } from "../middlewares/auth.middleware.js";
import {
  registerRateLimit,
  loginRateLimit,
  passwordResetRateLimit,
  emailResendRateLimit,
  validateRegistration,
  validateLogin,
  validatePasswordReset,
  validateNewPassword,
  handleValidationErrors
} from '../middlewares/security.middleware.js';

const router = express.Router();

// Authentication routes with rate limiting and validation
router.post('/register',
  registerRateLimit,
  validateRegistration,
  handleValidationErrors,
  registerUser
);

router.post('/login',
  loginRateLimit,
  validateLogin,
  handleValidationErrors,
  loginUser
);

router.post('/verify-2fa',
  loginRateLimit,
  verify2FALogin
);

router.post('/confirm-email', confirmEmail);

router.post('/forgot-password',
  passwordResetRateLimit,
  validatePasswordReset,
  handleValidationErrors,
  forgotPassword
);

router.post('/reset-password/:token',
  passwordResetRateLimit,
  validateNewPassword,
  handleValidationErrors,
  resetPassword
);

router.post('/logout', logoutUser);

router.get("/me", protect, getCurrentUser); // Using protect middleware that includes email verification

router.post('/resend-confirmation',
  emailResendRateLimit,
  validatePasswordReset,
  handleValidationErrors,
  resendConfirmationEmail
);

// Add a route to check authentication status without requiring email verification
router.get("/auth-status", authenticateUser, (req, res) => {
  res.status(200).json({
    authenticated: true,
    emailVerified: req.emailVerified
  });
});

export default router;
