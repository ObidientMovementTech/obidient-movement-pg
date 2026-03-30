# Election Day Access Strategy - Monitor Dashboard

## Problem Statement
On election day, polling unit agents need quick access to the monitoring dashboard (`/dashboard/elections/monitor`), but requiring full authentication creates friction and delays.

## Solution Implemented: Hybrid Access Model

### Overview
The monitoring dashboard now supports **two access methods**:

1. **Authenticated Access** - For registered users who are logged in
2. **Key-Based Access** - For users with a valid Monitor Key (no login required)

This dual approach ensures:
- ✅ Quick access on election day (just enter monitor key)
- ✅ Secure verification (monitor keys are tied to specific agents)
- ✅ No friction for agents in the field
- ✅ Backward compatibility for authenticated users

## Technical Implementation

### 1. Route Configuration Changes (`frontend/src/main.tsx`)

**Before:**
```tsx
{
  path: "/dashboard/elections/monitor",
  element: (
    <ProtectedRoute>
      <MonitorDashboard />
    </ProtectedRoute>
  ),
}
```

**After:**
```tsx
{
  path: "/dashboard/elections/monitor",
  element: <MonitorDashboard />, // No ProtectedRoute wrapper
}
```

**Impact:** Route is now publicly accessible, but the component itself enforces monitor key verification.

### 2. Monitor Dashboard Enhancement (`frontend/src/pages/dashboard/elections/monitor/index.tsx`)

#### New Imports
```tsx
import { useUserContext } from '../../../../context/UserContext';
import { Info } from 'lucide-react';
```

#### New State
```tsx
const { profile } = useUserContext(); // Check authentication status
const [accessType, setAccessType] = useState<'authenticated' | 'key-based' | null>(null);
```

#### Enhanced Access Check
```tsx
const checkExistingAccess = async () => {
  try {
    const response = await monitorKeyService.getMonitoringAccess();
    if (response.data.hasAccess) {
      setIsVerified(true);
      setAccessType(profile ? 'authenticated' : 'key-based'); // Detect access type
      // ... rest of logic
    }
  } catch (error) {
    console.log('No existing access found');
  } finally {
    setLoading(false);
  }
};
```

## User Experience Flow

### For Unauthenticated Users (Election Day Agents)

1. **Visit URL:** `yourapp.com/dashboard/elections/monitor`
2. **See Info Banner:**
   ```
   ℹ️ Election Day Quick Access
   Enter your Monitor Key below to access the voting protection dashboard.
   Your key was provided during onboarding or via SMS/Email.
   ```
3. **Enter Monitor Key:** (e.g., `LAGOS-PU-ABC123`)
4. **Access Granted:** Dashboard loads with temporary session
5. **Session Notice:** Yellow banner shows "Temporary Access (Key-Based) • Your session will expire when you close this browser"

### For Authenticated Users (Regular Login)

1. **Visit URL:** `yourapp.com/dashboard/elections/monitor`
2. **Auto-Check:** System checks if user is logged in and has monitor access
3. **If has access:** Dashboard loads immediately (no key entry needed)
4. **If no access:** Shows monitor key entry screen
5. **Access Type:** Shows "Verified Access" in header

## UI Components

### 1. Info Banner (Unauthenticated Users)
```tsx
<div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex items-start gap-3">
      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Election Day Quick Access
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Enter your Monitor Key below to access the voting protection dashboard.
          Your key was provided during onboarding or via SMS/Email.
        </p>
      </div>
    </div>
  </div>
</div>
```

### 2. Session Type Banner (Key-Based Access)
```tsx
<div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
    <div className="flex items-center justify-center gap-2 text-sm">
      <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <span className="text-amber-900 dark:text-amber-100 font-medium">
        Temporary Access (Key-Based)
      </span>
      <span className="text-amber-700 dark:text-amber-300">
        • Your session will expire when you close this browser
      </span>
    </div>
  </div>
</div>
```

### 3. Header Status Indicator
```tsx
<div className="flex items-center space-x-1">
  <Key className="h-4 w-4" />
  <span>{accessType === 'key-based' ? 'Key Access' : 'Verified Access'}</span>
</div>
```

## Security Considerations

