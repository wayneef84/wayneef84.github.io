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
### v1.2.0 (2026-01-26) - Data Management & Professional Polish

**🎯 Focus: Data Portability, Legal Compliance, and "Quality of Life" UX**


### v1.2.0 (2026-01-25) - Data Management & UX Improvements

**🎯 Focus: Import/Export Overhaul + Form UX Improvements**

#### 📁 Data Management Modal (NEW)
- **Unified Import/Export Interface** - New "Data Management" button in header (📁)
  - Replaces separate Import/Export buttons with single modal
  - Clean, organized sections for Import, Export, and Templates
  - Descriptive labels for each action

- **Import Options:**
  - **Import (Add)** - Append new records to existing data
  - **Import (Replace)** - Clear all data first, then import (with confirmation)
  - Supports both CSV and JSON formats

- **Export Options:**
  - **Export CSV** - Filter-aware export (exports only currently visible/filtered shipments)
  - **Export JSON** - Full backup with metadata
  - Export description updates dynamically based on active filter

- **Templates:**
  - **Download Template** - CSV template with instructional header rows
  - Comment lines (`#`) are skipped by parser
  - Example rows show proper format

#### ⌨️ Form UX Improvements
- **Enter Key Support** - Press Enter in any form field to submit
  - Works in AWB input, carrier dropdown, and date field
  - No need to click "Add" button manually

- **Form Auto-Reset** - Form clears after successful submission
  - AWB input, carrier dropdown, and date field all reset
  - Ready for next entry immediately

#### 🎨 Visual Improvements
- **Icon Color Differentiation** - Import (green tint) vs Export (blue tint)
  - Uses CSS `hue-rotate` filter for emoji color shifting
  - Better visual distinction between actions

#### 🐛 Bug Fixes
- **Mock Data Refresh Fix** - Mock carrier shipments no longer trigger stale refresh
  - `refreshAllTrackings()` now skips carriers named "Mock" or "mock"
  - Prevents unnecessary API calls for test data

#### 📝 Documentation
- **NEW: LLM_GUIDE.md** - Quick reference guide for AI assistants
  - ES5 pattern cheat sheet (DO vs DON'T examples)
  - File reference with one-line descriptions
  - Common task templates (copy-paste code patterns)
  - Current sprint tasks with implementation hints
  - Testing checklist

#### 🔧 Modified Files
- `index.html` - Added Data Management Modal, updated header buttons
- `css/style.css` - Added modal styles, icon color classes
- `js/app.js` - Data modal handlers, Enter key support, filter-aware export, mock data fix
- `ARCHITECTURE.md` - Added link to LLM_GUIDE.md
- `LLM_GUIDE.md` - NEW file for AI assistant guidance

---

### v1.1.0 (2026-01-23) - Mobile UX Overhaul

**🎯 Focus: Enhanced Mobile Experience + Multi-Carrier Support**

#### 🎨 Mobile UI Improvements
- **Mobile Bottom Bar** - Replaced FAB buttons with 2-row control bar
  - Row 1: Active | Delivered | Issues (stat filters with live counts)
  - Row 2: Total | Add | Filter (action buttons)
  - Click filters to show/hide shipments by status
  - Active state highlighting shows which filter is applied
  - Auto-updates counts as data changes
  - Safe area insets for notched devices

- **Full AWB Display on Mobile** - Removed AWB truncation
  - Mobile cards now show full tracking number (no `12...56789` truncation)
  - More readable and allows direct copy/paste
  - Duplicate detection still works (compares first 2 + last 5 chars)
  - Duplicate badge shows count when similar AWBs exist (e.g., "2x")

- **Carrier Website Links** - Click to track on carrier site
  - AWBs are now clickable links to official tracking pages
  - Desktop: Blue links in AWB table column
  - Mobile: Clickable AWB in card header + "Track on {Carrier}" button
  - Opens in new tab with secure `rel="noopener noreferrer"`
  - Supports DHL, FedEx, UPS with proper URL formats

#### 🚚 Multi-Carrier Support
- **FedEx API Adapter** (`js/api/fedex.js`)
  - Mock data generator for testing without API keys
  - OAuth 2.0 implementation (stubbed for future use)
  - Realistic event timeline generation
  - Test tracking numbers: `111111111111` (delivered), `222222222222` (in transit)
  - Configurable sandbox/production endpoints
  - Rate limiting: 1000 req/day, 5 req/sec

- **UPS API Adapter** (`js/api/ups.js`)
  - Mock data generator for testing without API keys
  - OAuth 2.0 implementation (stubbed for future use)
  - UPS-specific status codes and events
  - Test tracking numbers: `1Z999AA10123456780` (delivered), `1Z999AA10123456784` (in transit)
  - Configurable test/production endpoints
  - Rate limiting: 500 req/day, 2 req/sec

- **Test Data Documentation** (`TEST_DATA.md`)
  - Official DHL sandbox tracking numbers (6 test AWBs)
  - FedEx test tracking numbers with status scenarios
  - UPS test tracking numbers and API endpoints
  - Mock data format examples for each carrier

#### 🛠️ Developer Tools
- **Debug Menu** - Press `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac)
  - **Load Test Datasets:**
    - Mixed Scenarios (6 shipments - all carriers, various statuses)
    - DHL Test Numbers (6 official sandbox AWBs)
    - FedEx Test Numbers (3 test scenarios)
    - UPS Test Numbers (3 test scenarios)
  - **Quick Add Single Tracking:**
    - DHL: Active, Delivered
    - FedEx: In Transit, Exception
    - UPS: Out for Delivery, Delivered
  - **Actions:**
    - Refresh All Trackings (fetch latest data)
    - Clear All Data (with confirmation)
  - **Real-time Stats:**
    - Tracking count display
    - Estimated DB size (KB/MB)
  - Overlay modal with dark backdrop
  - Close via button, overlay click, or `Ctrl+Shift+D` again

#### 📝 Utility Enhancements
- **Carrier Tracking URL Generator** (`TrackingUtils.getCarrierTrackingURL()`)
  - Returns official carrier tracking page URLs
  - Properly encodes AWB numbers
  - Handles DHL, FedEx, UPS with correct query parameters

#### 🐛 Bug Fixes
- Fixed duplicate AWB detection logic (now works with full AWB display)
- Improved mobile bottom bar spacing for safe areas
- Desktop stats container now hidden on mobile (bottom bar replaces it)
- Mobile cards container padding adjusted for bottom bar height (140px)

#### 📦 New Files
- `js/api/fedex.js` - FedEx Track API adapter
- `js/api/ups.js` - UPS Track API adapter
- `js/debug.js` - Debug menu module
- `TEST_DATA.md` - Test tracking numbers and mock data guide

#### 🔧 Modified Files
- `index.html` - Added debug menu HTML, mobile bottom bar, new script tags
- `css/style.css` - Added bottom bar styles, debug menu styles, removed FAB styles
- `js/utils.js` - Added `getCarrierTrackingURL()` function
- `js/app.js` - Bottom bar handlers, full AWB display, debug menu initialization
- `TODO.md` - Marked completed features (mobile cards, carrier adapters, debug menu)

---

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
- F.O.N.G. games for UI pattern inspiration
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

*Last Updated: 2026-01-25*
*Version: 1.2.0*
*Status: In Development*
