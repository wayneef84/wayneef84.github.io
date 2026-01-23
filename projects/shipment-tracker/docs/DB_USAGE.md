# IndexedDB Adapter - Usage Guide

**Version:** 1.0.0
**File:** `js/db.js`

---

## Quick Start

### 1. Initialize Database

```javascript
// Create adapter instance
var db = new IndexedDBAdapter();

// Initialize (creates/opens database)
db.init().then(function() {
    console.log('Database ready!');
}).catch(function(err) {
    console.error('Failed to initialize:', err);
});

// Or with async/await
async function setup() {
    var db = new IndexedDBAdapter();
    await db.init();
    console.log('Database ready!');
}
```

### 2. Save Tracking Record

```javascript
var tracking = {
    awb: 'DHL1234567890',
    carrier: 'DHL',
    dateShipped: '2026-01-20',
    status: 'In transit',
    deliverySignal: 'IN_TRANSIT',
    delivered: false,
    lastChecked: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
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
    events: [
        {
            timestamp: '2026-01-20T08:00:00Z',
            location: 'Hong Kong, HK',
            description: 'Shipment picked up',
            code: 'PU'
        }
    ],
    estimatedDelivery: '2026-01-23',
    note: '',
    tags: [],
    rawPayloadId: null
};

db.saveTracking(tracking).then(function(awb) {
    console.log('Saved:', awb);
});
```

### 3. Get Tracking Record

```javascript
db.getTracking('DHL1234567890').then(function(tracking) {
    if (tracking) {
        console.log('Status:', tracking.status);
        console.log('Delivered:', tracking.delivered);
    } else {
        console.log('Not found');
    }
});
```

### 4. Get All Trackings

```javascript
// Get all
db.getAllTrackings().then(function(trackings) {
    console.log('Total:', trackings.length);
});

// Filter by carrier
db.getAllTrackings({ carrier: 'DHL' }).then(function(trackings) {
    console.log('DHL trackings:', trackings.length);
});

// Filter by delivered status
db.getAllTrackings({ delivered: false }).then(function(trackings) {
    console.log('Active shipments:', trackings.length);
});

// Filter by delivery signal
db.getAllTrackings({ deliverySignal: 'IN_TRANSIT' }).then(function(trackings) {
    console.log('In transit:', trackings.length);
});
```

---

## Common Use Cases

### Check for Stale Trackings (Need Refresh)

```javascript
// Find trackings that haven't been checked in 10+ minutes
var cooldown = 10 * 60 * 1000; // 10 minutes in ms

db.getStaleTrackings(cooldown).then(function(staleTrackings) {
    console.log('Need refresh:', staleTrackings.length);

    // Queue for API update
    staleTrackings.forEach(function(t) {
        console.log('- ' + t.awb + ' (last checked: ' + t.lastChecked + ')');
    });
});
```

### Save Raw API Payload

```javascript
var rawPayload = {
    awb: 'DHL1234567890',
    carrier: 'DHL',
    timestamp: new Date().toISOString(),
    apiVersion: 'v2',
    httpStatus: 200,
    error: null,
    payload: {
        // Full DHL API response
        shipments: [ /* ... */ ]
    }
};

db.saveRawPayload(rawPayload).then(function(payloadId) {
    console.log('Saved raw payload ID:', payloadId);

    // Link to tracking record
    tracking.rawPayloadId = payloadId;
    db.saveTracking(tracking);
});
```

### Prune Old Payloads

```javascript
// Keep only last 5 payloads per AWB
db.pruneOldPayloads('DHL1234567890', 5).then(function(deletedCount) {
    console.log('Deleted', deletedCount, 'old payloads');
});
```

### Save & Retrieve Settings

```javascript
// Save query engine config
db.saveSetting('queryEngine', {
    cooldownMinutes: 10,
    batchSize: 10,
    enableForceRefresh: true,
    skipDelivered: true
}).then(function() {
    console.log('Settings saved');
});

// Retrieve settings
db.getSetting('queryEngine').then(function(config) {
    console.log('Cooldown:', config.cooldownMinutes, 'minutes');
});

// Save API keys
db.saveSetting('apiKeys', {
    DHL: 'your_dhl_key',
    FedEx: 'your_fedex_key',
    UPS: 'your_ups_key'
});
```

### Get Database Statistics

```javascript
db.getStats().then(function(stats) {
    console.log('Total trackings:', stats.totalTrackings);
    console.log('Delivered:', stats.deliveredCount);
    console.log('Active:', stats.activeCount);
    console.log('DHL:', stats.carrierCounts.DHL);
    console.log('FedEx:', stats.carrierCounts.FedEx);
    console.log('UPS:', stats.carrierCounts.UPS);
    console.log('Raw payloads:', stats.totalRawPayloads);
});
```

### Delete Tracking

```javascript
db.deleteTracking('DHL1234567890').then(function() {
    console.log('Tracking deleted');
});
```

### Clear All Data (Reset)

```javascript
// WARNING: Deletes everything!
db.clearAll().then(function() {
    console.log('All data cleared');
});
```

---

## Integration with Query Engine