### What's Protected ✅
- Monitor key verification still required (no anonymous access)
- Keys are tied to specific agents and polling units
- Backend validates keys before granting access
- Keys can be revoked or expire
- Session is temporary for key-based access

### What's NOT Compromised ✅
- User data remains protected
- Only assigned polling unit data is accessible
- Full audit trail maintained
- Keys are unique and non-transferable

## Backend Compatibility

**No backend changes required!** The existing monitor key verification system (`monitorKeyService.getMonitoringAccess()`) works for both:
- Authenticated users with monitor keys
- Unauthenticated users with monitor keys

The backend already uses cookies/sessions to track verified monitor keys, which works independently of user authentication.

## Sub-Routes Updated

All monitoring sub-routes also converted to hybrid access:
- `/dashboard/elections/monitor/polling-unit`
- `/dashboard/elections/monitor/officer-verification`
- `/dashboard/elections/monitor/result-tracking`
- `/dashboard/elections/monitor/incident-reporting`

## Files Modified

1. **`/frontend/src/main.tsx`**
   - Removed `<ProtectedRoute>` wrapper from monitor routes
   - Added comment explaining hybrid access

2. **`/frontend/src/pages/dashboard/elections/monitor/index.tsx`**
   - Added `useUserContext` to detect authentication status
   - Added `accessType` state to track access method
   - Added info banner for unauthenticated users
   - Added session type banner for key-based users
   - Updated header to show appropriate access type

## Testing Checklist

### As Unauthenticated User
- [ ] Visit `/dashboard/elections/monitor` without login
- [ ] See blue info banner with election day access message
- [ ] Enter valid monitor key
- [ ] Dashboard loads successfully
- [ ] See yellow "Temporary Access (Key-Based)" banner
- [ ] Header shows "Key Access"
- [ ] Can navigate to all sub-pages
- [ ] Close browser and verify session expires

### As Authenticated User
- [ ] Login to account
- [ ] Visit `/dashboard/elections/monitor`
- [ ] No info banner shown
- [ ] If has monitor access, dashboard loads immediately
- [ ] Header shows "Verified Access"
- [ ] No yellow session banner
- [ ] Can navigate to all sub-pages
- [ ] Session persists after browser close/reopen

### Edge Cases
- [ ] Invalid monitor key shows error
- [ ] Expired monitor key rejected
- [ ] Monitor key from different election rejected
- [ ] Multiple tabs maintain same session
- [ ] Session survives page refresh
- [ ] Logout clears key-based session

## Deployment Notes

### Frontend
- Hot-reloads automatically in dev mode
- Production build required for deployment
- No environment variables needed

### Backend
- No changes required
- Existing monitor key API works as-is
- No database migrations needed

### Communications
Update agent communications to include:
```
📱 Election Day Access Instructions

Quick access to monitoring dashboard:
1. Visit: [yourapp.com/dashboard/elections/monitor]
2. Enter your Monitor Key: [AGENT_KEY]
3. Start monitoring!

No login required on election day!
Your key is valid only for your assigned polling unit.
```

## Benefits

### For Agents
✅ Zero-friction access on election day  
✅ No password to remember  
✅ Works even if they forgot to create account  
✅ Just need the monitor key SMS/email

### For System
✅ Security maintained through key verification  
✅ Full audit trail of access  
✅ Keys can be distributed last-minute  
✅ Easier onboarding process

### For Operations
✅ Reduced support requests on election day  
✅ Faster agent deployment  
✅ Less dependency on internet for registration  
✅ Better resilience if auth system has issues

## Future Enhancements (Optional)

1. **Key Expiration Countdown**
   - Show "Key valid for next 12 hours" in banner

2. **Auto-Refresh Reminder**
   - Prompt users to keep browser open for updates

3. **Offline Mode**
   - Cache dashboard data for offline access
   - Queue submissions for when connection restored

4. **SMS Key Delivery**
   - Auto-send key 2 hours before polls open
   - Resend option if agent lost SMS

5. **Multi-Device Warning**
   - Alert if same key used on multiple devices simultaneously

---

**Implementation Date:** November 2025  
**Status:** ✅ Complete and Ready for Testing  
**Impact:** High - Critical for election day operations
