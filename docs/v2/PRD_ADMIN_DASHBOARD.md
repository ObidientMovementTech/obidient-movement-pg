# PRD: Obidient Movement v2 — Admin Dashboard (`/pbx`)

> **Version**: 1.0  
> **Date**: 26 March 2026  
> **Status**: Ready for implementation  
> **Owner**: Agent B (Admin Dashboard)  
> **Related**: PRD_CHAT_SYSTEM.md, PRD_BLOG_SYSTEM.md

---

## 1. Overview

Create a completely new admin dashboard at route `/pbx`. This replaces the admin section currently embedded inside `DashboardPage.tsx` (which renders admin pages inline via sidebar state management). The new dashboard will be a proper multi-page routed application with RBAC, premium design, and professional-grade UX.

**The `/pbx` route is intentionally obscure** — only admins and coordinators should know about it. Regular members use `/dashboard`.

---

## 2. Design System

### 2.1 Design Philosophy
Follow **DESIGN_GUIDE.md** strictly:
- Material UI (MUI) is the PRIMARY component library
- Tailwind only for utility spacing/layout tweaks
- Premium feel: subtle shadows, soft borders, rounded corners (8–14px)
- Generous whitespace, calm color palette
- Apple/Linear/Stripe quality

### 2.2 Technology Stack
- **MUI**: `@mui/material`, `@emotion/react`, `@emotion/styled` (must be installed)
- **Icons**: Lucide React (already available) — do NOT install MUI icons
- **Charts**: Chart.js with react-chartjs-2 (already available in the project)
- **Rich Text**: TipTap editor (`RichTextEditor.tsx` already exists at `src/components/inputs/RichTextEditor.tsx`)
- **Router**: React Router v7 (`react-router` — NOT `react-router-dom`)
- **Font**: Poppins (already loaded)

### 2.3 MUI Theme
Create a custom MUI theme that aligns with the existing color palette:

```tsx
const pbxTheme = createTheme({
  palette: {
    primary: { main: '#0B6739' },      // accent-green
    secondary: { main: '#D21C5B' },    // accent-red
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
  },
});
```

### 2.4 Spacing
- Page padding: `p: { xs: 2, sm: 3, md: 4 }` (16–32px)
- Section spacing: `mb: 6` to `mb: 8` (48–64px)
- Card padding: `p: 3` to `p: 4` (24–32px)
- Component gaps: `gap: 2` to `gap: 3` (16–24px)

---

## 3. RBAC System

### 3.1 Role Hierarchy

```
Role-based (binary):
  admin          — Full platform access to /pbx
  user           — No access to /pbx (redirected to /dashboard)

Designation-based (hierarchical — determines what you SEE):
  National Coordinator  — sees everything
  State Coordinator     — sees state-level and below
  LGA Coordinator       — sees LGA-level and below
  Ward Coordinator      — sees ward-level and below
  Polling Unit Agent    — sees PU-level only
```

### 3.2 Route Access
- ALL `/pbx/*` routes require `role === 'admin'` OR designation is a coordinator type
- Feature visibility within pages uses designation-based filtering

### 3.3 RBACGate Component

**File**: `src/components/pbx/RBACGate.tsx`

```tsx
interface RBACGateProps {
  allowedRoles?: string[];          // e.g., ['admin']
  allowedDesignations?: string[];   // e.g., ['National Coordinator', 'State Coordinator']
  minimumLevel?: 'national' | 'state' | 'lga' | 'ward' | 'pu';  // Shorthand
  children: React.ReactNode;
  fallback?: React.ReactNode;       // What to show if not authorized (default: null)
}
```

Uses `useUser()` context (from `src/context/UserContext.tsx`) which provides:
- `profile.role` — 'admin' or 'user'
- `profile.designation` — 'National Coordinator', 'State Coordinator', etc.
- `profile.assignedState`, `profile.assignedLGA`, `profile.assignedWard`

### 3.4 PbxRoute Wrapper

**File**: `src/components/pbx/PbxRoute.tsx`

