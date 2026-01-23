# Shipment Tracker

**Version:** 1.0.0
**Status:** In Development
**Last Updated:** 2026-01-22
**Category:** Utility Project (non-game)

---

## Overview

A browser-based shipment tracking application that aggregates tracking data from multiple carriers (DHL, FedEx, UPS) with smart API rate limiting, offline storage, and multi-format export capabilities.

### Key Features

- **BYOK (Bring Your Own Key)**: User-provided API keys for privacy and cost control
- **Smart Query Engine**: Automatic rate limiting, delivered-item caching, batch API calls
- **IndexedDB Storage**: Offline-first with robust data persistence (5-100MB capacity)
- **Firebase Migration Path**: Built-in adapter pattern for cloud sync
- **Multi-Format Export**: JSON, CSV, Excel (xlsx)
- **Mobile-First UI**: Touch-optimized, responsive design
- **Carrier Payload Storage**: Raw API responses preserved alongside normalized data

---

## Architecture Highlights

### Storage Strategy
- **Phase 1 (Current)**: IndexedDB for local storage
- **Phase 2 (Future)**: Optional Firebase/Supabase cloud sync via adapter pattern
- **Data Model**: Normalized tracking records + raw carrier payloads

### Smart Query Logic
- Skip API calls for delivered shipments
- Configurable cooldown period (default: 10 minutes)
- Batch queries grouped by carrier
- Force-refresh override available

### Carrier Support
- **DHL Express API**: Tracking API v2
- **FedEx Track API**: REST API v1
- **UPS Tracking API**: JSON API

---

## Dependencies

### Browser APIs (No External Libraries)
- **IndexedDB**: Primary data store
- **Fetch API**: HTTP requests to carrier APIs
- **Blob API**: File export (JSON, CSV, Excel)
- **LocalStorage**: API key storage (encrypted)

### Optional Future Dependencies
- **Firebase SDK** (v10.x): For cloud sync adapter
- **SheetJS (xlsx.js)** (v0.18.x): For Excel export (if not using minimal CSV-to-XLSX)

### Shared UI Patterns (from Fong Family Arcade games)
- Mobile CSS patterns from `/games/slots/css/slots.css`
- Form controls from `/games/xiangqi/index.html`
- Layout structure from `/games/letter-tracing/css/style.css`
- Table rendering patterns from `/games/cards/war/index.html`

---

## File Structure

```
/projects/shipment-tracker/
├── index.html                  # Main application
├── test.html                   # IndexedDB test suite
├── INFO.md                     # This file
├── README.md                   # User guide
├── css/
│   ├── style.css              # Layout, responsive, mobile-first
│   └── theme.css              # Colors & branding
├── js/
│   ├── app.js                 # Main controller, UI orchestration
│   ├── db.js                  # ✅ IndexedDB adapter (COMPLETE)
│   ├── db-test.js             # ✅ Test suite (COMPLETE)
│   ├── query-engine.js        # Smart query logic, rate limiting
│   ├── api/
│   │   ├── base.js           # Shared API utilities
│   │   ├── dhl.js            # DHL adapter + payload parser
│   │   ├── fedex.js          # FedEx adapter + payload parser
│   │   └── ups.js            # UPS adapter + payload parser
│   ├── normalizer.js          # Payload → standard format
│   ├── export.js              # JSON, CSV, Excel export
│   └── utils.js               # TrackingUtils (formatters, validators)
└── docs/
    ├── ARCHITECTURE.md        # IndexedDB schema, Firebase migration
    ├── API.md                 # Carrier API integration guide
    ├── DATA_SCHEMA.md         # Normalized data structure
    ├── EXPORT.md              # Export/import functionality
    └── DB_USAGE.md            # ✅ IndexedDB usage guide (COMPLETE)
```

---

## Data Flow

