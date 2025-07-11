// OTP Utilities for password reset and email verification

/**
 * Generates a random OTP of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';

  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
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

  // Check if OTP matches
  return providedOTP === storedOTP;
};
