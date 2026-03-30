# PRD: Obidient Movement v2 — Chat System

> **Version**: 1.0  
> **Date**: 26 March 2026  
> **Status**: Ready for implementation  
> **Owner**: Agent B (Admin Dashboard)  
> **Related**: PRD_ADMIN_DASHBOARD.md

---

## 1. Overview

Build a two-part chat system:

1. **Floating Chat Widget** — Appears on all pages when the user is authenticated. Allows members to message their coordinators up the hierarchy chain (Ward → LGA → State → National).
2. **Full Chat Inbox Page** (`/pbx/chat`) — For coordinators to view all incoming messages, respond, and manage conversations.

The system builds on the existing **leadership messaging** infrastructure (see Section 8 for existing code references).

---

## 2. User Stories

### Members (Regular Users)
- As a member, I can click the floating chat icon to see a list of my coordinators (Ward, LGA, State, National)
- As a member, I can send a message to any coordinator in my chain
- As a member, I can see my sent messages and their responses
- As a member, I cannot spam coordinators (rate limited)

### Coordinators
- As a coordinator, I see incoming messages in my `/pbx/chat` inbox
- As a coordinator, I can reply to any message
- As a coordinator, I see which member sent the message, their location details
- As a coordinator, I get notified (bell badge + optional push) when new messages arrive

### Admins
- As an admin, I can see all messages across the platform in `/pbx/chat`
- As an admin, I can reassign messages to other coordinators

---

## 3. Architecture

### 3.1 Communication Protocol
- **HTTP Polling** (phase 1) — widget polls every 15 seconds for new messages; inbox polls every 10 seconds
- **No WebSocket** yet — planned for v2.1 upgrade

### 3.2 Anti-Spam & Abuse Prevention

| Measure | Rule |
|---------|------|
| Rate limit per user | Max 5 messages per hour per recipient level |
| Cooldown | 60-second minimum between messages to same coordinator |
| Message length | Min 10 chars, max 1000 chars |
| Content filter | Strip HTML, prevent XSS (server-side sanitization) |
| Block capability | Coordinators can block abusive users from messaging them |
| Report button | Users can report inappropriate messages |
| Account requirement | Must have verified email (`emailVerified: true`) to chat |
| Profile requirement | Must have completed onboarding (name, state, LGA, ward set) |

### 3.3 Existing Infrastructure

