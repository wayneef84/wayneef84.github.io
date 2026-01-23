# Carrier API Proxy

This folder contains proxy server code for securing carrier API keys.

## Why Proxy?

The Shipment Tracker app needs to call carrier APIs (DHL, FedEx, UPS) to fetch tracking data. These APIs require authentication keys that must be kept secret.

**Problem:** If we call APIs directly from the browser, the API key is visible in the Network tab.

**Solution:** Use a backend proxy that holds the API key and forwards requests from the app.

```
Browser App → Cloudflare Worker (has API key) → Carrier API
              ↑
           Your key is safe here
```

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `cloudflare-worker.js` | Cloudflare Worker code (DHL proxy) |
| `DEPLOYMENT.md` | Step-by-step deployment guide |
| `README.md` | This file |

---

## Quick Start

### Option 1: Cloudflare Workers (Recommended)

**Pros:**
- Free tier (100k requests/day)
- Global CDN (low latency)
- No server management
- Easy deployment

**Setup:**
1. Read `DEPLOYMENT.md`
2. Deploy worker to Cloudflare
3. Add DHL API key as environment variable
4. Get worker URL
5. Update app config

### Option 2: Your Own Server

If you prefer to self-host, you can adapt the worker code to:
- Node.js/Express
- Python/Flask
- Go
- PHP

Example Node.js equivalent:

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/track', async (req, res) => {
    const awb = req.query.awb;
    const dhlResponse = await fetch(
        `https://api-eu.dhl.com/track/shipments?trackingNumber=${awb}`,
        { headers: { 'DHL-API-Key': process.env.DHL_API_KEY } }
    );
    const data = await dhlResponse.json();
    res.json(data);
});

app.listen(3000);
```

---

## Security Considerations

### ✅ DO:
- Store API keys as environment variables
- Use HTTPS only
- Restrict CORS to your domain
- Rate limit requests
- Monitor for abuse
- Rotate keys periodically

### ❌ DON'T:
- Commit API keys to git
- Use HTTP (unencrypted)
- Allow requests from any origin in production
- Log sensitive data
- Share API keys across multiple users

---

## Future Carriers

When adding FedEx and UPS proxies:

1. Copy `cloudflare-worker.js`
2. Rename to `cloudflare-worker-fedex.js`
3. Update API endpoint and authentication
4. Deploy as separate worker (or add to same worker)

**Unified proxy approach:**

```javascript
// Route by carrier
if (url.pathname === '/track/dhl') {
    return handleDHL(request);
} else if (url.pathname === '/track/fedex') {
    return handleFedEx(request);
} else if (url.pathname === '/track/ups') {
    return handleUPS(request);
}
```

---

## Cost & Limits

### Cloudflare Workers Free Tier
- **Requests:** 100,000/day
- **CPU Time:** 10ms per invocation
- **Memory:** 128MB
- **Bandwidth:** Unlimited

### DHL API Free Tier
- **Requests:** 250/day
- **Batch Size:** 10 AWBs per request
- **Rate Limit:** 2 requests/second

**Bottleneck:** DHL API limit (250/day), not Cloudflare

---

## Monitoring

Track usage in Cloudflare dashboard:
1. Requests per day
2. Error rate
3. Response time (p50, p99)
4. Geographic distribution

Set alerts for:
- Error rate > 5%
- Approaching daily limit (> 200 requests)

---

## Local Development

To test the worker locally without deploying:

### Using Wrangler (Cloudflare CLI)

```bash
# Install Wrangler
npm install -g wrangler

# Create wrangler.toml
cat > wrangler.toml <<EOF
name = "shipment-tracker-dhl"
main = "cloudflare-worker.js"
compatibility_date = "2024-01-01"

[vars]
DHL_API_KEY = "your-key-here"
EOF

# Run locally
wrangler dev
```

Access at: http://localhost:8787

### Using Miniflare (Local simulator)

```bash
npm install -g miniflare

miniflare cloudflare-worker.js \
  --binding DHL_API_KEY=your-key-here
```

---

## Troubleshooting

### "Worker not found"
- Check worker name matches URL
- Ensure worker is deployed (not just saved)

### "Missing DHL_API_KEY"
- Add environment variable in Cloudflare dashboard
- Use "Secret" type (not "Text")
- Click "Deploy" after adding

### "CORS error"
- Check `Access-Control-Allow-Origin` header
- Test with `*` first, then restrict to your domain

### "401 Unauthorized"
- DHL API key is invalid
- Regenerate at https://developer.dhl.com/

---

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [DHL API Reference](https://developer.dhl.com/api-reference/shipment-tracking)
- [FedEx API Docs](https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html)
- [UPS API Docs](https://developer.ups.com/api/reference/track/product-info)

---

*Last Updated: 2026-01-22*
*Author: Wayne Fong (wayneef84)*
