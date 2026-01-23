# Force Refresh Feature

## 🔒 Default: OFF (Safe Mode)

Force refresh is **disabled by default** to protect your API rate limits.

---

## ⚙️ What is Force Refresh?

**Normal Mode (Force Refresh OFF):**
- Respects 10-minute cooldown between checks
- Automatically skips delivered shipments
- Protects your daily API limit (250 requests/day for DHL)
- **Recommended for most users**

**Force Refresh Mode (Force Refresh ON):**
- Ignores cooldown period
- Queries API immediately
- Useful for urgent updates
- ⚠️ **WARNING: Uses more API calls**

---

## 🎯 How It Works

### When Force Refresh is OFF (Default)

```
User clicks "Refresh"
      ↓
Check last query time
      ↓
Less than 10 min ago? → Skip (show cached data)
More than 10 min ago? → Query API
      ↓
Already delivered? → Skip
Still in transit? → Query API
```

### When Force Refresh is ON

```
User clicks "Refresh"
      ↓
Query API immediately (ignore cooldown)
      ↓
Update data
```

---

## ⚠️ Confirmation Prompt

When you try to **enable** force refresh, you'll see:

```
⚠️ Enable Force Refresh?

Force refresh will ignore the cooldown period and query
the carrier API immediately.

WARNING: This will use more API calls and may hit your
daily rate limit faster.

Recommended: Keep this OFF and use the 10-minute cooldown.

Enable anyway?
```

**Click "Cancel"** → Force refresh stays OFF ✅
**Click "OK"** → Force refresh enabled ⚠️

**Note:** Turning it OFF does not show a prompt (safe action).

---

## 📊 API Rate Limits

### DHL Express (Free Tier)
- **Daily Limit:** 250 requests/day
- **With Cooldown:** ~144 queries/day max (every 10 min)
- **Without Cooldown:** Can easily hit 250+ if refreshing frequently

### FedEx Track (Free Tier)
- **Daily Limit:** 1000 requests/day
- More headroom, but still advisable to use cooldown

### UPS Tracking (Free Tier)
- **Daily Limit:** 500 requests/day
- Cooldown recommended

---

## 🎛️ Settings

**Location:** Settings Panel → Query Engine section

**Options:**
1. **Cooldown (minutes):** Default 10 minutes
   - How long to wait between queries for same AWB
   - Adjustable: 1-60 minutes

2. **Skip delivered shipments:** Default ON ✅
   - Don't query delivered items (saves API calls)
   - Recommended: Keep ON

3. **Enable force refresh:** Default OFF ⚠️
   - Override cooldown when refreshing
   - Recommended: Keep OFF

---

## 📈 Usage Examples

### Example 1: Normal Usage (Force Refresh OFF)

```
10:00 AM - Add tracking AWB123 → Query API ✅
10:05 AM - Click refresh AWB123 → Skipped (too soon)
10:11 AM - Click refresh AWB123 → Query API ✅
10:15 AM - Package delivered
10:20 AM - Click refresh AWB123 → Skipped (delivered)
```

**API calls used:** 2 (saved 2 unnecessary calls)

### Example 2: Force Refresh ON

```
10:00 AM - Add tracking AWB123 → Query API ✅
10:05 AM - Click refresh AWB123 → Query API ✅ (ignored cooldown)
10:11 AM - Click refresh AWB123 → Query API ✅
10:15 AM - Package delivered
10:20 AM - Click refresh AWB123 → Query API ✅ (even though delivered)
```

**API calls used:** 4 (wasted 2 calls)

### Example 3: Urgent Update Needed

```
10:00 AM - Add tracking AWB123 → Query API
10:05 AM - Need urgent update!
         → Enable Force Refresh (with confirmation)
         → Click refresh → Query API immediately
         → Disable Force Refresh after
```

**Best practice:** Enable only when needed, disable after!

---

## 💡 Best Practices

### ✅ DO:
- Keep force refresh OFF by default
- Use 10+ minute cooldown
- Enable skip delivered shipments
- Only enable force refresh for urgent updates
- Disable force refresh when done

### ❌ DON'T:
- Leave force refresh enabled all the time
- Set cooldown below 5 minutes
- Manually refresh every minute
- Query delivered shipments repeatedly

---

## 🔧 Technical Details

### Cooldown Tracking

Stored in IndexedDB `trackings` store:
```javascript
{
    awb: '1234567890',
    carrier: 'DHL',
    lastChecked: '2026-01-23T10:00:00.000Z',  // ← Used for cooldown
    delivered: false
}
```

### Force Refresh Check

```javascript
// In query engine (future implementation)
function shouldQuery(tracking, forceRefresh) {
    // Skip if delivered (unless force refresh)
    if (tracking.delivered && !forceRefresh) {
        return false;
    }

    // Check cooldown
    var now = Date.now();
    var lastChecked = new Date(tracking.lastChecked).getTime();
    var cooldownMs = config.cooldownMinutes * 60 * 1000;

    if ((now - lastChecked) < cooldownMs && !forceRefresh) {
        return false; // Too soon
    }

    return true; // OK to query
}
```

---

## 🎨 UI Indicators

### When Force Refresh is OFF (Default)
- Checkbox: ☐ Unchecked
- No warnings
- Normal operation

### When Force Refresh is ON
- Checkbox: ☑ Checked
- Toast notification: ⚠️ "Force refresh enabled - rate limits may be hit faster"
- Warning color (orange)

### When Attempting to Enable
- Confirmation dialog with warning message
- Must click "OK" to proceed
- Can click "Cancel" to keep it OFF

---

## 📞 Related Settings

**Cooldown Minutes:**
- Works in conjunction with force refresh
- Ignored when force refresh is enabled
- Recommended: 10-15 minutes for most use cases

**Skip Delivered:**
- Works even when force refresh is ON
- Can override with manual force refresh button (future)
- Recommended: Always keep ON

---

## 🚀 Future Enhancements

Planned features:
- Per-shipment force refresh button (override just once)
- Visual cooldown timer ("Refresh available in 5 min")
- API usage dashboard (calls used today)
- Smart cooldown (longer for delivered, shorter for urgent)

---

*Last Updated: 2026-01-23*
*Author: Wayne Fong (wayneef84)*
