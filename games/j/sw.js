/**
 * Service Worker for J: Speed Quiz
 */

var CACHE_NAME = 'j-quiz-v5';
var urlsToCache = [
  './index.html',
  './css/style.css',
  './js/engine.js',
  './js/app.js',
  './manifest.json', // PWA Manifest
  './packs/manifest.json', // Packs Manifest
  '../../favicon.svg',
  // Packs
  './packs/sprunki_v1.json',
  './packs/technology_v1.json',
  './packs/sports_v1.json',
  './packs/animals_v1.json',
  './packs/literature_v1.json',
  './packs/geography_v1.json',
  './packs/videogames_v1.json',
  './packs/history_v1.json',
  './packs/music_v1.json',
  './packs/language_v1.json',
  './packs/space_v1.json',
  './packs/pmi_pm.json',
  './packs/ops_logistics.json',
  './packs/mythology_v1.json',
  './packs/food_v1.json',
  './packs/andrew_ramdayal.json',
  './packs/science_v1.json',
  './packs/popculture_v1.json',
  './packs/movies_v1.json',
  './packs/math_v1.json',
  './packs/xanadu_v1.json',
  './packs/music_60s.json',
  './packs/music_70s.json',
  './packs/music_80s.json',
  './packs/music_90s.json',
  './packs/public_domain.json',
  // New Niche Packs
  './packs/brands_logos.json',
  './packs/true_crime.json'
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
