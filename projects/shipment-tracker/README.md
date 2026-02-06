# Shipment Tracker
**Last Updated:** 2026-02-05
**Parent Project:** F.O.N.G.

**A browser-based multi-carrier shipment tracking application with smart API rate limiting and offline-first storage.**

## Project Summary
A specialized utility for tracking packages across multiple carriers (DHL, FedEx, UPS). It features a local-first architecture, smart rate limiting to conserve API quotas, and a responsive dashboard UI.

## Data Schema (LocalDB)
Data is stored using the **NegenDB** generic engine (IndexedDB adapter) in the following collections:

### `trackings`
Primary record for each shipment.
```javascript
{
  trackingId: "AWB_CARRIER", // Composite Key
  awb: "123456789",
  carrier: "DHL",
  status: "Delivered",
  deliverySignal: "DELIVERED", // Normalized status (IN_TRANSIT, EXCEPTION, etc.)
  lastChecked: "ISO_DATE",
  lastUpdated: "ISO_DATE",
  rawPayloadId: 123 // Reference to raw_payloads
}
```

### `raw_payloads`
Stores the full JSON response from the carrier API for debugging and re-normalization.
```javascript
{
  id: 123, // Auto-increment
  awb: "123456789",
  carrier: "DHL",
  timestamp: "ISO_DATE",
  data: { ... } // Full carrier JSON
}
```

### `settings`
Key-value storage for user preferences and API keys.

## Changelog
*   **v2.0.0 (2026-02-05)**: Migrated to generic `NegenDB` engine with fallback support. Rebranded to F.O.N.G.
*   **v1.5.0**: Added Dark Mode support.
*   **v1.0.0**: Initial release with IDB v4 schema.

## Future Plans
*   **Cloud Sync**: Optional adapter to sync data to Firebase/Supabase.
*   **Push Notifications**: Browser notifications when status changes to 'Delivered'.
*   **Email Parsing**: Drag-and-drop email support to auto-extract AWBs.

---
*See `docs/` for detailed architectural references.*
