# Monitoring System Enhancement - Phases 1-3 Complete

## Overview
Comprehensive implementation of monitoring system security and UX improvements to ensure all monitoring submissions are restricted to the user's assigned polling unit, regardless of their coordinator level.

## Implementation Summary

### Phase 1: Enhanced Middleware with Designation + Location Validation ✅

**File**: `server/routes/monitoring.route.js`

**Changes**:
1. Added `MONITORING_DESIGNATIONS` array with 6 eligible designations:
   - National Coordinator
   - State Coordinator
   - LGA Coordinator
   - Ward Coordinator
   - Polling Unit Agent
   - Vote Defender

2. Enhanced `requireActiveMonitorKey` middleware to validate:
   - User designation is in eligible list
   - Monitor key exists and status is 'active'
   - Monitoring location data is available

3. Implemented fallback mechanism:
   - Primary: `monitoring_location` JSONB field
   - Fallback: `votingState`, `votingLGA`, `votingWard`, `votingPU` fields

4. Attached `req.monitoringScope` with:
   - `state`, `lga`, `ward`, `pollingUnit`
   - `level` (national, state, lga, ward, polling_unit)
   - `designation` (user's role)
   - `source` (monitoring_location or voting_fields)

**Security Impact**: Only users with eligible designations and active keys can access monitoring routes.

---

### Phase 2: Polling Unit Validation for All Submissions ✅

**File**: `server/controllers/monitoring.controller.js`

**Changes**:
1. Created `validatePollingUnitMatch()` helper function:
   - Normalizes PU codes/names (uppercase, trim)
   - Compares submitted PU against `req.monitoringScope.pollingUnit`
   - Returns detailed validation result with error messages

2. Applied validation to all 4 submission endpoints:
   - **submitPollingUnitInfo** (line ~70): Validates `puCode` and `puName`
   - **submitOfficerArrival** (line ~250): Validates `location.puCode` and `location.puName`
   - **submitResultTracking** (line ~440): Validates `location.puCode` and `location.puName`
   - **submitIncidentReport** (line ~650): 
     - For linked incidents: Validates against base submission PU
     - For standalone incidents: Validates `location.puCode` and `location.puName`

3. Returns 403 Forbidden with details if validation fails:
```json
{
  "success": false,
  "message": "You can only submit data for your assigned polling unit",
  "details": {
    "submittedPU": "001A",
    "assignedPU": "002B",
    "source": "monitoring_location"
  }
}
```

**Security Impact**: National Coordinators, State Coordinators, and all other levels can ONLY submit for their specifically assigned polling unit. Prevents unauthorized cross-PU submissions.

---

### Phase 3: Dashboard UI Updates to Display Monitoring Location ✅

**Files**: 
- `frontend/src/components/MonitoringDashboard.tsx`
- `frontend/src/services/monitoringService.ts`

**Changes**:

1. **Type Definition Update** (`monitoringService.ts`):
   - Added `monitoringScope` to `MonitoringStatus` interface
   - Includes all location fields with labels
   - Source indicator (monitoring_location vs voting_fields)

2. **Monitoring Scope Info Card** (`MonitoringDashboard.tsx`):
   - Displays prominently after existing Polling Unit Info Card
   - Shows 4-column grid with State, LGA, Ward, Polling Unit
   - Color-coded badge: Green for "Official Assignment" (monitoring_location), Blue for "Profile Data" (voting_fields)
   - Shows monitoring level and designation at bottom
   - Responsive design with dark mode support

3. **Submission Restriction Notice**:
   - Blue alert box before the forms grid
   - Clear message: "All monitoring submissions are restricted to your assigned polling unit"
   - Shows assigned PU name/code prominently
   - Emphasizes restriction applies regardless of coordinator level

4. **Icon Import**:
   - Added `AlertCircle` from lucide-react for notices
   - Added `MapPin` for location context

**UX Impact**: Users immediately see their assigned location and understand submission restrictions before attempting to fill forms.

---

## Data Flow

### 1. Authentication & Authorization
```
User Login → protect middleware → requireActiveMonitorKey
                                          ↓
                            Check designation → Check key_status
                                          ↓
                            Parse monitoring_location (or fallback)
                                          ↓
                            Attach req.monitoringScope → Next()
```

### 2. Status API Response
```json
{
  "success": true,
  "data": {
    "needsPUSetup": false,
    "puInfo": { "pu_code": "001A", "pu_name": "Ward A PU 001" },
    "monitoringScope": {
      "state": "Lagos",
      "stateLabel": "Lagos State",
      "lga": "Ikeja",
      "lgaLabel": "Ikeja LGA",
      "ward": "Ward A",
      "wardLabel": "Ward A",
      "pollingUnit": "001A",
      "pollingUnitLabel": "Ward A PU 001",
      "level": "polling_unit",
      "designation": "Polling Unit Agent",
      "source": "monitoring_location"
    },
    "formStatuses": { ... }
  }
}
```

### 3. Submission Validation
```
Form Submit → Controller validation → validatePollingUnitMatch()
                                              ↓
                        Compare normalized PU codes/names
                                              ↓
                        Match? → Continue | Mismatch? → 403 Forbidden
```

---

## Testing Checklist

### Backend Testing
- [ ] Test with user having `monitoring_location` JSONB data
- [ ] Test with user having only voting fields (fallback scenario)
- [ ] Test with ineligible designation (should get 403)
- [ ] Test with inactive key_status (should get 403)
- [ ] Test polling unit validation for each submission type:
  - [ ] Polling Unit Info
  - [ ] Officer Arrival
  - [ ] Result Tracking
  - [ ] Incident Reporting (both linked and standalone)
- [ ] Test National Coordinator attempting cross-PU submission (should fail)

### Frontend Testing
- [ ] Verify Monitoring Scope card displays correctly
- [ ] Check source badge color (green for monitoring_location, blue for voting_fields)
- [ ] Verify restriction notice appears
- [ ] Test dark mode styling
- [ ] Test responsive layout on mobile
- [ ] Verify labels display properly when available

---

## Database Considerations

### Current State
- `users.monitoring_location` is JSONB, may be NULL for existing users
- Fallback to `votingState`, `votingLGA`, `votingWard`, `votingPU` works
- Active monitoring users should have one or the other

### Recommended Migration (Optional)
Consider running a migration to populate `monitoring_location` for active monitors:

```sql
UPDATE users
SET monitoring_location = jsonb_build_object(
  'state', "votingState",
  'stateCode', "votingState",
  'lga', "votingLGA",
  'lgaCode', "votingLGA",
  'ward', "votingWard",
  'wardCode', "votingWard",
  'pollingUnit', "votingPU",
  'pollingUnitCode', "votingPU",
  'pollingUnitName', "votingPU"
)
WHERE key_status = 'active'
  AND monitoring_location IS NULL
  AND "votingState" IS NOT NULL
  AND "votingLGA" IS NOT NULL
  AND "votingWard" IS NOT NULL
  AND "votingPU" IS NOT NULL;
```

---

## Security Guarantees

### Access Control
✅ Only users with eligible designations can access monitoring routes
✅ Only users with active monitoring keys can submit data
✅ Middleware enforces location validation before any submission

### Data Integrity
✅ All submissions validate against assigned polling unit
✅ Coordinators cannot submit for other polling units
✅ Cross-PU submissions return 403 with detailed error messages
✅ Validation is case-insensitive and handles whitespace

### Audit Trail
✅ `scope_snapshot` JSONB in submissions captures full scope at submission time
✅ `source` field indicates whether data came from monitoring_location or voting_fields
✅ Detailed error messages log submission attempts with mismatched PUs

---

## Next Steps

### Optional Enhancements
1. **Bulk Assignment Tool**: Admin interface to assign monitoring_location to multiple users
2. **Location History**: Track changes to monitoring assignments over time
3. **Coordinator Dashboard**: Allow coordinators to view (but not submit for) their subordinates' data
4. **Analytics**: Dashboard showing submission coverage by state/LGA/ward/PU
5. **Mobile App Sync**: Ensure mobile app respects same polling unit restrictions

### Documentation
- [x] Create comprehensive implementation document (this file)
- [ ] Update API_DOCUMENTATION.md with new monitoringScope fields
- [ ] Update TESTING_GUIDE.md with monitoring validation tests
- [ ] Add examples to QUICKSTART.md for monitoring location setup

---

## Files Modified

### Backend
1. `server/routes/monitoring.route.js` - Enhanced middleware with designation + location validation
2. `server/controllers/monitoring.controller.js` - Added validatePollingUnitMatch and applied to all submissions
3. `server/services/monitoringService.js` - Already returned monitoringScope in status (no changes needed)

### Frontend
1. `frontend/src/components/MonitoringDashboard.tsx` - Added Monitoring Scope card and restriction notice
2. `frontend/src/services/monitoringService.ts` - Added monitoringScope to MonitoringStatus interface

### Documentation
1. `MONITORING_SYSTEM_ANALYSIS.md` - Created comprehensive analysis document
2. `MONITORING_PHASE_123_COMPLETE.md` - This implementation summary (new)

---

## Support & Troubleshooting

### Common Issues

**Issue**: User gets "No polling unit assigned to your account"
- **Cause**: Both monitoring_location and voting fields are NULL/incomplete
- **Solution**: Ensure user has either monitoring_location JSONB or all voting fields populated

**Issue**: User gets 403 "Not authorized for monitoring"
- **Cause**: Designation not in MONITORING_DESIGNATIONS array
- **Solution**: Update user designation to one of the 6 eligible values

**Issue**: User gets 403 "Invalid monitoring key"
- **Cause**: key_status is not 'active'
- **Solution**: Activate user's monitoring key: `UPDATE users SET key_status = 'active' WHERE id = ?`

**Issue**: Submissions fail with polling unit mismatch
- **Cause**: Form data contains different PU than user's assigned PU
- **Solution**: User can only submit for their assigned PU - verify assignment is correct

---

## Conclusion

All three phases of the monitoring system enhancement are complete:
- ✅ **Phase 1**: Middleware enforces designation, key, and location requirements
- ✅ **Phase 2**: All submission endpoints validate polling unit match
- ✅ **Phase 3**: Dashboard displays monitoring location prominently with restrictions

The system now provides strong guarantees that monitoring data can only be submitted by authorized users for their specifically assigned polling units, regardless of their coordinator level.
