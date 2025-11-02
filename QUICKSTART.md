# 🚀 Quick Start Guide - Bulk Communications

## Start Using in 5 Minutes

### Step 1: Start Services (3 terminals)

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Backend API
cd server
npm start

# Terminal 3: Frontend
cd frontend
npm run dev
```

### Step 2: Access Admin Panel

1. Open browser: `http://localhost:5173`
2. Login as admin
3. Dashboard → Admin → **Bulk Communications**

### Step 3: Create Your First SMS Campaign

1. Click **"Create SMS"** tab
2. Fill in:
   - **Title:** "Test Campaign"
   - **LGAs:** Check "Ikeja" (or any LGA)
   - **Message:** "Hello {{first_name}}, this is a test from Obidient Movement!"
3. Click **"Create & Send Campaign"**
4. Watch real-time progress!

---

## What You'll See

### Dashboard
- Total campaigns, recipients, delivery rate, costs
- Recent campaigns with quick links
- Quick action buttons to create campaigns

### Campaign Details (Real-time Updates)
- Progress bar (updates every 5 seconds)
- Delivery statistics (sent/delivered/failed)
- Cost tracking
- Cancel button for active campaigns

---

## Test Checklist

- [ ] Create SMS campaign
- [ ] Monitor progress in real-time
- [ ] Upload audio file
- [ ] Create voice campaign
- [ ] Cancel a campaign
- [ ] Search/filter campaigns list

---

## Troubleshooting

**Can't see "Bulk Communications" in menu?**
- Ensure you're logged in as admin (`profile.role === 'admin'`)

**"Failed to load campaigns"?**
- Check backend is running: `http://localhost:5000/api/communications/campaigns`
- Check `VITE_API_BASE_URL` in `frontend/.env`

**Redis connection error?**
```bash
redis-cli ping  # Should return "PONG"
```

**Queue not processing?**
```bash
npm run queue:health  # Check queue status
```

---

## Quick Commands

```bash
# Check system health
npm run queue:health

# Test Africa's Talking SMS
npm run test:at +2348012345678

# Check AT account
npm run test:at-account

# Test webhooks
npm run test:webhooks
```

---

## Next Steps

1. ✅ Test with your own phone number
2. ⏳ Request AT sender ID approval (see `PRODUCTION_CHECKLIST.md`)
3. ⏳ Deploy to production (see `PRODUCTION_CHECKLIST.md`)

---

## Full Documentation

- **`IMPLEMENTATION_COMPLETE.md`** - Complete overview
- **`COMMUNICATIONS_API.md`** - API documentation
- **`FRONTEND_SETUP.md`** - Frontend guide
- **`PRODUCTION_CHECKLIST.md`** - Deployment guide

---

**🎉 You're ready to mobilize supporters at scale!**
