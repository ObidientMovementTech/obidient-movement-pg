# Communications API Documentation

## Base URL
```
Production: https://your-domain.com/api/communications
Development: http://localhost:5000/api/communications
```

## Authentication
All endpoints (except webhooks) require admin authentication:
```
Authorization: Bearer <admin_jwt_token>
```

---

## 📧 SMS Campaigns

### Create SMS Campaign
Send bulk SMS to members in selected LGAs.

**Endpoint:** `POST /sms`

**Request:**
```json
{
  "title": "Campaign Title",
  "lgas": ["Ikeja", "Surulere"],
  "messageTemplate": "Hello {{first_name}}, this is from {{lga}} chapter!",
  "metadata": {
    "campaign_tag": "optional_tag",
    "notes": "Any additional info"
  },
  "throttledRate": 100
}
```

**Parameters:**
- `title` (string, required): Campaign name
- `lgas` (array, required): List of LGA names to target
- `messageTemplate` (string, required): Message with placeholders
- `metadata` (object, optional): Additional campaign data
- `throttledRate` (number, optional): Messages per hour limit

**Template Variables:**
- `{{first_name}}` - Recipient's first name
- `{{last_name}}` - Recipient's last name
- `{{full_name}}` - Full name
- `{{lga}}` - LGA name
- `{{ward}}` - Ward name
- `{{polling_unit}}` - Polling unit

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "title": "Campaign Title",
      "campaign_type": "sms",
      "status": "active",
      "total_recipients": 1500,
      "created_at": "2025-10-29T00:00:00.000Z"
    },
    "totalRecipients": 1500,
    "batches": [
      {
        "id": 1,
        "batch_number": 1,
        "recipient_count": 500
      }
    ]
  }
}
```

---

## 📞 Voice Campaigns

### Upload Audio Asset
Upload audio file for voice campaigns.

**Endpoint:** `POST /audio-assets`

**Request:** `multipart/form-data`
```
title: "Campaign Audio 2025"
description: "Main campaign message"
file: <audio_file.mp3>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Campaign Audio 2025",
    "provider_url": "https://s3.amazonaws.com/bucket/audio.mp3",
    "created_at": "2025-10-29T00:00:00.000Z"
  }
}
```

### List Audio Assets
Get all uploaded audio files.

**Endpoint:** `GET /audio-assets`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Campaign Audio 2025",
      "provider_url": "https://...",
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  ]
}
```

### Create Voice Campaign
Make automated calls to members.

**Endpoint:** `POST /voice`

**Request:**
```json
{
  "title": "Voice Campaign Title",
  "lgas": ["Ikeja"],
  "audioAssetId": 1,
  "metadata": {
    "campaign_tag": "voice_2025"
  }
}
```

**Parameters:**
- `title` (string, required): Campaign name
- `lgas` (array, required): Target LGAs
- `audioAssetId` (number, required): ID from `/audio-assets`
- `metadata` (object, optional): Additional data

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 2,
      "title": "Voice Campaign Title",
      "campaign_type": "voice",
      "status": "active",
      "total_recipients": 500,
      "audio_asset_id": 1
    },
    "totalRecipients": 500,
    "batches": [...]
  }
}
```

---

## 📊 Campaign Management

### List Campaigns
Get all campaigns with filtering.

**Endpoint:** `GET /campaigns`

**Query Parameters:**
- `type` (string, optional): `sms` or `voice`
- `status` (string, optional): `active`, `completed`, `cancelled`
- `limit` (number, optional): Results per page (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:**
```
GET /campaigns?type=sms&status=active&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Weekend Rally",
      "campaign_type": "sms",
      "status": "active",
      "total_recipients": 1500,
      "processed_count": 1000,
      "success_count": 950,
      "failure_count": 50,
      "created_at": "2025-10-29T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

### Get Campaign Summary
Get detailed campaign statistics.

**Endpoint:** `GET /campaigns/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 1,
      "title": "Weekend Rally",
      "campaign_type": "sms",
      "status": "active",
      "total_recipients": 1500,
      "processed_count": 1500,
      "success_count": 1200,
      "failure_count": 300,
      "message_template": "Hello {{first_name}}...",
      "created_at": "2025-10-29T00:00:00.000Z",
      "updated_at": "2025-10-29T01:00:00.000Z"
    },
    "batches": [
      {
        "id": 1,
        "batch_number": 1,
        "status": "completed",
        "recipient_count": 500,
        "processed_recipients": 500,
        "success_count": 450,
        "failure_count": 50
      }
    ],
    "stats": {
      "deliveryRate": "80%",
      "averageCost": "NGN 2.50",
      "totalCost": "NGN 3,750"
    }
  }
}
```

### Cancel Campaign
Stop an active campaign.

**Endpoint:** `POST /campaigns/:id/cancel`

**Response:**
```json
{
  "success": true
}
```

---

## 🔔 Webhooks (No Auth Required)

