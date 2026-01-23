/**
 * Cloudflare Worker - DHL API Proxy
 *
 * This worker acts as a secure proxy between your browser app and the DHL API.
 * Your API key is stored as a Cloudflare secret and never exposed to the client.
 *
 * Deployment:
 * 1. Go to https://dash.cloudflare.com/
 * 2. Navigate to Workers & Pages
 * 3. Create new Worker
 * 4. Paste this code
 * 5. Add environment variable: DHL_API_KEY = your-key-here
 * 6. Deploy
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

// CORS headers for browser access
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Change to your domain in production
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
};

// DHL API base URL
const DHL_API_BASE = 'https://api-eu.dhl.com/track/shipments';

/**
 * Main request handler
 */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

/**
 * Handle incoming requests
 * @param {Request} request - Incoming request
 * @returns {Response}
 */
async function handleRequest(request) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return handleOptions();
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Route handling
    if (url.pathname === '/track') {
        return handleTrackRequest(request);
    }

    if (url.pathname === '/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Default response
    return jsonResponse({
        error: 'Not found',
        endpoints: {
            track: '/track?awb=TRACKING_NUMBER',
            health: '/health'
        }
    }, 404);
}

/**
 * Handle tracking request
 * @param {Request} request - Incoming request
 * @returns {Response}
 */
async function handleTrackRequest(request) {
    const url = new URL(request.url);
    const awb = url.searchParams.get('awb');

    // Validate tracking number
    if (!awb) {
        return jsonResponse({ error: 'Missing AWB parameter' }, 400);
    }

    if (awb.length < 10 || awb.length > 40) {
        return jsonResponse({ error: 'Invalid AWB format' }, 400);
    }

    // Check for API key in environment
    if (!DHL_API_KEY) {
        return jsonResponse({
            error: 'Server configuration error',
            message: 'DHL API key not configured'
        }, 500);
    }

    try {
        // Call DHL API
        const dhlUrl = `${DHL_API_BASE}?trackingNumber=${encodeURIComponent(awb)}`;

        const dhlResponse = await fetch(dhlUrl, {
            method: 'GET',
            headers: {
                'DHL-API-Key': DHL_API_KEY,
                'Accept': 'application/json',
                'User-Agent': 'ShipmentTracker/1.0'
            }
        });

        // Get response data
        const data = await dhlResponse.json();

        // Check for errors
        if (!dhlResponse.ok) {
            return jsonResponse({
                error: 'DHL API error',
                status: dhlResponse.status,
                message: data.message || 'Unknown error',
                details: data
            }, dhlResponse.status);
        }

        // Return successful response
        return jsonResponse({
            success: true,
            data: data,
            timestamp: new Date().toISOString(),
            source: 'DHL Express API'
        });

    } catch (error) {
        console.error('DHL API request failed:', error);

        return jsonResponse({
            error: 'Proxy error',
            message: error.message,
            timestamp: new Date().toISOString()
        }, 500);
    }
}

/**
 * Handle OPTIONS request (CORS preflight)
 * @returns {Response}
 */
function handleOptions() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

/**
 * Create JSON response with CORS headers
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Response}
 */
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}
