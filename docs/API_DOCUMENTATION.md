# Obidient Movement API - Endpoint Documentation

## PostgreSQL-based API Structure
*Version: 2.0.0*  
*Date: January 15, 2025*

This document outlines the current API structure after migration to PostgreSQL. All request and response formats are designed to maintain frontend compatibility.

---

## Authentication Endpoints (`/auth`)

### POST `/auth/register`
**Purpose**: Register a new user account

**Request Body**:
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phone": "string (required)", 
  "password": "string (required, min 6 chars)"
}
```

**Response (Success - 201)**:
```json
{
  "message": "User registered successfully, confirmation email sent"
}
```

**Response (Email Issue - 201)**:
```json
{
  "message": "User registered successfully, but there was an issue sending the confirmation email. Please use the resend confirmation option.",
  "emailSent": false
}
```

**Cookie Set**: `cu-auth-token` (httpOnly, 3 days expiry)

---

### POST `/auth/login`
**Purpose**: User login

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Logged in successfully",
  "user": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string", 
    "phone": "string",
    "emailVerified": "boolean",
    "twoFactorEnabled": "boolean"
  },
  "token": "string"
}
```

**Response (2FA Required - 200)**:
```json
{
  "message": "2FA verification required",
  "requires2FA": true,
  "tempToken": "string",
  "email": "string"
}
```

**Response (Unverified - 403)**:
```json
{
  "message": "Please confirm your email to log in."
}
```

---

### POST `/auth/verify-2fa`
**Purpose**: Verify 2FA code during login

**Request Body**:
```json
{
  "tempToken": "string (required)",
  "code": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "2FA verification successful",
  "user": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "phone": "string", 
    "emailVerified": "boolean",
    "twoFactorEnabled": "boolean"
  },
  "token": "string"
}
```

---

### GET `/auth/confirm-email/:token`
**Purpose**: Confirm email address via token

**Parameters**: 
- `token`: JWT token from email

**Response**: Redirects to frontend with status

---

### POST `/auth/forgot-password`
**Purpose**: Request password reset

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Reset link sent to email. Please allow up to 5 minutes for delivery.",
  "emailProvider": "gmail|other"
}
```

---

### POST `/auth/reset-password/:token`
**Purpose**: Reset password with token

**Parameters**:
- `token`: Reset token from email

**Request Body**:
```json
{
  "newPassword": "string (required, min 6 chars)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Password reset successful"
}
```

---

### POST `/auth/logout`
**Purpose**: Logout user

**Response (Success - 200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Action**: Clears `cu-auth-token` cookie

---

### GET `/auth/me`
**Purpose**: Get current user info
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "user": {
    "_id": "ObjectId",
    "name": "string",
    "email": "string",
    "phone": "string",
    "emailVerified": "boolean",
    "twoFactorEnabled": "boolean",
    "profileImage": "string (optional)",
    "role": "user|admin",
    "kycStatus": "unsubmitted|draft|pending|approved|rejected",
    "personalInfo": "object",
    "onboardingData": "object",
    "notificationPreferences": "object",
    "notificationSettings": "object",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

---

### GET `/auth/auth-status` 
**Purpose**: Check authentication status
**Auth**: Required (authenticateUser middleware)

**Response (Success - 200)**:
```json
{
  "authenticated": true,
  "emailVerified": "boolean"
}
```

---

### POST `/auth/resend-confirmation`
**Purpose**: Resend email confirmation

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Confirmation email sent successfully"
}
```

---

## User Management Endpoints (`/users`)

### POST `/users/upload-profile-image`
**Purpose**: Upload profile image
**Auth**: Required (protect middleware)

**Request**: Form-data with `file` field

**Response (Success - 200)**:
```json
{
  "url": "string (S3 URL)"
}
```

---

