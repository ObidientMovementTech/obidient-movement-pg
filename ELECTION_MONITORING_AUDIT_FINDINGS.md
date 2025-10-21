# Election Monitoring System - Data Flow & Image Upload Audit

## 🔍 AUDIT OVERVIEW

**Date**: October 21, 2025  
**Scope**: Complete end-to-end data flow from monitoring forms to database  
**Focus Areas**: Image uploads, camera capture, data mapping, storage bucket integration

---

## ✅ WHAT'S WORKING

### 1. **Backend Infrastructure**
- ✅ **AWS S3 Integration**: Fully configured in `server/config/aws.js`
- ✅ **Upload Utilities**: `server/utils/s3Upload.js` has:
  - `uploadBufferToS3()` - Uploads file buffers to S3
  - `uploadToS3()` - Main upload function
  - `deleteFromS3()` - Delete functionality
  - `parseFileUpload()` - Busboy middleware for file parsing
- ✅ **CORS Configuration**: S3 CORS properly configured for multiple origins
- ✅ **Existing Upload Endpoints**:
  - `/mobile/feeds/upload-image` - Used for feed images
  - `/admin/upload-banner` - Used for banner images

### 2. **Database Schema**
- ✅ **Polling Unit Submissions Table**: All fields mapped correctly
  - `submission_id`, `monitor_user_id`, `election_id`
  - Location data: `polling_unit_code`, `polling_unit_name`, `ward_name`, `lga_name`, `state_name`
  - `gps_coordinates`, `location_type`, `location_other`
  
- ✅ **Officer Arrival Reports Table**: 
  - `arrival_proof_media` (JSONB) - For arrival photos
  - `officer_names` (JSONB) - For officer data including photos
  - All timing and verification fields

- ✅ **Result Tracking Reports Table**:
  - `ec8a_photo`, `announcement_video`, `wall_photo`, `reporter_selfie` (TEXT fields)
  - `result_announcer_photo` (TEXT)
  - Vote statistics fields: `registered_voters`, `accredited_voters`, `valid_votes`, etc.
  - `votes_per_party` (JSONB) - For party results

- ✅ **Incident Reports Table**:
  - `photo_count`, `video_count`, `has_phone_footage`
  - `media_filenames` (JSONB array)
  - `has_metadata` (BOOLEAN)

### 3. **Form Structure & Data Collection**
- ✅ **PUInfoForm**: Collects all required polling unit data
- ✅ **OfficerArrivalForm**: 3-stage wizard collecting arrival, identity, context
- ✅ **ResultTrackingForm**: 3-stage wizard collecting info, results, evidence
- ✅ **IncidentReportingForm**: 4-stage wizard collecting basics, details, witnesses, escalation

---

## ❌ CRITICAL ISSUES FOUND

### 🚨 **Issue 1: No Image Upload Implementation**

**Problem**: Forms collect `File` objects but DON'T upload them to S3 before submission

**Evidence**:
1. **OfficerArrivalForm** (`INECIdentityVerification.tsx` lines 47-63):
   ```typescript
   const handlePhotoChange = (role: string, file: File | null) => {
     const preview = file ? URL.createObjectURL(file) : undefined;
     setData({
       ...data,
       [role]: {
         ...data[role],
         photo: file,  // ❌ Stores File object, not URL
         preview,
       },
     });
   }
   ```
   - Creates preview with `URL.createObjectURL()`
   - Stores raw `File` object in state
   - **NEVER uploads to S3**

2. **ResultTrackingForm** (`ResultEvidenceUpload.tsx` lines 17-25):
   ```typescript
   const handleFileChange = (name: string, file: File | null) => {
     setFormData((prev: any) => ({
       ...prev,
       resultTracking: {
         ...prev.resultTracking,
         [name]: file,  // ❌ Stores File object, not URL
       },
     }));
   };
   ```
   - Stores `File` objects directly
   - **NEVER uploads to S3**

3. **Backend Expectation** (`monitoring.controller.js`):
   ```javascript
   // Line 248 - Expects STRING URLs, not File objects
   ec8a_photo,
   announcement_video, 
   wall_photo,
   reporter_selfie
   ```
   - Database columns are TEXT (expecting URLs)
   - Form sends `File` objects instead
   - **MISMATCH: Data type incompatibility**

**Impact**: 
- ❌ Images not saved to storage
- ❌ Database receives `[object File]` or undefined instead of URLs
- ❌ Evidence cannot be retrieved or displayed later
- ❌ Critical proof of election integrity lost

---

### 🚨 **Issue 2: Missing Upload Endpoint for Monitoring**

**Problem**: No dedicated endpoint for monitors to upload evidence photos/videos

**Evidence**:
- Existing endpoints only for admin/mobile:
  - `/mobile/feeds/upload-image` (requires admin)
  - `/admin/upload-banner` (requires admin)
- Monitors have NO public upload endpoint
- `monitoringService.ts` has NO `uploadEvidence()` method

