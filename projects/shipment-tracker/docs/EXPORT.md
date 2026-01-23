# Export Functionality

**Version:** 1.0.0
**Last Updated:** 2026-01-22

---

## Table of Contents
1. [Overview](#overview)
2. [JSON Export](#json-export)
3. [CSV Export](#csv-export)
4. [Excel Export](#excel-export)
5. [Import from CSV/Excel](#import-from-csvexcel)
6. [Cloud Database Export](#cloud-database-export)

---

## Overview

### Supported Export Formats

| Format | Use Case | File Size | Compatibility |
|--------|----------|-----------|---------------|
| **JSON** | Backup, migration, dev tools | Small-Medium | All platforms |
| **CSV** | Spreadsheets, data analysis | Small | Excel, Google Sheets, Numbers |
| **Excel** | Professional reports, formatting | Medium | Microsoft Excel, LibreOffice |

### Export Options

- **Full Export**: All tracking records
- **Filtered Export**: Active shipments only (exclude delivered)
- **Date Range Export**: Shipments within date range
- **Carrier-Specific Export**: DHL, FedEx, or UPS only

---

## JSON Export

### Full Export (with raw payloads)

```javascript
async function exportJSON(includeRawPayloads = false) {
    const db = await openDatabase();

    // Get all tracking records
    const trackings = await getAllTrackings(db);

    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        recordCount: trackings.length,
        trackings: trackings
    };

    // Optionally include raw payloads
    if (includeRawPayloads) {
        const rawPayloads = await getAllRawPayloads(db);
        exportData.rawPayloads = rawPayloads;
    }

    // Convert to JSON string
    const jsonStr = JSON.stringify(exportData, null, 2);

    // Trigger download
    downloadFile(jsonStr, 'shipment-tracker-export.json', 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
```

### Filtered Export (Active Shipments Only)

```javascript
async function exportActiveJSON() {
    const db = await openDatabase();
    const tx = db.transaction('trackings', 'readonly');
    const store = tx.objectStore('trackings');
    const index = store.index('delivered');

    // Get only non-delivered shipments
    const request = index.getAll(false);

    request.onsuccess = function(e) {
        const trackings = e.target.result;

        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            filter: 'active_only',
            recordCount: trackings.length,
            trackings: trackings
        };

        const jsonStr = JSON.stringify(exportData, null, 2);
        downloadFile(jsonStr, 'active-shipments.json', 'application/json');
    };
}
```

### JSON Import

```javascript
async function importJSON(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Validate format
            if (!data.version || !data.trackings) {
                throw new Error('Invalid export file format');
            }

            const db = await openDatabase();
            const tx = db.transaction(['trackings', 'raw_payloads'], 'readwrite');

            // Import trackings
            const trackingStore = tx.objectStore('trackings');
            for (const tracking of data.trackings) {
                await trackingStore.put(tracking);
            }

            // Import raw payloads (if present)
            if (data.rawPayloads) {
                const payloadStore = tx.objectStore('raw_payloads');
                for (const payload of data.rawPayloads) {
                    await payloadStore.put(payload);
                }
            }

            await tx.complete;
            alert(`Imported ${data.trackings.length} tracking records`);

        } catch (err) {
            alert('Failed to import: ' + err.message);
        }
    };

    reader.readAsText(file);
}
```

---

## CSV Export

### Simple CSV (Flat Structure)

```javascript
function exportCSV(trackings) {
    // Define CSV headers
    const headers = [
        'AWB',
        'Carrier',
        'Date Shipped',
        'Status',
        'Delivery Signal',
        'Delivered',
        'Origin City',
        'Origin Country',
        'Destination City',
        'Destination State',
        'Destination Country',
        'Destination Postal Code',
        'Estimated Delivery',
        'Last Updated',
        'Last Checked',
        'Note',
        'Tags'
    ];

    // Convert trackings to CSV rows
    const rows = trackings.map(t => [
        escapeCsvValue(t.awb),
        escapeCsvValue(t.carrier),
        escapeCsvValue(t.dateShipped),
        escapeCsvValue(t.status),
        escapeCsvValue(t.deliverySignal),
        t.delivered ? 'Yes' : 'No',
        escapeCsvValue(t.origin.city),
        escapeCsvValue(t.origin.country),
        escapeCsvValue(t.destination.city),
        escapeCsvValue(t.destination.state),
        escapeCsvValue(t.destination.country),
        escapeCsvValue(t.destination.postalCode),
        escapeCsvValue(t.estimatedDelivery),
        escapeCsvValue(t.lastUpdated),
        escapeCsvValue(t.lastChecked),
        escapeCsvValue(t.note),
        escapeCsvValue(t.tags.join('; '))
    ]);

    // Build CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(csvContent, 'shipment-tracker-export.csv', 'text/csv');
}

function escapeCsvValue(value) {
    if (value === null || value === undefined) return '';

    const str = String(value);

    // Escape quotes and wrap in quotes if contains comma/quote/newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}
```

### Advanced CSV (with Event History)

```javascript
function exportCSVWithEvents(trackings) {
    const headers = [
        'AWB',
        'Carrier',
        'Date Shipped',
        'Status',
        'Delivered',
        'Event Timestamp',
        'Event Location',
        'Event Description',
        'Event Code'
    ];

    const rows = [];

    trackings.forEach(t => {
        if (t.events.length === 0) {
            // No events, single row
            rows.push([
                escapeCsvValue(t.awb),
                escapeCsvValue(t.carrier),
                escapeCsvValue(t.dateShipped),
                escapeCsvValue(t.status),
                t.delivered ? 'Yes' : 'No',
                '', '', '', ''
            ]);
        } else {
            // One row per event
            t.events.forEach(event => {
                rows.push([
                    escapeCsvValue(t.awb),
                    escapeCsvValue(t.carrier),
                    escapeCsvValue(t.dateShipped),
                    escapeCsvValue(t.status),
                    t.delivered ? 'Yes' : 'No',
                    escapeCsvValue(event.timestamp),
                    escapeCsvValue(event.location),
                    escapeCsvValue(event.description),
                    escapeCsvValue(event.code)
                ]);
            });
        }
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(csvContent, 'shipment-tracker-events.csv', 'text/csv');
}
```

---

## Excel Export

### Option 1: CSV-to-XLSX (Minimal, No Dependencies)

Excel can open CSV files directly. For basic exports, CSV is sufficient.

```javascript
// Just use exportCSV() - Excel will open it
// User can then "Save As" .xlsx if needed
```

### Option 2: SheetJS (Full XLSX Support)

For advanced formatting, use SheetJS library.

#### Installation

```html
<!-- Add to index.html -->
<script src="https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js"></script>
```

#### Export Implementation

```javascript
function exportExcel(trackings) {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary
    const summaryData = trackings.map(t => ({
        'AWB': t.awb,
        'Carrier': t.carrier,
        'Date Shipped': t.dateShipped,
        'Status': t.status,
        'Delivery Signal': t.deliverySignal,
        'Delivered': t.delivered ? 'Yes' : 'No',
        'Origin': `${t.origin.city}, ${t.origin.country}`,
        'Destination': `${t.destination.city}, ${t.destination.state}, ${t.destination.country}`,
        'Estimated Delivery': t.estimatedDelivery || 'N/A',
        'Last Updated': t.lastUpdated,
        'Note': t.note
    }));

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tracking Summary');

    // Sheet 2: Events
    const eventData = [];
    trackings.forEach(t => {
        t.events.forEach(event => {
            eventData.push({
                'AWB': t.awb,
                'Carrier': t.carrier,
                'Timestamp': event.timestamp,
                'Location': event.location,
                'Description': event.description,
                'Code': event.code
            });
        });
    });

    const wsEvents = XLSX.utils.json_to_sheet(eventData);
    XLSX.utils.book_append_sheet(wb, wsEvents, 'Event History');

    // Sheet 3: Statistics
    const stats = [
        { Metric: 'Total Shipments', Value: trackings.length },
        { Metric: 'Delivered', Value: trackings.filter(t => t.delivered).length },
        { Metric: 'In Transit', Value: trackings.filter(t => !t.delivered).length },
        { Metric: 'DHL Shipments', Value: trackings.filter(t => t.carrier === 'DHL').length },
        { Metric: 'FedEx Shipments', Value: trackings.filter(t => t.carrier === 'FedEx').length },
        { Metric: 'UPS Shipments', Value: trackings.filter(t => t.carrier === 'UPS').length }
    ];

    const wsStats = XLSX.utils.json_to_sheet(stats);
    XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');

    // Generate Excel file and download
    XLSX.writeFile(wb, 'shipment-tracker-export.xlsx');
}
```

#### Advanced Formatting

```javascript
function exportFormattedExcel(trackings) {
    const wb = XLSX.utils.book_new();

    // Create worksheet data with styling
    const data = [
        // Header row (bold, colored background)
        ['AWB', 'Carrier', 'Status', 'Delivered', 'Estimated Delivery']
    ];

    trackings.forEach(t => {
        data.push([
            t.awb,
            t.carrier,
            t.status,
            t.delivered ? 'Yes' : 'No',
            t.estimatedDelivery || 'N/A'
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
        { wch: 20 }, // AWB
        { wch: 10 }, // Carrier
        { wch: 20 }, // Status
        { wch: 10 }, // Delivered
        { wch: 15 }  // Estimated Delivery
    ];

    // Add conditional formatting (delivered rows = green background)
    // Note: Requires extended SheetJS features (paid version) or post-process in Excel

    XLSX.utils.book_append_sheet(wb, ws, 'Shipments');
    XLSX.writeFile(wb, 'shipment-tracker.xlsx');
}
```

---

## Import from CSV/Excel

### CSV Import

```javascript
function importCSV(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        const csvText = e.target.result;
        const lines = csvText.split('\n');

        // Parse header
        const headers = parseCsvLine(lines[0]);
        const awbIndex = headers.indexOf('AWB');
        const carrierIndex = headers.indexOf('Carrier');
        const dateShippedIndex = headers.indexOf('Date Shipped');

        if (awbIndex === -1 || carrierIndex === -1) {
            alert('Invalid CSV format. Missing required columns.');
            return;
        }

        const db = await openDatabase();
        const tx = db.transaction('trackings', 'readwrite');
        const store = tx.objectStore('trackings');

        let imported = 0;

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]);
            if (values.length === 0) continue;

            const awb = values[awbIndex];
            const carrier = values[carrierIndex];
            const dateShipped = values[dateShippedIndex] || new Date().toISOString().split('T')[0];

            if (!awb || !carrier) continue;

            // Create minimal tracking record (user will need to refresh from API)
            const tracking = {
                awb: awb,
                carrier: carrier,
                dateShipped: dateShipped,
                status: 'Pending',
                deliverySignal: 'UNKNOWN',
                delivered: false,
                lastChecked: new Date(0).toISOString(), // Force refresh
                lastUpdated: new Date().toISOString(),
                origin: { city: null, state: null, country: null, postalCode: null },
                destination: { city: null, state: null, country: null, postalCode: null },
                events: [],
                estimatedDelivery: null,
                note: '',
                tags: [],
                rawPayloadId: null
            };

            await store.put(tracking);
            imported++;
        }

        await tx.complete;
        alert(`Imported ${imported} tracking numbers. Click "Refresh All" to fetch details.`);
    };

    reader.readAsText(file);
}

function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}
```

### Excel Import (SheetJS)

```javascript
function importExcel(file) {
    const reader = new FileReader();

    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const db = await openDatabase();
        const tx = db.transaction('trackings', 'readwrite');
        const store = tx.objectStore('trackings');

        let imported = 0;

        for (const row of jsonData) {
            if (!row.AWB || !row.Carrier) continue;

            const tracking = {
                awb: row.AWB,
                carrier: row.Carrier,
                dateShipped: row['Date Shipped'] || new Date().toISOString().split('T')[0],
                status: 'Pending',
                deliverySignal: 'UNKNOWN',
                delivered: false,
                lastChecked: new Date(0).toISOString(),
                lastUpdated: new Date().toISOString(),
                origin: { city: null, state: null, country: null, postalCode: null },
                destination: { city: null, state: null, country: null, postalCode: null },
                events: [],
                estimatedDelivery: null,
                note: row.Note || '',
                tags: row.Tags ? row.Tags.split(';').map(t => t.trim()) : [],
                rawPayloadId: null
            };

            await store.put(tracking);
            imported++;
        }

        await tx.complete;
        alert(`Imported ${imported} tracking numbers from Excel.`);
    };

    reader.readAsArrayBuffer(file);
}
```

---

## Cloud Database Export

### Supabase Export

```javascript
async function exportToSupabase(trackings, supabaseClient) {
    try {
        // Batch insert (Supabase supports up to 1000 rows per insert)
        const batchSize = 1000;

        for (let i = 0; i < trackings.length; i += batchSize) {
            const batch = trackings.slice(i, i + batchSize);

            // Convert to Supabase schema
            const rows = batch.map(t => ({
                awb: t.awb,
                carrier: t.carrier,
                date_shipped: t.dateShipped,
                status: t.status,
                delivery_signal: t.deliverySignal,
                delivered: t.delivered,
                last_checked: t.lastChecked,
                last_updated: t.lastUpdated,
                origin_city: t.origin.city,
                origin_country: t.origin.country,
                destination_city: t.destination.city,
                destination_state: t.destination.state,
                destination_country: t.destination.country,
                destination_postal_code: t.destination.postalCode,
                events: JSON.stringify(t.events), // Store as JSONB
                estimated_delivery: t.estimatedDelivery,
                note: t.note,
                tags: t.tags, // Store as text[]
                user_id: supabaseClient.auth.user().id
            }));

            const { error } = await supabaseClient
                .from('trackings')
                .upsert(rows);

            if (error) throw error;
        }

        alert(`Exported ${trackings.length} records to Supabase`);

    } catch (err) {
        alert('Export failed: ' + err.message);
    }
}
```

### Firebase Firestore Export

```javascript
async function exportToFirestore(trackings, db, userId) {
    const batch = db.batch();
    let batchCount = 0;

    for (const tracking of trackings) {
        const docRef = db.collection('trackings').doc(tracking.awb);

        batch.set(docRef, {
            ...tracking,
            userId: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        batchCount++;

        // Firestore batch limit: 500 operations
        if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
        }
    }

    if (batchCount > 0) {
        await batch.commit();
    }

    alert(`Exported ${trackings.length} records to Firestore`);
}
```

### Google Sheets Export (via API)

```javascript
async function exportToGoogleSheets(trackings, accessToken) {
    // Create new spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: 'Shipment Tracker Export - ' + new Date().toLocaleDateString()
            },
            sheets: [
                { properties: { title: 'Trackings' } }
            ]
        })
    });

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;

    // Prepare data
    const headers = ['AWB', 'Carrier', 'Status', 'Delivered', 'Estimated Delivery'];
    const rows = trackings.map(t => [
        t.awb,
        t.carrier,
        t.status,
        t.delivered ? 'Yes' : 'No',
        t.estimatedDelivery || 'N/A'
    ]);

    const values = [headers, ...rows];

    // Write data
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Trackings!A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
    });

    // Open spreadsheet
    window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
}
```

---

## Export UI Components

### Export Button Menu

```html
<div class="export-menu">
    <button id="exportBtn">📤 Export</button>
    <div id="exportDropdown" class="dropdown hidden">
        <button onclick="exportJSON(false)">JSON (Compact)</button>
        <button onclick="exportJSON(true)">JSON (with Raw Data)</button>
        <button onclick="exportCSV()">CSV (Simple)</button>
        <button onclick="exportCSVWithEvents()">CSV (with Events)</button>
        <button onclick="exportExcel()">Excel (.xlsx)</button>
        <hr>
        <button onclick="exportToCloud()">Export to Cloud...</button>
    </div>
</div>
```

### Import Button

```html
<input type="file" id="importFile" accept=".json,.csv,.xlsx" style="display: none;">
<button onclick="document.getElementById('importFile').click()">📥 Import</button>

<script>
document.getElementById('importFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'json') {
        importJSON(file);
    } else if (ext === 'csv') {
        importCSV(file);
    } else if (ext === 'xlsx') {
        importExcel(file);
    } else {
        alert('Unsupported file format');
    }

    // Reset input
    e.target.value = '';
});
</script>
```

---

## Summary

### Export Capabilities

✅ **JSON**: Full data backup with optional raw payloads
✅ **CSV**: Simple spreadsheet-compatible format
✅ **Excel**: Multi-sheet workbooks with statistics
✅ **Cloud**: Direct export to Supabase, Firestore, Google Sheets

### Import Capabilities

✅ **JSON**: Full restoration from backup
✅ **CSV**: Bulk add tracking numbers (minimal data)
✅ **Excel**: Import from existing spreadsheets

### Best Practices

1. **Backup Regularly**: Export to JSON weekly
2. **Share with Team**: Use CSV/Excel for non-technical users
3. **Cloud Sync**: Use Supabase/Firebase for multi-device access
4. **Privacy**: Never include raw payloads in shared exports (may contain PII)
5. **Validation**: Always validate imported data before saving

**Next Step:** Implement export buttons in UI and integrate with IndexedDB adapter
