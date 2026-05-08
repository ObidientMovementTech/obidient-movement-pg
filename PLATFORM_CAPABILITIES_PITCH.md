# Political Party Digital Command Center — Platform Capabilities

> A fully built, battle-tested digital infrastructure for political party operations, voter mobilization, election monitoring, and real-time coordination — from national headquarters down to every polling unit.

---

## 1. ELECTION DAY COMMAND CENTER (Situation Room)

The crown jewel. A **real-time war room** that gives party leadership full visibility on election day.

- **Live Situation Room Dashboard** — auto-refreshes every 30 seconds with:
  - Active polling units reporting in real-time
  - Agent status tracking across every state, LGA, ward, and polling unit
  - Incident alerts with severity levels (violence, intimidation, equipment failure)
  - Submission timeline — see every report as it comes in
  - Unresolved incident counter for immediate escalation
  - Active agent count across the entire country

- **Live Election Results Tracking** — public-facing and internal:
  - Real-time vote tallies updated as agents submit from polling units
  - Results breakdown by **State → LGA → Ward → Polling Unit**
  - Candidate vote counts, percentages, and voter turnout metrics
  - Results certification status tracking
  - Party-wise comparison charts and visualization
  - Redis-cached for instant loading under heavy traffic

- **Field Agent Monitoring System** — structured data collection from every polling unit:
  - **Polling Unit Setup**: GPS coordinates, location type, environment details
  - **Officer Verification**: INEC officer name, arrival time, contact info, photo evidence
  - **Result Submission**: Party-by-party vote counts + photo of EC8A result sheet
  - **Incident Reporting**: Categorized incidents with photo evidence, severity, and location
  - **Monitor Key System**: Secure access codes assigned to verified agents — prevents unauthorized submissions

- **Manual Result Upload** — admin backup for result entry when field agents can't submit digitally

---

## 2. HIERARCHICAL COORDINATION SYSTEM

A **military-grade chain of command** built into the platform. Every coordinator sees exactly what they need — nothing more, nothing less.

### Coordinator Levels
| Level | Scope | Can Assign |
|-------|-------|-----------|
| **National Coordinator** | Entire country | State, LGA, Ward Coordinators + PU Agents |
| **State Coordinator** | Their state | LGA, Ward Coordinators + PU Agents |
| **LGA Coordinator** | Their LGA | Ward Coordinators + PU Agents |
| **Ward Coordinator** | Their ward | PU Agents |
| **Polling Unit Agent** | Their polling unit | — |

### What Each Level Gets
- **Scoped Dashboards**: Each coordinator sees membership stats, registration counts, coordinator counts, and growth rates for *their* jurisdiction only
- **Drill-Down Navigation**: National → click a state → see all LGAs → click an LGA → see all wards → click a ward → see all polling units
- **Team Management**: View and manage subordinate coordinators
- **Leader Assignment**: Search any user and assign them a coordinator designation with location binding
- **Role-Based Access Control (RBAC)**: Built-in gate system — every page, every button, every action checks the user's level before rendering

---

## 3. MASS COMMUNICATION ENGINE

### SMS Campaigns
- Create targeted SMS campaigns to **thousands of voters simultaneously**
- Target by **LGA** for precision outreach
- Real-time delivery tracking: sent, delivered, failed counts
- Cost tracking per campaign
- Campaign history and analytics
- Powered by Africa's Talking with webhook-based delivery reports

### Voice Call Campaigns
- Automated voice call blasts with custom audio messages
- Upload and manage audio assets (pre-recorded messages)
- Call status tracking per recipient
- Batch processing with rate limiting to prevent carrier throttling

### Broadcast Messaging (In-App)
- Push announcements to all members or targeted groups
- Admin broadcast creation with rich text
- Broadcast history and engagement tracking
- Mobile push notification delivery via Firebase

### Campaign Analytics Dashboard
- Total campaigns (SMS + Voice)
- Total recipients reached
- Delivery success rates
- Cost breakdowns
- Campaign timeline and performance trends

---

## 4. CALL CENTER OPERATIONS