### PATCH `/users/me`
**Purpose**: Update user profile
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "personalInfo": {
    "first_name": "string",
    "middle_name": "string", 
    "last_name": "string",
    "user_name": "string",
    "phone_number": "string",
    "country_code": "string",
    "gender": "string",
    "lga": "string",
    "ward": "string",
    "age_range": "string",
    "state_of_origin": "string",
    "voting_engagement_state": "string",
    "citizenship": "Nigerian Citizen|Diasporan|Foreigner",
    "isVoter": "Yes|No",
    "willVote": "Yes|No"
  }
}
```

**Response (Success - 200)**:
```json
{
  "user": "UserObject"
}
```

---

### POST `/users/change-password-request`
**Purpose**: Request password change with OTP
**Auth**: Required (authenticateUser middleware)

**Request Body**:
```json
{
  "currentPassword": "string (optional - for additional security)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Verification code sent to your email"
}
```

---

### POST `/users/verify-otp`
**Purpose**: Verify OTP for password change
**Auth**: Required (authenticateUser middleware)

**Request Body**:
```json
{
  "otp": "string (required)",
  "purpose": "string (required, e.g., 'password_reset')"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Verification successful",
  "verified": true
}
```

---

### POST `/users/change-password`
**Purpose**: Change password after OTP verification
**Auth**: Required (authenticateUser middleware)

**Request Body**:
```json
{
  "newPassword": "string (required, min 6 chars)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Password changed successfully"
}
```

---

### POST `/users/setup-2fa`
**Purpose**: Setup two-factor authentication
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "message": "2FA setup initiated",
  "qrCode": "string (data URL)"
}
```

---

### POST `/users/verify-2fa`
**Purpose**: Verify and enable 2FA
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "token": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "2FA enabled successfully"
}
```

---

### POST `/users/disable-2fa`
**Purpose**: Disable 2FA
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "token": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "2FA disabled successfully"
}
```

---

### POST `/users/change-email-request`
**Purpose**: Request email change
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "newEmail": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Verification email sent to new email address"
}
```

---

### POST `/users/verify-email-change`
**Purpose**: Verify email change
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "otp": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Email changed successfully",
  "newEmail": "string"
}
```

---

### PATCH `/users/notification-preferences`
**Purpose**: Update notification preferences
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "email": "boolean",
  "push": "boolean", 
  "broadcast": "boolean"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Notification preferences updated successfully"
}
```

---

### POST `/users/delete-account`
**Purpose**: Delete user account
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "confirmDelete": "boolean (required, must be true)"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Account deleted successfully"
}
```

---

### POST `/users/send-email-verification`
**Purpose**: Send email verification (for already logged-in users)
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "message": "Verification email sent successfully"
}
```

---

## Voting Bloc Endpoints (`/voting-blocs`)

### GET `/voting-blocs`
**Purpose**: Get all public voting blocs

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `state`: string (optional)
- `scope`: string (optional)

**Response (Success - 200)**:
```json
{
  "success": true,
  "votingBlocs": [
    {
      "_id": "ObjectId",
      "name": "string",
      "description": "string",
      "goals": ["string array"],
      "targetCandidate": "string",
      "scope": "National|State|LG|Ward",
      "location": {
        "state": "string",
        "lga": "string", 
        "ward": "string"
      },
      "bannerImageUrl": "string",
      "joinCode": "string",
      "creator": "UserObject",
      "memberCount": "number",
      "totalMembers": "number",
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "pages": "number"
  }
}
```

---

### POST `/voting-blocs`
**Purpose**: Create new voting bloc
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (required)",
  "goals": ["string array"],
  "targetCandidate": "string (required)",
  "scope": "National|State|LG|Ward (required)",
  "location": {
    "state": "string (required)",
    "lga": "string (required)",
    "ward": "string (optional)"
  },
  "richDescription": "string (HTML)",
  "toolkits": [
    {
      "label": "string",
      "url": "string", 
      "type": "Toolkit|Policy"
    }
  ]
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Voting bloc created successfully",
  "votingBloc": "VotingBlocObject"
}
```

---

### GET `/voting-blocs/owned`
**Purpose**: Get user's owned voting blocs
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "success": true,
  "votingBlocs": ["VotingBlocObject array"]
}
```

---

### GET `/voting-blocs/joined`
**Purpose**: Get user's joined voting blocs
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "success": true,
  "votingBlocs": ["VotingBlocObject array"]
}
```

---

### GET `/voting-blocs/leaderboard`
**Purpose**: Get voting blocs leaderboard

**Query Parameters**:
- `level`: string (default: 'national', options: 'national'|'state'|'lga'|'ward')
- `state`: string (optional, required for state/lga/ward levels)
- `lga`: string (optional, required for lga/ward levels)
- `ward`: string (optional, required for ward level)

**Response (Success - 200)**:
```json
{
  "success": true,
  "leaderboard": [
    {
      "_id": "ObjectId",
      "name": "string",
      "memberCount": "number",
      "totalMembers": "number"
    }
  ],
  "level": "string"
}
```

---

### POST `/voting-blocs/upload-banner`
**Purpose**: Upload voting bloc banner image
**Auth**: Required (protect middleware)

**Request**: Form-data with `file` field

**Response (Success - 200)**:
```json
{
  "success": true,
  "imageUrl": "string (S3 URL)",
  "message": "Banner image uploaded successfully"
}
```

