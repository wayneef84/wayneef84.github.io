/**
 * Shipment Tracker - CORS Proxy (Cloudflare Worker)
 *
 * Acts as a passthrough for carrier APIs to bypass CORS restrictions in the browser.
 * Supports the BYOK (Bring Your Own Key) model by forwarding Authorization headers.
 *
 * @author Wayne Fong (wayneef84)
 * @version 1.0.0
 */

// Whitelist allowed origins to prevent abuse
const ALLOWED_ORIGINS = [
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'https://wayneef84.github.io'
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle Preflight (OPTIONS) requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // 2. Parse the target from the URL params
    // Example: https://your-worker.dev/track?awb=123&carrier=DHL
    const awb = url.searchParams.get('awb');
    const carrier = url.searchParams.get('carrier'); // Optional helper param if needed

    // 3. Routing Logic (Map to real API endpoints)
    // Note: In your current app logic, you append the query string manually.
    // We need to construct the real upstream URL.
    
    // Check if this is a DHL request (based on your dhl.js logic)
    // dhl.js sends: proxyUrl + '/track?awb=' + awb
    let targetUrl = '';
    
    // We can infer target based on query params or a specific path
    // For this generic proxy, let's look at how dhl.js calls it:
    if (url.pathname === '/track' && awb) {
        // Default to DHL for now, or detect based on AWB format if needed
        // Ideally, pass 'carrier' param from the frontend to be sure
        targetUrl = `https://api-eu.dhl.com/track/shipments?trackingNumber=${awb}`;
    } else {
        return new Response('Invalid request parameters', { status: 400 });
    }

    // 4. Prepare the modified request
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    // 5. Send to Carrier API
    try {
      const response = await fetch(newRequest);
      
      // 6. Reconstruct response with CORS headers
      const newResponse = new Response(response.body, response);
      
      // Add CORS headers to allow the browser to read it
      const origin = request.headers.get('Origin');
      if (ALLOWED_ORIGINS.includes(origin)) {
        newResponse.headers.set('Access-Control-Allow-Origin', origin);
      } else {
        // Fallback for development (optional, be careful in production)
        newResponse.headers.set('Access-Control-Allow-Origin', '*'); 
      }
      
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, DHL-API-Key, Authorization');
      
      return newResponse;

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }
};

/**
 * Handle OPTIONS (Preflight) requests
 */
function handleOptions(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, DHL-API-Key, Authorization, transId, transactionSrc',
    'Access-Control-Max-Age': '86400',
  };

  return new Response(null, {
    headers: corsHeaders
  });
}