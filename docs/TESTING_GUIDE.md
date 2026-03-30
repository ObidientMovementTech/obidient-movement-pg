# Election Monitoring System - Testing Guide

## 🧪 TESTING CHECKLIST

This guide provides step-by-step instructions to test the complete election monitoring and live results system.

---

## ⚙️ PRE-TESTING SETUP

### 1. Database Verification
```bash
# Connect to PostgreSQL and verify tables exist
psql -d your_database_name

# Check tables
\dt

# Expected tables:
# - elections
# - polling_unit_submissions  
# - result_tracking_reports
# - officer_arrival_reports
# - incident_reports
# - submission_status
```

### 2. Start Backend Server
```bash
cd server
npm start

# Server should start on http://localhost:5000
# Check for: "PostgreSQL database connected successfully"
```

### 3. Start Frontend Server
```bash
cd frontend
npm run dev

# Frontend should start on http://localhost:5173
```

---

## 📋 TEST SCENARIO 1: Admin Creates Election

### Step 1: Create an Active Election
```bash
# POST /elections
curl -X POST http://localhost:5000/elections \
  -H "Content-Type: application/json" \
  -H "Cookie: cu-auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "election_name": "Anambra Gubernatorial Election 2025",
    "election_type": "gubernatorial",
    "state": "Anambra",
    "lga": "Awka",
    "election_date": "2025-11-18"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Election created successfully",
#   "data": {
#     "election": {
#       "id": 1,
#       "election_id": "ANA-GOV-2025",
#       "status": "upcoming"
#     }
#   }
# }

# Note the election_id for next steps
```

### Step 2: Verify Election Created
```bash
# GET /elections
curl http://localhost:5000/elections

# Should see your created election
```

### Step 3: Set Election as Active
```bash
# PATCH /elections/:id/status
curl -X PATCH http://localhost:5000/elections/1/status \
  -H "Content-Type: application/json" \
  -H "Cookie: cu-auth-token=YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "active"
  }'

# Election should now be active
```

---

## 📋 TEST SCENARIO 2: Monitor Submits Data

### Step 1: Get Monitor Key Access
```
1. Login as a user at http://localhost:5173/auth/login
2. Navigate to /dashboard/elections/monitor
3. Enter monitor key if prompted
4. Should see monitoring dashboard
```

### Step 2: Submit Polling Unit Info
```
1. Click "Polling Unit Details" card
2. Fill out form:
   - PU Code: "ANA-AWK-001"
   - PU Name: "Awka Central Primary School"
   - Ward: "Awka North"
   - LGA: "Awka"
   - State: "Anambra"
   - Location Type: "School"
3. Click Submit
4. Should see success message
5. Note the submission_id from response
```

### Step 3: Submit Officer Arrival
```
1. Return to dashboard
2. Click "Officer Arrival & Verification"
3. Fill form:
   - First arrival time: 08:00 AM
   - Last arrival time: 08:30 AM
   - On-time status: Yes
   - Officer names (add INEC officers)
4. Submit
5. Verify success
```

### Step 4: Submit Results (KEY TEST)
```
1. Return to dashboard
2. Click "Result Tracking"
3. Fill out vote counts:

   Statistics:
   - Registered Voters: 1500
   - Accredited Voters: 1200
   - Valid Votes: 1180
   - Rejected Votes: 20
   - Total: 1200

   Party Results:
   - LP: 650 votes
   - APC: 300 votes
   - PDP: 150 votes
   - NNPP: 80 votes

4. Upload EC8A form photo (optional)
5. Submit

Expected Calculations:
- LP: 55.08% (650/1180)
- APC: 25.42% (300/1180)
- PDP: 12.71% (150/1180)
- NNPP: 6.78% (80/1180)
- Voter Turnout: 80% (1200/1500)
```

---

## 📋 TEST SCENARIO 3: Verify Live Results

### Step 1: Check API Endpoint
```bash
# GET /election-results/live
curl http://localhost:5000/election-results/live

# Expected Response:
{
  "success": true,
  "data": [
    {
      "election": {
        "electionId": "ANA-GOV-2025",
        "name": "Anambra Gubernatorial Election 2025",
        "status": "active"
      },
      "results": {
        "totalSubmissions": 1,
        "statistics": {
          "totalRegisteredVoters": 1500,
          "totalAccreditedVoters": 1200,
          "totalValidVotes": 1180,
          "totalVotesCast": 1200,
          "voterTurnout": 80
        },
        "partyResults": [
          {
            "party": "LP",
            "totalVotes": 650,
            "percentage": "55.08",
            "pollingUnitsReported": 1
          },
          {
            "party": "APC",
            "totalVotes": 300,
            "percentage": "25.42",
            "pollingUnitsReported": 1
          }
        ],
        "leadingParty": {
          "party": "LP",
          "totalVotes": 650,
          "percentage": "55.08"
        }
      },
      "progress": {
        "totalPollingUnits": 1,
        "submittedPollingUnits": 1,
        "completionPercentage": 100
      }
    }
  ]
}
```

