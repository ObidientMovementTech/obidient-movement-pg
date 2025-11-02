# Africa's Talking Callback URLs Setup Guide

## Overview

Callback URLs (webhooks) allow Africa's Talking to notify your server about:
- **SMS Delivery Status** - Whether messages were delivered, failed, etc.
- **Voice Call Status** - Call answered, completed, duration, etc.

Your system already has webhook handlers implemented! You just need to configure them in the Africa's Talking dashboard.

---

## Your Webhook Endpoints

### **Local Development (Testing)**
When testing locally, you'll need to expose your local server to the internet:

```
SMS Webhook:   http://YOUR_NGROK_URL/api/communications/webhooks/sms
Voice Webhook: http://YOUR_NGROK_URL/api/communications/webhooks/voice
```

### **Production (When Deployed)**
Once your server is deployed:

```
SMS Webhook:   https://your-domain.com/api/communications/webhooks/sms
Voice Webhook: https://your-domain.com/api/communications/webhooks/voice
```

---

## Step 1: Expose Your Local Server (For Testing)

Since Africa's Talking needs to reach your server, you need to expose localhost to the internet.

### Option A: Using ngrok (Recommended)

**Install ngrok:**
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

**Run ngrok:**
```bash
# In a new terminal, run:
ngrok http 5000

# You'll see output like:
# Forwarding: https://abc123.ngrok.io -> http://localhost:5000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Option B: Using localhost.run (No Installation)

```bash
# In a new terminal:
ssh -R 80:localhost:5000 localhost.run

# You'll get a URL like: https://xyz.localhost.run
```

### Option C: Using Cloudflare Tunnel

```bash
# Install
brew install cloudflare/cloudflare/cloudflared

# Run
cloudflared tunnel --url http://localhost:5000
```

---

## Step 2: Configure Callbacks in Africa's Talking Dashboard

### **For SMS Delivery Reports:**

1. Login to [Africa's Talking Dashboard](https://account.africastalking.com/)
2. Select your **Sandbox** (or Production) app
3. Click **"SMS"** in the left sidebar
4. Click **"Settings"** or **"Callbacks"** tab
5. Look for **"Delivery Reports Callback URL"**
6. Enter your webhook URL:
   ```
   https://YOUR_NGROK_URL/api/communications/webhooks/sms
   ```
7. **Important**: Add your webhook token as a query parameter for security:
   ```
   https://YOUR_NGROK_URL/api/communications/webhooks/sms?token=YOUR_TOKEN
   ```
   
   Get your token from `.env`:
   ```bash
   COMMUNICATIONS_WEBHOOK_TOKEN=dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf
   ```

8. Click **"Save"** or **"Update"**

### **For Voice Call Status:**

1. In the dashboard, click **"Voice"** in the left sidebar
2. Click **"Settings"** or **"Callbacks"** tab
3. Look for **"Voice Callback URL"** or **"Call Status Callback"**
4. Enter your webhook URL:
   ```
   https://YOUR_NGROK_URL/api/communications/webhooks/voice?token=YOUR_TOKEN
   ```
5. Click **"Save"**

---

## Step 3: Test Your Webhooks

### **Test SMS Webhook**

I'll create a test script for you:

```bash
# Start your server
cd server
npm start

# In another terminal, start ngrok
ngrok http 5000

# Copy the ngrok URL and update Africa's Talking dashboard

# Send a test SMS
node scripts/communications/testAfricasTalking.js +2347065103773

# Watch your server logs for webhook callbacks
```

### **Manual Webhook Test (Simulate Africa's Talking)**

```bash
# Test SMS webhook locally
curl -X POST http://localhost:5000/api/communications/webhooks/sms \
  -H "Content-Type: application/json" \
  -H "x-webhook-token: dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf" \
  -d '{
    "id": "ATXid_test123",
    "status": "Success",
    "phoneNumber": "+2347065103773",
    "networkCode": "62001"
  }'

# Test Voice webhook locally
curl -X POST http://localhost:5000/api/communications/webhooks/voice \
  -H "Content-Type: application/json" \
  -H "x-webhook-token: dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf" \
  -d '{
    "sessionId": "ATVId_test456",
    "isActive": "0",
    "status": "Completed",
    "durationInSeconds": "45",
    "clientRequestId": "recipient-123"
  }'