**Impact**:
- ❌ Frontend has nowhere to send files
- ❌ Cannot implement proper upload flow

---

### 🚨 **Issue 3: No Camera Capture Functionality**

**Problem**: Forms only support file selection, no direct camera access

**Evidence**:
```typescript
// Current implementation (Result Tracking)
<input
  type="file"
  accept="image/*"
  onChange={(e) => handleFileChange('formPhoto', e.target.files?.[0] || null)}
/>
```

**Issues**:
- Only shows file picker
- On mobile, shows option to "Take Photo" or "Choose File"
- **BUT** no in-app camera UI
- No live preview before capture
- Cannot add camera metadata (GPS, timestamp)

**Better Approach Needed**:
- Use `getUserMedia()` API for in-app camera
- Add `capture="environment"` for direct camera on mobile
- Implement preview-before-upload flow

---

### 🚨 **Issue 4: Data Mapping Inconsistencies**

**Problem**: Form field names don't match backend expectations

**Examples**:

1. **Officer Arrival**:
   - Form sends: `officerNames` (File objects)
   - Backend expects: `officer_names` (JSONB with URLs)
   
2. **Result Tracking**:
   - Form sends: `evidence.ec8aPhoto` (File)
   - Backend expects: `ec8a_photo` (string URL)
   
3. **Incident Report**:
   - Form collects files but backend expects:
     - `media_filenames` (JSONB array of URLs)
     - `photo_count`, `video_count` (integers)
   - Form never calculates counts or uploads files

