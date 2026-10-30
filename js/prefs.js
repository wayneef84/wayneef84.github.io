/**
 * FongPrefs - tiny shared preferences for every page. One global: window.FongPrefs.
 * Strict ES5. On-device only (localStorage key "fong.prefs.v1"), memory fallback if blocked.
 * Today there is one pref: calm (boolean). Games MAY read it, none are required to.
 *   if (window.FongPrefs && FongPrefs.get('calm')) { ...gentler motion and sound... }
 * It also sets data-calm="1" on <html> while calm is on, so CSS can react.
 * Docs: docs/SETTINGS.md
 */
(function (root) {
    'use strict';

    var KEY = 'fong.prefs.v1';
    var mem = null;

    function read() {
        var out = { calm: false };
        var raw = null;
        try { raw = root.localStorage.getItem(KEY); } catch (e) { raw = null; }
        if (raw === null && mem !== null) { raw = mem; }
        if (raw) {
            try {
                var o = JSON.parse(raw);
                if (o && typeof o === 'object') { out.calm = o.calm === true; }
            } catch (e2) { /* corrupt: defaults */ }
        }
        return out;
    }

    function mark(p) {
        var h = root.document && root.document.documentElement;
        if (!h) { return; }
        if (p.calm) { h.setAttribute('data-calm', '1'); } else { h.removeAttribute('data-calm'); }
    }

    function get(name) {
        var p = read();
        return name === 'calm' ? p.calm : undefined;
    }

    function set(name, value) {
        if (name !== 'calm') { return false; }
        var p = read();
        p.calm = value === true;
        var s = JSON.stringify(p);
        mem = s;
        try { root.localStorage.setItem(KEY, s); } catch (e) { /* stays in memory this visit */ }
        mark(p);
        return true;
    }

    /** Replace all prefs from an already-parsed object (used by Import everything). */
    function load(obj) {
        if (!obj || typeof obj !== 'object') { return false; }
        return set('calm', obj.calm === true);
    }

    mark(read());
    root.FongPrefs = { get: get, set: set, all: read, load: load, KEY: KEY };
})(window);
