# Quick Onboarding Mode - Feature Documentation

## Overview
The Quick Onboarding Mode is designed for bulk user registration, particularly for mass onboarding in specific regions like Anambra. This feature automates several fields to speed up the registration process while maintaining full editability.

## Location
**Component:** `frontend/src/components/modals/AdminCreateUserModal.tsx`

## Features

### 1. Auto-Generated Email from Name
When Quick Onboarding Mode is enabled:
- **Input:** User's full name (e.g., "Jane Obiora", "Peter Mogono Eze")
- **Output:** Auto-generated email (e.g., "janeobiora@obidients.com", "petermogonoeze@obidients.com")
- **Logic:**
  - Removes all special characters and spaces
  - Converts to lowercase
  - Appends "@obidients.com" domain
  - Updates in real-time as name is typed
  - Only auto-updates if email is empty or already an @obidients.com address

### 2. Default Password
- Automatically sets password to **"123456"** when quick mode is enabled
- Visual indicator shows "(Default: 123456)"
- Field remains editable for custom passwords
- Field is highlighted with green background when using default

### 3. Default Voting State
- Automatically sets voting state to **"Anambra"** when quick mode is enabled
- Visual indicator shows "(Default: Anambra)"
- Dropdown remains editable for other states
- Field is highlighted with green background when using default

### 4. Visual Indicators
All auto-filled fields show:
- **Green background** (bg-green-50)
- **Green border** (border-green-300)
- **Label indicator** showing "(Auto-generated)" or "(Default: X)"

## User Interface

### Toggle Checkbox
Located at the top of the form in a green-highlighted section:
```
☑ Quick Onboarding Mode (Anambra Bulk Registration)
Automatically sets: Email (from name), Password (123456), and Voting State (Anambra).
All fields remain editable.

✓ Quick mode active - Enter name to auto-generate email
```

### Highlighted Fields
When quick mode is active:
1. **Email Field**: Shows "(Auto-generated)" label, green background
2. **Password Field**: Shows "(Default: 123456)" label, green background
3. **Voting State**: Shows "(Default: Anambra)" label, green background

## Functions

### `generateEmailFromName(name: string): string`
Converts a full name to an email address.
- Removes non-alphabetic characters (except spaces)
- Removes all spaces
- Converts to lowercase
- Appends "@obidients.com"

### `handleNameChange(newName: string): void`
Handles name input changes:
- Updates the name field
- Auto-generates email if in quick mode
- Only updates email if it's empty or an @obidients.com address

### `handleQuickOnboardingToggle(enabled: boolean): void`
Toggles quick onboarding mode:
- **When enabled:** Sets password to "123456", state to "anambra", generates email from name
- **When disabled:** Clears auto-filled values (except manually edited emails)

## State Management

### New State Variable
```typescript
const [quickOnboardingMode, setQuickOnboardingMode] = useState(false);
```

### Form Data Updates
When quick mode is toggled on:
```typescript
{
  password: '123456',
  votingState: 'anambra',
  email: generateEmailFromName(formData.name)
}
```

## Use Cases

### Primary Use Case: Anambra Bulk Registration
1. Admin enables Quick Onboarding Mode
2. For each user, admin only needs to enter:
   - Full name (email auto-generates)
   - Phone number
   - Other optional details
3. Password, email, and voting state are pre-filled
4. Admin can override any auto-filled value if needed

### Example Workflow
```
1. Check "Quick Onboarding Mode"
2. Enter name: "Chukwudi Okafor"
   → Email auto-fills: "chukwudiokafor@obidients.com"
   → Password auto-fills: "123456"
   → Voting State auto-fills: "Anambra"
3. Enter phone: "+2348012345678"
4. Select gender, LGA, ward, etc.
5. Click "Create User"
```

## Advantages

1. **Speed**: Reduces typing by auto-generating email and setting defaults
2. **Consistency**: All Anambra users get consistent email format and default password
3. **Flexibility**: All fields remain fully editable
4. **Visual Feedback**: Green highlighting shows which fields are auto-filled
5. **Smart Updates**: Email only updates if it's an @obidients.com address or empty
6. **Error Prevention**: Reduces typos in email addresses

## Technical Details

### Email Generation Logic
```typescript
const cleanName = name
  .toLowerCase()
  .replace(/[^a-z\s]/g, '')  // Remove non-alphabetic except spaces
  .trim()
  .replace(/\s+/g, '');      // Remove all spaces

return `${cleanName}@obidients.com`;
```

### Smart Email Update
Email only updates automatically if:
- Quick onboarding mode is enabled AND
- Current email is empty OR ends with "@obidients.com"

This prevents overwriting manually entered email addresses.

## Testing Scenarios

### Test 1: Basic Quick Mode
1. Enable quick mode
2. Enter name: "Jane Doe"
3. Verify email: "janedoe@obidients.com"
4. Verify password: "123456"
5. Verify state: "anambra"

### Test 2: Name with Multiple Words
1. Enable quick mode
2. Enter name: "John Peter Smith Jr."
3. Verify email: "johnpetersmithjr@obidients.com" (no spaces, no special chars)

### Test 3: Manual Email Override
1. Enable quick mode
2. Enter name: "Jane Doe"
3. Change email to: "jane.doe@custom.com"
4. Change name to: "Jane Smith"
5. Verify email stays: "jane.doe@custom.com" (not overwritten)

### Test 4: Disable Quick Mode
1. Enable quick mode
2. Auto-fill happens
3. Disable quick mode
4. Verify auto-filled values are cleared (except manually edited emails)

### Test 5: Field Editability
1. Enable quick mode
2. Verify all auto-filled fields can be manually edited
3. Make changes to password, email, state
4. Verify changes are retained

## Future Enhancements

Potential improvements:
1. Add more region-specific presets (e.g., Lagos, Rivers)
2. Allow custom email domain configuration
3. Add bulk CSV import with quick mode
4. Remember last used quick mode setting
5. Add quick mode templates for different regions

## Related Files
- `frontend/src/components/modals/AdminCreateUserModal.tsx` - Main implementation
- `frontend/src/components/modals/AdminEditUserModal.tsx` - Could add similar feature
- `frontend/src/services/adminUserManagementService.ts` - API integration

## Changelog

### Version 1.0 (Current)
- ✅ Quick onboarding mode toggle
- ✅ Auto-generate email from name
- ✅ Default password (123456)
- ✅ Default voting state (Anambra)
- ✅ Visual indicators for auto-filled fields
- ✅ Smart email update logic
- ✅ Full field editability maintained
