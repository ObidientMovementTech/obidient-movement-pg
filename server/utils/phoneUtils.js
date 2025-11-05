/**
 * Phone Number Utilities
 * Handles Nigerian phone number normalization and validation
 */

/**
 * Normalize phone number to +234XXXXXXXXXX format
 * @param {string} phone - Input phone number in any format
 * @returns {string|null} - Normalized phone number or null if invalid
 * 
 * Examples:
 * - "08012345678" → "+2348012345678"
 * - "2348012345678" → "+2348012345678"
 * - "+2348012345678" → "+2348012345678"
 * - "8012345678" → "+2348012345678"
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different formats
  if (digits.startsWith('234')) {
    // Already starts with 234 (e.g., 2348012345678)
    if (digits.length === 13) {
      return `+${digits}`;
    }
  } else if (digits.startsWith('0')) {
    // Starts with 0 (e.g., 08012345678)
    if (digits.length === 11) {
      return `+234${digits.substring(1)}`;
    }
  } else if (digits.length === 10) {
    // Just 10 digits (e.g., 8012345678)
    return `+234${digits}`;
  }

  // Invalid format
  return null;
};

/**
 * Format phone number for display (with spaces)
 * @param {string} phone - Normalized phone number
 * @returns {string} - Formatted phone number
 * 
 * Example: "+2348012345678" → "0801 234 5678"
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';

  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return phone;

  // Convert to local format (remove +234, add 0)
  const local = normalized.replace('+234', '0');

  // Format as: 0801 234 5678
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
};

/**
 * Validate Nigerian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidNigerianPhone = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;

  // Check if it's exactly 14 characters (+234XXXXXXXXXX)
  if (normalized.length !== 14) return false;

  // Check if it starts with +234
  if (!normalized.startsWith('+234')) return false;

  // Extract the operator code (first digit after 234)
  const operatorCode = normalized.charAt(4);

  // Valid Nigerian operator codes: 7, 8, 9
  return ['7', '8', '9'].includes(operatorCode);
};

/**
 * Get phone number without country code
 * @param {string} phone - Normalized phone number
 * @returns {string} - Phone without country code
 * 
 * Example: "+2348012345678" → "08012345678"
 */
export const getLocalPhone = (phone) => {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return '';

  return '0' + normalized.substring(4);
};

/**
 * Compare two phone numbers (ignoring format differences)
 * @param {string} phone1 
 * @param {string} phone2 
 * @returns {boolean} - True if phones are the same
 */
export const phonesMatch = (phone1, phone2) => {
  const norm1 = normalizePhoneNumber(phone1);
  const norm2 = normalizePhoneNumber(phone2);

  if (!norm1 || !norm2) return false;

  return norm1 === norm2;
};

/**
 * Mask phone number for display (privacy)
 * @param {string} phone - Phone number
 * @returns {string} - Masked phone
 * 
 * Example: "+2348012345678" → "0801***5678"
 */
export const maskPhone = (phone) => {
  const local = getLocalPhone(phone);
  if (!local || local.length < 11) return phone;

  return `${local.slice(0, 4)}***${local.slice(-4)}`;
};

