# Bulk Communications System - VPS Production Setup Guide

This guide walks you through setting up the SMS and Voice communications system on your VPS server.

---

## Prerequisites

- Ubuntu/Debian VPS with SSH access
- Node.js 18+ installed
- PostgreSQL database running
- Redis 6.2+ installed
- Domain name (for webhooks)
- Africa's Talking account with API credentials

---

## Step 1: Install Required Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Redis (if not already installed)
sudo apt install -y redis-server

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG

# Install PM2 globally for process management
sudo npm install -g pm2
```

---

## Step 2: Setup Database Schema

```bash
# Navigate to your server directory
cd /path/to/your/server

# Run the location optimization indexes script
node scripts/optimize_location_indexes.js

# Verify indexes were created
psql $DB_URI -c "SELECT indexname FROM pg_indexes WHERE tablename = 'inec_voters';"
```

Expected indexes:
- `idx_inec_voters_state` (for state queries)
- `idx_inec_voters_state_lga` (for state + LGA queries)
- `idx_inec_voters_phone_valid` (for phone number validation)

---

## Step 3: Configure Environment Variables

```bash
# Edit your .env file
nano /path/to/your/server/.env
```

Add/update these variables:

```env
# Africa's Talking Credentials
AT_USERNAME=your_africastalking_username
AT_API_KEY=your_africastalking_api_key
AT_SENDER_ID=YourApprovedSenderID

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_any

# Webhook Base URL (your domain)
WEBHOOK_BASE_URL=https://yourdomain.com

# Database
DB_URI=postgresql://user:password@host:5432/database

# Server Port
PORT=5000

# File Upload Directory
UPLOAD_DIR=/path/to/uploads
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 4: Test Africa's Talking Connection

```bash
# Test AT API credentials
npm run test:at

# Check AT account balance and status
npm run test:at-account
```

Expected output:
- ✓ API connection successful
- Balance: KES XXX.XX
- Phone number active

---

## Step 5: Configure PM2 Ecosystem

Create PM2 ecosystem file:

```bash
nano ecosystem.config.cjs
```

Add this configuration:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-server',
      script: './server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'sms-worker',
      script: './workers/smsWorker.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/sms-worker-error.log',
      out_file: './logs/sms-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'voice-worker',
      script: './workers/voiceWorker.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/voice-worker-error.log',
      out_file: './logs/voice-worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

---

## Step 6: Start Services with PM2

```bash
# Create logs directory
mkdir -p logs

# Start all services
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs

# Save PM2 process list (survives server restart)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by PM2
```

Expected output:
```
┌────┬─────────────────┬─────────┬─────────┬──────────┬────────┐
│ id │ name            │ status  │ restart │ uptime   │ cpu    │
├────┼─────────────────┼─────────┼─────────┼──────────┼────────┤
│ 0  │ api-server      │ online  │ 0       │ 2s       │ 0%     │
│ 1  │ sms-worker      │ online  │ 0       │ 2s       │ 0%     │
│ 2  │ sms-worker      │ online  │ 0       │ 2s       │ 0%     │
│ 3  │ voice-worker    │ online  │ 0       │ 2s       │ 0%     │
│ 4  │ voice-worker    │ online  │ 0       │ 2s       │ 0%     │
└────┴─────────────────┴─────────┴─────────┴──────────┴────────┘
```

---

## Step 7: Configure Nginx for Webhooks

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/your-domain
```

Add webhook location blocks:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL configuration...

    # Existing API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Add webhook endpoints (IMPORTANT!)
    location /webhooks/communications/sms/delivery {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /webhooks/communications/voice/status {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Test and reload Nginx:

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 8: Configure Africa's Talking Webhooks

1. **Log in to Africa's Talking Dashboard**
   - Go to https://account.africastalking.com/

2. **Configure SMS Delivery Reports**
   - Navigate to: SMS → Settings → Delivery Reports
   - Set Callback URL: `https://yourdomain.com/webhooks/communications/sms/delivery`
   - Method: POST
   - Save

3. **Configure Voice Callbacks**
   - Navigate to: Voice → Settings → Callbacks
   - Set Status Callback URL: `https://yourdomain.com/webhooks/communications/voice/status`
   - Method: POST
   - Save

---

## Step 9: Test Webhook Integration

```bash
# Test SMS webhook
npm run test:webhooks:sms

# Test Voice webhook
npm run test:webhooks:voice

# Check queue health
npm run queue:health
```

Expected output:
- ✓ SMS webhook responding
- ✓ Voice webhook responding
- Redis connection: healthy
- SMS Queue: 0 waiting, 0 active, 0 failed
- Voice Queue: 0 waiting, 0 active, 0 failed

---

## Step 10: Monitor the System

### View Real-time Logs

```bash
# All services
pm2 logs

# Specific service
pm2 logs api-server
pm2 logs sms-worker
pm2 logs voice-worker

# Last 100 lines
pm2 logs --lines 100
```

### Check Queue Status

```bash
# Queue health check
npm run queue:health

# Redis CLI for manual inspection
redis-cli

# In Redis CLI, check keys:
> KEYS *bull*
> LLEN bull:sms-queue:wait
> LLEN bull:voice-queue:wait
```

### Check PM2 Metrics

```bash
# Detailed status
pm2 status

# Monitoring dashboard
pm2 monit

# Application logs location
ls -lh logs/
```

---

## Step 11: Deploy Frontend Build

