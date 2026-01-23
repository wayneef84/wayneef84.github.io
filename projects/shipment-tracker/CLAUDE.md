# CLAUDE.md - Shipment Tracker

**Project:** Shipment Tracker
**Category:** Utility Project (Non-Game)
**Location:** `/projects/shipment-tracker/`
**Version:** 1.0.0-alpha
**Status:** In Development

---

## Project-Specific Guidance for Claude Code

This file provides context-specific guidance for working on the Shipment Tracker project.

---

## Project Overview

Shipment Tracker is a **browser-based utility application** for aggregating tracking data from multiple carriers (DHL, FedEx, UPS) with smart API rate limiting, offline-first storage, and multi-format export.

### Key Differentiators
- **Not a game** - Lives in `/projects/`, not `/games/`
- **Productivity tool** - Business/logistics use case
- **BYOK model** - Users provide their own API keys
- **Offline-first** - IndexedDB for local storage
- **Privacy-focused** - All data stored locally, cloud sync optional

---

## Architecture Principles

### 1. Offline-First Design
- **Primary Storage**: IndexedDB (not localStorage)
- **Capacity**: 50MB+ per domain
- **Async API**: Non-blocking operations
- **Indexes**: Fast queries on carrier, delivered, lastChecked, deliverySignal

### 2. Adapter Pattern
- **Abstract Interface**: `StorageAdapter` base class
- **Current Implementation**: `IndexedDBAdapter`
- **Future Migration**: `FirebaseAdapter`, `SupabaseAdapter`
- **Dual Storage**: Support both local and cloud simultaneously

### 3. Smart Query Engine (Planned)
- **Rate Limiting**: Configurable cooldown per AWB (default: 10 minutes)
- **Batch Queries**: Group AWBs by carrier for efficient API usage
- **Terminal Detection**: Stop querying delivered items automatically
- **Force Refresh**: Manual override for urgent updates

### 4. Data Normalization
- **Raw Payloads**: Preserve original API responses in `raw_payloads` store
- **Normalized Schema**: Consistent format in `trackings` store
- **Delivery Signals**: Universal status buckets (PICKUP, IN_TRANSIT, DELIVERY, etc.)
- **Carrier-Agnostic**: DHL/FedEx/UPS differences abstracted away

---

## File Structure & Status

```
/projects/shipment-tracker/
├── index.html                  # ✅ Main UI (COMPLETE)
├── test.html                   # ✅ IndexedDB test suite (COMPLETE)
├── LICENSE                     # ✅ MIT + API terms (COMPLETE)
├── CHANGELOG.md                # ✅ Version history (COMPLETE)
├── CLAUDE.md                   # ✅ This file (COMPLETE)
├── INFO.md                     # ✅ Project metadata (COMPLETE)
├── README.md                   # ✅ User guide (COMPLETE)
├── css/
│   ├── style.css              # 🚧 Layout & responsive (IN PROGRESS)
│   └── theme.css              # 🚧 Colors & branding (IN PROGRESS)
├── js/
│   ├── app.js                 # ⏳ Main controller (PENDING)
│   ├── db.js                  # ✅ IndexedDB adapter (COMPLETE)
│   ├── db-test.js             # ✅ Test suite (COMPLETE)
│   ├── query-engine.js        # ⏳ Smart query logic (PENDING)
│   ├── api/
│   │   ├── base.js           # ⏳ Shared API utils (PENDING)
│   │   ├── dhl.js            # ⏳ DHL adapter (PENDING)
│   │   ├── fedex.js          # ⏳ FedEx adapter (PENDING)
│   │   └── ups.js            # ⏳ UPS adapter (PENDING)
│   ├── normalizer.js          # ⏳ Payload normalization (PENDING)
│   ├── export.js              # ⏳ JSON/CSV/Excel export (PENDING)
│   └── utils.js               # ⏳ Formatters & validators (PENDING)
└── docs/
    ├── ARCHITECTURE.md        # ✅ IndexedDB schema, Firebase migration (COMPLETE)
    ├── API.md                 # ✅ Carrier integration guide (COMPLETE)
    ├── DATA_SCHEMA.md         # ✅ Normalized data structure (COMPLETE)
    ├── EXPORT.md              # ✅ Export/import functionality (COMPLETE)
    └── DB_USAGE.md            # ✅ IndexedDB usage guide (COMPLETE)
```

