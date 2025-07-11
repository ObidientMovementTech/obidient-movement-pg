import { gmailTransporter, sender } from '../config/gmail.js';
import {
  createConfirmationEmailTemplate,
  createResetPasswordEmailTemplate,
  createOTPEmailTemplate,
  createVotingBlocBroadcastEmailTemplate,
  createVotingBlocPrivateMessageEmailTemplate,
  createVotingBlocInvitationEmailTemplate,
  createVotingBlocRemovalEmailTemplate
} from './emailTemplates.js';

// Send Confirmation Email
export const sendConfirmationEmail = async (name, email, link, type) => {
  // Adjust email subject lines to be more delivery-friendly
  const subject = type === "reset"
    ? "Your requested password update link for Obidient Movement"
    : "Confirm Your Email Address";

  const html =
    type === "reset"
      ? createResetPasswordEmailTemplate(name, link)
      : createConfirmationEmailTemplate(name, link);

  // Create a plain text version with clean formatting
  const plainText = type === "reset"
    ? `Hi ${name || ''},\n\nYou requested to update your Obidient Movement account password.\n\nPlease visit this link to set a new password: ${link}\n\nIf you didn't request this, you can ignore this email.\n\n— Obidient Movement Team`
    : `Hi ${name || ''},\n\nThank you for registering on Obidient Movement!\n\nPlease confirm your email by visiting this link: ${link}\n\nIf you did not register, you can ignore this email.\n\n— The Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send ${type} email to ${email}`);

  try {
    console.log(`[GMAIL][EMAIL] Current environment: ${process.env.NODE_ENV}`);

    // Gmail configuration using nodemailer
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject,
      html,
      text: plainText,
    };

    const response = await gmailTransporter.sendMail(mailOptions);

    console.log(`[GMAIL][EMAIL] ${type} email sent successfully to ${email}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending ${type} email to ${email}:`, error.message);
    throw error;
  }
};

// Send OTP Email for verification
export const sendOTPEmail = async (name, email, otp, purpose) => {
  const purposeText = purpose === 'password_reset'
    ? 'Password Reset'
    : purpose === '2fa_setup'
      ? '2FA Setup'
      : 'Email Verification';

  const subject = `Your ${purposeText} Code for Obidient Movement`;

  const html = createOTPEmailTemplate(name, otp, purpose);

  // Create a plain text version
  const plainText = `Hi ${name || ''},\n\nYour verification code for Obidient Movement is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can ignore this email.\n\n— Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send OTP email to ${email} for ${purpose}`);

  try {
    console.log(`[GMAIL][EMAIL] Current environment: ${process.env.NODE_ENV}`);

    // Gmail configuration using nodemailer
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject,
      html,
      text: plainText,
    };

    const response = await gmailTransporter.sendMail(mailOptions);

    console.log(`[GMAIL][EMAIL] OTP email sent successfully to ${email}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending OTP email to ${email}:`, error.message);
    throw error;
  }
};

export const sendSupporterInvite = async (name, email, causeName, joinLink) => {
  // Create a properly formatted HTML email with tables
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Join Cause Invitation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0;">
            <h2>Hello ${name || ''},</h2>
            <p>You've been invited to join the <strong>${causeName}</strong> cause on Obidient Movement.</p>
            <p>Click below to accept the invitation:</p>
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding: 10px 0;">
                  <a href="${joinLink}" 
                     style="padding: 10px 20px; 
                     background: #006837; 
                     color: white; 
                     text-decoration: none; 
                     border-radius: 5px; 
                     display: inline-block;">
                     Join Cause
                  </a>
                </td>
              </tr>
            </table>
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; font-size: 14px;"><a href="${joinLink}" style="color: #006837;">${joinLink}</a></p>
            <p>Thank you!</p>
            <p>— Obidient Movement Team</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Plain text version
  const plainText = `Hello ${name || ''},

You've been invited to join the ${causeName} cause on Obidient Movement.

To accept the invitation, please visit this link: ${joinLink}

Thank you!

— Obidient Movement Team`;

  const recipient = [{ email }];

  return await gmailTransporter.sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to: email,
    subject: `You're invited to join ${causeName}`,
    html,
    text: plainText,
  });
};

