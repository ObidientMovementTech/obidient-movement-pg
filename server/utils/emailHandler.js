import { emailTransporter, sender, createEmailTransporter } from '../config/email.js';
import {
  createConfirmationEmailTemplate,
  createResetPasswordEmailTemplate,
  createOTPEmailTemplate,
  createVotingBlocBroadcastEmailTemplate,
  createVotingBlocPrivateMessageEmailTemplate,
  createVotingBlocInvitationEmailTemplate,
  createVotingBlocRemovalEmailTemplate,
  createVoteDefenderKeyAssignedEmailTemplate,
  createAdminBroadcastEmailTemplate,
  createInvolvementInterestEmailTemplate
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

  console.log(`[EMAIL] Preparing to send ${type} email to ${email}`);

  try {
    console.log(`[EMAIL] Current environment: ${process.env.NODE_ENV}`);
    console.log(`[EMAIL] Using email service: ${process.env.EMAIL_SERVICE || 'gmail'}`);

    // Email configuration using nodemailer
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject,
      html,
      text: plainText,
    };

    const response = await emailTransporter.sendMail(mailOptions);

    console.log(`[EMAIL] ${type} email sent successfully to ${email}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[EMAIL] Error sending ${type} email to ${email}:`, error.message);
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
  const plainText = `Hi ${name || ''},\n\nYour verification code for Obidient Movement is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can ignore this email.\n\n— Obidient Movement Team`;

  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject,
      html,
      text: plainText,
    };

    const response = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);

    return response;

  } catch (error) {
    console.error(`❌ Error sending OTP email to ${email}:`, error.message);
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

  return await emailTransporter.sendMail({
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
      emailTransporter.sendMail({
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

    const response = await emailTransporter.sendMail(mailOptions);
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

    const response = await emailTransporter.sendMail(mailOptions);
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

    const response = await emailTransporter.sendMail(mailOptions);
    console.log(`[GMAIL][EMAIL] Voting bloc removal email sent successfully to ${memberEmail}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[GMAIL][EMAIL] Error sending voting bloc removal email to ${memberEmail}:`, error.message);
    throw error;
  }
};

// Send Vote Defender Key Assignment Email
export const sendVoteDefenderKeyAssignedEmail = async (userName, userEmail, uniqueKey, designation, elections, monitoringLocation) => {
  const subject = 'Vote Defender Access Granted - Obidient Movement';
  const html = createVoteDefenderKeyAssignedEmailTemplate(userName, uniqueKey, designation, elections, monitoringLocation);

  const plainText = `Hi ${userName},

You have been approved as a ${designation} for election monitoring activities with the Obidient Movement.

Your Unique Monitor Key: ${uniqueKey}

Keep this key secure and do not share it with others.

Your Monitoring Assignment:
- Designation: ${designation}
${monitoringLocation?.state ? `- State: ${monitoringLocation.state}` : ''}
${monitoringLocation?.lga ? `- LGA: ${monitoringLocation.lga}` : ''}
${monitoringLocation?.ward ? `- Ward: ${monitoringLocation.ward}` : ''}

${elections.length > 0 ? `Elections You Can Monitor:
${elections.map(election => `- ${election.election_name} (${election.state}, ${election.election_type})`).join('\n')}` : ''}

How to Access the Monitoring System:
1. Log in to your Obidient Movement account
2. Navigate to the Election Monitoring section
3. Enter your unique key: ${uniqueKey}
4. Start monitoring elections in your assigned area

Thank you for your commitment to protecting the integrity of our democratic process.

— The Obidient Movement Team`;

  console.log(`[EMAIL] Preparing to send vote defender key assignment email to ${userEmail}`);

  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: userEmail,
      subject,
      html,
      text: plainText,
    };

    const response = await emailTransporter.sendMail(mailOptions);
    console.log(`[EMAIL] Vote defender key assignment email sent successfully to ${userEmail}`, response.messageId);
    return response;
  } catch (error) {
    console.error(`[EMAIL] Error sending vote defender key assignment email to ${userEmail}:`, error.message);
    throw error;
  }
};

// Send Admin Broadcast Email
export const sendAdminBroadcastEmail = async (title, message, senderName, recipients) => {
  const subject = `Important Message: ${title} - Obidient Movement`;
  const html = createAdminBroadcastEmailTemplate(title, message, senderName);

  // Create plain text version
  const plainText = `IMPORTANT MESSAGE FROM OBIDIENT MOVEMENT

${title}

${message}

This message was sent by ${senderName || 'Obidient Movement Administration'} to all members of the Obidient Movement platform.

For updates and more information, visit your dashboard at: https://member.obidients.com/dashboard

— The Obidient Movement Team`;

  console.log(`[EMAIL] Preparing to send admin broadcast email to ${recipients.length} recipients`);

  try {
    // Send to multiple recipients in batches to avoid overwhelming the email service
    const batchSize = 50; // Send emails in batches of 50
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`[EMAIL] Sending batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)`);

      // Send emails in this batch
      const emailPromises = batch.map(recipient =>
        emailTransporter.sendMail({
          from: `"${sender.name}" <${sender.email}>`,
          to: recipient.email,
          subject,
          html,
          text: plainText,
        }).catch(error => {
          console.error(`[EMAIL] Failed to send to ${recipient.email}:`, error.message);
          return { error: true, email: recipient.email };
        })
      );

      const results = await Promise.allSettled(emailPromises);
      
      // Count successes and failures for this batch
      const batchSent = results.filter(result => 
        result.status === 'fulfilled' && !result.value?.error
      ).length;
      const batchFailed = results.length - batchSent;

      totalSent += batchSent;
      totalFailed += batchFailed;

      console.log(`[EMAIL] Batch ${batchIndex + 1} completed: ${batchSent} sent, ${batchFailed} failed`);

      // Add small delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`[EMAIL] Admin broadcast email completed: ${totalSent}/${recipients.length} sent successfully, ${totalFailed} failed`);
    
    return { 
      successful: totalSent, 
      failed: totalFailed, 
      total: recipients.length 
    };
  } catch (error) {
    console.error(`[EMAIL] Error sending admin broadcast email:`, error.message);
    throw error;
  }
};

