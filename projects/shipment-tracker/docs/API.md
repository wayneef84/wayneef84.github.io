# Carrier API Integration Guide

**Version:** 1.0.0
**Last Updated:** 2026-01-22

---

## Table of Contents
1. [API Overview](#api-overview)
2. [DHL Express API](#dhl-express-api)
3. [FedEx Track API](#fedex-track-api)
4. [UPS Tracking API](#ups-tracking-api)
5. [CORS & Proxy Setup](#cors--proxy-setup)
6. [Rate Limiting](#rate-limiting)
7. [Error Handling](#error-handling)

---

## API Overview

### Supported Carriers

| Carrier | API Name | Version | Batch Support | Max Batch Size | Rate Limit |
|---------|----------|---------|---------------|----------------|------------|
| DHL | DHL Express Tracking API | v2 | ✅ Yes | 10 AWBs | 250/day (free tier) |
| FedEx | FedEx Track API | REST v1 | ✅ Yes | 30 AWBs | 1000/day (free tier) |
| UPS | UPS Tracking API | JSON v1 | ✅ Yes | 50 AWBs | 500/day (free tier) |

### Authentication Methods

All three carriers use **API Key** authentication (BYOK model):

- **DHL**: API Key + Account Number (passed in headers)
- **FedEx**: OAuth 2.0 Client ID + Secret (get token first)
- **UPS**: API Key + Username (passed in headers)

---

## DHL Express API

### API Documentation
- **Official Docs**: https://developer.dhl.com/api-reference/shipment-tracking
- **Sandbox**: https://api-sandbox.dhl.com/track/shipments
- **Production**: https://api-eu.dhl.com/track/shipments

### Authentication

```javascript
const DHL_CONFIG = {
    apiKey: 'YOUR_DHL_API_KEY',
    accountNumber: 'YOUR_DHL_ACCOUNT',
    baseURL: 'https://api-eu.dhl.com', // or api-sandbox for testing
    version: 'v2'
};

// Headers
const headers = {
    'DHL-API-Key': DHL_CONFIG.apiKey,
    'Content-Type': 'application/json'
};
```

### Single Tracking Request

```javascript
async function getDHLTracking(awb) {
    const url = `${DHL_CONFIG.baseURL}/track/shipments`;
    const params = new URLSearchParams({
        trackingNumber: awb,
        service: 'express' // or 'freight'
    });

    const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
            'DHL-API-Key': DHL_CONFIG.apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`DHL API error: ${response.status}`);
    }

    return await response.json();
}
```

### Batch Tracking Request

```javascript
async function getDHLBatch(awbs) {
    const url = `${DHL_CONFIG.baseURL}/track/shipments`;
    const params = new URLSearchParams({
        trackingNumber: awbs.join(','), // Max 10 AWBs
        service: 'express'
    });

    const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
            'DHL-API-Key': DHL_CONFIG.apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`DHL API error: ${response.status}`);
    }

    return await response.json();
}

// Usage
const awbs = ['DHL123456789', 'DHL987654321'];
const result = await getDHLBatch(awbs);
```

### Response Format

```javascript
{
    shipments: [
        {
            id: 'DHL123456789',
            service: 'express',
            origin: {
                address: {
                    addressLocality: 'Hong Kong',
                    countryCode: 'HK',
                    postalCode: null
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
                },
                {
                    timestamp: '2026-01-21T14:30:00Z',
                    location: {
                        address: { addressLocality: 'Anchorage, AK' }
                    },
                    description: 'In transit',
                    statusCode: 'transit'
                }
            ]
        }
    ]
}
```

### Status Codes (DHL)

| Status Code | Description | Delivery Signal |
|-------------|-------------|-----------------|
| `pre-transit` | Label created | `PICKUP` |
| `picked-up` | Picked up | `PICKUP` |
| `transit` | In transit | `IN_TRANSIT` |
| `delivery` | Out for delivery | `OUT_FOR_DELIVERY` |
| `delivered` | Delivered | `DELIVERY` |
| `exception` | Exception/delay | `EXCEPTION` |
| `failure` | Delivery failed | `FAILED` |
| `returned` | Returned to sender | `RETURNED` |

### DHL Normalizer

```javascript
class DHLNormalizer {
    normalize(payload) {
        const shipment = payload.shipments[0];
        if (!shipment) throw new Error('No shipment data');

        return {
            awb: shipment.id,
            carrier: 'DHL',
            dateShipped: this.extractDateShipped(shipment.events),
            status: shipment.status.status,
            deliverySignal: this.mapStatusToSignal(shipment.status.statusCode),
            delivered: shipment.status.statusCode === 'delivered',
            lastChecked: new Date().toISOString(),
            lastUpdated: shipment.status.timestamp,
            origin: this.normalizeAddress(shipment.origin.address),
            destination: this.normalizeAddress(shipment.destination.address),
            events: this.normalizeEvents(shipment.events),
            estimatedDelivery: shipment.estimatedTimeOfDelivery,
            note: '',
            tags: [],
            rawPayloadId: null // Set later
        };
    }

    mapStatusToSignal(statusCode) {
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

    normalizeAddress(address) {
        return {
            city: address.addressLocality || null,
            state: address.addressRegion || null,
            country: address.countryCode || null,
            postalCode: address.postalCode || null
        };
    }

    normalizeEvents(events) {
        return events.map(e => ({
            timestamp: e.timestamp,
            location: e.location?.address?.addressLocality || 'Unknown',
            description: e.description,
            code: e.statusCode
        }));
    }

    extractDateShipped(events) {
        const pickupEvent = events.find(e => e.statusCode === 'picked-up');
        if (pickupEvent) {
            return pickupEvent.timestamp.split('T')[0]; // ISO date only
        }
        return events[0]?.timestamp.split('T')[0] || null;
    }
}
```

---

## FedEx Track API

### API Documentation
- **Official Docs**: https://developer.fedex.com/api/en-us/catalog/track/v1/docs.html
- **Sandbox**: https://apis-sandbox.fedex.com/track/v1/trackingnumbers
- **Production**: https://apis.fedex.com/track/v1/trackingnumbers

### Authentication (OAuth 2.0)

FedEx requires OAuth 2.0 token before making tracking requests.

```javascript
const FEDEX_CONFIG = {
    clientId: 'YOUR_FEDEX_CLIENT_ID',
    clientSecret: 'YOUR_FEDEX_CLIENT_SECRET',
    baseURL: 'https://apis.fedex.com', // or apis-sandbox
    version: 'v1',
    tokenURL: 'https://apis.fedex.com/oauth/token'
};

// Step 1: Get access token
async function getFedExToken() {
    const response = await fetch(FEDEX_CONFIG.tokenURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: FEDEX_CONFIG.clientId,
            client_secret: FEDEX_CONFIG.clientSecret
        })
    });

    if (!response.ok) {
        throw new Error(`FedEx auth error: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token; // Cache this, valid for ~60 min
}
```

### Single Tracking Request

```javascript
async function getFedExTracking(awb, token) {
    const url = `${FEDEX_CONFIG.baseURL}/track/v1/trackingnumbers`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            includeDetailedScans: true,
            trackingInfo: [
                {
                    trackingNumberInfo: {
                        trackingNumber: awb
                    }
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`FedEx API error: ${response.status}`);
    }

    return await response.json();
}
```

### Batch Tracking Request

```javascript
async function getFedExBatch(awbs, token) {
    const url = `${FEDEX_CONFIG.baseURL}/track/v1/trackingnumbers`;

    const trackingInfo = awbs.map(awb => ({
        trackingNumberInfo: {
            trackingNumber: awb
        }
    }));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            includeDetailedScans: true,
            trackingInfo: trackingInfo // Max 30 AWBs
        })
    });

    if (!response.ok) {
        throw new Error(`FedEx API error: ${response.status}`);
    }

    return await response.json();
}

// Usage
const token = await getFedExToken();
const awbs = ['FX123456789', 'FX987654321'];
const result = await getFedExBatch(awbs, token);
```

### Response Format

```javascript
{
    output: {
        completeTrackResults: [
            {
                trackingNumber: 'FX123456789',
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
                    },
                    {
                        date: '2026-01-21T14:30:00Z',
                        eventType: 'IT',
                        eventDescription: 'In transit',
                        scanLocation: {
                            city: 'ANCHORAGE',
                            stateOrProvinceCode: 'AK',
                            countryCode: 'US'
                        }
                    }
                ]
            }
        ]
    }
}
```

### Status Codes (FedEx)

| Status Code | Description | Delivery Signal |
|-------------|-------------|-----------------|
| `PU` | Picked up | `PICKUP` |
| `IT` | In transit | `IN_TRANSIT` |
| `OD` | Out for delivery | `OUT_FOR_DELIVERY` |
| `DL` | Delivered | `DELIVERY` |
| `EX` | Exception | `EXCEPTION` |
| `DF` | Delivery failed | `FAILED` |
| `RS` | Return to sender | `RETURNED` |

### FedEx Normalizer

```javascript
class FedExNormalizer {
    normalize(payload) {
        const track = payload.output.completeTrackResults[0];
        if (!track) throw new Error('No tracking data');

        return {
            awb: track.trackingNumber,
            carrier: 'FedEx',
            dateShipped: this.extractDate(track.dateAndTimes, 'SHIP_DATE'),
            status: track.latestStatusDetail.statusByLocale,
            deliverySignal: this.mapStatusToSignal(track.latestStatusDetail.statusCode),
            delivered: track.latestStatusDetail.statusCode === 'DL',
            lastChecked: new Date().toISOString(),
            lastUpdated: track.scanEvents[track.scanEvents.length - 1]?.date,
            origin: this.normalizeLocation(track.originLocation),
            destination: this.normalizeLocation(track.destinationLocation),
            events: this.normalizeEvents(track.scanEvents),
            estimatedDelivery: this.extractDate(track.dateAndTimes, 'ESTIMATED_DELIVERY'),
            note: '',
            tags: [],
            rawPayloadId: null
        };
    }

