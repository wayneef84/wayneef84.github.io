/**
 * UPS Track API Adapter
 * Handles communication with UPS Track API v1
 *
 * API Docs: https://developer.ups.com/api/reference
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // UPS API CONFIGURATION
    // ============================================================

    var UPS_CONFIG = {
        // API endpoint (test and production)
        apiUrl: {
            test: 'https://wwwcie.ups.com/api/track/v1/details',
            production: 'https://onlinetools.ups.com/api/track/v1/details'
        },

        // OAuth endpoint
        oauthUrl: {
            test: 'https://wwwcie.ups.com/security/v1/oauth/token',
            production: 'https://onlinetools.ups.com/security/v1/oauth/token'
        },

        // Use test environment by default
        useTest: true,

        // Batch limits
        maxAWBsPerRequest: 100,

        // Rate limits
        rateLimit: {
            requestsPerDay: 500,
            requestsPerSecond: 2
        }
    };

    // ============================================================
    // TRACK SHIPMENT
    // ============================================================

    /**
     * Track single shipment
     * @param {string} awb - Tracking number (1Z format)
     * @returns {Promise<Object>} Tracking data
     */
    function trackShipment(awb) {
        console.log('[UPS] Tracking shipment:', awb);

        // Check rate limit
        var rateLimitCheck = APIBase.checkRateLimit('UPS');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error(rateLimitCheck.reason));
        }

        // Check if we have API credentials
        var hasCredentials = window.app &&
                            window.app.settings &&
                            window.app.settings.apiKeys &&
                            window.app.settings.apiKeys.UPS &&
                            window.app.settings.apiKeys.UPS.apiKey &&
                            window.app.settings.apiKeys.UPS.username;

        if (!hasCredentials) {
            console.log('[UPS] No API credentials found, using mock data');
            return trackWithMockData(awb);
        }

        // Use real API if credentials are available, fall back to mock on failure
        console.log('[UPS] Using real API with credentials');
        var useProxy = APIBase.shouldUseProxy('UPS');
        var trackingPromise = useProxy ? trackViaProxy(awb) : trackDirect(awb);

        return trackingPromise.catch(function(error) {
            console.warn('[UPS] Real API failed, falling back to mock data:', error.message);
            return trackWithMockData(awb);
        });
    }

    /**
     * Track shipment with mock data (for testing without API key)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackWithMockData(awb) {
        console.log('[UPS] Using mock data for:', awb);

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
        var lastChar = awb.charAt(awb.length - 1);
        var isDelivered = lastChar === '0' || lastChar === '5';
        var isException = lastChar === '9' || lastChar === '8';
        var isOutForDelivery = lastChar === '1' || lastChar === '2' || lastChar === '3';

        var now = new Date();
        var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        var threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

        var status, deliverySignal, actualDelivery, estimatedDelivery;

        if (isDelivered) {
            status = 'Delivered';
            deliverySignal = 'DELIVERY';
            actualDelivery = yesterday.toISOString();
            estimatedDelivery = null;
        } else if (isException) {
            status = 'Exception - Address unknown';
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
            carrier: 'UPS',
            status: status,
            deliverySignal: deliverySignal,
            delivered: isDelivered,

            // Timestamps
            dateShipped: threeDaysAgo.toISOString(),
            estimatedDelivery: estimatedDelivery,
            actualDelivery: actualDelivery,
            lastUpdated: now.toISOString(),

            // Locations
            origin: { city: 'Atlanta', country: 'US', code: 'ATL' },
            destination: { city: 'Boston', country: 'US', code: 'BOS' },
            currentLocation: { city: isDelivered ? 'Boston' : 'Hartford', country: 'US', code: isDelivered ? 'BOS' : 'HFD' },

            // Service info
            service: 'UPS Ground',
            serviceArea: {
                origin: 'GA',
                destination: 'MA'
            },

            // Events
            events: generateMockEvents(awb, isDelivered, isException),

            // Additional details
            details: {
                pieceCount: 1,
                weight: { value: 3.2, unit: 'lb' },
                proofOfDelivery: isDelivered,
                receiver: isDelivered ? 'Recipient Signature' : null
            },

            // Raw payload (mock)
            rawPayload: {
                trackingNumber: awb,
                mockData: true,
                note: 'This is mock data. Connect UPS API for real tracking.'
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
                description: 'Delivered',
                location: { city: 'Boston', country: 'US', code: 'BOS' },
                statusCode: 'D'
            });
        }

        // Exception event
        if (isException) {
            events.push({
                timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
                description: 'Exception - Address correction required',
                location: { city: 'Boston', country: 'US', code: 'BOS' },
                statusCode: 'X'
            });
        }

        // Out for delivery
        if (!isDelivered && !isException) {
            events.push({
                timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
                description: 'Out for delivery',
                location: { city: 'Boston', country: 'US', code: 'BOS' },
                statusCode: 'OD'
            });
        }

        // Arrival scan
        events.push({
            timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
            description: 'Arrival scan at facility',
            location: { city: 'Boston', country: 'US', code: 'BOS' },
            statusCode: 'AR'
        });

        // Departure scan
        events.push({
            timestamp: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(),
            description: 'Departure scan',
            location: { city: 'Hartford', country: 'US', code: 'HFD' },
            statusCode: 'DP'
        });

        // In transit
        events.push({
            timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
            description: 'In transit',
            location: { city: 'Louisville', country: 'US', code: 'SDF' },
            statusCode: 'IT'
        });

        // Origin scan
        events.push({
            timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
            description: 'Origin scan',
            location: { city: 'Atlanta', country: 'US', code: 'ATL' },
            statusCode: 'OR'
        });

        return events;
    }

    /**
     * Track shipment via Cloudflare Worker proxy (when implemented)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackViaProxy(awb) {
        var proxyUrl = APIBase.getProxyURL('UPS');
        var url = proxyUrl + '/track?awb=' + encodeURIComponent(awb);

        console.log('[UPS] Using proxy:', url);

        APIBase.recordRequest('UPS');

        return APIBase.request(url)
            .then(function(response) {
                if (response.success && response.data) {
                    return parseTrackingResponse(response.data, awb);
                } else {
                    throw new Error(response.error || 'Proxy request failed');
                }
            })
            .catch(function(error) {
                console.error('[UPS] Proxy request failed:', error);
                throw APIBase.createAPIError('UPS', error);
            });
    }

    /**
     * Track shipment directly (requires API key)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackDirect(awb) {
        var apiKey = APIBase.getAPIKey('UPS');
        var endpoint = UPS_CONFIG.useTest ? UPS_CONFIG.apiUrl.test : UPS_CONFIG.apiUrl.production;
        var trackingUrl = endpoint + '/' + encodeURIComponent(awb);

        console.log('[UPS] Direct API call:', trackingUrl);

        APIBase.recordRequest('UPS');

        // UPS requires OAuth token first
        return getOAuthToken(apiKey)
            .then(function(token) {
                return APIBase.request(trackingUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json',
                        'transId': 'shipment-tracker-' + Date.now(),
                        'transactionSrc': 'shipment-tracker'
                    }
                });
            })
            .then(function(response) {
                return parseTrackingResponse(response, awb);
            })
            .catch(function(error) {
                console.error('[UPS] Direct API request failed:', error);
                throw APIBase.createAPIError('UPS', error);
            });
    }

    /**
     * Get OAuth token for UPS API
     * @param {Object} credentials - API credentials
     * @returns {Promise<string>}
     */
    function getOAuthToken(credentials) {
        var endpoint = UPS_CONFIG.useTest ? UPS_CONFIG.oauthUrl.test : UPS_CONFIG.oauthUrl.production;

        return APIBase.request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(credentials.clientId + ':' + credentials.clientSecret)
            },
            body: 'grant_type=client_credentials'
        })
            .then(function(response) {
                return response.access_token;
            });
    }

    /**
     * Parse UPS API response (placeholder for real implementation)
     * @param {Object} response - Raw UPS API response
     * @param {string} awb - Tracking number
     * @returns {Object} Parsed tracking data
     */
    function parseTrackingResponse(response, awb) {
        console.log('[UPS] Parsing response for', awb);

        // TODO: Implement real UPS response parsing when API access is available
        // UPS API returns: { trackResponse: { shipment: [...] } }

        return generateMockTrackingData(awb);
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.UPSAdapter = {
        // Configuration
        config: UPS_CONFIG,

        // Tracking methods
        trackShipment: trackShipment,

        // Mock data (for testing)
        generateMockTrackingData: generateMockTrackingData
    };

})(window);
