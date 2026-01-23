# Shipment Tracker Architecture

**Version:** 1.0.0
**Last Updated:** 2026-01-22

---

## Table of Contents
1. [IndexedDB Schema](#indexeddb-schema)
2. [Firebase Migration Path](#firebase-migration-path)
3. [Storage Adapter Pattern](#storage-adapter-pattern)
4. [Smart Query Engine](#smart-query-engine)
5. [Data Normalization](#data-normalization)
6. [Delivery Signal Buckets](#delivery-signal-buckets)

---

## IndexedDB Schema

### Database Configuration

```javascript
const DB_CONFIG = {
    name: 'ShipmentTrackerDB',
    version: 1,
    stores: {
        trackings: {
            keyPath: 'awb',
            autoIncrement: false,
            indexes: [
                { name: 'carrier', keyPath: 'carrier', unique: false },
                { name: 'delivered', keyPath: 'delivered', unique: false },
                { name: 'lastChecked', keyPath: 'lastChecked', unique: false },
                { name: 'dateShipped', keyPath: 'dateShipped', unique: false },
                { name: 'deliverySignal', keyPath: 'deliverySignal', unique: false }
            ]
        },
        raw_payloads: {
            keyPath: 'id',
            autoIncrement: true,
            indexes: [
                { name: 'awb', keyPath: 'awb', unique: false },
                { name: 'carrier', keyPath: 'carrier', unique: false },
                { name: 'timestamp', keyPath: 'timestamp', unique: false }
            ]
        },
        settings: {
            keyPath: 'key',
            autoIncrement: false,
            indexes: []
        }
    }
};
```

---

## Store: `trackings`

**Purpose:** Normalized tracking data for quick queries and UI rendering

### Record Structure

```javascript
{
    // Primary Key
    awb: 'DHL1234567890',                    // Air Waybill Number (unique)

    // Core Fields
    carrier: 'DHL',                          // 'DHL' | 'FedEx' | 'UPS'
    dateShipped: '2026-01-20',               // ISO date (YYYY-MM-DD)

    // Status & Signals
    status: 'in_transit',                    // Current status text
    deliverySignal: 'DELIVERY',              // Bucket: see section below
    delivered: false,                        // Boolean terminal flag

    // Tracking Metadata
    lastChecked: '2026-01-22T10:30:00Z',     // ISO timestamp (last API call)
    lastUpdated: '2026-01-22T09:15:00Z',     // ISO timestamp (last carrier update)

    // Normalized Details
    origin: {
        city: 'Hong Kong',
        country: 'HK',
        postalCode: null
    },
    destination: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'US',
        postalCode: '90001'
    },

    // Event History (Normalized)
    events: [
        {
            timestamp: '2026-01-20T08:00:00Z',
            location: 'Hong Kong, HK',
            description: 'Shipment picked up',
            code: 'PU'                        // Carrier-specific code
        },
        {
            timestamp: '2026-01-21T14:30:00Z',
            location: 'Anchorage, AK, US',
            description: 'In transit',
            code: 'IT'
        },
        {
            timestamp: '2026-01-22T09:15:00Z',
            location: 'Los Angeles, CA, US',
            description: 'Arrived at facility',
            code: 'AR'
        }
    ],

    // Estimated Delivery
    estimatedDelivery: '2026-01-23',         // ISO date (null if unknown)

    // User Metadata
    note: '',                                 // User-added notes
    tags: [],                                 // User-added tags ['urgent', 'client-order']

    // Raw Payload Reference
    rawPayloadId: 42                          // FK to raw_payloads.id (latest)
}
```

### Indexes Explained

| Index | Purpose | Query Example |
|-------|---------|---------------|
| `carrier` | Filter by carrier | "Show all DHL shipments" |
| `delivered` | Skip delivered items | "Show only active shipments" |
| `lastChecked` | Find stale data | "Which AWBs need refresh?" |
| `dateShipped` | Sort by age | "Show oldest shipments first" |
| `deliverySignal` | Filter by delivery stage | "Show all out-for-delivery" |

---

## Store: `raw_payloads`

**Purpose:** Preserve raw API responses for debugging, auditing, and future re-normalization

### Record Structure

```javascript
{
    // Primary Key (Auto-Increment)
    id: 42,

    // Foreign Key
    awb: 'DHL1234567890',

    // Metadata
    carrier: 'DHL',
    timestamp: '2026-01-22T10:30:00Z',       // When API call was made

    // Raw Response (Preserved as-is)
    payload: {
        // Full DHL API response object (varies by carrier)
        // Example: DHL Express Tracking API v2 response
        shipments: [
            {
                id: 'DHL1234567890',
                service: 'express',
                origin: { address: { ... } },
                destination: { address: { ... } },
                status: { ... },
                events: [ ... ]
            }
        ]
    },

    // API Call Metadata
    apiVersion: 'v2',                        // Carrier API version
    httpStatus: 200,                         // Response status code
    error: null                              // Error message if failed
}
```

### Why Store Raw Payloads?

1. **Debugging**: Compare normalized data vs raw response
2. **Re-normalization**: If normalization logic improves, re-process old data
3. **Audit Trail**: Prove what carrier API returned at specific time
4. **Future Features**: Extract fields not currently normalized
5. **Carrier-Specific Data**: Preserve fields unique to DHL/FedEx/UPS

---

## Store: `settings`

**Purpose:** App configuration (query engine, UI preferences)

### Record Structure

```javascript
{
    // Primary Key
    key: 'queryEngine',

    // Value (varies by key)
    value: {
        cooldownMinutes: 10,
        batchSize: 10,
        enableForceRefresh: true,
        skipDelivered: true
    }
}

// Other settings
{
    key: 'ui',
    value: {
        theme: 'light',
        sortBy: 'lastUpdated',
        sortOrder: 'desc',
        showDelivered: false
    }
}

{
    key: 'apiKeys',
    value: {
        DHL: 'encrypted_key_1',
        FedEx: 'encrypted_key_2',
        UPS: 'encrypted_key_3'
    }
}
```

---

## Firebase Migration Path

### Goal
Seamlessly transition from IndexedDB to Firebase Firestore with minimal code changes.

### Adapter Pattern

```javascript
// Abstract interface (both adapters implement this)
class StorageAdapter {
    async getTracking(awb) {}
    async saveTracking(tracking) {}
    async getAllTrackings(filters) {}
    async deleteTracking(awb) {}
    async getRawPayload(id) {}
    async saveRawPayload(payload) {}
}

// IndexedDB implementation
class IndexedDBAdapter extends StorageAdapter {
    constructor(dbName) {
        this.db = null;
        this.dbName = dbName;
    }

    async init() {
        // Open IndexedDB connection
    }

    async getTracking(awb) {
        const tx = this.db.transaction('trackings', 'readonly');
        const store = tx.objectStore('trackings');
        return await store.get(awb);
    }

    async saveTracking(tracking) {
        const tx = this.db.transaction('trackings', 'readwrite');
        const store = tx.objectStore('trackings');
        return await store.put(tracking);
    }

    // ... other methods
}

// Firebase implementation (future)
class FirebaseAdapter extends StorageAdapter {
    constructor(firebaseConfig) {
        this.db = firebase.firestore();
    }

    async getTracking(awb) {
        const doc = await this.db.collection('trackings').doc(awb).get();
        return doc.exists ? doc.data() : null;
    }

    async saveTracking(tracking) {
        return await this.db.collection('trackings').doc(tracking.awb).set(tracking);
    }

    // ... other methods
}

// App uses adapter interface (never touches IndexedDB/Firebase directly)
class ShipmentTracker {
    constructor(storageAdapter) {
        this.storage = storageAdapter;
    }

    async loadTracking(awb) {
        return await this.storage.getTracking(awb);
    }

    async saveTracking(tracking) {
        return await this.storage.saveTracking(tracking);
    }
}

// Usage (switch adapters easily)
const idbAdapter = new IndexedDBAdapter('ShipmentTrackerDB');
await idbAdapter.init();
const app = new ShipmentTracker(idbAdapter);

// Future: Switch to Firebase
const fbAdapter = new FirebaseAdapter(firebaseConfig);
const app = new ShipmentTracker(fbAdapter);
```

### Firebase Schema Mapping

#### IndexedDB → Firestore

```
IndexedDB Store: trackings
    ↓
Firestore Collection: trackings
    Document ID: {awb}
    Fields: {carrier, dateShipped, status, ...}

IndexedDB Store: raw_payloads
    ↓
Firestore Collection: raw_payloads
    Document ID: auto-generated
    Fields: {awb, carrier, timestamp, payload, ...}

IndexedDB Store: settings
    ↓
Firestore Collection: users/{userId}/settings
    Document ID: {key}
    Fields: {value}
```

#### Firestore Data Model (Future)

```javascript
// Collection: trackings
{
    awb: 'DHL1234567890',          // Document ID (also stored as field)
    carrier: 'DHL',
    dateShipped: Timestamp,         // Firestore Timestamp type
    status: 'in_transit',
    deliverySignal: 'DELIVERY',
    delivered: false,
    lastChecked: Timestamp,
    lastUpdated: Timestamp,
    origin: { city: 'Hong Kong', ... },
    destination: { city: 'Los Angeles', ... },
    events: [ ... ],
    estimatedDelivery: Timestamp,
    note: '',
    tags: [],
    rawPayloadId: 'payloads/abc123',  // Document reference
    userId: 'user123',                // Multi-user support
    createdAt: Timestamp,
    updatedAt: Timestamp
}
```

### Migration Strategy

#### Phase 1: IndexedDB Only (Current)
- All data stored locally
- No network dependency
- Fast, offline-first

#### Phase 2: Dual Storage (Transition)
- Write to both IndexedDB and Firebase
- Read from IndexedDB (fast cache)
- Background sync to Firebase
- Conflict resolution: last-write-wins

#### Phase 3: Firebase Primary (Optional)
- IndexedDB becomes cache
- Firebase is source of truth
- Multi-device sync enabled
- Offline support via Firebase offline persistence

### Sync Logic (Phase 2)

```javascript
class DualStorageAdapter extends StorageAdapter {
    constructor(localAdapter, remoteAdapter) {
        this.local = localAdapter;   // IndexedDB
        this.remote = remoteAdapter; // Firebase
    }

    async saveTracking(tracking) {
        // Write locally first (fast)
        await this.local.saveTracking(tracking);

        // Sync to cloud (background, non-blocking)
        this.remote.saveTracking(tracking).catch(err => {
            console.warn('Cloud sync failed:', err);
            // Queue for retry
        });
    }

    async getTracking(awb) {
        // Read from local cache first
        const local = await this.local.getTracking(awb);
        if (local) return local;

        // Fallback to cloud
        const remote = await this.remote.getTracking(awb);
        if (remote) {
            // Cache locally
            await this.local.saveTracking(remote);
        }
        return remote;
    }
}
```

---

## Storage Adapter Pattern

### Interface Definition

```javascript
/**
 * Abstract storage adapter interface
 * Implementations: IndexedDBAdapter, FirebaseAdapter, DualStorageAdapter
 */
class StorageAdapter {
    /**
     * Initialize storage connection
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error('Not implemented');
    }

    /**
     * Get single tracking record
     * @param {string} awb - Air waybill number
     * @returns {Promise<Object|null>}
     */
    async getTracking(awb) {
        throw new Error('Not implemented');
    }

    /**
     * Save tracking record (insert or update)
     * @param {Object} tracking - Tracking record
     * @returns {Promise<void>}
     */
    async saveTracking(tracking) {
        throw new Error('Not implemented');
    }

    /**
     * Get all trackings with optional filters
     * @param {Object} filters - { carrier, delivered, dateShipped, ... }
     * @returns {Promise<Array>}
     */
    async getAllTrackings(filters = {}) {
        throw new Error('Not implemented');
    }

    /**
     * Delete tracking record
     * @param {string} awb - Air waybill number
     * @returns {Promise<void>}
     */
    async deleteTracking(awb) {
        throw new Error('Not implemented');
    }

    /**
     * Get raw payload by ID
     * @param {number|string} id - Payload ID
     * @returns {Promise<Object|null>}
     */
    async getRawPayload(id) {
        throw new Error('Not implemented');
    }

    /**
     * Save raw API payload
     * @param {Object} payload - Raw payload record
     * @returns {Promise<number|string>} - Payload ID
     */
    async saveRawPayload(payload) {
        throw new Error('Not implemented');
    }

    /**
     * Get setting by key
     * @param {string} key - Setting key
     * @returns {Promise<any>}
     */
    async getSetting(key) {
        throw new Error('Not implemented');
    }

    /**
     * Save setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<void>}
     */
    async saveSetting(key, value) {
        throw new Error('Not implemented');
    }
}
```

---

## Smart Query Engine

### Architecture

```
User Request (Check AWB)
    ↓
Query Engine
    ├─→ Load from IndexedDB
    ├─→ Check Filters
    │   ├─→ Is delivered? → Skip API call
    │   ├─→ Last checked < cooldown? → Skip API call
    │   └─→ Needs update? → Add to batch queue
    ↓
Batch Queue (Group by Carrier)
    ├─→ DHL: [AWB1, AWB2, AWB3]
    ├─→ FedEx: [AWB4, AWB5]
    └─→ UPS: [AWB6]
    ↓
Carrier API Calls (Parallel)
    ↓
Raw Payload Storage (IndexedDB)
    ↓
Normalization
    ↓
Save to IndexedDB
    ↓
UI Update
```

### Query Engine Configuration (Externalized)

```javascript
// Stored in settings store, configurable via UI
const QUERY_CONFIG = {
    // Rate Limiting
    cooldownMinutes: 10,            // Min time between API calls (per AWB)
    cooldownVariance: 0.1,          // Random variance (±10%) to avoid thundering herd

    // Batch Settings
    batchSize: 10,                  // Max AWBs per batch API call
    batchDelayMs: 500,              // Wait time to accumulate batch

    // Skip Rules
    skipDelivered: true,            // Don't query delivered items
    skipAfterDays: 30,              // Stop querying after 30 days delivered

    // Force Refresh
    enableForceRefresh: true,       // Allow manual override

    // Error Handling
    maxRetries: 3,                  // Retry failed API calls
    retryDelayMs: 2000,             // Delay between retries

    // Carrier-Specific Overrides
    carrierOverrides: {
        DHL: { cooldownMinutes: 15 },    // DHL has stricter rate limits
        FedEx: { batchSize: 20 },        // FedEx allows larger batches
        UPS: { cooldownMinutes: 5 }      // UPS updates more frequently
    }
};
```

### Query Engine Implementation (Pseudocode)

```javascript
class QueryEngine {
    constructor(storage, config) {
        this.storage = storage;
        this.config = config;
        this.batchQueue = { DHL: [], FedEx: [], UPS: [] };
        this.batchTimer = null;
    }

    /**
     * Check if AWB needs API update
     * @param {Object} tracking - Existing tracking record
     * @param {boolean} force - Override all filters
     * @returns {boolean}
     */
    shouldQuery(tracking, force = false) {
        if (force) return true;

        // Skip delivered items
        if (this.config.skipDelivered && tracking.delivered) {
            const daysSinceDelivery = this.getDaysSince(tracking.lastUpdated);
            if (daysSinceDelivery > this.config.skipAfterDays) {
                return false;
            }
        }

        // Check cooldown period
        const cooldown = this.getCooldown(tracking.carrier);
        const timeSince = Date.now() - new Date(tracking.lastChecked).getTime();
        if (timeSince < cooldown) {
            return false;
        }

        return true;
    }

    /**
     * Get cooldown in milliseconds (with variance)
     * @param {string} carrier - Carrier name
     * @returns {number}
     */
    getCooldown(carrier) {
        const override = this.config.carrierOverrides[carrier];
        const minutes = override?.cooldownMinutes || this.config.cooldownMinutes;
        const variance = this.config.cooldownVariance;

        // Add random variance (±10%) to avoid simultaneous queries
        const varianceFactor = 1 + (Math.random() * 2 - 1) * variance;
        return minutes * 60 * 1000 * varianceFactor;
    }

    /**
     * Add AWB to batch queue
     * @param {string} awb - Air waybill number
     * @param {string} carrier - Carrier name
     */
    queueQuery(awb, carrier) {
        this.batchQueue[carrier].push(awb);

        // Start batch timer (debounce)
        clearTimeout(this.batchTimer);
        this.batchTimer = setTimeout(() => {
            this.processBatchQueue();
        }, this.config.batchDelayMs);
    }

    /**
     * Process all queued AWBs (batch API calls)
     */
    async processBatchQueue() {
        const carriers = ['DHL', 'FedEx', 'UPS'];

        // Parallel API calls (one per carrier)
        const promises = carriers.map(async carrier => {
            const awbs = this.batchQueue[carrier];
            if (awbs.length === 0) return;

            // Split into batches if needed
            const batchSize = this.config.carrierOverrides[carrier]?.batchSize
                || this.config.batchSize;

            for (let i = 0; i < awbs.length; i += batchSize) {
                const batch = awbs.slice(i, i + batchSize);
                await this.queryCarrierAPI(carrier, batch);
            }

            // Clear queue
            this.batchQueue[carrier] = [];
        });

        await Promise.all(promises);
    }

    /**
     * Query carrier API with retry logic
     * @param {string} carrier - Carrier name
     * @param {Array<string>} awbs - AWB list
     */
    async queryCarrierAPI(carrier, awbs) {
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const adapter = this.getCarrierAdapter(carrier);
                const response = await adapter.batchQuery(awbs);

                // Save raw payload
                for (const result of response.results) {
                    const payloadId = await this.storage.saveRawPayload({
                        awb: result.awb,
                        carrier: carrier,
                        timestamp: new Date().toISOString(),
                        payload: result.raw,
                        apiVersion: adapter.version,
                        httpStatus: 200,
                        error: null
                    });

                    // Normalize and save
                    const normalized = this.normalize(result.raw, carrier);
                    normalized.rawPayloadId = payloadId;
                    await this.storage.saveTracking(normalized);
                }

                return; // Success, exit retry loop

            } catch (err) {
                console.error(`API call failed (attempt ${attempt}):`, err);
                if (attempt < this.config.maxRetries) {
                    await this.sleep(this.config.retryDelayMs);
                } else {
                    // Max retries exceeded, log error
                    console.error('Max retries exceeded for carrier:', carrier);
                }
            }
        }
    }
}
```

---

## Data Normalization

### Goal
Convert carrier-specific API responses into a standard format for consistent UI rendering and querying.

### Normalization Flow

```
Raw Payload (DHL Format)
    ↓
DHL Normalizer (dhl.js)
    ↓
Standard Format
    ↓
IndexedDB: trackings store

Raw Payload (FedEx Format)
    ↓
FedEx Normalizer (fedex.js)
    ↓
Standard Format
    ↓
IndexedDB: trackings store
```

### Standard Format (Normalized Tracking Record)

See [Store: trackings](#store-trackings) section above.

### Normalizer Interface

```javascript
/**
 * Abstract normalizer (implemented per carrier)
 */
class CarrierNormalizer {
    /**
     * Normalize raw API payload to standard format
     * @param {Object} payload - Raw carrier API response
     * @returns {Object} - Normalized tracking record
     */
    normalize(payload) {
        throw new Error('Not implemented');
    }

    /**
     * Extract delivery signal from payload
     * @param {Object} payload - Raw carrier API response
     * @returns {string} - Delivery signal bucket
     */
    extractDeliverySignal(payload) {
        throw new Error('Not implemented');
    }
}
```

---

## Delivery Signal Buckets

### Problem
Each carrier uses different status codes and terminology:
- DHL: "delivered", "transit", "picked-up", "exception"
- FedEx: "DL" (delivered), "IT" (in transit), "PU" (picked up)
- UPS: "D" (delivered), "I" (in transit), "P" (pickup)

**Solution:** Normalize into standardized "delivery signal buckets" for consistent filtering and UI.

### Signal Buckets

| Bucket | Description | Terminal? | UI Color | Typical Carrier Codes |
|--------|-------------|-----------|----------|----------------------|
| `UNKNOWN` | No tracking info | No | Gray | N/A, invalid AWB |
| `PICKUP` | Awaiting pickup | No | Blue | PU, PS, pickup-scheduled |
| `IN_TRANSIT` | In transit | No | Yellow | IT, transit, in-transit |
| `EXCEPTION` | Delay/issue | No | Orange | EX, exception, delay |
| `OUT_FOR_DELIVERY` | Out for delivery | No | Green | OFD, out-for-delivery |
| `DELIVERY` | Delivered | **Yes** | Green (bold) | DL, delivered, signed |
| `FAILED` | Delivery failed | **Yes** | Red | DF, delivery-failed, RTS |
| `RETURNED` | Returned to sender | **Yes** | Red | RTS, returned |

### Signal Mapping Rules

```javascript
// DHL status → Delivery signal
const DHL_SIGNAL_MAP = {
    'transit': 'IN_TRANSIT',
    'delivered': 'DELIVERY',
    'picked-up': 'PICKUP',
    'exception': 'EXCEPTION',
    'delivery': 'OUT_FOR_DELIVERY',
    'failure': 'FAILED',
    'returned': 'RETURNED'
};

// FedEx status code → Delivery signal
const FEDEX_SIGNAL_MAP = {
    'IT': 'IN_TRANSIT',
    'DL': 'DELIVERY',
    'PU': 'PICKUP',
    'EX': 'EXCEPTION',
    'OD': 'OUT_FOR_DELIVERY',
    'DF': 'FAILED',
    'RS': 'RETURNED'
};

// UPS status code → Delivery signal
const UPS_SIGNAL_MAP = {
    'I': 'IN_TRANSIT',
    'D': 'DELIVERY',
    'P': 'PICKUP',
    'X': 'EXCEPTION',
    'O': 'OUT_FOR_DELIVERY',
    'F': 'FAILED',
    'R': 'RETURNED'
};
```

### Terminal Signals

**Terminal signals** indicate the shipment has reached a final state (no more updates expected).

```javascript
const TERMINAL_SIGNALS = ['DELIVERY', 'FAILED', 'RETURNED'];

function isTerminal(signal) {
    return TERMINAL_SIGNALS.includes(signal);
}

// Usage in query engine
if (isTerminal(tracking.deliverySignal)) {
    // Stop querying API (mark as delivered: true)
    tracking.delivered = true;
}
```

### UI Filtering by Signal

```javascript
// Example: Filter UI by delivery stage
function filterBySignal(trackings, signal) {
    return trackings.filter(t => t.deliverySignal === signal);
}

// Show only active shipments (exclude terminal states)
const active = trackings.filter(t => !isTerminal(t.deliverySignal));

// Show only delivered
const delivered = filterBySignal(trackings, 'DELIVERY');

// Show problems (exceptions + failed)
const problems = trackings.filter(t =>
    t.deliverySignal === 'EXCEPTION' || t.deliverySignal === 'FAILED'
);
```

---

## Performance Considerations

### IndexedDB Best Practices

1. **Use Transactions Efficiently**
   - Batch writes in single transaction
   - Use `readonly` for reads (faster)
   - Avoid long-running transactions (block other operations)

2. **Index Strategy**
   - Index frequently queried fields (carrier, delivered)
   - Don't over-index (slows writes)
   - Use compound indexes for common multi-field queries

3. **Data Size**
   - Limit event history (e.g., last 50 events)
   - Prune old raw payloads (keep last N per AWB)
   - Estimated size: ~5KB per tracking record

4. **Upgrade Path**
   - Use versioning for schema changes
   - Migrate data in `onupgradeneeded` callback
   - Preserve old data during migration

### Firebase Best Practices (Future)

1. **Security Rules**
   - User can only read/write their own trackings
   - Validate data structure on write
   - Prevent unauthorized access

2. **Query Optimization**
   - Index fields used in `where()` clauses
   - Use pagination for large result sets
   - Enable offline persistence (cache locally)

3. **Cost Management**
   - Batch writes (WriteBatch API)
   - Use `onSnapshot` sparingly (real-time listener cost)
   - Cache reads in IndexedDB

---

## Migration Checklist (IndexedDB → Firebase)

### Before Migration
- [ ] Export all data to JSON (backup)
- [ ] Test Firebase adapter with sample data
- [ ] Configure Firebase project (Firestore database)
- [ ] Set up security rules
- [ ] Test conflict resolution

### During Migration
- [ ] Deploy dual storage adapter
- [ ] Background sync existing data to Firebase
- [ ] Monitor sync errors (retry queue)
- [ ] Verify data integrity (compare counts)

### After Migration
- [ ] Switch to Firebase primary adapter
- [ ] Enable multi-device sync
- [ ] Test offline mode
- [ ] Monitor Firebase usage (quota, cost)

---

## Summary

This architecture provides:

✅ **Offline-First**: IndexedDB for local storage, fast queries
✅ **Cloud-Ready**: Adapter pattern allows seamless Firebase migration
✅ **Smart Queries**: Rate limiting, batch calls, terminal state detection
✅ **Data Preservation**: Raw payloads stored for auditing
✅ **Normalization**: Consistent data model across carriers
✅ **Delivery Signals**: Standardized status buckets for filtering
✅ **Scalability**: Can handle 1000s of tracking records efficiently
✅ **Extensibility**: Easy to add new carriers (implement normalizer)

Next steps: Implement IndexedDB adapter, build query engine, integrate carrier APIs.
