# Mass Onboarding System - Documentation

## Overview

The Mass Onboarding System is designed to handle the registration of 100,000+ election monitoring agents across Nigeria quickly and efficiently, with a special focus on elderly users who may not be tech-savvy.

## Key Features

✅ **Google OAuth Integration** - No email verification required, instant access
✅ **Phone Number Reconciliation** - Automatic account detection and updates
✅ **Multi-step Onboarding Flow** - 7 simple steps with clear progress tracking
✅ **Support Group Tracking** - Manage agents from 8+ support organizations
✅ **Location Selection** - Integrated with INEC's State/LGA/Ward/Polling Unit data
✅ **Admin Dashboard** - Real-time tracking of onboarding progress
✅ **Role-based Onboarding Links** - Separate tokens for PU Agents, Ward/LGA/State Coordinators

## Architecture

### Backend (Node.js + Express + PostgreSQL)

```
server/
├── config/
│   ├── passport.js              # Google OAuth strategy configuration
│   └── supportGroups.js         # Support group definitions
├── controllers/
│   └── onboarding.controller.js # All onboarding logic
├── routes/
│   └── onboarding.routes.js     # API endpoints
├── utils/
│   ├── phoneUtils.js            # Phone normalization utilities
│   └── onboardingTokenUtils.js  # JWT token generation
└── migrations/
    └── 20250103_onboarding_system.sql  # Database schema
```

### Frontend (React + TypeScript + Tailwind)

```
frontend/src/pages/auth/
├── OnboardingPage.tsx           # Main onboarding container
└── steps/
    ├── PhoneStep.tsx            # Step 1: Phone verification
    ├── GoogleAuthStep.tsx       # Step 2: Google Sign-In
    ├── LocationStep.tsx         # Step 3: Select location
    ├── ProfileStep.tsx          # Step 4: Name & photo
    ├── BankDetailsStep.tsx      # Step 5: Bank account (optional)
    ├── SupportGroupStep.tsx     # Step 6: Organization selection
    └── CompletionStep.tsx       # Step 7: Finalization
```

## Setup Instructions

### 1. Backend Setup

#### Environment Variables

Copy `.env.template` to `.env` and configure:

```bash
# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/onboarding/google/callback

# JWT Secrets (REQUIRED)
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Frontend URL (REQUIRED)
FRONTEND_URL=http://localhost:5173

# Database (ALREADY CONFIGURED)
DB_HOST=109.176.207.91
DB_PORT=5432
DB_NAME=dev21
```

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/auth/onboarding/google/callback`
   - Production: `https://your-api-domain.com/auth/onboarding/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

#### Install Dependencies

```bash
cd server
npm install
```

#### Database Migration

```bash
# Migration already run ✅
# Schema includes:
# - users table updates (google_id, oauth_provider, support_group)
# - onboarding_tokens table
# - normalize_phone_number() function
# - Indexes for performance
# - Views for statistics
```

### 2. Frontend Setup

#### Environment Variables

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

#### Install Dependencies

```bash
cd frontend
npm install
```

## Usage

### Creating Onboarding Links (Admin)

#### Via API

```javascript
POST /auth/onboarding/tokens/create
Authorization: Bearer <admin_token>

Body:
{
  "designation": "Polling Unit Agent",
  "expiresIn": "90d",           // Optional: 7d, 30d, 90d, 180d, 365d
  "maxUses": null,              // Optional: null = unlimited
  "notes": "For Anambra recruitment drive"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "url": "http://localhost:5173/onboarding?token=eyJhbGc...",
    "designation": "Polling Unit Agent",
    "expires_at": "2025-04-03T10:30:00Z"
  }
}
```

#### Valid Designations

- `Polling Unit Agent` - Monitors at polling unit level (requires Ward & PU selection)
- `Ward Coordinator` - Manages agents in a ward
- `LGA Coordinator` - Oversees LGA operations
- `State Coordinator` - State-level coordination

### User Onboarding Flow

#### Step 1: Phone Verification
- User enters Nigerian phone number (0801-234-5678)
- Backend checks for existing accounts
- Reconciliation scenarios:
  - **New User**: Proceed to Google Sign-In
  - **@obidients.com Email**: Update account with real Google email
  - **Real Email Exists**: Show error, contact support

#### Step 2: Google Sign-In
- Redirects to Google OAuth
- No email verification needed
- Instant account creation

#### Step 3: Location Selection
- State (required for all)
- LGA (required for all)
- Ward (required for PU Agents)
- Polling Unit (required for PU Agents)
- Uses abbreviations for easier selection

#### Step 4: Profile Completion
- Full name (pre-filled from Google)
- Profile photo (optional, can upload or use Google photo)
- Phone number (read-only)

#### Step 5: Bank Details (Optional)
- Account number (10 digits)
- Bank name (dropdown)
- Account name
- Can skip and add later

#### Step 6: Support Group Selection
- Select recruiting organization
- Ensures one agent per support group per PU
- Options include:
  - Obidient Movement Anambra
  - Labour Party Youth Wing
  - Women for Peter Obi
  - ... and 10 more

#### Step 7: Completion
- Automatic submission
- Creates/updates user account
- Auto-creates call center assignment
- Generates JWT token
- Redirects to dashboard

### Phone Number Reconciliation Logic

```javascript
1. Check users table for phone number
2. If found with @obidients.com email:
   → Update account (replace fake email with Google email)
3. If found with real email:
   → Error: Account exists (contact support)
4. If not found in users:
   → Check inec_voters table for voter data
   → Create new account
```

### Support Group Constraints

