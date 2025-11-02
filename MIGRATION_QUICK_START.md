# Location Format Migration - Quick Start Guide

## What Was Done

### ✅ Phase 1: Helper Functions Created

Added to `StateLGAWardPollingUnits.ts`:

```typescript
// Display formatters (with abbreviations)
getFormattedLGAs(stateName)      → [{ value: "ABA NORTH", label: "01 - ABA NORTH" }]
getFormattedWards(state, lga)    → [{ value: "EZIAMA", label: "01 - EZIAMA" }]
getFormattedPollingUnits(s,l,w)  → [{ value: "ABIA POLY - ABIA POLY I", label: "005 - ABIA POLY - ABIA POLY I" }]

// Individual formatters
formatLGADisplay(lga)            → "01 - ABA NORTH"
formatWardDisplay(ward)          → "01 - EZIAMA"  
formatPollingUnitDisplay(pu)    → "005 - ABIA POLY - ABIA POLY I"

// Conversion helper
convertOldFormatToNew(oldLGA, oldWard) → { lga: "ABA NORTH", ward: "EZIAMA" }
```

### ✅ Phase 1: Migration Scripts Created

**Location**: `server/scripts/migrations/`

1. **`migrateLGAWardFormat.js`** - Converts all DB records to new format
2. **`rollbackLGAWardFormat.js`** - Reverts to old format if needed

---

## What You Need To Do Now

### Step 1: Update Frontend Files (Manual)

These files still import the old `StateLGAWard.ts`:

1. `frontend/src/pages/auth/GetStartedPage.tsx`
2. `frontend/src/pages/auth/AnambraSignupPage.tsx`
3. `frontend/src/pages/profile/EditProfileModal.tsx`
4. `frontend/src/pages/profile/kyc/KYCFormStepPersonalInfo.tsx`
5. `frontend/src/pages/dashboard/elections/monitor/components/PUInfoForm.tsx`
6. `frontend/src/pages/dashboard/admin/AdminDefaultVotingBlocPage.tsx`
7. `frontend/src/services/electionService.ts`

**Find in each file**:
```typescript
import { statesLGAWardList } from '../../utils/StateLGAWard';
```

**Replace with**:
```typescript
import { 
  StateLGAWardPollingUnits, 
  getFormattedLGAs, 
  getFormattedWards,
  getFormattedPollingUnits 
} from '../../utils/StateLGAWardPollingUnits';
```

**Then update the dropdowns** to use formatted options:

#### Example: LGA Dropdown

**Before**:
```tsx
{states.find(s => s.state === selectedState)?.lgas.map(l => (
  <option key={l.lga} value={l.lga}>
    {l.lga}
  </option>
))}
```

**After**:
```tsx
{getFormattedLGAs(selectedState).map(lga => (
  <option key={lga.value} value={lga.value}>
    {lga.label}  {/* Shows: "01 - ABA NORTH" */}
  </option>
))}
```

### Step 2: Test Frontend Changes

```bash
cd frontend
npm run dev
```

Test each updated page:
- [ ] Signup pages show formatted locations with abbreviations
- [ ] Profile edit shows correct locations
- [ ] Dropdowns cascade correctly (State → LGA → Ward → Polling Unit)
- [ ] Saving works and stores only the name (not the abbreviation)

### Step 3: Backup Database

```bash
# On your VPS
pg_dump -h hostname -U username database_name > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Step 4: Run Migration Script

**On development/staging first**:
```bash
cd server
node scripts/migrations/migrateLGAWardFormat.js
```

**Expected Output**:
```
🔄 Starting location data migration...

📊 Migrating users table...
  ✓ users.voting_state: "Abia" → "ABIA" (150 records)
  ✓ users.voting_lga: "aba-north" → "ABA NORTH" (75 records)
  ✓ users.voting_ward: "eziama" → "EZIAMA" (50 records)

📊 Migrating inec_voters table...
  ✓ inec_voters.state: "Anambra" → "ANAMBRA" (1760719 records)
  ✓ inec_voters.lga: "awka-north" → "AWKA NORTH" (120000 records)
  ✓ inec_voters.ward: "achalla" → "ACHALLA" (85000 records)

