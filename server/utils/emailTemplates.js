export function createConfirmationEmailTemplate(name, link) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333333; margin-top: 0;">Hi ${name || ''},</h2>
        <p style="color: #555555; line-height: 1.5;">Thank you for registering on <strong>Obidient Movement</strong>!</p>
        <p style="color: #555555; line-height: 1.5;">Please confirm your email by clicking the button below:</p>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#0B6739" style="border-radius: 4px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; text-decoration: none;">Confirm Email</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #555555; line-height: 1.5;">If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
        <p style="color: #0B6739; line-height: 1.5; word-break: break-all;">${link}</p>
        
        <p style="color: #777777; font-size: 14px; margin-top: 30px;">If you did not register, you can ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #999999; font-size: 12px;">This is an automated message from Obidient Movement. Please do not reply to this email.</p>
        <p style="color: #555555;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createResetPasswordEmailTemplate(name, link) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update Your Account Access</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333333; margin-top: 0;">Hi ${name || ''},</h2>
        <p style="color: #555555; line-height: 1.5;">We received a request to update your Obidient Movement account access.</p>
        <p style="color: #555555; line-height: 1.5;">Click the button below to set a new password:</p>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#0B6739" style="border-radius: 4px;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; font-weight: bold; text-decoration: none;">Update Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #555555; line-height: 1.5;">If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
        <p style="color: #0B6739; line-height: 1.5; word-break: break-all;">${link}</p>
        
        <p style="color: #777777; font-size: 14px; margin-top: 30px;">If you didn't make this request, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #999999; font-size: 12px;">This is an automated message from Obidient Movement.<br>
        This link will expire in 15 minutes for security purposes.</p>
        <p style="color: #555555;">— Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createOTPEmailTemplate(name, otp, purpose) {
  const purposeText = purpose === 'password_reset'
    ? 'reset your password'
    : purpose === '2fa_setup'
      ? 'set up two-factor authentication'
      : 'verify your email';

  const expiryTime = '10 minutes';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333333; margin-top: 0;">Hi ${name || ''},</h2>
        <p style="color: #555555; line-height: 1.5;">You requested to ${purposeText} on <strong>Obidient Movement</strong>.</p>
        <p style="color: #555555; line-height: 1.5;">Please use the verification code below:</p>
        
        <div style="background-color: #f7f7f7; border-radius: 4px; padding: 15px; margin: 25px 0; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333333;">${otp}</span>
        </div>
        
        <p style="color: #555555; line-height: 1.5;">This code will expire in ${expiryTime}.</p>
        
        <p style="color: #777777; font-size: 14px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #999999; font-size: 12px;">This is an automated message from Obidient Movement. Please do not reply to this email.</p>
        <p style="color: #555555;">— Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createVotingBlocBroadcastEmailTemplate(votingBlocName, senderName, message, messageType) {
  const typeLabels = {
    'announcement': 'Announcement',
    'update': 'Update',
    'reminder': 'Reminder'
  };

  const typeLabel = typeLabels[messageType] || 'Message';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New ${typeLabel} from ${votingBlocName}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <div style="background-color: #0B6739; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">New ${typeLabel} from Your Voting Bloc</h2>
        </div>
        
        <h3 style="color: #333333; margin-top: 0;">${votingBlocName}</h3>
        <p style="color: #666666; margin-bottom: 20px;">From: ${senderName}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #0B6739;">
          <p style="color: #333333; line-height: 1.6; margin: 0;">${message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px;">This message was sent to all members of the "${votingBlocName}" voting bloc.</p>
        <p style="color: #999999; font-size: 12px;">This is an automated message from Obidient Movement. Please do not reply to this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createVotingBlocPrivateMessageEmailTemplate(votingBlocName, senderName, recipientName, message) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Private Message from ${votingBlocName}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <div style="background-color: #6366f1; color: white; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Private Message</h2>
        </div>
        
        <p style="color: #333333; margin-top: 0;">Hi ${recipientName},</p>
        <p style="color: #666666;">You have received a private message from <strong>${senderName}</strong> in the "${votingBlocName}" voting bloc:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #6366f1;">
          <p style="color: #333333; line-height: 1.6; margin: 0;">${message}</p>
        </div>
        
        <p style="color: #666666; margin-top: 20px;">Please log in to your Obidient Movement account to view and respond to this message.</p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px;">This is a private message from a voting bloc member.</p>
        <p style="color: #999999; font-size: 12px;">This is an automated message from Obidient Movement. Please do not reply to this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createVotingBlocInvitationEmailTemplate(inviteeName, inviterName, votingBlocName, joinLink, customMessage) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join ${votingBlocName} - Voting Bloc Invitation</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #0B6739; color: white; padding: 10px 20px; border-radius: 25px; font-size: 14px; font-weight: bold;">
            🗳️ VOTING BLOC INVITATION
          </div>
        </div>
        
        <h2 style="color: #333333; margin-top: 0; text-align: center;">Hi ${inviteeName || 'there'},</h2>
        
        <p style="color: #555555; line-height: 1.5; font-size: 16px;">
          <strong>${inviterName}</strong> has invited you to join the voting bloc <strong>"${votingBlocName}"</strong> on Obidient Movement.
        </p>
        
        ${customMessage ? `
          <div style="background-color: #f8f9fa; border-left: 4px solid #0B6739; padding: 15px; margin: 20px 0;">
            <p style="color: #555555; line-height: 1.5; margin: 0; font-style: italic;">
              "${customMessage}"
            </p>
          </div>
        ` : ''}
        
        <p style="color: #555555; line-height: 1.5;">
          Voting blocs are groups of like-minded citizens working together to make a difference in their communities. 
          Join this bloc to organize, mobilize, and amplify your political impact.
        </p>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#0B6739" style="border-radius: 6px; box-shadow: 0 2px 4px rgba(11, 103, 57, 0.3);">
                    <a href="${joinLink}" target="_blank" style="display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                      Join Voting Bloc
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #333333; margin-top: 0;">What you can do in this voting bloc:</h4>
          <ul style="color: #555555; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Connect with fellow citizens in your area</li>
            <li>Coordinate voter registration drives</li>
            <li>Organize community meetings and events</li>
            <li>Stay informed about local candidates and issues</li>
            <li>Make your voice heard in the democratic process</li>
          </ul>
        </div>
        
        <p style="color: #555555; line-height: 1.5;">
          If you're having trouble with the button above, copy and paste this link into your web browser:
        </p>
        <p style="color: #0B6739; line-height: 1.5; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
          ${joinLink}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px;">
          This invitation was sent by ${inviterName} through the Obidient Movement platform. 
          If you don't wish to receive these invitations, you can ignore this email.
        </p>
        
        <p style="color: #999999; font-size: 12px;">
          This is an automated message from Obidient Movement. Please do not reply to this email.
        </p>
        <p style="color: #555555; font-weight: bold;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createVotingBlocRemovalEmailTemplate(memberName, votingBlocName, creatorName, reason) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Removed from Voting Bloc</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333333; margin-top: 0;">Hi ${memberName},</h2>
        
        <p style="color: #555555; line-height: 1.5;">
          We're writing to inform you that you have been removed from the 
          <strong>"${votingBlocName}"</strong> voting bloc by ${creatorName}.
        </p>
        
        ${reason ? `
          <div style="background-color: #fef3f3; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <h4 style="color: #dc2626; margin-top: 0; margin-bottom: 10px;">Reason for removal:</h4>
            <p style="color: #7f1d1d; line-height: 1.5; margin: 0;">
              "${reason}"
            </p>
          </div>
        ` : ''}
        
        <p style="color: #555555; line-height: 1.5;">
          You no longer have access to this voting bloc's resources, discussions, and activities. 
          This action cannot be undone, but you can continue to participate in other voting blocs 
          or create your own.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #333333; margin-top: 0;">Stay engaged with Obidient Movement:</h4>
          <ul style="color: #555555; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Join other voting blocs in your area</li>
            <li>Create your own voting bloc</li>
            <li>Participate in community discussions</li>
            <li>Stay informed about candidates and issues</li>
          </ul>
        </div>
        
        <p style="color: #555555; line-height: 1.5;">
          If you believe this removal was made in error or have questions, 
          you can contact the bloc creator directly or reach out to our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px;">
          This notification was sent automatically when you were removed from the voting bloc.
        </p>
        
        <p style="color: #999999; font-size: 12px;">
          This is an automated message from Obidient Movement. Please do not reply to this email.
        </p>
        <p style="color: #555555; font-weight: bold;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createVoteDefenderKeyAssignedEmailTemplate(userName, uniqueKey, designation, elections, monitoringLocation) {
  const electionsList = elections.map(election =>
    `<li style="margin-bottom: 8px;">
      <strong>${election.election_name}</strong><br>
      <span style="color: #666666; font-size: 14px;">${election.state} • ${new Date(election.election_date).toLocaleDateString()}</span>
    </li>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vote Defender Access Granted</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1e7e34, #28a745); color: white; padding: 15px 25px; border-radius: 25px; font-size: 16px; font-weight: bold;">
            🛡️ ELECTION MONITORING ACCESS GRANTED
          </div>
        </div>
        
        <h2 style="color: #333333; margin-top: 0; text-align: center;">Congratulations, ${userName}!</h2>
        
        <p style="color: #555555; line-height: 1.5; font-size: 16px;">
          You have been approved as a <strong>${designation}</strong> for election monitoring activities with the Obidient Movement.
        </p>
        
        <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); border: 2px solid #28a745; border-radius: 10px; padding: 20px; margin: 25px 0; text-align: center;">
          <h3 style="color: #1e7e34; margin-top: 0; margin-bottom: 15px;">Your Unique Monitor Key</h3>
          <div style="background-color: #ffffff; border: 2px dashed #28a745; border-radius: 8px; padding: 15px; margin: 10px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #1e7e34; font-family: 'Courier New', monospace;">${uniqueKey}</span>
          </div>
          <p style="color: #666666; font-size: 14px; margin: 10px 0 0 0;">Keep this key secure and do not share it with others</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333333; margin-top: 0;">Your Monitoring Assignment</h4>
          <div style="color: #555555; line-height: 1.6;">
            <p style="margin: 5px 0;"><strong>Designation:</strong> ${designation}</p>
            ${monitoringLocation?.state ? `<p style="margin: 5px 0;"><strong>State:</strong> ${monitoringLocation.state}</p>` : ''}
            ${monitoringLocation?.lga ? `<p style="margin: 5px 0;"><strong>LGA:</strong> ${monitoringLocation.lga}</p>` : ''}
            ${monitoringLocation?.ward ? `<p style="margin: 5px 0;"><strong>Ward:</strong> ${monitoringLocation.ward}</p>` : ''}
          </div>
        </div>
        
        ${elections.length > 0 ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #333333; margin-top: 0;">Elections You Can Monitor</h4>
            <ul style="color: #555555; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
              ${electionsList}
            </ul>
          </div>
        ` : ''}
        
        <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin-top: 0;">How to Access the Monitoring System</h4>
          <ol style="color: #555555; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
            <li>Log in to your Obidient Movement account</li>
            <li>Navigate to the Election Monitoring section</li>
            <li>Enter your unique key: <strong>${uniqueKey}</strong></li>
            <li>Start monitoring elections in your assigned area</li>
          </ol>
        </div>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">⚠️ Important Guidelines</h4>
          <ul style="color: #856404; line-height: 1.6; margin: 10px 0; padding-left: 20px; font-size: 14px;">
            <li>Keep your monitor key confidential</li>
            <li>Report any suspicious activities immediately</li>
            <li>Follow all election monitoring protocols</li>
            <li>Maintain impartiality and professionalism</li>
            <li>Document everything accurately and timely</li>
          </ul>
        </div>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 25px 0;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#28a745" style="border-radius: 6px; box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);">
                    <a href="https://member.obidients.com/dashboard" target="_blank" style="display: inline-block; padding: 15px 30px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                      Access Monitoring System
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px;">
          This access was granted by an administrator. If you have any questions about your monitoring role, 
          please contact your coordinator or the administrative team.
        </p>
        
        <p style="color: #555555; line-height: 1.5;">
          Thank you for your commitment to protecting the integrity of our democratic process.
        </p>
        
        <p style="color: #999999; font-size: 12px;">
          This is an automated message from Obidient Movement. Please do not reply to this email.
        </p>
        <p style="color: #555555; font-weight: bold;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createAdminBroadcastEmailTemplate(title, message, senderName, imageUrl) {
  const imageBlock = imageUrl ? `
        <div style="margin: 20px 0; text-align: center;">
          <img src="${imageUrl}" alt="${title}" width="600" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;" />
        </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Message from Obidient Movement</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="padding: 30px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0B6739, #077b32); color: white; padding: 15px 25px; border-radius: 25px; font-size: 16px; font-weight: bold;">
            📢 OFFICIAL ANNOUNCEMENT
          </div>
        </div>
        
        <h2 style="color: #0B6739; margin-top: 0; text-align: center; font-size: 24px; line-height: 1.3;">
          ${title}
        </h2>
        ${imageBlock}
        <div style="background-color: #f8f9fa; border-left: 4px solid #0B6739; padding: 20px; margin: 25px 0; border-radius: 6px;">
          <div style="color: #333333; line-height: 1.6; font-size: 16px;">
            ${message.split('\n').map(paragraph => 
              paragraph.trim() ? `<p style="margin: 0 0 15px 0;">${paragraph.trim()}</p>` : ''
            ).join('')}
          </div>
        </div>
        
        <div style="background-color: #e8f5e8; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
          <h4 style="color: #0B6739; margin-top: 0; margin-bottom: 15px;">Stay Connected</h4>
          <p style="color: #555555; line-height: 1.5; margin: 10px 0;">
            For updates and more information, visit your dashboard or check our official communications.
          </p>
          <table border="0" cellpadding="0" cellspacing="0" style="margin: 15px auto;">
            <tr>
              <td align="center" bgcolor="#0B6739" style="border-radius: 6px; box-shadow: 0 2px 4px rgba(11, 103, 57, 0.3);">
                <a href="https://member.obidients.com/dashboard" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                  View Dashboard
                </a>
              </td>
            </tr>
          </table>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        
        <p style="color: #777777; font-size: 14px; text-align: center;">
          This message was sent by ${senderName || 'Obidient Movement Administration'} to all members of the Obidient Movement platform.
        </p>
        
        <p style="color: #999999; font-size: 12px; text-align: center;">
          This is an automated message from Obidient Movement. Please do not reply to this email.
        </p>
        <p style="color: #0B6739; font-weight: bold; text-align: center;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function createInvolvementInterestEmailTemplate(interest) {
  const roleLabels = {
    volunteer: 'Volunteer',
    vote_protection_officer: 'Vote Protection Officer',
    donor: 'Donor',
  };

  const locationHtml = interest.is_diaspora
    ? `<strong>Country:</strong> ${interest.country || 'Not specified'}`
    : [interest.state, interest.lga, interest.ward].filter(Boolean).join(' → ') || 'Not specified';

  const detailsHtml = [];
  if (interest.skills?.length) {
    detailsHtml.push(`<p style="margin: 4px 0;"><strong>Skills:</strong> ${interest.skills.join(', ')}</p>`);
  }
  if (interest.experience_level) {
    detailsHtml.push(`<p style="margin: 4px 0;"><strong>Experience:</strong> ${interest.experience_level}</p>`);
  }
  if (interest.contribution_type) {
    detailsHtml.push(`<p style="margin: 4px 0;"><strong>Contribution:</strong> ${interest.contribution_type}</p>`);
  }
  if (interest.message) {
    detailsHtml.push(`<p style="margin: 4px 0;"><strong>Message:</strong> ${interest.message}</p>`);
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Get Involved Interest</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <tr>
      <td style="background-color: #0B6739; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">New Get Involved Interest</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="color: #555555; line-height: 1.5; margin-top: 0;">
          A new person has expressed interest in getting involved with the movement.
        </p>

        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 4px 0;"><strong>Name:</strong> ${interest.full_name}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${interest.email}</p>
              <p style="margin: 4px 0;"><strong>Phone:</strong> ${interest.phone}</p>
              <p style="margin: 4px 0;"><strong>Role:</strong> <span style="background-color: #0B6739; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 13px;">${roleLabels[interest.role] || interest.role}</span></p>
              <p style="margin: 4px 0;"><strong>Location:</strong> ${locationHtml}</p>
              ${interest.is_diaspora ? '<p style="margin: 4px 0;"><strong>Diaspora:</strong> Yes</p>' : ''}
              ${detailsHtml.join('')}
            </td>
          </tr>
        </table>

        <p style="color: #555555; line-height: 1.5;">
          Please review and follow up within 48 hours. You can manage all interests from the
          <strong>Interests</strong> section in the Admin Panel.
        </p>

        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;">
        <p style="color: #999999; font-size: 12px;">
          This is an automated message from Obidient Movement. Please do not reply to this email.
        </p>
        <p style="color: #555555;">— The Obidient Movement Team</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Newsletter email template
 * @param {Object} options
 * @param {string} options.title - Newsletter title
 * @param {string} options.content - Rich HTML content
 * @param {string} options.previewText - Email preheader text
 * @param {string} options.featuredImageUrl - Hero image URL
 * @param {string} options.webUrl - "View in browser" link
 * @param {string} options.unsubscribeUrl - Unsubscribe link
 * @param {string} options.recipientName - Recipient's name
 */
export function createNewsletterEmailTemplate({ title, content, previewText, featuredImageUrl, webUrl, unsubscribeUrl, recipientName }) {
  const heroImage = featuredImageUrl
    ? `<tr><td style="padding: 0;"><img src="${featuredImageUrl}" alt="${title}" style="width: 100%; max-width: 600px; height: auto; display: block; border-radius: 8px 8px 0 0;" /></td></tr>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${previewText ? `<!--[if !mso]><!--><span style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${previewText}</span><!--<![endif]-->` : ''}
</head>
<body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="padding: 24px 30px 16px; border-bottom: 2px solid #0B6739;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 14px; color: #0B6739; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Obidient Movement Newsletter</h1>
            </td>
            <td align="right">
              <a href="${webUrl}" style="font-size: 12px; color: #666; text-decoration: underline;">View in browser</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Featured Image -->
    ${heroImage}

    <!-- Title -->
    <tr>
      <td style="padding: 30px 30px 10px;">
        <h2 style="margin: 0; font-size: 24px; color: #1a1a1a; line-height: 1.3; font-weight: 700;">${title}</h2>
      </td>
    </tr>

    <!-- Greeting -->
    <tr>
      <td style="padding: 0 30px 20px;">
        <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.5;">Hi ${recipientName || 'there'},</p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 0 30px 30px; font-size: 15px; line-height: 1.7; color: #333;">
        ${content}
      </td>
    </tr>

    <!-- CTA: Read on web -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" bgcolor="#0B6739" style="border-radius: 6px;">
              <a href="${webUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; color: #ffffff; text-decoration: none; font-weight: 600;">Read Full Newsletter →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
        <p style="margin: 0 0 8px; color: #999; font-size: 12px;">You received this because you're a member of Obidient Movement.</p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe from newsletters</a>
        </p>
        <p style="margin: 10px 0 0; color: #aaa; font-size: 11px;">© ${new Date().getFullYear()} Obidient Movement. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