```

---

## Understanding Webhook Payloads

### **SMS Delivery Webhook Payload:**

Africa's Talking sends data like this:

```json
{
  "id": "ATXid_abc123",                    // Message ID
  "status": "Success",                      // Delivery status
  "phoneNumber": "+234XXXXXXXXX",          // Recipient
  "retryCount": "0",                        // Retry attempts
  "networkCode": "62001",                   // Network operator
  "cost": "NGN 2.50"                       // Cost (production only)
}
```

**Status Values:**
- `Success` / `Sent` / `Submitted` → Maps to `delivered` in your DB
- `Failed` / `Rejected` / `Undeliverable` → Maps to `failed`
- Other → Maps to `sent`

### **Voice Status Webhook Payload:**

```json
{
  "sessionId": "ATVId_xyz789",             // Call session ID
  "clientRequestId": "recipient-456",      // Your custom ID
  "isActive": "1",                         // 1 = call active, 0 = ended
  "status": "Completed",                   // Call status
  "durationInSeconds": "45",               // Call duration
  "direction": "Outbound",                 // Call direction
  "hangupCause": "NORMAL_HANGUP"          // Why call ended
}
```

**How It Works:**
1. **isActive = 1**: Call is connecting, your system returns audio URL
2. **isActive = 0**: Call ended, your system records final status

---

## Webhook Security

Your system already implements webhook authentication! Here's how:

### **Method 1: Token in Header (Recommended)**
```bash
# Africa's Talking should send (you may need to request this):
x-webhook-token: YOUR_TOKEN
```

### **Method 2: Token in Query String**
```bash
# Add to callback URL in dashboard:
https://your-url.com/api/communications/webhooks/sms?token=YOUR_TOKEN
```

### **Method 3: Token in Body**
```json
{
  "token": "YOUR_TOKEN",
  "id": "ATXid_abc123",
  ...
}
```

Your webhook handlers check all three locations automatically!

---

## Monitoring Webhooks

### **View Webhook Logs:**

```bash
# Watch server logs in real-time
cd server
npm start

# Or with PM2:
pm2 logs obidient-api

# Filter for webhook activity:
pm2 logs obidient-api | grep webhook
```

### **Check Database for Updates:**

```sql
-- Check recent SMS recipients
SELECT 
  id, 
  phone_number, 
  status, 
  provider_message_id,
  delivered_at,
  last_error
FROM communication_recipients
WHERE campaign_id = YOUR_CAMPAIGN_ID
ORDER BY updated_at DESC
LIMIT 20;

-- Check campaign progress
SELECT 
  id,
  title,
  status,
  total_recipients,
  processed_count,
  success_count,
  failure_count
FROM communication_campaigns
ORDER BY created_at DESC;
```

---

## Troubleshooting

### **Webhooks Not Being Called**

1. **Check ngrok is running:**
   ```bash
   # Verify ngrok shows requests
   # Visit: http://127.0.0.1:4040 (ngrok dashboard)
   ```

2. **Verify callback URL in dashboard:**
   - Must be HTTPS (ngrok provides this)
   - Must be publicly accessible
   - Check for typos

3. **Check Africa's Talking logs:**
   - Dashboard → SMS → Logs
   - Look for your sent messages
   - Check if callbacks were attempted

### **Webhooks Returning 403 Forbidden**

**Cause**: Token mismatch

**Solution**: 
1. Check your `.env` token matches what you're sending
2. Ensure token has no extra spaces
3. Try without token first (temporarily remove from URL to test)

### **Webhooks Called But Status Not Updating**

**Check these:**

1. **Message ID not found:**
   ```sql
   -- Verify message ID exists
   SELECT * FROM communication_recipients 
   WHERE provider_message_id = 'ATXid_abc123';
   ```

2. **Server logs:**
   ```bash
   # Look for errors
   tail -f server.log | grep -i error
   ```

3. **Database connection:**
   ```bash
   # Test DB is accessible
   npm run queue:health
   ```

---

## Production Checklist

Before going live:

- [ ] Deploy your server to production (Vercel, AWS, Heroku, etc.)
- [ ] Get production domain/URL (e.g., `https://api.obidients.com`)
- [ ] Update callback URLs in Africa's Talking **Production** app
- [ ] Use production credentials in `.env`
- [ ] Set up proper SSL/HTTPS certificate
- [ ] Configure firewall rules (if needed)
- [ ] Test with small campaign first
- [ ] Monitor webhook delivery rates
- [ ] Set up error alerting

---

## Quick Reference

### **Your Webhook URLs:**

```bash
# Local (with ngrok)
SMS:   https://YOUR_NGROK_URL/api/communications/webhooks/sms?token=YOUR_TOKEN
Voice: https://YOUR_NGROK_URL/api/communications/webhooks/voice?token=YOUR_TOKEN

# Production
SMS:   https://your-domain.com/api/communications/webhooks/sms?token=YOUR_TOKEN
Voice: https://your-domain.com/api/communications/webhooks/voice?token=YOUR_TOKEN
```

### **Your Token:**
```
COMMUNICATIONS_WEBHOOK_TOKEN=dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf
```

### **Dashboard Locations:**
- SMS Callbacks: **Dashboard → SMS → Settings → Delivery Reports**
- Voice Callbacks: **Dashboard → Voice → Settings → Callback URL**

---

## Next Steps

1. **Install ngrok**: `brew install ngrok`
2. **Start your server**: `npm start` (in server directory)
3. **Start ngrok**: `ngrok http 5000` (in new terminal)
4. **Copy ngrok URL**: Something like `https://abc123.ngrok.io`
5. **Update Africa's Talking dashboard** with:
   - SMS: `https://abc123.ngrok.io/api/communications/webhooks/sms?token=YOUR_TOKEN`
   - Voice: `https://abc123.ngrok.io/api/communications/webhooks/voice?token=YOUR_TOKEN`
6. **Send test SMS**: `node scripts/communications/testAfricasTalking.js +2347065103773`
7. **Watch logs**: Check server console for webhook calls
8. **Verify in DB**: Check that status updates to `delivered`

Ready to set this up? Let me know if you need help with any step!
