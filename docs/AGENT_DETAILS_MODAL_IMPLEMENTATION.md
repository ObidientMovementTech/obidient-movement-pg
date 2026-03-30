# Agent Details Modal Implementation

## Overview
Added interactive agent details viewing to the OnboardingDashboard. Users can now click on agent counts in the coverage table to view detailed information about agents at specific locations.

## Features Implemented

### Frontend Changes (`/frontend/src/pages/dashboard/admin/OnboardingDashboard.tsx`)

1. **New State Variables**
   - `showAgentModal`: Controls modal visibility
   - `selectedLocation`: Stores the location context (State/LGA/Ward/PU)
   - `agentDetails`: Array of agent data
   - `isLoadingAgents`: Loading state for API call

2. **New Function: `fetchAgentDetails(location)`**
   - Accepts location object with `votingState`, `votingLGA`, `votingWard`, `votingPU`
   - Calls `/auth/onboarding/agents` API endpoint
   - Handles loading states and errors
   - Stores agent data in state

3. **Interactive Agent Count**
   - Converted agent count badge from static `<span>` to clickable `<button>`
   - Added hover effects for better UX
   - Disabled state when agent count is 0
   - Triggers `fetchAgentDetails()` on click

4. **Agent Details Modal UI**
   - **Header**: Purple gradient with location breadcrumb and close button
   - **Loading State**: Spinner with "Loading agent details..." message
   - **Empty State**: User icon with "No agents found" message
   - **Agent Cards Grid**: 2-column responsive grid (1 column on mobile)
   
5. **Agent Card Display**
   Each card shows:
   - Profile image (or purple circle with user icon if no image)
   - Name (large, bold)
   - Designation (purple text)
   - Phone number (clickable `tel:` link)
   - Email (clickable `mailto:` link)
   - Support Group (with label)
   - Username (with label)
   
6. **Modal Footer**
   - Shows total agent count summary
   - Purple background for visual consistency

### Backend Changes

#### Controller (`/server/controllers/onboarding.controller.js`)

**New Function: `getAgentsByLocation`**
- **Purpose**: Fetch agents filtered by voting location
- **Authentication**: Requires `verifyToken` middleware
- **Authorization**: National Coordinator, State Coordinator, LGA Coordinator
- **Query Parameters**:
  - `votingState` (optional)
  - `votingLGA` (optional)
  - `votingWard` (optional)
  - `votingPU` (optional)

**SQL Query**:
```sql
SELECT 
  id,
  name,
  phone,
  email,
  username,
  "profileImage",
  support_group,
  designation,
  "votingState",
  "votingLGA",
  "votingWard",
  "votingPU"
FROM users
WHERE designation = 'Polling Unit Agent'
  AND [location filters]
ORDER BY name ASC
```

**Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "John Doe",
      "phone": "+2348012345678",
      "email": "john@example.com",
      "username": "johndoe",
      "profileImage": "https://...",
      "support_group": "Group A",
      "designation": "Polling Unit Agent",
      "votingState": "Lagos",
      "votingLGA": "Ikeja",
      "votingWard": "Ward 1",
      "votingPU": "PU 001"
    }
  ],
  "count": 1
}
```

#### Routes (`/server/routes/onboarding.routes.js`)

**New Route**:
```javascript
router.get(
  '/agents',
  verifyToken,
  authorize(['National Coordinator', 'State Coordinator', 'LGA Coordinator']),
  getAgentsByLocation
);
```

- **Endpoint**: `GET /auth/onboarding/agents`
- **Access**: Admin only (National, State, LGA Coordinators)
- **Location**: Placed after `/stats` route in ADMIN ROUTES section

## User Flow

1. Admin navigates to Onboarding Dashboard
2. Views coverage table with agent counts per location
3. Clicks on an agent count badge (e.g., "5 agents")
4. Modal opens showing:
   - Location breadcrumb (State • LGA • Ward • PU)
   - Loading spinner (brief)
   - Grid of agent cards with full details
5. Can click phone numbers to call or emails to compose message
6. Clicks X button or outside modal to close
7. Can click another location's agent count to view different agents

## Technical Details

### API Call Pattern
```typescript
const params = new URLSearchParams({
  votingState: location.votingState,
  votingLGA: location.votingLGA,
  votingWard: location.votingWard,
  votingPU: location.votingPU
});

const response = await axios.get(
  `${API_URL}/auth/onboarding/agents?${params.toString()}`,
  { withCredentials: true }
);
```

### Database Filtering
- Uses case-insensitive matching with `UPPER(TRIM(...))`
- Filters are additive (all provided parameters are AND-ed)
- Only returns Polling Unit Agents
- Ordered alphabetically by name

### Performance Considerations
- Minimal data fetched (only necessary fields)
- Loading state prevents multiple simultaneous requests
- Clean error handling with console logging
- Lightweight modal (no heavy dependencies)

## Files Modified

1. `/frontend/src/pages/dashboard/admin/OnboardingDashboard.tsx`
   - Added icon imports (X, User, Phone, Mail, Users)
   - Added state management for modal
   - Created fetchAgentDetails function
   - Made agent count clickable
   - Added complete modal UI

2. `/server/controllers/onboarding.controller.js`
   - Added getAgentsByLocation function (83 lines)
   - Includes comprehensive error handling and logging

3. `/server/routes/onboarding.routes.js`
   - Imported getAgentsByLocation
   - Added /agents route with proper authentication

## Testing Checklist

- [ ] Click agent count opens modal
- [ ] Location breadcrumb displays correctly
- [ ] Loading spinner shows during API call
- [ ] Agent cards display all fields correctly
- [ ] Profile images load (or show default icon)
- [ ] Phone numbers are clickable (tel: links)
- [ ] Email addresses are clickable (mailto: links)
- [ ] Empty state shows when no agents found
- [ ] Close button works
- [ ] Can open modal for different locations
- [ ] Modal responsive on mobile devices
- [ ] Admin permissions enforced on backend
- [ ] SQL injection protection via parameterized queries

## Security Features

✅ Authentication required (verifyToken middleware)
✅ Role-based authorization (only coordinators)
✅ Parameterized SQL queries (no SQL injection)
✅ CORS enabled with credentials
✅ Error messages sanitized (no sensitive data leaked)

## Future Enhancements (Optional)

- Add search/filter within modal
- Export agent list to CSV
- Send bulk SMS/email to agents at location
- Show agent status (active/inactive)
- Display last login timestamp
- Add agent contact history
- Pagination for large agent lists

## Deployment Notes

- No database migrations required (uses existing schema)
- No environment variables needed
- Server restart required to load new route
- Frontend will hot-reload automatically in dev mode
- Test with actual admin account credentials

---

**Implementation Date**: January 2025  
**Status**: ✅ Complete and Ready for Testing
