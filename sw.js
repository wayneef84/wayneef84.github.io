/**
 * F.O.N.G. Arcade service worker. Strict ES5, relative URLs only.
 * Lives at the repo root so its scope covers the whole site.
 * Docs: docs/PWA.md. Kill switch: add ?pwa=off to any page that loads js/pwa.js.
 *
 * Bump CACHE_VERSION on any release that changes the shell files below (or
 * when you need every phone to drop its cached copies). Old caches are
 * deleted on activate.
 */
var CACHE_VERSION = 'v1';

var SHELL_CACHE = 'fong-shell-' + CACHE_VERSION;
var RUNTIME_CACHE = 'fong-runtime-' + CACHE_VERSION;
var MAX_RUNTIME_ENTRIES = 150;

// Small app shell, relative to this file. Missing files never block install.
var SHELL = [
    './',
    './index.html',
    './offline.html',
    './manifest.webmanifest',
    './favicon.svg',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/apple-touch-icon.png',
    './css/components/global.css',
    './css/components/card.css',
    './css/skins/classic.css',
    './css/skins/print-shop.css',
    './css/skins/cabinet.css',
    './css/skins/control-panel.css',
    './css/skins/metro-map.css',
    './css/skins/handheld.css',
    './css/skins/scrapbook.css',
    './css/theme-overrides.css',
    './css/theme-panel.css',
    './js/theme/loader.js',
    './js/theme/palettes.js',
    './js/theme/validate.js',
    './js/theme/apply.js',
    './js/theme/panel.js',
    './js/catalog.js',
    './js/player-stats.js',
    './js/hub-data.js',
    './js/hub-nav.js',
    './js/hub-filters.js',
    './js/home-link.js',
    './js/pwa.js',
    './assets/fonts/SpaceGrotesk-Medium.woff2',
    './assets/fonts/SpaceGrotesk-Bold.woff2',
    './browse/index.html'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(SHELL_CACHE).then(function (cache) {
            return Promise.all(SHELL.map(function (url) {
                return cache.add(new Request(url, { cache: 'reload' })).catch(function () { /* skip a missing file */ });
            }));
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(names.map(function (name) {
                if (name.indexOf('fong-') === 0 && name !== SHELL_CACHE && name !== RUNTIME_CACHE) {
                    return caches.delete(name);
                }
                return null;
            }));
        }).then(function () {
            return self.clients.claim();
        })
    );
});

function isHtmlRequest(request) {
    if (request.mode === 'navigate') { return true; }
    var accept = request.headers.get('accept') || '';
    return accept.indexOf('text/html') !== -1;
}

function cacheable(response) {
    // Only real 200 answers from this site. Never errors, partials or redirects.
    return response && response.status === 200 && response.type === 'basic' && !response.redirected;
}

function trimCache(cacheName, max) {
    return caches.open(cacheName).then(function (cache) {
        return cache.keys().then(function (keys) {
            var extra = keys.length - max;
            var jobs = [];
            for (var i = 0; i < extra; i++) { jobs.push(cache.delete(keys[i])); } // oldest first
            return Promise.all(jobs);
        });
    });
}

function putRuntime(request, response) {
    return caches.open(RUNTIME_CACHE).then(function (cache) {
        return cache.put(request, response);
    }).then(function () {
        return trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
    });
}

function lookup(request) {
    return caches.match(request).then(function (hit) {
        return hit || caches.match(request, { ignoreSearch: true });
    });
}

function offlinePage() {
    return caches.match('./offline.html').then(function (hit) {
        if (!hit) { return new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } }); }
        // Insert <base> so the links in offline.html work from any page depth.
        return hit.text().then(function (text) {
            var base = '<base href="' + self.registration.scope + '">';
            return new Response(text.replace('<head>', '<head>' + base), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        });
    });
}

// HTML: network first (updates show up promptly), cache fallback, then offline.html.
function htmlStrategy(event) {
    var request = event.request;
    var nav = request.mode === 'navigate';
    return fetch(request.url, { cache: 'no-cache', redirect: nav ? 'manual' : 'follow', credentials: 'same-origin' }).then(function (response) {
        if (response.type === 'opaqueredirect') { return response; }
        if (cacheable(response)) {
            var copy = response.clone();
            event.waitUntil(putRuntime(request, copy));
        }
        return response;
    }).catch(function () {
        return lookup(request).then(function (hit) {
            if (hit) { return hit; }
            return nav ? offlinePage() : Response.error();
        });
    });
}

// Everything else: stale while revalidate.
function assetStrategy(event) {
    var request = event.request;
    return caches.match(request).then(function (hit) {
        var network = fetch(request, { cache: 'no-cache' }).then(function (response) {
            if (cacheable(response)) {
                var copy = response.clone();
                event.waitUntil(putRuntime(request, copy));
            }
            return response;
        });
        if (hit) {
            network.catch(function () { /* offline, keep the cached copy */ });
            return hit;
        }
        return network.catch(function () { return Response.error(); });
    });
}

self.addEventListener('fetch', function (event) {
    var request = event.request;
    if (request.method !== 'GET') { return; }
    if (request.headers.has('range')) { return; }
    if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') { return; }
    var url = new URL(request.url);
    if (url.origin !== self.location.origin) { return; } // never touch cross-origin
    if (url.pathname.slice(-6) === 'sw.js') { return; }
    if (isHtmlRequest(request)) {
        event.respondWith(htmlStrategy(event));
    } else {
        event.respondWith(assetStrategy(event));
    }
});
