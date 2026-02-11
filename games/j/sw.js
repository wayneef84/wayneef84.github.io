/**
 * Service Worker for J: Speed Quiz
 */

var CACHE_NAME = 'j-quiz-v1';
var urlsToCache = [
  './index.html',
  './css/style.css',
  './js/engine.js',
  './js/app.js',
  './packs/sprunki_v1.json',
  './manifest.json',
  '../../favicon.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(function() {
        // Fallback or offline page logic here if needed
      })
  );
});