**Impact**:
- ❌ Data not saved correctly
- ❌ Fields mismatch between frontend/backend
- ❌ Silent failures (data appears to save but doesn't)

---

### 🚨 **Issue 5: No Progress Indicators**

**Problem**: No upload progress UI during large file uploads

**Impact**:
- Poor UX: Users don't know if upload is working
- Users may close form thinking it froze
- No retry mechanism for failed uploads

---

## 🛠️ REQUIRED FIXES

### **Fix 1: Create Monitoring Evidence Upload Endpoint**

**New endpoint needed**: `POST /monitoring/upload-evidence`

```javascript
// server/routes/monitoring.route.js
router.post(
  '/monitoring/upload-evidence',
  protect,
  parseFileUpload('evidence'),
  monitoringController.uploadEvidence
);

// server/controllers/monitoring.controller.js
async uploadEvidence(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    const fileUrl = await uploadToS3(req.file, {
      folder: 'monitoring-evidence'
    });

    res.json({
      success: true,
      data: {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

---

### **Fix 2: Add Upload Service to Frontend**

**New service method needed**:

```typescript
// frontend/src/services/monitoringService.ts

async uploadEvidence(file: File, metadata?: any): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('evidence', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await axios.post(
      `${API_BASE_URL}/monitoring/upload-evidence`,
      formData,
      {
        ...this.getRequestConfig(),
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    );

    return response.data.data.url;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to upload evidence');
  }
}
```

---

### **Fix 3: Update Form Components with Upload Logic**

**Example: INECIdentityVerification.tsx**

```typescript
import { monitoringService } from '../../../../../services/monitoringService';
import { useState } from 'react';

const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

const handlePhotoChange = async (role: string, file: File | null) => {
  if (!file) return;

  try {
    setUploading(true);
    const preview = URL.createObjectURL(file);

    // Upload to S3 immediately
    const photoUrl = await monitoringService.uploadEvidence(file, {
      type: 'officer_photo',
      role: role,
      timestamp: new Date().toISOString()
    });

    // Store the URL (not File object)
    const updated = {
      ...data,
      [role]: {
        ...data[role],
        photo: photoUrl,  // ✅ Store URL instead of File
        preview,
        fileName: file.name
      },
    };

    setData(updated);
    setFormData({
      ...formData,
      officerArrival: {
        ...formData.officerArrival,
        officerNames: updated,
      },
    });
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload photo. Please try again.');
  } finally {
    setUploading(false);
  }
};
```

---

### **Fix 4: Add Camera Capture Component**

**New reusable component**: `CameraCapture.tsx`

```typescript
import { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  label: string;
  accept?: string;
}

export default function CameraCapture({ onCapture, label, accept = 'image/*' }: CameraCaptureProps) {
  const [mode, setMode] = useState<'select' | 'camera'>('select');
  const [preview, setPreview] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Back camera on mobile
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
      
      setMode('camera');
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Cannot access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `capture-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      setPreview(URL.createObjectURL(blob));
      stopCamera();
      onCapture(file);
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setMode('select');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onCapture(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {mode === 'select' && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Take Photo</span>
          </button>

          <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Upload File</span>
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {mode === 'camera' && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              type="button"
              onClick={capturePhoto}
              className="bg-white text-[#006837] px-6 py-2 rounded-full font-medium shadow-lg"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-red-500 text-white p-2 rounded-full shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
        </div>
      )}
    </div>
  );
}
```

---

### **Fix 5: Update Data Mapping in Form Submissions**

**Update `OfficerArrivalForm.tsx`** (final submission):

```typescript
// BEFORE (Incorrect)
const officerArrivalData = {
  submissionId: formData.submissionId,
  officerNames: updatedData.officerArrival.officerNames, // ❌ Contains File objects
  // ... rest
};

// AFTER (Correct)
const officerArrivalData = {
  submissionId: formData.submissionId,
  // Transform officer data to extract URLs
  officerNames: Object.entries(updatedData.officerArrival.officerNames).reduce((acc, [role, data]) => ({
    ...acc,
    [role]: {
      name: data.name,
      photoUrl: data.photo // ✅ Now contains S3 URL string
    }
  }), {}),
  // ... rest
};
```

**Update `ResultTrackingForm.tsx`**:

```typescript
const resultTrackingData = {
  submissionId: formData.submissionId,
  // Map evidence correctly
  ec8aPhoto: updatedData.resultTracking.formPhoto, // ✅ S3 URL
  announcementVideo: updatedData.resultTracking.resultVideo, // ✅ S3 URL
  wallPhoto: updatedData.resultTracking.wallPhoto, // ✅ S3 URL
  reporterSelfie: updatedData.resultTracking.selfieProof, // ✅ S3 URL
  // ... rest
};
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend Tasks
- [ ] Create `/monitoring/upload-evidence` POST endpoint
- [ ] Add `uploadEvidence` controller method
- [ ] Register route in `server/routes/monitoring.route.js`
- [ ] Test upload with Postman (multipart/form-data)
- [ ] Verify S3 bucket permissions for monitoring folder
- [ ] Add file size limits (max 10MB for images, 50MB for videos)
- [ ] Add file type validation (jpg, png, mp4, mov only)

### Frontend Tasks
- [ ] Add `uploadEvidence()` method to `monitoringService.ts`
- [ ] Create `CameraCapture.tsx` reusable component
- [ ] Update `INECIdentityVerification.tsx` with upload logic
- [ ] Update `ResultEvidenceUpload.tsx` with upload logic
- [ ] Update `IncidentDetails.tsx` with upload logic
- [ ] Add upload progress indicators (spinner/progress bar)
- [ ] Add error handling for failed uploads
- [ ] Update data mapping in all form submissions
- [ ] Test on mobile devices (iOS/Android camera access)
- [ ] Add retry logic for failed uploads

### Testing Tasks
- [ ] Test file upload from desktop (Chrome, Firefox, Safari)
- [ ] Test camera capture on mobile (iOS Safari, Android Chrome)
- [ ] Test large file uploads (5MB, 10MB, 20MB)
- [ ] Test simultaneous multiple file uploads
- [ ] Test network error handling (offline, slow connection)
- [ ] Verify S3 URLs are valid and accessible
- [ ] Verify database correctly stores URLs
- [ ] Test evidence retrieval and display

---

## 🎯 PRIORITY ORDER

### **Phase 1: Critical (Must Have) - Week 1**
1. Create upload endpoint
2. Add upload service method
3. Update officer photo upload
4. Update result evidence upload
5. Fix data mapping for submissions

### **Phase 2: Important (Should Have) - Week 2**
1. Add camera capture component
2. Implement upload progress UI
3. Add error handling and retry logic
4. Mobile testing and optimization

### **Phase 3: Nice to Have - Week 3**
1. Image compression before upload
2. Thumbnail generation
3. Batch upload support
4. Offline upload queue

---

## 🚨 CURRENT STATE SUMMARY

| Component | Data Collection | Upload to S3 | Store URL | Status |
|-----------|----------------|--------------|-----------|--------|
| **PU Info** | ✅ Yes | ✅ N/A (no images) | ✅ N/A | ✅ **WORKING** |
| **Officer Photos** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |
| **Arrival Proof** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |
| **EC8A Photo** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |
| **Result Video** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |
| **Wall Photo** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |
| **Incident Media** | ✅ Yes (File objects) | ❌ **NO** | ❌ **NO** | ❌ **BROKEN** |

**Overall Assessment**: 🔴 **CRITICAL ISSUES - Image uploads completely non-functional**

---

## 💡 RECOMMENDATIONS

1. **Immediate**: Implement basic upload endpoint + service method (1-2 days)
2. **Short-term**: Update all forms to use upload service (2-3 days)
3. **Medium-term**: Add camera capture component (3-5 days)
4. **Long-term**: Implement advanced features (compression, offline queue)

**Estimated Total Implementation Time**: 1-2 weeks for full functionality

---

## 📞 NEXT STEPS

Would you like me to:
1. ✅ **Implement the upload endpoint** (backend + frontend service)
2. ✅ **Create the camera capture component**
3. ✅ **Update all form components** with proper upload logic
4. ✅ **Fix data mapping** in form submissions
5. ✅ **Add progress indicators** and error handling

I can start with any of these immediately!
