# Bank Account Details - getCurrentUser Update

## Summary
Updated the authentication system to include bank account details when fetching the current user's profile.

## Files Modified

### 1. Auth Controller (`server/controllers/auth.controller.js`)
**Function:** `getCurrentUser`

**Changes Made:**
- Added three bank account fields to the `userResponse` object:
  - `bankName`
  - `bankAccountNumber`
  - `bankAccountName`

**Location in Response:**
- Positioned after voting/personal info fields
- Before designation and assignment fields
- Included in the flattened response structure

**Code Added:**
```javascript
// Bank account details
bankName: user.bankName,
bankAccountNumber: user.bankAccountNumber,
bankAccountName: user.bankAccountName,
```

### 2. User Model (`server/models/user.model.js`)
**Function:** `findByIdSelect`

**Changes Made:**
- Added bank account fields to the SELECT query when excluding `passwordHash`
- Ensures bank details are fetched from the database when user profile is requested

**Fields Added to SELECT Query:**
```javascript
"bankName", "bankAccountNumber", "bankAccountName"
```

## API Endpoint

### GET `/api/auth/me`
**Description:** Returns the current logged-in user's complete profile

**Authentication:** Required (JWT token in cookie or Authorization header)

**Response Structure:**
```json
{
  "user": {
    "_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "emailVerified": true,
    "twoFactorEnabled": false,
    "profileImage": "https://...",
    "role": "user",
    "kycStatus": "approved",
    
    "userName": "johndoe",
    "gender": "Male",
    "ageRange": "25-34",
    "citizenship": "Nigerian Citizen",
    "countryCode": "+234",
    "stateOfOrigin": "Lagos",
    "votingState": "Lagos",
    "votingLGA": "Ikeja",
    "votingWard": "Ward 1",
    "votingPU": "PU 001",
    "isVoter": "Yes",
    "willVote": "Yes",
    
    "bankName": "Guaranty Trust Bank (GTBank)",
    "bankAccountNumber": "0123456789",
    "bankAccountName": "John Doe",
    
    "designation": "Community Member",
    "assignedState": null,
    "assignedLGA": null,
    "assignedWard": null,
    
    "personalInfo": {},
    "onboardingData": {},
    "notificationPreferences": {},
    "notificationSettings": {},
    
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Data Flow

1. **Frontend Request:**
   - User logs in or app loads
   - Frontend calls `GET /api/auth/me`
   - JWT token sent in cookie or Authorization header

2. **Backend Processing:**
   - Middleware validates JWT token
   - Extracts `userId` from token
   - Calls `User.findByIdSelect(userId, ["passwordHash"])`

3. **Database Query:**
   - Model queries users table with all fields EXCEPT passwordHash
   - Includes new bank account fields in SELECT
   - Returns user object with bank details

4. **Response Formation:**
   - Controller formats user data
   - Includes bank account fields in response
   - Sends JSON response to frontend

5. **Frontend Reception:**
   - UserContext receives complete profile
   - Bank details available throughout app
   - EditProfileModal can display existing bank info

## Security Considerations

### Current Implementation:
- ✅ Bank details only returned for authenticated users
- ✅ Users can only see their own bank details via this endpoint
- ✅ Password hash explicitly excluded from response
- ✅ HTTPS enforced in production (via NODE_ENV check)

### Recommendations:
1. **Field-Level Authorization:**
   - Consider admin-only access for viewing other users' bank details
   - Mask account numbers (show last 4 digits only) in some contexts

2. **Audit Logging:**
   - Log when bank details are viewed
   - Track who accesses sensitive financial information

3. **Encryption:**
   - Encrypt bank account numbers at rest in database
   - Decrypt only when needed for payments

4. **Rate Limiting:**
   - Limit frequency of profile fetches
   - Prevent abuse of endpoint to harvest bank data

## Testing

### Manual Testing:
1. **Test with Bank Details:**
   ```bash
   # Login as user with bank details
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}' \
     -c cookies.txt
   
   # Fetch current user
   curl -X GET http://localhost:5000/api/auth/me \
     -b cookies.txt
   
   # Verify bank fields in response
   ```

2. **Test without Bank Details:**
   ```bash
   # Login as user without bank details (legacy user)
   # Verify no errors, fields should be null/undefined
   ```

3. **Test Unauthorized Access:**
   ```bash
   # Try accessing without token
   curl -X GET http://localhost:5000/api/auth/me
   # Should return 401 Unauthorized
   ```

### Automated Testing:
```javascript
describe('GET /api/auth/me', () => {
  it('should return user with bank details', async () => {
    const user = await createTestUser({
      bankName: 'GTBank',
      bankAccountNumber: '0123456789',
      bankAccountName: 'Test User'
    });
    
    const token = generateToken(user.id);
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `cu-auth-token=${token}`)
      .expect(200);
    
    expect(response.body.user.bankName).toBe('GTBank');
    expect(response.body.user.bankAccountNumber).toBe('0123456789');
    expect(response.body.user.bankAccountName).toBe('Test User');
  });
  
  it('should return user without bank details (legacy)', async () => {
    const user = await createTestUser(); // No bank details
    
    const token = generateToken(user.id);
    
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `cu-auth-token=${token}`)
      .expect(200);
    
    expect(response.body.user.bankName).toBeUndefined();
  });
});
```

## Integration Points

### Frontend Components Using This Endpoint:
1. **UserContext** (`frontend/src/context/UserContext.tsx`)
   - Fetches on app load
   - Stores in global state
   - Provides to all components

2. **EditProfileModal** (`frontend/src/pages/profile/EditProfileModal.tsx`)
   - Reads bank details from UserContext
   - Pre-populates form fields
   - Allows user to update

3. **Profile Pages**
   - Display bank information (if needed)
   - Show account verification status

4. **Admin Dashboard**
   - View user bank details (separate admin endpoint)
   - Process payments

## Migration Path

### For Existing Users:
1. Migration adds columns with NULL defaults
2. Existing users have NULL bank details
3. `getCurrentUser` returns `null` for bank fields
4. Frontend handles gracefully (empty form fields)
5. Users can add bank details via Edit Profile

### No Breaking Changes:
- Response structure expanded, not modified
- All new fields are optional
- Existing functionality unchanged
- Frontend backward compatible

## Monitoring

### Metrics to Track:
- **Adoption Rate:** % of users with bank details filled
- **Update Frequency:** How often users update bank info
- **Error Rates:** Failed fetches or parsing errors
- **Performance:** Response time with additional fields

### Logging:
```javascript
// Add in getCurrentUser function
logger.info('User profile fetched', {
  userId: user.id,
  hasBankDetails: !!(user.bankName && user.bankAccountNumber),
  timestamp: new Date().toISOString()
});
```

## Rollback Plan

If issues arise, revert these changes:

1. **Remove from auth.controller.js:**
   ```javascript
   // Comment out or remove these lines:
   bankName: user.bankName,
   bankAccountNumber: user.bankAccountNumber,
   bankAccountName: user.bankAccountName,
   ```

2. **Remove from user.model.js:**
   ```javascript
   // Remove from SELECT query:
   "bankName", "bankAccountNumber", "bankAccountName"
   ```

3. **Database:**
   ```sql
   -- Optional: Remove columns (loses data!)
   ALTER TABLE users 
   DROP COLUMN "bankName",
   DROP COLUMN "bankAccountNumber", 
   DROP COLUMN "bankAccountName";
   ```

## Next Steps

1. ✅ Deploy changes to staging
2. ✅ Run integration tests
3. ✅ Test with real user accounts
4. ✅ Monitor error logs for issues
5. ✅ Deploy to production
6. ⏳ Add encryption for bank account numbers
7. ⏳ Implement bank verification API
8. ⏳ Add audit logging for bank detail access

---

**Updated:** October 16, 2025  
**Status:** ✅ Complete  
**Breaking Changes:** None  
**Database Migration Required:** Yes (already created)
