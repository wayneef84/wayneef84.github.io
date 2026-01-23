/**
 * Payload Normalizer
 * Converts carrier-specific API responses to standardized format
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // DELIVERY SIGNAL BUCKETS
    // ============================================================

    var DELIVERY_SIGNALS = {
        PICKUP: 'PICKUP',              // Awaiting pickup
        IN_TRANSIT: 'IN_TRANSIT',      // In transit
        OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY', // Out for delivery
        DELIVERY: 'DELIVERY',          // Delivered
        EXCEPTION: 'EXCEPTION',        // Exception/delay
        FAILED: 'FAILED',              // Delivery failed
        RETURNED: 'RETURNED'           // Returned to sender
    };

    // ============================================================
    // NORMALIZE TRACKING DATA
    // ============================================================

    /**
     * Normalize tracking data from any carrier
     * @param {Object} data - Raw tracking data from carrier adapter
     * @param {string} carrier - Carrier name (DHL, FedEx, UPS)
     * @returns {Object} Normalized tracking record
     */
    function normalize(data, carrier) {
        console.log('[Normalizer] Normalizing data from', carrier);

        // Data is already partially normalized by adapter
        // This function ensures all required fields exist

        var normalized = {
            // Primary key
            awb: data.awb,
            carrier: carrier || data.carrier,

            // Status
            status: data.status || 'Unknown',
            deliverySignal: validateDeliverySignal(data.deliverySignal),
            delivered: !!data.delivered,

            // Timestamps
            dateShipped: data.dateShipped || null,
            estimatedDelivery: data.estimatedDelivery || null,
            actualDelivery: data.actualDelivery || null,
            lastUpdated: new Date().toISOString(),
            lastChecked: new Date().toISOString(),

            // Locations
            origin: normalizeLocation(data.origin),
            destination: normalizeLocation(data.destination),
            currentLocation: normalizeLocation(data.currentLocation),

            // Service info
            service: data.service || 'Unknown',
            serviceArea: data.serviceArea || {},

            // Events
            events: normalizeEvents(data.events || []),

            // Additional details
            details: normalizeDetails(data.details || {}),

            // Metadata
            metadata: {
                queriesCount: 1,
                firstQueried: new Date().toISOString(),
                source: carrier + ' API'
            }
        };

        console.log('[Normalizer] Normalized data:', normalized);
        return normalized;
    }

    /**
     * Validate delivery signal bucket
     * @param {string} signal - Delivery signal
     * @returns {string}
     */
    function validateDeliverySignal(signal) {
        if (!signal || !DELIVERY_SIGNALS[signal]) {
            console.warn('[Normalizer] Invalid delivery signal:', signal, '- defaulting to IN_TRANSIT');
            return DELIVERY_SIGNALS.IN_TRANSIT;
        }
        return signal;
    }

    /**
     * Normalize location data
     * @param {Object} location - Location data
     * @returns {Object}
     */
    function normalizeLocation(location) {
        if (!location) {
            return { city: null, country: null, code: null };
        }

        return {
            city: location.city || null,
            country: location.country || null,
            code: location.code || null
        };
    }

    /**
     * Normalize events array
     * @param {Array} events - Events array
     * @returns {Array}
     */
    function normalizeEvents(events) {
        if (!Array.isArray(events)) {
            return [];
        }

        return events.map(function(event) {
            return {
                timestamp: event.timestamp || new Date().toISOString(),
                description: event.description || 'Unknown event',
                location: normalizeLocation(event.location),
                statusCode: event.statusCode || null
            };
        });
    }

    /**
     * Normalize details object
     * @param {Object} details - Details object
     * @returns {Object}
     */
    function normalizeDetails(details) {
        return {
            pieceCount: details.pieceCount || 1,
            weight: normalizeWeight(details.weight),
            proofOfDelivery: !!details.proofOfDelivery,
            receiver: details.receiver || null
        };
    }

    /**
     * Normalize weight
     * @param {Object} weight - Weight object
     * @returns {Object|null}
     */
    function normalizeWeight(weight) {
        if (!weight || typeof weight.value === 'undefined') {
            return null;
        }

        return {
            value: parseFloat(weight.value) || 0,
            unit: weight.unit || 'kg'
        };
    }

    // ============================================================
    // MERGE UPDATES
    // ============================================================

    /**
     * Merge new tracking data with existing record
     * @param {Object} existing - Existing tracking record
     * @param {Object} update - New tracking data
     * @returns {Object} Merged record
     */
    function mergeUpdate(existing, update) {
        console.log('[Normalizer] Merging update for', existing.awb);

        // Preserve metadata
        var queriesCount = (existing.metadata?.queriesCount || 0) + 1;
        var firstQueried = existing.metadata?.firstQueried || new Date().toISOString();

        // Merge events (avoid duplicates)
        var existingEvents = existing.events || [];
        var newEvents = update.events || [];
        var mergedEvents = mergeEvents(existingEvents, newEvents);

        // Create merged record
        var merged = {
            // Keep existing AWB and carrier
            awb: existing.awb,
            carrier: existing.carrier,

            // Update status (always use latest)
            status: update.status || existing.status,
            deliverySignal: update.deliverySignal || existing.deliverySignal,
            delivered: update.delivered !== undefined ? update.delivered : existing.delivered,

            // Update timestamps
            dateShipped: update.dateShipped || existing.dateShipped,
            estimatedDelivery: update.estimatedDelivery || existing.estimatedDelivery,
            actualDelivery: update.actualDelivery || existing.actualDelivery,
            lastUpdated: new Date().toISOString(),
            lastChecked: new Date().toISOString(),

            // Update locations (prefer new if available)
            origin: update.origin || existing.origin,
            destination: update.destination || existing.destination,
            currentLocation: update.currentLocation || existing.currentLocation,

            // Update service info
            service: update.service || existing.service,
            serviceArea: update.serviceArea || existing.serviceArea,

            // Merged events
            events: mergedEvents,

            // Update details
            details: mergeDetails(existing.details, update.details),

            // Update metadata
            metadata: {
                queriesCount: queriesCount,
                firstQueried: firstQueried,
                source: update.metadata?.source || existing.metadata?.source
            }
        };

        console.log('[Normalizer] Merged record:', merged);
        return merged;
    }

    /**
     * Merge events arrays (avoid duplicates)
     * @param {Array} existing - Existing events
     * @param {Array} newEvents - New events
     * @returns {Array}
     */
    function mergeEvents(existing, newEvents) {
        var merged = existing.slice(); // Copy existing

        newEvents.forEach(function(newEvent) {
            // Check if event already exists (by timestamp + description)
            var isDuplicate = merged.some(function(existingEvent) {
                return existingEvent.timestamp === newEvent.timestamp &&
                       existingEvent.description === newEvent.description;
            });

            if (!isDuplicate) {
                merged.push(newEvent);
            }
        });

        // Sort by timestamp (newest first)
        merged.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        return merged;
    }

    /**
     * Merge details objects
     * @param {Object} existing - Existing details
     * @param {Object} update - New details
     * @returns {Object}
     */
    function mergeDetails(existing, update) {
        if (!existing && !update) {
            return {};
        }

        if (!existing) {
            return update;
        }

        if (!update) {
            return existing;
        }

        return {
            pieceCount: update.pieceCount !== undefined ? update.pieceCount : existing.pieceCount,
            weight: update.weight || existing.weight,
            proofOfDelivery: update.proofOfDelivery !== undefined ? update.proofOfDelivery : existing.proofOfDelivery,
            receiver: update.receiver || existing.receiver
        };
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    /**
     * Validate normalized tracking record
     * @param {Object} data - Tracking record
     * @returns {Object} { valid: boolean, errors: string[] }
     */
    function validate(data) {
        var errors = [];

        // Required fields
        if (!data.awb) {
            errors.push('Missing AWB');
        }

        if (!data.carrier) {
            errors.push('Missing carrier');
        }

        if (!data.deliverySignal || !DELIVERY_SIGNALS[data.deliverySignal]) {
            errors.push('Invalid delivery signal: ' + data.deliverySignal);
        }

        // Validate events
        if (data.events && !Array.isArray(data.events)) {
            errors.push('Events must be an array');
        }

        // Validate timestamps
        if (data.dateShipped && !isValidDate(data.dateShipped)) {
            errors.push('Invalid dateShipped: ' + data.dateShipped);
        }

        if (data.estimatedDelivery && !isValidDate(data.estimatedDelivery)) {
            errors.push('Invalid estimatedDelivery: ' + data.estimatedDelivery);
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Check if date string is valid ISO 8601
     * @param {string} dateString - Date string
     * @returns {boolean}
     */
    function isValidDate(dateString) {
        if (!dateString) {
            return false;
        }

        var date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    // ============================================================
    // EXPORT FOR STORAGE
    // ============================================================

    /**
     * Prepare tracking record for IndexedDB storage
     * @param {Object} data - Normalized tracking data
     * @param {Object} rawPayload - Raw API response
     * @returns {Object} Record ready for storage
     */
    function prepareForStorage(data, rawPayload) {
        // Validate first
        var validation = validate(data);
        if (!validation.valid) {
            console.error('[Normalizer] Validation failed:', validation.errors);
            throw new Error('Invalid tracking data: ' + validation.errors.join(', '));
        }

        // Return storage-ready record
        return {
            // Normalized data
            ...data,

            // Add storage metadata
            _version: 1,
            _normalized: true
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.Normalizer = {
        // Constants
        DELIVERY_SIGNALS: DELIVERY_SIGNALS,

        // Normalization
        normalize: normalize,
        mergeUpdate: mergeUpdate,

        // Validation
        validate: validate,

        // Storage
        prepareForStorage: prepareForStorage
    };

})(window);
