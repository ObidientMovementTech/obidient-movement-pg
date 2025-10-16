# Bank Account Details Implementation

## Overview
This implementation adds bank account details functionality to the Obidient Movement platform, allowing users to provide their banking information for future payments and reimbursements.

## Database Changes

### Migration File
**Location:** `server/migrations/add_bank_account_details.sql`

Added three new columns to the `users` table:
- `bankName` (VARCHAR 255) - Name of the user's bank
- `bankAccountNumber` (VARCHAR 20) - 10-digit account number
- `bankAccountName` (VARCHAR 255) - Account holder's name

**To apply migration:**
```bash
# Navigate to server directory
cd server

# Run the migration
psql -U your_username -d your_database -f migrations/add_bank_account_details.sql
```

## Backend Changes

### 1. User Model (`server/models/user.model.js`)
**Updates:**
- Added `bankName`, `bankAccountNumber`, and `bankAccountName` parameters to the `create()` method
- Updated INSERT query to include the three new bank fields
- Added bank fields to the `directFields` array in `findByIdAndUpdate()` method

### 2. User Controller (`server/controllers/user.controller.js`)
**Updates:**
- Added bank account fields (`bankName`, `bankAccountNumber`, `bankAccountName`) to the `allowedTopLevelFields` array in `updateMe()` function
- This allows users to update their own bank details via the profile endpoint

### 3. Admin User Management Controller (`server/controllers/adminUserManagement.controller.js`)
**Updates:**

**`updateUserProfile()` function:**
- Added `bankName`, `bankAccountNumber`, and `bankAccountName` to the request body destructuring
- Added conditional update logic for all three bank fields
- Bank fields are updated in the main users table

**`createUser()` function:**
- Added bank account fields to the request body destructuring
- Included bank fields in the INSERT query
- Added bank values to the query parameters array

## Frontend Changes

### 1. TypeScript Interfaces

#### UserProfile Interface (`frontend/src/context/UserContext.tsx`)
Added optional fields:
```typescript
bankName?: string;
bankAccountNumber?: string;
bankAccountName?: string;
```

#### Admin Service Interfaces (`frontend/src/services/adminUserManagementService.ts`)
Updated two interfaces:

**UserProfileUpdate:**
```typescript
bankName?: string;
bankAccountNumber?: string;
bankAccountName?: string;
```

**UserCreation:**
```typescript
bankName?: string;
bankAccountNumber?: string;
bankAccountName?: string;
```

### 2. Edit Profile Modal (`frontend/src/pages/profile/EditProfileModal.tsx`)

**State Management:**
- Added three useState hooks for bank details
- Initialize from profile data in useEffect
- Reset values when modal opens

**Form Fields:**
- Added "Bank Account Details" section with:
  - Bank Name dropdown (using FormSelect with NIGERIAN_BANKS)
  - Account Number input (numeric only, max 10 digits, with validation)
  - Account Name text input
- Validation: Shows warning if account number is not 10 digits

**Save Handler:**
- Included bank fields in the `updatedProfile` object
- Uses `undefined` instead of `null` for TypeScript compatibility

### 3. Admin Create User Modal (`frontend/src/components/modals/AdminCreateUserModal.tsx`)

**Interface:**
- Updated `CreateUserData` interface to include bank account fields

**Form Fields:**
- Added "Bank Account Details (Optional)" section
- Same three fields as Edit Profile Modal
- Positioned before "Admin Options" section
- Includes helpful description text

### 4. Admin Edit User Modal (`frontend/src/components/modals/AdminEditUserModal.tsx`)

**Interfaces:**
- Updated both `User` and `EditModalState` interfaces with bank fields

**State Management:**
- Initialize bank fields from user data in useEffect
- Added to formData state object

**Form Fields:**
- Added "Bank Account Details" section in purple-themed box
- Positioned before "Administrative" section
- Same validation as other modals

**Save Handler:**
- Included bank fields in `updateUserProfile()` API call

### 5. Nigerian Banks Constant (`frontend/src/constants/nigerianBanks.ts`)
**File already existed!** Contains comprehensive list of Nigerian banks including:
- Access Bank
- Guaranty Trust Bank (GTBank)
- First Bank of Nigeria
- United Bank for Africa (UBA)
- Zenith Bank
- And 20+ other major Nigerian banks

## API Endpoints Affected

### User Endpoints
**PATCH `/api/users/me`**
- Users can update their own bank details
- Requires authentication
- Accepts: `bankName`, `bankAccountNumber`, `bankAccountName`

### Admin Endpoints
**POST `/api/admin/users`**
- Create user with bank details
- Requires admin role
- Accepts all bank fields as optional

**PATCH `/api/admin/users/:userId/profile`**
- Update any user's bank details
- Requires admin role
- Accepts: `bankName`, `bankAccountNumber`, `bankAccountName`

## Validation Rules

