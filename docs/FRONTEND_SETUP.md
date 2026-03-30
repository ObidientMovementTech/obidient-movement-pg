# Frontend Setup Guide - Bulk Communications

## 📦 What Was Built

You now have a complete, production-ready admin UI for the bulk communications system!

### Components Created

```
frontend/src/
├── services/
│   └── communicationsService.ts          # API client with typed functions
└── pages/dashboard/admin/
    ├── CommunicationsPage.tsx             # Main router component
    └── communications/
        ├── CommunicationsLayout.tsx       # Layout with tab navigation
        ├── DashboardPage.tsx              # Stats & recent campaigns
        ├── CampaignsListPage.tsx          # All campaigns with filters
        ├── CampaignDetailsPage.tsx        # Real-time campaign monitoring
        ├── CreateSMSCampaignPage.tsx      # SMS campaign creation form
        ├── CreateVoiceCampaignPage.tsx    # Voice campaign creation form
        └── AudioAssetsPage.tsx            # Audio upload & management
```

---

## ✅ Features Implemented

### **Dashboard** (`/communications`)
- 📊 Overview stats (total campaigns, recipients, delivery rate, total spend)
- 📈 Recent campaigns list with quick access
- 🚀 Quick action buttons to create campaigns

### **Campaigns List** (`/communications/campaigns`)
- 📋 Table view of all campaigns
- 🔍 Search by campaign title
- 🏷️ Filter by type (SMS/Voice/All)
- 📊 Progress bars for delivery rates
- 🔄 Real-time refresh button

### **Campaign Details** (`/communications/campaigns/:id`)
- 📈 Real-time progress tracking
- 📊 Delivery statistics (sent/delivered/failed/cost)
- 🎯 Target LGA list
- ⏱️ Timeline (created/started/completed)
- 🛑 Cancel button for active campaigns
- 🔄 Auto-refresh every 5 seconds for active campaigns

### **Create SMS Campaign** (`/communications/create/sms`)
- 📝 Campaign title input
- 🗺️ Multi-select LGA checkboxes (20 Lagos LGAs)
- 💬 Message template with variable support
- 📏 Character counter (SMS parts calculator)
- 👁️ Live preview with example data
- ✅ Form validation

### **Create Voice Campaign** (`/communications/create/voice`)
- 📝 Campaign title input
- 🗺️ Multi-select LGA checkboxes
- 🎵 Audio file selection from uploaded assets
- 🔗 Fallback audio URL option
- ▶️ In-form audio preview
- 🔗 Quick link to upload new audio

### **Audio Assets** (`/communications/audio`)
- ⬆️ Drag-and-drop file upload
- 📁 File type & size validation (10MB max)
- 🎵 List of uploaded audio files
- ▶️ In-browser audio playback
- 📊 File metadata (duration, upload date)
- 🔄 Refresh list

---

## 🎨 UI/UX Highlights

- ✅ **Consistent Design**: Matches existing admin pages (AdminBroadcastPage style)
- ✅ **Responsive**: Mobile-friendly layouts
- ✅ **Loading States**: Spinners for async operations
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Real-time Updates**: Auto-refresh for active campaigns
- ✅ **Status Badges**: Color-coded campaign statuses
- ✅ **Progress Bars**: Visual delivery tracking
- ✅ **Icon Usage**: Lucide React icons throughout
- ✅ **Tailwind CSS**: Utility-first styling

---

## 🔌 Integration Points

### API Service (`communicationsService.ts`)

All backend endpoints are wrapped in typed TypeScript functions:

```typescript
// SMS
createSMSCampaign({ title, lgas, messageTemplate })

// Voice
createVoiceCampaign({ title, lgas, audioAssetId, fallbackAudioUrl })

// Campaigns
getCampaigns(type?)              // List all or filter by type
getCampaignById(id)               // Get detailed stats
cancelCampaign(id)                // Cancel active campaign

// Audio
uploadAudioAsset(file)            // Upload audio file
getAudioAssets()                  // List uploaded files

// Dashboard
getDashboardStats()               // Aggregate statistics
```

### TypeScript Types

All API responses are fully typed:
- `CommunicationCampaign`
- `AudioAsset`
- `CampaignStats`
- `DashboardStats`
- `CreateSMSCampaignRequest`
- `CreateVoiceCampaignRequest`

---

## 🚀 How to Use

### 1. **Connect Routes**

Update your main app router to include the communications routes:

```tsx
// In your app router (e.g., App.tsx or routes.tsx)
import CommunicationsPage from "./pages/dashboard/admin/CommunicationsPage";

// Add this route:
<Route 
  path="/dashboard/admin/communications/*" 
  element={<CommunicationsPage />} 
/>
```

### 2. **Add Navigation Link**

Add a link in your admin dashboard sidebar/menu:

```tsx
<Link to="/dashboard/admin/communications">
  <MessageSquare className="w-5 h-5" />
  Communications
</Link>
```