Route-level protection. Redirects non-admin/non-coordinator users to `/dashboard`:

```tsx
const PbxRoute = ({ children }) => {
  const { profile, isLoading } = useUser();
  if (isLoading) return <PageLoader />;
  if (!profile) return <Navigate to="/auth/login" />;
  
  const isCoordinator = ['National Coordinator', 'State Coordinator', 
    'LGA Coordinator', 'Ward Coordinator'].includes(profile.designation);
  
  if (profile.role !== 'admin' && !isCoordinator) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
```

### 3.5 Feature Visibility Matrix

| Feature | Admin | National | State | LGA | Ward | PU Agent |
|---------|-------|----------|-------|-----|------|----------|
| Dashboard Overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hierarchy: National | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hierarchy: State | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ |
| Hierarchy: LGA | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ | ❌ |
| Hierarchy: Ward | ✅ | ✅ | ✅ | ✅ (own) | ✅ (own) | ❌ |
| Hierarchy: PU | ✅ | ✅ | ✅ | ✅ | ✅ (own) | ✅ (own) |
| Membership Cards | ✅ | ✅ | ✅ (state) | ❌ | ❌ | ❌ |
| Chat (Inbox) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Communities | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mobilisation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Blog Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Communications | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Architecture

### 4.1 File Structure
```
src/
├── pages/
│   └── pbx/
│       ├── PbxLayout.tsx                 ← Layout shell (sidebar + topbar + outlet)
│       ├── PbxDashboard.tsx              ← Overview dashboard
│       ├── HierarchyDashboard.tsx        ← National/State/LGA/Ward/PU drill-down
│       ├── MembershipPage.tsx            ← Membership card verification
│       ├── MobilisationPage.tsx          ← Mobilisation tracking
│       ├── UsersPage.tsx                 ← User management (admin only)
│       ├── CommunicationsPage.tsx        ← Bulk comms (rewrite of existing)
│       ├── blog/
│       │   ├── BlogListPage.tsx          ← Post management list
│       │   └── BlogEditorPage.tsx        ← Create/edit post
│       └── chat/
│           └── ChatInboxPage.tsx         ← Coordinator chat inbox (full page)
├── components/
│   └── pbx/
│       ├── PbxSidebar.tsx               ← Sidebar navigation
│       ├── PbxTopBar.tsx                ← Top bar
│       ├── PbxRoute.tsx                 ← Route protection
│       ├── RBACGate.tsx                 ← Feature-level RBAC
│       └── PbxThemeProvider.tsx         ← MUI theme wrapper
```

### 4.2 Routing

In `src/main.tsx`, add:

```tsx
{
  path: "/pbx",
  element: (
    <PbxRoute>
      <PbxLayout />
    </PbxRoute>
  ),
  children: [
    { index: true, element: <Navigate to="/pbx/dashboard" replace /> },
    { path: "dashboard", element: <PbxDashboard /> },
    { path: "dashboard/:level", element: <HierarchyDashboard /> },
    { path: "dashboard/:level/:locationId", element: <HierarchyDashboard /> },
    { path: "membership", element: <MembershipPage /> },
    { path: "chat", element: <ChatInboxPage /> },
    { path: "communities", element: <CommunitiesPage /> },
    { path: "mobilisation", element: <MobilisationPage /> },
    { path: "blog", element: <BlogListPage /> },
    { path: "blog/new", element: <BlogEditorPage /> },
    { path: "blog/edit/:id", element: <BlogEditorPage /> },
    { path: "users", element: <UsersPage /> },
    { path: "communications", element: <CommunicationsPage /> },
  ],
},
```

---

## 5. Layout Components

### 5.1 PbxLayout

**File**: `src/pages/pbx/PbxLayout.tsx`

