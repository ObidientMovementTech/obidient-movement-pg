# Production Deployment Checklist

## 🎯 **System Status**

Your bulk SMS & Voice communications system is **fully functional**! Here's what's complete:

### ✅ **Backend (Complete)**
- [x] Database migrations for campaigns, batches, recipients
- [x] BullMQ queue system (SMS & Voice)
- [x] Redis integration
- [x] Africa's Talking API integration
- [x] Webhook handlers (SMS delivery, Voice status)
- [x] Admin API endpoints for campaign management
- [x] Workers for processing SMS and Voice jobs
- [x] PM2 ecosystem configuration
- [x] Security (webhook token validation)
- [x] Error handling and logging
- [x] Batch processing with configurable sizes
- [x] Rate limiting and concurrency controls

### ⏳ **Production Requirements (To Complete)**
- [ ] Africa's Talking Sender ID approval
- [ ] DND bypass request (optional but recommended)
- [ ] Production server deployment
- [ ] Frontend UI components
- [ ] User documentation

---

## 📋 **Step 1: Africa's Talking Compliance**

### **A. Request Sender ID Approval**

1. **Login** to [Africa's Talking Dashboard](https://account.africastalking.com/)
2. Go to **SMS → Sender IDs**
3. Click **"Request Sender ID"**
4. Fill in the form:
   - **Sender ID**: `OBIDIENT` (or your preferred name, max 11 characters)
   - **Purpose**: Political campaign communications and member mobilization
   - **Organization**: Obidient Movement
   - **Sample Message**: "Hello {name}, join us for the town hall meeting on Saturday..."
5. **Submit** and wait for approval (1-3 business days)

### **B. Request DND Bypass (Recommended)**

To reach recipients with DND enabled:

1. **Email**: support@africastalking.com
2. **Subject**: "DND Bypass Request - Obidient Movement"
3. **Body**:
   ```
   Hello,
   
   We are requesting DND bypass for our sender ID "OBIDIENT".
   
   Organization: Obidient Movement
   Use Case: Political campaign notifications and voter mobilization
   Message Type: Transactional/Informational (not marketing)
   Expected Volume: 10,000+ messages per campaign
   
   Sample messages will include:
   - Event notifications
   - Polling unit information
   - Volunteer coordination
   - Campaign updates
   
   Our account username: obidients
   
   Thank you.
   ```

### **C. Update Production Environment**

Once approved, update your `.env`:

```bash
# Production Africa's Talking
AT_USERNAME=obidients
AT_API_KEY=your_production_key
AT_SMS_SENDER_ID=OBIDIENT  # Use approved sender ID
AT_VOICE_CALLER_ID=+234XXXXXXXXX  # Your purchased number
```

---

## 📋 **Step 2: Deploy Backend to Production**

### **Server Requirements**
- **Node.js**: v18+ 
- **Redis**: v6+
- **PostgreSQL**: v14+
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores minimum

### **Deployment Options**

#### **Option A: VPS (Recommended)**
- DigitalOcean Droplet
- AWS EC2
- Linode
- Vultr

#### **Option B: Platform as a Service**
- Heroku (with Redis addon)
- Railway.app
- Render.com

### **Deployment Steps**

1. **Setup Server**
   ```bash
   # SSH into your server
   ssh user@your-server-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Redis
   sudo apt update
   sudo apt install redis-server
   sudo systemctl enable redis-server
   sudo systemctl start redis-server
   
   # Install PM2 globally
   sudo npm install -g pm2
   ```

2. **Clone and Setup Project**
   ```bash
   git clone https://github.com/ObidientMovementTech/obidient-movement-pg.git
   cd obidient-movement-pg/server
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Copy and edit .env
   nano .env
   
   # Update these for production:
   NODE_ENV=production
   DB_URI=postgresql://user:pass@host:5432/db
   REDIS_URL=redis://localhost:6379/0
   AT_USERNAME=obidients
   AT_API_KEY=your_key
   AT_SMS_SENDER_ID=OBIDIENT
   CLIENT_URL=https://your-frontend-domain.com
   API_BASE_URL=https://your-api-domain.com
   ```

4. **Setup Webhooks**
   
   In Africa's Talking dashboard:
   - **SMS Callback**: `https://your-api-domain.com/api/communications/webhooks/sms?token=YOUR_TOKEN`
   - **Voice Callback**: `https://your-api-domain.com/api/communications/webhooks/voice?token=YOUR_TOKEN`

5. **Start with PM2**
   ```bash
   # Start all processes (API + Workers)
   pm2 start scripts/pm2/communications.ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on boot
   pm2 startup
   ```

6. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/obidient-api
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/obidient-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-api-domain.com
   ```

---

## 📋 **Step 3: Monitoring & Maintenance**

### **PM2 Commands**
```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart all
pm2 restart all

# Stop all
pm2 stop all
```

### **Check Queue Health**
```bash
cd /path/to/server
npm run queue:health
```

### **Database Monitoring**
```sql
-- Check campaign stats
SELECT 
  id, title, campaign_type, status,
  total_recipients, processed_count,
  success_count, failure_count,
  created_at
FROM communication_campaigns
ORDER BY created_at DESC
LIMIT 10;

-- Check recent recipients
SELECT status, COUNT(*) 
FROM communication_recipients 
GROUP BY status;
```

### **Redis Monitoring**
```bash
redis-cli INFO stats
redis-cli KEYS "bulk-communications:*" | wc -l
```

---

## 📋 **Step 4: API Usage Guide**

### **Authentication**
All admin endpoints require JWT token:
```bash
Authorization: Bearer <admin_jwt_token>
```

### **Create SMS Campaign**
```bash
POST /api/communications/sms
Content-Type: application/json

{
  "title": "Weekend Rally Notification",
  "lgas": ["Ikeja", "Surulere", "Yaba"],
  "messageTemplate": "Hello {{first_name}}, join us this Saturday at {{lga}} town hall. See you there!",
  "metadata": {
    "campaign_tag": "rally_2025"
  }
}
```

### **Create Voice Campaign**
```bash
POST /api/communications/voice
Content-Type: application/json

{
  "title": "Campaign Message Broadcast",
  "lgas": ["Ikeja"],
  "audioAssetId": 1,
  "metadata": {
    "campaign_tag": "voice_message_1"
  }
}
```

### **List Campaigns**
```bash
GET /api/communications/campaigns?type=sms&status=active&limit=20&offset=0
```

### **Get Campaign Summary**
```bash
GET /api/communications/campaigns/:id
```

### **Cancel Campaign**
```bash
POST /api/communications/campaigns/:id/cancel
```

### **Upload Audio Asset**
```bash
POST /api/communications/audio-assets
Content-Type: multipart/form-data

{
  "title": "Campaign Audio",
  "file": <audio_file.mp3>
}
```

---

## 📋 **Step 5: Testing Production**

### **1. Test SMS**
```bash
curl -X POST https://your-api-domain.com/api/communications/sms \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Campaign",
    "lgas": ["Ikeja"],
    "messageTemplate": "Test message from production system",
    "metadata": {"test": true}
  }'