✅ Migration completed successfully!
📈 Total records updated: 1960994

💾 Backup columns created:
  - backup_old_state
  - backup_old_lga
  - backup_old_ward

🔄 To rollback, run: node scripts/migrations/rollbackLGAWardFormat.js
```

### Step 5: Verify Migration

```bash
# Check a few random records
psql $DB_URI -c "SELECT voting_state, voting_lga, voting_ward, backup_old_voting_lga FROM users LIMIT 5;"

# Should show:
#  voting_state |  voting_lga  | voting_ward |  backup_old_voting_lga
# --------------+--------------+-------------+------------------------
#  ABIA         | ABA NORTH    | EZIAMA      | aba-north
#  ANAMBRA      | AWKA NORTH   | ACHALLA     | awka-north
```

### Step 6: Test Full Application

1. **Location Endpoints** (backend):
   ```bash
   # Should now return UPPERCASE format
   curl http://localhost:5000/api/locations/states
   curl http://localhost:5000/api/locations/states/ANAMBRA/lgas
   ```

2. **Frontend**:
   - [ ] Login with existing user → Profile shows correct locations
   - [ ] Edit profile → Locations display with abbreviations
   - [ ] Create new registration → All location levels work
   - [ ] Election monitoring → Polling units selectable
   - [ ] Communications dashboard → States/LGAs load correctly

### Step 7: If Everything Works

Deploy to production:

```bash
# SSH into production VPS
ssh user@your-vps-ip

# Backup production database
pg_dump $DB_URI > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# Pull latest code
cd /path/to/obidient-movement-pg
git pull origin main

# Run migration
cd server
node scripts/migrations/migrateLGAWardFormat.js

# Rebuild frontend
cd ../frontend
npm run build
sudo cp -r dist/* /var/www/html/

# Restart services
pm2 restart all
```

### Step 8: If Something Goes Wrong

**Rollback database**:
```bash
cd server
node scripts/migrations/rollbackLGAWardFormat.js
```

**Rollback code**:
```bash
git revert HEAD
```

---

## Quick Reference

### Display Format
- **LGA**: `01 - ABA NORTH`
- **Ward**: `01 - EZIAMA`
- **Polling Unit**: `005 - ABIA POLY - ABIA POLY I`

### Database Storage (name only)
- **LGA**: `ABA NORTH`
- **Ward**: `EZIAMA`
- **Polling Unit**: `ABIA POLY - ABIA POLY I`

### Dropdown Implementation
```tsx
<select onChange={e => setSelectedLGA(e.target.value)}>
  {getFormattedLGAs(selectedState).map(lga => (
    <option key={lga.value} value={lga.value}>
      {lga.label}
    </option>
  ))}
</select>
```

---

## Files Changed

### ✅ Already Updated
- `frontend/src/utils/StateLGAWardPollingUnits.ts` - Added helper functions
- `frontend/src/utils/lookups.ts` - Updated export
- `server/scripts/migrations/migrateLGAWardFormat.js` - Created
- `server/scripts/migrations/rollbackLGAWardFormat.js` - Created

### ⏳ Need Manual Update
- `frontend/src/pages/auth/GetStartedPage.tsx`
- `frontend/src/pages/auth/AnambraSignupPage.tsx`
- `frontend/src/pages/profile/EditProfileModal.tsx`
- `frontend/src/pages/profile/kyc/KYCFormStepPersonalInfo.tsx`
- `frontend/src/pages/dashboard/elections/monitor/components/PUInfoForm.tsx`
- `frontend/src/pages/dashboard/admin/AdminDefaultVotingBlocPage.tsx`
- `frontend/src/services/electionService.ts`

---

## Support

Need help? Check:
1. **Full Guide**: `MIGRATION_OLD_TO_NEW_LOCATION_FORMAT.md`
2. **Migration Script**: `server/scripts/migrations/migrateLGAWardFormat.js`
3. **Rollback Script**: `server/scripts/migrations/rollbackLGAWardFormat.js`

---

*Ready to proceed? Start with Step 1 above!* 🚀