---

### POST `/voting-blocs/upload-rich-description-image`
**Purpose**: Upload image for rich description
**Auth**: Required (protect middleware)

**Request**: Form-data with `file` field

**Response (Success - 200)**:
```json
{
  "success": true,
  "imageUrl": "string (S3 URL)",
  "message": "Rich description image uploaded successfully"
}
```

---

### POST `/voting-blocs/join`
**Purpose**: Join a voting bloc
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "joinCode": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Successfully joined voting bloc",
  "votingBloc": "VotingBlocObject"
}
```

---

### POST `/voting-blocs/invite`
**Purpose**: Send invitation to join voting bloc
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "votingBlocId": "ObjectId (required)",
  "invitedUserId": "ObjectId (required)",
  "inviteType": "string (required, e.g., 'email'|'whatsapp'|'sms'|'link')"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Invitation sent successfully"
}
```

---

### GET `/voting-blocs/join-code/:joinCode`
**Purpose**: Get voting bloc by join code

**Parameters**:
- `joinCode`: string

**Response (Success - 200)**:
```json
{
  "success": true,
  "votingBloc": "VotingBlocObject"
}
```

---

### GET `/voting-blocs/:id`
**Purpose**: Get voting bloc by ID

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "votingBloc": "VotingBlocObject"
}
```

---

### PUT `/voting-blocs/:id`
**Purpose**: Update voting bloc
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId

**Request Body**: Same as create voting bloc

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Voting bloc updated successfully",
  "votingBloc": "VotingBlocObject"
}
```

---

### DELETE `/voting-blocs/:id`
**Purpose**: Delete voting bloc
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Voting bloc deleted successfully"
}
```

---

### POST `/voting-blocs/:id/leave`
**Purpose**: Leave a voting bloc
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Successfully left voting bloc"
}
```

---

### GET `/voting-blocs/:id/invitations`
**Purpose**: Get voting bloc invitations with status
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "invitations": [
    {
      "_id": "ObjectId",
      "invitedBy": "UserObject",
      "invitedUser": "UserObject", 
      "invitedEmail": "string",
      "status": "pending|accepted|declined",
      "inviteType": "email|whatsapp|sms|link",
      "message": "string",
      "inviteDate": "ISO date string",
      "responseDate": "ISO date string"
    }
  ]
}
```

---

### POST `/voting-blocs/:id/invite-member`
**Purpose**: Send member invitation via email/phone
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Request Body**:
```json
{
  "email": "string (optional)",
  "phone": "string (optional)",
  "inviteType": "string (required, e.g., 'email'|'whatsapp'|'sms')",
  "message": "string (optional)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "invitedUser": {
      "_id": "ObjectId",
      "name": "string",
      "email": "string"
    },
    "invitedEmail": "string (if non-existing user)",
    "inviteType": "string",
    "status": "pending"
  }
}
```

---

### POST `/voting-blocs/:id/resend-invitation`
**Purpose**: Resend invitation
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Request Body**:
```json
{
  "invitationId": "ObjectId (required)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Invitation resent successfully"
}
```

---

### DELETE `/voting-blocs/:id/invitations/clear-history`
**Purpose**: Clear responded invitations from history
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Cleared {number} responded invitations from history",
  "clearedCount": "number"
}
```

---

### POST `/voting-blocs/:id/broadcast`
**Purpose**: Send broadcast message to all members
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId

**Request Body**:
```json
{
  "message": "string (required)",
  "messageType": "string (optional, default: 'announcement')",
  "channels": ["array of strings (optional, default: ['in-app'], options: 'in-app'|'email'|'whatsapp'|'sms')"]
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Broadcast message sent to {number} members",
  "data": {
    "broadcast": "BroadcastObject",
    "recipients": "number",
    "channels": ["array of strings"],
    "notificationsSent": "number",
    "emailsSent": "number"
  }
}
```

---

### DELETE `/voting-blocs/:id/members/:memberId`
**Purpose**: Remove member from voting bloc
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId (voting bloc)
- `memberId`: ObjectId (user)

**Request Body**:
```json
{
  "reason": "string (optional)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

### GET `/voting-blocs/:id/engagement`
**Purpose**: Get member engagement analytics
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "engagement": {
    "totalMembers": "number",
    "recentMembers": "number",
    "pendingInvitations": "number",
    "acceptedInvitations": "number",
    "declinedInvitations": "number",
    "conversionRate": "string (percentage)",
    "growthRate": "number"
  },
  "members": ["array of member objects with details"],
  "invitations": ["array of invitation objects"]
}
```

