# Callback URLs - Quick Setup Summary

## 🎯 What You Need to Do

### 1. Expose Your Local Server to the Internet

**Install ngrok:**
```bash
brew install ngrok
```

**Start ngrok** (in a new terminal):
```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding: https://abc123def.ngrok.io -> http://localhost:5000
```

**Copy that HTTPS URL!** (e.g., `https://abc123def.ngrok.io`)

---

### 2. Configure Africa's Talking Dashboard

**Login:** [https://account.africastalking.com/](https://account.africastalking.com/)

#### **For SMS Callbacks:**
1. Go to **SMS → Settings → Callbacks**
2. Find **"Delivery Reports Callback URL"**
3. Enter:
   ```
   https://YOUR_NGROK_URL/api/communications/webhooks/sms?token=dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf
   ```
   *(Replace YOUR_NGROK_URL with your actual ngrok URL)*
4. Click **Save**

#### **For Voice Callbacks:**
1. Go to **Voice → Settings → Callbacks**
2. Find **"Call Status Callback URL"**
3. Enter:
   ```
   https://YOUR_NGROK_URL/api/communications/webhooks/voice?token=dsfjklkdfjli9287398479///,';'dfajlsdkf./,23/.4/.,/bldfkgjo8yihjsdf
   ```
4. Click **Save**

---

### 3. Test Your Setup

**Terminal 1** - Start your server:
```bash
cd server
npm start
```

**Terminal 2** - Start ngrok:
```bash
ngrok http 5000
```

**Terminal 3** - Test webhooks locally:
```bash
cd server

# Test webhook handlers (before configuring Africa's Talking)
npm run test:webhooks

# Test Africa's Talking SMS (will trigger callback if configured)
npm run test:at +2347065103773

# Watch your server logs in Terminal 1 for webhook callbacks
```

---

## 📋 Quick Commands Reference

```bash
# Test Africa's Talking SMS
npm run test:at +234XXXXXXXXX

# Test all webhooks locally
npm run test:webhooks

# Test only SMS webhook
npm run test:webhooks:sms

# Test only Voice webhook
npm run test:webhooks:voice

# Test webhook security
npm run test:webhooks:security

# Check queue health
npm run queue:health
```

---

## 🔍 How to Verify It's Working

### After Sending a Test SMS:

1. **Check your phone** - Did you receive the SMS?
2. **Check server logs** - Do you see webhook callback?
3. **Check ngrok dashboard** - Visit http://127.0.0.1:4040 to see requests
4. **Check database:**
   ```sql
   SELECT * FROM communication_recipients 
   ORDER BY updated_at DESC LIMIT 10;
   ```

### What You Should See:

```
# In your server logs:
✓ SMS sent successfully
✓ Webhook received: SMS delivery status
✓ Updated recipient status to 'delivered'
```

---

## 🚨 Troubleshooting

### "Webhooks not being called"
- ✅ Is ngrok running?
- ✅ Did you copy the HTTPS URL (not HTTP)?
- ✅ Is the callback URL saved in Africa's Talking dashboard?
- ✅ Check ngrok dashboard: http://127.0.0.1:4040

### "403 Forbidden"
- ✅ Token in URL matches your .env file
- ✅ No extra spaces in token
- ✅ Try URL without ?token= first to test

### "Server not reachable"
- ✅ Is `npm start` running?
- ✅ Server listening on port 5000?
- ✅ Firewall blocking port?

---

## 📚 Full Documentation

- **Detailed Guide**: `server/CALLBACK_SETUP.md`
- **Redis Setup**: `server/REDIS_SETUP.md`
- **Africa's Talking**: `server/AFRICAS_TALKING_SETUP.md`

---

## ✅ Next Steps After Setup

1. ✅ Install and start ngrok
2. ✅ Update Africa's Talking callbacks with ngrok URL
3. ✅ Send test SMS
4. ✅ Verify webhook is called
5. ✅ Check status updates in database
6. 🚀 Ready for production deployment!

---

**Need help?** Check the detailed guides or ask for assistance!