```
┌──────────────────────────────────────────────────┐
│  PbxTopBar (height: 64px)                        │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│  Sidebar │   <Outlet />                          │
│  (260px) │   (scrollable content area)           │
│          │   padding: 24-32px                    │
│          │                                       │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

- Use MUI `<Box>` for overall layout, `<Drawer>` for sidebar
- Desktop: Permanent sidebar (260px wide)
- Mobile (`< lg`): Temporary drawer, toggled by hamburger in top bar
- Content area: `overflow-y: auto`, `flex: 1`
- Background: `#f8f9fa` (light gray)
- Wrapped in MUI `<ThemeProvider>` with custom PBX theme

### 5.2 PbxSidebar

**File**: `src/components/pbx/PbxSidebar.tsx`

```
┌─────────────────────┐
│  Logo               │
│  "Admin Panel"      │
├─────────────────────┤
│                     │
│  📊 Dashboard       │  ← Always visible
│  👥 Membership      │  ← State Coord+
│  💬 Chat            │  ← Always visible
│  🏛 Communities     │  ← Ward Coord+
│  🎯 Mobilisation    │  ← Always visible
│  📝 Blog            │  ← State Coord+
│  👤 Users           │  ← Admin only
│  📡 Communications  │  ← State Coord+
│                     │
├─────────────────────┤
│  User Avatar        │
│  Name               │
│  Role badge         │
│  ← Back to Portal   │  ← Link to /dashboard
└─────────────────────┘
```

- Use MUI `<List>`, `<ListItem>`, `<ListItemIcon>`, `<ListItemText>`
- Active item: Green left border + green tint background
- Each item wrapped in `<RBACGate>` for visibility filtering
- "Back to Portal" link at bottom → navigates to `/dashboard`
- Lucide icons for menu items
- User section at bottom shows name, designation badge

### 5.3 PbxTopBar

**File**: `src/components/pbx/PbxTopBar.tsx`

- Height: 64px
- Left: Hamburger icon (mobile only) + current page title breadcrumb
- Right: Notification bell (with badge count) + user avatar dropdown
- Use MUI `<AppBar>`, `<Toolbar>`, `<IconButton>`, `<Badge>`, `<Avatar>`
- White background, subtle bottom border
- Notification count from existing `notificationService.ts`

---

## 6. Feature Modules

### 6.1 Dashboard Overview (`/pbx/dashboard`)

**Purpose**: At-a-glance platform health for the admin's scope

**Layout**:
- Row of 4–6 stat cards (MUI `<Card>`)
- Charts row: Registration trend (line) + Geographic distribution (bar)
- Recent activity list
- Quick action buttons

**Stats cards** (role-aware — shows data for your scope):
- Total Members
- New Registrations (this week)
- Active Voting Blocs
- Pending KYC
- Active Coordinators (if National/State)
- PVC Tracking (if applicable)

**Existing endpoints**:
```
GET /api/mobilise-dashboard/user-level          → User's scope info
GET /api/mobilise-dashboard/national            → National stats (if national)
GET /api/mobilise-dashboard/state/:stateId      → State stats (if state coord)
GET /api/state-dashboard/data                   → Dashboard data by role
GET /api/admin/user-management/users/statistics  → User stats (admin only)
```

### 6.2 Hierarchical Dashboard (`/pbx/dashboard/:level/:locationId?`)

**Purpose**: Drill down from National → State → LGA → Ward → PU

**URL patterns**:
- `/pbx/dashboard/national` — All states
- `/pbx/dashboard/state/lagos` — Lagos state detail
- `/pbx/dashboard/lga/ikeja` — Ikeja LGA detail
- `/pbx/dashboard/ward/ward-001` — Ward detail
- `/pbx/dashboard/pu/LAG-IKO-001-A` — Polling unit detail

**Layout at each level**:
- Breadcrumb: National > Lagos > Ikeja > Ward 001
- Stats row: Member count, coordinator count, registration rate, etc.
- Coordinator card: Name, contact, designation (for the coordinator at this level)
- Subordinate table: List of next-level units with metrics + click to drill down
- Chart: Performance comparison across subordinates

**Existing endpoints** (use these — all exist):
```
GET /api/mobilise-dashboard/national
GET /api/mobilise-dashboard/state/:stateId
GET /api/mobilise-dashboard/lga/:lgaId
GET /api/mobilise-dashboard/ward/:wardId
GET /api/mobilise-dashboard/polling-unit/:puId
GET /api/state-dashboard/subordinates
```

