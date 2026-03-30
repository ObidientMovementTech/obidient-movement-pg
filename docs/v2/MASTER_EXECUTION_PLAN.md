# Obidient Movement v2 — Master Execution Plan

> **Date**: 26 March 2026  
> **Status**: Approved — Ready for execution

---

## Summary

Upgrade the Obidient Movement platform with two parallel workstreams:

| Workstream | Owner | Route | Description |
|-----------|-------|-------|-------------|
| **A — Landing Page** | Agent A | `/`, `/about`, `/news`, `/contact` | SEO-optimized public website (4 pages) |
| **B — Admin Dashboard** | Agent B | `/pbx/*` | Professional RBAC admin dashboard + chat system + blog CMS |

---

## PRD Documents

| Document | Path | For |
|----------|------|-----|
| Landing Page PRD | `docs/v2/PRD_LANDING_PAGE.md` | Agent A |
| Admin Dashboard PRD | `docs/v2/PRD_ADMIN_DASHBOARD.md` | Agent B |
| Chat System PRD | `docs/v2/PRD_CHAT_SYSTEM.md` | Agent B |
| Blog System PRD | `docs/v2/PRD_BLOG_SYSTEM.md` | Agent B (server) + Agent A (frontend read) |

---

## Key Decisions

1. **Blog categories**: Predefined list (`BLOG_CATEGORIES` constant) + freeform tags (max 10)
2. **Admin route is secret**: `/pbx` — never linked from public pages. Members see a discreet "Admin Panel" button in `/dashboard` sidebar ONLY if `role === 'admin'` or they are a coordinator
3. **Image uploads**: AWS S3 exclusively (via `uploadBufferToS3()` in `server/utils/s3Upload.js`). Cloudinary is NOT used
4. **Chat**: Floating widget for authenticated users everywhere + full inbox at `/pbx/chat` for coordinators. Rate limited (5 msgs/hour/level, 60s cooldown). Anti-spam via server-side rate limiting
5. **Coordinator chain**: New `GET /api/chat/my-coordinators` endpoint needed — queries UP the hierarchy from user's voting location
6. **Existing `/dashboard`** route stays untouched (member features) — only change is adding the admin panel button in sidebar

---

## Execution Phases

### Phase 0: Foundation (Sequential — must complete before parallel work)

**Owned by**: Agent B (or whoever starts first)

| # | Task | Files |
|---|------|-------|
| 0.1 | Install frontend deps: `@mui/material @emotion/react @emotion/styled react-helmet-async` | `frontend/package.json` |
| 0.2 | Add `HelmetProvider` wrapping the app | `frontend/src/main.tsx` |
| 0.3 | Create blog DB migration + run it | `server/sql/create_blog_posts_table.sql` |
| 0.4 | Create blog model | `server/models/blogPost.model.js` |
| 0.5 | Create blog controller | `server/controllers/blog.controller.js` |
| 0.6 | Create blog routes | `server/routes/blog.route.js` |
| 0.7 | Mount blog routes in server | `server/server.js` |
| 0.8 | Create chat controller (coordinator chain endpoint) | `server/controllers/chat.controller.js` |
| 0.9 | Create chat routes | `server/routes/chat.route.js` |
| 0.10 | Mount chat routes in server | `server/server.js` |
| 0.11 | Create blog categories constant (frontend) | `frontend/src/constants/blogCategories.ts` |
| 0.12 | Create blog service (frontend, shared) | `frontend/src/services/blogService.ts` |
| 0.13 | Create chat service (frontend) | `frontend/src/services/chatService.ts` |

### Phase 1A: Landing Page (Agent A — parallel with Phase 1B)

**PRD**: `docs/v2/PRD_LANDING_PAGE.md`

| # | Task |
|---|------|
| 1A.1 | Create `SEOHead.tsx` component |
| 1A.2 | Create `PublicHeader.tsx` |
| 1A.3 | Create `PublicFooter.tsx` |
| 1A.4 | Create `PublicLayout.tsx` |
| 1A.5 | Create `HomePage.tsx` |
| 1A.6 | Create `AboutPage.tsx` |
| 1A.7 | Create `NewsPage.tsx` |
| 1A.8 | Create `NewsPostPage.tsx` |
| 1A.9 | Create `ContactPage.tsx` |
| 1A.10 | Wire routes in `main.tsx` |
| 1A.11 | Test all pages + SEO |

### Phase 1B: Admin Dashboard (Agent B — parallel with Phase 1A)

