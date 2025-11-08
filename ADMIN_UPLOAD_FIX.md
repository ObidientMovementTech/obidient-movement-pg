# Admin Manual Result Upload - Image Upload Fix

## Problem
When uploading EC8A images in the manual result upload page, admins were seeing the error:
```
"Your designation is not eligible for monitoring access"
```

## Root Cause
The `CombinedResultForm` component was using `monitoringService.uploadEvidence()` which calls the `/monitoring/upload-evidence` endpoint. This endpoint has middleware (`requireActiveMonitorKey`) that checks:
1. User has eligible designation (National Coordinator, State Coordinator, etc.)
2. User has an active monitoring key
3. User's monitoring scope matches the submission

Admins performing manual uploads don't need monitoring keys since they're uploading on behalf of agents.

## Solution

### 1. Created Admin Upload Endpoint
**File**: `/server/controllers/adminManualResult.controller.js`
- Added `uploadAdminEvidence` function
- Bypasses monitoring key validation
- Uses admin authentication only (`protect` + `isAdmin` middleware)

**File**: `/server/routes/admin.route.js`
- Added route: `POST /api/admin/upload-evidence`
- Protected with `protect` and `isAdmin` middleware
- Uses `parseFileUpload('evidence')` middleware for S3 upload

### 2. Updated CombinedResultForm Component
**File**: `/frontend/src/pages/dashboard/elections/monitor/components/stages/result-tracking/CombinedResultForm.tsx`

Added:
- `useAdminUpload?: boolean` prop (defaults to `false`)
- Conditional upload logic in `handleFileUpload()`:
  - If `useAdminUpload === true`: Uses `/api/admin/upload-evidence`
  - If `useAdminUpload === false`: Uses `/api/monitoring/upload-evidence` (existing behavior)

### 3. Updated ManualResultUploadPage
**File**: `/frontend/src/pages/dashboard/admin/ManualResultUploadPage.tsx`
- Passes `useAdminUpload={true}` to `CombinedResultForm`
- This ensures all evidence uploads use the admin endpoint

## Files Modified

### Backend
1. `/server/controllers/adminManualResult.controller.js`
   - Added `uploadAdminEvidence` controller function

2. `/server/routes/admin.route.js`
   - Imported `uploadAdminEvidence`
   - Added route: `router.post('/upload-evidence', protect, isAdmin, parseFileUpload('evidence'), uploadAdminEvidence)`

### Frontend
3. `/frontend/src/pages/dashboard/elections/monitor/components/stages/result-tracking/CombinedResultForm.tsx`
   - Added `useAdminUpload` prop to interface
   - Added axios import for admin upload
   - Modified `handleFileUpload()` to support both upload methods
   - Added conditional logic based on `useAdminUpload` flag

4. `/frontend/src/pages/dashboard/admin/ManualResultUploadPage.tsx`
   - Added `useAdminUpload={true}` prop to CombinedResultForm

## How It Works

### For Regular Monitors (existing behavior)
```typescript
<CombinedResultForm 
  onNext={handleSubmit}
  formData={formData}
  setFormData={setFormData}
  // useAdminUpload defaults to false
/>
// Uses: /api/monitoring/upload-evidence (requires monitoring key)
```

### For Admin Manual Upload (new behavior)
```typescript
<CombinedResultForm 
  onNext={handleSubmit}
  formData={formData}
  setFormData={setFormData}
  useAdminUpload={true}
/>
// Uses: /api/admin/upload-evidence (requires admin role only)
```

## Testing
1. Login as admin
2. Navigate to Situation Room → Manual Result Upload
3. Select election and location
4. Click "Continue to Result Entry"
5. Upload EC8A image
6. Should see "Evidence uploaded successfully" ✅
7. Submit the form
8. Verify result appears in live results dashboard

## Security
- Admin upload endpoint is protected by both `protect` and `isAdmin` middleware
- Only users with admin role can upload via this endpoint
- Maintains same S3 upload security as monitoring endpoint
- File validation handled by `parseFileUpload` middleware

## Backward Compatibility
✅ Existing monitor result tracking flow unchanged
✅ Regular monitors still use monitoring endpoint with key validation
✅ Only admin manual upload uses new admin endpoint