---

## Development Workflow

### When Adding New Features

1. **Check Documentation First**
   - Read relevant docs in `/docs/` folder
   - Verify against architecture in `ARCHITECTURE.md`
   - Check API integration patterns in `API.md`

2. **Update Files**
   - Implement feature code
   - Update `CHANGELOG.md` with changes
   - Update `INFO.md` if architecture changes
   - Update tests if applicable

3. **Test Thoroughly**
   - Run IndexedDB test suite (`test.html`)
   - Test on mobile Safari (viewport, safe-area-inset)
   - Verify ES5 compatibility (no arrow functions, use `var`)

4. **Document Changes**
   - Add JSDoc comments to new functions
   - Update usage examples in docs
   - Note breaking changes in CHANGELOG.md

---

## Code Style Guidelines

### JavaScript (ES5 Compatible)

**Why ES5?**
- Safari 10+ compatibility
- No build tools required
- Vanilla JS, no transpilation

**Rules:**
```javascript
// ✅ GOOD
var self = this;
function myFunction() {
    var result = self.doSomething();
    return result;
}

// ❌ BAD
const result = this.doSomething();
const myFunction = () => result;
```

**IIFE Module Pattern:**
```javascript
(function(window) {
    'use strict';

    function MyModule() {
        // Constructor
    }

    MyModule.prototype.method = function() {
        // Instance method (NOT arrow function)
    };

    window.MyModule = MyModule;
})(window);
```

### CSS (Mobile-First)

**Viewport Units:**
```css
/* Use dvh (dynamic viewport height) for mobile */
body {
    height: 100dvh;
}

/* Safe area insets for notched devices */
.container {
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**Responsive Design:**
```css
/* Mobile-first (default styles for mobile) */
.element {
    flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
    .element {
        flex-direction: row;
    }
}
```

---

## API Integration Guidelines

### Carrier API Terms Compliance

**CRITICAL:** Users MUST comply with carrier API terms. Never:
- Share API keys across users
- Exceed rate limits
- Use data for unauthorized purposes
- Violate carrier terms of service

**Implementation Requirements:**
1. Store API keys in localStorage (user-provided, never hardcoded)
2. Respect rate limits (see `ARCHITECTURE.md` for limits)
3. Display carrier terms links in UI
4. Include disclaimer in LICENSE file

### Rate Limiting Strategy

**DHL Express API:**
- Limit: 250 requests/day (free tier)
- Batch Size: 10 AWBs per request
- Cooldown: 15 minutes (stricter than default)

**FedEx Track API:**
- Limit: 1000 requests/day (free tier)
- Batch Size: 30 AWBs per request
- Cooldown: 10 minutes (default)
- OAuth 2.0 token caching required

**UPS Tracking API:**
- Limit: 500 requests/day (free tier)
- Batch Size: 50 AWBs per request
- Cooldown: 5 minutes (more frequent updates)

---

## Testing Strategy

### Manual Testing Checklist

Before committing code, verify:
- [ ] IndexedDB operations work (`test.html` passes all tests)
- [ ] UI renders correctly on mobile Safari
- [ ] Safe-area-inset padding works on notched devices
- [ ] Settings panel shows/hides properly
- [ ] API keys stored and retrieved correctly
- [ ] Export functionality generates valid files
- [ ] No console errors in browser DevTools

### Automated Tests

**Current Coverage:**
- IndexedDB adapter: 11 tests (`db-test.js`)
- Future: API normalizers, query engine, export module

**Test Runner:**
```bash
# Open test page in browser
open projects/shipment-tracker/test.html

