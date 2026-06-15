import crypto from 'crypto';
import { sendOTPEmail } from '../utils/emailHandler.js';
import { sendSms, isSmsEnabled, isTwilioConfigured } from './twilioService.js';
import { logger } from '../middlewares/security.middleware.js';

/**
 * Unified OTP generation + delivery.
 * Delivers via email or SMS (Twilio) depending on available contact info and feature flag.
 */

/**
 * Generate a 6-digit numeric OTP.
 */
export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Send an OTP to the user via email.
 *
 * @param {Object} opts
 * @param {string} opts.name        – User display name
 * @param {string} opts.email       – User email
 * @param {string} opts.otp         – The OTP code
 * @param {string} opts.purpose     – One of: email_verification | password_reset | 2fa_setup | phone_verification
 * @returns {Promise<void>}
 */
export async function deliverOTP({ name, email, otp, purpose }) {
  try {
    await sendOTPEmail(name, email, otp, purpose);
    logger.info('OTP delivered via email', { email, purpose });
  } catch (err) {
    logger.error('OTP email delivery failed', { email, purpose, error: err.message });
    throw err;
  }
}

/**
 * Send an OTP to the user via SMS (Twilio).
 *
 * @param {Object} opts
 * @param {string} opts.phone       – User phone in E.164 format (e.g. +2348012345678)
 * @param {string} opts.otp         – The OTP code
 * @param {string} opts.purpose     – One of: phone_verification | password_reset | 2fa_setup
 * @returns {Promise<void>}
 */
export async function deliverOTPviaSMS({ phone, otp, purpose }) {
  if (!isSmsEnabled()) {
    throw new Error('SMS signup is not enabled. Set SMS_SIGNUP_ENABLED=true in env.');
  }

  if (!isTwilioConfigured()) {
    throw new Error('Twilio is not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM env vars.');
  }

  const purposeLabel = purpose === 'password_reset' ? 'password reset' : 'verification';
  const message = `Your Obidient Movement ${purposeLabel} code is: ${otp}. It expires in 10 minutes.`;

  try {
    await sendSms({ to: phone, message });
    logger.info('OTP delivered via SMS', { phone, purpose });
  } catch (err) {
    logger.error('OTP SMS delivery failed', { phone, purpose, error: err.message });
    throw err;
  }
}

/**
 * Default OTP expiry: 10 minutes from now.
 */
export function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// Re-export for convenience
export { isSmsEnabled } from './twilioService.js';
