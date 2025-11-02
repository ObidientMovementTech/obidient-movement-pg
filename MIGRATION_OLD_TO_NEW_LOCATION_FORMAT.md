# Migration Guide: StateLGAWard → StateLGAWardPollingUnits

## Overview
Migrating from old location format (lowercase-hyphenated) to new format (UPPERCASE SPACE with abbreviations and polling units).

---

## Changes Made

### 1. New Helper Functions Added to `StateLGAWardPollingUnits.ts`

```typescript
// Format display names with abbreviations
formatLGADisplay(lga) → "01 - ABA NORTH"
formatWardDisplay(ward) → "01 - EZIAMA"
formatPollingUnitDisplay(pu) → "005 - ABIA POLY - ABIA POLY I"

// Get formatted lists for dropdowns (returns { value, label, abbreviation })
getFormattedLGAs(stateName)
getFormattedWards(stateName, lgaName)
getFormattedPollingUnits(stateName, lgaName, wardName)

// Convert old format to new
convertOldFormatToNew(oldLGA, oldWard) → { lga: "ABA NORTH", ward: "EZIAMA" }
```

### 2. Format Differences

| Aspect | Old Format | New Format |
|--------|-----------|------------|
| **State** | `"Abia"` (Title Case) | `"ABIA"` (UPPERCASE) |
| **LGA** | `"aba-north"` (lowercase-hyphen) | `"ABA NORTH"` (UPPERCASE SPACE) |
| **Ward** | `"eziama"` (lowercase) | `"EZIAMA"` (UPPERCASE) |
| **Polling Unit** | ❌ Not available | ✅ `"ABIA POLY - ABIA POLY I"` |
| **Display** | `"aba-north"` | `"01 - ABA NORTH"` (with abbreviation) |
| **DB Storage** | `"aba-north"` | `"ABA NORTH"` (name only, no abbreviation) |

---

## Files That Need Manual Updates

### Priority 1: Forms with Location Selection

1. **`frontend/src/pages/auth/GetStartedPage.tsx`**
   - Currently imports `statesLGAWardList` from old file
   - Update to use `getFormattedLGAs()` and `getFormattedWards()`
   
2. **`frontend/src/pages/auth/AnambraSignupPage.tsx`**
   - Same as above
   
3. **`frontend/src/pages/profile/EditProfileModal.tsx`**
   - Uses old format, has manual conversion logic
   - Replace with new helpers
   
4. **`frontend/src/pages/profile/kyc/KYCFormStepPersonalInfo.tsx`**
   - Update location dropdowns

5. **`frontend/src/pages/dashboard/elections/monitor/components/PUInfoForm.tsx`**
   - Add polling unit selection with `getFormattedPollingUnits()`

6. **`frontend/src/pages/dashboard/admin/AdminDefaultVotingBlocPage.tsx`**
   - Update location dropdowns

### Priority 2: Services

7. **`frontend/src/services/electionService.ts`**
   - Update any location formatting logic

---

## Database Migration Script

Run this script to normalize existing records:

```bash
cd server
node scripts/migrations/migrateLGAWardFormat.js
```

### What the Migration Does:

1. **Converts State Names**: `"Abia"` → `"ABIA"`
2. **Converts LGA Names**: `"aba-north"` → `"ABA NORTH"`
3. **Converts Ward Names**: `"eziama"` → `"EZIAMA"`
4. **Adds Polling Unit**: Attempts to match from `polling_unit_code` if available
5. **Creates Backup**: Saves old values before updating

### Records Affected:
- `users` table: `voting_state`, `voting_lga`, `voting_ward`, `voting_polling_unit`
- `inec_voters` table: `state`, `lga`, `ward`, `polling_unit`
- `personal_info` table: `voting_state`, `voting_lga`, `voting_ward` (if exists)
- Any other tables with location data

---

## Testing Checklist

### Before Migration
- [ ] Backup database
- [ ] Test migration script on staging environment
- [ ] Verify all old format → new format conversions are correct

### After Migration
- [ ] All states display as UPPERCASE
- [ ] All LGAs display with abbreviation (e.g., "01 - ABA NORTH")
- [ ] All wards display with abbreviation (e.g., "01 - EZIAMA")
- [ ] Polling units are selectable where applicable
- [ ] Existing user profiles show correct locations
- [ ] New registrations save in correct format
- [ ] Location filters work correctly

### UI Verification
- [ ] Signup page displays formatted locations
- [ ] Profile edit shows correct locations
- [ ] KYC form has all location levels
- [ ] Election monitoring has polling unit selection
- [ ] Admin pages display locations correctly

---

## Rollback Plan

If issues occur:

1. **Database Rollback**:
   ```sql
   -- Restore from backup_old_format column
   UPDATE users 
   SET voting_lga = backup_old_voting_lga 
   WHERE backup_old_voting_lga IS NOT NULL;
   ```

2. **Code Rollback**:
   ```bash
   git revert <commit-hash>
   ```

---

## Timeline

1. **Phase 1** (30 mins): Update helper functions ✅
2. **Phase 2** (2 hours): Update all frontend files to use new format
3. **Phase 3** (1 hour): Test on development environment
4. **Phase 4** (30 mins): Run database migration on staging
5. **Phase 5** (1 hour): Test all features on staging
6. **Phase 6** (30 mins): Run database migration on production
7. **Phase 7** (ongoing): Monitor for issues

---

## Example Usage

### Before (Old Format):
```tsx
import { statesLGAWardList } from "./StateLGAWard";

const lgas = statesLGAWardList.find(s => s.state === "Abia")?.lgas || [];
// Returns: [{ lga: "aba-north", wards: [...] }]
```

### After (New Format):
```tsx
import { getFormattedLGAs } from "./StateLGAWardPollingUnits";

const lgas = getFormattedLGAs("ABIA");
// Returns: [{ value: "ABA NORTH", label: "01 - ABA NORTH", abbreviation: "01" }]

// For saving to DB:
await saveUser({ voting_lga: selectedLGA.value }); // Saves "ABA NORTH"

// For display:
<option value={lga.value}>{lga.label}</option> // Shows "01 - ABA NORTH"
```

---

## Support

If you encounter issues:
1. Check console for error messages
2. Verify database migration completed successfully
3. Confirm all imports are updated
4. Check that DB values match new format (UPPERCASE SPACE)

---

*Last Updated: November 2, 2025*
