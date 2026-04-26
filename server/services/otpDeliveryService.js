import crypto from 'crypto';
import { sendOTPEmail } from '../utils/emailHandler.js';
import { logger } from '../middlewares/security.middleware.js';

/**
 * Unified OTP generation + delivery.
 * Currently delivers via email. SMS delivery can be added when
 * Africa's Talking sender ID is approved.
 */

/**
 * Generate a 6-digit numeric OTP.
 */
export function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Send an OTP to the user via email (and SMS when available).
 *
 * @param {Object} opts
 * @param {string} opts.name        – User display name
 * @param {string} opts.email       – User email
 * @param {string} [opts.phone]     – User phone (for future SMS delivery)
 * @param {string} opts.otp         – The OTP code
 * @param {string} opts.purpose     – One of: email_verification | password_reset | 2fa_setup
 * @returns {Promise<void>}
 */
export async function deliverOTP({ name, email, phone, otp, purpose }) {
  // Email delivery (always available)
  try {
    await sendOTPEmail(name, email, otp, purpose);
    logger.info('OTP delivered via email', { email, purpose });
  } catch (err) {
    logger.error('OTP email delivery failed', { email, purpose, error: err.message });
    throw err;
  }

  // SMS delivery — uncomment when sender ID is approved
  // if (phone) {
  //   try {
  //     const { sendSmsMessage } = await import('./africasTalkingService.js');
  //     const purposeLabel = purpose === 'password_reset' ? 'password reset' : 'verification';
  //     await sendSmsMessage({
  //       to: phone,
  //       message: `Your Obidient Movement ${purposeLabel} code is: ${otp}. It expires in 10 minutes.`,
  //     });
  //     logger.info('OTP delivered via SMS', { phone, purpose });
  //   } catch (smsErr) {
  //     logger.warn('OTP SMS delivery failed (non-fatal)', { phone, purpose, error: smsErr.message });
  //   }
  // }
}

/**
 * Default OTP expiry: 10 minutes from now.
 */
export function otpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
