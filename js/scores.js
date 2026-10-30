/**
 * FongScores - per-device high scores for every game. One global: window.FongScores.
 * Strict ES5. No network, no accounts, no tracking. Nothing leaves this device.
 * Stored in localStorage key "fong.scores.v1". If storage is blocked the scores live
 * in memory until the page closes (FongScores.isPersistent() says which).
 * Follows the conventions of js/player-stats.js (FongStats). Docs: docs/SCORES.md
 *
 * Game ids are catalog ids. A game with several boards uses "id:board", for example
 * "memory-match:4x4". Text is only ever shown with textContent, never as HTML.
 */
(function (root) {
    'use strict';

    var KEY = 'fong.scores.v1';
    var FORMAT = 'fong-scores';
    var VERSION = 1;
    var MAX_IMPORT_CHARS = 262144;
    var MAX_GAMES = 200;
    var MAX_KEEP = 10;
    var DEFAULT_KEEP = 5;
    var MAX_VALUE = 1000000000000;
    var UNITS = ['points', 'seconds', 'moves', 'coins', 'level'];
    var has = Object.prototype.hasOwnProperty;
    function isBadKey(k) { return k === '__proto__' || k === 'constructor' || k === 'prototype'; }

    var memory = null;
    var persistent = null;

    // ---- helpers -------------------------------------------------------

    function emptyStore() { return { v: VERSION, clock: 0, games: {} }; }

    function validId(id) {
        return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:\-]{0,63}$/.test(id) && !isBadKey(id);
    }

    function cleanText(s, max) {
        s = String(s === undefined || s === null ? '' : s);
        s = s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        return s.length > max ? s.substr(0, max) : s;
    }

    function cleanValue(v) {
        if (typeof v !== 'number' || !isFinite(v)) { return null; }
        if (v <= 0 || v > MAX_VALUE) { return null; }
        return Math.round(v * 1000) / 1000;
    }

    function cleanExtra(x) {
        if (!x || typeof x !== 'object' || Array.isArray(x)) { return null; }
        var out = {}, n = 0, k;
        for (k in x) {
            if (!has.call(x, k) || n >= 6 || isBadKey(k) || !/^[A-Za-z][A-Za-z0-9_]{0,15}$/.test(k)) { continue; }
            var v = x[k];
            if (typeof v === 'number' && isFinite(v) && Math.abs(v) <= MAX_VALUE) { out[k] = v; n++; }
            else if (typeof v === 'boolean') { out[k] = v; n++; }
            else if (typeof v === 'string') { out[k] = cleanText(v, 40); n++; }
        }
        return n ? out : null;
    }

    function cleanKeep(m) {
        m = parseInt(m, 10);
        if (!isFinite(m) || m < 1) { return DEFAULT_KEEP; }
        return m > MAX_KEEP ? MAX_KEEP : m;
    }

    function cleanMeta(m, fallbackTitle) {
        m = (m && typeof m === 'object') ? m : {};
        var unit = typeof m.unit === 'string' && UNITS.indexOf(m.unit) >= 0 ? m.unit : 'points';
        var title = cleanText(m.title, 60) || cleanText(fallbackTitle, 60);
        return { title: title, unit: unit, hib: m.higherIsBetter !== false && m.hib !== false, max: cleanKeep(m.max) };
    }

    function cleanEntry(e) {
        if (!e || typeof e !== 'object') { return null; }
        var v = cleanValue(e.v);
        if (v === null) { return null; }
        var t = (typeof e.t === 'number' && isFinite(e.t) && e.t >= 0 && e.t <= 9007199254740991) ? Math.floor(e.t) : 0;
        var out = { v: v, label: cleanText(e.label, 40), t: t };
        var x = cleanExtra(e.extra);
        if (x) { out.extra = x; }
        return out;
    }

    // Best first. Ties: the older entry stays above the newer one.
    function sortEntries(entries, hib) {
        entries.sort(function (a, b) {
            if (a.v !== b.v) { return hib ? b.v - a.v : a.v - b.v; }
            return a.t - b.t;
        });
        return entries;
    }

    function betterThan(a, b, hib) { return hib ? a > b : a < b; }

    // ---- storage -------------------------------------------------------

    function readStore() {
        var raw = null;
        try {
            raw = root.localStorage.getItem(KEY);
            persistent = true;
        } catch (e) {
            persistent = false;
        }
        if (persistent === false) {
            if (!memory) { memory = emptyStore(); }
            return memory;
        }
        if (!raw) { return memory || emptyStore(); }
        try {
            var s = JSON.parse(raw);
            if (s && typeof s === 'object' && s.games && typeof s.games === 'object') { return normalizeStore(s); }
        } catch (e2) { /* corrupt: start clean */ }
        return emptyStore();
    }

    function normalizeStore(s) {
        var out = emptyStore();
        out.clock = (typeof s.clock === 'number' && isFinite(s.clock) && s.clock >= 0) ? Math.floor(s.clock) : 0;
        for (var id in s.games) {
            if (!has.call(s.games, id) || !validId(id)) { continue; }
            var g = s.games[id];
            if (!g || typeof g !== 'object') { continue; }
            var meta = cleanMeta(g, id);
            meta.entries = [];
            var list = Array.isArray(g.entries) ? g.entries : [];
            for (var i = 0; i < list.length && i < 50; i++) {
                var e = cleanEntry(list[i]);
                if (e) { meta.entries.push(e); if (e.t > out.clock) { out.clock = e.t; } }
            }
            sortEntries(meta.entries, meta.hib);
            meta.entries = meta.entries.slice(0, meta.max);
            out.games[id] = meta;
        }
        return out;
    }

    function writeStore(store) {
        memory = store;
        if (persistent === false) { return false; }
        try {
            root.localStorage.setItem(KEY, JSON.stringify(store));
            persistent = true;
            return true;
        } catch (e) {
            persistent = false;
            return false;
        }
    }

    // Monotonic: never goes backwards, never repeats, even if the clock is changed.
    function tick(store) {
        var n = new Date().getTime();
        store.clock = n > store.clock ? n : store.clock + 1;
        return store.clock;
    }

    function isPersistent() {
        if (persistent === null) { readStore(); }
        return persistent === true;
    }

    // ---- public API ----------------------------------------------------

    function register(gameId, opts) {
        if (!validId(gameId)) { return false; }
        var s = readStore();
        var old = has.call(s.games, gameId) ? s.games[gameId] : null;
        var meta = cleanMeta(opts, old ? old.title : gameId);
        var g = old || { entries: [] };
        g.title = meta.title; g.unit = meta.unit; g.hib = meta.hib; g.max = meta.max;
        sortEntries(g.entries, g.hib);
        g.entries = g.entries.slice(0, g.max);
        s.games[gameId] = g;
        writeStore(s);
        return true;
    }

    function publicList(g) {
        var out = [];
        for (var i = 0; i < g.entries.length; i++) {
            var e = g.entries[i];
            var o = { rank: i + 1, value: e.v, label: e.label, time: e.t };
            if (e.extra) { o.extra = e.extra; }
            out.push(o);
        }
        return out;
    }

    function submit(gameId, value, opts) {
        var res = { isBest: false, rank: null, previousBest: null };
        try {
            if (!validId(gameId)) { return res; }
            var s = readStore();
            var g = has.call(s.games, gameId) ? s.games[gameId] : null;
            if (!g) {
                g = { title: gameId, unit: 'points', hib: true, max: DEFAULT_KEEP, entries: [] };
                s.games[gameId] = g;
            }
            if (g.entries.length) { res.previousBest = g.entries[0].v; }
            var v = cleanValue(Number(value));
            if (v === null) { return res; }
            var e = { v: v, label: cleanText(opts && opts.label, 40), t: tick(s) };
            var x = cleanExtra(opts && opts.extra);
            if (x) { e.extra = x; }
            res.isBest = res.previousBest === null || betterThan(v, res.previousBest, g.hib);
            g.entries.push(e);
            sortEntries(g.entries, g.hib);
            var idx = g.entries.indexOf(e);
            g.entries = g.entries.slice(0, g.max);
            res.rank = idx >= 0 && idx < g.max ? idx + 1 : null;
            writeStore(s);
        } catch (err) { /* never break a game */ }
        return res;
    }

    function best(gameId) {
        if (!validId(gameId)) { return null; }
        var s = readStore();
        if (!has.call(s.games, gameId) || !s.games[gameId].entries.length) { return null; }
        return s.games[gameId].entries[0].v;
    }

    function list(gameId) {
        if (!validId(gameId)) { return []; }
        var s = readStore();
        return has.call(s.games, gameId) ? publicList(s.games[gameId]) : [];
    }

    function listAll() {
        var s = readStore(), out = [];
        for (var id in s.games) {
            if (!has.call(s.games, id)) { continue; }
            var g = s.games[id];
            out.push({ id: id, title: g.title || id, unit: g.unit, higherIsBetter: g.hib, max: g.max, scores: publicList(g) });
        }
        out.sort(function (a, b) { return a.title < b.title ? -1 : (a.title > b.title ? 1 : 0); });
        return out;
    }

    function reset(gameId) {
        if (!validId(gameId)) { return false; }
        var s = readStore();
        if (!has.call(s.games, gameId)) { return false; }
        s.games[gameId].entries = [];
        writeStore(s);
        return true;
    }

    function resetAll() {
        var s = readStore();
        for (var id in s.games) { if (has.call(s.games, id)) { s.games[id].entries = []; } }
        writeStore(s);
        return true;
    }

    // ---- export and import --------------------------------------------

    function exportObject() {
        var s = readStore(), games = {};
        for (var id in s.games) {
            if (!has.call(s.games, id)) { continue; }
            var g = s.games[id];
            if (!g.entries.length) { continue; }
            games[id] = { title: g.title, unit: g.unit, higherIsBetter: g.hib, max: g.max, entries: g.entries.slice(0) };
        }
        return { format: FORMAT, version: VERSION, games: games };
    }

    function exportJSON() { return JSON.stringify(exportObject(), null, 2); }

    function hasBadKey(o, depth) {
        if (depth > 6 || !o || typeof o !== 'object') { return false; }
        var keys = Object.keys(o);
        for (var i = 0; i < keys.length; i++) {
            if (isBadKey(keys[i])) { return true; }
            if (hasBadKey(o[keys[i]], depth + 1)) { return true; }
        }
        return false;
    }

    /** Check and (unless opts.dryRun) apply. Returns {ok, added, skipped, errors, games}. */
    function importJSON(str, opts) {
        opts = opts || {};
        var mode = opts.mode === 'replace' ? 'replace' : 'merge';
        var res = { ok: false, added: 0, skipped: 0, errors: [], games: [] };
        function fail(msg) { res.errors.push(msg); return res; }
        function note(msg) { if (res.errors.length < 20) { res.errors.push(msg); } }

        if (typeof str !== 'string') { return fail('That is not text.'); }
        if (str.length > MAX_IMPORT_CHARS) { return fail('That file is too big (limit is about 256 KB).'); }
        var data;
        try { data = JSON.parse(str); } catch (e) { return fail('That file is not valid JSON.'); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) { return fail('That file is not a scores file.'); }
        if (hasBadKey(data, 0)) { return fail('That file has keys that are not allowed.'); }
        if (data.format !== FORMAT) { return fail('That file is not a Fong scores file.'); }
        if (data.version !== VERSION) { return fail('That file version is not supported (' + cleanText(data.version, 10) + ').'); }
        if (!data.games || typeof data.games !== 'object' || Array.isArray(data.games)) { return fail('That file has no games list.'); }
        var ids = Object.keys(data.games);
        if (ids.length > MAX_GAMES) { return fail('That file lists too many games.'); }

        var s = mode === 'replace' ? emptyStore() : readStore();
        var cur = readStore();
        if (mode === 'replace') { s.clock = cur.clock; }
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i], src = data.games[id];
            if (!validId(id) || !src || typeof src !== 'object') { res.skipped++; note('Skipped a game with a bad id.'); continue; }
            var meta = cleanMeta(src, id);
            var g = has.call(s.games, id) ? s.games[id] : null;
            if (!g) { g = { title: meta.title, unit: meta.unit, hib: meta.hib, max: meta.max, entries: [] }; s.games[id] = g; }
            else if (mode === 'replace') { g.title = meta.title; g.unit = meta.unit; g.hib = meta.hib; g.max = meta.max; }
            var list = Array.isArray(src.entries) ? src.entries : [];
            var gameAdded = 0;
            for (var j = 0; j < list.length; j++) {
                if (j >= 50) { res.skipped++; continue; }
                var e = cleanEntry(list[j]);
                if (!e) { res.skipped++; note('Skipped a bad score in ' + cleanText(meta.title || id, 30) + '.'); continue; }
                var dup = false;
                for (var k = 0; k < g.entries.length; k++) {
                    if (g.entries[k].v === e.v && g.entries[k].t === e.t && g.entries[k].label === e.label) { dup = true; break; }
                }
                if (dup) { res.skipped++; continue; }
                if (e.t > s.clock) { s.clock = e.t; }
                g.entries.push(e);
                gameAdded++;
            }
            sortEntries(g.entries, g.hib);
            // count only entries that survive the top-N trim
            var kept = 0;
            for (var m = 0; m < g.entries.length && m < g.max; m++) { kept++; }
            if (g.entries.length > g.max) { res.skipped += g.entries.length - g.max; gameAdded = Math.max(0, gameAdded - (g.entries.length - g.max)); }
            g.entries = g.entries.slice(0, kept);
            res.added += gameAdded;
            res.games.push({ id: id, title: g.title || id, added: gameAdded });
        }
        res.ok = true;
        if (!opts.dryRun) { writeStore(s); }
        return res;
    }

    // ---- celebration (gentle, never a loss message) --------------------

    function reducedMotion() {
        try { return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
    }

    function calmOn() {
        try { return !!(root.FongPrefs && root.FongPrefs.get('calm')); } catch (e) { return false; }
    }

    function toast(text) {
        var doc = root.document;
        if (!doc || !doc.body) { return; }
        var old = doc.getElementById('fongScoresToast');
        if (old && old.parentNode) { old.parentNode.removeChild(old); }
        var t = doc.createElement('div');
        t.id = 'fongScoresToast';
        t.setAttribute('role', 'status');
        t.setAttribute('aria-live', 'polite');
        t.textContent = text;
        var still = reducedMotion() || calmOn();
        t.style.cssText = 'position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);' +
            'z-index:7000;max-width:90vw;box-sizing:border-box;padding:12px 20px;min-height:44px;border-radius:24px;' +
            'background:#fff8d6;color:#2a2200;border:2px solid #2a2200;font:700 16px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
            'text-align:center;pointer-events:none;' + (still ? '' : 'transition:opacity .4s ease;opacity:0;');
        doc.body.appendChild(t);
        if (!still) { root.setTimeout(function () { t.style.opacity = '1'; }, 20); }
        root.setTimeout(function () {
            if (!still) { t.style.opacity = '0'; }
            root.setTimeout(function () { if (t.parentNode) { t.parentNode.removeChild(t); } }, still ? 0 : 500);
        }, 2600);
    }

    /** Call with the result of submit(). Does nothing unless it is a personal best. */
    function celebrate(result, text) {
        try {
            if (!result || !result.isBest) { return false; }
            if (root.FongCheer && root.FongCheer.cheer) { root.FongCheer.cheer('big'); }
            toast(text ? cleanText(text, 60) : 'Personal best!');
            return true;
        } catch (e) { return false; }
    }

    /** Format a value for display: 1,240 / 1:05 / 12 moves. */
    function format(value, unit) {
        if (typeof value !== 'number' || !isFinite(value)) { return ''; }
        if (unit === 'seconds') {
            var total = Math.round(value), m = Math.floor(total / 60), sec = total % 60;
            return m + ':' + (sec < 10 ? '0' : '') + sec;
        }
        var r = Math.round(value * 100) / 100;
        var parts = String(r).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        var s = parts.join('.');
        if (unit === 'moves') { return s + (r === 1 ? ' move' : ' moves'); }
        if (unit === 'level') { return 'Level ' + s; }
        return s;
    }

    var api = {
        register: register,
        submit: submit,
        best: best,
        list: list,
        listAll: listAll,
        reset: reset,
        resetAll: resetAll,
        exportJSON: exportJSON,
        exportObject: exportObject, importJSON: importJSON,
        celebrate: celebrate,
        format: format,
        isPersistent: isPersistent,
        KEY: KEY,
        UNITS: UNITS
    };
    root.FongScores = api;
})(window);