### Account Number
- **Format:** Numeric only
- **Length:** Exactly 10 digits
- **Validation:** Real-time feedback if length ≠ 10
- **Input:** Automatically strips non-numeric characters

### Bank Name
- **Type:** Dropdown selection
- **Options:** Pre-defined list of Nigerian banks
- **Alphabetically sorted** for easy selection

### Account Name
- **Type:** Free text input
- **Purpose:** Name verification
- **No strict validation** (to accommodate various name formats)

## Security Considerations

1. **Authentication Required:** All bank detail updates require valid user session
2. **Admin Override:** Only admins can modify other users' bank details
3. **Optional Fields:** All bank fields are optional - users not required to provide
4. **No Encryption:** Bank details stored as plain text (consider encryption for production)
5. **Audit Trail:** UpdatedAt timestamp tracks when bank info was last modified

## Future Enhancements

### Recommended Improvements:
1. **Bank Account Verification:** Integrate with Nigerian bank APIs to verify account details
2. **Encryption:** Encrypt bank account numbers at rest
3. **Audit Logging:** Track who updates bank details and when
4. **Multiple Accounts:** Allow users to store multiple bank accounts
5. **Primary Account Flag:** Mark one account as default for payments
6. **Account Verification Status:** Add verified/unverified flag
7. **BVN Integration:** Link to Bank Verification Number for identity confirmation

## Testing Checklist

### Frontend Testing:
- [ ] Edit Profile Modal displays bank fields correctly
- [ ] Admin Create User Modal includes bank fields
- [ ] Admin Edit User Modal shows existing bank data
- [ ] Bank dropdown populates with all Nigerian banks
- [ ] Account number validation works (10 digits)
- [ ] Account number only accepts numeric input
- [ ] Form submission includes bank details
- [ ] Bank fields are optional (form submits without them)
- [ ] Existing users without bank details don't break

### Backend Testing:
- [ ] Migration runs without errors
- [ ] New users can be created with bank details
- [ ] Users can update their own bank details
- [ ] Admins can create users with bank details
- [ ] Admins can update user bank details
- [ ] Bank fields are stored correctly in database
- [ ] Queries including users table don't break
- [ ] API returns bank details in user profile

### Database Testing:
- [ ] Migration adds columns successfully
- [ ] Indexes are created properly
- [ ] Existing records remain intact
- [ ] NULL values handled correctly
- [ ] Column constraints work as expected

## Files Changed

### Database:
- ✅ `server/migrations/add_bank_account_details.sql` (NEW)

### Backend:
- ✅ `server/models/user.model.js`
- ✅ `server/controllers/user.controller.js`
- ✅ `server/controllers/adminUserManagement.controller.js`

### Frontend - Types:
- ✅ `frontend/src/context/UserContext.tsx`
- ✅ `frontend/src/services/adminUserManagementService.ts`

### Frontend - Components:
- ✅ `frontend/src/pages/profile/EditProfileModal.tsx`
- ✅ `frontend/src/components/modals/AdminCreateUserModal.tsx`
- ✅ `frontend/src/components/modals/AdminEditUserModal.tsx`

### Frontend - Constants:
- ✅ `frontend/src/constants/nigerianBanks.ts` (ALREADY EXISTED)

## Deployment Steps

1. **Backup Database:**
   ```bash
   pg_dump -U username database_name > backup_before_bank_details.sql
   ```

2. **Run Migration:**
   ```bash
   cd server
   psql -U username -d database_name -f migrations/add_bank_account_details.sql
   ```

3. **Verify Migration:**
   ```sql
   \d users  -- Check if columns were added
   SELECT "bankName", "bankAccountNumber", "bankAccountName" FROM users LIMIT 1;
   ```

4. **Deploy Backend:**
   ```bash
   # Test locally first
   npm run dev
   
   # Deploy to production
   git add .
   git commit -m "Add bank account details functionality"
   git push origin main
   ```

5. **Deploy Frontend:**
   ```bash
   cd frontend
   npm run build
   # Deploy build to your hosting service
   ```

6. **Test in Production:**
   - Create test user with bank details
   - Update existing user's bank details
   - Verify admin can manage bank details
   - Confirm data persists correctly

## Support for Payments

This implementation provides the foundation for:
- **Volunteer Reimbursements:** Pay call center volunteers
- **Stipends:** Compensate coordinators and agents
- **Refunds:** Process refunds for members
- **Incentives:** Reward active community members
- **Bulk Payments:** Export bank details for bulk payment processing

## Notes

- All bank fields are **optional** - users can skip this section
- Bank details only visible to user themselves and admins
- No payment processing implemented yet - this is data collection only
- Consider compliance with Nigerian data protection regulations
- May need CBN (Central Bank of Nigeria) approval for payment processing

---

**Implementation Date:** October 16, 2025  
**Status:** ✅ Complete - Ready for Migration  
**Breaking Changes:** None - Fully backward compatible
