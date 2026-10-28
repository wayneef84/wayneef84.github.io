/**
 * FongStats - shared, on-device play stats for every game and tool.
 * One global: window.FongStats. Strict ES5. No network, no accounts, no tracking.
 * Everything stays in this browser (localStorage key "fong_stats_v1").
 * If localStorage is blocked the stats live in memory until the page closes.
 *
 * Game ids are the ids in js/catalog.js (FONG_CATALOG), so new catalog entries
 * work with no extra setup. Load AFTER js/catalog.js. Docs: docs/PLAYER_STATS.md
 */
(function(root) {
    'use strict';

    var KEY = 'fong_stats_v1';
    var OLD_PREFIX = 'playcount_';
    var memory = null;      // fallback store when localStorage is blocked
    var persistent = null;  // null = not tested yet

    // ---- storage -------------------------------------------------------

    function emptyStore() { return { v: 1, games: {}, migrated: false }; }

    function readRaw() {
        try {
            var raw = root.localStorage.getItem(KEY);
            persistent = true;
            return raw;
        } catch (e) {
            persistent = false;
            return null;
        }
    }

    function load() {
        var raw = readRaw();
        if (persistent === false) {
            if (!memory) memory = emptyStore();
            return memory;
        }
        if (!raw) return emptyStore();
        try {
            var s = JSON.parse(raw);
            if (s && typeof s === 'object' && s.games && typeof s.games === 'object') return s;
        } catch (e) { /* corrupt data: start clean */ }
        return emptyStore();
    }

    function save(store) {
        if (persistent === false) { memory = store; return true; }
        try {
            root.localStorage.setItem(KEY, JSON.stringify(store));
            return true;
        } catch (e) {
            persistent = false;
            memory = store;
            return false;
        }
    }

    // ---- helpers -------------------------------------------------------

    function slot(id) { return 'g:' + id; }

    function validId(id) {
        return typeof id === 'string' && id.length > 0 && id.length < 120;
    }

    function toInt(n) {
        n = parseInt(n, 10);
        return (isFinite(n) && n > 0) ? n : 0;
    }

    function entryOf(store, id) {
        var e = store.games[slot(id)];
        return (e && typeof e === 'object') ? e : null;
    }

    function publicEntry(id, e) {
        var hasBest = !!e && typeof e.best === 'number' && isFinite(e.best);
        return {
            id: id,
            plays: e ? toInt(e.plays) : 0,
            lastPlayed: e && e.last ? e.last : 0,
            best: hasBest ? e.best : null,
            higherIsBetter: e ? e.hib !== false : true
        };
    }

    function catalog() {
        var c = root.FONG_CATALOG;
        if (c && typeof c.length === 'number') return c;
        try { if (typeof FONG_CATALOG !== 'undefined') return FONG_CATALOG; } catch (e) { /* none */ }
        return null;
    }

    // Normalise a path or href: drop ./ ../ query, hash, trailing index.html and slashes.
    function normPath(p) {
        p = String(p == null ? '' : p).split('#')[0].split('?')[0];
        p = p.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
        p = p.replace(/index\.html$/, '').replace(/\/+$/, '');
        return p;
    }

    var pathIndex = null;
    function buildPathIndex() {
        var c = catalog();
        if (!c) return null;
        if (pathIndex && pathIndex.size === c.length) return pathIndex;
        var map = {};
        for (var i = 0; i < c.length; i++) {
            if (!c[i] || !c[i].href || /^https?:/.test(c[i].href)) continue;
            var n = normPath(c[i].href);
            // first entry wins for a shared path
            if (n && !Object.prototype.hasOwnProperty.call(map, n)) map[n] = c[i].id;
        }
        pathIndex = { map: map, size: c.length };
        return pathIndex;
    }

    /** Catalog id for a page path or href (relative or absolute). '' if no match. */
    function idForPath(href) {
        var idx = buildPathIndex();
        if (!idx) return '';
        var n = normPath(href);
        if (n && Object.prototype.hasOwnProperty.call(idx.map, n)) return idx.map[n];
        // absolute URL or deeper base: longest catalog path that is a suffix of it
        var best = '', bestId = '';
        for (var k in idx.map) {
            if (!Object.prototype.hasOwnProperty.call(idx.map, k)) continue;
            if (k.length > best.length && (n === k || n.slice(-(k.length + 1)) === '/' + k)) {
                best = k; bestId = idx.map[k];
            }
        }
        return bestId;
    }

    // ---- migration -----------------------------------------------------

    // One time: fold old playcount_<path> keys into the new store, then remove them.
    function migrate(store) {
        if (store.migrated) return store;
        if (persistent === false) { store.migrated = true; return store; }
        if (!catalog()) return store; // wait until the catalog is loaded
        var oldKeys = [], i, k;
        try {
            for (i = 0; i < root.localStorage.length; i++) {
                k = root.localStorage.key(i);
                if (k && (k.indexOf(OLD_PREFIX) === 0 || k.indexOf('fong_streak_') === 0)) oldKeys.push(k);
            }
        } catch (e) { return store; }
        var changed = false;
        for (i = 0; i < oldKeys.length; i++) {
            k = oldKeys[i];
            if (k.indexOf(OLD_PREFIX) !== 0) continue; // streak keys are only removed
            var n = 0;
            try { n = toInt(root.localStorage.getItem(k)); } catch (e2) { n = 0; }
            var path = k.slice(OLD_PREFIX.length);
            var id = idForPath(path) || normPath(path) || path;
            if (n > 0 && validId(id)) {
                var e = entryOf(store, id) || { plays: 0 };
                e.plays = toInt(e.plays) + n;
                store.games[slot(id)] = e;
                changed = true;
            }
        }
        store.migrated = true;
        if (save(store)) {
            // new store written: safe to drop the old keys
            for (i = 0; i < oldKeys.length; i++) {
                try { root.localStorage.removeItem(oldKeys[i]); } catch (e3) { /* ignore */ }
            }
        }
        return store;
    }

    function open() { return migrate(load()); }

    // ---- public API ----------------------------------------------------

    function count(id) {
        if (!validId(id)) return 0;
        var e = entryOf(open(), id);
        return e ? toInt(e.plays) : 0;
    }

    function totalPlays() {
        var s = open(), t = 0;
        for (var k in s.games) {
            if (Object.prototype.hasOwnProperty.call(s.games, k) && s.games[k]) t += toInt(s.games[k].plays);
        }
        return t;
    }

    function get(id) {
        if (!validId(id)) return publicEntry(String(id), null);
        return publicEntry(id, entryOf(open(), id));
    }

    function all() {
        var s = open(), out = {};
        for (var k in s.games) {
            if (Object.prototype.hasOwnProperty.call(s.games, k) && k.indexOf('g:') === 0) {
                out[k.slice(2)] = publicEntry(k.slice(2), s.games[k]);
            }
        }
        return out;
    }

    function recordPlay(id) {
        if (!validId(id)) return 0;
        var s = open();
        var e = entryOf(s, id) || { plays: 0 };
        e.plays = toInt(e.plays) + 1;
        e.last = new Date().getTime();
        s.games[slot(id)] = e;
        save(s);
        refreshHeader();
        return e.plays;
    }

    /** Keeps the best value only. Returns true if value became the new best. */
    function setBest(id, value, higherIsBetter) {
        if (!validId(id)) return false;
        value = Number(value);
        if (!isFinite(value)) return false;
        var hib = higherIsBetter !== false;
        var s = open();
        var e = entryOf(s, id) || { plays: 0 };
        var has = typeof e.best === 'number' && isFinite(e.best);
        if (has && e.hib === hib && (hib ? value <= e.best : value >= e.best)) return false;
        e.best = value;
        e.hib = hib;
        s.games[slot(id)] = e;
        save(s);
        return true;
    }

    /** Clear all stats (and any old-format keys). */
    function reset() {
        memory = null;
        var s = emptyStore();
        s.migrated = true;
        if (persistent === false) { memory = s; } else {
            try { root.localStorage.removeItem(KEY); } catch (e) { persistent = false; memory = s; }
            try {
                var rm = [], i, k;
                for (i = 0; i < root.localStorage.length; i++) {
                    k = root.localStorage.key(i);
                    if (k && k.indexOf(OLD_PREFIX) === 0) rm.push(k);
                }
                for (i = 0; i < rm.length; i++) root.localStorage.removeItem(rm[i]);
                // keep "migrated" so nothing old can come back
                root.localStorage.setItem(KEY, JSON.stringify(s));
            } catch (e2) { /* blocked: memory only */ }
        }
        refreshHeader();
    }

    /** 0..999 as is, 1.2k, 12k, 120k, 1.2M. */
    function format(n) {
        n = toInt(n);
        if (n < 1000) return String(n);
        var units = [[1000000, 'M'], [1000, 'k']];
        for (var i = 0; i < units.length; i++) {
            if (n >= units[i][0]) {
                var v = n / units[i][0];
                var s = v < 10 ? (Math.floor(v * 10) / 10).toFixed(1) : String(Math.floor(v));
                if (s.slice(-2) === '.0') s = s.slice(0, -2);
                return s + units[i][1];
            }
        }
        return String(n);
    }

    /** True when stats persist between visits (localStorage works). */
    function isPersistent() {
        if (persistent === null) readRaw();
        return persistent === true;
    }

    function refreshHeader() {
        try { if (typeof root.updateGlobalPlayCount === 'function') root.updateGlobalPlayCount(); } catch (e) { /* ignore */ }
    }

    // Count a play when a catalog card is clicked. Call once per hub page.
    var tracking = false;
    function trackClicks() {
        if (tracking || !root.document) return;
        tracking = true;
        root.document.addEventListener('click', function(ev) {
            if (ev.button && ev.button !== 0) return;
            var el = ev.target, card = null;
            while (el && el !== root.document) {
                if (el.nodeType === 1 && el.tagName === 'A' &&
                    /(^|\s)(game-card|just-added-card|featured-md-reader)(\s|$)/.test(el.className || '')) { card = el; break; }
                el = el.parentNode;
            }
            if (!card) return;
            var id = card.getAttribute('data-game-id') || idForPath(card.getAttribute('href'));
            if (id) recordPlay(id);
        }, true);
    }

    root.FongStats = {
        count: count,
        totalPlays: totalPlays,
        get: get,
        all: all,
        recordPlay: recordPlay,
        setBest: setBest,
        reset: reset,
        format: format,
        idForPath: idForPath,
        isPersistent: isPersistent,
        trackClicks: trackClicks
    };
})(window);
