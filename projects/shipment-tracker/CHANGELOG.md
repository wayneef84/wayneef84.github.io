# Shipment Tracker - Changelog

**Project:** Shipment Tracker
**Author:** Wayne Fong (wayneef84)
**Development Assistant:** Claude Code by Anthropic
**Location:** `/projects/shipment-tracker/`

---

## Project History

### Origins (2026-01-22)

**Initial Concept**
The Shipment Tracker project was conceived as a utility tool to aggregate shipment tracking data from multiple carriers (DHL, FedEx, UPS) with smart API rate limiting and offline-first storage. Unlike the entertainment-focused games in `/games/`, this project serves a practical business/productivity need.

**Design Philosophy**
- **BYOK (Bring Your Own Key)**: Users provide their own API keys for privacy and cost control
- **Offline-First**: IndexedDB storage allows full functionality without constant internet connection
- **Smart Querying**: Intelligent rate limiting prevents wasting API calls on delivered items or recently-checked shipments
- **Data Preservation**: Raw API payloads stored alongside normalized data for debugging and audit trails
- **Future-Proof**: Adapter pattern allows seamless migration from IndexedDB to Firebase/Supabase

---

## Version History

### v1.0.0-alpha (2026-01-22) - Initial Development

**Phase 1: Planning & Documentation (Completed)**
- Created comprehensive architecture documentation (4,196 lines across 5 docs)
- Designed IndexedDB schema with 3 object stores (`trackings`, `raw_payloads`, `settings`)
- Documented carrier API integration patterns (DHL, FedEx, UPS)
- Defined normalized data schema with delivery signal buckets
- Specified export/import functionality (JSON, CSV, Excel)

**Phase 2: IndexedDB Storage Layer (Completed)**
- Implemented `db.js` - IndexedDB adapter with full CRUD operations
  - `StorageAdapter` abstract base class for future Firebase migration
  - `IndexedDBAdapter` with 12 public methods
  - 5 indexes for fast queries (carrier, delivered, lastChecked, etc.)
  - Raw payload storage with auto-pruning
  - Settings storage for API keys and config
- Created `db-test.js` - Comprehensive test suite
  - 11 automated tests covering all adapter functionality
  - Test runner with results summary
  - Auto-cleanup for fresh test runs
- Built `test.html` - Interactive test page with live console output
- Wrote `DB_USAGE.md` - Complete usage guide with examples

**Phase 3: Project Organization (Completed)**
- Migrated from `/games/` to `/projects/` to distinguish utility from entertainment
- Updated all documentation to reflect new location
- Updated root `CLAUDE.md` to document project categories
- Created comprehensive `LICENSE` file with:
  - MIT License for code
  - Third-party API terms compliance requirements
  - Privacy notice
  - Credits and acknowledgments

**Phase 4: User Interface (In Progress)**
- Created `index.html` - Main application UI
  - Mobile-first responsive layout
  - Settings panel for API key management
  - Export panel with format selection
  - Add tracking form with carrier selection
  - Statistics dashboard
  - Filter bar for searching/filtering
  - Tracking table with event timeline
  - Detail panel for individual shipment view
  - Footer with credits and legal links

**Phase 5: Styling (Pending)**
- `css/style.css` - Layout, responsive design, mobile optimization
- `css/theme.css` - Colors, branding, visual polish

**Phase 6: Core Functionality (Pending)**
- Query engine with smart batching
- Carrier API adapters (DHL, FedEx, UPS)
- Data normalization layer
- Export/import module

---

## Development Milestones

### ✅ Completed
- [x] Architecture design
- [x] Documentation (ARCHITECTURE.md, API.md, DATA_SCHEMA.md, EXPORT.md, DB_USAGE.md)
- [x] IndexedDB adapter implementation
- [x] Test suite with 11 automated tests
- [x] Project migration to `/projects/` folder
- [x] LICENSE file with API compliance terms
- [x] Main UI HTML structure

### 🚧 In Progress
- [ ] CSS styling (mobile-first layout)
- [ ] Theme styling (colors, branding)

### 📋 Planned (v1.0.0)
- [ ] Query engine implementation
- [ ] DHL API adapter + normalizer
- [ ] FedEx API adapter + normalizer (OAuth 2.0)
- [ ] UPS API adapter + normalizer
- [ ] Export module (JSON, CSV, Excel)
- [ ] Import from CSV/JSON
- [ ] End-to-end testing with real API keys
- [ ] Mobile Safari testing
- [ ] Documentation updates

### 🔮 Future (v1.1.0+)
- [ ] Firebase cloud sync adapter
- [ ] Multi-device synchronization
- [ ] Push notifications for delivered shipments
- [ ] Webhooks support (carrier callbacks)
- [ ] Advanced filtering (date range, custom queries)
- [ ] Bulk operations (batch add, batch delete)
- [ ] Progressive Web App (PWA) manifest
- [ ] Offline mode indicator
- [ ] Data import/export automation
- [ ] Analytics dashboard

---

## Technical Decisions

### Why IndexedDB over localStorage?
- **Capacity**: 50MB+ vs 5-10MB
- **Structured Data**: Built-in indexing for fast queries
- **Async API**: Non-blocking operations
- **Future-Proof**: Easy migration to cloud databases

### Why Store Raw Payloads?
- **Debugging**: Compare normalized vs raw data
- **Re-normalization**: Improve logic without re-querying APIs
- **Audit Trail**: Prove what carrier returned at specific time
- **Carrier-Specific Features**: Preserve unique fields not in normalized schema

### Why Delivery Signal Buckets?
- **Consistency**: DHL/FedEx/UPS use different status codes
- **Cross-Carrier Filtering**: "Show all out-for-delivery" works universally
- **Terminal Detection**: Auto-stop querying delivered items

### Why Adapter Pattern?
- **Migration Path**: Seamlessly switch from IndexedDB to Firebase
- **Testability**: Mock adapters for unit testing
- **Flexibility**: Support multiple storage backends simultaneously

### Why BYOK (Bring Your Own Key)?
- **Privacy**: User controls their data, no centralized API keys
- **Cost**: User pays for their own usage (free tiers are generous)
- **Rate Limits**: No sharing limits across users
- **Compliance**: User responsible for carrier API terms

---

## Contributors

**Primary Author:**
- Wayne Fong (wayneef84) - https://github.com/wayneef84

**Development Assistant:**
- Claude Code by Anthropic - AI-assisted development tool
- https://claude.ai/code

**Special Thanks:**
- Fong Family Arcade games for UI pattern inspiration
- SheetJS community for Excel export capabilities
- DHL, FedEx, UPS for public API access

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

Users must comply with third-party carrier API terms:
- DHL Express API: https://developer.dhl.com/legal
- FedEx Track API: https://developer.fedex.com/terms
- UPS Tracking API: https://www.ups.com/upsdeveloperkit

---

## Project Links

- **GitHub**: https://github.com/wayneef84/fong-family-arcade
- **Documentation**: `/projects/shipment-tracker/docs/`
- **Test Page**: `/projects/shipment-tracker/test.html`
- **License**: `/projects/shipment-tracker/LICENSE`

---

*Last Updated: 2026-01-22*
*Version: 1.0.0-alpha*
*Status: In Development*