### 3. **Environment Variables**

Ensure `VITE_API_BASE_URL` is set in your `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📋 User Workflows

### **Create SMS Campaign**
1. Navigate to "Create SMS" tab
2. Enter campaign title
3. Select target LGAs (or "Select All")
4. Write message template with variables: `{{first_name}}`, `{{last_name}}`, `{{phone_number}}`
5. Preview message
6. Click "Create & Send Campaign"
7. Redirected to campaign details page
8. Watch real-time progress

### **Create Voice Campaign**
1. Navigate to "Create Voice" tab
2. Enter campaign title
3. Select target LGAs
4. Choose uploaded audio file (or upload new one)
5. Optionally provide fallback URL
6. Preview audio
7. Click "Create & Start Calling"
8. Monitor progress in real-time

### **Monitor Campaigns**
1. Navigate to "All Campaigns" tab
2. Use search/filter to find campaigns
3. Click campaign title to view details
4. See real-time stats (auto-refreshes every 5s)
5. Cancel if needed

### **Manage Audio**
1. Navigate to "Audio Assets" tab
2. Select audio file (MP3/WAV/OGG, max 10MB)
3. Click "Upload"
4. Preview uploaded files
5. Use in voice campaigns

---

## 🔒 Security

- ✅ All API calls use `withCredentials: true` (cookie-based auth)
- ✅ Admin-only access (relies on backend auth middleware)
- ✅ Form validation before submission
- ✅ File type & size validation for uploads

---

## 🎯 Testing Checklist

### **Before Going Live:**

- [ ] Test SMS campaign creation with 1-2 LGAs
- [ ] Verify message template variable replacement
- [ ] Test voice campaign creation
- [ ] Upload and preview audio files
- [ ] Monitor campaign progress in real-time
- [ ] Test campaign cancellation
- [ ] Verify delivery stats update correctly
- [ ] Test responsive design on mobile
- [ ] Check error handling (invalid inputs, API failures)
- [ ] Verify audio playback in browser

---

## 🐛 Troubleshooting

### **"Failed to load campaigns"**
- Check API server is running (`npm start` in `server/`)
- Verify `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors

### **"Not authorized" errors**
- Ensure user is logged in as admin
- Check cookie is being sent (`withCredentials: true`)
- Verify backend auth middleware

### **Audio upload fails**
- Check file size (max 10MB)
- Verify file type (audio/*)
- Check server upload endpoint `/api/communications/audio-assets`

### **Campaigns not appearing**
- Ensure backend is connected to database
- Check server logs for errors
- Verify campaigns table has data

### **Real-time updates not working**
- Campaign details auto-refresh every 5s for active campaigns
- Check browser console for API errors
- Manually click "Refresh" button

---

## 📊 Performance Optimization

### **Current Setup:**
- Auto-refresh only for active campaigns (status: processing/pending)
- 5-second polling interval (adjustable)
- Assets fetched once on page load
- Audio files loaded lazily via `<audio>` tags

### **Future Enhancements:**
- WebSocket for real-time updates (eliminate polling)
- Infinite scroll for campaigns list
- Batch audio uploads
- Campaign templates/presets
- Scheduled campaigns
- A/B testing support

---

## 🎨 Customization

### **Update LGA List**

Edit the `AVAILABLE_LGAS` array in:
- `CreateSMSCampaignPage.tsx`
- `CreateVoiceCampaignPage.tsx`

```tsx
const AVAILABLE_LGAS = [
  "Your LGA 1",
  "Your LGA 2",
  // ... add more
];
```

### **Change Refresh Interval**

In `CampaignDetailsPage.tsx`, line ~45:

```tsx
const interval = setInterval(() => {
  // ...
}, 5000); // Change 5000 to your desired ms
```

### **Customize Colors**

All Tailwind classes can be changed:
- SMS: `green-*` classes
- Voice: `blue-*` classes
- Audio: `purple-*` classes

---

## 📚 Dependencies

Required packages (already in your project):
- `react-router-dom` - Routing
- `axios` - API calls
- `lucide-react` - Icons
- `date-fns` - Date formatting

---

## 🎉 Summary

You now have:
- ✅ 7 fully functional React components
- ✅ Complete API integration layer
- ✅ TypeScript types for all data
- ✅ Real-time campaign monitoring
- ✅ Audio upload & management
- ✅ Form validation & error handling
- ✅ Responsive, professional UI

**Next Steps:**
1. Connect routes in your main app
2. Add navigation link in admin sidebar
3. Test in development
4. Deploy frontend with backend

---

Need help? Check:
- `COMMUNICATIONS_API.md` - Backend API docs
- `PRODUCTION_CHECKLIST.md` - Deployment guide
- `COMMUNICATIONS_SUMMARY.md` - System overview

🚀 **You're ready to mobilize supporters at scale!**