**Database table** (ALREADY EXISTS in `server/migrations/mobile_app_core.sql`):
```sql
leadership_messages {
  id: UUID PRIMARY KEY,
  sender_id: UUID FK users,
  recipient_level: VARCHAR ('national'|'state'|'lga'|'ward'),
  recipient_location: JSONB { state, lga, ward },
  subject: VARCHAR(255),
  message: TEXT,
  status: VARCHAR ('pending'|'assigned'|'delivered'|'read'|'responded'),
  assigned_to: UUID FK users (auto-assigned coordinator),
  response: TEXT,
  responded_at: TIMESTAMP,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Existing auto-routing** (DB trigger function `assign_message_to_coordinator()`):
- When a message is inserted, auto-assigns to the coordinator matching `recipient_level` + `recipient_location`
- Falls back UP the chain if coordinator at requested level is unavailable

**Existing endpoints** (in `server/controllers/mobile.controller.js`):
```
POST   /api/mobile/messages/leadership         → sendLeadershipMessage
GET    /api/mobile/messages/leadership         → getLeadershipMessages (coordinator inbox)
POST   /api/mobile/messages/:messageId/respond → respondToLeadershipMessage
PUT    /api/mobile/messages/:messageId/read    → markMessageAsRead
GET    /api/mobile/messages/my-messages        → getMyMessages (sender's outbox)
GET    /api/mobile/messages/unread-count       → getUnreadMessageCount
```

### 3.4 New Endpoint Required

**`GET /api/chat/my-coordinators`** — Returns the user's coordinator chain based on their voting location

This does NOT exist yet and must be created on the server.

**Logic**:
```javascript
// Based on user's votingState, votingLGA, votingWard:
async function getMyCoordinators(req, res) {
  const { votingState, votingLGA, votingWard } = req.user;
  
  const chain = [];
  
  // Ward Coordinator
  const ward = await db.query(
    `SELECT id, name, email, "profileImage", designation 
     FROM users WHERE designation = 'Ward Coordinator' 
     AND "assignedState" = $1 AND "assignedLGA" = $2 AND "assignedWard" = $3`,
    [votingState, votingLGA, votingWard]
  );
  if (ward.rows[0]) chain.push({ level: 'ward', ...ward.rows[0] });
  
  // LGA Coordinator
  const lga = await db.query(
    `SELECT id, name, email, "profileImage", designation 
     FROM users WHERE designation = 'LGA Coordinator' 
     AND "assignedState" = $1 AND "assignedLGA" = $2`,
    [votingState, votingLGA]
  );
  if (lga.rows[0]) chain.push({ level: 'lga', ...lga.rows[0] });
  
  // State Coordinator
  const state = await db.query(
    `SELECT id, name, email, "profileImage", designation 
     FROM users WHERE designation = 'State Coordinator' 
     AND "assignedState" = $1`,
    [votingState]
  );
  if (state.rows[0]) chain.push({ level: 'state', ...state.rows[0] });
  
  // National Coordinator
  const national = await db.query(
    `SELECT id, name, email, "profileImage", designation 
     FROM users WHERE designation = 'National Coordinator'`
  );
  if (national.rows[0]) chain.push({ level: 'national', ...national.rows[0] });
  
  return res.json({ coordinators: chain });
}
```

**Server files to create/modify**:
- Create: `server/controllers/chat.controller.js`
- Create: `server/routes/chat.route.js`
- Modify: `server/server.js` — mount at `/api/chat`

**Anti-spam middleware** (new):
```javascript
// Rate limit: 5 messages per hour per user per recipient level
// Add to the sendLeadershipMessage endpoint
const checkChatRateLimit = async (req, res, next) => {
  const { id: userId } = req.user;
  const { recipientLevel } = req.body;
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await db.query(
    `SELECT COUNT(*) FROM leadership_messages 
     WHERE sender_id = $1 AND recipient_level = $2 AND created_at > $3`,
    [userId, recipientLevel, oneHourAgo]
  );
  
  if (parseInt(count.rows[0].count) >= 5) {
    return res.status(429).json({ 
      message: 'Message limit reached. You can send up to 5 messages per hour per coordinator level.' 
    });
  }
  
  // Check 60-second cooldown
  const lastMessage = await db.query(
    `SELECT created_at FROM leadership_messages 
     WHERE sender_id = $1 AND recipient_level = $2 
     ORDER BY created_at DESC LIMIT 1`,
    [userId, recipientLevel]
  );
  
  if (lastMessage.rows[0]) {
    const elapsed = Date.now() - new Date(lastMessage.rows[0].created_at).getTime();
    if (elapsed < 60000) {
      return res.status(429).json({ 
        message: `Please wait ${Math.ceil((60000 - elapsed) / 1000)} seconds before sending another message.` 
      });
    }
  }
  
  next();
};
```

### 3.5 Frontend Service

**File**: `src/services/chatService.ts`

```typescript
// Coordinator chain for authenticated user
export const getMyCoordinators = (): Promise<CoordinatorChainResponse> => { ... };

// Send message (reuses leadership messaging endpoint)
export const sendMessage = (data: {
  recipientLevel: 'ward' | 'lga' | 'state' | 'national';
  subject: string;
  message: string;
}): Promise<Message> => { ... };

// Get user's sent messages
export const getMyMessages = (): Promise<Message[]> => { ... };

// Get unread count
export const getUnreadCount = (): Promise<number> => { ... };

// === Coordinator-only endpoints ===

// Get inbox (messages assigned to this coordinator)
export const getInbox = (params?: {
  status?: 'pending' | 'read' | 'responded';
  page?: number;
  limit?: number;
}): Promise<InboxResponse> => { ... };

// Reply to a message
export const replyToMessage = (messageId: string, response: string): Promise<Message> => { ... };

// Mark as read
export const markAsRead = (messageId: string): Promise<void> => { ... };
```

---

## 4. Floating Chat Widget

### 4.1 Component

**File**: `src/components/chat/ChatWidget.tsx`

This component renders on ALL pages when the user is authenticated. Add it to the app's root render tree (in `main.tsx` or at the layout level).

### 4.2 Placement

```
              Page Content
        ┌──────────────────────┐
        │                      │
        │                      │
        │                      │
        │                      │
        │                   💬 │  ← Floating button (bottom-right)
        └──────────────────────┘
```

- Position: `fixed bottom-6 right-6 z-50`
- Button: Circular, 56px, green (`#0B6739`) with white chat icon
- Badge: Unread count red circle (top-right of button)
- Click: Opens chat panel

### 4.3 Chat Panel (Expanded Widget)

When clicked, the button opens a panel above it:

```
        ┌──────────────────────────┐
        │  Chat                  ✕ │  ← Header with close button
        ├──────────────────────────┤
        │  ┌─────────────────────┐ │
        │  │ 🟢 Ward Coord      │ │  ← Coordinator list (default view)
        │  │    John Doe         │ │
        │  │    Ward 001, Ikeja  │ │
        │  ├─────────────────────┤ │
        │  │ 🟢 LGA Coord       │ │
        │  │    Jane Smith       │ │
        │  │    Ikeja            │ │
        │  ├─────────────────────┤ │
        │  │ 🔵 State Coord     │ │
        │  │    Ahmed Musa       │ │
        │  │    Lagos            │ │
        │  ├─────────────────────┤ │
        │  │ 🔵 National Coord  │ │
        │  │    Sarah Adeyemi    │ │
        │  └─────────────────────┘ │
        ├──────────────────────────┤
        │  📩 My Messages (3)      │  ← Link to view sent messages
        └──────────────────────────┘
```

### 4.4 Conversation View (Within Widget)

When user clicks a coordinator:

```
        ┌──────────────────────────┐
        │  ← Ward Coordinator    ✕ │  ← Back + close
        │     John Doe             │
        ├──────────────────────────┤
        │                          │
        │  ┌──────────────────┐    │
        │  │ You: Hello, I    │    │  ← Sent messages (right-aligned)
        │  │ need help with   │    │
        │  │ my registration  │    │
        │  │ 2h ago           │    │
        │  └──────────────────┘    │
        │                          │
        │  ┌──────────────────┐    │
        │  │ Coord: Sure, what│    │  ← Responses (left-aligned)
        │  │ issue are you    │    │
        │  │ facing?          │    │
        │  │ 1h ago           │    │
        │  └──────────────────┘    │
        │                          │
        ├──────────────────────────┤
        │  [Subject field       ]  │  ← Subject (if new conversation)
        │  [Message...        📤]  │  ← Message input + send button
        │  4/5 messages remaining  │  ← Rate limit indicator
        └──────────────────────────┘
```

### 4.5 Widget States

| State | What Renders |
|-------|-------------|
| Closed | Just the floating button + unread badge |
| Coordinator List | Panel with list of user's coordinators |
| Conversation | Panel with message thread + input |
| My Messages | Panel with list of user's sent messages + responses |
| Loading | Skeleton loader inside panel |
| No Coordinators | "No coordinators assigned for your location yet" message |
| Incomplete Profile | "Complete your profile to start messaging" with link to onboarding |

### 4.6 Panel Dimensions
- Width: `360px` (or `calc(100vw - 32px)` on mobile, max 360px)
- Height: `500px` (or `calc(100vh - 120px)` on mobile, max 500px)
- Rounded corners: `rounded-2xl`
- Shadow: `shadow-2xl`
- Animation: Slide up + fade in on open

### 4.7 Visibility Rules
- **Show widget**: User is authenticated (`profile` exists in UserContext) AND `emailVerified === true`
- **Hide widget**: Not logged in, on auth pages (`/auth/*`), on onboarding page, on `/pbx/*` pages (coordinators use the full inbox instead)
- Check route: Only hide on specific path prefixes, show everywhere else

### 4.8 Where to Mount

In `main.tsx` or a global layout component. The widget needs access to UserContext:

```tsx
// Option: Create a wrapper in main.tsx
function AppWithChat() {
  return (
    <>
      <RouterProvider router={router} />
      <ChatWidgetRoot />  {/* Renders chat widget conditionally */}
    </>
  );
}
```

Or mount it inside the `UserProvider` where it has access to the user context. The widget is independent of routing — it floats on ALL pages.

**NOTE**: Because the app uses `RouterProvider`, the chat widget needs to be inside the `UserProvider` but can be outside the `RouterProvider` (it uses its own API calls, not router-based navigation). Alternatively, put it at the layout level of commonly used routes.

---

## 5. Full Chat Inbox Page (`/pbx/chat`)

### 5.1 Purpose

Full-featured message management for coordinators. This is where coordinators read, reply to, and manage all messages from members in their jurisdiction.

### 5.2 Layout

```
┌─────────────────────────────────────────────────────┐
│  Chat Inbox                            🔍 Search    │
├─────────────────┬───────────────────────────────────┤
│                 │                                   │
│  Filter: All ▼  │   [Selected conversation]         │
│                 │                                   │
│  ┌────────────┐ │   From: John Doe                  │
│  │ 🔴 John    │ │   Location: Ward 001, Ikeja, Lagos│
│  │ Subject    │ │   Sent: 2 hours ago               │
│  │ 2h ago     │ │                                   │
│  ├────────────┤ │   ────────────────────────         │
│  │ Jane Doe   │ │                                   │
│  │ Subject    │ │   Message content here...          │
│  │ 5h ago     │ │                                   │
│  ├────────────┤ │   ────────────────────────         │
│  │ Mike O.    │ │                                   │
│  │ Subject    │ │   Your Response:                   │
│  │ 1d ago     │ │   [Reply input field         📤]  │
│  └────────────┘ │                                   │
│                 │                                   │
│  Total: 24 msgs │                                   │
│                 │                                   │
└─────────────────┴───────────────────────────────────┘
```

### 5.3 Features

- **Left panel**: Message list sorted by newest first
  - Each item: Sender avatar, name, subject, timestamp, status indicator (unread = red dot)
  - Filter dropdown: All, Unread, Pending, Responded
  - Search by sender name or subject
  
- **Right panel**: Selected conversation
  - Sender info: Name, email, phone, state/LGA/ward/PU
  - Message: Subject, full message text, timestamp
  - Response section: Previous response (if any) + reply input
  - Reply: Text area + Send button
  - Auto-marks message as "read" when opened

- **Responsive**: On mobile, list and detail are separate views (tap to open detail, back to return to list)

### 5.4 MUI Components to Use
- `<Box>` for layout panels
- `<List>`, `<ListItem>`, `<ListItemAvatar>`, `<ListItemText>` for message list
- `<Avatar>` for sender avatars
- `<Badge>` for unread indicators
- `<TextField>` for reply input
- `<Chip>` for status badges
- `<IconButton>` for send
- `<Select>` for filter dropdown
- `<Divider>` between sections

---

## 6. Data Types

```typescript
interface Coordinator {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  designation: string;
  level: 'ward' | 'lga' | 'state' | 'national';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderLocation: {
    state: string;
    lga: string;
    ward: string;
    pollingUnit?: string;
  };
  recipientLevel: 'ward' | 'lga' | 'state' | 'national';
  assignedTo: string;         // Coordinator user ID
  assignedToName: string;
  subject: string;
  message: string;
  status: 'pending' | 'assigned' | 'delivered' | 'read' | 'responded';
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CoordinatorChainResponse {
  coordinators: Coordinator[];
}

interface InboxResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  pages: number;
  unreadCount: number;
}
```

---

## 7. File Summary

### Files to Create

**Frontend**:
| File | Description |
|------|-------------|
| `src/components/chat/ChatWidget.tsx` | Floating chat widget (button + panel) |
| `src/components/chat/CoordinatorList.tsx` | List of user's coordinators |
| `src/components/chat/ConversationView.tsx` | Message thread within widget |
| `src/components/chat/MyMessages.tsx` | User's sent messages view |
| `src/pages/pbx/chat/ChatInboxPage.tsx` | Full coordinator inbox page |
| `src/services/chatService.ts` | Chat API client |

**Server**:
| File | Description |
|------|-------------|
| `server/controllers/chat.controller.js` | Chat controller (coordinator chain + rate limiting) |
| `server/routes/chat.route.js` | Chat routes |

### Files to Modify

| File | Change |
|------|--------|
| `server/server.js` | Mount `/api/chat` routes |
| `src/main.tsx` | Mount ChatWidget globally inside UserProvider |

### Existing Files to Reuse (Do NOT rewrite)

| File | What It Provides |
|------|-----------------|
| `server/controllers/mobile.controller.js` | `sendLeadershipMessage`, `getLeadershipMessages`, `respondToLeadershipMessage`, `markMessageAsRead`, `getMyMessages`, `getUnreadMessageCount` |
| `server/routes/mobile.route.js` | All `/api/mobile/messages/*` endpoints |
| `server/migrations/mobile_app_core.sql` | `leadership_messages` table + auto-routing trigger |

---

## 8. Implementation Order

1. Create `chat.controller.js` + `chat.route.js` on server (new `GET /api/chat/my-coordinators` endpoint + rate limit middleware)
2. Mount routes in `server.js`
3. Create `chatService.ts` frontend service
4. Build `ChatWidget.tsx` with `CoordinatorList.tsx`, `ConversationView.tsx`, `MyMessages.tsx`
5. Mount widget in `main.tsx`
6. Build `ChatInboxPage.tsx` for `/pbx/chat`
7. Test: member sends message → coordinator sees in inbox → coordinator replies → member sees response in widget