---

### GET `/voting-blocs/:id/member-metadata`
**Purpose**: Get member metadata with tags
**Auth**: Required (protect middleware - must be creator or member)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "success": true,
  "members": [
    {
      "userId": "ObjectId",
      "user": {
        "_id": "ObjectId",
        "name": "string",
        "email": "string"
      },
      "joinDate": "ISO date string",
      "decisionTag": "Undecided|Not-interested|Committed|Voted",
      "contactTag": "No Response|Messaged recently|Called recently|Not Reachable",
      "engagementLevel": "Low|Medium|High",
      "pvcStatus": "Unregistered|Registered but no PVC|Registered with PVC",
      "notes": "string",
      "location": {
        "state": "string",
        "lga": "string",
        "ward": "string"
      }
    }
  ]
}
```

---

### PUT `/voting-blocs/:id/members/:memberId/tags`
**Purpose**: Update member tags (decision and contact tags)
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId (voting bloc)
- `memberId`: ObjectId (user)

**Request Body**:
```json
{
  "decisionTag": "Undecided|Not-interested|Committed|Voted (optional)",
  "contactTag": "No Response|Messaged recently|Called recently|Not Reachable (optional)",
  "engagementLevel": "Low|Medium|High (optional)",
  "pvcStatus": "Unregistered|Registered but no PVC|Registered with PVC (optional)",
  "notes": "string (optional)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Member tags updated successfully"
}
```

---

### POST `/voting-blocs/:id/members/:memberId/message`
**Purpose**: Send private message to voting bloc member
**Auth**: Required (protect middleware - must be creator)

**Parameters**:
- `id`: ObjectId (voting bloc)
- `memberId`: ObjectId (user)

**Request Body**:
```json
{
  "message": "string (required)"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Private message sent successfully",
  "data": {
    "_id": "ObjectId",
    "from": {
      "_id": "ObjectId",
      "name": "string"
    },
    "to": {
      "_id": "ObjectId",
      "name": "string",
      "email": "string"
    },
    "message": "string",
    "votingBloc": {
      "_id": "ObjectId",
      "name": "string"
    },
    "timestamp": "ISO date string",
    "status": "sent",
    "emailSent": "boolean"
  },
  "notification": "NotificationObject"
}
```

---

## Notification Endpoints (`/notifications`)

### GET `/notifications`
**Purpose**: Get user notifications
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
[
  {
    "_id": "ObjectId",
    "recipient": "ObjectId",
    "type": "broadcast|adminBroadcast|invite|supporterUpdate|system|votingBlocBroadcast|votingBlocMessage",
    "title": "string",
    "message": "string",
    "relatedCause": "ObjectId",
    "relatedVotingBloc": "ObjectId", 
    "read": "boolean",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
]
```

**Note**: Returns a direct array of notifications (no pagination wrapper), transformed via mongoCompat.

---

### PUT `/notifications/:id/read`
**Purpose**: Mark notification as read
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "message": "Marked as read",
  "notification": {
    "_id": "ObjectId",
    "recipient": "ObjectId",
    "type": "string",
    "title": "string",
    "message": "string",
    "read": true,
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

---

### DELETE `/notifications/:id`
**Purpose**: Delete notification
**Auth**: Required (protect middleware)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "message": "Notification deleted"
}
```

---

### PATCH `/notifications/mark-all-read`
**Purpose**: Mark all notifications as read
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "message": "All notifications marked as read",
  "updated": "number"
}
```

---

### GET `/notifications/settings`
**Purpose**: Get notification settings
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "_id": "ObjectId",
  "notificationSettings": {
    "email": {
      "accountUpdates": "boolean",
      "newCauses": "boolean",
      "causeUpdates": "boolean", 
      "surveysPolls": "boolean",
      "leadersUpdates": "boolean"
    },
    "push": {
      "accountUpdates": "boolean",
      "newCauses": "boolean",
      "causeUpdates": "boolean",
      "surveysPolls": "boolean", 
      "leadersUpdates": "boolean"
    },
    "website": {
      "desktopNotifications": "boolean",
      "soundAlerts": "boolean"
    }
  }
}
```

---

### PUT `/notifications/settings`
**Purpose**: Update notification settings
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "email": {
    "accountUpdates": "boolean",
    "newCauses": "boolean",
    "causeUpdates": "boolean", 
    "surveysPolls": "boolean",
    "leadersUpdates": "boolean"
  },
  "push": {
    "accountUpdates": "boolean",
    "newCauses": "boolean",
    "causeUpdates": "boolean",
    "surveysPolls": "boolean", 
    "leadersUpdates": "boolean"
  },
  "website": {
    "desktopNotifications": "boolean",
    "soundAlerts": "boolean"
  }
}
```

