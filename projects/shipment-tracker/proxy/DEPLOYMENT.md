# Cloudflare Worker Deployment Guide

This guide walks you through deploying the DHL API proxy as a Cloudflare Worker.

**Time required:** ~10 minutes
**Cost:** $0 (Free tier supports 100,000 requests/day)

---

## Prerequisites

- Cloudflare account (free): https://dash.cloudflare.com/sign-up
- Your DHL API key: `YOUR_DHL_API_KEY_HERE`

---

## Step 1: Create Cloudflare Worker

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Sign in with your account

2. **Navigate to Workers**
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Click "Create Worker"

3. **Name Your Worker**
   - Name: `shipment-tracker-dhl-proxy` (or any name you prefer)
   - Click "Deploy"

4. **Edit the Worker Code**
   - After deployment, click "Edit code"
   - Delete the default code
   - Copy the entire contents of `cloudflare-worker.js`
   - Paste into the editor
   - Click "Save and Deploy"

---

## Step 2: Add API Key as Secret

1. **Go to Worker Settings**
   - Click on your worker name
   - Click "Settings" tab
   - Click "Variables" in the left menu

2. **Add Environment Variable**
   - Click "Add variable"
   - Type: "Secret" (not "Text")
   - Variable name: `DHL_API_KEY`
   - Value: `YOUR_DHL_API_KEY_HERE`
   - Click "Encrypt and Save"

3. **Deploy Changes**
   - Click "Deploy" at the top right

---

## Step 3: Get Your Worker URL

After deployment, you'll get a URL like:

```
https://shipment-tracker-dhl-proxy.YOUR-SUBDOMAIN.workers.dev
```

**Example:**
```
https://shipment-tracker-dhl-proxy.wayneef84.workers.dev
```

Copy this URL - you'll need it for the app configuration.

---

## Step 4: Test the Worker

### Test 1: Health Check

Open in browser:
```
https://YOUR-WORKER-URL.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T10:30:00.000Z"
}
```

### Test 2: Track a Shipment

Use a real DHL tracking number (or test number from DHL docs):
```
https://YOUR-WORKER-URL.workers.dev/track?awb=1234567890
```

Expected response:
```json
{
  "success": true,
  "data": {
    "shipments": [...]
  },
  "timestamp": "2026-01-22T10:30:00.000Z",
  "source": "DHL Express API"
}
```

If you see an error, check:
- API key is correctly set in environment variables
- DHL API key is valid and active
- Tracking number format is correct

---

## Step 5: Update Shipment Tracker App

Now update your app to use the proxy instead of calling DHL directly.

### Option A: Quick Test (Browser Console)

1. Open `projects/shipment-tracker/index.html`
2. Open browser console (F12)
3. Run:
   ```javascript
   // Test the proxy
   fetch('https://YOUR-WORKER-URL.workers.dev/track?awb=1234567890')
     .then(r => r.json())
     .then(data => console.log(data));
   ```

### Option B: Update API Configuration

Create a configuration file for the proxy URL:

```javascript
// In js/api/dhl.js (when we build it)
var DHL_CONFIG = {
    proxyUrl: 'https://YOUR-WORKER-URL.workers.dev',
    useProxy: true // Set to false for direct API calls
};
```

---

## Step 6: Secure the Worker (Production)

Once everything works, lock down the worker to only accept requests from your domain.

### Update CORS Headers

In `cloudflare-worker.js`, change line 19:

```javascript
// BEFORE (allows all origins - OK for testing)
'Access-Control-Allow-Origin': '*',

// AFTER (only allows your domain)
'Access-Control-Allow-Origin': 'https://wayneef84.github.io',
```

Then redeploy:
1. Edit code in Cloudflare dashboard
2. Update the CORS line
3. Click "Save and Deploy"

### Optional: Add Rate Limiting

Cloudflare Workers can rate limit by IP:

```javascript
// Add at top of handleTrackRequest()
const clientIP = request.headers.get('CF-Connecting-IP');
// Use Cloudflare KV to track request counts per IP
// See: https://developers.cloudflare.com/workers/runtime-apis/kv/
```

---

## Monitoring & Limits

### Free Tier Limits
- **Requests:** 100,000 per day
- **CPU Time:** 10ms per request
- **Memory:** 128MB
- **Script Size:** 1MB

### View Usage
1. Go to Cloudflare dashboard
2. Click on your worker
3. Click "Metrics" tab
4. View requests, errors, and performance

### Set Up Alerts
1. Go to "Notifications" in Cloudflare dashboard
2. Create alert for:
   - High error rate (> 5%)
   - Approaching daily limit (> 80,000 requests)

---

## Troubleshooting

### Error: "DHL API key not configured"
- Check that you added `DHL_API_KEY` as a **Secret** variable
- Make sure you clicked "Deploy" after adding the variable

### Error: "CORS policy blocked"
- Check CORS headers in worker code
- Make sure you're calling from the correct origin
- Try testing with `Access-Control-Allow-Origin: '*'` first

### Error: 401 Unauthorized from DHL
- Your DHL API key is invalid or expired
- Regenerate key at https://developer.dhl.com/
- Update the secret in Cloudflare

### Error: 429 Too Many Requests
- You've hit DHL's rate limit (250 requests/day on free tier)
- Wait 24 hours or upgrade DHL API plan
- Implement client-side cooldown (10+ minutes between queries)

### Worker not responding
- Check worker logs in Cloudflare dashboard
- Look for JavaScript errors in the code editor
- Test with `/health` endpoint first

---

## Alternative: Cloudflare Pages Functions

If you deploy your app to Cloudflare Pages, you can use Pages Functions instead:

```
/projects/shipment-tracker/functions/
└── api/
    └── track.js  # Same code, different deployment
```

This integrates directly with your static site and doesn't require a separate worker.

---

## Cost Estimate

**For typical personal use:**
- Tracking 20 shipments
- Checking each 3x per day
- = 60 requests/day
- **Cost: $0/month** (within free tier)

**For small business:**
- Tracking 100 shipments
- Checking each 5x per day
- = 500 requests/day
- **Cost: $0/month** (still within free tier)

**Enterprise usage:**
- Over 100,000 requests/day
- Paid Workers plan: $5/month + $0.50 per million requests
- See: https://www.cloudflare.com/plans/developer-platform/

---

## Security Best Practices

1. ✅ **Never commit API keys to git**
   - Use environment variables only
   - Add `*.key` to `.gitignore`

2. ✅ **Restrict CORS in production**
   - Only allow your domain
   - Not `*` wildcard

3. ✅ **Monitor for abuse**
   - Set up Cloudflare alerts
   - Check logs weekly

4. ✅ **Rotate keys periodically**
   - Change DHL API key every 6 months
   - Update worker secret when rotated

5. ✅ **Don't log sensitive data**
   - Worker code doesn't log tracking numbers
   - No personal info in console.log

---

## Next Steps

Once the worker is deployed and tested:

1. ✅ Update `js/api/dhl.js` to use proxy URL
2. ✅ Test with real tracking numbers
3. ✅ Build FedEx and UPS proxies (same pattern)
4. ✅ Implement query engine rate limiting
5. ✅ Deploy to GitHub Pages

---

## Support

**Cloudflare Workers Docs:**
- https://developers.cloudflare.com/workers/

**DHL API Docs:**
- https://developer.dhl.com/api-reference/shipment-tracking

**Questions:**
- GitHub Issues: https://github.com/wayneef84/fong-family-arcade/issues

---

*Last Updated: 2026-01-22*
*Author: Wayne Fong (wayneef84)*
