# Shipment Tracker

**A browser-based multi-carrier shipment tracking application with smart API rate limiting and offline-first storage.**

**Category:** Utility Project (lives in `/projects/`, not `/games/`)

---

## 🚀 Quick Start

1. **Open** `index.html` in your browser
2. **Add API Keys** in Settings (⚙️)
   - DHL Express API Key
   - FedEx Client ID + Secret
   - UPS Access Key + Username
3. **Add Tracking Number** with carrier selection
4. **Track** - App automatically batches queries and caches results

---

## ✨ Features

### Smart Query Engine
- ✅ **Rate Limiting**: Configurable cooldown (default: 10 minutes per AWB)
- ✅ **Batch Queries**: Groups AWBs by carrier for efficient API usage
- ✅ **Delivered Cache**: Stops querying delivered shipments automatically
- ✅ **Force Refresh**: Manual override for urgent updates

### Multi-Carrier Support
- 🚚 **DHL Express** (API v2)
- 📦 **FedEx Track** (REST v1 with OAuth 2.0)
- 📮 **UPS Tracking** (JSON v1)

### Data Storage
- 💾 **IndexedDB**: Offline-first, 5-100MB capacity
- 🔄 **Raw Payloads**: Preserves original API responses
- 📊 **Normalized Schema**: Consistent format across carriers
- ☁️ **Cloud Sync Ready**: Firebase/Supabase adapter pattern

### Export Formats
- 📄 **JSON**: Full backup with optional raw payloads
- 📊 **CSV**: Simple spreadsheet format
- 📈 **Excel**: Multi-sheet workbooks with statistics

### Mobile-First UI
- 📱 Touch-optimized controls
- 🔍 Responsive layout (100dvh, safe-area-inset)
- 🎨 Founding & Forging theming

---

## 📁 Project Structure

```
/projects/shipment-tracker/
├── index.html                  # Main application
├── test.html                   # IndexedDB test suite
├── INFO.md                     # Project metadata
├── README.md                   # This file
├── css/
│   ├── style.css              # Layout & responsive
│   └── theme.css              # Colors & branding
├── js/
│   ├── app.js                 # Main controller
│   ├── db.js                  # ✅ IndexedDB adapter (COMPLETE)
│   ├── db-test.js             # ✅ Test suite (COMPLETE)
│   ├── query-engine.js        # Smart query logic
│   ├── api/
│   │   ├── base.js           # Shared API utilities
│   │   ├── dhl.js            # DHL adapter + normalizer
│   │   ├── fedex.js          # FedEx adapter + normalizer
│   │   └── ups.js            # UPS adapter + normalizer
│   ├── normalizer.js          # Payload normalization
│   ├── export.js              # JSON/CSV/Excel export
│   └── utils.js               # Formatters & validators
└── docs/
    ├── ARCHITECTURE.md        # IndexedDB schema, Firebase migration
    ├── API.md                 # Carrier integration guide
    ├── DATA_SCHEMA.md         # Normalized data structure
    ├── EXPORT.md              # Export/import functionality
    └── DB_USAGE.md            # ✅ IndexedDB usage guide (COMPLETE)
```

---

## 📖 Documentation

### For Developers

1. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**
   - IndexedDB schema design
   - Firebase migration strategy
   - Storage adapter pattern
   - Smart query engine logic
   - Delivery signal buckets

2. **[API.md](docs/API.md)**
   - DHL Express API integration
   - FedEx Track API (OAuth 2.0)
   - UPS Tracking API
   - CORS proxy setup
   - Rate limiting strategies
   - Error handling patterns

3. **[DATA_SCHEMA.md](docs/DATA_SCHEMA.md)**
   - Normalized tracking record format
   - Raw payload examples (DHL, FedEx, UPS)
   - Normalization logic
   - Field validation rules
   - Data migration examples

4. **[EXPORT.md](docs/EXPORT.md)**
   - JSON export/import
   - CSV export/import
   - Excel export (SheetJS)
   - Cloud database export (Supabase, Firebase, Google Sheets)