```

### **2. Monitor Progress**
```bash
# Check queue
npm run queue:health

# Watch PM2 logs
pm2 logs sms-worker
```

### **3. Verify Webhooks**
- Check server logs for webhook callbacks
- Verify database updates
- Confirm delivery status

---

## 🔒 **Security Checklist**

- [ ] `.env` file not in version control
- [ ] Strong `COMMUNICATIONS_WEBHOOK_TOKEN` set
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW or similar)
- [ ] Only necessary ports open (80, 443, 22)
- [ ] Redis password protected (production)
- [ ] Database using SSL connection
- [ ] Regular backups configured
- [ ] PM2 logs rotated
- [ ] Rate limiting enabled on API

---

## 📊 **Expected Costs**

### **Infrastructure**
- **VPS**: $10-20/month (2GB RAM)
- **Redis Cloud**: Free tier or $5/month
- **Domain**: $10-15/year

### **Africa's Talking**
- **SMS**: ₦2-4 per message
- **Voice**: ₦5-12 per minute
- **Phone Number**: ₦1,000-5,000/month

**Example Campaign Cost:**
- 10,000 SMS recipients × ₦3 = ₦30,000 (~$40 USD)

---

## ✅ **Production Go-Live Checklist**

- [ ] Sender ID approved
- [ ] Server deployed and configured
- [ ] Redis running and accessible
- [ ] Database migrated
- [ ] PM2 processes started
- [ ] SSL certificate installed
- [ ] Webhooks configured in AT dashboard
- [ ] Test campaign sent successfully
- [ ] Monitoring setup (PM2, logs)
- [ ] Backup strategy in place
- [ ] Documentation shared with team
- [ ] Frontend deployed
- [ ] Admin training completed

---

## 📞 **Support Resources**

- **Africa's Talking**: support@africastalking.com
- **API Docs**: https://developers.africastalking.com/
- **PM2 Docs**: https://pm2.keymetrics.io/
- **Your API Documentation**: `server/API_DOCUMENTATION.md`
- **Redis Setup**: `server/REDIS_SETUP.md`
- **Callback Setup**: `server/CALLBACK_SETUP.md`

---

## 🎉 **You're Ready!**

Your backend is production-ready. Once you:
1. Get sender ID approved
2. Deploy to production server
3. Build the frontend UI

You'll have a complete bulk communications platform! 🚀

**Next**: Let's build the frontend admin interface.