// Send voting bloc broadcast email
export const sendVotingBlocBroadcastEmail = async (votingBlocName, senderName, message, messageType, recipients) => {
  const subject = `New ${messageType} from ${votingBlocName} - Obidient Movement`;

  const html = createVotingBlocBroadcastEmailTemplate(votingBlocName, senderName, message, messageType);

  const plainText = `New ${messageType} from ${votingBlocName}\n\nFrom: ${senderName}\n\n${message}\n\nThis message was sent to all members of the "${votingBlocName}" voting bloc.\n\n— Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send voting bloc broadcast email to ${recipients.length} recipients`);

  try {
    // Send to multiple recipients
    const emailPromises = recipients.map(recipient =>
      gmailTransporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.email,
        subject,
        html,
        text: plainText,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(result => result.status === 'fulfilled').length;

    console.log(`[GMAIL][EMAIL] Voting bloc broadcast email sent successfully to ${successful}/${recipients.length} recipients`);
    return { successful, total: recipients.length };
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending voting bloc broadcast email:`, error.message);
    throw error;
  }
};

// Send voting bloc private message email
export const sendVotingBlocPrivateMessageEmail = async (votingBlocName, senderName, recipientName, recipientEmail, message) => {
  const subject = `Private message from ${votingBlocName} - Obidient Movement`;

  const html = createVotingBlocPrivateMessageEmailTemplate(votingBlocName, senderName, recipientName, message);

  const plainText = `Hi ${recipientName},\n\nYou have received a private message from ${senderName} in the "${votingBlocName}" voting bloc:\n\n${message}\n\nPlease log in to your Obidient Movement account to view and respond to this message.\n\n— Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send voting bloc private message email to ${recipientEmail}`);

  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: recipientEmail,
      subject,
      html,
      text: plainText,
    };

    const response = await gmailTransporter.sendMail(mailOptions);
    console.log(`[GMAIL][EMAIL] Voting bloc private message email sent successfully to ${recipientEmail}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending voting bloc private message email to ${recipientEmail}:`, error.message);
    throw error;
  }
};

// Send Voting Bloc Invitation Email
export const sendVotingBlocInvitationEmail = async (inviteeName, inviteeEmail, inviterName, votingBlocName, joinLink, customMessage) => {
  const subject = `You're invited to join "${votingBlocName}" voting bloc`;

  const html = createVotingBlocInvitationEmailTemplate(inviteeName, inviterName, votingBlocName, joinLink, customMessage);

  const plainText = `Hi ${inviteeName || ''},

${inviterName} has invited you to join the voting bloc "${votingBlocName}" on Obidient Movement.

${customMessage ? `Personal message: "${customMessage}"` : ''}

Voting blocs are groups of like-minded citizens working together to make a difference in their communities. Join this bloc to organize, mobilize, and amplify your political impact.

Join the voting bloc by visiting this link: ${joinLink}

What you can do in this voting bloc:
• Connect with fellow citizens in your area
• Coordinate voter registration drives
• Organize community meetings and events
• Stay informed about local candidates and issues
• Make your voice heard in the democratic process

This invitation was sent by ${inviterName} through the Obidient Movement platform.

— The Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send voting bloc invitation email to ${inviteeEmail}`);

  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: inviteeEmail,
      subject,
      html,
      text: plainText,
    };

    const response = await gmailTransporter.sendMail(mailOptions);
    console.log(`[GMAIL][EMAIL] Voting bloc invitation email sent successfully to ${inviteeEmail}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending voting bloc invitation email to ${inviteeEmail}:`, error.message);
    throw error;
  }
};

// Send Voting Bloc Removal Email
export const sendVotingBlocRemovalEmail = async (memberName, memberEmail, votingBlocName, creatorName, reason) => {
  const subject = `Removed from "${votingBlocName}" Voting Bloc`;
  const html = createVotingBlocRemovalEmailTemplate(memberName, votingBlocName, creatorName, reason);

  // Create plain text version
  const plainText = `Hi ${memberName},\n\nYou have been removed from the "${votingBlocName}" voting bloc by ${creatorName}.${reason ? `\n\nReason: ${reason}` : ''}\n\nYou no longer have access to this voting bloc's resources and activities. You can still participate in other voting blocs or create your own.\n\n— The Obidient Movement Team`;

  console.log(`[GMAIL][EMAIL] Preparing to send voting bloc removal email to ${memberEmail}`);

  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: memberEmail,
      subject,
      html,
      text: plainText,
    };

    const response = await gmailTransporter.sendMail(mailOptions);
    console.log(`[GMAIL][EMAIL] Voting bloc removal email sent successfully to ${memberEmail}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending voting bloc removal email to ${memberEmail}:`, error.message);
    throw error;
  }
};

