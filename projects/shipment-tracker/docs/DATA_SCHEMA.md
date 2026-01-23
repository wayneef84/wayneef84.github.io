# Data Schema & Normalization

**Version:** 1.0.0
**Last Updated:** 2026-01-22

---

## Table of Contents
1. [Normalized Tracking Record](#normalized-tracking-record)
2. [Raw Payload Examples](#raw-payload-examples)
3. [Normalization Logic](#normalization-logic)
4. [Delivery Signal Mapping](#delivery-signal-mapping)
5. [Field Validation Rules](#field-validation-rules)

---

## Normalized Tracking Record

This is the **standard format** stored in IndexedDB `trackings` store, regardless of carrier.

### Full Schema

```typescript
interface TrackingRecord {
    // PRIMARY KEY
    awb: string;                    // Air Waybill Number (unique identifier)
                                    // Examples: 'DHL1234567890', 'FX987654321', '1Z999AA10123456789'

    // CORE METADATA
    carrier: 'DHL' | 'FedEx' | 'UPS';
    dateShipped: string;            // ISO date (YYYY-MM-DD), e.g., '2026-01-20'

    // STATUS FIELDS
    status: string;                 // Human-readable status text from carrier
                                    // Examples: 'In transit', 'Delivered', 'Out for delivery'

    deliverySignal: DeliverySignal; // Normalized status bucket (see below)
    delivered: boolean;             // Terminal state flag (true if DELIVERY/FAILED/RETURNED)

    // TIMESTAMPS
    lastChecked: string;            // ISO timestamp when WE last queried API
                                    // Example: '2026-01-22T10:30:00Z'

    lastUpdated: string;            // ISO timestamp of last carrier update
                                    // Example: '2026-01-22T09:15:00Z'

    // LOCATION DATA
    origin: Address;                // Shipping origin
    destination: Address;           // Shipping destination

    // EVENT HISTORY
    events: TrackingEvent[];        // Chronological tracking events (oldest first)

    // DELIVERY INFO
    estimatedDelivery: string | null;  // ISO date (YYYY-MM-DD) or null if unknown
                                       // Example: '2026-01-23'

    // USER METADATA
    note: string;                   // User-added notes (free text)
    tags: string[];                 // User-added tags for categorization
                                    // Examples: ['urgent', 'client-order', 'personal']

    // RAW PAYLOAD REFERENCE
    rawPayloadId: number | null;    // Foreign key to raw_payloads.id (latest API response)
}
```

### DeliverySignal Enum

```typescript
type DeliverySignal =
    | 'UNKNOWN'             // No tracking info or invalid AWB
    | 'PICKUP'              // Awaiting pickup or label created
    | 'IN_TRANSIT'          // In transit between facilities
    | 'EXCEPTION'           // Delay, customs hold, or other issue
    | 'OUT_FOR_DELIVERY'    // Out for delivery (final mile)
    | 'DELIVERY'            // Successfully delivered ✅ (TERMINAL)
    | 'FAILED'              // Delivery failed ❌ (TERMINAL)
    | 'RETURNED';           // Returned to sender 🔙 (TERMINAL)
```

### Address Interface

```typescript
interface Address {
    city: string | null;        // City name, e.g., 'Los Angeles'
    state: string | null;       // State/province code, e.g., 'CA'
    country: string | null;     // ISO country code, e.g., 'US'
    postalCode: string | null;  // Postal/ZIP code, e.g., '90001'
}
```

### TrackingEvent Interface

```typescript
interface TrackingEvent {
    timestamp: string;          // ISO timestamp, e.g., '2026-01-21T14:30:00Z'
    location: string;           // Human-readable location, e.g., 'Anchorage, AK, US'
    description: string;        // Event description, e.g., 'Arrived at facility'
    code: string;               // Carrier-specific status code, e.g., 'IT', 'transit', 'I'
}
```

---

## Example Normalized Record

```javascript
{
    // Primary key
    awb: 'DHL1234567890',

    // Metadata
    carrier: 'DHL',
    dateShipped: '2026-01-20',

    // Status
    status: 'In transit',
    deliverySignal: 'IN_TRANSIT',
    delivered: false,

    // Timestamps
    lastChecked: '2026-01-22T10:30:00Z',
    lastUpdated: '2026-01-22T09:15:00Z',

    // Locations
    origin: {
        city: 'Hong Kong',
        state: null,
        country: 'HK',
        postalCode: null
    },
    destination: {
        city: 'Los Angeles',
        state: 'CA',
        country: 'US',
        postalCode: '90001'
    },

    // Event history
    events: [
        {
            timestamp: '2026-01-20T08:00:00Z',
            location: 'Hong Kong, HK',
            description: 'Shipment picked up',
            code: 'PU'
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

    // Delivery info
    estimatedDelivery: '2026-01-23',

    // User fields
    note: 'Client order - priority delivery',
    tags: ['urgent', 'client-order'],

    // Raw payload reference
    rawPayloadId: 42
}
```

---

## Raw Payload Examples

### DHL Raw Payload

```javascript
{
    id: 1,
    awb: 'DHL1234567890',
    carrier: 'DHL',
    timestamp: '2026-01-22T10:30:00Z',
    apiVersion: 'v2',
    httpStatus: 200,
    error: null,
    payload: {
        shipments: [
            {
                id: 'DHL1234567890',
                service: 'express',
                origin: {
                    address: {
                        addressLocality: 'Hong Kong',
                        countryCode: 'HK'
                    }
                },
                destination: {
                    address: {
                        addressLocality: 'Los Angeles',
                        postalCode: '90001',
                        addressCountry: 'US'
                    }
                },
                status: {
                    timestamp: '2026-01-22T09:15:00Z',
                    location: {
                        address: {
                            addressLocality: 'Los Angeles, CA'
                        }
                    },
                    statusCode: 'transit',
                    status: 'In transit',
                    description: 'Arrived at facility'
                },
                estimatedTimeOfDelivery: '2026-01-23T18:00:00Z',
                events: [
                    {
                        timestamp: '2026-01-20T08:00:00Z',
                        location: {
                            address: { addressLocality: 'Hong Kong' }
                        },
                        description: 'Shipment picked up',
                        statusCode: 'picked-up'
                    }
                ]
            }
        ]
    }
}
```

### FedEx Raw Payload

```javascript
{
    id: 2,
    awb: 'FX987654321',
    carrier: 'FedEx',
    timestamp: '2026-01-22T10:35:00Z',
    apiVersion: 'v1',
    httpStatus: 200,
    error: null,
    payload: {
        output: {
            completeTrackResults: [
                {
                    trackingNumber: 'FX987654321',
                    latestStatusDetail: {
                        statusByLocale: 'In transit',
                        statusCode: 'IT',
                        scanLocation: {
                            city: 'LOS ANGELES',
                            stateOrProvinceCode: 'CA',
                            countryCode: 'US'
                        }
                    },
                    dateAndTimes: [
                        {
                            type: 'ESTIMATED_DELIVERY',
                            dateTime: '2026-01-23T18:00:00Z'
                        },
                        {
                            type: 'SHIP_DATE',
                            dateTime: '2026-01-20T08:00:00Z'
                        }
                    ],
                    originLocation: {
                        city: 'HONG KONG',
                        countryCode: 'HK'
                    },
                    destinationLocation: {
                        city: 'LOS ANGELES',
                        stateOrProvinceCode: 'CA',
                        countryCode: 'US'
                    },
                    scanEvents: [
                        {
                            date: '2026-01-20T08:00:00Z',
                            eventType: 'PU',
                            eventDescription: 'Picked up',
                            scanLocation: {
                                city: 'HONG KONG',
                                countryCode: 'HK'
                            }
                        }
                    ]
                }
            ]
        }
    }
}
```

### UPS Raw Payload

```javascript
{
    id: 3,
    awb: '1Z999AA10123456789',
    carrier: 'UPS',
    timestamp: '2026-01-22T10:40:00Z',
    apiVersion: 'v1',
    httpStatus: 200,
    error: null,
    payload: {
        trackResponse: {
            shipment: [
                {
                    inquiryNumber: '1Z999AA10123456789',
                    package: [
                        {
                            trackingNumber: '1Z999AA10123456789',
                            deliveryDate: [
                                {
                                    type: 'DEL',
                                    date: '20260123'
                                }
                            ],
                            currentStatus: {
                                statusCode: 'I',
                                description: 'In Transit',
                                statusDate: '20260122',
                                statusTime: '091500'
                            },
                            activity: [
                                {
                                    location: {
                                        address: {
                                            city: 'HONG KONG',
                                            countryCode: 'HK'
                                        }
                                    },
                                    status: {
                                        statusCode: 'P',
                                        description: 'Pickup'
                                    },
                                    date: '20260120',
                                    time: '080000'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
}
```

---

## Normalization Logic

### DHL → Standard Format

```javascript
function normalizeDHL(rawPayload) {
    const shipment = rawPayload.payload.shipments[0];

    return {
        awb: shipment.id,
        carrier: 'DHL',
        dateShipped: extractDateShipped(shipment.events),
        status: shipment.status.status,
        deliverySignal: mapDHLStatus(shipment.status.statusCode),
        delivered: isTerminal(mapDHLStatus(shipment.status.statusCode)),
        lastChecked: new Date().toISOString(),
        lastUpdated: shipment.status.timestamp,
        origin: {
            city: shipment.origin.address.addressLocality || null,
            state: shipment.origin.address.addressRegion || null,
            country: shipment.origin.address.countryCode || null,
            postalCode: shipment.origin.address.postalCode || null
        },
        destination: {
            city: shipment.destination.address.addressLocality || null,
            state: shipment.destination.address.addressRegion || null,
            country: shipment.destination.address.addressCountry || null,
            postalCode: shipment.destination.address.postalCode || null
        },
        events: shipment.events.map(e => ({
            timestamp: e.timestamp,
            location: e.location.address.addressLocality || 'Unknown',
            description: e.description,
            code: e.statusCode
        })),
        estimatedDelivery: shipment.estimatedTimeOfDelivery
            ? shipment.estimatedTimeOfDelivery.split('T')[0]
            : null,
        note: '',
        tags: [],
        rawPayloadId: rawPayload.id
    };
}

function extractDateShipped(events) {
    const pickupEvent = events.find(e => e.statusCode === 'picked-up');
    return pickupEvent
        ? pickupEvent.timestamp.split('T')[0]
        : events[0]?.timestamp.split('T')[0] || null;
}

function mapDHLStatus(statusCode) {
    const map = {
        'pre-transit': 'PICKUP',
        'picked-up': 'PICKUP',
        'transit': 'IN_TRANSIT',
        'delivery': 'OUT_FOR_DELIVERY',
        'delivered': 'DELIVERY',
        'exception': 'EXCEPTION',
        'failure': 'FAILED',
        'returned': 'RETURNED'
    };
    return map[statusCode] || 'UNKNOWN';
}
```

### FedEx → Standard Format

```javascript
function normalizeFedEx(rawPayload) {
    const track = rawPayload.payload.output.completeTrackResults[0];

    return {
        awb: track.trackingNumber,
        carrier: 'FedEx',
        dateShipped: extractFedExDate(track.dateAndTimes, 'SHIP_DATE'),
        status: track.latestStatusDetail.statusByLocale,
        deliverySignal: mapFedExStatus(track.latestStatusDetail.statusCode),
        delivered: isTerminal(mapFedExStatus(track.latestStatusDetail.statusCode)),
        lastChecked: new Date().toISOString(),
        lastUpdated: track.scanEvents[track.scanEvents.length - 1]?.date,
        origin: {
            city: track.originLocation.city || null,
            state: track.originLocation.stateOrProvinceCode || null,
            country: track.originLocation.countryCode || null,
            postalCode: track.originLocation.postalCode || null
        },
        destination: {
            city: track.destinationLocation.city || null,
            state: track.destinationLocation.stateOrProvinceCode || null,
            country: track.destinationLocation.countryCode || null,
            postalCode: track.destinationLocation.postalCode || null
        },
        events: track.scanEvents.map(e => ({
            timestamp: e.date,
            location: formatFedExLocation(e.scanLocation),
            description: e.eventDescription,
            code: e.eventType
        })),
        estimatedDelivery: extractFedExDate(track.dateAndTimes, 'ESTIMATED_DELIVERY'),
        note: '',
        tags: [],
        rawPayloadId: rawPayload.id
    };
}

function extractFedExDate(dateAndTimes, type) {
    const found = dateAndTimes.find(d => d.type === type);
    return found ? found.dateTime.split('T')[0] : null;
}

function formatFedExLocation(location) {
    const parts = [location.city, location.stateOrProvinceCode, location.countryCode]
        .filter(Boolean);
    return parts.join(', ');
}

function mapFedExStatus(statusCode) {
    const map = {
        'PU': 'PICKUP',
        'IT': 'IN_TRANSIT',
        'OD': 'OUT_FOR_DELIVERY',
        'DL': 'DELIVERY',
        'EX': 'EXCEPTION',
        'DF': 'FAILED',
        'RS': 'RETURNED'
    };
    return map[statusCode] || 'UNKNOWN';
}
```

### UPS → Standard Format

```javascript
function normalizeUPS(rawPayload) {
    const shipment = rawPayload.payload.trackResponse.shipment[0];
    const pkg = shipment.package[0];

    return {
        awb: pkg.trackingNumber,
        carrier: 'UPS',
        dateShipped: formatUPSDate(pkg.activity[0]?.date),
        status: pkg.currentStatus.description,
        deliverySignal: mapUPSStatus(pkg.currentStatus.statusCode),
        delivered: isTerminal(mapUPSStatus(pkg.currentStatus.statusCode)),
        lastChecked: new Date().toISOString(),
        lastUpdated: formatUPSTimestamp(
            pkg.currentStatus.statusDate,
            pkg.currentStatus.statusTime
        ),
        origin: normalizeUPSAddress(pkg.activity[0]?.location?.address),
        destination: normalizeUPSAddress(
            pkg.activity[pkg.activity.length - 1]?.location?.address
        ),
        events: pkg.activity.map(a => ({
            timestamp: formatUPSTimestamp(a.date, a.time),
            location: formatUPSLocation(a.location?.address),
            description: a.status.description,
            code: a.status.statusCode
        })),
        estimatedDelivery: extractUPSDeliveryDate(pkg.deliveryDate),
        note: '',
        tags: [],
        rawPayloadId: rawPayload.id
    };
}

function formatUPSDate(dateStr) {
    // 20260122 → 2026-01-22
    if (!dateStr) return null;
    return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
}

function formatUPSTimestamp(date, time) {
    // date=20260122, time=091500 → 2026-01-22T09:15:00Z
    const d = formatUPSDate(date);
    const t = `${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4,6)}`;
    return `${d}T${t}Z`;
}

function normalizeUPSAddress(address) {
    if (!address) return { city: null, state: null, country: null, postalCode: null };
    return {
        city: address.city || null,
        state: address.stateProvince || null,
        country: address.countryCode || null,
        postalCode: address.postalCode || null
    };
}

function formatUPSLocation(address) {
    if (!address) return 'Unknown';
    const parts = [address.city, address.stateProvince, address.countryCode]
        .filter(Boolean);
    return parts.join(', ');
}

function extractUPSDeliveryDate(deliveryDate) {
    const del = deliveryDate?.find(d => d.type === 'DEL');
    return del ? formatUPSDate(del.date) : null;
}

function mapUPSStatus(statusCode) {
    const map = {
        'M': 'PICKUP',
        'P': 'PICKUP',
        'I': 'IN_TRANSIT',
        'O': 'OUT_FOR_DELIVERY',
        'D': 'DELIVERY',
        'X': 'EXCEPTION',
        'F': 'FAILED',
        'R': 'RETURNED'
    };
    return map[statusCode] || 'UNKNOWN';
}
```

---

## Delivery Signal Mapping

### Unified Signal Mapping Table

| Delivery Signal | DHL Codes | FedEx Codes | UPS Codes | Terminal? |
|----------------|-----------|-------------|-----------|-----------|
| `UNKNOWN` | N/A | N/A | N/A | No |
| `PICKUP` | `pre-transit`, `picked-up` | `PU` | `M`, `P` | No |
| `IN_TRANSIT` | `transit` | `IT` | `I` | No |
| `EXCEPTION` | `exception` | `EX` | `X` | No |
| `OUT_FOR_DELIVERY` | `delivery` | `OD` | `O` | No |
| `DELIVERY` | `delivered` | `DL` | `D` | **Yes** ✅ |
| `FAILED` | `failure` | `DF` | `F` | **Yes** ❌ |
| `RETURNED` | `returned` | `RS` | `R` | **Yes** 🔙 |

### Terminal State Detection

```javascript
const TERMINAL_SIGNALS = ['DELIVERY', 'FAILED', 'RETURNED'];

function isTerminal(signal) {
    return TERMINAL_SIGNALS.includes(signal);
}

// Usage in normalization
function normalizeDHL(rawPayload) {
    const signal = mapDHLStatus(shipment.status.statusCode);

    return {
        // ... other fields
        deliverySignal: signal,
        delivered: isTerminal(signal) // Auto-flag terminal states
    };
}
```

---

## Field Validation Rules

### AWB Format Validation

```javascript
const AWB_PATTERNS = {
    DHL: /^[0-9]{10,11}$/,                  // 10-11 digits
    FedEx: /^[0-9]{12,14}$/,                // 12-14 digits
    UPS: /^1Z[0-9A-Z]{16}$/                 // 1Z + 16 alphanumeric
};

function validateAWB(awb, carrier) {
    const pattern = AWB_PATTERNS[carrier];
    if (!pattern) return false;
    return pattern.test(awb);
}

// Usage
if (!validateAWB('DHL1234567890', 'DHL')) {
    throw new Error('Invalid DHL tracking number format');
}
```

### Date Validation

```javascript
function validateISODate(dateStr) {
    // YYYY-MM-DD format
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(dateStr)) return false;

    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

function validateISOTimestamp(timestamp) {
    // ISO 8601 format
    const date = new Date(timestamp);
    return !isNaN(date.getTime());
}
```

### Carrier Validation

```javascript
const SUPPORTED_CARRIERS = ['DHL', 'FedEx', 'UPS'];

function validateCarrier(carrier) {
    return SUPPORTED_CARRIERS.includes(carrier);
}
```

### Address Validation

```javascript
function validateAddress(address) {
    // At least one field must be non-null
    return address.city !== null
        || address.state !== null
        || address.country !== null
        || address.postalCode !== null;
}
```

### Event Validation

```javascript
function validateEvent(event) {
    return validateISOTimestamp(event.timestamp)
        && typeof event.location === 'string'
        && typeof event.description === 'string'
        && typeof event.code === 'string';
}
```

### Complete Record Validation

```javascript
function validateTrackingRecord(record) {
    const errors = [];

    // Required fields
    if (!record.awb) errors.push('Missing AWB');
    if (!validateCarrier(record.carrier)) errors.push('Invalid carrier');
    if (!validateISODate(record.dateShipped)) errors.push('Invalid dateShipped');
    if (!validateISOTimestamp(record.lastChecked)) errors.push('Invalid lastChecked');
    if (!validateISOTimestamp(record.lastUpdated)) errors.push('Invalid lastUpdated');

    // Delivery signal
    if (!Object.values(DELIVERY_SIGNALS).includes(record.deliverySignal)) {
        errors.push('Invalid deliverySignal');
    }

    // Delivered flag consistency
    if (isTerminal(record.deliverySignal) !== record.delivered) {
        errors.push('Inconsistent delivered flag');
    }

    // Addresses
    if (!validateAddress(record.origin)) errors.push('Invalid origin address');
    if (!validateAddress(record.destination)) errors.push('Invalid destination address');

    // Events
    if (!Array.isArray(record.events)) {
        errors.push('Events must be array');
    } else {
        record.events.forEach((e, i) => {
            if (!validateEvent(e)) errors.push(`Invalid event at index ${i}`);
        });
    }

    // Optional fields
    if (record.estimatedDelivery !== null && !validateISODate(record.estimatedDelivery)) {
        errors.push('Invalid estimatedDelivery');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Usage
const validation = validateTrackingRecord(record);
if (!validation.valid) {
    console.error('Validation failed:', validation.errors);
}
```

---

## Data Migration Examples

### v1.0 → v1.1 (Add tags field)

```javascript
// IndexedDB upgrade handler
db.onupgradeneeded = function(event) {
    if (event.oldVersion < 2) {
        const tx = event.target.transaction;
        const store = tx.objectStore('trackings');

        // Iterate all records
        store.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
                const record = cursor.value;

                // Add missing tags field
                if (!record.tags) {
                    record.tags = [];
                    cursor.update(record);
                }

                cursor.continue();
            }
        };
    }
};
```

### Backfill deliverySignal from status

```javascript
function backfillDeliverySignals(db) {
    const tx = db.transaction('trackings', 'readwrite');
    const store = tx.objectStore('trackings');

    store.openCursor().onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            const record = cursor.value;

            // Derive signal from carrier status code
            if (!record.deliverySignal || record.deliverySignal === 'UNKNOWN') {
                // Extract status code from events
                const latestEvent = record.events[record.events.length - 1];

                let signal = 'UNKNOWN';
                if (record.carrier === 'DHL') {
                    signal = mapDHLStatus(latestEvent.code);
                } else if (record.carrier === 'FedEx') {
                    signal = mapFedExStatus(latestEvent.code);
                } else if (record.carrier === 'UPS') {
                    signal = mapUPSStatus(latestEvent.code);
                }

                record.deliverySignal = signal;
                record.delivered = isTerminal(signal);
                cursor.update(record);
            }

            cursor.continue();
        }
    };
}
```

---

## Performance Optimization

### Limit Event History

To prevent records from growing unbounded:

```javascript
const MAX_EVENTS = 50; // Keep last 50 events

function normalizeEvents(events) {
    // Sort chronologically (oldest first)
    const sorted = events.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Keep only last MAX_EVENTS
    return sorted.slice(-MAX_EVENTS);
}
```

### Prune Old Raw Payloads

Keep only last N payloads per AWB:

```javascript
const MAX_PAYLOADS_PER_AWB = 5;

async function pruneOldPayloads(db, awb) {
    const tx = db.transaction('raw_payloads', 'readwrite');
    const store = tx.objectStore('raw_payloads');
    const index = store.index('awb');

    const payloads = [];
    const request = index.openCursor(IDBKeyRange.only(awb));

    request.onsuccess = function(e) {
        const cursor = e.target.result;
        if (cursor) {
            payloads.push({
                id: cursor.value.id,
                timestamp: cursor.value.timestamp
            });
            cursor.continue();
        } else {
            // Sort by timestamp (newest first)
            payloads.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            // Delete old ones (keep only MAX_PAYLOADS_PER_AWB)
            const toDelete = payloads.slice(MAX_PAYLOADS_PER_AWB);
            toDelete.forEach(p => store.delete(p.id));
        }
    };
}
```

---

## Summary

This data schema provides:

✅ **Consistency**: All carriers normalized to same format
✅ **Flexibility**: Raw payloads preserved for re-processing
✅ **Validation**: Strict rules prevent corrupt data
✅ **Performance**: Pruning strategies prevent bloat
✅ **Extensibility**: Easy to add new carriers (implement normalizer)
✅ **Migration Path**: Version upgrades with data backfill

**Next Step:** Implement normalizers in `js/api/dhl.js`, `js/api/fedex.js`, `js/api/ups.js`
