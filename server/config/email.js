import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Email SMTP transporter (supports ZeptoMail, Zoho, Gmail, and other services)
export const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (emailService === 'zeptomail') {
    // ZeptoMail configuration - Professional transactional email service
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const isSSL = port === 465;
    const host = process.env.SMTP_HOST || 'smtp.zeptomail.com';

    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: isSSL, // true for 465 (SSL), false for 587 (TLS)
      pool: true,
      maxConnections: 50, // High volume support for ZeptoMail Pro
      maxMessages: Infinity, // Unlimited messages per connection
      rateLimit: 100, // ZeptoMail Pro can handle high rates
      auth: {
        user: process.env.EMAIL_USER, // emailapikey
        pass: process.env.EMAIL_PASS  // API key
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else if (emailService === 'zoho') {
    // Zoho configuration with TLS support
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const isSSL = port === 465;
    const host = process.env.SMTP_HOST || 'smtp.zoho.eu';

    return nodemailer.createTransport({
      host: host,
      port: port,
      secure: isSSL,
      pool: true,
      maxConnections: 20,
      maxMessages: Infinity,
      rateLimit: 50,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Gmail configuration (fallback)
    return nodemailer.createTransport({
      service: 'gmail',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      requireTLS: true
    });
  }
};

// Create the transporter instance
export const emailTransporter = createEmailTransporter();

// Verify Email connection
export const verifyEmailConnection = async () => {
  try {
    await emailTransporter.verify();
    const service = process.env.EMAIL_SERVICE || 'gmail';
    console.log(`${service.toUpperCase()} SMTP connection established successfully`);
    return true;
  } catch (error) {
    const service = process.env.EMAIL_SERVICE || 'gmail';
    console.error(`${service.toUpperCase()} SMTP connection failed:`, error.message);


    return false;
  }
};

// Legacy exports for backward compatibility
export const gmailTransporter = emailTransporter;
export const verifyGmailConnection = verifyEmailConnection;

export const sender = {
  email: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || process.env.GMAIL_USER,
  name: process.env.EMAIL_FROM_NAME || "Obidient Movement"
};
