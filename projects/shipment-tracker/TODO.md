# Shipment Tracker - TODO List

**Last Updated:** 2026-01-23

---

## 🚀 Priority 1: Core Functionality (v1.1)

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

## 🎨 Priority 2: UX Improvements (v1.2)

### UI Enhancements
- [ ] Add loading spinner for API calls
- [ ] Show progress indicator when adding multiple trackings
- [ ] Add skeleton loaders for table rows
- [ ] Implement toast stacking (multiple toasts)
- [ ] Add carrier logos/icons instead of text
- [ ] Dark mode toggle (currently auto-detected)

### Detail Panel
- [ ] Add "Refresh" button per shipment
- [ ] Show API rate limit status
- [ ] Display estimated delivery time countdown
- [ ] Add map view for tracking locations (Google Maps API)
- [ ] Show package weight/dimensions if available

### Table Features
- [ ] Sortable columns (click header to sort)
- [ ] Column visibility toggle (show/hide columns)
- [ ] Bulk actions (select multiple, delete/export)
- [ ] Inline editing for notes/labels
- [ ] Add custom labels/tags to shipments

---

## 📊 Priority 3: Analytics & Insights (v1.3)

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

## 🔔 Priority 4: Notifications (v1.4)

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

## ☁️ Priority 5: Cloud Sync (v2.0)

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

## 🔧 Priority 6: Developer Experience

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

## 📦 Priority 7: Import/Export Features

### Import
- [ ] CSV import with column mapping
- [ ] JSON import with validation
- [ ] Bulk add from clipboard (paste AWB list)
- [ ] Import from email (parse tracking emails)
- [ ] Import from Amazon orders page (browser extension)

### Export
- [ ] Excel export with charts (SheetJS)
- [ ] PDF export with formatting
- [ ] Print-friendly view
- [ ] Export to Google Sheets API
- [ ] Schedule automatic backups

---

## 🎯 Priority 8: Advanced Features (v2.1+)

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

### Medium Priority
- [ ] Table doesn't show loading state during API calls
- [ ] No validation for duplicate AWB entries
- [ ] Settings panel doesn't scroll on mobile
- [ ] Toast notifications can overlap

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
- [ ] Test on mobile browsers
- [ ] Test with large datasets (1000+ trackings)
- [ ] Load testing (concurrent API calls)
- [ ] Accessibility testing (WCAG AA)

---

## 📈 Performance Optimization

- [ ] Lazy load API adapters (only load needed carriers)
- [ ] Virtualize table rows (react-window or similar)
- [ ] Cache API responses in Service Worker
- [ ] Image optimization for carrier logos
- [ ] Code splitting for large features
- [ ] IndexedDB query optimization

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

### v1.1 (Next Release)
- Additional carriers (OnTrac, LaserShip, Amazon Logistics)
- Query engine implementation
- Force refresh implementation

### v1.2 (UX Release)
- UI enhancements
- Loading states
- Carrier logos
- Sortable tables

### v1.3 (Analytics Release)
- Dashboard with charts
- Performance metrics
- Reports

### v1.4 (Notifications Release)
- Push notifications
- Email notifications
- Webhooks

### v2.0 (Cloud Release)
- Firebase/Supabase integration
- Multi-device sync
- User accounts

---

*This TODO list is a living document and will be updated as features are completed or priorities change.*

**Current Version:** v1.0.0
**Contributors:** Wayne Fong (wayneef84), Claude Sonnet 4.5
