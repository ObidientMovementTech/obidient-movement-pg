// LEGACY FILE - Use config/email.js instead
// This file is kept for backward compatibility

import { emailTransporter, verifyEmailConnection, sender } from './email.js';

// Re-export everything for backward compatibility
export const gmailTransporter = emailTransporter;
export const verifyGmailConnection = verifyEmailConnection;
export { sender };
