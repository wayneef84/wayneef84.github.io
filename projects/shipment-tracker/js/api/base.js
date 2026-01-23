/**
 * Base API Utilities
 * Shared utilities for all carrier API adapters
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

(function(window) {
    'use strict';

    // ============================================================
    // CONFIGURATION
    // ============================================================

    var API_CONFIG = {
        // Proxy URLs (set these after deploying Cloudflare Workers)
        proxies: {
            DHL: '',  // e.g., 'https://shipment-tracker-dhl.YOUR-SUBDOMAIN.workers.dev'
            FedEx: '',
            UPS: ''
        },

        // Direct API endpoints (for BYOK mode without proxy)
        endpoints: {
            DHL: 'https://api-eu.dhl.com/track/shipments',
            FedEx: 'https://apis.fedex.com/track/v1/trackingnumbers',
            UPS: 'https://onlinetools.ups.com/track/v1/details'
        },

        // Use proxy by default (set to false for direct API calls with BYOK)
        useProxy: true,

        // Request timeout (ms)
        timeout: 30000,

        // Retry configuration
        retry: {
            maxAttempts: 3,
            backoffMs: 1000,
            backoffMultiplier: 2
        }
    };

    // ============================================================
    // HTTP REQUEST WRAPPER
    // ============================================================

    /**
     * Make HTTP request with retry logic
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    function request(url, options) {
        options = options || {};

        var controller = new AbortController();
        var timeoutId = setTimeout(function() {
            controller.abort();
        }, API_CONFIG.timeout);

        var fetchOptions = {
            method: options.method || 'GET',
            headers: options.headers || {},
            signal: controller.signal
        };

        if (options.body) {
            fetchOptions.body = JSON.stringify(options.body);
            fetchOptions.headers['Content-Type'] = 'application/json';
        }

        return fetch(url, fetchOptions)
            .then(function(response) {
                clearTimeout(timeoutId);
                return handleResponse(response);
            })
            .catch(function(error) {
                clearTimeout(timeoutId);

                // Check if we should retry
                if (shouldRetry(error, options.attempt || 0)) {
                    return retryRequest(url, options);
                }

                throw error;
            });
    }

    /**
     * Handle fetch response
     * @param {Response} response - Fetch response
     * @returns {Promise<Object>}
     */
    function handleResponse(response) {
        if (response.ok) {
            return response.json();
        }

        // Handle error responses
        return response.json()
            .catch(function() {
                // If JSON parsing fails, return text
                return response.text();
            })
            .then(function(errorData) {
                var error = new Error('API request failed');
                error.status = response.status;
                error.statusText = response.statusText;
                error.data = errorData;
                throw error;
            });
    }

    /**
     * Check if request should be retried
     * @param {Error} error - Request error
     * @param {number} attempt - Current attempt number
     * @returns {boolean}
     */
    function shouldRetry(error, attempt) {
        if (attempt >= API_CONFIG.retry.maxAttempts) {
            return false;
        }

        // Retry on network errors or 5xx server errors
        if (error.name === 'AbortError') {
            return false; // Don't retry timeouts
        }

        if (error.status >= 500 && error.status < 600) {
            return true;
        }

        return false;
    }

    /**
     * Retry request with exponential backoff
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>}
     */
    function retryRequest(url, options) {
        var attempt = (options.attempt || 0) + 1;
        var delay = API_CONFIG.retry.backoffMs * Math.pow(API_CONFIG.retry.backoffMultiplier, attempt - 1);

        console.log('[API] Retrying request (attempt ' + attempt + ') after ' + delay + 'ms');

        return new Promise(function(resolve) {
            setTimeout(function() {
                options.attempt = attempt;
                resolve(request(url, options));
            }, delay);
        });
    }

    // ============================================================
    // API KEY MANAGEMENT
    // ============================================================

    /**
     * Get API key for carrier
     * @param {string} carrier - Carrier name (DHL, FedEx, UPS)
     * @returns {Object|string} API key(s)
     */
    function getAPIKey(carrier) {
        // This will be set by the app when user configures settings
        if (!window.app || !window.app.settings || !window.app.settings.apiKeys) {
            throw new Error('API keys not configured. Please configure in Settings.');
        }

        var keys = window.app.settings.apiKeys[carrier];
        if (!keys) {
            throw new Error(carrier + ' API key not found. Please configure in Settings.');
        }

        return keys;
    }

    // ============================================================
    // PROXY HELPERS
    // ============================================================

    /**
     * Get proxy URL for carrier
     * @param {string} carrier - Carrier name
     * @returns {string} Proxy URL
     */
    function getProxyURL(carrier) {
        var proxyUrl = API_CONFIG.proxies[carrier];

        if (!proxyUrl) {
            throw new Error('Proxy URL not configured for ' + carrier);
        }

        return proxyUrl;
    }

    /**
     * Check if proxy should be used
     * @param {string} carrier - Carrier name
     * @returns {boolean}
     */
    function shouldUseProxy(carrier) {
        return API_CONFIG.useProxy && !!API_CONFIG.proxies[carrier];
    }

    // ============================================================
    // RATE LIMITING
    // ============================================================

    var rateLimitState = {
        DHL: { lastRequest: 0, requestCount: 0, resetTime: 0 },
        FedEx: { lastRequest: 0, requestCount: 0, resetTime: 0 },
        UPS: { lastRequest: 0, requestCount: 0, resetTime: 0 }
    };

    /**
     * Check if request is rate limited
     * @param {string} carrier - Carrier name
     * @returns {Object} { allowed: boolean, retryAfter: number }
     */
    function checkRateLimit(carrier) {
        var now = Date.now();
        var state = rateLimitState[carrier];

        // Reset counters after 24 hours
        if (now > state.resetTime) {
            state.requestCount = 0;
            state.resetTime = now + (24 * 60 * 60 * 1000);
        }

        // Check daily limits
        var limits = {
            DHL: 250,
            FedEx: 1000,
            UPS: 500
        };

        if (state.requestCount >= limits[carrier]) {
            var retryAfter = Math.ceil((state.resetTime - now) / 1000);
            return {
                allowed: false,
                retryAfter: retryAfter,
                reason: 'Daily limit reached (' + limits[carrier] + ' requests)'
            };
        }

        // Check minimum interval (2 seconds between requests)
        var minInterval = 2000;
        var timeSinceLastRequest = now - state.lastRequest;

        if (timeSinceLastRequest < minInterval) {
            var retryAfter = Math.ceil((minInterval - timeSinceLastRequest) / 1000);
            return {
                allowed: false,
                retryAfter: retryAfter,
                reason: 'Rate limit: Wait ' + retryAfter + ' seconds'
            };
        }

        return { allowed: true };
    }

    /**
     * Record API request for rate limiting
     * @param {string} carrier - Carrier name
     */
    function recordRequest(carrier) {
        var state = rateLimitState[carrier];
        state.lastRequest = Date.now();
        state.requestCount++;
    }

    // ============================================================
    // ERROR HANDLING
    // ============================================================

    /**
     * Create standardized API error
     * @param {string} carrier - Carrier name
     * @param {Error} error - Original error
     * @returns {Object} Standardized error object
     */
    function createAPIError(carrier, error) {
        return {
            carrier: carrier,
            error: error.message,
            status: error.status || 500,
            statusText: error.statusText || 'Unknown error',
            timestamp: new Date().toISOString(),
            details: error.data || null
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    window.APIBase = {
        // Configuration
        config: API_CONFIG,

        // HTTP
        request: request,
        handleResponse: handleResponse,

        // API Keys
        getAPIKey: getAPIKey,

        // Proxy
        getProxyURL: getProxyURL,
        shouldUseProxy: shouldUseProxy,

        // Rate Limiting
        checkRateLimit: checkRateLimit,
        recordRequest: recordRequest,

        // Error Handling
        createAPIError: createAPIError
    };

})(window);
