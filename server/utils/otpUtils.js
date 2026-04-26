// OTP Utilities for password reset and email verification
import crypto from 'crypto';

/**
 * Generates a cryptographically secure OTP of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export const generateOTP = (length = 6) => {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, '0');
};

/**
 * Creates an OTP expiry date
 * @param {number} minutes - Minutes until OTP expires (default: 10)
 * @returns {Date} - OTP expiry date
 */
export const createOTPExpiry = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Checks if an OTP is valid and not expired
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} otpExpiry - OTP expiry date
 * @returns {boolean} - True if OTP is valid and not expired
 */
export const isOTPValid = (providedOTP, storedOTP, otpExpiry) => {
  if (!providedOTP || !storedOTP || !otpExpiry) {
    return false;
  }

  // Check if OTP is expired
  if (new Date() > new Date(otpExpiry)) {
    return false;
  }

  // Timing-safe comparison to prevent timing attacks
  const a = Buffer.from(String(providedOTP));
  const b = Buffer.from(String(storedOTP));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};