```
User Input (AWB + Carrier)
    ↓
Query Engine (Smart Filter)
    ↓
    ├─→ Already Delivered? → Skip API call, load from IndexedDB
    ├─→ Last Checked < 10 min? → Skip API call, load from cache
    └─→ Needs Update → Batch with other AWBs by carrier
            ↓
    Carrier API Call (DHL, FedEx, UPS)
            ↓
    Raw Payload Storage (IndexedDB: `raw_payloads` store)
            ↓
    Normalizer (Extract standard fields)
            ↓
    IndexedDB: `trackings` store (normalized data)
            ↓
    UI Update (Table render, status indicators)
```

---

## Version History

### v1.0.0 (In Development)
- IndexedDB storage layer
- DHL, FedEx, UPS API adapters
- Smart query engine with configurable cooldown
- Batch API calls by carrier
- Raw payload preservation
- Normalized data model
- JSON, CSV export
- Mobile-first UI

### Planned (v1.1.0)
- Excel export (xlsx format)
- Firebase cloud sync adapter
- Multi-device sync
- Conflict resolution (last-write-wins)

### Planned (v1.2.0)
- Push notifications (delivered status)
- Webhooks support (carrier callbacks)
- Advanced filtering (date range, status)
- Bulk import from CSV/Excel

---

## Configuration

### Query Engine Settings
```javascript
{
    cooldownMinutes: 10,        // Min time between API calls per AWB
    batchSize: 10,              // Max AWBs per batch API call
    enableForceRefresh: true,   // Allow manual override
    skipDelivered: true         // Don't query delivered items
}
```

### API Key Storage
- Keys stored in `localStorage` (encrypted with Web Crypto API)
- Per-carrier keys: `{ DHL: 'key1', FedEx: 'key2', UPS: 'key3' }`
- Settings panel for key management

### IndexedDB Configuration
```javascript
{
    dbName: 'ShipmentTrackerDB',
    version: 1,
    stores: {
        trackings: {
            keyPath: 'awb',
            indexes: ['carrier', 'delivered', 'lastChecked', 'dateShipped']
        },
        raw_payloads: {
            keyPath: 'id',  // auto-increment
            indexes: ['awb', 'carrier', 'timestamp']
        },
        settings: {
            keyPath: 'key'
        }
    }
}
```

---

## Browser Compatibility

- **Chrome/Edge**: ✅ Full support (IndexedDB v3)
- **Safari**: ✅ iOS 10+, macOS 10.12+ (IndexedDB v2)
- **Firefox**: ✅ v58+ (IndexedDB v3)
- **Mobile**: ✅ Optimized for touch, safe-area-inset support

---

## Security Considerations

- **API Keys**: Never commit to repo, stored in localStorage (user-provided)
- **CORS**: Carrier APIs may require backend proxy (see API.md)
- **Rate Limiting**: Respect carrier API limits (documented per carrier)
- **Data Privacy**: All data stored locally (IndexedDB), optional cloud sync

---

## Testing Strategy

### Phase 1: Manual Testing
- Add tracking numbers from each carrier
- Verify batch queries group correctly
- Test delivered-item skip logic
- Validate 10-minute cooldown
- Test force-refresh override

### Phase 2: Automated Tests (Future)
- Mock carrier API responses
- Test normalizer with sample payloads
- Validate IndexedDB schema migrations
- Test export formats (JSON, CSV, Excel)

---

## Development Notes

### Code Style
- **JavaScript**: ES6+ (async/await, modules)
- **CSS**: Flexbox, Grid, custom properties
- **Mobile**: 100dvh, env(safe-area-inset-*)
- **No Build Tools**: Vanilla JS, ES6 modules

### Performance Targets
- Initial load: < 2s
- API query: < 3s per carrier (batch of 10)
- UI render: < 100ms (60 FPS)
- Export (100 records): < 1s

### Accessibility
- Semantic HTML (table, labels, headings)
- ARIA attributes for status indicators
- Keyboard navigation support
- Screen reader tested

---

## Project Context

This is a **utility project** (non-game) that lives separately from the Fong Family Arcade games in `/projects/` instead of `/games/`.

### Development Guidelines
- Read `/CLAUDE.md` for architecture guidance
- Update this `INFO.md` when adding features
- Test on mobile Safari before committing
- This project can be used independently or integrated with the arcade

---

## License

See root LICENSE file.
