/**
 * UPS Track API Adapter
 * Handles communication with UPS Track API v1
 *
 * API Docs: https://developer.ups.com/api/reference
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.1.2
 *
 * ======================================================================================
 * CHANGELOG
 * ======================================================================================
 * v1.1.2 - [Current] (Gemini)
 * - Fixed "Force Refresh" bug by checking global mock settings if flag is undefined.
 * - Added Promise wrapper for API Key retrieval.
 *
 * v1.1.0 - (Gemini)
 * - Fixed "Always On" mock data bug.
 * - Added "Driver Personality": Mock data now reflects UPS Worldport (Louisville, KY).
 * - Implemented strict error handling for missing credentials.
 *
 * v1.0.0 - (Claude)
 * - Initial implementation.
 * ======================================================================================
 */

(function(window) {
    'use strict';

    // ============================================================
    // UPS API CONFIGURATION
    // ============================================================

    var UPS_CONFIG = {
        // API endpoints for Test (CIE) and Production environments
        apiUrl: {
            test: 'https://wwwcie.ups.com/api/track/v1/details',
            production: 'https://onlinetools.ups.com/api/track/v1/details'
        },
        // OAuth token endpoints
        oauthUrl: {
            test: 'https://wwwcie.ups.com/security/v1/oauth/token',
            production: 'https://onlinetools.ups.com/security/v1/oauth/token'
        },
        // Environment Toggle
        useTest: true,
        // Batch processing limits
        maxAWBsPerRequest: 100,
        // API Rate Limits (Standard Tier)
        rateLimit: {
            requestsPerDay: 500,
            requestsPerSecond: 2
        }
    };

    // ============================================================
    // TRACK SHIPMENT MAIN LOGIC
    // ============================================================

    /**
     * Track a single shipment by AWB (Tracking Number)
     *
     * @param {string} awb - The UPS tracking number (typically starts with 1Z...)
     * @param {boolean} useMock - Explicit flag from UI. If undefined, falls back to global.
     * @returns {Promise<Object>} A Promise resolving to the standardized shipment object.
     */
    function trackShipment(awb, useMock) {
        // ROBUSTNESS FIX: Handle undefined useMock (e.g. Force Refresh)
        var shouldMock = useMock;
        if (typeof shouldMock === 'undefined') {
            shouldMock = APIBase.shouldUseMockData();
        }

        console.log('[UPS] Tracking shipment:', awb, 'Mock Mode:', shouldMock);

        // 1. STRICT MOCK CHECK
        if (shouldMock) {
            console.log('[UPS] Mock mode enabled. Returning driver dummy data.');
            return trackWithMockData(awb);
        }

        // 2. RATE LIMIT CHECK
        var rateLimitCheck = APIBase.checkRateLimit('UPS');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error('Rate limit exceeded for UPS. Try again in ' + rateLimitCheck.resetIn + 's'));
        }

        // 3. REAL API CALL
        // Note: This flow requires the Backend Proxy to be active to avoid CORS errors.
        // We use Promise.resolve to safely handle the key retrieval.
        return Promise.resolve(APIBase.getAPIKey('UPS'))
            .then(function(credentials) {
                // If we are here, Mock Mode is OFF, so we MUST have credentials.
                if (!credentials) {
                    throw new Error('UPS Credentials missing. Please add keys or enable "Use Mock Data".');
                }
                return getOAuthToken(credentials);
            })
            .then(function(token) {
                return fetchTrackingData(awb, token);
            })
            .then(function(data) {
                APIBase.recordRequest('UPS');
                return parseTrackingResponse(data, awb);
            })
            .catch(function(error) {
                console.error('[UPS] API Error:', error);
                throw APIBase.createAPIError('UPS', error);
            });
    }

    /**
     * Simulates an API network delay before returning mock data.
     */
    function trackWithMockData(awb) {
        return new Promise(function(resolve) {
            // 800ms delay to simulate network latency
            setTimeout(function() {
                resolve(generateMockTrackingData(awb));
            }, 800);
        });
    }

    // ============================================================
    // MOCK DATA GENERATOR (Driver Specific: Louisville Worldport)
    // ============================================================

    /**
     * Generates realistic mock tracking data for UPS.
     * Simulates a package passing through the main UPS Worldport hub in Louisville, KY.
     */
    function generateMockTrackingData(awb) {
        var now = new Date();
        var fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
        var yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        var twoDaysAgo = new Date(now);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // Standard UPS status logic
        var status = 'On the Way';
        var delivered = false;

        // Easter Egg: Ending a tracking number with 'd' forces a "Delivered" status
        if (awb.toLowerCase().endsWith('d')) {
            status = 'Delivered';
            delivered = true;
        }

        // Generate history mimicking a standard UPS route (Label -> Origin -> Hub -> Destination)
        var events = [
            {
                timestamp: now.toISOString(),
                description: status === 'Delivered' ? 'DELIVERED' : 'Departed from Facility',
                location: { city: 'Louisville', state: 'KY', country: 'US' } // The famous UPS Worldport
            },
            {
                timestamp: fourHoursAgo.toISOString(),
                description: 'Arrived at Facility',
                location: { city: 'Louisville', state: 'KY', country: 'US' }
            },
            {
                timestamp: yesterday.toISOString(),
                description: 'Origin Scan',
                location: { city: 'Hodgkins', state: 'IL', country: 'US' } // CACH (major ground hub)
            },
            {
                timestamp: twoDaysAgo.toISOString(),
                description: 'Label Created',
                location: { city: 'Chicago', state: 'IL', country: 'US' }
            }
        ];

        return {
            awb: awb,
            carrier: 'UPS',
            status: status,
            origin: { city: 'Chicago', state: 'IL', country: 'US' },
            destination: { city: 'Miami', state: 'FL', country: 'US' },
            estimatedDelivery: new Date(now.getTime() + 86400000).toISOString(), // Estimated delivery: Tomorrow
            events: events,
            delivered: delivered,
            note: '[MOCK DATA] UPS Worldport Simulation',
            tags: ['mock', 'driver-sim']
        };
    }

    // ============================================================
    // API HELPERS (Real Implementation Stubs)
    // ============================================================

    /**
     * Authenticates with UPS to get an OAuth Bearer Token.
     */
    function getOAuthToken(credentials) {
        // If strict mode is on but no proxy is configured, fail immediately
        if (!APIBase.config.useProxy) {
            return Promise.reject(new Error("CORS Protection: Cannot call UPS directly from browser. Please enable Mock Data or configure Proxy."));
        }
        return Promise.resolve("mock_token_" + Date.now());
    }

    /**
     * Fetches tracking data using the auth token.
     */
    function fetchTrackingData(awb, token) {
        // This will fail without a proxy due to UPS security policies
        return Promise.reject(new Error("Real UPS tracking requires configured Cloudflare Worker."));
    }

    /**
     * Normalizes the complex UPS JSON response into our app's standard format.
     */
    function parseTrackingResponse(response, awb) {
        // Fallback for now until live data is hooked up
        return generateMockTrackingData(awb);
    }

    // ============================================================
    // PUBLIC EXPORTS
    // ============================================================

    window.UPSAdapter = {
        config: UPS_CONFIG,
        trackShipment: trackShipment,
        generateMockTrackingData: generateMockTrackingData
    };

})(window);