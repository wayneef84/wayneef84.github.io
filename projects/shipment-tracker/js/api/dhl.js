/**
 * DHL Express API Adapter
 * Handles communication with DHL Shipment Tracking API v2
 *
 * API Docs: https://developer.dhl.com/api-reference/shipment-tracking
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.1.3
 *
 * ======================================================================================
 * CHANGELOG
 * ======================================================================================
 * v1.1.3 - [Current] (Gemini)
 * - Fixed Schema Mismatch: Renamed 'trackingNumber' -> 'awb' and 'courier' -> 'carrier'.
 *
 * v1.1.2 - (Gemini)
 * - Fixed "Force Refresh" and "TypeError" bugs.
 * ======================================================================================
 */

(function(window) {
    'use strict';

    var DHL_CONFIG = {
        apiUrl: 'https://api-eu.dhl.com/track/shipments',
        serviceName: 'DHL',
        rateLimit: {
            requestsPerDay: 250,
            requestsPerSecond: 2
        }
    };

    function trackShipment(trackingNumber, useMock) {
        var shouldMock = useMock;
        if (typeof shouldMock === 'undefined') {
            shouldMock = APIBase.shouldUseMockData();
        }

        console.log('[DHL] Requesting tracking for:', trackingNumber, 'Mock Mode:', shouldMock);

        if (shouldMock) {
            console.log('[DHL] Mock mode enabled. Returning driver dummy data.');
            return trackWithMockData(trackingNumber);
        }

        var rateLimitCheck = APIBase.checkRateLimit('DHL');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error('Rate limit exceeded for DHL. Try again in ' + rateLimitCheck.resetIn + 's'));
        }

        return Promise.resolve(APIBase.getAPIKey(DHL_CONFIG.serviceName))
            .then(function(apiKey) {
                if (!apiKey) {
                    console.error('[DHL] No API Key provided and Mock Mode is OFF.');
                    return Promise.reject(new Error('DHL API Key missing. Please add key in settings or enable "Use Mock Data".'));
                }

                var url = DHL_CONFIG.apiUrl + '?trackingNumber=' + trackingNumber;
                
                return fetch(url, {
                    method: 'GET',
                    headers: {
                        'DHL-API-Key': apiKey,
                        'Accept': 'application/json'
                    }
                });
            })
            .then(function(response) {
                if (response.status === 401) throw new Error('DHL API Unauthorized (Check Key)');
                if (response.status === 404) throw new Error('DHL Shipment Not Found');
                if (!response.ok) throw new Error('DHL API Error: ' + response.status);
                return response.json();
            })
            .then(function(data) {
                APIBase.recordRequest('DHL');
                return parseTrackingResponse(data, trackingNumber);
            })
            .catch(function(error) {
                console.error('[DHL] API Error:', error);
                throw APIBase.createAPIError('DHL', error);
            });
    }

    function trackWithMockData(trackingNumber) {
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(generateMockTrackingData(trackingNumber));
            }, 800);
        });
    }

    // ============================================================
    // MOCK DATA GENERATOR (Fixed Schema)
    // ============================================================

    function generateMockTrackingData(trackingNumber) {
        var now = new Date();
        var oneHourAgo = new Date(now.getTime() - 3600000);
        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        return {
            awb: trackingNumber, // FIXED
            carrier: 'DHL',      // FIXED
            status: 'Processed at Cincinnati Hub',
            origin: 'Berlin, Germany',
            destination: 'Chicago, IL, US',
            currentLocation: 'CINCINNATI HUB, OH - USA',
            estimatedDelivery: new Date(now.getTime() + 86400000).toISOString(),
            
            service: 'DHL EXPRESS WORLDWIDE',
            pieces: 1,
            weight: '2.5 kg',

            history: [
                {
                    status: 'Processed at CINCINNATI HUB - USA',
                    details: 'Sorting Complete',
                    location: 'CINCINNATI HUB, OH - USA',
                    timestamp: now.toISOString()
                },
                {
                    status: 'Arrived at DHL Sort Facility CINCINNATI HUB',
                    details: 'Transferred from aircraft',
                    location: 'CINCINNATI HUB, OH - USA',
                    timestamp: oneHourAgo.toISOString()
                },
                {
                    status: 'Departed Facility in LEIPZIG - GERMANY',
                    details: 'Flight departed',
                    location: 'LEIPZIG - GERMANY',
                    timestamp: yesterday.toISOString()
                },
                {
                    status: 'Processed at LEIPZIG - GERMANY',
                    details: 'Sort facility scan',
                    location: 'LEIPZIG - GERMANY',
                    timestamp: new Date(yesterday.getTime() - 3600000).toISOString()
                },
                {
                    status: 'Shipment picked up',
                    details: 'Courier has received package',
                    location: 'BERLIN - GERMANY',
                    timestamp: twoDaysAgo.toISOString()
                }
            ]
        };
    }

    function parseTrackingResponse(response, awb) {
        if (!response.shipments || response.shipments.length === 0) {
            throw new Error('No shipment data in response');
        }
        
        var ship = response.shipments[0];
        
        return {
            awb: awb,       // FIXED
            carrier: 'DHL', // FIXED
            status: ship.status.status,
            origin: ship.origin.address.addressLocality,
            destination: ship.destination.address.addressLocality,
            currentLocation: ship.status.location.address.addressLocality,
            timestamp: ship.status.timestamp,
            history: ship.events.map(function(evt) {
                return {
                    status: evt.status,
                    details: evt.description || evt.status,
                    location: evt.location.address.addressLocality,
                    timestamp: evt.timestamp
                };
            })
        };
    }

    window.DHLAdapter = {
        config: DHL_CONFIG,
        trackShipment: trackShipment,
        generateMockTrackingData: generateMockTrackingData
    };

})(window);