### SMS Delivery Webhook
Africa's Talking calls this endpoint with delivery status.

**Endpoint:** `POST /webhooks/sms?token=YOUR_TOKEN`

**Request Body (from Africa's Talking):**
```json
{
  "id": "ATXid_abc123",
  "status": "Success",
  "phoneNumber": "+234XXXXXXXXX",
  "networkCode": "62001",
  "retryCount": "0",
  "cost": "NGN 2.50"
}
```

**Status Values:**
- `Success` / `Sent` / `Submitted` → delivered
- `Failed` / `Rejected` / `Undeliverable` → failed
- `DeliveryFailure` → delivery failed after sending

**Response:**
```json
{
  "success": true
}
```

### Voice Status Webhook
Africa's Talking calls this for voice call updates.

**Endpoint:** `POST /webhooks/voice?token=YOUR_TOKEN`

**Request Body (Call Active):**
```json
{
  "sessionId": "ATVId_xyz789",
  "clientRequestId": "recipient-123",
  "isActive": "1",
  "status": "InProgress",
  "direction": "Outbound"
}
```

**Response (XML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play url="https://your-domain.com/audio/campaign.mp3"/>
</Response>
```

**Request Body (Call Ended):**
```json
{
  "sessionId": "ATVId_xyz789",
  "clientRequestId": "recipient-123",
  "isActive": "0",
  "status": "Completed",
  "durationInSeconds": "45",
  "hangupCause": "NORMAL_HANGUP"
}
```

**Response:**
```
OK
```

---

## 📈 Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Not admin or invalid webhook token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## 🔐 Webhook Security

Webhooks require a token for authentication. Three methods supported:

**Method 1: Query Parameter (Recommended)**
```
POST /webhooks/sms?token=YOUR_TOKEN
```

**Method 2: Header**
```
x-webhook-token: YOUR_TOKEN
```

**Method 3: Body**
```json
{
  "token": "YOUR_TOKEN",
  ...
}
```

Set your token in `.env`:
```bash
COMMUNICATIONS_WEBHOOK_TOKEN=your_secure_random_token
```

---

## 💡 Examples

### Complete SMS Campaign Flow

```javascript
// 1. Create campaign
const campaign = await fetch('/api/communications/sms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Saturday Rally',
    lgas: ['Ikeja', 'Surulere'],
    messageTemplate: 'Hi {{first_name}}, join us Saturday at {{lga}}!'
  })
});

const { data } = await campaign.json();
console.log(`Campaign ${data.campaign.id} created with ${data.totalRecipients} recipients`);

// 2. Monitor progress
const checkProgress = async (campaignId) => {
  const response = await fetch(`/api/communications/campaigns/${campaignId}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const { data } = await response.json();
  
  console.log(`Progress: ${data.campaign.processed_count}/${data.campaign.total_recipients}`);
  console.log(`Success: ${data.campaign.success_count}, Failed: ${data.campaign.failure_count}`);
};

// 3. Poll every 30 seconds
const interval = setInterval(() => checkProgress(data.campaign.id), 30000);

// 4. Cancel if needed
const cancel = async () => {
  await fetch(`/api/communications/campaigns/${data.campaign.id}/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  clearInterval(interval);
};
```

### Complete Voice Campaign Flow

```javascript
// 1. Upload audio
const formData = new FormData();
formData.append('title', 'Campaign Message');
formData.append('file', audioFile);

const upload = await fetch('/api/communications/audio-assets', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${adminToken}` },
  body: formData
});

const { data: asset } = await upload.json();

// 2. Create voice campaign
const campaign = await fetch('/api/communications/voice', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Voice Broadcast',
    lgas: ['Ikeja'],
    audioAssetId: asset.id
  })
});

const { data } = await campaign.json();
console.log(`Voice campaign created: ${data.campaign.id}`);
```

---

## 🐛 Troubleshooting

### Campaign not processing
- Check PM2 workers are running: `pm2 status`
- Check Redis is running: `redis-cli ping`
- Check queue health: `npm run queue:health`
- View worker logs: `pm2 logs sms-worker`

### Webhooks not being called
- Verify ngrok is running (development)
- Check callback URLs in Africa's Talking dashboard
- Verify webhook token matches `.env`
- Check ngrok dashboard: http://127.0.0.1:4040

### Messages failing to send
- Check Africa's Talking credentials
- Verify sender ID is approved (production)
- Check account balance
- Review Africa's Talking dashboard logs
- Check for DND rejections (Status Code 409)

---

## 📚 Related Documentation

- [Production Checklist](./PRODUCTION_CHECKLIST.md)
- [Redis Setup](./REDIS_SETUP.md)
- [Africa's Talking Setup](./AFRICAS_TALKING_SETUP.md)
- [Callback Setup](./CALLBACK_SETUP.md)

---

**Need help?** Contact support or check the troubleshooting guides above.