# Or run programmatically
TestRunner.runAll();
TestRunner.cleanup(); # Clean up after tests
```

---

## Version Update Protocol

### When Releasing New Version

1. **Update Version Numbers**
   - `INFO.md` - Update version header
   - `CHANGELOG.md` - Add new version section
   - `package.json` (if added later)

2. **Document Changes**
   - Add detailed changelog entry
   - Note breaking changes
   - List new features
   - Credit contributors

3. **Update Status Indicators**
   - Mark completed files in `INFO.md`
   - Update progress in `CHANGELOG.md`

4. **Test Everything**
   - Run all automated tests
   - Manual testing on target browsers
   - Verify mobile Safari compatibility

---

## Common Tasks

### Adding a New Carrier

1. Create adapter: `js/api/[carrier].js`
2. Implement normalizer for carrier's API response format
3. Add delivery signal mapping (see `DATA_SCHEMA.md`)
4. Update `API.md` with integration guide
5. Add carrier to UI dropdown (`index.html`)
6. Test with sample API responses

### Adding New Export Format

1. Implement exporter in `js/export.js`
2. Add format to export panel (`index.html`)
3. Document in `EXPORT.md`
4. Add example usage
5. Test with real data

### Migrating to Firebase

1. Implement `FirebaseAdapter` extending `StorageAdapter`
2. Add Firebase SDK to dependencies
3. Update `ARCHITECTURE.md` with migration guide
4. Create `DualStorageAdapter` for sync
5. Add UI toggle for cloud sync
6. Document security rules

---

## Security Considerations

### API Key Storage
- **Never** commit API keys to git
- Store in localStorage (client-side only)
- Encrypt using Web Crypto API (future enhancement)
- Clear on logout/browser clear data

### CORS Proxy
- Carrier APIs require backend proxy
- Document proxy setup in `API.md`
- Options: Node.js, Cloudflare Workers, Vercel Edge Functions
- Never log API keys in proxy logs

### Data Privacy
- All tracking data stored locally (IndexedDB)
- No analytics or tracking implemented
- Optional cloud sync (user opt-in)
- GDPR/CCPA compliance is user's responsibility

---

## Troubleshooting

### IndexedDB Issues

**Problem:** Database won't open
```javascript
if (!window.indexedDB) {
    alert('IndexedDB not supported. Use modern browser.');
}
```

**Problem:** Quota exceeded
```javascript
navigator.storage.estimate().then(function(estimate) {
    console.log('Used:', estimate.usage / 1024 / 1024, 'MB');
    console.log('Quota:', estimate.quota / 1024 / 1024, 'MB');
});
```

**Solution:** Prune old raw payloads
```javascript
db.pruneOldPayloads(awb, 5); // Keep only last 5 payloads
```

### Mobile Safari Issues

**Problem:** Safe area insets not working
- Ensure viewport meta tag includes `viewport-fit=cover`
- Use `env(safe-area-inset-*)` in CSS
- Test on real iOS device (not just simulator)

**Problem:** 100vh includes browser chrome
- Use `100dvh` instead (dynamic viewport height)
- Fallback: `height: 100vh; height: 100dvh;`

---

## Resources

### Documentation
- Architecture: `docs/ARCHITECTURE.md`
- API Integration: `docs/API.md`
- Data Schema: `docs/DATA_SCHEMA.md`
- Export Guide: `docs/EXPORT.md`
- DB Usage: `docs/DB_USAGE.md`

### External Links
- DHL API Docs: https://developer.dhl.com/api-reference/shipment-tracking
- FedEx API Docs: https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html
- UPS API Docs: https://developer.ups.com/api/reference/track/product-info
- IndexedDB Spec: https://www.w3.org/TR/IndexedDB/
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

---

## Contact

**Project Maintainer:**
- Wayne Fong (wayneef84)
- GitHub: https://github.com/wayneef84

**Issues & Feature Requests:**
- GitHub Issues: https://github.com/wayneef84/fong-family-arcade/issues

**Development Assistance:**
- Claude Code by Anthropic
- https://claude.ai/code

---

*Last Updated: 2026-01-22*
*For root-level Claude guidance, see `/CLAUDE.md`*
