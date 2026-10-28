# Cloudflare Worker Setup Guide

This guide walks you through deploying the Shipment Tracker API proxy to Cloudflare Workers.

## Why You Need This

Your Shipment Tracker app runs in the browser, but carrier APIs (DHL, FedEx, UPS) block direct browser requests due to CORS security policies. This Cloudflare Worker acts as a proxy server that:

- ✅ Receives requests from your browser app
- ✅ Forwards them to carrier APIs (allowed server-to-server)
- ✅ Adds CORS headers to the response
- ✅ Caches OAuth tokens to reduce API calls
- ✅ Returns tracking data to your browser

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com
2. Sign up for a free account (no credit card required for free tier)
3. Verify your email

**Free Tier Limits:**
- 100,000 requests/day (plenty for personal use)
- 10ms CPU time per request
- No credit card needed

## Step 2: Deploy the Worker

### Option A: Quick Deploy (Recommended)

1. Log in to Cloudflare Dashboard
2. Click **Workers & Pages** in left sidebar
3. Click **Create Application**
4. Select **Create Worker**
5. Name it: `shipment-tracker-proxy`
6. Click **Deploy**
7. Click **Edit Code** button
8. **Delete all existing code** in the editor
9. Copy the entire contents of `cloudflare-worker.js` from this repo
10. Paste into the Cloudflare editor
11. Click **Save and Deploy**

### Option B: Wrangler CLI (Advanced)

```bash
npm install -g wrangler
wrangler login
wrangler init shipment-tracker-proxy
# Copy cloudflare-worker.js to the project
wrangler deploy
```

## Step 3: Configure Environment Variables

After deploying, you need to add your API credentials as environment variables.

### In Cloudflare Dashboard:

1. Go to your worker: **Workers & Pages** → `shipment-tracker-proxy`
2. Click **Settings** tab
3. Scroll to **Environment Variables**
4. Click **Add variable**

### Add These Variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `DHL_API_KEY` | Your DHL API key | https://developer.dhl.com |
| `FEDEX_CLIENT_ID` | Your FedEx Client ID | https://developer.fedex.com |
| `FEDEX_CLIENT_SECRET` | Your FedEx Client Secret | https://developer.fedex.com |
| `UPS_CLIENT_ID` | Your UPS Client ID | https://developer.ups.com |
| `UPS_CLIENT_SECRET` | Your UPS Client Secret | https://developer.ups.com |

**Important:** Check "Encrypt" for all secret values (Client IDs, Secrets, API Keys)

### Getting API Credentials:

#### DHL API Key
1. Go to https://developer.dhl.com
2. Create account / Sign in
3. Create a new app
4. Choose **Tracking API**
5. Environment: **Production** (or Sandbox for testing)
6. Copy the **API Key**

#### FedEx OAuth Credentials
1. Go to https://developer.fedex.com
2. Create account / Sign in
3. Create a new project
4. Enable **Track API**
5. Environment: **Sandbox** (test) or **Production**
6. Copy **API Key** (Client ID) and **Secret Key** (Client Secret)

#### UPS OAuth Credentials
1. Go to https://developer.ups.com
2. Create account / Sign in
3. Create a new app
4. Enable **Tracking API**
5. Copy **Client ID** and **Client Secret**

## Step 4: Get Your Worker URL

After deployment, Cloudflare gives you a URL like:

```
https://shipment-tracker-proxy.YOUR_SUBDOMAIN.workers.dev
```

Example:
```
https://shipment-tracker-proxy.wayneef.workers.dev
```

**Copy this URL - you'll need it in Step 5.**

## Step 5: Update Your App Configuration

Now update your Shipment Tracker app to use the proxy.

### Edit `js/api/base.js`

Find the `PROXY_CONFIG` section and update the `baseUrl`:

```javascript
var PROXY_CONFIG = {
    enabled: true,
    baseUrl: 'https://shipment-tracker-proxy.YOUR_SUBDOMAIN.workers.dev',
    timeout: 30000,
    // ... rest of config
};
```

**Replace `YOUR_SUBDOMAIN` with your actual Cloudflare worker URL.**

### Enable Proxy Mode

In the same file, make sure carriers are configured to use the proxy:

```javascript
var CARRIER_CONFIG = {
    DHL: {
        useProxy: true,  // ← Should be true
        // ...
    },
    FedEx: {
        useProxy: true,  // ← Should be true
        // ...
    },
    UPS: {
        useProxy: true,  // ← Should be true
        // ...
    }
};
```

## Step 6: Test the Proxy

### Test Health Endpoint

Open your browser and visit:
```
https://shipment-tracker-proxy.YOUR_SUBDOMAIN.workers.dev/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-01-24T08:00:00.000Z"
}
```

### Test DHL Tracking

