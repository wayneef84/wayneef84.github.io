# Cloudflare Worker Quick Start (5 Minutes)

Fast track to getting your DHL proxy running.

---

## 🚀 The 5-Minute Deploy

### Step 1: Create Worker (2 min)

1. Go to https://dash.cloudflare.com/
2. Click **Workers & Pages** → **Create application** → **Create Worker**
3. Name: `shipment-tracker-dhl`
4. Click **Deploy**

### Step 2: Add Your Code (1 min)

1. Click **Edit code**
2. Delete everything
3. Copy all code from `cloudflare-worker.js` in this folder
4. Paste into editor
5. Click **Save and Deploy**

### Step 3: Add API Key (1 min)

1. Click **Settings** tab
2. Click **Variables** (left sidebar)
3. Click **Add variable**
4. Select **Secret** (not Text)
5. Name: `DHL_API_KEY`
6. Value: `YOUR_DHL_API_KEY_HERE`
7. Click **Encrypt and Save**
8. Click **Deploy** (top right)

### Step 4: Test It (1 min)

Your worker URL will be:
```
https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev
```

Test in browser:
```
https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev/health
```

Should see:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T..."
}
```

---

## ✅ Done!

Your proxy is live. Next steps:

1. Copy your worker URL
2. Update app config to use proxy
3. Test tracking with real AWB

---

## 🔧 Need Help?

Read the full guide: `DEPLOYMENT.md`

Common issues:
- **500 error**: Check API key is added as "Secret"
- **CORS error**: Normal during development, fix later
- **401 error**: DHL API key invalid

---

**Time spent:** ~5 minutes
**Cost:** $0
**Requests/day:** 100,000 (free tier)

Easy! 🎉