- **Business Rule**: One agent per support group per polling unit
- **Example**: 
  - PU "ABCD-001" can have:
    - 1 agent from "Obidient Movement Anambra"
    - 1 agent from "Labour Party Youth Wing"
    - 1 agent from "Women for Peter Obi"
    - ... up to 8 agents total (one from each group)
  - But CANNOT have 2 agents from the same group at the same PU

## API Endpoints

### Public Endpoints

```
POST   /auth/onboarding/initiate           # Step 1: Validate token & phone
POST   /auth/onboarding/verify-phone       # Step 2: Check reconciliation
GET    /auth/onboarding/google             # Step 3: Initiate Google OAuth
GET    /auth/onboarding/google/callback    # Google OAuth callback
POST   /auth/onboarding/complete           # Step 7: Finalize registration
```

### Admin Endpoints (Auth Required)

```
POST   /auth/onboarding/tokens/create      # Create onboarding token
GET    /auth/onboarding/stats              # Get statistics
       ?state=ANAMBRA                      # Filter by state
       &lga=AGUATA                         # Filter by LGA
       &supportGroup=Obidient Movement     # Filter by group
```

## Admin Dashboard

Access at: `/dashboard/admin/onboarding`

### Features

✅ **Real-time Statistics**
- Total onboarded users
- Breakdown by designation
- Active users count
- Unique support groups

✅ **Coverage Tracking**
- Agents per polling unit
- Support group distribution
- Color-coded status (green ≥8, yellow ≥4, red <4)

✅ **Filters**
- By state
- By LGA
- By support group
- Search polling units

✅ **Export**
- Download CSV of coverage data
- Includes all polling unit assignments

✅ **Active Tokens**
- View all active onboarding links
- Usage statistics
- Expiration dates

## Database Schema

### users table (updated)

```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN oauth_refresh_token TEXT;
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN support_group VARCHAR(255);
```

### onboarding_tokens table (new)

```sql
CREATE TABLE onboarding_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  designation VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);
```

### Indexes

```sql
CREATE INDEX idx_pu_agents_by_polling_unit 
  ON users("votingState", "votingLGA", "votingWard", "votingPU")
  WHERE designation = 'Polling Unit Agent';

CREATE INDEX idx_pu_agents_by_group 
  ON users(support_group, "votingPU")
  WHERE designation = 'Polling Unit Agent';
```

## Security Features

✅ **Token Validation**: All endpoints validate onboarding token
✅ **Token Expiration**: Tokens expire after configured period
✅ **Usage Limits**: Optional max_uses prevents token abuse
✅ **OAuth Security**: Google handles authentication securely
✅ **Phone Normalization**: Consistent format prevents duplicates
✅ **SQL Injection Prevention**: Parameterized queries throughout
✅ **Rate Limiting**: Inherited from main server configuration

## Performance Optimizations

✅ **Database Indexes**: On votingState, votingLGA, votingWard, votingPU, support_group
✅ **Lazy Loading**: Frontend components loaded on demand
✅ **Pagination**: Dashboard shows first 100 results
✅ **Caching**: Browser caches StateLGAWardPollingUnits data
✅ **Normalized Phone**: SQL function for efficient searches

## Testing Checklist

### Backend
- [ ] Create onboarding token (admin)
- [ ] Validate token (public)
- [ ] Phone verification with existing user
- [ ] Phone verification with new user
- [ ] Google OAuth flow
- [ ] Complete onboarding (new user)
- [ ] Complete onboarding (existing user update)
- [ ] Fetch onboarding statistics
- [ ] Support group constraint (duplicate check)

### Frontend
- [ ] Access onboarding URL with token
- [ ] Invalid token handling
- [ ] Phone input validation
- [ ] Google Sign-In redirect
- [ ] Location dropdowns (State → LGA → Ward → PU)
- [ ] Profile image upload
- [ ] Bank details (skip option)
- [ ] Support group selection
- [ ] Completion with confetti 🎉
- [ ] Dashboard redirect

## Troubleshooting

### "Invalid or expired onboarding token"
**Cause**: Token expired or not found in database
**Solution**: Create new token via admin endpoint

### "This phone number is already registered"
**Cause**: Phone exists with real email (not @obidients.com)
**Solution**: User should contact support for account access

### "A Polling Unit Agent from [group] already exists"
**Cause**: Support group already has agent at this PU
**Solution**: User should select different PU or different support group

### Google OAuth redirect not working
**Cause**: Callback URL not in Google Console authorized URIs
**Solution**: Add callback URL to Google OAuth credentials

### Database connection errors
**Cause**: Invalid credentials or network issue
**Solution**: Verify .env DB configuration, check network access

## Production Deployment

### Backend

1. Set production environment variables:
```bash
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/onboarding/google/callback
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

2. Add production callback URL to Google Console

3. Deploy to server (PM2, Docker, etc.)

### Frontend

1. Set production API URL:
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. Build production bundle:
```bash
npm run build
```

3. Deploy to hosting (Vercel, Netlify, etc.)

## Support

For issues or questions:
- **Technical**: Check logs in `server/logs/`
- **Database**: Query `onboarding_tokens` and `users` tables
- **Admin Support**: Email favemeka146@gmail.com
- **User Support**: support@obidients.com

## Future Enhancements

- [ ] SMS notifications for onboarding progress
- [ ] Real-time dashboard updates (WebSockets)
- [ ] Bulk token creation
- [ ] QR code generation for onboarding links
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Offline mode for low-connectivity areas
- [ ] WhatsApp integration for link sharing

---

**Version**: 1.0.0
**Last Updated**: January 3, 2025
**Status**: Production Ready ✅