**Reuse logic from**: `src/pages/dashboard/state/StateDashboard.tsx` and `src/services/mobiliseDashboardService.ts`, `stateDashboardService.ts`

**RBAC**: State Coordinator cannot navigate to `/pbx/dashboard/national`. Redirect or show "Access Denied".

### 6.3 Membership Cards (`/pbx/membership`)

**Purpose**: View members, verify/approve membership cards

**Layout**:
- Search bar + filters (state, LGA, KYC status, verification status)
- Table: Name, State, LGA, Ward, KYC Status, Membership Status, Actions
- Click member → Detail panel/modal: Full profile, KYC documents, membership card preview
- Actions: Approve, Reject (with reason), Download card as image

**Existing endpoints**:
```
GET    /api/admin/user-management/users?page=1&limit=20&state=Lagos
GET    /api/admin/user-management/users/:userId
PATCH  /api/kyc/:userId/approve
PATCH  /api/kyc/:userId/reject
```

**RBAC**: State Coordinators see only members in their state

### 6.4 Chat Inbox (`/pbx/chat`) — Full Page

**See PRD_CHAT_SYSTEM.md for complete chat specification**

This is the full-page inbox for coordinators. Shows:
- List of conversations (left panel)
- Message thread (right panel)
- Reply input
- Filter by: unread, read, all

### 6.5 Communities (`/pbx/communities`)

**Purpose**: View and broadcast to geographic community groups

