# Shipment Tracker - Architecture & Configuration Guide

**Version:** 1.3.0
**Last Updated:** 2026-01-29
**Authors:** Wayne Fong (wayneef84), Claude Sonnet 4.5, Claude Opus 4.5

---

> **🤖 For AI Assistants:** Start with [LLM_GUIDE.md](./LLM_GUIDE.md) for a quick-reference cheat sheet of patterns, constraints, and current sprint tasks. This Architecture doc contains comprehensive details.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [File Structure](#file-structure)
5. [Configuration](#configuration)
6. [API Integration](#api-integration)
7. [Storage System](#storage-system)
8. [Mobile-First Design](#mobile-first-design)
9. [Development Guide](#development-guide)
10. [LLM Context Notes](#llm-context-notes)

---

## Overview

**Shipment Tracker** is a client-side web application for tracking shipments across multiple carriers (DHL, FedEx, UPS, USPS, and more). It uses a **Bring Your Own Key (BYOK)** model where users provide their own API credentials.

### Key Features
- **Multi-carrier support** with auto-detection
- **Offline-first** architecture using IndexedDB
- **Mobile-responsive** with card-based layout
- **No backend required** - runs entirely in the browser
- **Optional Cloudflare Worker proxy** to hide API keys
- **ES5-compatible** JavaScript for broad browser support

### Technology Stack
- **Frontend:** Vanilla JavaScript (ES5), HTML5, CSS3
- **Storage:** IndexedDB (via custom adapter)
- **Optional Proxy:** Cloudflare Workers
- **No build tools** - direct script loading

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│  ┌──────────────┐     ┌──────────────┐                │
│  │ Desktop View │     │ Mobile Cards │                │
│  │   (Table)    │     │   (< 768px)  │                │
│  └──────────────┘     └──────────────┘                │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Application Controller                     │
│                  (app.js)                               │
│  - Manages UI state                                     │
│  - Coordinates between modules                          │
│  - Handles user interactions                            │
└─────────────────────────────────────────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           ↓              ↓               ↓
┌─────────────────┐ ┌──────────┐ ┌─────────────┐
│   Storage Layer │ │   Utils  │ │ Normalizer  │
│   (db.js)       │ │(utils.js)│ │(normalizer) │
│                 │ │          │ │             │
│ - IndexedDB     │ │- Format  │ │- Unify API  │
│ - CRUD ops      │ │- Validate│ │  responses  │
│ - Settings      │ │- Truncate│ │             │
└─────────────────┘ └──────────┘ └─────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│                   API Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ DHL API  │ │FedEx API │ │ UPS API  │  ...          │
│  │ Adapter  │ │ Adapter  │ │ Adapter  │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────┐
│           Carrier APIs (Direct or Proxied)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │   DHL    │ │  FedEx   │ │   UPS    │               │
│  │  Express │ │  Track   │ │ Tracking │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Module Breakdown

#### 1. **Application Controller** (`js/app.js`)
- **Purpose:** Main orchestrator
- **Responsibilities:**
  - Initialize app and database
  - Manage application state
  - Render UI (table or mobile cards)
  - Handle user events
  - Coordinate API calls
- **Key Methods:**
  - `loadTrackings()` - Load from IndexedDB
  - `addTracking()` - Add new tracking
  - `renderTable()` - Render desktop table
  - `renderMobileCards()` - Render mobile cards
  - `showDetail()` - Show tracking details
  - `applyFilters()` - Filter trackings

#### 2. **Storage Layer** (`js/db.js`)
- **Purpose:** Data persistence
- **Technology:** IndexedDB
- **Stores:**
  - `trackings` - Main tracking data
  - `raw_payloads` - Full API responses
  - `settings` - User preferences and API keys
- **Key Methods:**
  - `addTracking(tracking)` - Create
  - `getTracking(awb)` - Read
  - `updateTracking(awb, updates)` - Update
  - `deleteTracking(awb)` - Delete
  - `getAllTrackings()` - List all
  - `clearAll()` - Reset database

#### 3. **API Layer** (`js/api/`)
- **Purpose:** Carrier-specific API integrations
- **Adapters:**
  - `base.js` - Base adapter with common logic
  - `dhl.js` - DHL Express API
  - `fedex.js` - FedEx Track API (future)
  - `ups.js` - UPS Tracking API (future)
  - `usps.js` - USPS API (future)
- **Pattern:** Each adapter implements:
  - `trackShipment(awb)` - Fetch tracking data
  - Transforms carrier-specific response
  - Returns normalized format

#### 4. **Normalizer** (`js/normalizer.js`)
- **Purpose:** Unify different carrier API responses
- **Output Format:**
```javascript
{
    awb: '1234567890',
    carrier: 'DHL',
    status: 'In Transit',
    deliverySignal: 'IN_TRANSIT',
    origin: { city, state, country },
    destination: { city, state, country },
    dateShipped: '2026-01-20',
    estimatedDelivery: '2026-01-25',
    lastUpdated: '2026-01-23T10:00:00Z',
    lastChecked: '2026-01-23T10:00:00Z',
    delivered: false,
    events: [
        {
            timestamp: '2026-01-23T09:00:00Z',
            location: { city, state, country },
            description: 'Departed facility',
            statusCode: 'PU'
        }
    ],
    rawPayload: { /* Full API response */ }
}
```

#### 5. **Utilities** (`js/utils.js`)
- **Purpose:** Helper functions
- **Categories:**
  - Date formatting (`formatDate`)
  - Location formatting (`formatLocation`)
  - AWB validation (`validateAWB`)
  - Carrier detection (`detectCarrier`)
  - AWB truncation (`truncateAWB`)
  - Status icons (`getStatusIcon`, `getStatusColor`)
  - Export helpers (`toCSVRow`, `getCSVHeader`)
  - Performance (`debounce`, `throttle`)

---

## Data Flow

### Adding a New Tracking

```
User enters AWB → detectCarrier() → validateAWB()
                          ↓
              addTracking(awb, carrier)
                          ↓
              DHLAdapter.trackShipment(awb)
                          ↓
              API Request → DHL API
                          ↓
              Response → Normalizer.normalize()
                          ↓
              Normalized data → db.addTracking()
                          ↓
              IndexedDB stores data
                          ↓
              loadTrackings() → renderTable() + renderMobileCards()
                          ↓
              UI updates
```

### Viewing Tracking Details

```
User clicks "View" or card → showDetail(awb)
                          ↓
              db.getTracking(awb)
                          ↓
              Render detail panel with:
              - Shipment info
              - Event timeline
              - Raw JSON payload
              - Actions (Refresh, Delete)
```

### Filter/Search Flow

```
User types in search → debounced input event
                          ↓
              applyFilters()
                          ↓
              Filter trackings array by:
              - Carrier
              - Status
              - Search term (AWB)
                          ↓
              renderTable() + renderMobileCards()
                          ↓
              UI updates with filtered results
```

---

## File Structure

```
/projects/shipment-tracker/
│
├── index.html                 # Main app entry point
├── test-tracking.html         # Test page with URL params
│
├── css/
│   └── style.css             # All styles (mobile-first)
│
├── js/
│   ├── app.js                # Main application controller
│   ├── db.js                 # IndexedDB adapter (v4)
│   ├── document-manager.js   # Trade compliance document types & CRUD
│   ├── utils.js              # Utility functions
│   ├── normalizer.js         # Response normalizer
│   │
│   └── api/
│       ├── base.js           # Base API adapter
│       ├── dhl.js            # DHL Express adapter
│       ├── fedex.js          # FedEx adapter (TODO)
│       ├── ups.js            # UPS adapter (TODO)
│       └── usps.js           # USPS adapter (TODO)
│
├── proxy/
│   ├── cloudflare-worker.js  # Cloudflare Worker proxy
│   ├── DEPLOYMENT.md         # Proxy deployment guide
│   ├── DEPLOY-CHECKLIST.md   # Quick reference
│   └── QUICKSTART.md         # Quick setup guide
│
└── docs/
    ├── ARCHITECTURE.md       # This file
    ├── TODO.md               # Feature roadmap
    ├── CHANGELOG.md          # Version history
    ├── TESTING.md            # Testing guide
    ├── FORCE-REFRESH.md      # Force refresh docs
    └── CONFIG.md             # Configuration guide
```

---

## Configuration

### User Settings Structure

Settings are stored in IndexedDB `settings` store:

```javascript
{
    apiKeys: {
        DHL: 'YOUR_DHL_API_KEY',
        FedEx: {
            clientId: 'YOUR_FEDEX_CLIENT_ID',
            clientSecret: 'YOUR_FEDEX_CLIENT_SECRET'
        },
        UPS: {
            apiKey: 'YOUR_UPS_API_KEY',
            username: 'YOUR_UPS_USERNAME'
        },
        USPS: 'YOUR_USPS_API_KEY'
    },
    queryEngine: {
        cooldownMinutes: 10,      // Min time between API calls
        skipDelivered: true,       // Don't re-query delivered
        enableForceRefresh: false  // Allow bypassing cooldown
    }
}
```

### API Key Storage

**Three storage methods:**

1. **URL Parameters** (Testing only)
   ```
   test-tracking.html?dhl=YOUR_KEY&awb=1234567890
   ```
   - Stored in `sessionStorage`
   - Cleared when browser closes
   - Not committed to code

2. **Settings Panel** (Recommended for personal use)
   - Stored in IndexedDB
   - Persistent across sessions
   - Encrypted by browser
   - Never leaves user's device

3. **Cloudflare Worker** (Recommended for sharing/production)
   - API key stored as Cloudflare Secret
   - Never exposed to client
   - See `proxy/DEPLOYMENT.md`

### Environment Detection

The app detects which mode to use:

```javascript
// In js/api/base.js
var config = {
    proxies: {
        DHL: '',  // Empty = use direct mode
        // Or: 'https://your-worker.workers.dev'
    }
};
```

If proxy URL is empty → Direct API mode (key required in settings)
If proxy URL provided → Proxy mode (key on server)

---

## API Integration

### Supported Carriers (v1.3.0)

| Carrier | Status | Mock Data | Real API | Test AWBs |
|---------|--------|-----------|----------|-----------|
| DHL | ✅ Active | ✅ Yes | ✅ Ready | 6 sandbox AWBs |
| FedEx | ✅ Active | ✅ Yes | ⚠️ Stubbed | `111111111111`, `222222222222` |
| UPS | ✅ Active | ✅ Yes | ⚠️ Stubbed | `1Z999AA10123456780`, `1Z999AA10123456784` |
| Custom | ✅ Active | N/A | N/A | Manual entry only |

**Notes:**
- All carriers have mock data generators for testing without API keys
- FedEx and UPS have OAuth 2.0 implementations stubbed (ready when user provides keys)
- Test tracking numbers documented in `TEST_DATA.md`
- Real API adapters will activate automatically when user configures API keys in Settings
- **Custom carrier** is for manual tracking entries - no API calls, status must be updated manually

### Adapter Pattern

Each carrier adapter extends the base adapter:

```javascript
// js/api/dhl.js
var DHLAdapter = (function() {

    function trackShipment(awb) {
        var url = 'https://api-eu.dhl.com/track/shipments';
        var apiKey = getAPIKey(); // From IndexedDB or proxy

        return fetch(url + '?trackingNumber=' + awb, {
            headers: {
                'DHL-API-Key': apiKey
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            return parseResponse(data);
        });
    }

    function parseResponse(response) {
        // Transform DHL response to normalized format
        return {
            awb: response.shipments[0].id,
            carrier: 'DHL',
            status: mapStatus(response.shipments[0].status.statusCode),
            // ... more fields
        };
    }

    return {
        trackShipment: trackShipment
    };

})();
```

### Adding a New Carrier

To add support for a new carrier (e.g., OnTrac):

1. **Create adapter file:** `js/api/ontrac.js`

```javascript
var OnTracAdapter = (function() {

    function trackShipment(awb) {
        var url = 'https://api.ontrac.com/v1/tracking';
        var apiKey = getAPIKey();

        return fetch(url + '/' + awb, {
            headers: {
                'Authorization': 'Bearer ' + apiKey
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            return parseResponse(data);
        });
    }

    function parseResponse(response) {
        return {
            awb: response.trackingNumber,
            carrier: 'OnTrac',
            status: response.status,
            // Map OnTrac response to normalized format
        };
    }

    return {
        trackShipment: trackShipment
    };

})();
```

2. **Update carrier detection** in `js/utils.js`:

```javascript
function detectCarrier(awb) {
    if (/^C\d{14}$/.test(awb)) {
        return 'OnTrac'; // 14 digits starting with C
    }
    // ... existing patterns
}
```

3. **Update normalizer** in `js/normalizer.js`:

```javascript
function normalize(data, carrier) {
    switch (carrier.toUpperCase()) {
        case 'ONTRAC':
            return normalizeOnTrac(data);
        // ... existing cases
    }
}
```

4. **Add to index.html** script tags:

```html
<script src="js/api/ontrac.js"></script>
```

5. **Update settings panel** in `index.html`:

```html
<label for="ontracApiKey">
    <span>OnTrac API Key:</span>
    <input type="password" id="ontracApiKey" placeholder="Enter OnTrac API key">
</label>
```

---

## Storage System

### IndexedDB Schema

**Database Name:** `ShipmentTrackerDB`
**Version:** 4 (v4 added documents array support)

**Stores:**

#### 1. `trackings` (keyPath: `trackingId`)
```javascript
{
    trackingId: '1234567890_DHL',   // Composite: awb + '_' + carrier
    awb: '1234567890',
    carrier: 'DHL',
    status: 'In Transit',
    deliverySignal: 'IN_TRANSIT',
    origin: { city, state, country },
    destination: { city, state, country },
    dateShipped: '2026-01-20',
    estimatedDelivery: '2026-01-25',
    lastUpdated: '2026-01-23T10:00:00Z',
    lastChecked: '2026-01-23T10:00:00Z',
    delivered: false,
    events: [ /* array of events */ ],
    documents: [                    // v4: Trade compliance documents
        {
            type: 'COMMERCIAL_INVOICE',
            icon: '🧾',
            label: 'Commercial Invoice',
            url: 'https://drive.google.com/...',
            addedDate: '2026-01-26T10:00:00Z'
        }
    ]
}
```

**Indexes:**
- `by_carrier` - On `carrier` field
- `by_status` - On `deliverySignal` field
- `by_delivered` - On `delivered` field

#### 2. `raw_payloads` (keyPath: `awb`)
```javascript
{
    awb: '1234567890',              // Primary key
    carrier: 'DHL',
    timestamp: '2026-01-23T10:00:00Z',
    payload: { /* Full API response */ }
}
```

#### 3. `settings` (keyPath: `key`)
```javascript
{
    key: 'apiKeys',
    value: { DHL: 'key', FedEx: { ... } }
},
{
    key: 'queryEngine',
    value: { cooldownMinutes: 10, ... }
}
```

### Storage Adapter Methods

```javascript
// Create
await db.addTracking(tracking);

// Read
var tracking = await db.getTracking(awb);
var allTrackings = await db.getAllTrackings();

// Update
await db.updateTracking(awb, { status: 'Delivered' });

// Delete
await db.deleteTracking(awb);

// Bulk operations
await db.bulkAddTrackings([tracking1, tracking2]);

// Settings
await db.saveSetting('apiKeys', { DHL: 'key' });
var apiKeys = await db.getSetting('apiKeys');

// Clear all
await db.clearAll();
```

---

## Trade Compliance Document Linking

**Added in:** v1.2.0

### Overview

Shipments can have trade compliance documents attached via Google Drive URLs. This helps track whether required documents (Commercial Invoice, Packing List) are linked before export.

### Document Types

```javascript
// Core documents (checked for compliance status)
COMMERCIAL_INVOICE: { icon: '🧾', label: 'Commercial Invoice', required: true }
PACKING_LIST:       { icon: '📦', label: 'Packing List', required: true }
SLI_AWB:            { icon: '✈️', label: 'SLI / AWB', required: false }

// Compliance documents (conditional)
UN38_3:             { icon: '🔋', label: 'UN38.3 Test Summary' }
MSDS:               { icon: '⚠️', label: 'MSDS / SDS' }
ECCN_LICENSE:       { icon: '⚖️', label: 'ECCN / License Info' }
FCC_CE_GRANT:       { icon: '📜', label: 'FCC / CE Grant' }
POA:                { icon: '📜', label: 'Power of Attorney' }
OTHER:              { icon: '📎', label: 'Other' }
```

### UI Components

1. **Desktop Table - Compliance Column**
   - Shows ✅ if CI + PL both present
   - Shows ⚠️ if CI or PL missing
   - Appends 🔋 if UN38.3 present

2. **Detail Panel - Documents Section**
   - Collapsible section showing attached documents
   - Add/Remove document functionality
   - Launch button to open document URL

3. **Import/Export**
   - CSV exports include `documents` column as JSON
   - JSON exports include full documents array
   - Imports merge documents (add missing, don't overwrite)

### DocumentManager API

```javascript
// Initialize
var docManager = new DocumentManager();

// Get compliance status
var status = docManager.getComplianceStatus(tracking);
// Returns: { hasCI, hasPL, hasUN383, coreComplete, status }

// Add document
docManager.addDocument(tracking, 'COMMERCIAL_INVOICE', 'https://...');

// Remove document
docManager.removeDocument(tracking, 'COMMERCIAL_INVOICE');

// Merge documents from import
docManager.mergeDocuments(existingTracking, importDocuments);
```

---

## Import/Export System

**Added in:** v1.3.0

### Overview

The import/export system supports CSV and JSON formats with full document support. Imports use **Update mode** by default (updates existing records instead of skipping).

### CSV Export Format

Full CSV export includes all tracking fields and document columns:

```csv
awb,carrier,status,deliverySignal,delivered,dateShipped,origin_city,origin_state,origin_country,origin_postalCode,destination_city,destination_state,destination_country,destination_postalCode,estimatedDelivery,lastUpdated,lastChecked,note,tags,documents,doc_CI,doc_PL,doc_SLI,doc_UN383,doc_MSDS,doc_OTHER
```

**Document Columns:**
- `documents` - Full JSON array of all documents
- `doc_CI` - Commercial Invoice URL
- `doc_PL` - Packing List URL
- `doc_SLI` - SLI/AWB URL
- `doc_UN383` - UN38.3 Battery Certificate URL
- `doc_MSDS` - MSDS/SDS URL
- `doc_OTHER` - JSON array of other document types

### CSV Import Parsing

**Simple Format** (3 columns):
```csv
AWB,Carrier,DateShipped
1234567890,DHL,2026-01-20
```

**Full Format** (27+ columns):
Parses all columns from export format, including:
- Individual `doc_*` columns merged into `documents` array
- `documents` JSON column parsed
- Origin/destination fields mapped to nested objects

### Import Modes

**Add New Mode** (Default - Data Management Modal → Import Add New):
- New records are added
- Existing records are **skipped**
- Safe for adding new trackings without affecting existing data

**Update Mode** (Data Management Modal → Import Update):
- New records are added
- Existing records are **updated** (status, dates, etc. overwritten)
- Documents are merged using `mergeDocuments()`
- Uses `saveSmartTracking()` to preserve earliest date shipped
- Shows warning confirmation before executing

**Replace All Mode** (Data Management Modal → Import Replace All):
- **All existing data is deleted first** (with warning confirmation)
- Then imports all records as new
- Use for full database restore from backup

### Document Merge Logic

```javascript
// mergeDocuments(existing, incoming)
// - Incoming overwrites same document type
// - Preserves document types not in incoming

var existing = [
    { type: 'COMMERCIAL_INVOICE', url: 'https://old-ci.com' },
    { type: 'PACKING_LIST', url: 'https://pl.com' }
];
var incoming = [
    { type: 'COMMERCIAL_INVOICE', url: 'https://new-ci.com' },
    { type: 'UN38_3', url: 'https://battery.com' }
];

var result = mergeDocuments(existing, incoming);
// Result:
// [
//     { type: 'COMMERCIAL_INVOICE', url: 'https://new-ci.com' },  // Overwritten
//     { type: 'PACKING_LIST', url: 'https://pl.com' },            // Preserved
//     { type: 'UN38_3', url: 'https://battery.com' }              // Added
// ]
```

### Custom Carrier Support

**Purpose:** Track shipments from carriers without API integration (e.g., local couriers, freight forwarders).

**Behavior:**
- No API calls on add or refresh
- Returns stub data for new trackings
- Status must be updated manually
- Documents can be attached normally

```javascript
// When adding a Custom carrier tracking:
var tracking = {
    awb: 'CUSTOM-001',
    carrier: 'Custom',
    status: 'Manual Tracking',
    deliverySignal: 'UNKNOWN',
    // ... stub data
};
```

### Documents List Modal

**Purpose:** Manage documents for a tracking without opening the detail panel.

**Access:** Click the docs button (📄/✅/⚠️) in the Actions column.

**Features:**
- View all attached documents
- Open document in new window
- Edit document URL
- Remove document
- Add new document

---

## Mobile-First Design

### Responsive Breakpoints

```css
/* Mobile: < 768px */
- Show card-based layout
- Hide table
- Mobile bottom bar (2 rows: stat filters + actions)
- Hide desktop stats container
- Stack filters vertically
- Full-width inputs (44px min height)

/* Tablet: 768px - 1023px */
- Show table
- Detail panel as overlay
- Filters in single row
- Desktop stats visible

/* Desktop: ≥ 1024px */
- Show table
- Detail panel side-by-side (TODO)
- All features visible
- Desktop stats visible
```

### Mobile Bottom Bar (v1.1.0)

**Replaces FAB buttons with integrated 2-row control bar**

```
┌─────────────────────────────────────┐
│ Row 1: Stat Filters                 │
│ [🚚 Active 5] [✅ Delivered 12] [⚠️ Issues 2] │
├─────────────────────────────────────┤
│ Row 2: Actions                      │
│ [📦 Total 19] [➕ Add] [🔍 Filter]  │
└─────────────────────────────────────┘
```

**Features:**
- **Fixed position** at bottom of screen with safe area insets
- **Stat filter buttons** (Row 1): Click to filter shipments by status
  - Active state highlighting (blue background + white text)
  - Live count badges update automatically
  - Click again to clear filter
- **Action buttons** (Row 2):
  - Total: Shows all shipments (acts as "clear filter")
  - Add: Opens add tracking form
  - Filter: Toggles filter bar visibility

**CSS Classes:**
- `.mobile-bottom-bar` - Container (fixed position, bottom: 0)
- `.bottom-bar-row` - Row container (flexbox)
- `.bottom-bar-btn` - Individual button (flex: 1, card-like)
- `.bottom-bar-btn.active` - Active filter state
- `.btn-icon`, `.btn-label`, `.btn-count` - Button content elements

### Mobile Card Structure (v1.1.0)

```
┌─────────────────────────────────────┐
│ 🚚  1234567890  DHL  2x    ⌄        │ ← Header (always visible)
│     (clickable link)                │
├─────────────────────────────────────┤
│ Full AWB: 1234567890                │
│ Route: Hong Kong → NYC              │ ← Body (collapsed)
│ Est. Delivery: Jan 25, 2026         │
│ Last Updated: Jan 23, 2026          │
│ [🔗 Track on DHL] [📋 Details] [🗑️ Delete] │
└─────────────────────────────────────┘
```

**Changes in v1.1.0:**
- ✅ AWB now shows **full tracking number** (no truncation)
- ✅ AWB is **clickable link** to carrier tracking page
- ✅ New **"Track on {Carrier}"** button in card actions
- ✅ Duplicate badge still works (compares first 2 + last 5 chars)

### AWB Display Logic (v1.1.0)

**Desktop Table:**
```javascript
// AWB shown truncated with hover tooltip
function renderTableRow(tracking) {
    var awbCell = document.createElement('td');
    var awbLink = document.createElement('a');
    awbLink.href = TrackingUtils.getCarrierTrackingURL(tracking.carrier, tracking.awb);
    awbLink.textContent = truncateAWB(tracking.awb); // "1...67890"
    awbLink.title = tracking.awb; // Full AWB on hover
    // ...
}
```

**Mobile Cards:**
```javascript
// AWB shown in full
function createMobileCard(tracking) {
    var awbDiv = document.createElement('div');
    var awbLink = document.createElement('a');
    awbLink.href = TrackingUtils.getCarrierTrackingURL(tracking.carrier, tracking.awb);
    awbLink.textContent = tracking.awb; // Full AWB: "1234567890"
    // ...
}
```

### Carrier Tracking Links (v1.1.0)

```javascript
// TrackingUtils.getCarrierTrackingURL(carrier, awb)
var urls = {
    'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB=' + awb,
    'FEDEX': 'https://www.fedex.com/fedextrack/?trknbr=' + awb,
    'UPS': 'https://www.ups.com/track?tracknum=' + awb
};

// Usage in mobile card:
var trackBtn = document.createElement('a');
trackBtn.href = getCarrierTrackingURL('DHL', '1234567890');
trackBtn.target = '_blank';
trackBtn.rel = 'noopener noreferrer';
trackBtn.textContent = '🔗 Track on DHL';
```

### Duplicate Detection (v1.1.0)

```javascript
// Build map of similar AWBs (first 2 + last 5 chars)
var duplicateMap = {};
trackings.forEach(function(t) {
    var key = t.awb.length > 7
        ? (t.awb.substring(0, 2) + t.awb.slice(-5))
        : t.awb;
    if (!duplicateMap[key]) duplicateMap[key] = [];
    duplicateMap[key].push(t.awb);
});

// Example:
// duplicateMap = {
//     '1267890': ['1234567890', '1999967890'], // 2 similar AWBs
//     '1Z56784': ['1Z999AA10123456784']        // 1 AWB
// };

// Show badge if similar AWBs exist
var key = awb.substring(0, 2) + awb.slice(-5);
if (duplicateMap[key].length > 1) {
    badge.textContent = duplicateMap[key].length + 'x';
}
```

### Status Icon System

```javascript
var STATUS_ICONS = {
    'DELIVERY': '✅',           // Green (#10b981)
    'IN_TRANSIT': '🚚',         // Blue (#3b82f6)
    'OUT_FOR_DELIVERY': '🏠',   // Purple (#8b5cf6)
    'PICKUP': '📦',             // Orange (#f59e0b)
    'EXCEPTION': '⚠️',          // Red (#ef4444)
    'FAILED': '❌'              // Dark Red (#991b1b)
};
```

---

## Development Guide

### Prerequisites

- Web server (any - Python SimpleHTTPServer, nginx, Apache, etc.)
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- Carrier API keys (DHL, FedEx, UPS, etc.)

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/wayneef84/wayneef84.github.io.git
cd wayneef84.github.io/projects/shipment-tracker

# 2. Start local server (Python 3)
python3 -m http.server 8000

# 3. Open browser
open http://localhost:8000/index.html

# 4. Configure API keys
# Go to Settings → API Keys → Enter your keys
```

### Testing Workflow

```bash
# 1. Open test page with API key
http://localhost:8000/test-tracking.html?dhl=YOUR_KEY&awb=1234567890

# 2. Check "Use Direct API Mode"
# 3. Click "Track Shipment"
# 4. Verify response in console
```

### Code Style Guidelines

**JavaScript:**
- ES5-compatible (no arrow functions, no `const`/`let`)
- IIFE pattern for modules
- Use `var` for variables
- Use regular functions, not arrow functions
- Avoid `??` (nullish coalescing) - use ternary
- Avoid `?.` (optional chaining) - use explicit checks

**CSS:**
- Mobile-first (min-width media queries)
- Use CSS custom properties (`:root`)
- BEM naming convention
- Flexbox for layouts
- Use `dvh` for viewport height (with `vh` fallback)

**Example:**

```javascript
// ❌ Bad (ES6+)
const trackShipment = (awb) => {
    const data = response?.data ?? [];
    return data;
};

// ✅ Good (ES5)
var trackShipment = function(awb) {
    var data = response && response.data ? response.data : [];
    return data;
};
```

### Build/Deploy

**No build step required!** Just commit and push:

```bash
git add .
git commit -m "feat: Add OnTrac carrier support"
git push origin main
```

GitHub Pages automatically deploys.

---

## LLM Context Notes

> **For future LLMs working on this codebase:**

### Critical Design Decisions

1. **ES5 Compatibility:** This project MUST remain ES5-compatible for Safari support. Never suggest ES6+ features.

2. **No Build Tools:** No Webpack, Rollup, Babel, etc. Keep it simple with direct script loading.

3. **BYOK Model:** Users provide their own API keys. Never hardcode API keys in the codebase.

4. **Offline-First:** IndexedDB is the source of truth. Cloud sync is optional and future.

5. **Mobile-First:** Design for mobile screens first, then enhance for desktop.

### Common Tasks

**Add new carrier:**
- Create `js/api/[carrier].js` adapter
- Update `detectCarrier()` in `utils.js`
- Add normalizer case in `normalizer.js`
- Add settings input in `index.html`
- Add script tag in `index.html`

**Add new UI feature:**
- Check mobile impact first
- Use responsive breakpoints
- Test on Safari (ES5 compatibility)
- Update both `renderTable()` and `renderMobileCards()`

**Fix API integration:**
- Check adapter in `js/api/[carrier].js`
- Verify normalizer in `js/normalizer.js`
- Test with `test-tracking.html`
- Check browser console for errors

**Debug storage issue:**
- Open DevTools → Application → IndexedDB
- Check `ShipmentTrackerDB` stores
- Verify data structure matches schema
- Test CRUD operations in console

### Current State (v1.1.0)

**Completed:**
- ✅ Mobile card-based layout
- ✅ AWB truncation (1...23456)
- ✅ Duplicate detection
- ✅ Status icons with colors
- ✅ Stats dashboard contrast fixes
- ✅ Filter bar mobile layout
- ✅ Force refresh feature
- ✅ JSON payload viewer
- ✅ Clear all data function
- ✅ DHL API adapter

**In Progress:**
- 🚧 Query engine (auto-refresh)
- 🚧 FedEx/UPS/USPS adapters
- 🚧 Desktop split view

**Not Started:**
- ❌ Push notifications
- ❌ Cloud sync
- ❌ Browser extension
- ❌ Mobile apps

### Code Patterns to Follow

**Adding event listeners:**
```javascript
// Always use var and regular functions
document.getElementById('myBtn').onclick = function() {
    self.doSomething();
};
```

**Creating DOM elements:**
```javascript
var div = document.createElement('div');
div.className = 'my-class';
div.textContent = 'Hello';
container.appendChild(div);
```

**Handling async operations:**
```javascript
ShipmentTrackerApp.prototype.myMethod = async function() {
    try {
        var data = await this.db.getData();
        console.log('Success:', data);
    } catch (err) {
        console.error('Error:', err);
        this.showToast('Failed: ' + err.message, 'error');
    }
};
```

**Filtering arrays:**
```javascript
var filtered = this.trackings.filter(function(t) {
    return t.carrier === 'DHL';
}.bind(this)); // Don't forget .bind(this)!
```

### Gotchas to Avoid

1. **Don't use arrow functions** - Safari doesn't support them in our ES5 target
2. **Don't use template literals** - Use string concatenation with `+`
3. **Don't use destructuring** - Assign variables explicitly
4. **Don't use spread operator** - Use `Array.prototype.slice()` or loops
5. **Don't use `async/await` in IIFEs** - Only in prototype methods
6. **Don't forget `.bind(this)`** - When using callbacks in filter/map/forEach
7. **Don't commit API keys** - Always use `YOUR_KEY` placeholder in docs

---

## Debug Menu (v1.1.0)

### Overview

Press **`Ctrl+Shift+D`** (or **`Cmd+Shift+D`** on Mac) to open the debug menu.

**Purpose:** Quickly load test data, test UI with various scenarios, and manage trackings without manual entry.

**File:** `js/debug.js`

### Features

#### 1. Load Test Datasets

**Mixed Scenarios** (6 shipments)
- 2 DHL trackings (active, delivered)
- 2 FedEx trackings (delivered, in transit)
- 2 UPS trackings (out for delivery, exception)

**Carrier-Specific Datasets**
- DHL: 6 official sandbox tracking numbers
- FedEx: 3 test scenarios (delivered, transit, exception)
- UPS: 3 test scenarios (delivered, transit, exception)

#### 2. Quick Add Single Tracking

Add individual test trackings by carrier and status:
- **DHL:** Active (`1234567890`), Delivered (`9876543210`)
- **FedEx:** In Transit (`222222222222`), Exception (`999999999999`)
- **UPS:** Out for Delivery (`1Z999AA10123456781`), Delivered (`1Z999AA10123456780`)

#### 3. Actions

**Refresh All Trackings**
- Fetches latest data for all shipments
- Uses appropriate adapter (mock or real API)
- Shows confirmation dialog first

**Clear All Data**
- Deletes all tracking data from IndexedDB
- ⚠️ Cannot be undone - shows confirmation dialog
- Useful for resetting to clean state

#### 4. Real-Time Stats

- **Tracking Count:** Number of shipments in database
- **DB Size:** Estimated IndexedDB size (KB/MB)

### Usage

```javascript
// Open debug menu
// Press Ctrl+Shift+D (or Cmd+Shift+D)

// Or programmatically:
DebugMenu.open();

// Close debug menu
DebugMenu.close();

// Or press Ctrl+Shift+D again
```

### Implementation Details

**Module:** `window.DebugMenu`

**Methods:**
- `init()` - Initialize keyboard shortcut and button handlers
- `toggle()` - Open/close menu
- `open()` - Show menu with dark overlay
- `close()` - Hide menu and remove overlay
- `updateStats()` - Refresh tracking count and DB size display
- `loadMixedDataset()` - Load 6-shipment mixed dataset
- `loadDHLDataset()` - Load DHL sandbox AWBs
- `loadFedExDataset()` - Load FedEx test AWBs
- `loadUPSDataset()` - Load UPS test AWBs
- `addTracking(awb, carrier)` - Add single test tracking
- `trackAndSave(awb, carrier)` - Fetch mock data and save to DB
- `refreshAll()` - Force refresh all trackings
- `clearAll()` - Delete all data with confirmation

**HTML Structure:**
```html
<div id="debugMenu" class="debug-menu">
    <div class="debug-header">
        <h3>🛠️ Debug Menu</h3>
        <button id="debugCloseBtn">✕</button>
    </div>
    <div class="debug-content">
        <!-- Dataset buttons -->
        <!-- Quick add buttons -->
        <!-- Action buttons -->
        <!-- Stats display -->
    </div>
</div>
```

**CSS Classes:**
- `.debug-menu` - Modal container (fixed, centered)
- `.debug-overlay` - Dark backdrop (click to close)
- `.debug-btn` - Primary action button
- `.debug-btn-sm` - Small inline button
- `.debug-btn-warning` - Orange button (Refresh All)
- `.debug-btn-danger` - Red button (Clear All)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` (Windows/Linux) | Toggle debug menu |
| `Cmd+Shift+D` (Mac) | Toggle debug menu |
| `Esc` | Close debug menu (click overlay) |

### Mock Data Generation

Each carrier adapter has a `generateMockTrackingData(awb)` function that creates realistic test data:

**FedEx Example:**
```javascript
// Different scenarios based on AWB pattern
var isDelivered = awb.includes('111111') || awb.endsWith('0');
var isException = awb.includes('999') || awb.endsWith('9');

// Generate status, timestamps, events
return {
    awb: awb,
    carrier: 'FedEx',
    status: isDelivered ? 'Delivered' : 'In Transit',
    deliverySignal: isDelivered ? 'DELIVERY' : 'IN_TRANSIT',
    events: generateMockEvents(awb, isDelivered, isException),
    // ...
};
```

### Test Data Source

Test tracking numbers are documented in **`TEST_DATA.md`** with:
- Official sandbox AWBs (DHL)
- Test scenarios (FedEx, UPS)
- Mock data format examples
- API documentation links

---

### Testing Commands

```javascript
// In browser console:

// Test truncation
TrackingUtils.truncateAWB('1234567890'); // → '1...67890'

// Test carrier detection
TrackingUtils.detectCarrier('1234567890'); // → 'DHL'

// Test status icon
TrackingUtils.getStatusIcon('DELIVERY'); // → '✅'

// Check IndexedDB
var db = new IndexedDBAdapter();
db.init().then(function() {
    return db.getAllTrackings();
}).then(console.log);

// Test API adapter (requires key in settings)
DHLAdapter.trackShipment('1234567890')
    .then(console.log)
    .catch(console.error);
```

---

## Troubleshooting

### Common Issues

**Issue:** Cards not showing on mobile
- **Check:** CSS breakpoint at 767px
- **Fix:** Verify `mobileCardsContainer` has `display: flex` at `< 768px`

**Issue:** API returns 401 Unauthorized
- **Check:** API key in Settings → API Keys
- **Fix:** Verify key is valid, not expired

**Issue:** IndexedDB not persisting
- **Check:** Browser privacy settings
- **Fix:** Allow site data, check incognito mode

**Issue:** Truncated AWBs look identical
- **Check:** Duplicate detection logic in `renderMobileCards()`
- **Expected:** Badge shows "2x" or more

**Issue:** Table not responsive
- **Check:** Viewport meta tag in `<head>`
- **Fix:** Ensure `width=device-width, initial-scale=1.0`

---

## Version History

### v1.1.0 (2026-01-23) - Mobile UX Overhaul
- Mobile card-based layout
- AWB truncation with duplicate detection
- Stats dashboard contrast fixes
- Filter bar mobile improvements
- Status icon system

### v1.0.0 (2026-01-23) - Initial Release
- DHL API integration
- IndexedDB storage
- Desktop table view
- JSON payload viewer
- Force refresh feature
- Clear all data function
- Export to JSON/CSV/Excel

---

## Resources

- **API Documentation:**
  - [DHL API](https://developer.dhl.com/)
  - [FedEx API](https://developer.fedex.com/)
  - [UPS API](https://www.ups.com/upsdeveloperkit)
  - [USPS API](https://www.usps.com/business/web-tools-apis/)

- **Browser Compatibility:**
  - [IndexedDB Support](https://caniuse.com/indexeddb)
  - [Flexbox Support](https://caniuse.com/flexbox)
  - [ES5 Compatibility](https://kangax.github.io/compat-table/es5/)

- **Project Links:**
  - [GitHub Repository](https://github.com/wayneef84/wayneef84.github.io)
  - [Live Demo](https://wayneef84.github.io/projects/shipment-tracker/)
  - [Issue Tracker](https://github.com/wayneef84/wayneef84.github.io/issues)

---

**For questions or contributions, please see CONTRIBUTING.md (coming soon).**

*This document is maintained by Wayne Fong (wayneef84) with assistance from Claude Sonnet 4.5.*
