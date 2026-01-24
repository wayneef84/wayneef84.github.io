/**
 * DHL Express API Adapter
 * Handles communication with DHL Shipment Tracking API v2
 *
 * API Docs: https://developer.dhl.com/api-reference/shipment-tracking
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // DHL API CONFIGURATION
    // ============================================================

    var DHL_CONFIG = {
        // API endpoint (EU region)
        apiUrl: 'https://api-eu.dhl.com/track/shipments',

        // Batch limits
        maxAWBsPerRequest: 10,

        // Rate limits (free tier)
        rateLimit: {
            requestsPerDay: 250,
            requestsPerSecond: 2
        }
    };

    // ============================================================
    // TRACK SHIPMENT
    // ============================================================

    /**
     * Track single shipment
     * @param {string} awb - Air Waybill number
     * @returns {Promise<Object>} Tracking data
     */
    function trackShipment(awb) {
        console.log('[DHL] Tracking shipment:', awb);

        // Check rate limit
        var rateLimitCheck = APIBase.checkRateLimit('DHL');
        if (!rateLimitCheck.allowed) {
            return Promise.reject(new Error(rateLimitCheck.reason));
        }

        // Check if we have API key
        var apiKey = APIBase.getAPIKey('DHL');
        if (!apiKey) {
            console.log('[DHL] No API key found, using mock data');
            return trackWithMockData(awb);
        }

        // Decide whether to use proxy or direct API, fall back to mock on failure
        var useProxy = APIBase.shouldUseProxy('DHL');

        var trackingPromise = useProxy ? trackViaProxy(awb) : trackDirect(awb);

        return trackingPromise.catch(function(error) {
            console.warn('[DHL] Real API failed, falling back to mock data:', error.message);
            return trackWithMockData(awb);
        });
    }

    /**
     * Track shipment via Cloudflare Worker proxy
     * @param {string} awb - Air Waybill number
     * @returns {Promise<Object>}
     */
    function trackViaProxy(awb) {
        var proxyUrl = APIBase.getProxyURL('DHL');
        var url = proxyUrl + '/track?awb=' + encodeURIComponent(awb);

        console.log('[DHL] Using proxy:', url);

        // Record request for rate limiting
        APIBase.recordRequest('DHL');

        return APIBase.request(url)
            .then(function(response) {
                // Proxy wraps response in { success, data, timestamp }
                if (response.success && response.data) {
                    return parseTrackingResponse(response.data, awb);
                } else {
                    throw new Error(response.error || 'Proxy request failed');
                }
            })
            .catch(function(error) {
                console.error('[DHL] Proxy request failed:', error);
                throw APIBase.createAPIError('DHL', error);
            });
    }

    /**
     * Track shipment directly (requires API key in browser)
     * @param {string} awb - Air Waybill number
     * @returns {Promise<Object>}
     */
    function trackDirect(awb) {
        var apiKey = APIBase.getAPIKey('DHL');
        var url = DHL_CONFIG.apiUrl + '?trackingNumber=' + encodeURIComponent(awb);

        console.log('[DHL] Direct API call:', url);

        // Record request for rate limiting
        APIBase.recordRequest('DHL');

        return APIBase.request(url, {
            headers: {
                'DHL-API-Key': apiKey,
                'Accept': 'application/json'
            }
        })
            .then(function(response) {
                return parseTrackingResponse(response, awb);
            })
            .catch(function(error) {
                console.error('[DHL] Direct API request failed:', error);
                throw APIBase.createAPIError('DHL', error);
            });
    }

    /**
     * Track multiple shipments (batched)
     * @param {string[]} awbs - Array of Air Waybill numbers
     * @returns {Promise<Object[]>} Array of tracking data
     */
    function trackMultiple(awbs) {
        console.log('[DHL] Tracking multiple shipments:', awbs.length);

        // Split into batches
        var batches = [];
        for (var i = 0; i < awbs.length; i += DHL_CONFIG.maxAWBsPerRequest) {
            batches.push(awbs.slice(i, i + DHL_CONFIG.maxAWBsPerRequest));
        }

        console.log('[DHL] Split into', batches.length, 'batches');

        // Process batches sequentially (to respect rate limits)
        return batches.reduce(function(promise, batch) {
            return promise.then(function(results) {
                return processBatch(batch).then(function(batchResults) {
                    return results.concat(batchResults);
                });
            });
        }, Promise.resolve([]));
    }

    /**
     * Process batch of shipments
     * @param {string[]} batch - Batch of AWBs
     * @returns {Promise<Object[]>}
     */
    function processBatch(batch) {
        var promises = batch.map(function(awb) {
            return trackShipment(awb)
                .catch(function(error) {
                    // Don't fail entire batch if one fails
                    console.warn('[DHL] Failed to track', awb, error);
                    return {
                        awb: awb,
                        error: error.message,
                        carrier: 'DHL'
                    };
                });
        });

        return Promise.all(promises);
    }

    // ============================================================
    // RESPONSE PARSING
    // ============================================================

    /**
     * Parse DHL API response
     * @param {Object} response - Raw DHL API response
     * @param {string} awb - Air Waybill number
     * @returns {Object} Parsed tracking data
     */
    function parseTrackingResponse(response, awb) {
        console.log('[DHL] Parsing response for', awb);

        // DHL API returns { shipments: [...] }
        if (!response.shipments || response.shipments.length === 0) {
            throw new Error('No shipment data found for AWB: ' + awb);
        }

        var shipment = response.shipments[0];

        // Extract basic info
        var trackingData = {
            awb: awb,
            carrier: 'DHL',
            status: extractStatus(shipment),
            deliverySignal: extractDeliverySignal(shipment),
            delivered: isDelivered(shipment),

            // Timestamps
            dateShipped: extractDate(shipment.shipmentTimestamp),
            estimatedDelivery: extractDate(shipment.estimatedDeliveryDate),
            actualDelivery: extractActualDeliveryDate(shipment),
            lastUpdated: new Date().toISOString(),

            // Locations
            origin: extractLocation(shipment.origin),
            destination: extractLocation(shipment.destination),
            currentLocation: extractCurrentLocation(shipment),

            // Service info
            service: shipment.service || 'Unknown',
            serviceArea: extractServiceArea(shipment),

            // Events
            events: extractEvents(shipment),

            // Additional details
            details: {
                pieceCount: shipment.details?.pieceCount || 1,
                weight: extractWeight(shipment),
                proofOfDelivery: shipment.details?.proofOfDeliverySignedAvailable || false,
                receiver: shipment.details?.proofOfDeliveryName || null
            },

            // Raw payload for debugging
            rawPayload: shipment
        };

        console.log('[DHL] Parsed tracking data:', trackingData);
        return trackingData;
    }

    /**
     * Extract status text
     * @param {Object} shipment - Shipment data
     * @returns {string}
     */
    function extractStatus(shipment) {
        var status = shipment.status?.status || 'Unknown';
        var statusCode = shipment.status?.statusCode || '';

        return status + (statusCode ? ' (' + statusCode + ')' : '');
    }

    /**
     * Extract delivery signal bucket
     * @param {Object} shipment - Shipment data
     * @returns {string}
     */
    function extractDeliverySignal(shipment) {
        var statusCode = shipment.status?.statusCode || '';
        var status = shipment.status?.status?.toLowerCase() || '';

        // Map DHL status codes to delivery signals
        if (statusCode === 'delivered' || status.includes('delivered')) {
            return 'DELIVERY';
        }

        if (status.includes('out for delivery') || statusCode === 'WD') {
            return 'OUT_FOR_DELIVERY';
        }

        if (status.includes('transit') || statusCode === 'IT') {
            return 'IN_TRANSIT';
        }

        if (status.includes('pickup') || statusCode === 'PU') {
            return 'PICKUP';
        }

        if (status.includes('exception') || status.includes('delay') || statusCode === 'EX') {
            return 'EXCEPTION';
        }

        if (status.includes('returned') || status.includes('return')) {
            return 'RETURNED';
        }

        if (status.includes('failed') || status.includes('cancel')) {
            return 'FAILED';
        }

        return 'IN_TRANSIT'; // Default
    }

    /**
     * Check if shipment is delivered
     * @param {Object} shipment - Shipment data
     * @returns {boolean}
     */
    function isDelivered(shipment) {
        var statusCode = shipment.status?.statusCode || '';
        var status = shipment.status?.status?.toLowerCase() || '';

        return statusCode === 'delivered' || status.includes('delivered');
    }

    /**
     * Extract actual delivery date
     * @param {Object} shipment - Shipment data
     * @returns {string|null}
     */
    function extractActualDeliveryDate(shipment) {
        if (!isDelivered(shipment)) {
            return null;
        }

        // Check events for delivery timestamp
        if (shipment.events && shipment.events.length > 0) {
            var deliveryEvent = shipment.events.find(function(event) {
                return event.statusCode === 'delivered' ||
                       event.description?.toLowerCase().includes('delivered');
            });

            if (deliveryEvent && deliveryEvent.timestamp) {
                return extractDate(deliveryEvent.timestamp);
            }
        }

        return null;
    }

    /**
     * Extract location
     * @param {Object} location - Location data
     * @returns {Object}
     */
    function extractLocation(location) {
        if (!location) {
            return { city: null, country: null, code: null };
        }

        return {
            city: location.address?.addressLocality || null,
            country: location.address?.countryCode || null,
            code: location.servicePoint?.label || null
        };
    }

    /**
     * Extract current location from latest event
     * @param {Object} shipment - Shipment data
     * @returns {Object}
     */
    function extractCurrentLocation(shipment) {
        if (!shipment.events || shipment.events.length === 0) {
            return { city: null, country: null, code: null };
        }

        var latestEvent = shipment.events[0]; // Events are sorted newest first

        return {
            city: latestEvent.location?.address?.addressLocality || null,
            country: latestEvent.location?.address?.countryCode || null,
            code: latestEvent.location?.servicePoint?.label || null
        };
    }

    /**
     * Extract service area
     * @param {Object} shipment - Shipment data
     * @returns {Object}
     */
    function extractServiceArea(shipment) {
        return {
            origin: shipment.origin?.serviceArea?.code || null,
            destination: shipment.destination?.serviceArea?.code || null
        };
    }

    /**
     * Extract events timeline
     * @param {Object} shipment - Shipment data
     * @returns {Array}
     */
    function extractEvents(shipment) {
        if (!shipment.events || shipment.events.length === 0) {
            return [];
        }

        return shipment.events.map(function(event) {
            return {
                timestamp: extractDate(event.timestamp),
                description: event.description || 'Unknown event',
                location: extractLocation(event.location),
                statusCode: event.statusCode || null
            };
        });
    }

    /**
     * Extract weight
     * @param {Object} shipment - Shipment data
     * @returns {Object|null}
     */
    function extractWeight(shipment) {
        if (!shipment.details || !shipment.details.weight) {
            return null;
        }

        return {
            value: shipment.details.weight.value || 0,
            unit: shipment.details.weight.unit || 'kg'
        };
    }

    /**
     * Extract and format date
     * @param {string} dateString - ISO date string
     * @returns {string|null}
     */
    function extractDate(dateString) {
        if (!dateString) {
            return null;
        }

        try {
            return new Date(dateString).toISOString();
        } catch (e) {
            console.warn('[DHL] Invalid date format:', dateString);
            return null;
        }
    }

    // ============================================================
    // MOCK DATA (for testing without API key)
    // ============================================================

    /**
     * Track shipment with mock data (for testing without API key)
     * @param {string} awb - Tracking number
     * @returns {Promise<Object>}
     */
    function trackWithMockData(awb) {
        console.log('[DHL] Using mock data for:', awb);

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
        var isDelivered = awb.includes('0000') || awb.endsWith('0');
        var isException = awb.includes('9999') || awb.endsWith('9');
        var isInTransit = !isDelivered && !isException;

        var now = new Date();
        var yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        var tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        var twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        var threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

        var status, deliverySignal, actualDelivery, estimatedDelivery, events;

        if (isDelivered) {
            status = 'Delivered';
            deliverySignal = 'delivered';
            actualDelivery = yesterday.toISOString();
            estimatedDelivery = null;
            events = [
                {
                    timestamp: threeDaysAgo.toISOString(),
                    description: 'Shipment picked up',
                    location: { city: 'Los Angeles', state: 'CA', country: 'US' }
                },
                {
                    timestamp: twoDaysAgo.toISOString(),
                    description: 'Departed from facility',
                    location: { city: 'Los Angeles', state: 'CA', country: 'US' }
                },
                {
                    timestamp: yesterday.toISOString(),
                    description: 'Delivered - Signed by RESIDENT',
                    location: { city: 'New York', state: 'NY', country: 'US' }
                }
            ];
        } else if (isException) {
            status = 'Exception - Customs hold';
            deliverySignal = 'exception';
            actualDelivery = null;
            estimatedDelivery = tomorrow.toISOString();
            events = [
                {
                    timestamp: threeDaysAgo.toISOString(),
                    description: 'Shipment picked up',
                    location: { city: 'Hong Kong', country: 'HK' }
                },
                {
                    timestamp: yesterday.toISOString(),
                    description: 'Held at customs - additional documentation required',
                    location: { city: 'New York', state: 'NY', country: 'US' }
                }
            ];
        } else {
            status = 'In Transit';
            deliverySignal = 'active';
            actualDelivery = null;
            estimatedDelivery = tomorrow.toISOString();
            events = [
                {
                    timestamp: twoDaysAgo.toISOString(),
                    description: 'Shipment picked up',
                    location: { city: 'Chicago', state: 'IL', country: 'US' }
                },
                {
                    timestamp: yesterday.toISOString(),
                    description: 'Arrived at DHL facility',
                    location: { city: 'Cleveland', state: 'OH', country: 'US' }
                }
            ];
        }

        return {
            awb: awb,
            carrier: 'DHL',
            status: status,
            deliverySignal: deliverySignal,
            origin: { city: 'Los Angeles', state: 'CA', country: 'US', postalCode: '90001' },
            destination: { city: 'New York', state: 'NY', country: 'US', postalCode: '10001' },
            estimatedDelivery: estimatedDelivery,
            actualDelivery: actualDelivery,
            events: events,
            dateShipped: threeDaysAgo.toISOString(),
            lastUpdated: now.toISOString(),
            delivered: isDelivered,
            note: '[MOCK DATA] This is simulated tracking data for testing purposes.',
            tags: ['mock'],
            rawPayloadId: null
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.DHLAdapter = {
        // Configuration
        config: DHL_CONFIG,

        // Tracking methods
        trackShipment: trackShipment,
        trackMultiple: trackMultiple,

        // Mock data (for testing)
        generateMockTrackingData: generateMockTrackingData,

        // Parsing (exposed for testing)
        parseTrackingResponse: parseTrackingResponse
    };

})(window);
