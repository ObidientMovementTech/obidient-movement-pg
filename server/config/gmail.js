import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Gmail SMTP transporter with proper TLS configuration
export const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  requireTLS: true
});

// Verify Gmail connection
export const verifyGmailConnection = async () => {
  try {
    await gmailTransporter.verify();
    console.log('Gmail SMTP connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error.message);
    return false;
  }
};

export const sender = {
  email: process.env.GMAIL_USER,
  name: process.env.EMAIL_FROM_NAME || "Obidient Movement"
};
