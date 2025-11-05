# 🔌 Integration Guide - Quick Setup

## Overview
This guide helps you integrate all the new components into your existing app.

---

## 1️⃣ **Add Offline Indicator to Main Layout**

### Location: `frontend/src/App.tsx` or main layout component

```tsx
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  return (
    <div>
      {/* Your existing app structure */}
      
      {/* Add at the bottom - will appear fixed bottom-right */}
      <OfflineIndicator />
    </div>
  );
}
```

---

## 2️⃣ **Add Live Results to Election Page**

### Create new route: `frontend/src/pages/elections/LiveResultsPage.tsx`

```tsx
import { useParams } from 'react-router';
import LiveResults from '../../components/LiveResults';

export default function LiveResultsPage() {
  const { electionId } = useParams<{ electionId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <LiveResults electionId={electionId!} />
    </div>
  );
}
```

### Add route to router:

```tsx
import LiveResultsPage from './pages/elections/LiveResultsPage';

// In your router configuration
<Route path="/elections/:electionId/results" element={<LiveResultsPage />} />
```

---

## 3️⃣ **Enable Auto-Save in Forms**

### Location: Any monitoring form component

```tsx
import { useEffect } from 'react';
import { setupAutoSave, saveDraft } from '../utils/submissionQueue';

function YourFormComponent() {
  const [formData, setFormData] = useState({});
  const electionId = 'your-election-id';
  const formType = 'result_tracking'; // or polling_unit_info, etc.

  // Setup auto-save
  useEffect(() => {
    const cleanup = setupAutoSave(
      formType,
      electionId,
      () => formData, // Function that returns current form data
      30000 // Save every 30 seconds
    );

    return cleanup; // Cleanup on unmount
  }, [formData, electionId, formType]);

  // Manual save
  const handleSave = async () => {
    await saveDraft(formType, electionId, formData);
  };

  return (
    // Your form JSX
  );
}
```

---

## 4️⃣ **Load Draft on Form Mount**

```tsx
import { getDraft } from '../utils/submissionQueue';

function YourFormComponent() {
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await getDraft('result_tracking', electionId);
      if (draft) {
        setFormData(draft.data);
        toast.info('Draft loaded');
      }
    };

    loadDraft();
  }, []);

  return // ...
}
```

---

## 5️⃣ **Add Submission to Queue (Instead of Direct API Call)**

### Location: Form submission handler

```tsx
import { addToQueue } from '../utils/submissionQueue';
import toast from 'react-hot-toast';

const handleSubmit = async () => {
  try {
    // Instead of:
    // await api.post('/monitoring/result-tracking', formData);

    // Do this:
    const queueId = await addToQueue(
      'result_tracking', // submission type
      electionId,
      pollingUnitCode,
      formData,
      5 // priority (1-10, higher = more important)
    );

    toast.success('Submission queued for sync');

    // The OfflineIndicator will auto-sync when online
  } catch (error) {
    toast.error('Failed to queue submission');
  }
};
```

---

## 6️⃣ **Add Queue View to Dashboard**

```tsx
import { useState } from 'react';
import SubmissionQueue from '../components/SubmissionQueue';

function MonitorDashboard() {
  const [showQueue, setShowQueue] = useState(false);

  return (
    <div>
      {/* Queue Button */}
      <button
        onClick={() => setShowQueue(true)}
        className="btn btn-primary"
      >
        View Submission Queue
      </button>

      {/* Queue Modal */}
      <SubmissionQueue
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
        onSync={() => {
          // Optional: trigger sync from parent
        }}
      />
    </div>
  );
}
```

---

## 7️⃣ **Pass Election ID to Result Forms**

### Update monitoring flow to include electionId in formData

```tsx
// In parent component or monitoring setup
const [formData, setFormData] = useState({
  electionId: 'ABC-PRES-2027', // Set this early in flow
  // ... other data
});

// Pass to ResultTrackingForm
<ResultTrackingForm 
  formData={formData}
  setFormData={setFormData}
/>
```

This ensures `DynamicPartyVotes` receives the electionId prop.

---