### Step 2: View Live Results Page
```
1. Open browser: http://localhost:5173/elections/live-results
2. Should see:
   ✅ "Anambra Gubernatorial Election 2025" card
   ✅ Progress bar showing 100% (1/1 PUs)
   ✅ Statistics: 1500 registered, 1200 voted, 80% turnout
   ✅ Leading party: LP with 650 votes (55.08%)
   ✅ All party results listed:
      - LP: 650 (55.08%)
      - APC: 300 (25.42%)
      - PDP: 150 (12.71%)
      - NNPP: 80 (6.78%)
   ✅ Last updated timestamp
   ✅ Auto-refresh toggle is ON
```

### Step 3: Test Auto-Refresh
```
1. Wait 30 seconds on the live results page
2. Watch the "Last Updated" time change
3. Should auto-fetch new data
4. Toggle "Auto-refresh" OFF
5. Wait 30 seconds - should NOT refresh
6. Toggle back ON - should resume auto-refresh
```

### Step 4: Test Manual Refresh
```
1. Click the "Refresh" button
2. Should see spinner icon animate
3. Data should update
4. "Last Updated" timestamp should change
5. Success toast should appear
```

---

## 📋 TEST SCENARIO 4: Multiple Polling Units

### Step 1: Submit More Results
```
Repeat Test Scenario 2, Step 4 with different data:

Polling Unit 2: "ANA-AWK-002"
- LP: 500 votes
- APC: 400 votes
- PDP: 200 votes
- NNPP: 100 votes
Total: 1200 votes

Polling Unit 3: "ANA-AWK-003"
- LP: 300 votes
- APC: 600 votes
- PDP: 150 votes
- NNPP: 50 votes
Total: 1100 votes
```

### Step 2: Verify Aggregation
```bash
curl http://localhost:5000/election-results/live/ANA-GOV-2025

# Should show:
# - Total submissions: 3
# - LP total: 650 + 500 + 300 = 1450 votes
# - APC total: 300 + 400 + 600 = 1300 votes
# - PDP total: 150 + 200 + 150 = 500 votes
# - NNPP total: 80 + 100 + 50 = 230 votes
# - Grand total: 3480 valid votes
# - LP: 41.67%
# - APC: 37.36%
# - Leading party: LP
```

### Step 3: Check Polling Unit Breakdown
```bash
curl http://localhost:5000/election-results/ANA-GOV-2025/polling-units

# Should return array of 3 polling units with individual results
```

---

## 📋 TEST SCENARIO 5: Progress Tracking

### Test Progress API
```bash
# Check submission progress
curl http://localhost:5000/election-results/ANA-GOV-2025/summary

# Should show:
# - totalPollingUnits: 3
# - submittedPollingUnits: 3
# - completionPercentage: 100
```

### Visual Progress
```
1. Visit /elections/live-results
2. Should see progress bar at 100%
3. Should show "3 of 3 polling units reporting"
```

---

## 📋 TEST SCENARIO 6: Error Handling

### Test Invalid Election ID
```bash
curl http://localhost:5000/election-results/live/INVALID-ID

# Should return 404 or empty results
```

### Test Missing Data
```
1. Create election but don't submit any results
2. Visit /elections/live-results
3. Should show:
   - Election card
   - 0 submissions
   - Empty party results
   - "No data available" state
```

### Test Network Error
```
1. Stop backend server
2. Visit /elections/live-results
3. Should show error toast
4. Should display friendly error message
```

---

## 📋 TEST SCENARIO 7: Mobile Responsiveness

### Test on Different Devices
```
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

Check:
✅ Progress bar visible and responsive
✅ Statistics grid stacks properly
✅ Party results cards stack on mobile
✅ Headers don't overflow
✅ Buttons are clickable
✅ Text is readable
```

---

## 📋 TEST SCENARIO 8: Data Validation

### Test Vote Count Accuracy
```
Manual calculation:
PU1: LP=650, APC=300, PDP=150, NNPP=80, Total=1180
PU2: LP=500, APC=400, PDP=200, NNPP=100, Total=1200
PU3: LP=300, APC=600, PDP=150, NNPP=50, Total=1100

Expected Totals:
- LP: 1450
- APC: 1300
- PDP: 500
- NNPP: 230
- Grand Total: 3480

Compare with live results page - should match exactly
```

