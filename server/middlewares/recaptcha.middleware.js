import { logger } from './security.middleware.js';

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE = 0.5;

/**
 * Express middleware: verify Google reCAPTCHA v3 token.
 *
 * Mobile clients (X-Client-Type: mobile) skip verification entirely.
 * Web clients must include { recaptchaToken } in the request body.
 *
 * On failure the request is rejected with 403.
 */
export const verifyRecaptcha = async (req, res, next) => {
  // Skip for mobile clients
  if (req.headers['x-client-type'] === 'mobile') {
    return next();
  }

  // If reCAPTCHA secret is not configured, skip (dev convenience)
  if (!RECAPTCHA_SECRET) {
    logger.warn('reCAPTCHA secret not configured — skipping verification');
    return next();
  }

  const token = req.body?.recaptchaToken;
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'reCAPTCHA verification required',
    });
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
      remoteip: req.ip,
    });

    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: params,
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json();

    if (!data.success || (data.score != null && data.score < MIN_SCORE)) {
      logger.warn('reCAPTCHA verification failed', {
        success: data.success,
        score: data.score,
        errorCodes: data['error-codes'],
        ip: req.ip,
      });
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    // Attach score for downstream logging
    req.recaptchaScore = data.score;
    next();
  } catch (err) {
    logger.error('reCAPTCHA verification error', { error: err.message });
    // Fail open in case of network errors to avoid blocking legitimate users
    // In production you may want to fail closed instead
    next();
  }
};
