import twilio from 'twilio';
import dotenv from 'dotenv';
import { logger } from '../middlewares/security.middleware.js';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM;

if (!accountSid || !authToken || !from) {
  logger.warn('Twilio credentials missing. SMS delivery will be disabled until configured.');
}

let twilioClient = null;

const getClient = () => {
  if (!twilioClient && accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

/**
 * Check if SMS signup is enabled via feature flag.
 */
export const isSmsEnabled = () => {
  return process.env.SMS_SIGNUP_ENABLED === 'true';
};

/**
 * Check if Twilio is properly configured (credentials present).
 */
export const isTwilioConfigured = () => {
  return !!(accountSid && authToken && from);
};

/**
 * Send an SMS message via Twilio.
 *
 * @param {Object} opts
 * @param {string} opts.to      – Recipient phone number (E.164 format, e.g. +2348012345678)
 * @param {string} opts.message – Message body (max 1600 chars)
 * @returns {Promise<Object>}   – Twilio message response
 */
export const sendSms = async ({ to, message }) => {
  const client = getClient();
  if (!client) {
    throw new Error('Twilio client not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM env vars.');
  }

  // Wrap in a timeout to prevent indefinite hangs
  return Promise.race([
    client.messages.create({
      body: message,
      from,
      to,
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Twilio SMS request timed out after 30s')), 30000)
    ),
  ]);
};
