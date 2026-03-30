# Live Results Endpoint - Testing Guide

## Overview
The Live Results Cache endpoint provides real-time election results with Redis caching to handle high traffic during election day.

## Endpoints

### 1. Get Live Election Summary
**GET** `/api/live-results/elections/:electionId/live-summary`

**Authentication:** Required (Bearer token)  
**Monitoring Key:** NOT required (accessible to all authenticated users)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "election": {
      "electionId": "abc123",
      "electionName": "2027 Presidential Election",
      "electionType": "presidential",
      "state": "National",
      "lga": null,
      "electionDate": "2027-02-25",
      "status": "ongoing"
    },
    "summary": {
      "pollingUnitsReported": 1234,
      "totalRegisteredVoters": 95000000,
      "totalAccreditedVoters": 28500000,
      "totalValidVotes": 27800000,
      "totalRejectedVotes": 250000,
      "totalVotesCast": 28050000,
      "voterTurnout": "29.53"
    },
    "parties": [
      {
        "partyCode": "LP",
        "partyName": "Labour Party",
        "displayName": "Labour Party (LP)",
        "color": "#228B22",
        "displayOrder": 1,
        "metadata": {},
        "aliases": ["LABOUR", "LP", "LABOUR PARTY"],
        "totalVotes": 12500000,
        "percentage": "44.96",
        "pollingUnitsReported": 1234
      },
      {
        "partyCode": "APC",
        "partyName": "All Progressives Congress",
        "displayName": "APC",
        "color": "#FF0000",
        "displayOrder": 2,
        "metadata": {},
        "aliases": ["APC", "ALL PROGRESSIVES CONGRESS"],
        "totalVotes": 9200000,
        "percentage": "33.09",
        "pollingUnitsReported": 1234
      }
    ],
    "lastUpdated": "2027-02-25T15:30:45.000Z",
    "submissionsCount": 1234
  }
}
```

**Response (304):**  
Not Modified - Client's cached version is still valid (based on ETag)

**Response (404):**
```json
{
  "success": false,
  "message": "Election not found"
}
```

**Response Headers:**
- `ETag`: MD5 hash of results for conditional requests
- `Cache-Control`: `public, max-age=60` (clients can cache for 60 seconds)
- `Last-Modified`: Timestamp of last cache update

---

### 2. Invalidate Cache (Admin Only)
**POST** `/api/live-results/elections/:electionId/invalidate-cache`

**Authentication:** Required (Bearer token)  
**Authorization:** Admin role required

**Response (200):**
```json
{
  "success": true,
  "message": "Cache invalidated successfully"
}
```

---

## Testing Steps

### Prerequisites
1. Start Redis server:
   ```bash
   brew services start redis
   # OR
   redis-server
   ```

2. Verify Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

3. Ensure backend server is running:
   ```bash
   cd server
   npm run dev
   ```

4. Have at least one election with result submissions in the database

---

### Test 1: Basic Cache Flow

```bash
# Get your auth token
TOKEN="your_jwt_token_here"

# Get election ID from database
ELECTION_ID="your_election_id"

# First request (cache miss - slow)
curl -w "\nTime: %{time_total}s\n" \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN"

# Second request within 60s (cache hit - fast)
curl -w "\nTime: %{time_total}s\n" \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- First request: 200-500ms (database query)
- Second request: <10ms (Redis cache)

---

### Test 2: ETag Conditional Requests

```bash
# First request - get ETag
RESPONSE=$(curl -s -D - \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN")

# Extract ETag
ETAG=$(echo "$RESPONSE" | grep -i etag | cut -d' ' -f2 | tr -d '\r')

echo "ETag: $ETAG"

# Second request with If-None-Match
curl -D - \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN" \
  -H "If-None-Match: $ETAG"
```

**Expected:**
- First request: 200 OK with full body
- Second request: 304 Not Modified with no body

---

### Test 3: Cache Invalidation (Admin)

```bash
# Invalidate cache
curl -X POST \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/invalidate-cache" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Verify cache cleared
redis-cli GET "live-results:$ELECTION_ID"
# Should return: (nil)

# Next request will be cache miss
curl -w "\nTime: %{time_total}s\n" \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Test 4: Redis Monitoring

```bash
# Monitor all Redis commands in real-time
redis-cli MONITOR