**Layout**:
- Group selector: National, State, LGA, Ward, PU (scoped to user's access)
- Selected group: Member count, recent activity
- Broadcast composer: Message text + channels (in-app, email, SMS)
- Broadcast history

**Existing endpoints**:
```
POST /api/admin-broadcasts/send
GET  /api/admin-broadcasts/
GET  /api/admin-broadcasts/:id
POST /api/voting-blocs/:id/broadcast
```

### 6.6 Mobilisation (`/pbx/mobilisation`)

**Purpose**: Track mobilisation metrics, voting blocs, PVC status

**Layout**:
- Mobilisation stats cards: Total blocs, active blocs, PVC tracked, etc.
- Voting bloc table with performance metrics
- Mobilisation packs: Downloadable resources (links)
- PVC tracking (if data available)

**Existing endpoints**:
```
GET /api/mobilise-dashboard/*
GET /api/voting-blocs/?page=1&limit=20
GET /api/voting-blocs/leaderboard
```

### 6.7 Blog Management (`/pbx/blog`)

**See PRD_BLOG_SYSTEM.md for complete blog specification**

- Post list with status filters (draft/published/archived)
- Create/edit with TipTap editor
- Publish/unpublish toggle
- Featured image upload via S3

### 6.8 User Management (`/pbx/users`)

**Purpose**: Manage all platform users (admin only)

**Layout**:
- Search + filters (role, designation, state, KYC status, date range)
- Data table: Name, Email, Phone, State, Designation, Role, Status, Joined
- Click → User detail modal with full profile
- Actions: Change role, change designation, assign location, force password reset, delete

**Existing endpoints** (all exist):
```
GET    /api/admin/user-management/users
GET    /api/admin/user-management/users/statistics
GET    /api/admin/user-management/users/search
GET    /api/admin/user-management/users/:userId
PATCH  /api/admin/user-management/users/:userId/role
PATCH  /api/admin/user-management/users/:userId/status
PATCH  /api/admin/user-management/users/:userId/profile
PUT    /api/admin/user-management/users/:userId/designation
POST   /api/admin/user-management/users/:userId/force-password-reset
POST   /api/admin/user-management/users
DELETE /api/admin/user-management/users/:userId
GET    /api/admin/user-management/users/export/verified-csv
```

### 6.9 Communications (`/pbx/communications`)

**Purpose**: Send bulk SMS, voice, and email campaigns

**Layout**:
- Campaign creator: Type (SMS/Voice/Email), recipients (by location/designation), message
- Campaign list: Status, sent count, delivery rate
- Campaign detail: Delivery logs, retry failed

**Existing endpoints** (all exist):
```
POST /api/communications/sms
POST /api/communications/voice
GET  /api/communications/campaigns
GET  /api/communications/campaigns/:id
POST /api/communications/campaigns/:id/cancel
POST /api/admin-broadcasts/send
```

---

## 7. Member Dashboard Integration

### 7.1 Admin Panel Button in Member Dashboard

Add a subtle button in the existing `DashboardPage.tsx` that appears ONLY for admin/coordinator users:

**Location**: In the sidebar, at the bottom above "My Profile", OR in the header area

```tsx
// Only show for admin or coordinator users
{(profile?.role === 'admin' || isCoordinator) && (
  <Link to="/pbx/dashboard">
    <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-accent-green hover:bg-accent-green/10 rounded-lg">
      <ShieldCheck size={18} />
      Admin Panel
    </div>
  </Link>
)}
```

**File to modify**: `src/pages/dashboard/DashboardPage.tsx` — add it in the sidebar nav, above "My Profile"

This is the ONLY modification to the existing dashboard.

---

## 8. Dependencies to Install

```bash
cd frontend
npm install @mui/material @emotion/react @emotion/styled
```

Do NOT install `@mui/icons-material` — use Lucide React for icons consistently.

---

## 9. Implementation Order

1. Install MUI dependencies
2. Create `PbxThemeProvider.tsx` (MUI theme)
3. Create `RBACGate.tsx` and `PbxRoute.tsx`
4. Create `PbxSidebar.tsx`
5. Create `PbxTopBar.tsx`
6. Create `PbxLayout.tsx`
7. Create `PbxDashboard.tsx` (overview)
8. Create `HierarchyDashboard.tsx`
9. Create `MembershipPage.tsx`
10. Create `ChatInboxPage.tsx` (see PRD_CHAT_SYSTEM.md)
11. Create `CommunitiesPage.tsx`
12. Create `MobilisationPage.tsx`
13. Create `BlogListPage.tsx` + `BlogEditorPage.tsx` (see PRD_BLOG_SYSTEM.md)
14. Create `UsersPage.tsx`
15. Create `CommunicationsPage.tsx`
16. Wire all routes in `main.tsx`
17. Add "Admin Panel" button to existing `DashboardPage.tsx` sidebar
18. Test all pages with different user roles

---

## 10. Existing Services to Reuse

These frontend services already exist and have working API integration:

| Service File | Usage |
|-------------|-------|
| `src/services/mobiliseDashboardService.ts` | Hierarchical dashboard data |
| `src/services/stateDashboardService.ts` | State dashboard + subordinates |
| `src/services/adminUserManagementService.ts` | User CRUD |
| `src/services/adminBroadcastService.ts` | Email broadcasts |
| `src/services/communicationsService.ts` | SMS/Voice campaigns |
| `src/services/kycService.ts` | KYC management |
| `src/services/votingBlocService.ts` | Voting bloc operations |
| `src/services/notificationService.ts` | Notifications |
| `src/services/adminMobileFeedsService.ts` | Mobile feeds |

Do NOT rewrite these services. Import and use them directly.

---

## 11. What NOT To Do

- ❌ Do NOT modify existing pages except adding the admin button to `DashboardPage.tsx`
- ❌ Do NOT use plain CSS or raw HTML elements — use MUI components per DESIGN_GUIDE
- ❌ Do NOT rewrite existing service files — import them
- ❌ Do NOT install `@mui/icons-material` — use Lucide React
- ❌ Do NOT use `react-router-dom` — use `react-router` v7 directly
- ❌ Do NOT create API endpoints — use existing ones (except blog, which is in PRD_BLOG_SYSTEM.md)
- ❌ Do NOT make the `/pbx` route publicly discoverable (no links from public pages)
- ❌ Do NOT modify existing contexts — read from them using existing hooks
