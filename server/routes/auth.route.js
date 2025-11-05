import express from 'express';
import passport from '../config/passport.js';
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

const DEFAULT_REDIRECT = '/dashboard';

const sanitizeRedirectPath = (rawPath) => {
  if (!rawPath || typeof rawPath !== 'string') {
    return DEFAULT_REDIRECT;
  }

  try {
    const decoded = decodeURIComponent(rawPath);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) {
      return DEFAULT_REDIRECT;
    }
    return decoded;
  } catch {
    return DEFAULT_REDIRECT;
  }
};

const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const encodeState = (payload) => Buffer.from(JSON.stringify(payload)).toString('base64');

const getLoginCallbackUrl = (req) => {
  const explicit = process.env.GOOGLE_LOGIN_CALLBACK_URL || process.env.GOOGLE_AUTH_CALLBACK_URL;
  if (explicit) {
    return explicit;
  }

  if (process.env.GOOGLE_CALLBACK_URL) {
    try {
      const url = new URL(process.env.GOOGLE_CALLBACK_URL);
      url.pathname = '/auth/onboarding/google/callback';
      return url.toString();
    } catch {
      return process.env.GOOGLE_CALLBACK_URL;
    }
  }

  const envUrl = process.env.API_BASE_URL || process.env.API_URL || process.env.SERVER_PUBLIC_URL;
  if (envUrl) {
    return `${envUrl.replace(/\/$/, '')}/auth/onboarding/google/callback`;
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : (req.protocol || 'http');
  const host = req.headers['x-forwarded-host'] || req.get('host');

  return `${protocol}://${host}`.replace(/\/$/, '') + '/auth/onboarding/google/callback';
};

// Authentication routes with rate limiting and validation
router.post('/register',
  registerRateLimit,
  validateRegistration,
  handleValidationErrors,
  registerUser
);

router.post('/login',
  loginRateLimit,
  // validateLogin,
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

router.get('/google', (req, res, next) => {
  const redirectParam = Array.isArray(req.query.redirect)
    ? req.query.redirect[0]
    : req.query.redirect;

  const redirectPath = sanitizeRedirectPath(redirectParam);
  const callbackUrl = getLoginCallbackUrl(req);
  const statePayload = encodeState({ action: 'login', redirectTo: redirectPath });

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account',
    state: statePayload,
    callbackURL: callbackUrl,
  })(req, res, next);
});

export default router;
