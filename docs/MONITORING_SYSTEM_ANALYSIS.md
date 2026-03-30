# Monitoring System - Current Structure Analysis

## Overview
This document analyzes the current monitoring dashboard authentication and data flow to prepare for alignment with the new `monitoring_location` JSON field structure.

---

## Current Authentication & Access Control

### Database Schema (users table)
```sql
- monitor_unique_key: varchar(20) - Unique monitoring key
- key_status: varchar(20) - Status of key (active/inactive/expired)
- key_assigned_date: timestamp - When key was assigned
- monitoring_location: JSONB - JSON object with location details
```

### Current Access Check (middleware)
**Location**: `server/routes/monitoring.route.js` (lines 12-38)

```javascript
const requireActiveMonitorKey = async (req, res, next) => {
  // Checks ONLY:
  // 1. User has monitor_unique_key
  // 2. key_status === 'active'
  
  // Does NOT check monitoring_location JSON structure
}
```

**Applied to**: ALL monitoring routes via `router.use(requireActiveMonitorKey)`

---

## Monitoring Location JSON Structure

### From Database Screenshot
```json
{
  "lga": "AWKA NORTH",
  "ward": "MGBAKWU I (ANEZIKE)",
  "level": "polling_unit",
  "state": "ANAMBRA",
  "source": "profile",
  "designation": "Polling Unit Agent",
  "pollingUnit": "AMAUDALA V SQUARE",
  "pollingUnitLabel": "AMAUDALA V SQUARE"
}
```

### Scope Levels (from monitoringScope.js)
- `national` - National Coordinator
- `state` - State Coordinator
- `lga` - LGA Coordinator
- `ward` - Ward Coordinator
- `polling_unit` - Polling Unit Agent / Vote Defender

---

## Current Data Flow

### 1. Monitoring Status Endpoint
**Route**: `GET /monitoring/status`  
**Controller**: `monitoring.controller.js::getMonitoringStatus`  
**Service**: `monitoringService.getMonitoringStatus(userId)`

**Current Logic**:
```javascript
async getMonitoringStatus(userId) {
  // 1. Get user record including monitoring_location
  const user = await query(`SELECT monitoring_location, votingState, ... FROM users WHERE id = $1`);
  
  // 2. Parse monitoring_location JSON
  let scope = parseMonitoringScope(user.monitoring_location);
  
  // 3. If null, derive from user profile fields (votingState, votingLGA, etc.)
  if (!scope) {
    scope = deriveMonitoringScopeFromUser(user);
  }
  
  // 4. Check if PU setup is completed
  const puCheck = await this.checkPUCompletion(userId);
  
  // 5. Get form submission stats
  const stats = await query(`SELECT submission_type, COUNT(*) FROM monitor_submissions WHERE user_id = $1 GROUP BY submission_type`);
  
  // 6. Return status object
  return {
    needsPUSetup: boolean,
    monitoringScope: scope,
    puInfo: {...},
    formStatuses: {
      pollingUnit: { completed, count, lastUpdated },
      officerArrival: { completed, count, lastUpdated },
      resultTracking: { completed, count, lastUpdated },
      incidentReporting: { completed, count, lastUpdated }
    }
  };
}
```

### 2. Form Submission Workflow
**Tables**: `monitor_submissions`

```sql
CREATE TABLE monitor_submissions (
  id SERIAL PRIMARY KEY,
  submission_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  submission_type VARCHAR(50) NOT NULL,
  election_id INTEGER REFERENCES elections(id),
  polling_unit_code VARCHAR(50),
  scope_snapshot JSONB,  -- Snapshot of monitoring_location at submission time
  submission_data JSONB,
  attachments TEXT[],
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Submission Types**:
- `polling_unit_info`
- `officer_arrival`
- `result_tracking`
- `incident_report`

---

## Scope Derivation Logic

### parseMonitoringScope()
**Location**: `server/utils/monitoringScope.js`

```javascript
// Parses monitoring_location JSONB field
// Returns structured scope object or null if invalid
export const parseMonitoringScope = (locationJson) => {
  if (!locationJson || typeof locationJson !== 'object') {
    return null;
  }
  
  // Validates and returns scope structure
  return {
    level: locationJson.level,
    designation: locationJson.designation,
    state: locationJson.state,
    lga: locationJson.lga,
    ward: locationJson.ward,
    pollingUnit: locationJson.pollingUnit,
    // ... other fields
  };
};
```

### deriveMonitoringScopeFromUser()
**Fallback when monitoring_location is null**

```javascript
// Uses legacy profile fields as fallback:
// - designation
// - votingState / assignedState
// - votingLGA / assignedLGA
// - votingWard / assignedWard
// - votingPU / pollingUnit