## 8️⃣ **Environment Variables**

### Add to `.env` files:

```bash
# Backend (.env in server/)
REDIS_URL=redis://127.0.0.1:6379/0

# Frontend (.env in frontend/)
VITE_API_BASE_URL=http://localhost:5000
```

---

## 9️⃣ **Database Setup**

```bash
cd server

# Run migrations
node runMigrations.js

# Verify migrations
psql $DATABASE_URL -c "SELECT COUNT(*) FROM election_parties;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM monitor_submissions;"

# Backfill monitor keys for existing users (optional)
node -e "import('./services/monitorKeyAutoAssignService.js').then(m => m.backfillMonitorKeys(50).then(console.log))"
```

---

## 🔟 **Redis Setup**

```bash
# Install Redis (macOS)
brew install redis

# Start Redis
brew services start redis

# Verify
redis-cli ping
# Should return: PONG

# Monitor cache (optional)
redis-cli MONITOR
```

---

## 🎨 **Styling Notes**

All components use Tailwind CSS classes matching your existing theme:

- Primary Green: `#006837`
- Secondary Green: `#8cc63f`
- Existing button/form styles preserved

**No additional CSS needed!**

---

## 🧪 **Testing the Integration**

### 1. Test Offline Storage:
```javascript
// In browser console
import { isIndexedDBSupported, getStorageStats } from './utils/offlineStorage';

console.log('IndexedDB supported:', isIndexedDBSupported());
getStorageStats().then(console.log);
```

### 2. Test Live Results:
```bash
# Visit in browser (replace ID)
http://localhost:5173/elections/ABC-PRES-2027/results
```

### 3. Test Offline Mode:
- Open DevTools → Network → Toggle "Offline"
- Fill out a form
- Submit (should queue)
- Toggle "Online"
- Watch auto-sync

### 4. Test Dynamic Parties:
- Go to Result Tracking form
- Verify parties load with colors
- Try manual entry if API fails

---

## 🚨 **Common Issues**

### Issue: "IndexedDB not supported"
**Solution:** Ensure you're using a modern browser (Chrome/Firefox/Safari)

### Issue: Parties not loading
**Solution:** 
1. Check electionId is set: `console.log(formData.electionId)`
2. Verify `/elections/:id/parties` endpoint exists
3. Check browser console for errors

### Issue: Redis connection failed
**Solution:**
1. Verify Redis running: `redis-cli ping`
2. Check REDIS_URL in .env
3. Controller falls back to memory cache automatically

### Issue: Auto-sync not working
**Solution:**
1. Check network status indicator shows "Online"
2. Verify pending submissions exist
3. Check browser console for errors
4. Manually click "Sync Now" button

---

## 📱 **Mobile Considerations**

All components are mobile-responsive:

- OfflineIndicator: Fixed bottom-right, doesn't obstruct content
- SubmissionQueue: Full-screen modal on mobile
- LiveResults: Responsive grid layout
- DynamicPartyVotes: Single-column on mobile

---

## ⚡ **Performance Tips**

1. **Limit Draft Auto-Save**: 30 seconds is good balance
2. **Clear Old Synced**: Run `clearOldSyncedSubmissions(7)` periodically
3. **Monitor Redis Memory**: `redis-cli INFO memory`
4. **Batch Sync**: Max 100 submissions per batch
5. **ETag Caching**: Browser automatically uses 304 responses

---

## 🎯 **Next Steps After Integration**

1. ✅ Test offline flow end-to-end
2. ✅ Verify live results display correctly
3. ✅ Check dynamic party inputs work
4. ✅ Test auto-save/draft recovery
5. ✅ Load test with multiple users
6. ✅ Monitor Redis cache hit rate
7. ✅ Deploy to staging
8. ✅ User acceptance testing
9. ✅ Deploy to production

---

## 📞 **Support**

If you encounter issues:

1. Check browser console for errors
2. Check server logs: `tail -f logs/server.log`
3. Monitor Redis: `redis-cli MONITOR`
4. Review BUILD_COMPLETE.md for architecture details

---

**Happy integrating! 🚀**