A full-featured **voter outreach call center** built into the platform.

- **Voter Database Import**: Upload voter rolls via CSV/Excel with intelligent column mapping
- **Import Progress Tracking**: Real-time progress modal during large imports
- **Hierarchical Voter View**: Filter voters by State → LGA → Ward → Polling Unit
- **Voter Statistics Dashboard**: Demographics (age, gender, occupation), contact status, confirmation rates
- **Volunteer Management**:
  - Assign volunteers to specific polling units
  - Enhanced assignment modal with advanced filtering
  - Track volunteer performance metrics
  - View recently called voters per volunteer
- **Call History Tracking**: Log every call attempt with outcomes
- **Voter Confirmation Status**: Track which voters have been contacted and confirmed

---

## 5. REAL-TIME CHAT & MESSAGING SYSTEM

### Coordinator Chain Messaging
- **Hierarchical message routing**: Ward Coordinator → LGA Coordinator → State Coordinator → National
- Message status tracking: pending → assigned → delivered → read → responded
- Ensures critical information flows up the chain reliably

### Community Group Chat (Rooms)
- **5-tier room system**: National, State, LGA, Ward, and Polling Unit rooms
- Location-based auto-assignment — members join rooms matching their registered location
- Message history with pagination
- Room muting/unmuting
- Member management

### Direct Messaging
- Private 1-on-1 messaging between any members
- Real-time delivery via WebSocket (Socket.io)
- Typing indicators (throttled for performance)
- Read receipts
- Message reactions (emoji)
- Chat privacy settings — users control who can message them
- User blocking system

---

## 6. MEMBER MANAGEMENT & ONBOARDING

### Multi-Step Onboarding Flow
An 8-step guided onboarding that turns signups into verified, actionable members:
1. **Location Selection** — State, LGA, Ward, Polling Unit
2. **Phone Verification** — OTP-verified phone number
3. **Profile Completion** — Name, photo, demographics
4. **Password Setup** — Secure account creation
5. **Support Group Selection** — Self-categorization
6. **Bank Details** — For agent/coordinator stipends
7. **Google Auth Link** — Optional social login
8. **Completion** — Full member card generated

### Quick Onboarding (Admin-Generated)
- Admins generate **onboarding tokens** with QR codes and short codes
- Field agents scan QR codes at rallies/events for instant registration
- Phone reconciliation — verify the onboarding phone matches voter data
- Onboarding statistics and agent location tracking

### KYC Verification
- ID document submission (type + number)
- Selfie verification via in-app camera capture
- Admin review and approval workflow
- ADC card image submission and verification

### User Administration
- Full CRUD user management for admins
- User search, suspend, edit roles
- Onboarding metrics dashboard — track conversion rates

---

## 7. VOTING BLOCS & MOBILIZATION

### Voting Bloc Management
- Create voting blocs with rich descriptions and banner images
- **Join codes** — share a code, members join instantly
- Member management: add, remove, tag members
- Set goals and target candidates per bloc
- Distribute resources and toolkits to bloc members
- Location-based bloc organization

### Gamification & Engagement
- **Leaderboard system** — blocs ranked by membership, activity, and engagement
- Member engagement analytics
- PVC (Permanent Voter Card) status tracking per member

### Mobilization Dashboard
- Registration tracking by location
- Growth rate analytics
- Active voting bloc counts
- Coordinator coverage metrics

---

## 8. CONTENT MANAGEMENT & PUBLIC WEBSITE

### Blog/News System
- Full blog editor with create, edit, delete, draft/publish workflow
- Categories and featured images
- Public news page with individual article views

### Public-Facing Website
- Professional landing page with:
  - Leadership spotlight and directory
  - Mission/values sections
  - Photo and video gallery
  - Statistics counter (animated)
  - Latest news carousel
  - News ticker (marquee)
  - FAQ accordion
  - Mobile app showcase section
  - Contact form
  - SEO-optimized meta tags
- Privacy Policy and Terms of Service pages

