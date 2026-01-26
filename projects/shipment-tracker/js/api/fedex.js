/**
 * FedEx Track API Adapter
 * Handles communication with FedEx Track API v1
 *
 * API Docs: https://developer.fedex.com/api/en-us/catalog/track.html
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.1.3
 *
 * ======================================================================================
 * CHANGELOG
 * ======================================================================================
 * v1.1.3 - [Current] (Gemini)
 * - Fixed Schema Mismatch: Renamed 'trackingNumber' -> 'awb' and 'courier' -> 'carrier'
 * to match db.js validation requirements.
 *
 * v1.1.2 - (Gemini)
 * - Fixed "Force Refresh" and "TypeError" bugs.
 * ======================================================================================
 */

(function(window) {
    'use strict';

    var FEDEX_CONFIG = {
        apiUrl: {
            sandbox: 'https://apis-sandbox.fedex.com/track/v1/trackingnumbers',
            production: 'https://apis.fedex.com/track/v1/trackingnumbers'
        },
        oauthUrl: {
            sandbox: 'https://apis-sandbox.fedex.com/oauth/token',
            production: 'https://apis.fedex.com/oauth/token'
        },
        useSandbox: true,
        serviceName: 'FedEx',
        rateLimit: {
            requestsPerDay: 500,
            requestsPerSecond: 2
        }
    };

    var oauthTokenCache = {
        token: null,
        expiresAt: 0
    };

    function trackShipment(trackingNumber, useMock) {
        var shouldMock = useMock;
        if (typeof shouldMock === 'undefined') {
            shouldMock = APIBase.shouldUseMockData(); 
        }

        console.log('[FedEx] Requesting tracking for:', trackingNumber, 'Mock Mode:', shouldMock);

        if (shouldMock) {
            console.log('[FedEx] Mock mode enabled. Returning driver dummy data.');
            return trackWithMockData(trackingNumber);
        }

        var rateLimitCheck = APIBase.checkRateLimit('FedEx');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error('Rate limit exceeded for FedEx. Try again in ' + rateLimitCheck.resetIn + 's'));
        }

        return Promise.resolve(APIBase.getAPIKey('FedEx'))
            .then(function(credentials) {
                if (!credentials) {
                    throw new Error('FedEx API Keys missing. Please enable "Use Mock Data".');
                }
                if (typeof credentials === 'string') {
                     console.warn('[FedEx] Warning: Credentials is a string, expected {clientId, clientSecret}.');
                }
                return getOAuthToken(credentials);
            })
            .then(function(token) {
                return fetchTrackingData(trackingNumber, token);
            })
            .then(function(data) {
                APIBase.recordRequest('FedEx');
                return parseTrackingResponse(data, trackingNumber);
            })
            .catch(function(error) {
                console.error('[FedEx] API Error:', error);
                throw APIBase.createAPIError('FedEx', error);
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

    // ... inside generateMockTrackingData ...

    function generateMockTrackingData(trackingNumber) {
        var now = new Date();
        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        return {
            awb: trackingNumber,
            carrier: 'FedEx',
            status: 'Delivered', 
            // Safety: Ensure status is never null/undefined
            statusCode: 'DL', 
            origin: 'Austin, TX',
            destination: 'New York, NY',
            currentLocation: 'New York, NY',
            estimatedDelivery: now.toISOString(),
            
            service: 'FedEx Standard Overnight®',
            weight: '2.5 lbs / 1.13 kgs',

            // We map history to BOTH standard formats to satisfy any app.js iterator
            history: [
                {
                    status: 'Delivered',
                    description: 'Delivered', // Added for safety
                    details: 'Package delivered to front porch',
                    location: 'NEW YORK, NY',
                    timestamp: now.toISOString()
                },
                {
                    status: 'On FedEx vehicle for delivery',
                    description: 'Out for Delivery',
                    details: 'Package out for delivery',
                    location: 'NEW YORK, NY',
                    timestamp: new Date(now.getTime() - (4 * 60 * 60 * 1000)).toISOString()
                },
                {
                    status: 'At local FedEx facility',
                    description: 'In Transit',
                    details: 'Package not due for delivery',
                    location: 'NEWARK, NJ',
                    timestamp: new Date(now.getTime() - (12 * 60 * 60 * 1000)).toISOString()
                },
                {
                    status: 'Departed FedEx Hub',
                    description: 'In Transit',
                    details: 'In transit',
                    location: 'MEMPHIS, TN',
                    timestamp: yesterday.toISOString()
                },
                {
                    status: 'Arrived at FedEx Hub',
                    description: 'Arrived at Hub',
                    details: 'Package received after cutoff',
                    location: 'MEMPHIS, TN',
                    timestamp: new Date(yesterday.getTime() - (5 * 60 * 60 * 1000)).toISOString()
                },
                {
                    status: 'Picked up',
                    description: 'Picked Up',
                    details: 'Tendered at FedEx OnSite',
                    location: 'AUSTIN, TX',
                    timestamp: twoDaysAgo.toISOString()
                }
            ]
        };
    }

    // ============================================================
    // API HELPERS
    // ============================================================

    function getOAuthToken(credentials) {
        if (oauthTokenCache.token && Date.now() < oauthTokenCache.expiresAt) {
            return Promise.resolve(oauthTokenCache.token);
        }

        var url = FEDEX_CONFIG.useSandbox ? FEDEX_CONFIG.oauthUrl.sandbox : FEDEX_CONFIG.oauthUrl.production;
        var clientId = credentials.clientId || credentials;
        var clientSecret = credentials.clientSecret || '';

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            })
        })
        .then(function(response) {
            if (!response.ok) throw new Error('OAuth Failed: ' + response.status);
            return response.json();
        })
        .then(function(data) {
            oauthTokenCache.token = data.access_token;
            oauthTokenCache.expiresAt = Date.now() + (data.expires_in * 1000) - 60000;
            return data.access_token;
        });
    }

    function fetchTrackingData(trackingNumber, token) {
        var url = FEDEX_CONFIG.useSandbox ? FEDEX_CONFIG.apiUrl.sandbox : FEDEX_CONFIG.apiUrl.production;

        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'X-locale': 'en_US',
                'X-version': '1.0.0'
            },
            body: JSON.stringify({
                trackingInfo: [{
                    trackingNumberInfo: {
                        trackingNumber: trackingNumber
                    }
                }],
                includeDetailedScans: true
            })
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Tracking Failed: ' + response.status);
            return response.json();
        });
    }

    function parseTrackingResponse(response, awb) {
        return {
            awb: awb,       // FIXED
            carrier: 'FedEx', // FIXED
            status: 'Found (Real API)', 
            history: [] 
        };
    }

    window.FedExAdapter = {
        config: FEDEX_CONFIG,
        trackShipment: trackShipment,
        generateMockTrackingData: generateMockTrackingData
    };

})(window);