import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

/**
 * Generates a secret key for TOTP-based 2FA
 * @returns {Object} - Object containing secret in different formats
 */
export const generateTOTPSecret = (email) => {
  const secretObj = speakeasy.generateSecret({
    name: `Obidient Movement (${email})`,
    issuer: 'Obidient Movement'
  });

  return secretObj;
};

/**
 * Generates a QR code from a TOTP secret
 * @param {string} otpAuthUrl - OTP auth URL from secret
 * @returns {Promise<string>} - Data URL of QR code
 */
export const generateQRCode = async (otpAuthUrl) => {
  try {
    const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);
    return qrCodeUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Verifies a TOTP token against a secret
 * @param {string} token - Token provided by user
 * @param {string} secret - Secret key in base32 format
 * @returns {boolean} - True if token is valid
 */
export const verifyTOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 1 time step before/after current time (30 seconds each)
  });
};