### Mobile App Feed Management
- Admin-curated content feeds pushed to mobile app
- Feed management dashboard
- Unified feed (news + broadcasts + alerts)

---

## 9. MOBILE APPLICATIONS

### Flutter Mobile App (Primary)
A fully native mobile experience with:
- Email/password and Google login
- Push notifications (Firebase Cloud Messaging)
- Real-time chat and messaging
- Voting bloc participation
- Live election results viewing
- News and alerts feed
- User profile management
- Notification center

### React Native Mobile App (Secondary)
- Dashboard with recent feeds and user greeting
- Push notification permission management
- Direct messaging and leadership chain messaging
- Feeds and notifications
- Profile management
- Offline token storage

### Progressive Web App (PWA)
- Install prompt for mobile browser users
- Service worker for offline support
- App-like experience without app store download

---

## 10. ELECTION MANAGEMENT

- **Create and configure elections** — set dates, add participating parties, manage status
- **Party management** — add/edit political parties with logos and colors
- **Election statistics** — dashboard with aggregated data
- **Eligibility checker** — candidate eligibility verification tool
- **Run for Office portal** — candidate self-service registration

---

## 11. SECURITY & COMPLIANCE

- **Two-Factor Authentication (2FA)** — TOTP-based setup and login verification
- **reCAPTCHA** — bot protection on login and registration
- **Session-based JWT authentication** — secure token management
- **Role-Based Access Control** — admin, coordinator, and member tiers
- **Monitor Key System** — prevents unauthorized election submissions
- **User blocking** — platform-level user blocking
- **Account deletion** — GDPR-friendly self-service account deletion
- **Input validation** — Zod-based validation throughout
- **Rate limiting** — API and mobile-specific rate limits
- **CORS configuration** — locked-down cross-origin policy

---

## 12. INFRASTRUCTURE & SCALABILITY

| Component | Technology |
|-----------|-----------|
| **Frontend** | React + TypeScript + Vite + Tailwind CSS + Material UI |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Cache** | Redis (live results, session data) |
| **Real-time** | Socket.io (chat, notifications, live updates) |
| **Queue System** | BullMQ + Redis (SMS, Voice, Email workers) |
| **File Storage** | AWS S3 (images, audio, documents) |
| **Push Notifications** | Firebase Cloud Messaging |
| **SMS/Voice** | Africa's Talking (with webhook delivery reports) |
| **Email** | Nodemailer |
| **Mobile** | Flutter (primary) + React Native (secondary) |
| **Deployment** | Vercel (frontend) + VPS with PM2 (backend) |
| **Offline Support** | PWA with service worker |

---

## SUMMARY: WHY THIS PLATFORM

| Capability | Status |
|-----------|--------|
| Real-time election day situation room | **Built & Tested** |
| Live results from 176,000+ polling units | **Built & Tested** |
| Field agent monitoring with photo evidence | **Built & Tested** |
| 5-tier coordinator hierarchy with RBAC | **Built & Tested** |
| Mass SMS campaigns to millions | **Built & Tested** |
| Automated voice call campaigns | **Built & Tested** |
| Full call center with voter database | **Built & Tested** |
| Real-time chat with coordinator chain | **Built & Tested** |
| Community rooms (National → PU level) | **Built & Tested** |
| 8-step verified member onboarding | **Built & Tested** |
| QR code quick-registration at events | **Built & Tested** |
| KYC identity verification | **Built & Tested** |
| Voting bloc mobilization with leaderboards | **Built & Tested** |
| Mobile apps (Flutter + React Native + PWA) | **Built & Tested** |
| Blog/news CMS with public website | **Built & Tested** |
| Push notifications (Firebase) | **Built & Tested** |
| In-app broadcast messaging | **Built & Tested** |
| Candidate eligibility checker | **Built & Tested** |
| Two-factor authentication | **Built & Tested** |
| Admin user management | **Built & Tested** |

> **This is not a prototype. This is a production-grade political operations platform that has been built, deployed, and used in real elections.** Every feature listed above exists in the codebase today — ready to be white-labeled and deployed for any political party, campaign, or movement.