### Test Percentage Calculation
```
Expected:
- LP: (1450 / 3480) * 100 = 41.67%
- APC: (1300 / 3480) * 100 = 37.36%
- PDP: (500 / 3480) * 100 = 14.37%
- NNPP: (230 / 3480) * 100 = 6.61%

Check frontend displays these values (within ±0.01% for rounding)
```

---

## ✅ ACCEPTANCE CRITERIA

Mark each as PASS or FAIL:

### Backend
- [ ] Elections table exists and accessible
- [ ] Can create new election
- [ ] Can set election as active
- [ ] Monitor can submit polling unit info
- [ ] Monitor can submit results
- [ ] API aggregates results correctly
- [ ] Percentages calculated accurately
- [ ] Progress tracking works
- [ ] API responds in < 2 seconds

### Frontend
- [ ] Live results page loads
- [ ] Shows active elections
- [ ] Displays correct vote counts
- [ ] Shows accurate percentages
- [ ] Leading party highlighted
- [ ] Progress bar updates
- [ ] Auto-refresh works
- [ ] Manual refresh works
- [ ] Mobile responsive
- [ ] Error handling graceful

### Data Integrity
- [ ] Vote totals match submissions
- [ ] Percentages sum to ~100%
- [ ] No duplicate counting
- [ ] Polling unit count correct
- [ ] Voter turnout accurate

---

## 🐛 TROUBLESHOOTING

### Issue: No results showing
**Solution:**
1. Check election status is 'active'
2. Verify polling_unit_submissions has election_id
3. Check result_tracking_reports has data
4. Verify submission_id foreign keys match

### Issue: Wrong vote counts
**Solution:**
1. Check votes_per_party JSONB format
2. Verify no duplicate submissions
3. Check for null values in vote columns
4. Query database directly to verify data

### Issue: Auto-refresh not working
**Solution:**
1. Check browser console for errors
2. Verify API endpoint accessible
3. Check CORS settings
4. Ensure toggle is ON

---

## 📊 TEST RESULTS TEMPLATE

```
Test Date: ___________
Tester: ___________

SCENARIO 1: Admin Creates Election
[ ] Step 1: Create election - PASS/FAIL
[ ] Step 2: Verify created - PASS/FAIL
[ ] Step 3: Set as active - PASS/FAIL

SCENARIO 2: Monitor Submits Data
[ ] Step 1: Get access - PASS/FAIL
[ ] Step 2: Submit PU info - PASS/FAIL
[ ] Step 3: Submit officer arrival - PASS/FAIL
[ ] Step 4: Submit results - PASS/FAIL

SCENARIO 3: Verify Live Results
[ ] Step 1: Check API - PASS/FAIL
[ ] Step 2: View page - PASS/FAIL
[ ] Step 3: Auto-refresh - PASS/FAIL
[ ] Step 4: Manual refresh - PASS/FAIL

SCENARIO 4: Multiple Polling Units
[ ] Step 1: Submit more results - PASS/FAIL
[ ] Step 2: Verify aggregation - PASS/FAIL
[ ] Step 3: Check breakdown - PASS/FAIL

SCENARIO 5: Progress Tracking
[ ] Test progress API - PASS/FAIL
[ ] Visual progress - PASS/FAIL

SCENARIO 6: Error Handling
[ ] Invalid election ID - PASS/FAIL
[ ] Missing data - PASS/FAIL
[ ] Network error - PASS/FAIL

SCENARIO 7: Mobile Responsiveness
[ ] iPhone - PASS/FAIL
[ ] iPad - PASS/FAIL
[ ] Desktop - PASS/FAIL

SCENARIO 8: Data Validation
[ ] Vote count accuracy - PASS/FAIL
[ ] Percentage calculation - PASS/FAIL

OVERALL RESULT: PASS/FAIL

Notes:
_____________________________________
_____________________________________
_____________________________________
```

---

## 🎯 NEXT STEPS AFTER TESTING

### If All Tests Pass:
1. ✅ Mark system as production-ready
2. ✅ Document any findings
3. ✅ Train monitors on submission process
4. ✅ Communicate live results URL to public
5. ✅ Set up monitoring and alerts
6. ✅ Plan for election day support

### If Tests Fail:
1. 🔧 Document failures in detail
2. 🔧 Create bug reports with reproduction steps
3. 🔧 Fix issues and re-test
4. 🔧 Update this guide with solutions
5. 🔧 Repeat testing until all pass

---

**Good luck with testing! The system is designed to be robust and user-friendly.** 🚀