# In another terminal, make requests to the endpoint
# You should see GET/SETEX commands for "live-results:*" keys
```

---

### Test 5: Fallback to Memory Cache

```bash
# Stop Redis
brew services stop redis
# OR press Ctrl+C if running redis-server

# Make request (should still work with memory cache)
curl "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary" \
  -H "Authorization: Bearer $TOKEN"

# Check logs - should see "Redis not available, using memory cache"
tail -f logs/server.log
```

---

## Load Testing

### Using Apache Bench (ab)

```bash
# Install if not available
brew install httpd

# Test sustained load (100 requests, 10 concurrent)
ab -n 100 -c 10 \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary"
```

**Expected Performance:**
- **Without cache:** ~5-10 req/sec (limited by database)
- **With cache:** ~500-1000 req/sec (limited by network/parsing)

### Using autocannon (Node.js)

```bash
# Install
npm install -g autocannon

# Run load test
autocannon -c 10 -d 30 \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/live-summary"
```

---

## Monitoring in Production

### Redis Cache Status

```bash
# View all live results keys
redis-cli KEYS "live-results:*"

# Check specific election cache
redis-cli GET "live-results:abc123"

# Check TTL (time to live)
redis-cli TTL "live-results:abc123"
# Returns seconds remaining, -1 if no expiry, -2 if key doesn't exist

# Get cache stats
redis-cli INFO stats
```

### Application Logs

```bash
# Watch cache hit/miss logs
tail -f logs/server.log | grep "Cache hit\|Cache miss"

# Example output:
# [INFO] Cache miss - aggregating live results | electionId: abc123
# [INFO] Cache hit for live results | electionId: abc123
```

### Performance Metrics

Monitor these key metrics in production:

1. **Cache Hit Rate:** Should be >90% during active election
2. **Response Time (P95):** 
   - Cache hit: <20ms
   - Cache miss: <300ms
3. **Redis Memory Usage:** ~1-5KB per election result
4. **Error Rate:** <0.1%

---

## Troubleshooting

### Issue: Cache not working

```bash
# Check Redis connection
redis-cli PING

# Check environment variable
echo $REDIS_URL

# Check server logs
tail -f logs/server.log | grep Redis
```

### Issue: Stale data

```bash
# Manually clear cache
redis-cli DEL "live-results:abc123"

# OR use admin endpoint
curl -X POST \
  "http://localhost:5000/api/live-results/elections/$ELECTION_ID/invalidate-cache" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Issue: High memory usage

```bash
# Check Redis memory
redis-cli INFO memory

# Clear all live results caches
redis-cli --scan --pattern "live-results:*" | xargs redis-cli DEL
```

---

## Integration with Frontend

### React Example

```typescript
import { useEffect, useState } from 'react';

interface LiveResults {
  election: any;
  summary: any;
  parties: any[];
  lastUpdated: string;
}

export function useLiveResults(electionId: string) {
  const [data, setData] = useState<LiveResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [etag, setEtag] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      if (etag) {
        headers['If-None-Match'] = etag;
      }

      const response = await fetch(
        `/api/live-results/elections/${electionId}/live-summary`,
        { headers }
      );

      if (response.status === 304) {
        // Data hasn't changed
        setLoading(false);
        return;
      }

      const newEtag = response.headers.get('etag');
      if (newEtag) setEtag(newEtag);

      const result = await response.json();
      setData(result.data);
      setLoading(false);
    };

    fetchResults();

    // Refresh every 60 seconds
    const interval = setInterval(fetchResults, 60000);

    return () => clearInterval(interval);
  }, [electionId, etag]);

  return { data, loading };
}
```

---

## Success Criteria

✅ **Cache Working:**
- First request takes 200-500ms
- Subsequent requests take <10ms
- TTL correctly set to 60 seconds

✅ **ETag Working:**
- 304 responses when data unchanged
- Reduced bandwidth usage

✅ **Fallback Working:**
- System continues functioning if Redis unavailable
- Memory cache serves requests

✅ **Load Handling:**
- Sustains >100 req/sec with cache
- No errors under load
- Database load reduced by >95%

---

## Next Steps After Testing

1. Configure Redis persistence (RDB + AOF) for production
2. Set up Redis monitoring/alerting
3. Implement cache warming for active elections
4. Add Prometheus metrics for cache hit rate
5. Document Redis scaling strategy for very high traffic
