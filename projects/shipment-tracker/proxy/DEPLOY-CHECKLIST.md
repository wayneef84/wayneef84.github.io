# Cloudflare Worker Deployment Checklist

Quick reference for deploying your DHL proxy.

---

## ✅ Pre-Deployment Checklist

- [ ] Cloudflare account created (free tier)
- [ ] DHL API key ready: `YOUR_DHL_API_KEY_HERE`
- [ ] Worker code ready: `cloudflare-worker.js`

---

## 📋 Deployment Steps

### 1. Create Worker (2 min)
- [ ] Go to https://dash.cloudflare.com/
- [ ] Click "Workers & Pages" (left sidebar)
- [ ] Click "Create application"
- [ ] Click "Create Worker"
- [ ] Name: `shipment-tracker-dhl`
- [ ] Click "Deploy"

### 2. Add Code (1 min)
- [ ] Click "Edit code"
- [ ] Delete default code
- [ ] Copy from `cloudflare-worker.js`
- [ ] Paste into editor
- [ ] Click "Save and Deploy"

### 3. Add API Key (1 min)
- [ ] Click worker name (top left)
- [ ] Click "Settings" tab
- [ ] Click "Variables" (left menu)
- [ ] Click "Add variable"
- [ ] Type: **Secret** (not Text!)
- [ ] Name: `DHL_API_KEY`
- [ ] Value: `YOUR_DHL_API_KEY_HERE`
- [ ] Click "Encrypt and Save"
- [ ] Click "Deploy" (top right)

### 4. Get Worker URL (30 sec)
- [ ] Copy URL from dashboard
- [ ] Format: `https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev`
- [ ] Save this URL - you'll need it next!

### 5. Test Worker (30 sec)
- [ ] Open: `https://YOUR-WORKER-URL.workers.dev/health`
- [ ] Should see: `{"status":"ok","timestamp":"..."}`
- [ ] If error, check API key was added as Secret

---

## 🔧 Configure App

### Update js/api/base.js

Line 17, change:
```javascript
proxies: {
    DHL: '',  // BEFORE
}
```

To:
```javascript
proxies: {
    DHL: 'https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev',  // AFTER
}
```

Save and refresh browser.

---

## 🧪 Test Integration

### Test 1: Browser Console

Open `index.html`, press F12, run:
```javascript
DHLAdapter.trackShipment('1234567890')
    .then(data => console.log('Success!', data))
    .catch(err => console.error('Error:', err));
```

### Test 2: Add via UI

1. Open `index.html`
2. Enter DHL tracking number
3. Select "DHL Express"
4. Click "Add"
5. Check console and IndexedDB

---

## 🎉 Success Indicators

✅ Worker health endpoint returns 200 OK
✅ No CORS errors in console
✅ Tracking data appears in console
✅ Data saved to IndexedDB
✅ Table shows tracking record

---

## 🐛 Troubleshooting

**"DHL_API_KEY is not defined"**
→ Add as Secret (not Text) in Variables

**CORS error**
→ Check worker CORS headers include `*`

**401 Unauthorized**
→ DHL API key invalid - regenerate at developer.dhl.com

**404 Not Found**
→ Worker URL incorrect - check dashboard

**No tracking data**
→ Check tracking number is valid 10-digit DHL AWB

---

## 📞 Help

- Full guide: `DEPLOYMENT.md`
- Quick start: `QUICKSTART.md`
- Config help: `../CONFIG.md`

---

*Last Updated: 2026-01-23*
