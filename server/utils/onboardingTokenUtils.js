/**
 * Onboarding Token Utilities
 * Manages generation and validation of onboarding links
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Valid designations for onboarding
 */
export const VALID_DESIGNATIONS = [
  'Polling Unit Agent',
  'Ward Coordinator',
  'LGA Coordinator',
  'State Coordinator'
];

/**
 * Generate onboarding token (JWT)
 * @param {Object} payload 
 * @param {string} payload.designation - User designation
 * @param {string} payload.tokenId - Database token ID
 * @param {number} payload.expiresIn - Expiry in days (default: 90)
 * @returns {string} - JWT token
 */
export const generateOnboardingToken = ({ designation, tokenId, expiresIn = 90 }) => {
  if (!VALID_DESIGNATIONS.includes(designation)) {
    throw new Error(`Invalid designation: ${designation}`);
  }

  const payload = {
    purpose: 'onboarding',
    designation,
    tokenId,
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: `${expiresIn}d`
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode onboarding token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export const verifyOnboardingToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if it's an onboarding token
    if (decoded.purpose !== 'onboarding') {
      return null;
    }

    // Check if designation is valid
    if (!VALID_DESIGNATIONS.includes(decoded.designation)) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

/**
 * Generate onboarding URL
 * @param {string} token - JWT token
 * @returns {string} - Full onboarding URL
 */
export const generateOnboardingUrl = (token) => {
  const baseUrl = FRONTEND_URL.replace(/\/$/, '');
  return `${baseUrl}/onboarding?token=${encodeURIComponent(token)}`;
};

/**
 * Generate short token for database storage (optional)
 * @returns {string} - Random short token
 */
export const generateShortToken = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate human-friendly short code (6 characters)
 * Avoids confusing characters: 0, O, 1, I, l
 * @returns {string} - Short code like "ABC2X9"
 */
export const generateShortCode = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // No 0, O, 1, I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate short onboarding URL using code
 * @param {string} shortCode - Short code
 * @returns {string} - Short onboarding URL
 */
export const generateShortOnboardingUrl = (shortCode) => {
  return `${FRONTEND_URL}/join/${shortCode}`;
};

/**
 * Get designation display name
 * @param {string} designation 
 * @returns {string}
 */
export const getDesignationDisplay = (designation) => {
  const displays = {
    'Polling Unit Agent': 'Polling Unit Agent',
    'Ward Coordinator': 'Ward Coordinator',
    'LGA Coordinator': 'LGA Coordinator',
    'State Coordinator': 'State Coordinator'
  };

  return displays[designation] || designation;
};

/**
 * Get designation description
 * @param {string} designation 
 * @returns {string}
 */
export const getDesignationDescription = (designation) => {
  const descriptions = {
    'Polling Unit Agent': 'Responsible for monitoring activities at a specific polling unit on election day',
    'Ward Coordinator': 'Oversees all polling units within an assigned ward',
    'LGA Coordinator': 'Coordinates activities across all wards in an LGA',
    'State Coordinator': 'Manages state-wide election monitoring and coordination'
  };

  return descriptions[designation] || '';
};