// Maps designation to scope level:
const ELIGIBLE_DESIGNATIONS = new Map([
  ['National Coordinator', 'national'],
  ['State Coordinator', 'state'],
  ['LGA Coordinator', 'lga'],
  ['Ward Coordinator', 'ward'],
  ['Polling Unit Agent', 'polling_unit'],
  ['Vote Defender', 'polling_unit'],
]);
```

---

## Frontend Components

### MonitoringDashboard.tsx
**Location**: `frontend/src/components/MonitoringDashboard.tsx`

**Current Props**:
```typescript
interface MonitoringDashboardProps {
  userInfo: any;  // Not actually used!
  elections: any[];
}
```

**Data Loading**:
```typescript
useEffect(() => {
  loadDashboardData();
}, []);

const loadDashboardData = async () => {
  const [statusData, submissionsData] = await Promise.all([
    monitoringService.getMonitoringStatus(),  // Fetches from /monitoring/status
    monitoringService.getRecentSubmissions(5)
  ]);
  
  setStatus(statusData);
  setRecentSubmissions(submissionsData);
};
```

**Display Logic**:
- Shows PU info card if `status.puInfo` exists
- Shows 4 monitoring sections (cards)
- Shows recent activity feed

### Monitoring Service (Frontend)
**Location**: `frontend/src/services/monitoringService.ts`

```typescript
class MonitoringService {
  async getMonitoringStatus(): Promise<MonitoringStatus> {
    const response = await axios.get(
      `${API_BASE_URL}/monitoring/status`,
      { withCredentials: true }
    );
    return response.data.data;
  }
  
  async checkMonitoringAccess() {
    const response = await axios.get(
      `${API_BASE_URL}/monitor-key/access`,
      { withCredentials: true }
    );
    return response.data.hasActiveKey;
  }
}
```

---

## Issues & Alignment Needed

### 1. **Authentication Gaps**
- ✅ Checks `monitor_unique_key` exists
- ✅ Checks `key_status === 'active'`
- ❌ Does NOT validate `monitoring_location` JSON structure
- ❌ Does NOT verify location scope matches user's assignment

### 2. **Data Inconsistency**
- `monitoring_location` can be null
- Falls back to legacy profile fields (votingState, votingLGA, etc.)
- No guarantee these match the JSON when both exist

### 3. **Scope Validation Missing**
- User can submit for ANY location
- No validation that submission matches their monitoring_location scope
- Example: Ward Coordinator could submit PU-level data

### 4. **Access Control**
Currently:
```
monitor_unique_key EXISTS + key_status = 'active' 
→ Full monitoring access
```

Should be:
```
monitor_unique_key EXISTS 
+ key_status = 'active' 
+ monitoring_location JSON valid
+ submission scope matches user's monitoring_location
→ Restricted monitoring access per scope
```

---

## Proposed Alignment Strategy

### Phase 1: Strengthen Access Middleware
1. Update `requireActiveMonitorKey` to also validate `monitoring_location`
2. Add scope extraction and validation
3. Attach validated scope to `req.monitoringScope`

### Phase 2: Update Form Submission Validation
1. Before accepting submissions, verify:
   - Submission location matches user's monitoring_location scope
   - User has authority for that level (national can submit for any, PU agent only for their PU)

### Phase 3: Update Dashboard Display
1. Show monitoring_location prominently
2. Display scope level and restrictions
3. Hide/disable forms outside user's scope

### Phase 4: Data Migration
1. Ensure all users with active keys have valid monitoring_location JSON
2. Populate from legacy fields if missing
3. Add database constraints to prevent null monitoring_location when key_status = 'active'

### Phase 5: Frontend Adjustments
1. Update MonitoringDashboard to show scope-based restrictions
2. Add visual indicators for accessible vs restricted areas
3. Update forms to auto-populate from monitoring_location

---

## Next Steps

1. **Review and approve** this alignment strategy
2. **Identify priority** - which phase to tackle first?
3. **Define exact validation rules** for each scope level
4. **Plan database migrations** for existing users
5. **Update frontend UI** to reflect new scope-based access

---

## Questions to Address

1. **Scope Inheritance**: Can National Coordinators submit at all levels?
2. **Multi-Location**: Can a user have multiple monitoring_location entries?
3. **Key Lifecycle**: When key expires, what happens to monitoring_location?
4. **Submission Editing**: Can users edit submissions after initial submit?
5. **Offline Support**: How to validate scope when offline?

---

*Analysis Date: November 4, 2025*  
*Generated for: Obidient Movement Election Monitoring System*
