/**
 * Service Worker for Input A11y
 * Provides offline-first caching for PWA functionality
 */

var CACHE_NAME = 'input-a11y-v2.0.0';
var urlsToCache = [
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/scanner.js',
  './js/ocr-manager.js',
  './js/generator.js',
  './manifest.json',
  // Tesseract OCR assets
  './assets/tesseract.min.js',
  './assets/worker.min.js',
  './assets/tesseract-core-simd.wasm.js',
  './assets/eng.traineddata.gz',
  // External libraries (from CDN - cache for offline)
  '../../games/lib/html5-qrcode.min.js',
  '../../games/lib/qrcode.min.js'
];

// Install event - cache all assets
self.addEventListener('install', function(event) {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          console.log('[SW] Cache hit:', event.request.url);
          return response;
        }

        console.log('[SW] Fetching:', event.request.url);

        // Clone the request
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(function() {
        // Offline fallback - return cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});
