/**
 * Theme engine public API: window.FongTheme.
 *   getConfig()        copy of the active config
 *   setConfig(obj)     validate, apply and save. Returns { ok, config, report }
 *   applyConfig(obj)   validate and apply for this visit only (not saved)
 *   exportJSON()       the active config as JSON text
 *   importJSON(text)   validate only, NEVER applies. Returns { ok, config, report }
 *   reset()            forget the saved theme and go back to the default
 *   listSkins(), listPalettes()
 * plus onChange(fn), contrastReport(cfg), fixContrast(cfg), effectivePalette(cfg),
 * isPersistent(), isDefault(cfg). Load after loader.js, palettes.js, validate.js
 * and (for id checks) js/catalog.js. Strict ES5. No network.
 */
(function (w) {
    'use strict';

    var Core = w.FongThemeCore;
    var V = w.FongThemeValidate;
    var P = w.FongPalettes;
    var KEY = Core.KEY;
    var has = Object.prototype.hasOwnProperty;

    var SKINS = [
        { id: 'classic', name: 'Classic', blurb: 'The F.O.N.G. look you know.' },
        { id: 'print-shop', name: 'Print Shop', blurb: 'Zine and risograph. Sticker cards on paper.' }
    ];

    var persistent = true;
    var listeners = [];
    var current = V.defaultConfig();

    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function stableString(o) { return JSON.stringify(o); }

    function readStored() {
        try {
            var s = w.localStorage.getItem(KEY);
            persistent = true;
            return s;
        } catch (e) { persistent = false; return null; }
    }
    function writeStored(cfg) {
        try {
            if (stableString(cfg) === stableString(V.defaultConfig())) w.localStorage.removeItem(KEY);
            else w.localStorage.setItem(KEY, JSON.stringify(cfg));
            persistent = true;
        } catch (e) { persistent = false; }
    }

    function isDefault(cfg) { return stableString(cfg) === stableString(V.defaultConfig()); }

    function render() {
        try { Core.applyStyle(Core.styleFor(current)); } catch (e) { /* keep page usable */ }
        for (var i = 0; i < listeners.length; i++) {
            try { listeners[i](clone(current)); } catch (e2) { /* a bad listener must not stop the others */ }
        }
    }

    function applyConfig(obj) {
        var res = V.validate(obj);
        if (res.ok) { current = res.config; render(); }
        return res;
    }
    function setConfig(obj) {
        var res = applyConfig(obj);
        if (res.ok) writeStored(current);
        return res;
    }
    function importJSON(text) {
        if (typeof text !== 'string') return { ok: false, config: null, report: { errors: ['Nothing to import.'], warnings: [], dropped: [], notes: [] } };
        return V.validate(text);
    }
    function exportJSON() { return JSON.stringify(current, null, 2) + '\n'; }
    function reset() {
        try { w.localStorage.removeItem(KEY); } catch (e) { /* blocked */ }
        current = V.defaultConfig();
        render();
    }

    // ---- colors and contrast --------------------------------------------
    function effectivePalette(cfg) {
        var base = P.skinDefaults((cfg && cfg.skin) || 'classic');
        var pal = (cfg && cfg.palette) || {};
        for (var i = 0; i < Core.TOKENS.length; i++) {
            var k = Core.TOKENS[i];
            if (has.call(pal, k)) base[k] = pal[k];
        }
        return base;
    }
    var PAIRS = [
        { id: 'text-bg', label: 'Text on background', fg: 'text', bg: 'bg' },
        { id: 'text-surface', label: 'Text on cards', fg: 'text', bg: 'surface' },
        { id: 'dim-bg', label: 'Small text on background', fg: 'dim', bg: 'bg' },
        { id: 'dim-surface', label: 'Small text on cards', fg: 'dim', bg: 'surface' }
    ];
    /** List of { id, label, ratio, ok, fixToken, fixValue }. Needs 4.5 to 1 for text. */
    function contrastReport(cfg) {
        var eff = effectivePalette(cfg), out = [];
        for (var i = 0; i < PAIRS.length; i++) {
            var pr = PAIRS[i];
            var ratio = Core.contrast(eff[pr.fg], eff[pr.bg]);
            var ok = ratio >= 4.5;
            out.push({
                id: pr.id, label: pr.label, ratio: Math.round(ratio * 100) / 100, ok: ok,
                fixToken: pr.fg, fixValue: ok ? eff[pr.fg] : Core.fixText(eff[pr.fg], eff[pr.bg], 4.5)
            });
        }
        return out;
    }
    /** Returns a new config with failing text colors nudged until they pass. Does not apply it. */
    function fixContrast(cfg) {
        var next = clone(cfg), pass;
        for (pass = 0; pass < 2; pass++) {
            var rep = contrastReport(next);
            for (var i = 0; i < rep.length; i++) {
                if (!rep[i].ok) {
                    // Fix the text color against the worst of its backgrounds.
                    var tok = rep[i].fixToken;
                    var fixed = Core.fixText(effectivePalette(next)[tok], effectivePalette(next).bg, 4.5);
                    fixed = Core.fixText(fixed, effectivePalette(next).surface, 4.5);
                    fixed = Core.fixText(fixed, effectivePalette(next).bg, 4.5);
                    next.palette[tok] = fixed;
                }
            }
        }
        return next;
    }

    // ---- recovery banner (?theme=default or ?safe=1) ---------------------
    function showRecovery() {
        if (!w.document.body || w.document.getElementById('theme-recovery')) return;
        var bar = w.document.createElement('div');
        bar.id = 'theme-recovery';
        bar.setAttribute('role', 'status');
        var msg = w.document.createElement('span');
        msg.textContent = 'Your saved theme is switched off for this visit.';
        var resetBtn = w.document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.textContent = 'Reset saved theme';
        resetBtn.addEventListener('click', function () { reset(); if (bar.parentNode) bar.parentNode.removeChild(bar); });
        var keepBtn = w.document.createElement('button');
        keepBtn.type = 'button';
        keepBtn.textContent = 'Dismiss';
        keepBtn.addEventListener('click', function () { if (bar.parentNode) bar.parentNode.removeChild(bar); });
        bar.appendChild(msg); bar.appendChild(resetBtn); bar.appendChild(keepBtn);
        w.document.body.insertBefore(bar, w.document.body.firstChild);
    }

    // ---- start ------------------------------------------------------------
    var boot = w.FongThemeBoot || { ignored: false };
    var stored = readStored();
    if (!boot.ignored && stored) {
        var res = V.validate(stored);
        if (res.ok) current = res.config;
    }
    // Make the page match the fully validated config (loader used a light pass).
    try { Core.applyStyle(Core.styleFor(current)); } catch (e) { /* ignore */ }

    if (boot.ignored && stored) {
        if (w.document.readyState === 'loading') w.document.addEventListener('DOMContentLoaded', showRecovery);
        else showRecovery();
    }

    w.FongTheme = {
        getConfig: function () { return clone(current); },
        setConfig: setConfig,
        applyConfig: applyConfig,
        exportJSON: exportJSON, importJSON: importJSON,
        reset: reset,
        listSkins: function () { return clone(SKINS); },
        listPalettes: function () { return clone(P.list); },
        onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
        contrastReport: contrastReport,
        fixContrast: fixContrast,
        effectivePalette: effectivePalette,
        isPersistent: function () { return persistent; },
        isDefault: isDefault,
        safeMode: !!boot.ignored
    };
})(window);
