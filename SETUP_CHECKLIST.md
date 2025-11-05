# Mass Onboarding System - Setup Checklist

## 🚀 Pre-Launch Checklist

### Phase 1: Backend Configuration (30 minutes)

- [ ] **1.1 Google Cloud Console Setup**
  - [ ] Go to https://console.cloud.google.com/
  - [ ] Create/select project
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credentials
  - [ ] Add callback URLs:
    - Development: `http://localhost:5000/auth/onboarding/google/callback`
    - Production: `https://your-api-domain.com/auth/onboarding/google/callback`
  - [ ] Copy Client ID and Secret

- [ ] **1.2 Environment Variables**
  - [ ] Copy `server/.env.template` to `server/.env`
  - [ ] Set `GOOGLE_CLIENT_ID`
  - [ ] Set `GOOGLE_CLIENT_SECRET`
  - [ ] Set `GOOGLE_CALLBACK_URL`
  - [ ] Generate `JWT_SECRET`: `openssl rand -base64 32`
  - [ ] Generate `SESSION_SECRET`: `openssl rand -base64 32`
  - [ ] Set `FRONTEND_URL` (e.g., http://localhost:5173)
  - [ ] Verify database credentials

- [ ] **1.3 Install Dependencies**
  ```bash
  cd server
  npm install
  ```

- [ ] **1.4 Verify Migration**
  ```bash
  # Check if migration was successful
  psql -h 109.176.207.91 -p 5432 -U username -d dev21 -c "\d onboarding_tokens"
  ```

- [ ] **1.5 Start Backend**
  ```bash
  npm run dev
  # Should see: "HTTP Server running on port 5000"
  ```

### Phase 2: Frontend Configuration (15 minutes)

- [ ] **2.1 Environment Variables**
  - [ ] Create `frontend/.env`
  - [ ] Set `VITE_API_URL=http://localhost:5000`

- [ ] **2.2 Install Dependencies**
  ```bash
  cd frontend
  npm install
  # canvas-confetti already installed ✅
  ```

- [ ] **2.3 Start Frontend**
  ```bash
  npm run dev
  # Should see: "Local: http://localhost:5173"
  ```

### Phase 3: Testing (45 minutes)

- [ ] **3.1 Create Test Token**
  ```bash
  curl -X POST http://localhost:5000/auth/onboarding/tokens/create \
    -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "designation": "Polling Unit Agent",
      "expiresIn": "90d",
      "notes": "Test token"
    }'
  ```
  - [ ] Copy the returned URL

- [ ] **3.2 Test Onboarding Flow**
  - [ ] Open onboarding URL in browser
  - [ ] **Step 1**: Enter test phone number (e.g., 08012345678)
  - [ ] **Step 2**: Click "Continue with Google"
  - [ ] **Step 3**: Authorize with Google account
  - [ ] **Step 4**: Select location (ANAMBRA → AGUATA → Ward → PU)
  - [ ] **Step 5**: Verify/update name and photo
  - [ ] **Step 6**: Enter bank details or skip
  - [ ] **Step 7**: Select support group
  - [ ] **Step 8**: See confetti and completion message
  - [ ] Verify redirect to dashboard
  - [ ] Check JWT token in localStorage

- [ ] **3.3 Verify Database**
  ```sql
  -- Check new user created
  SELECT id, name, email, phone, designation, support_group, google_id 
  FROM users 
  WHERE email = 'your-test-email@gmail.com';

  -- Check token usage incremented
  SELECT id, designation, current_uses, max_uses 
  FROM onboarding_tokens 
  WHERE id = YOUR_TOKEN_ID;

  -- Check call center assignment created
  SELECT * FROM call_center_assignments 
  WHERE user_id = YOUR_USER_ID;
  ```

- [ ] **3.4 Test Phone Reconciliation**
  - [ ] Create user with fake email: `testuser@obidients.com`
  - [ ] Create new onboarding token
  - [ ] Go through onboarding with same phone number
  - [ ] Verify user email updated to Google email
  - [ ] Verify user data preserved

- [ ] **3.5 Test Support Group Constraint**
  - [ ] Complete onboarding for PU with Support Group A
  - [ ] Try to onboard another user with Support Group A at same PU
  - [ ] Verify error: "Agent already exists for this group"
  - [ ] Retry with Support Group B
  - [ ] Verify success

- [ ] **3.6 Test Admin Dashboard**
  - [ ] Login as admin
  - [ ] Navigate to `/dashboard/admin/onboarding`
  - [ ] Verify statistics display
  - [ ] Test filters (State, LGA, Support Group)
  - [ ] Test search functionality
  - [ ] Click "Export CSV"
  - [ ] Verify CSV downloads with correct data
  - [ ] Click "Refresh"
  - [ ] Verify manual refresh works

### Phase 4: Production Deployment (1 hour)

- [ ] **4.1 Backend Deployment**
  - [ ] Update `.env` with production values
  - [ ] Set `NODE_ENV=production`
  - [ ] Set production `GOOGLE_CALLBACK_URL`
  - [ ] Set production `FRONTEND_URL`
  - [ ] Deploy to server (PM2, Docker, etc.)
  - [ ] Verify server starts successfully
  - [ ] Test health check endpoint

- [ ] **4.2 Frontend Deployment**
  - [ ] Update `.env` with production API URL
  - [ ] Build production bundle: `npm run build`
  - [ ] Deploy to hosting (Vercel, Netlify, etc.)
  - [ ] Verify deployment successful
  - [ ] Test onboarding flow in production

- [ ] **4.3 Google OAuth Production Setup**
  - [ ] Add production callback URL to Google Console
  - [ ] Add production frontend URL to authorized origins
  - [ ] Test OAuth flow in production

### Phase 5: Launch Preparation (30 minutes)

- [ ] **5.1 Create Production Tokens**
  ```javascript
  // For Anambra PU Agents
  {
    "designation": "Polling Unit Agent",
    "expiresIn": "90d",
    "maxUses": null,
    "notes": "Anambra State - Phase 1 Recruitment"
  }

  // For Ward Coordinators
  {
    "designation": "Ward Coordinator",
    "expiresIn": "90d",
    "maxUses": 50,
    "notes": "Ward Coordinators - Anambra"
  }
  ```

- [ ] **5.2 Prepare Communication Materials**
  - [ ] Draft WhatsApp message with onboarding link
  - [ ] Create SMS template
  - [ ] Prepare email campaign
  - [ ] Design social media posts
  - [ ] Create instruction video (optional)

- [ ] **5.3 Train Coordinators**
  - [ ] Share onboarding links with coordinators
  - [ ] Explain 7-step process
  - [ ] Demonstrate support group selection
  - [ ] Show admin dashboard features
  - [ ] Provide troubleshooting guide

- [ ] **5.4 Set Up Monitoring**
  - [ ] Configure log monitoring
  - [ ] Set up error alerts
  - [ ] Create daily report automation
  - [ ] Schedule weekly reviews

### Phase 6: Launch & Monitor (Ongoing)

- [ ] **6.1 Soft Launch**
  - [ ] Share link with 50 test users
  - [ ] Monitor completion rate
  - [ ] Collect feedback
  - [ ] Fix any issues

- [ ] **6.2 Full Launch**
  - [ ] Broadcast links to all coordinators
  - [ ] Post on social media
  - [ ] Send WhatsApp/SMS campaigns
  - [ ] Monitor dashboard hourly

- [ ] **6.3 Daily Monitoring**
  - [ ] Check onboarding statistics
  - [ ] Review error logs
  - [ ] Respond to support requests
  - [ ] Export daily reports

- [ ] **6.4 Weekly Review**
  - [ ] Analyze completion rates
  - [ ] Review support group distribution
  - [ ] Check polling unit coverage
  - [ ] Identify and address bottlenecks

---

## 🆘 Troubleshooting Quick Guide

### Issue: "Invalid onboarding token"
**Fix**: Create new token via admin endpoint

### Issue: Google OAuth fails
**Fix**: Verify callback URL in Google Console matches .env

### Issue: "Account already exists"
**Fix**: User should use "Forgot Password" or contact support

### Issue: Dashboard doesn't load
**Fix**: Check JWT token in localStorage, verify admin role

### Issue: Phone number rejected
**Fix**: Ensure format is 0801234567 or +2348012345678

### Issue: Duplicate support group error
**Fix**: User should select different support group or different PU

---

## 📊 Success Criteria

✅ **Technical Success**
- [ ] 95%+ uptime
- [ ] <5 second average completion time per step
- [ ] <1% error rate
- [ ] 80%+ completion rate (users who start finish)

✅ **Business Success**
- [ ] 500+ agents onboarded per day
- [ ] All 21 LGAs in Anambra covered
- [ ] Balanced distribution across support groups
- [ ] 80%+ of polling units have at least 1 agent

✅ **User Experience Success**
- [ ] Positive feedback from elderly users
- [ ] Low support request volume
- [ ] High Google OAuth adoption rate (>95%)
- [ ] Fast onboarding time (<5 minutes average)

---

## 🎯 Completion Status

Use this to track your progress:

```
BACKEND SETUP:      [ ] Not Started  [ ] In Progress  [ ] Complete
FRONTEND SETUP:     [ ] Not Started  [ ] In Progress  [ ] Complete
TESTING:            [ ] Not Started  [ ] In Progress  [ ] Complete
DEPLOYMENT:         [ ] Not Started  [ ] In Progress  [ ] Complete
LAUNCH PREP:        [ ] Not Started  [ ] In Progress  [ ] Complete
MONITORING:         [ ] Not Started  [ ] In Progress  [ ] Complete
```

---

## 📞 Emergency Contacts

- **Technical Issues**: [Your DevOps Team]
- **Database Issues**: [Your DBA]
- **Google OAuth Issues**: [Your Tech Lead]
- **User Support**: support@obidients.com
- **Admin Support**: favemeka146@gmail.com

---

**Estimated Total Setup Time**: 3-4 hours
**Recommended Team Size**: 2-3 people
**Best Time to Launch**: Early morning (6-8 AM) for all-day monitoring

---

✨ **You're ready to onboard 100,000+ agents!** ✨