**Response (Success - 200)**:
```json
{
  "message": "Notification settings updated successfully",
  "settings": {
    "_id": "ObjectId",
    "notificationSettings": {
      "email": "EmailSettingsObject",
      "push": "PushSettingsObject",
      "website": "WebsiteSettingsObject"
    }
  }
}
```

---

### DELETE `/notifications`
**Purpose**: Delete selected notifications
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "ids": ["ObjectId array (required)"]
}
```

**Response (Success - 200)**:
```json
{
  "message": "Notifications deleted successfully",
  "count": "number"
}
```

---

## Admin Broadcast Endpoints (`/admin-broadcasts`)

### GET `/admin-broadcasts`
**Purpose**: Get admin broadcasts
**Auth**: Required (protect middleware)

**Response (Success - 200)**:
```json
{
  "broadcasts": [
    {
      "_id": "ObjectId",
      "title": "string",
      "message": "string",
      "sentBy": "UserObject",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### POST `/admin-broadcasts`
**Purpose**: Create admin broadcast
**Auth**: Required (admin middleware)

**Request Body**:
```json
{
  "title": "string (required)",
  "message": "string (required)"
}
```

**Response (Success - 201)**:
```json
{
  "message": "Broadcast created successfully",
  "broadcast": "AdminBroadcastObject"
}
```

---

### PUT `/admin-broadcasts/:id`
**Purpose**: Update admin broadcast
**Auth**: Required (admin middleware)

**Parameters**:
- `id`: ObjectId

**Request Body**:
```json
{
  "title": "string",
  "message": "string"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Broadcast updated successfully",
  "broadcast": "AdminBroadcastObject"
}
```

---

### DELETE `/admin-broadcasts/:id`
**Purpose**: Delete admin broadcast
**Auth**: Required (admin middleware)

**Parameters**:
- `id`: ObjectId

**Response (Success - 200)**:
```json
{
  "message": "Broadcast deleted successfully"
}
```

---

## Evaluation Endpoints (`/evaluation`)

### POST `/evaluation`
**Purpose**: Submit candidate evaluation

**Request Body**:
```json
{
  "assessor": {
    "fullName": "string (required)",
    "email": "string (required)",
    "phone": "string (required)",
    "organisation": "string",
    "state": "string (required)",
    "votingExperience": "First-time voter|Con-current voter|Not Interested in voting (required)",
    "designation": "Electoral Commission Official|Political Party Representative|Civil Society Organisation Representative|Academic/Researcher|Independent Evaluator|Citizen|Other (required)",
    "otherDesignation": "string (if designation is Other)"
  },
  "candidate": {
    "candidateName": "string (required)",
    "position": "string (required)",
    "party": "string",
    "state": "string (required)"
  },
  "scores": {
    "capacity": "number (0-100, required)",
    "competence": "number (0-100, required)", 
    "character": "number (0-100, required)"
  }
}
```

**Response (Success - 201)**:
```json
{
  "message": "Evaluation submitted successfully",
  "evaluation": {
    "_id": "ObjectId",
    "assessor": "AssessorObject",
    "candidate": "CandidateObject",
    "scores": "ScoresObject",
    "finalScore": "number",
    "createdAt": "ISO date"
  }
}
```

---

### GET `/evaluation`
**Purpose**: Get evaluations (with optional filters)

**Query Parameters**:
- `candidateName`: string (optional)
- `state`: string (optional)
- `position`: string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response (Success - 200)**:
```json
{
  "evaluations": ["EvaluationObject array"],
  "pagination": {
    "currentPage": "number",
    "totalPages": "number",
    "totalItems": "number"
  },
  "statistics": {
    "averageScore": "number",
    "totalEvaluations": "number",
    "scoreDistribution": {
      "capacity": "number",
      "competence": "number", 
      "character": "number"
    }
  }
}
```

---

## KYC Endpoints (`/kyc`)

### POST `/kyc/submit`
**Purpose**: Submit complete KYC information for review
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "personalInfo": {
    "first_name": "string (required)",
    "middle_name": "string (optional)",
    "last_name": "string (required)",
    "user_name": "string (optional)",
    "phone_number": "string (required)",
    "country_code": "string (optional)",
    "gender": "string (required)",
    "lga": "string (required)",
    "ward": "string (optional)",
    "age_range": "string (required)",
    "state_of_origin": "string (required)",
    "voting_engagement_state": "string (optional)",
    "citizenship": "string (optional)",
    "isVoter": "string (optional)",
    "willVote": "string (optional)"
  },
  "validIDType": "string (required) - ID type (NIN, Driver's License, etc.)",
  "validIDNumber": "string (required) - ID number",
  "validIDBase64": "string (optional) - Base64 encoded ID image",
  "selfieBase64": "string (optional) - Base64 encoded selfie image"
}
```

**Response (Success - 200)**:
```json
{
  "message": "KYC submitted successfully",
  "kycStatus": "pending"
}
```

---

### GET `/kyc/me`
**Purpose**: Get current user's KYC information and status
**Auth**: Required (authenticateUser middleware)

**Response (Success - 200)**:
```json
{
  "kycStatus": "unsubmitted|draft|pending|approved|rejected",
  "personalInfo": {
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "user_name": "string",
    "phone_number": "string",
    "country_code": "string",
    "gender": "string",
    "lga": "string",
    "ward": "string",
    "age_range": "string",
    "state_of_origin": "string",
    "voting_engagement_state": "string",
    "citizenship": "string",
    "isVoter": "string",
    "willVote": "string"
  },
  "validID": {
    "idType": "string",
    "idNumber": "string",
    "idImageUrl": "string (S3 URL)"
  },
  "selfieImageUrl": "string (S3 URL)",
  "kycRejectionReason": "string (if rejected)"
}
```

---

### PATCH `/kyc/edit`
**Purpose**: Edit KYC information (only if not approved)
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "personalInfo": {
    "first_name": "string (optional)",
    "middle_name": "string (optional)",
    "last_name": "string (optional)",
    "user_name": "string (optional)",
    "phone_number": "string (optional)",
    "country_code": "string (optional)",
    "gender": "string (optional)",
    "lga": "string (optional)",
    "ward": "string (optional)",
    "age_range": "string (optional)",
    "state_of_origin": "string (optional)",
    "voting_engagement_state": "string (optional)",
    "citizenship": "string (optional)",
    "isVoter": "string (optional)",
    "willVote": "string (optional)"
  },
  "validIDType": "string (optional)",
  "validIDNumber": "string (optional)",
  "validIDBase64": "string (optional) - Base64 encoded ID image",
  "selfieBase64": "string (optional) - Base64 encoded selfie image"
}
```

**Response (Success - 200)**:
```json
{
  "message": "KYC updated successfully",
  "kycStatus": "pending"
}
```

**Response (Error - 400)**:
```json
{
  "message": "KYC already approved. Cannot edit."
}
```

---

### PATCH `/kyc/save-step/personal-info`
**Purpose**: Save personal information step separately (allows partial completion)
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "personalInfo": {
    "first_name": "string (optional)",
    "middle_name": "string (optional)",
    "last_name": "string (optional)",
    "user_name": "string (optional)",
    "phone_number": "string (optional)",
    "country_code": "string (optional)",
    "gender": "string (optional)",
    "lga": "string (optional)",
    "ward": "string (optional)",
    "age_range": "string (optional)",
    "state_of_origin": "string (optional)",
    "voting_engagement_state": "string (optional)",
    "citizenship": "string (optional)",
    "isVoter": "string (optional)",
    "willVote": "string (optional)"
  }
}
```

**Response (Success - 200)**:
```json
{
  "message": "Personal information saved successfully",
  "personalInfo": {
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "user_name": "string",
    "phone_number": "string",
    "country_code": "string",
    "gender": "string",
    "lga": "string",
    "ward": "string",
    "age_range": "string",
    "state_of_origin": "string",
    "voting_engagement_state": "string",
    "citizenship": "string",
    "isVoter": "string",
    "willVote": "string"
  }
}
```

---

### PATCH `/kyc/save-step/valid-id`
**Purpose**: Save valid ID information step separately
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "validIDType": "string (required) - ID type",
  "validIDNumber": "string (required) - ID number",
  "validIDBase64": "string (optional) - Base64 encoded ID image"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Valid ID information saved successfully",
  "validID": {
    "idType": "string",
    "idNumber": "string",
    "idImageUrl": "string (S3 URL)"
  }
}
```

---

### PATCH `/kyc/save-step/selfie`
**Purpose**: Save selfie image step separately
**Auth**: Required (protect middleware)

**Request Body**:
```json
{
  "selfieBase64": "string (required) - Base64 encoded selfie image"
}
```

**Response (Success - 200)**:
```json
{
  "message": "Selfie saved successfully",
  "selfieImageUrl": "string (S3 URL)"
}
```

---

### GET `/kyc/all` (Admin Only)
**Purpose**: Get all KYC submissions for admin review
**Auth**: Required (protect + isAdmin middleware)

**Response (Success - 200)**:
```json
[
  {
    "_id": "string (user ID)",
    "name": "string",
    "email": "string",
    "phone": "string",
    "kycStatus": "unsubmitted|draft|pending|approved|rejected",
    "kycRejectionReason": "string",
    "createdAt": "ISO date string",
    "personalInfo": {
      "firstName": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "gender": "string",
      "lga": "string",
      "ward": "string",
      "ageRange": "string",
      "stateOfOrigin": "string",
      "votingEngagementState": "string",
      "citizenship": "string",
      "isVoter": "string",
      "willVote": "string"
    },
    "validID": {
      "idType": "string",
      "idNumber": "string",
      "idImageUrl": "string (S3 URL)"
    },
    "selfieImageUrl": "string (S3 URL)"
  }
]
```

---

### PATCH `/kyc/:userId/approve` (Admin Only)
**Purpose**: Approve a user's KYC submission
**Auth**: Required (protect + isAdmin middleware)

**URL Parameters**:
- `userId`: string (required) - ID of user whose KYC to approve

**Response (Success - 200)**:
```json
{
  "message": "KYC approved successfully"
}
```

---

### PATCH `/kyc/:userId/reject` (Admin Only)
**Purpose**: Reject a user's KYC submission with reason
**Auth**: Required (protect + isAdmin middleware)

**URL Parameters**:
- `userId`: string (required) - ID of user whose KYC to reject

**Request Body**:
```json
{
  "reason": "string (required) - Reason for rejection"
}
```

**Response (Success - 200)**:
```json
{
  "message": "KYC rejected with reason provided"
}
```

**Response (Error - 400)**:
```json
{
  "message": "Rejection reason is required"
}
```

---

## Data Models Overview

### User Model Structure
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  passwordHash: String,
  profileImage: String,
  emailVerified: Boolean (default: false),
  role: String (user|admin, default: user),
  kycStatus: String (unsubmitted|draft|pending|approved|rejected),
  twoFactorEnabled: Boolean (default: false),
  twoFactorSecret: String,
  twoFactorQRCode: String,
  otp: String,
  otpExpiry: Date,
  otpPurpose: String,
  pendingEmail: String,
  kycRejectionReason: String,
  personalInfo: {
    first_name: String,
    middle_name: String,
    last_name: String,
    user_name: String,
    phone_number: String,
    country_code: String,
    gender: String,
    lga: String,
    ward: String,
    age_range: String,
    state_of_origin: String,
    voting_engagement_state: String,
    citizenship: String (enum),
    isVoter: String (enum),
    willVote: String (enum)
  },
  onboardingData: {
    securityValidation: {
      profile_picture_url: String
    },
    demographics: {
      ethnicity: String,
      religion: String,
      occupation: String,
      level_of_education: String,
      marital_status: String
    },
    engagementAndMobilization: {
      is_volunteering: String,
      past_election_participation: String
    },
    votingBehavior: {
      likely_to_vote: String,
      is_registered: String,
      registration_date: String
    }
  },
  selfieImageUrl: String,
  validID: {
    idType: String (enum),
    idNumber: String,
    idImageUrl: String
  },
  joinedCauses: [ObjectId],
  ownedCauses: [ObjectId],
  hasTakenCauseSurvey: Boolean,
  country_of_residence: String,
  notificationPreferences: {
    email: Boolean,
    push: Boolean,
    broadcast: Boolean
  },
  notificationSettings: {
    email: {
      accountUpdates: Boolean,
      newCauses: Boolean,
      causeUpdates: Boolean,
      surveysPolls: Boolean,
      leadersUpdates: Boolean
    },
    push: {
      accountUpdates: Boolean,
      newCauses: Boolean,
      causeUpdates: Boolean,
      surveysPolls: Boolean,
      leadersUpdates: Boolean
    },
    website: {
      desktopNotifications: Boolean,
      soundAlerts: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### VotingBloc Model Structure
```javascript
{
  _id: ObjectId, // Transformed from PostgreSQL 'id'
  name: String,
  description: String,
  goals: [String], // Always an array, never null
  targetCandidate: String,
  scope: String (enum: National|State|LG|Ward),
  location: {
    state: String,
    lga: String,
    ward: String
  }, // Transformed from flat locationState/locationLga/locationWard fields
  bannerImageUrl: String,
  richDescription: String (HTML),
  joinCode: String (unique),
  creator: ObjectId | {
    _id: ObjectId,
    name: String,
    email: String,
    personalInfo: Object
  }, // Can be ID or populated object
  toolkits: [{
    label: String,
    url: String,
    type: String (enum: Toolkit|Policy)
  }], // Always an array, never null
  members: [ObjectId] | [{
    _id: ObjectId,
    name: String,
    email: String,
    joinDate: Date
  }], // Can be IDs or populated objects
  memberDetails: [{ // When includeDetails=true
    userId: ObjectId,
    name: String,
    email: String,
    joinDate: Date
  }],
  memberMetadata: [{
    userId: ObjectId,
    joinDate: Date,
    decisionTag: String (enum: Undecided|Not-interested|Committed|Voted),
    contactTag: String (enum: No Response|Messaged recently|Called recently|Not Reachable),
    engagementLevel: String (enum: Low|Medium|High),
    pvcStatus: String (enum: Unregistered|Registered but no PVC|Registered with PVC),
    notes: String,
    location: {
      state: String,
      lga: String,
      ward: String
    }
  }],
  invitations: [{
    invitedBy: ObjectId,
    invitedUser: ObjectId,
    invitedEmail: String,
    status: String (enum: pending|accepted|declined),
    inviteType: String (enum: email|whatsapp|sms|link),
    message: String,
    inviteDate: Date,
    responseDate: Date
  }],
  memberCount: Number, // Count of members
  totalMembers: Number, // Same as memberCount (for compatibility)
  metrics: {
    totalMembers: Number,
    weeklyGrowth: Number,
    monthlyGrowth: Number,
    engagementScore: Number,
    lastUpdated: String (ISO date)
  }, // Always included for frontend compatibility
  status: String (enum: active|inactive|suspended),
  createdAt: String (ISO date), // Transformed from Date to ISO string
  updatedAt: String (ISO date)  // Transformed from Date to ISO string
}
```

### Notification Model Structure
```javascript
{
  _id: ObjectId, // Transformed from PostgreSQL 'id'
  recipient: ObjectId (ref: User),
  type: String (enum: broadcast|adminBroadcast|invite|supporterUpdate|system|votingBlocBroadcast|votingBlocMessage),
  title: String,
  message: String,
  relatedCause: ObjectId (ref: Cause),
  relatedVotingBloc: ObjectId (ref: VotingBloc),
  read: Boolean (default: false),
  createdAt: String (ISO date string), // Transformed from Date to ISO string
  updatedAt: String (ISO date string)  // Transformed from Date to ISO string
}
```

### Evaluation Model Structure
```javascript
{
  _id: ObjectId,
  assessor: {
    fullName: String,
    email: String,
    phone: String,
    organisation: String,
    state: String,
    votingExperience: String (enum),
    designation: String (enum),
    otherDesignation: String
  },
  candidate: {
    candidateName: String,
    position: String,
    party: String,
    state: String
  },
  scores: {
    capacity: Number (0-100),
    competence: Number (0-100),
    character: Number (0-100)
  },
  finalScore: Number (0-100),
  createdAt: Date
}
```

### AdminBroadcast Model Structure
```javascript
{
  _id: ObjectId,
  title: String,
  message: String,
  sentBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication & Middleware

### Cookie Management
- **Cookie Name**: `cu-auth-token`
- **Type**: httpOnly
- **Expiry**: 3 days
- **SameSite**: `none` (production) / `lax` (development)
- **Secure**: `true` (production) / `false` (development)

### Middleware Types
1. **protect**: Requires valid authentication + email verification
2. **authenticateUser**: Requires valid authentication (email verification not required)
3. **admin**: Requires admin role + authentication

### Error Response Format
All endpoints follow consistent error response format:
```json
{
  "message": "Error description",
  "error": "Optional additional error details"
}
```

---

## Notes for PostgreSQL Migration

1. **ObjectId Migration**: MongoDB ObjectIds should become UUIDs or auto-incrementing integers in PostgreSQL
2. **Embedded Documents**: MongoDB subdocuments (personalInfo, onboardingData) should become separate tables with foreign keys
3. **Arrays**: MongoDB arrays should become separate junction tables
4. **Date Handling**: Ensure proper timezone handling during migration
5. **Indexing**: Recreate MongoDB indexes as PostgreSQL indexes
6. **Validation**: Move MongoDB schema validation to application level or PostgreSQL constraints
7. **References**: MongoDB refs become foreign key relationships

This documentation serves as the reference for maintaining API compatibility during the PostgreSQL migration process.
