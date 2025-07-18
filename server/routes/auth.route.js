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

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-2fa', verify2FALogin);
router.post('/confirm-email', confirmEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', logoutUser);
router.get("/me", protect, getCurrentUser); // Using protect middleware that includes email verification
router.post('/resend-confirmation', resendConfirmationEmail);

// Add a route to check authentication status without requiring email verification
router.get("/auth-status", authenticateUser, (req, res) => {
  res.status(200).json({
    authenticated: true,
    emailVerified: req.emailVerified
  });
});

export default router;
