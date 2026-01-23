# Shipment Tracker Configuration Guide

This guide explains how to configure the Shipment Tracker app after deploying your Cloudflare Worker proxy.

---

## Step 1: Deploy Cloudflare Worker

First, deploy your DHL proxy using the guide in `proxy/QUICKSTART.md`.

After deployment, you'll have a URL like:
```
https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev
```

Copy this URL - you'll need it in the next step.

---

## Step 2: Configure Proxy URL

### Option A: Browser Console (Quick Test)

1. Open `projects/shipment-tracker/index.html` in your browser
2. Open browser console (F12)
3. Run:
   ```javascript
   // Set your worker URL
   APIBase.config.proxies.DHL = 'https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev';

   // Verify it's set
   console.log('DHL Proxy:', APIBase.config.proxies.DHL);
   ```

4. Test tracking:
   ```javascript
   // Test with a sample DHL tracking number
   DHLAdapter.trackShipment('1234567890')
     .then(data => console.log('Success:', data))
     .catch(err => console.error('Error:', err));
   ```

### Option B: Edit js/api/base.js (Permanent)

1. Open `js/api/base.js`
2. Find the `API_CONFIG` object (lines 14-38)
3. Update the `proxies` section:

```javascript
var API_CONFIG = {
    // Proxy URLs (set these after deploying Cloudflare Workers)
    proxies: {
        DHL: 'https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev',  // ← Add your URL here
        FedEx: '',  // Future
        UPS: ''     // Future
    },
    // ... rest of config
};
```

4. Save the file
5. Refresh your browser

---

## Step 3: Test Integration

### Test 1: Health Check

Open in browser:
```
https://YOUR-WORKER-URL.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-23T..."
}
```

### Test 2: Track via Console

In browser console on `index.html`:
```javascript
// Track a test shipment
DHLAdapter.trackShipment('1234567890')
    .then(function(data) {
        console.log('Tracking data:', data);
    })
    .catch(function(error) {
        console.error('Error:', error);
    });
```

### Test 3: Add via UI

1. Open `index.html` in browser
2. Enter a DHL tracking number in the "Add Tracking Number" form
3. Select "DHL Express" from dropdown
4. Click "Add"
5. Check browser console for API calls
6. Check IndexedDB for stored data

---

## Configuration Options

### Use Proxy vs Direct API

**Default:** Proxy mode (recommended)

```javascript
// In js/api/base.js
var API_CONFIG = {
    useProxy: true  // Set to false for direct API calls
};
```

**Proxy Mode (useProxy: true):**
- API key hidden from browser
- Secure for public deployment
- Requires Cloudflare Worker
- Recommended for production

**Direct Mode (useProxy: false):**
- API key visible in browser Network tab
- No server required
- Only use for personal/local testing
- NOT recommended for public deployment

### Timeout Configuration

```javascript
// In js/api/base.js
var API_CONFIG = {
    timeout: 30000,  // 30 seconds (adjust if needed)
};
```

### Retry Configuration

```javascript
// In js/api/base.js
var API_CONFIG = {
    retry: {
        maxAttempts: 3,           // Max retry attempts
        backoffMs: 1000,          // Initial backoff delay
        backoffMultiplier: 2      // Exponential backoff multiplier
    }
};
```

---

## Troubleshooting

### "Proxy URL not configured"

**Problem:** `APIBase.config.proxies.DHL` is empty

**Solution:**
1. Check you deployed the Cloudflare Worker
2. Verify worker URL is correct
3. Set proxy URL in `js/api/base.js` or via console

### "CORS policy blocked"

**Problem:** Browser blocking cross-origin request

**Solution:**
1. Check Cloudflare Worker CORS headers
2. In `proxy/cloudflare-worker.js`, ensure:
   ```javascript
   'Access-Control-Allow-Origin': '*'
   ```
3. Redeploy worker if changed

### "401 Unauthorized"

**Problem:** DHL API key invalid or not set

**Solution:**
1. Check Cloudflare Worker environment variables
2. Ensure `DHL_API_KEY` is set as a **Secret**
3. Verify key is valid at https://developer.dhl.com/
4. Redeploy worker after updating key

### "429 Too Many Requests"

**Problem:** Hit DHL rate limit (250/day)

**Solution:**
1. Wait 24 hours for limit reset
2. Implement query engine cooldown (10+ min between checks)
3. Upgrade DHL API plan if needed

### No data returned

**Problem:** Tracking number not found

**Solution:**
1. Verify tracking number is valid DHL format (10 digits)
2. Check shipment exists in DHL system
3. Try tracking on https://www.dhl.com/track first
4. Check browser console for API errors

---

## Advanced Configuration

### Custom Domain for Worker

If you want a custom domain instead of `*.workers.dev`:

1. Add route in Cloudflare dashboard:
   - Workers & Pages → Your Worker → Settings → Triggers
   - Add Custom Domain: `api.yourdomain.com`

2. Update proxy URL:
   ```javascript
   proxies: {
       DHL: 'https://api.yourdomain.com'
   }
   ```

### Environment-Specific Config

For different environments (dev, staging, prod):

```javascript
// Detect environment
var hostname = window.location.hostname;
var isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
var isStaging = hostname.includes('staging');

var API_CONFIG = {
    proxies: {
        DHL: isLocal
            ? 'http://localhost:8787'  // Local Wrangler dev
            : isStaging
                ? 'https://shipment-tracker-dhl-staging.workers.dev'
                : 'https://shipment-tracker-dhl.workers.dev'
    }
};
```

### Debug Mode

Enable verbose logging:

```javascript
// In browser console
window.DEBUG_API = true;

// In js/api/base.js, add at top of request():
if (window.DEBUG_API) {
    console.log('[API] Request:', url, options);
}
```

---

## Next Steps

Once configured:

1. ✅ Test with real DHL tracking numbers
2. ✅ Build FedEx and UPS proxies (same pattern)
3. ✅ Implement query engine for smart rate limiting
4. ✅ Deploy to GitHub Pages
5. ✅ Share with users!

---

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `js/api/base.js` | API configuration (line 14) |
| `js/api/dhl.js` | DHL adapter logic |
| `proxy/cloudflare-worker.js` | Worker code |
| `CONFIG.md` | This file |

### Key URLs

| URL | Purpose |
|-----|---------|
| Worker Health | `https://YOUR-WORKER.workers.dev/health` |
| Worker Track | `https://YOUR-WORKER.workers.dev/track?awb=XXXXX` |
| DHL API Docs | https://developer.dhl.com/api-reference/shipment-tracking |
| Cloudflare Dashboard | https://dash.cloudflare.com/ |

---

*Last Updated: 2026-01-23*
*Author: Wayne Fong (wayneef84)*