    mapStatusToSignal(statusCode) {
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

    normalizeLocation(loc) {
        return {
            city: loc.city || null,
            state: loc.stateOrProvinceCode || null,
            country: loc.countryCode || null,
            postalCode: loc.postalCode || null
        };
    }

    normalizeEvents(events) {
        return events.map(e => ({
            timestamp: e.date,
            location: `${e.scanLocation.city}, ${e.scanLocation.countryCode}`,
            description: e.eventDescription,
            code: e.eventType
        }));
    }

    extractDate(dateAndTimes, type) {
        const found = dateAndTimes.find(d => d.type === type);
        return found ? found.dateTime.split('T')[0] : null;
    }
}
```

---

## UPS Tracking API

### API Documentation
- **Official Docs**: https://developer.ups.com/api/reference/track/product-info
- **Sandbox**: https://wwwcie.ups.com/api/track/v1/details
- **Production**: https://onlinetools.ups.com/api/track/v1/details

### Authentication

```javascript
const UPS_CONFIG = {
    apiKey: 'YOUR_UPS_API_KEY',
    username: 'YOUR_UPS_USERNAME',
    password: 'YOUR_UPS_PASSWORD', // Optional for some accounts
    baseURL: 'https://onlinetools.ups.com', // or wwwcie for sandbox
    version: 'v1'
};

// Headers
const headers = {
    'Content-Type': 'application/json',
    'transId': 'shipment-tracker-' + Date.now(),
    'transactionSrc': 'ShipmentTracker',
    'AccessLicenseNumber': UPS_CONFIG.apiKey,
    'Username': UPS_CONFIG.username
};
```

### Single Tracking Request

```javascript
async function getUPSTracking(awb) {
    const url = `${UPS_CONFIG.baseURL}/api/track/v1/details/${awb}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'transId': 'tracker-' + Date.now(),
            'transactionSrc': 'ShipmentTracker',
            'AccessLicenseNumber': UPS_CONFIG.apiKey,
            'Username': UPS_CONFIG.username
        }
    });

    if (!response.ok) {
        throw new Error(`UPS API error: ${response.status}`);
    }

    return await response.json();
}
```

### Batch Tracking Request

```javascript
async function getUPSBatch(awbs) {
    const url = `${UPS_CONFIG.baseURL}/api/track/v1/details`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'transId': 'tracker-' + Date.now(),
            'transactionSrc': 'ShipmentTracker',
            'AccessLicenseNumber': UPS_CONFIG.apiKey,
            'Username': UPS_CONFIG.username
        },
        body: JSON.stringify({
            inquiryNumber: awbs // Array, max 50 AWBs
        })
    });

    if (!response.ok) {
        throw new Error(`UPS API error: ${response.status}`);
    }

    return await response.json();
}

// Usage
const awbs = ['1Z999AA10123456789', '1Z999AA10987654321'];
const result = await getUPSBatch(awbs);
```

### Response Format

```javascript
{
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
                            },
                            {
                                location: {
                                    address: {
                                        city: 'ANCHORAGE',
                                        stateProvince: 'AK',
                                        countryCode: 'US'
                                    }
                                },
                                status: {
                                    statusCode: 'I',
                                    description: 'In Transit'
                                },
                                date: '20260121',
                                time: '143000'
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

### Status Codes (UPS)

| Status Code | Description | Delivery Signal |
|-------------|-------------|-----------------|
| `M` | Manifest pickup | `PICKUP` |
| `P` | Pickup | `PICKUP` |
| `I` | In transit | `IN_TRANSIT` |
| `O` | Out for delivery | `OUT_FOR_DELIVERY` |
| `D` | Delivered | `DELIVERY` |
| `X` | Exception | `EXCEPTION` |
| `F` | Delivery failed | `FAILED` |
| `R` | Return to sender | `RETURNED` |

### UPS Normalizer

```javascript
class UPSNormalizer {
    normalize(payload) {
        const shipment = payload.trackResponse.shipment[0];
        const pkg = shipment.package[0];
        if (!pkg) throw new Error('No package data');

        return {
            awb: pkg.trackingNumber,
            carrier: 'UPS',
            dateShipped: this.formatDate(pkg.activity[0]?.date),
            status: pkg.currentStatus.description,
            deliverySignal: this.mapStatusToSignal(pkg.currentStatus.statusCode),
            delivered: pkg.currentStatus.statusCode === 'D',
            lastChecked: new Date().toISOString(),
            lastUpdated: this.formatTimestamp(
                pkg.currentStatus.statusDate,
                pkg.currentStatus.statusTime
            ),
            origin: this.normalizeLocation(pkg.activity[0]?.location?.address),
            destination: this.normalizeLocation(pkg.activity[pkg.activity.length - 1]?.location?.address),
            events: this.normalizeEvents(pkg.activity),
            estimatedDelivery: this.extractDeliveryDate(pkg.deliveryDate),
            note: '',
            tags: [],
            rawPayloadId: null
        };
    }

    mapStatusToSignal(statusCode) {
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

    normalizeLocation(address) {
        if (!address) return { city: null, state: null, country: null, postalCode: null };
        return {
            city: address.city || null,
            state: address.stateProvince || null,
            country: address.countryCode || null,
            postalCode: address.postalCode || null
        };
    }

    normalizeEvents(activities) {
        return activities.map(a => ({
            timestamp: this.formatTimestamp(a.date, a.time),
            location: this.formatLocation(a.location?.address),
            description: a.status.description,
            code: a.status.statusCode
        }));
    }

    formatTimestamp(date, time) {
        // UPS format: date=20260122, time=091500
        // Convert to ISO: 2026-01-22T09:15:00Z
        const year = date.substring(0, 4);
        const month = date.substring(4, 6);
        const day = date.substring(6, 8);
        const hour = time.substring(0, 2);
        const min = time.substring(2, 4);
        const sec = time.substring(4, 6);
        return `${year}-${month}-${day}T${hour}:${min}:${sec}Z`;
    }

    formatDate(dateStr) {
        // 20260122 → 2026-01-22
        if (!dateStr) return null;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
    }

    formatLocation(address) {
        if (!address) return 'Unknown';
        const parts = [address.city, address.stateProvince, address.countryCode].filter(Boolean);
        return parts.join(', ');
    }

    extractDeliveryDate(deliveryDate) {
        const del = deliveryDate?.find(d => d.type === 'DEL');
        return del ? this.formatDate(del.date) : null;
    }
}
```

---

## CORS & Proxy Setup

### Problem
Carrier APIs don't allow direct browser requests (CORS restrictions).

### Solution: Backend Proxy

#### Option 1: Simple Node.js Proxy

```javascript
// server.js (Node.js + Express)
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// DHL proxy
app.get('/api/dhl/track', async (req, res) => {
    const { awbs } = req.query;
    const apiKey = req.headers['x-dhl-api-key'];

    try {
        const response = await fetch(
            `https://api-eu.dhl.com/track/shipments?trackingNumber=${awbs}`,
            {
                headers: { 'DHL-API-Key': apiKey }
            }
        );
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// FedEx proxy (similar pattern)
app.post('/api/fedex/track', async (req, res) => {
    // ... FedEx logic
});

// UPS proxy (similar pattern)
app.get('/api/ups/track', async (req, res) => {
    // ... UPS logic
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
```

#### Option 2: Cloudflare Workers (Serverless)

```javascript
// cloudflare-worker.js
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/dhl/track') {
        const awbs = url.searchParams.get('awbs');
        const apiKey = request.headers.get('x-dhl-api-key');

        const response = await fetch(
            `https://api-eu.dhl.com/track/shipments?trackingNumber=${awbs}`,
            {
                headers: { 'DHL-API-Key': apiKey }
            }
        );

        return new Response(await response.text(), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    return new Response('Not found', { status: 404 });
}
```

#### Option 3: CORS Proxy (Dev/Testing Only)

**WARNING:** Never use in production (security risk, unreliable)

```javascript
// Use cors-anywhere for testing
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_URL = 'https://api-eu.dhl.com/track/shipments';

fetch(PROXY_URL + API_URL + '?trackingNumber=ABC123', {
    headers: { 'DHL-API-Key': apiKey }
});
```

---

## Rate Limiting

### Carrier Rate Limits (Free Tiers)

| Carrier | Daily Limit | Per-Minute Limit | Batch Size | Notes |
|---------|-------------|------------------|------------|-------|
| DHL | 250 requests | N/A | 10 AWBs | Per API key |
| FedEx | 1000 requests | 60 req/min | 30 AWBs | Per client ID |
| UPS | 500 requests | N/A | 50 AWBs | Per access key |

### Rate Limit Handling

```javascript
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests; // e.g., 250 for DHL
        this.windowMs = windowMs;       // e.g., 24 * 60 * 60 * 1000 (1 day)
        this.requests = [];
    }

    canMakeRequest() {
        const now = Date.now();
        // Remove requests outside window
        this.requests = this.requests.filter(t => now - t < this.windowMs);
        return this.requests.length < this.maxRequests;
    }

    recordRequest() {
        this.requests.push(Date.now());
    }

    getRemainingRequests() {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.windowMs);
        return this.maxRequests - this.requests.length;
    }
}

// Usage
const dhlLimiter = new RateLimiter(250, 24 * 60 * 60 * 1000);

async function queryDHL(awbs) {
    if (!dhlLimiter.canMakeRequest()) {
        throw new Error('Rate limit exceeded. Try again tomorrow.');
    }

    const result = await getDHLBatch(awbs);
    dhlLimiter.recordRequest();
    return result;
}
```

### Best Practices

1. **Batch Queries**: Always batch AWBs by carrier (reduce API calls)
2. **Cache Results**: Store in IndexedDB, don't re-query delivered items
3. **Cooldown Period**: Wait 10+ minutes between queries for same AWB
4. **User Feedback**: Show remaining quota in UI
5. **Fallback**: If rate limit hit, queue for next day

---

## Error Handling

### Common Errors

| Error | Status Code | Cause | Solution |
|-------|-------------|-------|----------|
| Invalid API Key | 401 | Wrong/expired key | Prompt user to update key |
| Rate Limit Exceeded | 429 | Too many requests | Show quota, retry later |
| Tracking Not Found | 404 | Invalid AWB | Mark as invalid, notify user |
| Server Error | 500 | Carrier API down | Retry with backoff |
| Network Error | N/A | No internet | Queue for retry |

### Error Handler Pattern

```javascript
class APIErrorHandler {
    static handle(error, carrier, awb) {
        const status = error.status || error.response?.status;

        switch (status) {
            case 401:
                return {
                    type: 'AUTH_ERROR',
                    message: `Invalid ${carrier} API key. Please update in settings.`,
                    userAction: 'UPDATE_KEY',
                    retry: false
                };

            case 404:
                return {
                    type: 'NOT_FOUND',
                    message: `Tracking number ${awb} not found in ${carrier} system.`,
                    userAction: 'VERIFY_AWB',
                    retry: false
                };

            case 429:
                return {
                    type: 'RATE_LIMIT',
                    message: `${carrier} rate limit exceeded. Try again later.`,
                    userAction: 'SHOW_QUOTA',
                    retry: true,
                    retryAfter: 60 * 60 * 1000 // 1 hour
                };

            case 500:
            case 502:
            case 503:
                return {
                    type: 'SERVER_ERROR',
                    message: `${carrier} API is temporarily unavailable.`,
                    userAction: 'RETRY_LATER',
                    retry: true,
                    retryAfter: 5 * 60 * 1000 // 5 minutes
                };

            default:
                return {
                    type: 'NETWORK_ERROR',
                    message: `Failed to connect to ${carrier}. Check your internet.`,
                    userAction: 'CHECK_NETWORK',
                    retry: true,
                    retryAfter: 2 * 60 * 1000 // 2 minutes
                };
        }
    }
}

// Usage
try {
    const result = await getDHLTracking(awb);
} catch (err) {
    const errorInfo = APIErrorHandler.handle(err, 'DHL', awb);

    if (errorInfo.userAction === 'UPDATE_KEY') {
        // Show settings panel
        showSettings();
    } else if (errorInfo.retry) {
        // Queue for retry
        queueRetry(awb, errorInfo.retryAfter);
    }

    // Show toast notification
    showError(errorInfo.message);
}
```

---

## Summary

### Carrier Comparison

| Feature | DHL | FedEx | UPS |
|---------|-----|-------|-----|
| **Auth** | API Key | OAuth 2.0 | API Key + Username |
| **Batch Size** | 10 | 30 | 50 |
| **Rate Limit** | 250/day | 1000/day | 500/day |
| **Response Format** | Clean JSON | Nested structure | Date/time split |
| **Normalizer Complexity** | Simple | Medium | High (date parsing) |
| **Best For** | International | US domestic | US domestic |

### Implementation Checklist

- [ ] Create carrier adapter base class
- [ ] Implement DHL adapter + normalizer
- [ ] Implement FedEx adapter + normalizer (OAuth flow)
- [ ] Implement UPS adapter + normalizer (date formatting)
- [ ] Set up backend proxy (Node.js or Cloudflare)
- [ ] Implement rate limiter per carrier
- [ ] Add error handling and retry logic
- [ ] Store raw payloads in IndexedDB
- [ ] Test with sample AWBs (sandbox APIs)
- [ ] Add user settings for API keys

---

## Next Steps

1. Implement base API adapter (`js/api/base.js`)
2. Create carrier-specific adapters (DHL, FedEx, UPS)
3. Build normalizers for each carrier
4. Set up backend proxy for CORS
5. Integrate with query engine and IndexedDB
6. Add API key management UI
7. Test with real tracking numbers
