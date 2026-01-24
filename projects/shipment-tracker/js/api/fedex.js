/**
 * FedEx Track API Adapter
 * Handles communication with FedEx Track API v1
 *
 * API Docs: https://developer.fedex.com/api/en-us/catalog/track.html
 *
 * CORS LIMITATION:
 * Direct browser-to-FedEx API calls are blocked by CORS policy.
 * FedEx does not allow client-side JavaScript to call their API directly.
 *
 * Solutions:
 * 1. Use mock data (default when no credentials provided)
 * 2. Set up a server-side proxy to relay requests
 * 3. Use browser extension or Electron app (bypasses CORS)
 *
 * Current behavior:
 * - If credentials present: Attempts real API call (will fail with CORS error in browser)
 * - If no credentials: Uses mock data generator (works perfectly)
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // FEDEX API CONFIGURATION
    // ============================================================

    var FEDEX_CONFIG = {
        // API endpoint (sandbox and production)
        apiUrl: {
            sandbox: 'https://apis-sandbox.fedex.com/track/v1/trackingnumbers',
            production: 'https://apis.fedex.com/track/v1/trackingnumbers'
        },

        // OAuth endpoint
        oauthUrl: {
            sandbox: 'https://apis-sandbox.fedex.com/oauth/token',
            production: 'https://apis.fedex.com/oauth/token'
        },

        // Use sandbox by default
        useSandbox: true,

        // Batch limits
        maxAWBsPerRequest: 30,

        // Rate limits
        rateLimit: {
            requestsPerDay: 1000,
            requestsPerSecond: 5
        }
    };

    // OAuth token cache
    var oauthTokenCache = {
        token: null,
        expiresAt: null
    };

    // ============================================================
    // TRACK SHIPMENT
    // ============================================================

    /**
     * Track single shipment
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>} Tracking data
     */
    function trackShipment(awb) {
        console.log('[FedEx] Tracking shipment:', awb);

        // Check rate limit
        var rateLimitCheck = APIBase.checkRateLimit('FedEx');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error(rateLimitCheck.reason));
        }

        // Check if API credentials are available
        var hasCredentials = window.app &&
                            window.app.settings &&
                            window.app.settings.apiKeys &&
                            window.app.settings.apiKeys.FedEx &&
                            window.app.settings.apiKeys.FedEx.clientId &&
                            window.app.settings.apiKeys.FedEx.clientSecret;

        if (!hasCredentials) {
            console.log('[FedEx] No API credentials found, using mock data');
            return trackWithMockData(awb);
        }

        // Use real API if credentials are available, fall back to mock if it fails
        console.log('[FedEx] Using real API with credentials');
        return trackDirect(awb).catch(function(error) {
            console.warn('[FedEx] Real API failed (likely CORS), falling back to mock data:', error.message);
            return trackWithMockData(awb);
        });
    }

    /**
     * Track shipment with mock data (for testing without API key)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackWithMockData(awb) {
        console.log('[FedEx] Using mock data for:', awb);

        // Simulate API delay
        return new Promise(function(resolve) {
            setTimeout(function() {
                var mockData = generateMockTrackingData(awb);
                resolve(mockData);
            }, 500);
        });
    }

    /**
     * Generate mock tracking data based on AWB
     * @param {string} awb - Tracking number
     * @returns {Object}
     */
    function generateMockTrackingData(awb) {
        // Different mock scenarios based on AWB pattern
        var isDelivered = awb.includes('111111') || awb.endsWith('0');
        var isException = awb.includes('999') || awb.endsWith('9');
        var isOutForDelivery = awb.endsWith('1') || awb.endsWith('2');

        var now = new Date();
        var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        var twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        var status, deliverySignal, actualDelivery, estimatedDelivery;

        if (isDelivered) {
            status = 'Delivered';
            deliverySignal = 'DELIVERY';
            actualDelivery = yesterday.toISOString();
            estimatedDelivery = null;
        } else if (isException) {
            status = 'Exception - Delivery attempt failed';
            deliverySignal = 'EXCEPTION';
            actualDelivery = null;
            estimatedDelivery = tomorrow.toISOString();
        } else if (isOutForDelivery) {
            status = 'Out for Delivery';
            deliverySignal = 'OUT_FOR_DELIVERY';
            actualDelivery = null;
            estimatedDelivery = now.toISOString();
        } else {
            status = 'In Transit';
            deliverySignal = 'IN_TRANSIT';
            actualDelivery = null;
            estimatedDelivery = tomorrow.toISOString();
        }

        return {
            awb: awb,
            carrier: 'FedEx',
            status: status,
            deliverySignal: deliverySignal,
            delivered: isDelivered,

            // Timestamps
            dateShipped: twoDaysAgo.toISOString(),
            estimatedDelivery: estimatedDelivery,
            actualDelivery: actualDelivery,
            lastUpdated: now.toISOString(),

            // Locations
            origin: { city: 'Memphis', country: 'US', code: 'MEM' },
            destination: { city: 'New York', country: 'US', code: 'NYC' },
            currentLocation: { city: isDelivered ? 'New York' : 'Philadelphia', country: 'US', code: isDelivered ? 'NYC' : 'PHL' },

            // Service info
            service: 'FedEx Ground',
            serviceArea: {
                origin: 'TN',
                destination: 'NY'
            },

            // Events
            events: generateMockEvents(awb, isDelivered, isException),

            // Additional details
            details: {
                pieceCount: 1,
                weight: { value: 5.5, unit: 'lb' },
                proofOfDelivery: isDelivered,
                receiver: isDelivered ? 'J. Smith' : null
            },

            // Raw payload (mock)
            rawPayload: {
                trackingNumber: awb,
                mockData: true,
                note: 'This is mock data. Connect FedEx API for real tracking.'
            }
        };
    }

    /**
     * Generate mock events timeline
     * @param {string} awb - Tracking number
     * @param {boolean} isDelivered - Whether package is delivered
     * @param {boolean} isException - Whether there's an exception
     * @returns {Array}
     */
    function generateMockEvents(awb, isDelivered, isException) {
        var now = new Date();
        var events = [];

        // Delivered event
        if (isDelivered) {
            events.push({
                timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
                description: 'Delivered - Left at front door',
                location: { city: 'New York', country: 'US', code: 'NYC' },
                statusCode: 'DL'
            });
        }

        // Exception event
        if (isException) {
            events.push({
                timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
                description: 'Delivery exception - Customer not available',
                location: { city: 'New York', country: 'US', code: 'NYC' },
                statusCode: 'DE'
            });
        }

        // Out for delivery
        if (!isDelivered && !isException) {
            events.push({
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
                description: 'Out for delivery',
                location: { city: 'New York', country: 'US', code: 'NYC' },
                statusCode: 'OD'
            });
        }

        // Arrival at facility
        events.push({
            timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
            description: 'At local FedEx facility',
            location: { city: 'New York', country: 'US', code: 'NYC' },
            statusCode: 'AR'
        });

        // In transit
        events.push({
            timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
            description: 'In transit',
            location: { city: 'Philadelphia', country: 'US', code: 'PHL' },
            statusCode: 'IT'
        });

        // Picked up
        events.push({
            timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
            description: 'Picked up',
            location: { city: 'Memphis', country: 'US', code: 'MEM' },
            statusCode: 'PU'
        });

        return events;
    }

    /**
     * Track shipment via Cloudflare Worker proxy (when implemented)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackViaProxy(awb) {
        var proxyUrl = APIBase.getProxyURL('FedEx');
        var url = proxyUrl + '/track?awb=' + encodeURIComponent(awb);

        console.log('[FedEx] Using proxy:', url);

        APIBase.recordRequest('FedEx');

        return APIBase.request(url)
            .then(function(response) {
                if (response.success && response.data) {
                    return parseTrackingResponse(response.data, awb);
                } else {
                    throw new Error(response.error || 'Proxy request failed');
                }
            })
            .catch(function(error) {
                console.error('[FedEx] Proxy request failed:', error);
                throw APIBase.createAPIError('FedEx', error);
            });
    }

    /**
     * Track shipment directly (requires API key)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackDirect(awb) {
        // Get credentials from app settings
        var credentials = {
            clientId: window.app.settings.apiKeys.FedEx.clientId,
            clientSecret: window.app.settings.apiKeys.FedEx.clientSecret
        };

        var endpoint = FEDEX_CONFIG.useSandbox ? FEDEX_CONFIG.apiUrl.sandbox : FEDEX_CONFIG.apiUrl.production;

        console.log('[FedEx] Direct API call:', endpoint);

        APIBase.recordRequest('FedEx');

        // FedEx requires OAuth token first
        return getOAuthToken(credentials)
            .then(function(token) {
                return APIBase.request(endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json',
                        'X-locale': 'en_US'
                    },
                    body: {
                        trackingInfo: [{
                            trackingNumberInfo: {
                                trackingNumber: awb
                            }
                        }],
                        includeDetailedScans: true
                    }
                });
            })
            .then(function(response) {
                return parseTrackingResponse(response, awb);
            })
            .catch(function(error) {
                console.error('[FedEx] Direct API request failed:', error);
                throw APIBase.createAPIError('FedEx', error);
            });
    }

    /**
     * Get OAuth token for FedEx API (with caching)
     * @param {Object} credentials - API credentials
     * @returns {Promise<string>}
     */
    function getOAuthToken(credentials) {
        // Check if we have a valid cached token
        var now = Date.now();
        if (oauthTokenCache.token && oauthTokenCache.expiresAt && now < oauthTokenCache.expiresAt) {
            console.log('[FedEx] Using cached OAuth token (expires in ' + Math.round((oauthTokenCache.expiresAt - now) / 1000) + 's)');
            return Promise.resolve(oauthTokenCache.token);
        }

        // Request new token
        var endpoint = FEDEX_CONFIG.useSandbox ? FEDEX_CONFIG.oauthUrl.sandbox : FEDEX_CONFIG.oauthUrl.production;

        console.log('[FedEx] Requesting new OAuth token from:', endpoint);

        return APIBase.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials&client_id=' + encodeURIComponent(credentials.clientId) + '&client_secret=' + encodeURIComponent(credentials.clientSecret)
        })
            .then(function(response) {
                var expiresIn = response.expires_in || 3600; // Default 1 hour
                var bufferTime = 300; // Refresh 5 minutes early to be safe

                oauthTokenCache.token = response.access_token;
                oauthTokenCache.expiresAt = Date.now() + ((expiresIn - bufferTime) * 1000);

                console.log('[FedEx] OAuth token received and cached (expires in ' + expiresIn + 's)');
                return response.access_token;
            })
            .catch(function(error) {
                console.error('[FedEx] OAuth token request failed:', error);
                throw new Error('FedEx OAuth failed: ' + error.message);
            });
    }

    /**
     * Parse FedEx API response (placeholder for real implementation)
     * @param {Object} response - Raw FedEx API response
     * @param {string} awb - Tracking number
     * @returns {Object} Parsed tracking data
     */
    function parseTrackingResponse(response, awb) {
        console.log('[FedEx] Parsing response for', awb);

        // TODO: Implement real FedEx response parsing when API access is available
        // FedEx API returns: { output: { completeTrackResults: [...] } }

        return generateMockTrackingData(awb);
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.FedExAdapter = {
        // Configuration
        config: FEDEX_CONFIG,

        // Tracking methods
        trackShipment: trackShipment,

        // Mock data (for testing)
        generateMockTrackingData: generateMockTrackingData
    };

})(window);
