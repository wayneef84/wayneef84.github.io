# Shipment Tracker - TODO List

**Last Updated:** 2026-01-26

---

## ✅ Recently Completed

### Trade Compliance Document Linking (v1.2.0 - 2026-01-26)
- [x] **Document Manager module** - `js/document-manager.js`
  - Document type definitions with semantic emojis
  - Compliance status calculation (CI + PL = complete)
  - CRUD operations for documents on trackings

- [x] **Desktop Table - Compliance Column**
  - Shows ✅ if CI + PL present, ⚠️ if missing
  - Shows 🔋 if UN38.3 battery cert attached

- [x] **Detail Panel - Documents Section**
  - Collapsible section showing attached documents
  - Add/Remove document functionality
  - Launch button to open Google Drive links

- [x] **Import/Export Support**
  - CSV exports include `documents` column as JSON
  - JSON exports include full documents array
  - Imports merge documents (add missing, don't overwrite)

- [x] **Database Migration (v4)**
  - Non-breaking schema update
  - Existing trackings gain `documents` array when edited

---

## 🔥 PRIORITY 0: Critical Mobile UX Fixes (IMMEDIATE)

### Mobile Table Redesign (Critical)
- [x] ~~**Replace table with card-based layout on mobile**~~ (Fixed: 2026-01-23)
  - Each shipment = horizontal panel/card
  - Status icon on left (visual indicator: ✅ delivered, 🚚 in transit, ⚠️ exception, etc.)
  - **CHANGE:** AWB now shown in full (no truncation) - more readable
  - Tap to expand for full details
  - Full AWB shown when expanded
  - **NEW:** Mobile bottom bar with 2 rows (stat filters + actions)
  - **NEW:** Clickable AWBs link to carrier tracking websites

- [x] ~~**Duplicate AWB Detection**~~ (Fixed: 2026-01-23)
  - If similar AWBs exist (first 2 + last 5 chars match), show indicator (e.g., badge "2x")
  - Visual badge on card header
  - Works with full AWB display

- [ ] **Desktop: Keep table, improve detail panel**
  - Show detail panel side-by-side with table (split view)
  - Table on left (60%), details on right (40%)
  - Resize breakpoint: > 1024px = split view, < 1024px = full overlay

### Stats Dashboard Contrast Fix (Critical)
- [ ] **Improve text/background contrast on stats cards**
  - Ensure WCAG AA compliance (4.5:1 contrast ratio)
  - Test with various color schemes
  - Add border/shadow for better separation
  - Consider solid backgrounds instead of gradients

### Filter Bar Mobile Layout (Critical)
- [ ] **Fix search criteria alignment on mobile**
  - Stack filters vertically on small screens
  - Make dropdowns full-width
  - Increase touch target size (min 44x44px)
  - Add clear visual separation between filter groups
  - Consider collapsible filter section to save space

---

## 🚀 PRIORITY 1: Core Functionality (v1.1)

### Carrier Integration - Mock Adapters (Development)
- [x] ~~**FedEx** - Mock adapter with test data~~ (Added: 2026-01-23)
  - Mock data generator for testing without API keys
  - OAuth implementation stubbed for future use
  - Test tracking numbers documented in TEST_DATA.md
  - Realistic event timeline generation

- [x] ~~**UPS** - Mock adapter with test data~~ (Added: 2026-01-23)
  - Mock data generator for testing without API keys
  - OAuth implementation stubbed for future use
  - Test tracking numbers documented in TEST_DATA.md
  - UPS-specific status codes and events

### Carrier Integration - Additional Carriers
- [ ] **OnTrac** - Amazon's preferred carrier
  - API: https://www.ontrac.com/api/
  - Auto-detect pattern: 14-digit starting with 'C'
  - Add adapter: `js/api/ontrac.js`
  - Add to normalizer and utils

- [ ] **Amazon Logistics** (AMZN)
  - TBA tracking numbers (starts with 'TBA')
  - API research needed (may require scraping)
  - 15-character alphanumeric format

- [ ] **LaserShip** - East Coast carrier
  - API: https://www.lasership.com/developers
  - Auto-detect: 11-12 digits or 'L' prefix
  - Add adapter: `js/api/lasership.js`

- [ ] **Canada Post**
  - API: https://www.canadapost.ca/cpo/mc/business/productsservices/developers/services/tracking/default.jsf
  - 16-digit tracking number
  - Add adapter: `js/api/canadapost.js`

- [ ] **Purolator** (Canada)
  - API: https://www.purolator.com/en/shipping-services/api
  - 12-digit tracking number
  - Add adapter: `js/api/purolator.js`

- [ ] **Royal Mail** (UK)
  - API: https://www.royalmail.com/business/services/track-and-trace
  - 13-character format (2 letters + 9 digits + 2 letters)
  - Add adapter: `js/api/royalmail.js`

### Query Engine (Auto-Refresh System)
- [ ] Implement smart batching (group API calls by carrier)
- [ ] Auto-refresh based on cooldown settings
- [ ] Background worker for periodic checks
- [ ] Skip delivered shipments automatically
- [ ] Rate limit tracking per carrier
- [ ] Queue system for API calls
- [ ] Retry logic with exponential backoff

### Force Refresh
- [ ] Implement actual API call in `forceRefreshTracking()`
- [ ] Replace placeholder with real query
- [ ] Update lastChecked timestamp after refresh
- [ ] Show loading indicator during refresh

---

## 🎨 PRIORITY 2: Responsive Design System (v1.2)

### Mobile-First Card System
- [ ] Create `ShipmentCard` component
  - Compact horizontal layout
  - Status icon (colored, animated)
  - AWB truncation logic: `formatAWB(awb)` → `"1...23456"`
  - Expand/collapse animation
  - Swipe gestures (swipe left = delete, swipe right = refresh)

### Desktop Split View
- [ ] Implement responsive layout breakpoints
  - Mobile: < 768px (cards only)
  - Tablet: 768px - 1024px (table with overlay detail)
  - Desktop: > 1024px (split view: table + detail panel)
- [ ] Add resize handle between table and detail panel
- [ ] Persist layout preference in localStorage

### Status Icons & Visual Indicators
- [ ] Design status icon system
  - ✅ Delivered (green)
  - 🚚 In Transit (blue, animated)
  - 📦 Pickup (orange)
  - 🏠 Out for Delivery (purple, animated)
  - ⚠️ Exception (red, pulsing)
  - ❌ Failed (dark red)
- [ ] Add loading spinner for API calls
- [ ] Add skeleton loaders for cards/rows

### Accessibility & Contrast
- [ ] Run WCAG AA contrast checker on all components
- [ ] Ensure 4.5:1 contrast ratio for text
- [ ] Ensure 3:1 contrast ratio for UI components
- [ ] Add focus indicators for keyboard navigation
- [ ] Test with screen readers

---

## 📊 PRIORITY 3: UX Enhancements (v1.3)

### Table Features (Desktop)
- [ ] Sortable columns (click header to sort)
- [ ] Column visibility toggle (show/hide columns)
- [ ] Bulk actions (select multiple, delete/export)
- [ ] Inline editing for notes/labels
- [ ] Add custom labels/tags to shipments
- [ ] Virtual scrolling for large datasets (1000+ rows)

### Detail Panel Improvements
- [ ] Add "Refresh" button per shipment
- [ ] Show API rate limit status
- [ ] Display estimated delivery time countdown
- [ ] Add map view for tracking locations (Google Maps API)
- [ ] Show package weight/dimensions if available
- [ ] Add notes/comments section per shipment

### Search & Filters
- [ ] Smart search (search by AWB, origin, destination, carrier)
- [ ] Autocomplete suggestions
- [ ] Saved filter presets
- [ ] Quick filters (delivered today, in transit, exceptions)
- [ ] Date range picker for filtering

---

## 🔔 PRIORITY 4: Notifications & Alerts (v1.4)

### Push Notifications
- [ ] Request notification permission
- [ ] Push when shipment is delivered
- [ ] Push when shipment is out for delivery
- [ ] Push when shipment has exception/delay
- [ ] Configurable notification preferences

### Email Notifications
- [ ] SMTP configuration in settings
- [ ] Email on delivery
- [ ] Email on exception
- [ ] Daily summary email option

### Webhooks
- [ ] Webhook URL configuration
- [ ] POST to URL on status changes
- [ ] Retry logic for failed webhooks
- [ ] Webhook history/logs

---

## 📈 PRIORITY 5: Analytics & Insights (v1.5)

### Dashboard
- [ ] Delivery time analytics (average by carrier)
- [ ] On-time delivery percentage
- [ ] Carrier performance comparison
- [ ] Monthly/yearly shipment trends
- [ ] Cost tracking (if user enters shipping costs)
- [ ] Charts using Chart.js or similar

### Reports
- [ ] Generate PDF reports
- [ ] Weekly/monthly email summaries
- [ ] Export analytics to CSV/Excel

---

## ☁️ PRIORITY 6: Cloud Sync (v2.0)

### Firebase/Supabase Integration
- [ ] User authentication (Google, email/password)
- [ ] Sync trackings to cloud database
- [ ] Real-time sync across devices
- [ ] Conflict resolution strategy
- [ ] Offline-first with sync queue
- [ ] Shared tracking lists (family/team feature)

### API for Mobile Apps
- [ ] RESTful API endpoints
- [ ] JWT authentication
- [ ] Rate limiting
- [ ] API documentation
- [ ] SDK for React Native / Flutter

---

## 🔧 PRIORITY 7: Developer Experience

### Debug Tools
- [x] ~~**Debug Menu**~~ (Added: 2026-01-23)
  - Keyboard shortcut: Ctrl+Shift+D (Cmd+Shift+D on Mac)
  - Load predefined test datasets (Mixed, DHL, FedEx, UPS)
  - Quick-add single test trackings per carrier/status
  - Refresh all trackings
  - Clear all data with confirmation
  - Real-time stats display (count + DB size)
  - Overlay modal with dark backdrop

### Code Quality
- [ ] Add JSDoc comments to all functions
- [ ] Create unit tests (Jest or Mocha)
- [ ] Integration tests for API adapters
- [ ] E2E tests (Playwright or Cypress)
- [ ] Code coverage reports

### Build Tools
- [ ] Add bundler (Rollup or Webpack)
- [ ] Minification for production
- [ ] Source maps for debugging
- [ ] Environment variables (.env support)
- [ ] CI/CD pipeline (GitHub Actions)

### Documentation
- [ ] API adapter developer guide
- [ ] Contribution guidelines
- [ ] Architecture diagram
- [ ] Video tutorials
- [ ] FAQ page

---

## 📦 PRIORITY 8: Import/Export Features

### Import
- [x] ~~**CSV import with column mapping**~~ (Fixed: 2026-01-25 - Template with headers)
- [x] ~~**JSON import with validation**~~ (Fixed: 2026-01-25)
- [x] ~~**Import Template Download**~~ (Fixed: 2026-01-25 - With instructional comments)
- [x] ~~**Import (Replace All) option**~~ (Fixed: 2026-01-25 - Data Management Modal)
- [ ] Bulk add from clipboard (paste AWB list)
- [ ] Import from email (parse tracking emails)
- [ ] Import from Amazon orders page (browser extension)

### Export
- [x] ~~**Filter-Aware Export**~~ (Fixed: 2026-01-25 - Exports only visible/filtered items)
- [ ] Excel export with charts (SheetJS)
- [ ] PDF export with formatting
- [ ] Print-friendly view
- [ ] Export to Google Sheets API
- [ ] Schedule automatic backups

---

## 🎯 PRIORITY 9: Advanced Features (v2.1+)

### Smart Features
- [ ] AI-powered delivery time prediction
- [ ] Anomaly detection (delayed shipments)
- [ ] Smart grouping (by destination, sender, etc.)
- [ ] Suggested actions (e.g., "Contact carrier")

### Integrations
- [ ] Shopify integration (auto-import orders)
- [ ] WooCommerce integration
- [ ] Amazon Seller Central API
- [ ] eBay API
- [ ] Etsy API

### Browser Extension
- [ ] Chrome extension for quick add
- [ ] Firefox extension
- [ ] Context menu "Track this number"
- [ ] Auto-detect tracking numbers on web pages

---

## 🐛 Known Bugs / Issues

### High Priority
- [x] ~~Date showing "12/31/1969 4pm" for unchecked shipments~~ (Fixed: 130c53d)
- [x] ~~Force refresh button not working~~ (Fixed: 130c53d)
- [x] ~~Missing JSON payload viewer~~ (Fixed: 63bedad)
- [x] ~~No way to clear all data~~ (Fixed: 0dcbbbe)
- [x] ~~**Table is garbage on mobile**~~ (Fixed: 2026-01-23 - Mobile cards implemented)
- [ ] **Stats dashboard has poor contrast** (Partially fixed - mobile bottom bar replaces stats)
- [ ] **Filter bar layout broken on mobile** (Filter toggle in bottom bar)
- [ ] **Detail panel should be split view on desktop** (Priority 0)

### Medium Priority
- [ ] Table doesn't show loading state during API calls
- [ ] No validation for duplicate AWB entries
- [ ] Settings panel doesn't scroll on mobile
- [ ] Toast notifications can overlap
- [x] ~~No indication when AWBs are truncated and identical~~ (Fixed: 2026-01-23 - Badge shows duplicate count)

### Low Priority
- [ ] Export panel could use better styling
- [ ] Missing favicon
- [ ] No 404 page
- [ ] Footer links need updating

---

## 🔐 Security & Privacy

- [ ] Add Content Security Policy headers
- [ ] Implement rate limiting on client side
- [ ] Add option to encrypt API keys in IndexedDB
- [ ] Add 2FA for cloud sync accounts
- [ ] GDPR compliance features (data export, deletion)
- [ ] Privacy policy page
- [ ] Terms of service page

---

## 🌍 Internationalization (i18n)

- [ ] Add language selector
- [ ] English (default)
- [ ] Spanish
- [ ] French
- [ ] German
- [ ] Chinese (Simplified & Traditional)
- [ ] Japanese
- [ ] Portuguese

---

## 📱 Mobile Apps (Future)

- [ ] React Native app (iOS + Android)
- [ ] Flutter app (cross-platform)
- [ ] Push notifications via FCM
- [ ] Camera scan tracking numbers (OCR)
- [ ] Share tracking via deep links

---

## 🎓 Documentation Tasks

- [ ] Create ARCHITECTURE.md
- [ ] Create CONTRIBUTING.md
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Create video tutorials (YouTube)
- [ ] Write blog posts about features
- [ ] Create landing page (marketing site)

---

## 🧪 Testing Checklist

- [ ] Test all carriers with real tracking numbers
- [ ] Test offline functionality
- [ ] Test on Safari (ES5 compatibility)
- [ ] Test on mobile browsers (iOS Safari, Chrome Android)
- [ ] Test with large datasets (1000+ trackings)
- [ ] Load testing (concurrent API calls)
- [ ] Accessibility testing (WCAG AA)
- [ ] Contrast testing (all components)
- [ ] Touch target testing (44x44px minimum)

---

## 📈 Performance Optimization

- [ ] Lazy load API adapters (only load needed carriers)
- [ ] Virtualize table rows (react-window or similar)
- [ ] Cache API responses in Service Worker
- [ ] Image optimization for carrier logos
- [ ] Code splitting for large features
- [ ] IndexedDB query optimization
- [ ] Debounce search input
- [ ] Throttle scroll events

---

## 💡 Ideas / Nice-to-Have

- [ ] Gamification (badges for milestones)
- [ ] Social sharing (share tracking status)
- [ ] Public tracking pages (shareable links)
- [ ] QR code generation for tracking numbers
- [ ] Voice commands (Alexa/Google Home)
- [ ] Apple Shortcuts integration
- [ ] IFTTT integration
- [ ] Zapier integration

---

## 📋 Maintenance

- [ ] Update dependencies quarterly
- [ ] Review and update carrier APIs annually
- [ ] Monitor error logs
- [ ] User feedback system
- [ ] Bug bounty program
- [ ] Community forum or Discord

---

## 🚦 Release Plan

### v1.1 (Next Release - Critical UX)
**Focus: Mobile Experience Overhaul**
- Mobile card-based layout (replace table)
- AWB truncation with duplicate detection
- Stats dashboard contrast fixes
- Filter bar mobile layout fixes
- Desktop split view (table + detail panel)
- Status icons system
- Loading states and skeleton loaders

### v1.2 (Carrier Expansion)
- Additional carriers (OnTrac, LaserShip, Amazon Logistics)
- Query engine implementation
- Force refresh implementation
- Rate limiting per carrier

### v1.3 (UX Polish)
- Sortable tables
- Bulk actions
- Smart search
- Saved filter presets
- Map view for tracking

### v1.4 (Notifications)
- Push notifications
- Email notifications
- Webhooks

### v1.5 (Analytics)
- Dashboard with charts
- Performance metrics
- Reports

### v2.0 (Cloud Sync)
- Firebase/Supabase integration
- Multi-device sync
- User accounts
- Shared tracking lists

---

## 📝 Design Mockups Needed

### Mobile Card Layout
```
┌─────────────────────────────────────┐
│ 🚚 DHL   1...23456       ⌄          │  ← Collapsed
├─────────────────────────────────────┤
│ 🚚 DHL   1234567890      ⌃          │  ← Expanded
│ Status: In Transit                  │
│ Origin: Hong Kong → Dest: NYC       │
│ Est. Delivery: Jan 25, 2026         │
│ [Refresh] [Details] [Delete]        │
└─────────────────────────────────────┘
```

### Desktop Split View
```
┌──────────────────────────────────────────────────────┐
│  Table (60%)           │  Detail Panel (40%)         │
│ ┌──────────────────┐   │ ┌──────────────────────┐   │
│ │ AWB | Carrier    │   │ │ Shipment Details     │   │
│ │ 123 | DHL        │   │ │ ─────────────────── │   │
│ │ 456 | FedEx  ◄─────────│ AWB: 1234567890     │   │
│ │ 789 | UPS        │   │ │ Carrier: DHL        │   │
│ └──────────────────┘   │ │ Status: In Transit   │   │
│                        │ │ [Map] [Refresh]      │   │
│                        │ └──────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 🎨 Color System for Status Icons

```javascript
const STATUS_COLORS = {
    DELIVERED: '#10b981',        // Green
    IN_TRANSIT: '#3b82f6',       // Blue
    OUT_FOR_DELIVERY: '#8b5cf6', // Purple
    PICKUP: '#f59e0b',           // Orange
    EXCEPTION: '#ef4444',        // Red
    FAILED: '#991b1b'            // Dark Red
};
```

---

*This TODO list is a living document and will be updated as features are completed or priorities change.*

**Current Version:** v1.2.0
**Next Version:** v1.3.0 (Carrier Expansion)
**Contributors:** Wayne Fong (wayneef84), Claude Sonnet 4.5, Claude Opus 4.5
