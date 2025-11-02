# Redis Setup Guide for Obidient Movement Communications System

## Installation (macOS)

### 1. Install Redis via Homebrew
```bash
brew install redis
```

### 2. Start Redis

**Option A: Run in foreground (for testing)**
```bash
redis-server
```
Press `Ctrl+C` to stop. Redis will be available at `redis://127.0.0.1:6379`

**Option B: Run as background service (recommended for development)**
```bash
# Start Redis and auto-start on login
brew services start redis

# Check status
brew services list

# Stop Redis service
brew services stop redis

# Restart Redis service
brew services restart redis
```

### 3. Verify Redis is Running
```bash
# Test connection
redis-cli ping
# Should return: PONG

# Check Redis info
redis-cli info server

# Monitor real-time commands (optional)
redis-cli monitor
```

## Configuration for Your Project

### Update `.env` File
After Redis is running, update your `server/.env`:

```bash
# Change this line:
REDIS_URL=redis://YOUR_REDIS_HOST:6379/0

# To this (for local development):
REDIS_URL=redis://127.0.0.1:6379/0

# Or for production with password:
REDIS_URL=redis://:password@your-redis-host:6379/0
```

### Test Queue Connection
After updating `.env`, run:
```bash
cd server
npm run queue:health
```

Expected output:
```
Redis connection OK (ping: PONG) using prefix: bulk-communications
SMS queue is empty.
Voice queue is empty.
```

## Understanding Redis Basics

### What is Redis?
Redis is an in-memory data store used as a database, cache, and message broker. For this project, it powers BullMQ job queues for SMS and voice campaigns.

### Key Concepts for This Project

1. **Queues**: Named channels where jobs are placed
   - `sms-broadcast` - SMS message jobs
   - `voice-broadcast` - Voice call jobs

2. **Jobs**: Individual tasks (e.g., sending one batch of SMS messages)
   - Each job has data (campaignId, batchId, recipients)
   - Jobs can be: waiting, active, completed, or failed

3. **Workers**: Processes that consume jobs from queues
   - `smsWorker.js` - Processes SMS jobs
   - `voiceWorker.js` - Processes voice jobs

### Useful Redis CLI Commands

```bash
# Connect to Redis
redis-cli

# Inside redis-cli:
PING                          # Test connection
KEYS *                        # List all keys (use carefully in production)
KEYS bulk-communications:*    # List queue-related keys
GET key_name                  # Get value of a key
DEL key_name                  # Delete a key
FLUSHDB                       # Clear current database (use with caution!)
FLUSHALL                      # Clear all databases (dangerous!)
INFO                          # Server info
DBSIZE                        # Number of keys

# Monitor queue activity
redis-cli --scan --pattern "bulk-communications:*"
```

## Production Setup

### Cloud Redis Options

1. **Redis Cloud** (Redis Labs)
   - Free tier: 30MB
   - https://redis.com/try-free/

2. **AWS ElastiCache**
   - Managed Redis service
   - https://aws.amazon.com/elasticache/

3. **DigitalOcean Managed Redis**
   - $15/month starting
   - https://www.digitalocean.com/products/managed-databases-redis

4. **Upstash**
   - Serverless Redis
   - Pay-per-request pricing
   - https://upstash.com/

### Security Best Practices

1. **Always use authentication in production**
   ```bash
   # In redis.conf
   requirepass your_strong_password_here
   
   # Connection string format:
   REDIS_URL=redis://:your_strong_password_here@host:6379/0
   ```

2. **Use TLS/SSL for production**
   ```bash
   REDIS_URL=rediss://user:password@host:6379/0
   # Note the 'rediss://' (with double 's')
   ```

3. **Enable persistence** (for production)
   ```bash
   # In redis.conf
   save 900 1      # Save if 1 key changed in 900 seconds
   save 300 10     # Save if 10 keys changed in 300 seconds
   save 60 10000   # Save if 10000 keys changed in 60 seconds
   ```

4. **Set maxmemory policy**
   ```bash
   # In redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   ```

## Troubleshooting

### Redis won't start
```bash
# Check if port 6379 is already in use
lsof -i :6379

# View Redis logs
brew services info redis
tail -f /usr/local/var/log/redis.log
```

### Connection refused errors
```bash
# Check if Redis is running
brew services list

# Try connecting manually
redis-cli ping

# Check Redis configuration
cat /usr/local/etc/redis.conf | grep -v "^#" | grep -v "^$"
```

### Clear stuck jobs
```bash
# Inside your project
cd server
node -e "
const { Queue } = require('bullmq');
const { createRedisClient } = require('./config/redis.js');
const redis = createRedisClient();
const sms = new Queue('sms-broadcast', { connection: redis, prefix: 'bulk-communications' });
const voice = new Queue('voice-broadcast', { connection: redis, prefix: 'bulk-communications' });
(async () => {
  await sms.obliterate({ force: true });
  await voice.obliterate({ force: true });
  console.log('Queues cleared');
  process.exit(0);
})();
"
```

### Memory issues
```bash
# Check Redis memory usage
redis-cli INFO memory

# Clear specific queue
redis-cli --scan --pattern "bulk-communications:sms-broadcast:*" | xargs redis-cli DEL
```

## Next Steps After Setup

1. ✅ Install and start Redis
2. ✅ Update `REDIS_URL` in `.env`
3. ✅ Run `npm run queue:health` to verify
4. ✅ Update Africa's Talking credentials in `.env`
5. ✅ Test with a small campaign
6. ✅ Start PM2 workers: `pm2 start scripts/pm2/communications.ecosystem.config.js`
7. ✅ Monitor: `pm2 logs` and `pm2 monit`

## Monitoring Queue Health

### Via Script
```bash
npm run queue:health
```

### Via Redis CLI
```bash
redis-cli
> KEYS bulk-communications:*
> HGETALL "bull:bulk-communications:sms-broadcast:meta"
```

### Via PM2
```bash
pm2 logs sms-worker
pm2 logs voice-worker
pm2 monit
```

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Africa's Talking API Docs](https://developers.africastalking.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