```bash
# Navigate to frontend directory
cd /path/to/your/frontend

# Build production version
npm run build

# Copy build to web server
sudo cp -r dist/* /var/www/html/
# OR if using specific directory:
sudo cp -r dist/* /var/www/yourdomain.com/

# Ensure proper permissions
sudo chown -R www-data:www-data /var/www/html/
# OR
sudo chown -R www-data:www-data /var/www/yourdomain.com/
```

---

## Step 12: Verify Everything Works

### Test from Frontend

1. Access your app: `https://yourdomain.com/dashboard/admin/communications`
2. Try creating a test SMS campaign with 1 LGA
3. Monitor the backend logs:
   ```bash
   pm2 logs sms-worker
   ```

### Test API Endpoints

```bash
# Test states endpoint
curl -X GET https://yourdomain.com/api/locations/states \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test LGAs endpoint
curl -X GET https://yourdomain.com/api/locations/states/Anambra/lgas \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test voter count
curl -X POST https://yourdomain.com/api/locations/voter-count \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state":"Anambra","lgas":["Awka North"]}'
```

---

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis-server

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Test Redis connection
redis-cli ping
```

### Worker Not Processing Jobs

```bash
# Restart workers
pm2 restart sms-worker
pm2 restart voice-worker

# Check worker logs
pm2 logs sms-worker --lines 50
```

### Webhook Not Receiving Callbacks

```bash
# Test webhook endpoint manually
curl -X POST https://yourdomain.com/webhooks/communications/sms/delivery \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "phoneNumber": "+2348012345678",
    "status": "Success"
  }'

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Performance Issues

```bash
# Check if indexes exist
psql $DB_URI -c "\d+ inec_voters"

# Analyze query performance
psql $DB_URI -c "EXPLAIN ANALYZE SELECT DISTINCT lga FROM inec_voters WHERE state = 'Anambra';"

# Rebuild indexes if needed
psql $DB_URI -c "REINDEX TABLE inec_voters;"
```

---

## Maintenance Commands

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart services
pm2 restart all
```

### Clear Failed Jobs

```bash
# Connect to Redis
redis-cli

# Delete failed jobs
> DEL bull:sms-queue:failed
> DEL bull:voice-queue:failed
> exit
```

### Backup Campaign Data

```bash
# Backup campaigns table
pg_dump -h hostname -U username -t communication_campaigns -t communication_batches database_name > campaigns_backup_$(date +%Y%m%d).sql
```

### Monitor Costs

```bash
# Check Africa's Talking balance
npm run test:at-account

# Query campaign costs from database
psql $DB_URI -c "SELECT 
  COUNT(*) as total_campaigns,
  SUM(total_recipients) as total_messages,
  SUM(total_cost) as total_spent,
  AVG(total_cost/NULLIF(total_recipients,0)) as avg_cost_per_message
FROM communication_campaigns 
WHERE created_at > NOW() - INTERVAL '30 days';"
```

---

## Security Best Practices

1. **Firewall Configuration**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

2. **Secure Redis**
   ```bash
   # Set Redis password
   sudo nano /etc/redis/redis.conf
   # Add: requirepass your_strong_password
   sudo systemctl restart redis-server
   ```

3. **Rotate Logs**
   ```bash
   # PM2 log rotation
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 30
   ```

4. **Monitor Failed Login Attempts**
   ```bash
   # Install fail2ban
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

---

## Performance Tuning

### For Large Campaigns (100K+ recipients)

1. **Increase Worker Instances**
   ```bash
   # Edit ecosystem.config.cjs
   # Increase instances for sms-worker and voice-worker to 4-6
   pm2 delete all
   pm2 start ecosystem.config.cjs
   ```

2. **Optimize PostgreSQL**
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```
   
   Key settings:
   ```conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   random_page_cost = 1.1
   effective_io_concurrency = 200
   work_mem = 16MB
   ```

3. **Redis Optimization**
   ```bash
   sudo nano /etc/redis/redis.conf
   ```
   
   Key settings:
   ```conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   save ""  # Disable RDB snapshots for better performance
   ```

---

## Success Checklist

- [ ] Redis is running and accessible
- [ ] Database indexes are created
- [ ] Environment variables are configured
- [ ] Africa's Talking credentials are valid
- [ ] PM2 services are running (api-server, sms-worker, voice-worker)
- [ ] Nginx is configured and serving webhooks
- [ ] Webhooks are registered in Africa's Talking dashboard
- [ ] Frontend is built and deployed
- [ ] Can access communications dashboard at `/dashboard/admin/communications`
- [ ] States and LGAs load dynamically from database
- [ ] Test SMS campaign successfully sends
- [ ] Webhook callbacks are being received
- [ ] Logs are being written and rotated

---

## Support & Resources

- **Africa's Talking Docs**: https://developers.africastalking.com/
- **BullMQ Docs**: https://docs.bullmq.io/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Redis Docs**: https://redis.io/docs/

---

## Notes

- **Sender ID Approval**: Request approval from Africa's Talking for your sender ID (takes 1-2 business days)
- **Test Mode**: Use Africa's Talking sandbox for testing before production
- **Cost Estimation**: SMS in Nigeria costs ~₦2-3 per message, Voice calls ~₦5-10 per minute
- **Rate Limits**: Africa's Talking has rate limits; adjust batch sizes accordingly
- **Scaling**: For very large campaigns (1M+), consider horizontal scaling with multiple VPS instances

---

*Last Updated: November 2025*