// Send Involvement Interest notification to all admins + relevant Directorate Head
export const sendInvolvementInterestEmail = async (interest) => {
  const roleLabels = {
    volunteer: 'Volunteer',
    vote_protection_officer: 'Vote Protection Officer',
    donor: 'Donor',
  };
  const subject = `New Get Involved Interest — ${roleLabels[interest.role] || interest.role} — ${interest.full_name}`;
  const html = createInvolvementInterestEmailTemplate(interest);
  const plainText = `New Get Involved Interest\n\nName: ${interest.full_name}\nEmail: ${interest.email}\nPhone: ${interest.phone}\nRole: ${roleLabels[interest.role] || interest.role}\nLocation: ${interest.is_diaspora ? interest.country : [interest.state, interest.lga, interest.ward].filter(Boolean).join(' > ')}\n\n— Obidient Movement Team`;

  try {
    const { query: dbQuery } = await import('../config/db.js');
    const adminResult = await dbQuery(`SELECT email, name FROM users WHERE role = 'admin'`);
    const recipients = [...adminResult.rows];

    // Also notify the relevant Directorate Head if a directorate was specified
    if (interest.directorate) {
      const headResult = await dbQuery(
        `SELECT id, email, name FROM users WHERE designation = 'Directorate Head' AND "assignedDirectorate" = $1`,
        [interest.directorate]
      );
      if (headResult.rows.length > 0) {
        const head = headResult.rows[0];
        // Avoid duplicate if head is also admin
        if (!recipients.find(r => r.email === head.email)) {
          recipients.push(head);
        }
        // Create in-app notification for the directorate head
        try {
          await dbQuery(
            `INSERT INTO notifications (id, "userId", type, title, message, "createdAt")
             VALUES (gen_random_uuid(), $1, 'involvement', $2, $3, NOW())`,
            [head.id, 'New Volunteer Interest', `${interest.full_name} wants to join your ${interest.directorate.replace(/_/g, ' ')} directorate.`]
          );
        } catch (notifErr) {
          console.error('[EMAIL] Failed to create directorate head notification:', notifErr.message);
        }
      }
    }

    if (recipients.length === 0) {
      console.log('[EMAIL] No admin users found to notify about involvement interest');
      return;
    }

    const emailPromises = recipients.map(recipient =>
      emailTransporter.sendMail({
        from: `"${sender.name}" <${sender.email}>`,
        to: recipient.email,
        subject,
        html,
        text: plainText,
      }).catch(error => {
        console.error(`[EMAIL] Failed to send involvement interest email to ${recipient.email}:`, error.message);
      })
    );

    await Promise.allSettled(emailPromises);
    console.log(`[EMAIL] Involvement interest notification sent to ${recipients.length} recipient(s)`);
  } catch (error) {
    console.error('[EMAIL] Error sending involvement interest email:', error.message);
  }
};

