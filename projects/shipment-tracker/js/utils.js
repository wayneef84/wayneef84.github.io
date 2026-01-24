/**
 * Utility Functions
 * Helper functions for formatting, validation, and data manipulation
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // DATE/TIME FORMATTING
    // ============================================================

    /**
     * Format ISO date string to readable format
     * @param {string} isoString - ISO 8601 date string
     * @param {string} format - Format type ('short', 'long', 'relative')
     * @returns {string}
     */
    function formatDate(isoString, format) {
        if (!isoString) {
            return 'N/A';
        }

        format = format || 'short';
        var date = new Date(isoString);

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        // Check for Unix epoch (1970-01-01 or earlier) - indicates unset/new tracking
        if (date.getTime() <= 0) {
            return 'Not yet checked';
        }

        switch (format) {
            case 'short':
                // Jan 23, 2026
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

            case 'long':
                // January 23, 2026 at 10:30 AM
                return date.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }) + ' at ' + date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });

            case 'relative':
                // 2 hours ago
                return formatRelativeTime(date);

            case 'time':
                // 10:30 AM
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });

            default:
                return date.toLocaleDateString();
        }
    }

    /**
     * Format date as relative time (e.g., "2 hours ago")
     * @param {Date} date - Date object
     * @returns {string}
     */
    function formatRelativeTime(date) {
        var now = new Date();
        var diff = now - date;
        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return minutes + ' minute' + (minutes !== 1 ? 's' : '') + ' ago';
        } else if (hours < 24) {
            return hours + ' hour' + (hours !== 1 ? 's' : '') + ' ago';
        } else if (days < 7) {
            return days + ' day' + (days !== 1 ? 's' : '') + ' ago';
        } else {
            return formatDate(date.toISOString(), 'short');
        }
    }

    /**
     * Calculate days until delivery
     * @param {string} estimatedDelivery - ISO date string
     * @returns {number|null} Days remaining (negative if overdue)
     */
    function daysUntilDelivery(estimatedDelivery) {
        if (!estimatedDelivery) {
            return null;
        }

        var now = new Date();
        var delivery = new Date(estimatedDelivery);

        if (isNaN(delivery.getTime())) {
            return null;
        }

        var diff = delivery - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // ============================================================
    // AWB VALIDATION
    // ============================================================

    /**
     * Validate Air Waybill (tracking number) format
     * @param {string} awb - Tracking number
     * @param {string} carrier - Carrier name (optional)
     * @returns {Object} { valid: boolean, error: string }
     */
    function validateAWB(awb, carrier) {
        if (!awb || typeof awb !== 'string') {
            return { valid: false, error: 'AWB is required' };
        }

        awb = awb.trim();

        // General validation (10-40 characters)
        if (awb.length < 10 || awb.length > 40) {
            return { valid: false, error: 'AWB must be 10-40 characters' };
        }

        // Alphanumeric only
        if (!/^[A-Za-z0-9]+$/.test(awb)) {
            return { valid: false, error: 'AWB must be alphanumeric' };
        }

        // Carrier-specific validation
        if (carrier) {
            return validateCarrierAWB(awb, carrier);
        }

        return { valid: true };
    }

    /**
     * Validate AWB for specific carrier
     * @param {string} awb - Tracking number
     * @param {string} carrier - Carrier name
     * @returns {Object}
     */
    function validateCarrierAWB(awb, carrier) {
        switch (carrier.toUpperCase()) {
            case 'DHL':
                // DHL: 10 digits
                if (!/^\d{10}$/.test(awb)) {
                    return { valid: false, error: 'DHL AWB must be 10 digits' };
                }
                break;

            case 'FEDEX':
                // FedEx: 12 or 15 digits
                if (!/^\d{12}$/.test(awb) && !/^\d{15}$/.test(awb)) {
                    return { valid: false, error: 'FedEx AWB must be 12 or 15 digits' };
                }
                break;

            case 'UPS':
                // UPS: 18 characters (1Z + 16 alphanumeric)
                if (!/^1Z[A-Z0-9]{16}$/i.test(awb)) {
                    return { valid: false, error: 'UPS AWB must start with 1Z and be 18 characters' };
                }
                break;
        }

        return { valid: true };
    }

    /**
     * Detect carrier from AWB format
     * @param {string} awb - Tracking number
     * @returns {string|null} Carrier name or null
     */
    function detectCarrier(awb) {
        if (!awb) {
            return null;
        }

        awb = awb.trim();

        // UPS (starts with 1Z)
        if (/^1Z/i.test(awb)) {
            return 'UPS';
        }

        // FedEx (12 or 15 digits)
        if (/^\d{12}$/.test(awb) || /^\d{15}$/.test(awb)) {
            return 'FedEx';
        }

        // DHL (10 digits)
        if (/^\d{10}$/.test(awb)) {
            return 'DHL';
        }

        return null;
    }

    /**
     * Get carrier tracking URL
     * @param {string} carrier - Carrier name (DHL, FedEx, UPS)
     * @param {string} awb - Tracking number
     * @returns {string|null} Tracking URL or null
     */
    function getCarrierTrackingURL(carrier, awb) {
        if (!carrier || !awb) {
            return null;
        }

        carrier = carrier.toUpperCase();
        awb = encodeURIComponent(awb.trim());

        var urls = {
            'DHL': 'https://www.dhl.com/en/express/tracking.html?AWB=' + awb + '&brand=DHL',
            'FEDEX': 'https://www.fedex.com/fedextrack/?trknbr=' + awb,
            'UPS': 'https://www.ups.com/track?tracknum=' + awb
        };

        return urls[carrier] || null;
    }

    /**
     * Truncate AWB for mobile display with tiered thresholds
     * Formula: first 3 chars + "..." + last X chars
     * Where X = threshold - 3 - 2 (3 for prefix, 2 for "...")
     *
     * @param {string} awb - Tracking number
     * @param {boolean} isMobile - Whether to apply mobile truncation
     * @returns {string} Truncated or full AWB
     */
    function truncateAWB(awb, isMobile) {
        if (!awb || !isMobile) {
            return awb;
        }

        var length = awb.length;

        // Tiered truncation based on length
        if (length <= 12) {
            // Short enough - show full (DHL: 10-11, FedEx: 12)
            return awb;
        } else if (length <= 16) {
            // Medium length - show first 3 + last 9
            // Threshold 16: X = 16 - 3 - 2 = 11, but cap at 9 for readability
            return awb.substring(0, 3) + '...' + awb.substring(length - 9);
        } else if (length <= 20) {
            // Long - show first 3 + last 7 (UPS: 18 chars)
            // Threshold 20: X = 20 - 3 - 2 = 15, but cap at 7
            return awb.substring(0, 3) + '...' + awb.substring(length - 7);
        } else {
            // Very long - show first 3 + last 5
            return awb.substring(0, 3) + '...' + awb.substring(length - 5);
        }
    }

    // ============================================================
    // STATUS FORMATTING
    // ============================================================

    /**
     * Get status badge class for delivery signal
     * @param {string} signal - Delivery signal
     * @returns {string} CSS class name
     */
    function getStatusBadgeClass(signal) {
        var classMap = {
            'PICKUP': 'status-pickup',
            'IN_TRANSIT': 'status-transit',
            'OUT_FOR_DELIVERY': 'status-delivery',
            'DELIVERY': 'status-delivered',
            'EXCEPTION': 'status-exception',
            'FAILED': 'status-failed',
            'RETURNED': 'status-returned'
        };

        return classMap[signal] || 'status-unknown';
    }

    /**
     * Get human-readable status text
     * @param {string} signal - Delivery signal
     * @returns {string}
     */
    function getStatusText(signal) {
        var textMap = {
            'PICKUP': 'Awaiting Pickup',
            'IN_TRANSIT': 'In Transit',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERY': 'Delivered',
            'EXCEPTION': 'Exception',
            'FAILED': 'Failed',
            'RETURNED': 'Returned'
        };

        return textMap[signal] || 'Unknown';
    }

    /**
     * Get status icon emoji
     * @param {string} signal - Delivery signal
     * @returns {string}
     */
    function getStatusIcon(signal) {
        var iconMap = {
            'PICKUP': '📦',
            'IN_TRANSIT': '🚚',
            'OUT_FOR_DELIVERY': '🚛',
            'DELIVERY': '✅',
            'EXCEPTION': '⚠️',
            'FAILED': '❌',
            'RETURNED': '↩️'
        };

        return iconMap[signal] || '❓';
    }

    // ============================================================
    // LOCATION FORMATTING
    // ============================================================

    /**
     * Format location object to readable string
     * @param {Object} location - Location object
     * @returns {string}
     */
    function formatLocation(location) {
        if (!location) {
            return 'Unknown';
        }

        var parts = [];

        if (location.city) {
            parts.push(location.city);
        }

        if (location.country) {
            parts.push(location.country);
        }

        if (parts.length === 0 && location.code) {
            parts.push(location.code);
        }

        return parts.join(', ') || 'Unknown';
    }

    // ============================================================
    // WEIGHT FORMATTING
    // ============================================================

    /**
     * Format weight object to readable string
     * @param {Object} weight - Weight object
     * @returns {string}
     */
    function formatWeight(weight) {
        if (!weight || weight.value === null || weight.value === undefined) {
            return 'N/A';
        }

        return weight.value + ' ' + (weight.unit || 'kg');
    }

    /**
     * Convert weight to different unit
     * @param {number} value - Weight value
     * @param {string} fromUnit - Source unit (kg, lb)
     * @param {string} toUnit - Target unit
     * @returns {number}
     */
    function convertWeight(value, fromUnit, toUnit) {
        if (fromUnit === toUnit) {
            return value;
        }

        var kgValue = value;

        // Convert to kg first
        if (fromUnit === 'lb') {
            kgValue = value * 0.453592;
        }

        // Convert from kg to target
        if (toUnit === 'lb') {
            return kgValue / 0.453592;
        }

        return kgValue;
    }

    // ============================================================
    // STRING UTILITIES
    // ============================================================

    /**
     * Truncate string to max length
     * @param {string} str - String to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string}
     */
    function truncate(str, maxLength) {
        if (!str || str.length <= maxLength) {
            return str;
        }

        return str.substring(0, maxLength - 3) + '...';
    }

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string}
     */
    function capitalize(str) {
        if (!str) {
            return '';
        }

        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // ============================================================
    // DATA EXPORT HELPERS
    // ============================================================

    /**
     * Convert tracking data to CSV row
     * @param {Object} tracking - Tracking record
     * @returns {string} CSV row
     */
    function toCSVRow(tracking) {
        var fields = [
            tracking.awb,
            tracking.carrier,
            tracking.status,
            getStatusText(tracking.deliverySignal),
            formatLocation(tracking.origin),
            formatLocation(tracking.destination),
            tracking.dateShipped || '',
            tracking.estimatedDelivery || '',
            tracking.actualDelivery || '',
            formatWeight(tracking.details?.weight)
        ];

        return fields.map(function(field) {
            return '"' + String(field).replace(/"/g, '""') + '"';
        }).join(',');
    }

    /**
     * Get CSV header row
     * @returns {string}
     */
    function getCSVHeader() {
        return 'AWB,Carrier,Status,Delivery Signal,Origin,Destination,Date Shipped,Estimated Delivery,Actual Delivery,Weight';
    }

    // ============================================================
    // DEBOUNCE/THROTTLE
    // ============================================================

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function}
     */
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in ms
     * @returns {Function}
     */
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.TrackingUtils = {
        // Date/Time
        formatDate: formatDate,
        formatRelativeTime: formatRelativeTime,
        daysUntilDelivery: daysUntilDelivery,

        // AWB Validation
        validateAWB: validateAWB,
        detectCarrier: detectCarrier,
        getCarrierTrackingURL: getCarrierTrackingURL,
        truncateAWB: truncateAWB,

        // Status
        getStatusBadgeClass: getStatusBadgeClass,
        getStatusText: getStatusText,
        getStatusIcon: getStatusIcon,

        // Location
        formatLocation: formatLocation,

        // Weight
        formatWeight: formatWeight,
        convertWeight: convertWeight,

        // String Utils
        truncate: truncate,
        capitalize: capitalize,

        // Export
        toCSVRow: toCSVRow,
        getCSVHeader: getCSVHeader,

        // Performance
        debounce: debounce,
        throttle: throttle,

        // Mobile UI
        truncateAWB: truncateAWB,
        getStatusIcon: getStatusIcon,
        getStatusColor: getStatusColor
    };

    // ============================================================
    // MOBILE UI HELPERS
    // ============================================================

    /**
     * Truncate AWB for mobile display
     * Format: "1...23456" (first digit + last 5 digits)
     * @param {string} awb - Full tracking number
     * @returns {string} Truncated AWB
     */
    function truncateAWB(awb) {
        if (!awb || typeof awb !== 'string') {
            return '';
        }

        awb = awb.trim();

        // If AWB is 7 characters or less, show full
        if (awb.length <= 7) {
            return awb;
        }

        // Get first 2 characters and last 5 characters
        var first = awb.substring(0, 2);
        var last = awb.slice(-5);

        return first + '...' + last;
    }

    /**
     * Get status icon emoji
     * @param {string} signal - Delivery signal
     * @returns {string} Emoji icon
     */
    function getStatusIcon(signal) {
        if (!signal) {
            return '📦';
        }

        switch (signal.toUpperCase()) {
            case 'DELIVERY':
                return '✅'; // Delivered (green)
            case 'IN_TRANSIT':
                return '🚚'; // In Transit (blue)
            case 'OUT_FOR_DELIVERY':
                return '🏠'; // Out for Delivery (purple)
            case 'PICKUP':
                return '📦'; // Pickup (orange)
            case 'EXCEPTION':
                return '⚠️'; // Exception (red)
            case 'FAILED':
                return '❌'; // Failed (dark red)
            default:
                return '📦'; // Default
        }
    }

    /**
     * Get status color for CSS
     * @param {string} signal - Delivery signal
     * @returns {string} CSS color value
     */
    function getStatusColor(signal) {
        if (!signal) {
            return '#6b7280'; // Gray
        }

        switch (signal.toUpperCase()) {
            case 'DELIVERY':
                return '#10b981'; // Green
            case 'IN_TRANSIT':
                return '#3b82f6'; // Blue
            case 'OUT_FOR_DELIVERY':
                return '#8b5cf6'; // Purple
            case 'PICKUP':
                return '#f59e0b'; // Orange
            case 'EXCEPTION':
                return '#ef4444'; // Red
            case 'FAILED':
                return '#991b1b'; // Dark Red
            default:
                return '#6b7280'; // Gray
        }
    }

})(window);
