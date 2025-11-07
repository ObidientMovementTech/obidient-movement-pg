import express from 'express';
import passport from '../config/passport.js';
import {
  initiateOnboarding,
  verifyPhone,
  completeOnboarding,
  getOnboardingStats,
  getAgentsByLocation,
  createOnboardingToken,
  validateOnboardingToken,
  getOnboardingTokenInfo,
  resolveShortCode,
  uploadOnboardingProfileImage,
} from '../controllers/onboarding.controller.js';
import { googleLoginCallback } from '../controllers/auth.controller.js';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';
import { logger } from '../middlewares/security.middleware.js';
import { parseFileUpload } from '../utils/s3Upload.js';

const router = express.Router();

// ==================== ADMIN ROUTES ====================
// Create onboarding token (Admin only)
router.post(
  '/tokens/create',
  verifyToken,
  authorize(['National Coordinator', 'State Coordinator']),
  createOnboardingToken
);

// Get onboarding statistics (Admin only)
router.get(
  '/stats',
  verifyToken,
  authorize(['National Coordinator', 'State Coordinator', 'LGA Coordinator']),
  getOnboardingStats
);

// Get agents by location (Admin only)
router.get(
  '/agents',
  verifyToken,
  authorize(['National Coordinator', 'State Coordinator', 'LGA Coordinator']),
  getAgentsByLocation
);

// ==================== PUBLIC ONBOARDING ROUTES ====================
// Validate token and fetch basic info
router.get('/token-info', validateOnboardingToken, getOnboardingTokenInfo);

// Resolve short code to full token (PUBLIC)
router.get('/resolve/:shortCode', resolveShortCode);

// Upload profile image during onboarding
router.post(
  '/upload-profile-image',
  validateOnboardingToken,
  parseFileUpload('file'),
  uploadOnboardingProfileImage
);

// Step 1: Validate token and initiate onboarding with phone
router.post('/initiate', validateOnboardingToken, initiateOnboarding);

// Step 2: Verify phone (check reconciliation)
router.post('/verify-phone', validateOnboardingToken, verifyPhone);

// Step 3: Google OAuth flow
router.get(
  '/google',
  validateOnboardingToken,
  (req, res, next) => {
    const token = req.onboardingToken?.token;

    if (!token) {
      logger.warn('Google OAuth attempted without onboarding token');
      return res.redirect(`${process.env.FRONTEND_URL}/onboarding?error=missing_token`);
    }

    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state: token,
      prompt: 'select_account',
    })(req, res, next);
  }
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/onboarding/error`,
  }),
  (req, res) => {
    const rawState = req.query.state;
    let loginState = null;

    if (typeof rawState === 'string') {
      try {
        const decoded = Buffer.from(rawState, 'base64').toString('utf8');
        const parsed = JSON.parse(decoded);
        if (parsed && parsed.action === 'login') {
          loginState = parsed;
        }
      } catch {
        loginState = null;
      }
    }

    if (loginState) {
      return googleLoginCallback(req, res);
    }

    // Store Google profile in session/cookie temporarily
    // Redirect to frontend to complete profile
    const { googleId, email, displayName, photoUrl } = req.user;

    const stateToken = req.query.state;
    if (!stateToken) {
      logger.error('Google OAuth callback missing state token');
      return res.redirect(`${process.env.FRONTEND_URL}/onboarding?error=missing_token`);
    }

    // Create temporary token with Google data
    const tempData = Buffer.from(
      JSON.stringify({ googleId, email, displayName, photoUrl })
    ).toString('base64');

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    res.redirect(
      `${frontendBase}/onboarding?googleData=${encodeURIComponent(tempData)}&token=${encodeURIComponent(stateToken)}`
    );
  }
);

// Step 4: Complete onboarding (submit all data)
router.post('/complete', validateOnboardingToken, completeOnboarding);

export default router;
