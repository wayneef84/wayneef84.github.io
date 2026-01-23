# Testing Guide - No Cloudflare Worker Needed!

You can test the Shipment Tracker **immediately** without deploying a Cloudflare Worker.

---

## 🎯 Quick Start (2 Minutes)

### Option 1: Test Page with URL Parameters (Recommended)

1. **Open test page with your API key pre-filled:**
   ```
   test-tracking.html?dhl=YOUR_DHL_API_KEY&awb=1234567890
   ```

2. **Check "Use Direct API Mode"**

3. **Click "Track Shipment"**

Done! The key is in the URL but only visible to you (not in code/GitHub).

---

### Option 2: Manual Entry (Most Secure)

1. **Open:** `test-tracking.html`

2. **Enter API keys** in the form (stored in browser session only)

3. **Save keys** (stored until you close browser)

4. **Enter tracking number** - carrier auto-detects!

5. **Track shipment**

---

## 🔒 Security Explained

### What We Built:

**3 Security Levels:**

1. **URL Parameters** (convenience)
   - Key in URL: `?dhl=YOUR_KEY`
   - Only you see the URL
   - Not committed to GitHub
   - Perfect for personal testing

2. **Session Storage** (balanced)
   - Enter key once
   - Stored in browser session
   - Cleared when you close browser
   - Never in code

3. **IndexedDB** (persistent)
   - Enter in Settings panel
   - Persists between sessions
   - Encrypted by browser
   - Only on your computer

### What You DON'T Need:

❌ Cloudflare Worker (optional, for public deployment)
❌ Backend server
❌ Keys in code

---

## 📦 Features You Can Test Now

### 1. Auto-Detect Carrier

Type a tracking number:
- `1234567890` → Auto-detects **DHL** (10 digits)
- `123456789012` → Auto-detects **FedEx** (12 digits)
- `1Z999AA10123456784` → Auto-detects **UPS** (starts with 1Z)

The dropdown automatically selects the carrier!

### 2. AWB Validation

Click "Validate AWB Only" to check format without calling API:
- ✅ Valid format
- ❌ Invalid format with helpful error message

### 3. Track Shipment

Enter real tracking number → Click "Track Shipment"
- Calls DHL API directly (your key visible in Network tab)
- Parses response
- Shows formatted tracking data
- Displays events timeline

### 4. Multiple Carriers

Future support for:
- DHL ✅ (working now)
- FedEx ⏳ (adapter ready, needs testing)
- UPS ⏳ (adapter ready, needs testing)
- USPS ⏳ (adapter ready, needs testing)

---

## 🧪 Test Scenarios

### Test 1: Valid DHL Tracking

```
URL: test-tracking.html?dhl=YOUR_DHL_API_KEY&awb=YOUR_REAL_DHL_AWB
```

Expected:
- Carrier auto-detects as "DHL"
- Validation passes
- API returns tracking data
- Events timeline displays

### Test 2: Invalid AWB Format

```
AWB: 123
Carrier: DHL
```

Expected:
- ❌ "DHL AWB must be 10 digits"
- No API call made

### Test 3: Unknown Carrier Format

```
AWB: ABC123XYZ
Carrier: Auto-Detect
```

Expected:
- ⚠️ "Unknown format"
- Dropdown shows "Auto-Detect"
- User must select manually

### Test 4: Sample Tracking Numbers

Click sample buttons:
- "DHL Sample" → `1234567890`
- "FedEx Sample" → `123456789012`
- "UPS Sample" → `1Z999AA10123456784`

Each auto-detects correct carrier!

---

## 🔍 What Happens Behind the Scenes

```
1. Enter AWB: 1234567890
   ↓
2. detectCarrier() checks format
   ↓
3. Matches DHL pattern (10 digits)
   ↓
4. Auto-fills dropdown with "DHL"
   ↓
5. Click "Track Shipment"
   ↓
6. validateAWB() confirms valid
   ↓
7. DHLAdapter.trackShipment(awb)
   ↓
8. Direct API call to DHL
   ↓
9. Parse response
   ↓
10. Display formatted data
```

---

## 🎨 UI Features

### Main App (index.html)

- ✅ Auto-detect carrier on input
- ✅ Dropdown shows "Auto-Detect Carrier"
- ✅ Smart form validation
- ✅ API keys in Settings panel (stored in IndexedDB)

### Test Page (test-tracking.html)

- ✅ URL parameter support
- ✅ Session storage for keys
- ✅ Visual carrier detection indicator
- ✅ Sample AWB buttons
- ✅ Direct/Proxy mode toggle
- ✅ Validation-only testing

---

## 🚀 Next Steps (Optional)

### When You Want Public Deployment:

**Deploy Cloudflare Worker** for:
- Hide API key from Network tab
- Share app with others securely
- Control rate limiting server-side

**Until then:**
- Direct mode works perfectly for personal use
- Keys only visible in your browser
- No one else can see them

---

## 📞 Quick Reference

### Test Page URL Formats

**With DHL key:**
```
test-tracking.html?dhl=YOUR_KEY
```

**With multiple carriers:**
```
test-tracking.html?dhl=KEY1&ups=KEY2&usps=KEY3&fedex_client=ID&fedex_secret=SECRET
```

**With pre-filled AWB:**
```
test-tracking.html?dhl=YOUR_KEY&awb=1234567890
```

### Carrier Detection Patterns

| Carrier | Format | Example |
|---------|--------|---------|
| DHL | 10 digits | `1234567890` |
| FedEx | 12 or 15 digits | `123456789012` |
| UPS | 1Z + 16 chars | `1Z999AA10123456784` |
| USPS | Various | (future) |

### API Key Storage Locations

| Method | Duration | Security |
|--------|----------|----------|
| URL param | One session | Moderate (only you see URL) |
| Session storage | Until browser closes | Good |
| IndexedDB | Persistent | Best (encrypted by browser) |

---

## ✅ Testing Checklist

- [ ] Open `test-tracking.html`
- [ ] Enter DHL API key
- [ ] Click "Save Keys"
- [ ] Check "Use Direct API Mode"
- [ ] Enter tracking number
- [ ] Watch carrier auto-detect
- [ ] Click "Track Shipment"
- [ ] See tracking data!

---

**No Cloudflare Worker needed!** Just open the test page and start tracking. 🎉

---

*Last Updated: 2026-01-23*
*Author: Wayne Fong (wayneef84)*
