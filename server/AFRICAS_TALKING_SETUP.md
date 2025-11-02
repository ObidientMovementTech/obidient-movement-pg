# Africa's Talking Setup Guide

## What is Africa's Talking?

Africa's Talking is a communications platform that provides SMS, Voice, USSD, Airtime, and Payments APIs across Africa. For this project, we're using:
- **SMS API** - Send bulk SMS messages to campaign recipients
- **Voice API** - Make automated voice calls (robocalls) to recipients

## Step-by-Step Setup

### 1. Create an Africa's Talking Account

1. Go to [https://africastalking.com/](https://africastalking.com/)
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in your details:
   - Full Name
   - Email Address
   - Phone Number (must be valid - you'll receive verification)
   - Password
   - Country
4. Verify your email address (check your inbox)
5. Verify your phone number (you'll receive an SMS with a code)

### 2. Choose Your Environment

Africa's Talking provides two environments:

#### **Sandbox (For Testing - FREE)**
- Test all APIs without spending money
- Uses fake phone numbers for testing
- Perfect for development and testing your integration
- No real SMS/calls are sent

#### **Production (For Real Campaigns - PAID)**
- Send real SMS and make real calls
- Requires account top-up with credits
- Pay-as-you-go pricing

**Start with Sandbox for development!**

---

## Getting Your Credentials

### 3. Access Your Dashboard

After logging in:
1. You'll see the main dashboard
2. Look for **"Sandbox App"** in the left sidebar (or top menu)
3. Click on it to access sandbox credentials

### 4. Get Your API Key

**For Sandbox:**
1. In the dashboard, click **"Settings"** or **"API Keys"**
2. You'll see your **Sandbox API Key**
3. Click to reveal/copy it
4. **IMPORTANT**: This is sensitive - keep it secret!

**For Production (when ready):**
1. Click on your **Production App**
2. Go to **Settings > API Key**
3. Generate or copy your production API key

### 5. Get Your Username

Your username is typically:
- **Sandbox**: `sandbox` (default)
- **Production**: Your app name (e.g., `ObidientMovement` or similar)

You can find this at the top of your dashboard or in Settings.

---

## Understanding Phone Numbers & Sender IDs

### SMS Sender ID (`AT_SMS_SENDER_ID`)

**What is it?**
The name/number that appears as the sender when recipients receive your SMS.

**Options:**

1. **Alphanumeric Sender ID** (Recommended)
   - Example: `OBIDIENT`, `ObiMovement`, `PeterObi`
   - Max 11 characters
   - Can contain letters and numbers
   - **Requires approval** from Africa's Talking
   - Recipients cannot reply directly
   - More professional looking

2. **Shortcode** (If you have one)
   - Example: `12345`
   - Expensive and requires special setup
   - Supports two-way SMS

3. **Default** (Leave empty)
   - Uses Africa's Talking's default sender
   - Less professional but works immediately

**How to request Alphanumeric Sender ID:**
1. Go to **SMS > Sender IDs** in dashboard
2. Click **"Request Sender ID"**
3. Enter your desired sender name
4. Provide justification (e.g., "Political campaign communications")
5. Wait for approval (usually 1-3 business days)

### Voice Caller ID (`AT_VOICE_CALLER_ID`)

**What is it?**
The phone number that appears on caller ID when making voice calls.

**Options:**

1. **Purchase a Phone Number** (Recommended)
   - Go to **Voice > Phone Numbers** in dashboard
   - Click **"Buy Number"**
   - Choose a Nigerian number (e.g., +234...)
   - Costs vary by country/number type
   - This becomes your caller ID

2. **Use Provided Number**
   - Africa's Talking may provide a default number
   - Check your Voice settings in the dashboard

---

## Testing in Sandbox

### Sandbox Phone Numbers

Sandbox uses **fake numbers** for testing. Common formats:
- `+254711XXXYYY` - Kenya format
- `+234XXXXXXXXX` - Nigeria format

**Important**: You can only send to registered test numbers in sandbox!

### Register Test Phone Numbers

1. In Sandbox, go to **"SMS"** or **"Voice"**
2. Look for **"Test Contacts"** or **"Add Test Number"**
3. Add your actual phone numbers for testing
4. You'll receive real SMS/calls on these numbers even in sandbox mode

### Test the Integration

Once you have credentials:

```bash
# Update your .env with sandbox credentials
AT_USERNAME=sandbox
AT_API_KEY=your_sandbox_api_key_here
AT_SMS_SENDER_ID=OBIDIENT
AT_VOICE_CALLER_ID=+254711XXXYYY
```

Test with curl:
```bash
# Test SMS (from your terminal)
curl -X POST \
  https://api.sandbox.africastalking.com/version1/messaging \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'apiKey: YOUR_API_KEY' \
  -d 'username=sandbox' \
  -d 'to=+234XXXXXXXXX' \
  -d 'message=Test from Obidient Movement'
```

---

## Configuration for Your Project

### Update `.env` File

**For Sandbox/Testing:**
```bash
# Africa's Talking Credentials (Sandbox)
AT_USERNAME=sandbox
AT_API_KEY=your_sandbox_api_key_here
AT_SMS_SENDER_ID=OBIDIENT
AT_VOICE_CALLER_ID=+254711XXXYYY
AT_VOICE_FALLBACK_AUDIO_URL=https://your-domain.com/audio/fallback.mp3
```

**For Production (when ready):**
```bash
# Africa's Talking Credentials (Production)
AT_USERNAME=ObidientMovement
AT_API_KEY=your_production_api_key_here
AT_SMS_SENDER_ID=OBIDIENT
AT_VOICE_CALLER_ID=+234XXXXXXXXX
AT_VOICE_FALLBACK_AUDIO_URL=https://your-domain.com/audio/fallback.mp3
```

### Voice Audio URL

For voice campaigns, you need an audio file (MP3) hosted online:

1. **Record your campaign message** as an MP3
2. **Upload to your server** or use:
   - AWS S3 (you already have this configured!)
   - Cloudinary
   - Africa's Talking Media Library
3. **Get the public URL** (e.g., `https://s3.amazonaws.com/your-bucket/campaign-message.mp3`)
4. **Set as fallback URL** in `.env`

---

## Pricing (As of 2025)

### SMS Pricing (Nigeria)
- **Sandbox**: FREE (limited to test numbers)
- **Production**: ₦2-4 per SMS (varies by network)
- **Bulk rates**: Available for large volumes

### Voice Pricing (Nigeria)
- **Sandbox**: FREE (limited to test numbers)
- **Production**: ₦5-12 per minute
- **Number rental**: ₦1,000-5,000/month

### How to Add Credits (Production)

1. Go to **"Billing"** in dashboard
2. Click **"Top Up"**
3. Choose amount (minimum usually ₦1,000)
4. Pay via:
   - Credit/Debit Card
   - Bank Transfer
   - Mobile Money (depending on country)

**Recommendation**: Start with ₦10,000-20,000 for testing production

---

## Security Best Practices

### 1. Protect Your API Key
```bash
# ❌ NEVER commit to Git
AT_API_KEY=your_actual_key

# ✅ Use environment variables
# ✅ Add .env to .gitignore (already done)
# ✅ Use secrets manager in production
```

### 2. Set Up Webhooks (Optional but Recommended)

Webhooks let Africa's Talking notify your server about:
- SMS delivery status
- Voice call status
- Incoming SMS (if using two-way)

**Configure in Dashboard:**
1. Go to **SMS > Callbacks** or **Voice > Callbacks**
2. Set callback URL: `https://your-domain.com/api/communications/delivery-callback`
3. Set delivery reports: `https://your-domain.com/api/communications/delivery-reports`

**Your webhook token** (already in code):
```bash
COMMUNICATIONS_WEBHOOK_TOKEN=generate_a_secure_random_string_here
```

Generate a secure token:
```bash
# On Mac/Linux
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. IP Whitelisting (Production)

For extra security:
1. Go to **Settings > Security**
2. Add your server's IP addresses
3. Africa's Talking will only accept requests from those IPs

---

## Testing Your Integration

### 1. Start Your Server
```bash
cd server
npm start
```

### 2. Test with Postman or curl

**Create SMS Campaign:**
```bash
curl -X POST http://localhost:5000/api/communications/sms/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "lgas": ["Ikeja"],
    "messageTemplate": "Hello {{first_name}}, test message from Obidient Movement!",
    "title": "Test Campaign"
  }'
```

### 3. Monitor Queue Processing
```bash
# Check queue health
npm run queue:health

# Monitor PM2 workers
pm2 logs sms-worker
pm2 logs voice-worker
```

### 4. Check Africa's Talking Dashboard

1. Go to **SMS > Logs** or **Voice > Logs**
2. You should see your API calls
3. Check delivery status

---

## Common Issues & Solutions

### Issue 1: "Invalid API Key"
**Solution**: 
- Double-check your API key (no extra spaces)
- Ensure you're using the right environment (sandbox vs production)
- Regenerate API key if needed

### Issue 2: "Invalid Phone Number"
**Solution**:
- Use international format: `+234XXXXXXXXX`
- In sandbox, register test numbers first
- Remove any spaces or dashes from numbers

### Issue 3: "Insufficient Balance"
**Solution**:
- In production, top up your account
- Check balance in dashboard: **Billing > Balance**

### Issue 4: "Sender ID Not Approved"
**Solution**:
- Use default sender (leave `AT_SMS_SENDER_ID` empty)
- Or wait for sender ID approval
- In sandbox, any sender ID works

### Issue 5: "No Voice Number"
**Solution**:
- Purchase a phone number in dashboard
- Or use Africa's Talking's test number in sandbox

---

## Moving from Sandbox to Production

### Checklist:

- [ ] Test thoroughly in sandbox
- [ ] Request and get approval for Sender ID
- [ ] Purchase a voice phone number
- [ ] Switch to production credentials in `.env`
- [ ] Top up account with credits
- [ ] Set up IP whitelisting (optional)
- [ ] Configure webhooks with your domain
- [ ] Update `AT_VOICE_FALLBACK_AUDIO_URL` with production audio
- [ ] Start with small test campaigns
- [ ] Monitor costs and delivery rates

### Update `.env` for Production:
```bash
# Change from sandbox to production
AT_USERNAME=YourProductionAppName
AT_API_KEY=your_production_api_key
AT_SMS_SENDER_ID=OBIDIENT  # Must be approved
AT_VOICE_CALLER_ID=+234XXXXXXXXX  # Your purchased number
```

---

## Useful Resources

- **Africa's Talking Dashboard**: https://account.africastalking.com/
- **API Documentation**: https://developers.africastalking.com/
- **SMS API Docs**: https://developers.africastalking.com/docs/sms/overview
- **Voice API Docs**: https://developers.africastalking.com/docs/voice/overview
- **Support**: support@africastalking.com
- **Community**: https://help.africastalking.com/

## Quick Reference Card

```bash
# Sandbox Testing
Username: sandbox
API Key: [Get from dashboard > Sandbox > Settings]
Sender ID: Any name (testing)
Voice Number: Any number (testing)

# Production
Username: [Your app name]
API Key: [Get from dashboard > Production > Settings]
Sender ID: [Must be approved]
Voice Number: [Must purchase]

# Test Numbers Format
Nigeria: +234XXXXXXXXX (11 digits after +234)
Kenya: +254XXXXXXXXX (9 digits after +254)
```

---

## Next Steps After Setup

1. ✅ Sign up for Africa's Talking account
2. ✅ Get sandbox credentials
3. ✅ Update `.env` with credentials
4. ✅ Register test phone numbers in sandbox
5. ✅ Test SMS sending via API
6. ✅ Test voice calls via API
7. ✅ Request sender ID approval
8. ✅ Upload voice audio files
9. ✅ Start PM2 workers
10. ✅ Run test campaign with real data

**Ready to proceed?** Once you have your credentials, update the `.env` file and we can test the integration!