Visit:
```
https://shipment-tracker-proxy.YOUR_SUBDOMAIN.workers.dev/dhl/track?awb=1234567890
```

You should see a JSON response with tracking data (or error if AWB is invalid).

### Test in Your App

1. Open your Shipment Tracker app
2. Go to Settings
3. Enable "Use Proxy Server"
4. Enter a real tracking number
5. Click "Add Tracking"
6. Click "Force Refresh" on the tracking
7. Check console for `[DHL] Using proxy:` or `[FedEx] Using proxy:`

## Step 7: Monitor Usage

### View Logs

1. Go to Cloudflare Dashboard
2. Click your worker
3. Click **Logs** tab → **Begin log stream**
4. Perform tracking operations in your app
5. Watch real-time logs

### Check Metrics

1. Click **Metrics** tab
2. View requests, errors, CPU time
3. Free tier shows last 24 hours

## Troubleshooting

### Error: "CORS policy blocked"

**Problem:** Your app domain isn't allowed.

**Fix:** Edit worker code, update `CORS_HEADERS`:
```javascript
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://wayneef84.github.io',  // ← Your domain
    // ...
};
```

### Error: "API key not configured"

**Problem:** Environment variables not set.

**Fix:**
1. Go to Worker Settings → Environment Variables
2. Add the missing credentials
3. Click "Deploy" again after adding variables

### Error: "OAuth request failed"

**Problem:** Invalid FedEx/UPS credentials.

**Fix:**
1. Double-check Client ID and Secret
2. Make sure you're using the right environment (sandbox vs production)
3. Verify credentials in carrier developer portal

### Error: "Rate limit exceeded"

**Problem:** Too many requests to carrier API.

**Fix:**
- DHL: 250 requests/day (free tier)
- FedEx: Varies by plan
- UPS: Varies by plan
- Worker caches OAuth tokens to reduce calls

### Worker Not Updating

**Problem:** Code changes don't appear.

**Fix:**
1. Clear Cloudflare cache
2. Wait 30 seconds after deployment
3. Hard refresh browser (Cmd+Shift+R)

## API Endpoint Reference

### DHL

**Track Single Shipment:**
```
GET /dhl/track?awb=1234567890
```

**Optional Parameters:**
- `test=true` - Use DHL test environment
- `apiKey=XXX` - Override environment variable (not recommended)

### FedEx

**Get OAuth Token:**
```
GET /fedex/oauth
```

**Track Single Shipment:**
```
GET /fedex/track?awb=111111111111
```

**Optional Parameters:**
- `sandbox=false` - Use production environment (default: sandbox)

### UPS

**Get OAuth Token:**
```
GET /ups/oauth
```

**Track Single Shipment:**
```
GET /ups/track?awb=1Z999AA10123456784
```

**Optional Parameters:**
- `test=false` - Use production environment (default: test)

### Health Check

**Check Worker Status:**
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-01-24T08:00:00.000Z"
}
```

## Security Best Practices

1. **Never commit API keys to Git** - Always use environment variables
2. **Rotate credentials regularly** - Change keys every 90 days
3. **Use sandbox for testing** - Don't waste production API calls
4. **Monitor usage** - Watch for unusual activity
5. **Restrict CORS origin** - Only allow your domain

## Cost Estimate

**Cloudflare Workers Free Tier:**
- ✅ 100,000 requests/day
- ✅ Unlimited workers
- ✅ No credit card required

**Typical Usage (10 trackings, 3 refreshes/day):**
- ~30 requests/day
- 0.03% of free tier
- **$0.00/month**

**If you exceed free tier:**
- $5/month for 10 million requests
- Still extremely cheap for personal use

## Advanced: Custom Domain

Instead of `*.workers.dev`, use your own domain:

1. Add domain to Cloudflare (free)
2. Workers → your worker → Settings → Triggers
3. Add Custom Domain: `api.yourdomain.com`
4. Update `js/api/base.js` with new domain

## Next Steps

After deployment:

1. ✅ Test all three carriers (DHL, FedEx, UPS)
2. ✅ Add real tracking numbers to your app
3. ✅ Force refresh to see live data
4. ✅ Check worker logs to verify proxy usage
5. ✅ Monitor API usage to stay within free tier

## Support

**Cloudflare Workers Docs:**
- https://developers.cloudflare.com/workers/

**Carrier API Docs:**
- DHL: https://developer.dhl.com/api-reference/shipment-tracking
- FedEx: https://developer.fedex.com/api/en-us/catalog/track.html
- UPS: https://developer.ups.com/api/reference/tracking

**Shipment Tracker Issues:**
- https://github.com/wayneef84/wayneef84.github.io/issues

---

**Ready to deploy?** Follow Step 1 above and you'll have real tracking data in ~10 minutes! 🚀