```javascript
// Example: Smart refresh logic
async function refreshTrackings(db, apiClient) {
    // Get trackings that need update
    var cooldown = 10 * 60 * 1000; // 10 minutes
    var staleTrackings = await db.getStaleTrackings(cooldown);

    if (staleTrackings.length === 0) {
        console.log('All trackings are fresh');
        return;
    }

    // Group by carrier
    var groups = { DHL: [], FedEx: [], UPS: [] };
    staleTrackings.forEach(function(t) {
        groups[t.carrier].push(t.awb);
    });

    // Batch API calls
    for (var carrier in groups) {
        var awbs = groups[carrier];
        if (awbs.length === 0) continue;

        console.log('Querying', carrier, 'for', awbs.length, 'AWBs');

        // Call carrier API (batch)
        var results = await apiClient.batchQuery(carrier, awbs);

        // Save results
        for (var i = 0; i < results.length; i++) {
            var result = results[i];

            // Save raw payload
            var payloadId = await db.saveRawPayload({
                awb: result.awb,
                carrier: carrier,
                timestamp: new Date().toISOString(),
                apiVersion: result.apiVersion,
                httpStatus: 200,
                error: null,
                payload: result.raw
            });

            // Normalize and save
            var normalized = normalizeCarrierResponse(result.raw, carrier);
            normalized.rawPayloadId = payloadId;
            normalized.lastChecked = new Date().toISOString();

            await db.saveTracking(normalized);
        }
    }

    console.log('Refresh complete!');
}
```

---

## Error Handling

```javascript
// Always use try/catch with async/await
async function safeOperation() {
    try {
        var tracking = await db.getTracking('DHL1234567890');
        console.log('Success:', tracking);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Or with promises
db.getTracking('DHL1234567890')
    .then(function(tracking) {
        console.log('Success:', tracking);
    })
    .catch(function(err) {
        console.error('Error:', err.message);
    });
```

---

## Advanced Queries

### Get Trackings by Date Range

```javascript
async function getTrackingsByDateRange(db, startDate, endDate) {
    var allTrackings = await db.getAllTrackings();

    return allTrackings.filter(function(t) {
        var dateShipped = new Date(t.dateShipped);
        return dateShipped >= new Date(startDate) &&
               dateShipped <= new Date(endDate);
    });
}

// Usage
var trackings = await getTrackingsByDateRange(
    db,
    '2026-01-01',
    '2026-01-31'
);
```

### Get Trackings with Tags

```javascript
async function getTrackingsWithTag(db, tag) {
    var allTrackings = await db.getAllTrackings();

    return allTrackings.filter(function(t) {
        return t.tags.includes(tag);
    });
}

// Usage
var urgentTrackings = await getTrackingsWithTag(db, 'urgent');
```

### Get Problem Shipments (Exceptions + Failed)

```javascript
async function getProblemShipments(db) {
    var allTrackings = await db.getAllTrackings();

    return allTrackings.filter(function(t) {
        return t.deliverySignal === 'EXCEPTION' ||
               t.deliverySignal === 'FAILED';
    });
}
```

---

## Testing

### Open Test Page

```bash
# Open test.html in browser
open games/shipment-tracker/test.html
```

### Run Tests Programmatically

```javascript
// In browser console
TestRunner.runAll().then(function() {
    console.log('Tests complete!');
});

// Clean up after tests
TestRunner.cleanup();
```

---

## Migration Example (Future: Firebase)

```javascript
// Create Firebase adapter (future implementation)
var firebaseAdapter = new FirebaseAdapter(firebaseConfig);
await firebaseAdapter.init();

// Export from IndexedDB
var trackings = await indexedDBAdapter.getAllTrackings();

// Import to Firebase
for (var tracking of trackings) {
    await firebaseAdapter.saveTracking(tracking);
}

console.log('Migration complete!');
```

---

## Performance Tips

1. **Use Indexes**: Filters on `carrier`, `delivered`, `deliverySignal` use indexes (fast)
2. **Batch Operations**: Save multiple trackings in sequence (faster than serial)
3. **Prune Regularly**: Call `pruneOldPayloads()` after each API call
4. **Close When Done**: Call `db.close()` when app unloads (free resources)

---

## Browser Compatibility

- ✅ Chrome 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Mobile Safari iOS 10+
- ✅ Chrome Android

---

## Troubleshooting

### Database Won't Open

```javascript
if (!window.indexedDB) {
    alert('IndexedDB not supported. Use a modern browser.');
}
```

### Quota Exceeded Error

```javascript
// Check storage quota
navigator.storage.estimate().then(function(estimate) {
    console.log('Used:', estimate.usage, 'bytes');
    console.log('Quota:', estimate.quota, 'bytes');
    console.log('Percent:', (estimate.usage / estimate.quota * 100).toFixed(2) + '%');
});

// Solution: Prune old payloads or clear data
db.clearAll();
```

### Transaction Errors

```javascript
// Ensure database is initialized
if (!db.isReady) {
    await db.init();
}

// Don't hold transactions open too long
// BAD: await inside transaction
// GOOD: Complete transaction, then do other work
```

---

## Summary

The IndexedDB adapter provides:

✅ **Full CRUD** operations for tracking records
✅ **Raw payload storage** with auto-pruning
✅ **Settings management** (key-value store)
✅ **Indexed queries** for fast filtering
✅ **Stale tracking detection** for smart refresh
✅ **Statistics** and analytics
✅ **Migration-ready** adapter pattern

**Next:** Build query engine (`js/query-engine.js`) to orchestrate API calls with this storage layer.