### For Users

- **Getting API Keys**:
  - DHL: https://developer.dhl.com/api-reference/shipment-tracking
  - FedEx: https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html
  - UPS: https://developer.ups.com/api/reference/track/product-info

- **Privacy**:
  - All data stored locally in your browser (IndexedDB)
  - API keys encrypted in localStorage
  - Cloud sync is optional (user-initiated)

---

## 🛠️ Implementation Status

### ✅ Completed (Documentation)
- [x] Project structure
- [x] Architecture design
- [x] API integration plan
- [x] Data schema
- [x] Export/import spec

### 🚧 In Progress (Next Steps)
- [ ] IndexedDB adapter implementation
- [ ] Query engine implementation
- [ ] DHL adapter + normalizer
- [ ] FedEx adapter + normalizer
- [ ] UPS adapter + normalizer
- [ ] UI layout (HTML/CSS)
- [ ] Export buttons
- [ ] Settings panel

### 🔮 Future Enhancements
- [ ] Firebase cloud sync adapter
- [ ] Push notifications (delivered status)
- [ ] Webhooks support
- [ ] Advanced filtering (date range, status)
- [ ] Bulk import from CSV/Excel
- [ ] Mobile app (PWA)

---

## 🎯 Key Design Decisions

### Why IndexedDB over localStorage?
- **Capacity**: 50MB+ vs 5-10MB
- **Structured Data**: Built-in indexing for fast queries
- **Async API**: Non-blocking, better UX
- **Future-Proof**: Easy migration to Firebase

### Why Store Raw Payloads?
- **Debugging**: Compare normalized vs raw data
- **Re-normalization**: Improve logic without re-querying API
- **Audit Trail**: Prove what carrier returned
- **Carrier-Specific Features**: Preserve unique fields

### Why Delivery Signal Buckets?
- **Consistency**: DHL/FedEx/UPS use different status codes
- **Filtering**: "Show all out-for-delivery" works across carriers
- **Terminal Detection**: Auto-stop querying delivered items

### Why BYOK (Bring Your Own Key)?
- **Privacy**: User controls data, no shared API keys
- **Cost**: User pays for their own usage (free tiers generous)
- **Rate Limits**: No sharing limits across users

---

## 🔧 Configuration

### Query Engine Settings

```javascript
{
    cooldownMinutes: 10,        // Min time between API calls per AWB
    batchSize: 10,              // Max AWBs per batch (carrier-specific)
    enableForceRefresh: true,   // Allow manual override
    skipDelivered: true,        // Don't query delivered items
    skipAfterDays: 30           // Stop after 30 days delivered
}
```

### Carrier Overrides

```javascript
{
    DHL: { cooldownMinutes: 15 },    // DHL stricter limits
    FedEx: { batchSize: 20 },        // FedEx larger batches
    UPS: { cooldownMinutes: 5 }      // UPS updates frequently
}
```

---

## 🐛 Known Issues

### CORS Restrictions
Carrier APIs don't allow direct browser requests. **Solution**: Deploy backend proxy (Node.js or Cloudflare Workers). See [API.md](docs/API.md#cors--proxy-setup).

### Rate Limits (Free Tiers)
- DHL: 250 requests/day
- FedEx: 1000 requests/day
- UPS: 500 requests/day

**Solution**: Smart query engine batches calls and caches results.

---

## 📝 Development Guidelines

This is a **utility project** separate from the games:
1. Read `/CLAUDE.md` for architecture guidance
2. Update `INFO.md` when adding features
3. Test on mobile Safari before committing
4. Can be used independently or integrated with arcade

---

## 📄 License

See root LICENSE file.

---

## 🙏 Credits

- **DHL Express API**: https://developer.dhl.com
- **FedEx Track API**: https://developer.fedex.com
- **UPS Tracking API**: https://developer.ups.com
- **SheetJS (xlsx.js)**: https://sheetjs.com (for Excel export)
- **UI Patterns**: Adapted from Founding & Forging games