**PRDs**: `docs/v2/PRD_ADMIN_DASHBOARD.md`, `PRD_CHAT_SYSTEM.md`, `PRD_BLOG_SYSTEM.md`

| # | Task |
|---|------|
| 1B.1 | Create `PbxThemeProvider.tsx` (MUI theme) |
| 1B.2 | Create `RBACGate.tsx` + `PbxRoute.tsx` |
| 1B.3 | Create `PbxSidebar.tsx` |
| 1B.4 | Create `PbxTopBar.tsx` |
| 1B.5 | Create `PbxLayout.tsx` |
| 1B.6 | Create `PbxDashboard.tsx` (overview) |
| 1B.7 | Create `HierarchyDashboard.tsx` (drill-down) |
| 1B.8 | Create `MembershipPage.tsx` |
| 1B.9 | Create `ChatWidget.tsx` + subcomponents |
| 1B.10 | Create `ChatInboxPage.tsx` |
| 1B.11 | Create `CommunitiesPage.tsx` |
| 1B.12 | Create `MobilisationPage.tsx` |
| 1B.13 | Create `BlogListPage.tsx` |
| 1B.14 | Create `BlogEditorPage.tsx` |
| 1B.15 | Create `UsersPage.tsx` |
| 1B.16 | Create `CommunicationsPage.tsx` |
| 1B.17 | Wire routes in `main.tsx` |
| 1B.18 | Add "Admin Panel" button to existing `DashboardPage.tsx` |
| 1B.19 | Mount ChatWidget globally |
| 1B.20 | Test all pages with different roles |

### Phase 2: Integration & Polish

| # | Task |
|---|------|
| 2.1 | Verify all routes coexist without conflicts |
| 2.2 | Test blog flow: create in admin → appears on public `/news` |
| 2.3 | Test chat flow: member sends → coordinator receives → replies |
| 2.4 | Test RBAC across all roles |
| 2.5 | Lighthouse SEO audit on all public pages |
| 2.6 | Responsive testing (375px → 1440px) |
| 2.7 | Dark mode check |

---

## Technology Additions

| Package | Version | Purpose |
|---------|---------|---------|
| `@mui/material` | latest | Admin dashboard UI components |
| `@emotion/react` | latest | MUI peer dependency |
| `@emotion/styled` | latest | MUI peer dependency |
| `react-helmet-async` | latest | SEO meta tags management |

**No other packages should be added without approval.**

---

## Architecture Diagram

```
                         ┌─────────────────┐
                         │   Public Pages   │
                         │  (Tailwind CSS)  │
                         │                  │
                         │  /  (Home)       │
                         │  /about          │
                     ┌──▶│  /news           │──── reads ────┐
                     │   │  /news/:slug     │               │
                     │   │  /contact        │               │
                     │   └─────────────────┘               │
                     │                                      │
Users ──────────────┤                              ┌───────▼────────┐
                     │                              │  Blog API      │
                     │                              │  /api/blog/*   │
                     │   ┌─────────────────────┐   │                │
                     │   │   Member Dashboard   │   │  Chat API      │
                     ├──▶│   /dashboard/*       │   │  /api/chat/*   │
                     │   │   (unchanged)        │   │  /api/mobile/  │
                     │   │                      │   │   messages/*   │
                     │   │   [Admin Panel] ──────── links ──┐       │
                     │   └─────────────────────┘           │       │
                     │                                      │       │
                     │   ┌─────────────────────┐           │       │
                     │   │   Admin Dashboard    │◀──────────┘       │
                     └──▶│   /pbx/* (MUI)       │                   │
                         │                      │── writes ─────────┘
                         │   Dashboard          │
                         │   Hierarchy Drilldown │
                         │   Membership Cards    │
                         │   Chat Inbox          │
                         │   Communities         │
                         │   Mobilisation        │
                         │   Blog CMS            │
                         │   User Management     │
                         │   Communications      │
                         └─────────────────────┘

                    ┌──────────────────────────────┐
                    │  Chat Widget (Floating)       │
                    │  Appears on ALL auth pages    │
                    │  Except /auth/* and /pbx/*    │
                    └──────────────────────────────┘
```

---

## File Counts

| Area | New Files | Modified Files |
|------|-----------|----------------|
| Server (blog + chat) | 6 | 1 (`server.js`) |
| Frontend — Public | 7 | 1 (`main.tsx`) |
| Frontend — Admin | 15 | 1 (`DashboardPage.tsx`) |
| Frontend — Chat Widget | 5 | 1 (`main.tsx`) |
| Frontend — Shared | 3 | 1 (`package.json`) |
| **Total** | **~36** | **~5** |
