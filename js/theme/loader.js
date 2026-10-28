/**
 * Theme loader. Tiny and synchronous. Load in <head> BEFORE the stylesheets so
 * there is no flash. Reads the saved theme (localStorage "fong_theme_v1"),
 * keeps only whitelisted values, and sets data-* attributes and CSS variables
 * on <html>. Also exposes window.FongThemeCore (color math and the
 * config -> style mapping) that apply.js and the panel reuse.
 * With no saved theme it sets only data-skin="classic", so the page is
 * exactly the stylesheet defaults. Strict ES5. No network.
 */
(function (w) {
    'use strict';

    var KEY = 'fong_theme_v1';
    var MAX_BYTES = 65536;
    var SKINS = ['classic', 'print-shop'];
    var TOKENS = ['bg', 'surface', 'text', 'dim', 'accent', 'accent2', 'border', 'games', 'tools', 'wos', 'more'];
    var GROUP_TOKENS = ['games', 'tools', 'wos', 'more'];
    var HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    var FONTS = {
        system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        inter: "'Inter', sans-serif",
        grotesk: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
        mono: "'Space Mono', ui-monospace, Menlo, monospace",
        serif: "Georgia, 'Times New Roman', serif"
    };
    var SHADOWS = ['none', 'soft', 'hard'];
    var DENSITIES = { compact: 0.78, cozy: 1, roomy: 1.3 };
    var BACKGROUNDS = ['none', 'dots', 'grid', 'paper', 'stripes'];
    var MOTIONS = ['full', 'reduced', 'off'];
    var has = Object.prototype.hasOwnProperty;

    function inList(list, v) { return typeof v === 'string' && list.indexOf(v) !== -1; }

    // ---- color math ------------------------------------------------------
    function parseHex(h) {
        if (typeof h !== 'string' || !HEX.test(h)) return null;
        h = h.slice(1);
        if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    function toHex(rgb) {
        var s = '#';
        for (var i = 0; i < 3; i++) {
            var v = Math.max(0, Math.min(255, Math.round(rgb[i])));
            s += (v < 16 ? '0' : '') + v.toString(16);
        }
        return s;
    }
    function norm(h) { var p = parseHex(h); return p ? toHex(p) : null; }
    function lin(c) { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    function lum(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
    function contrast(a, b) {
        var pa = parseHex(a), pb = parseHex(b);
        if (!pa || !pb) return 0;
        var la = lum(pa), lb = lum(pb);
        var hi = Math.max(la, lb), lo = Math.min(la, lb);
        return (hi + 0.05) / (lo + 0.05);
    }
    function mix(a, b, t) {
        var pa = parseHex(a), pb = parseHex(b);
        if (!pa || !pb) return a;
        return toHex([pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t]);
    }
    function rgba(hex, a) {
        var p = parseHex(hex);
        return p ? 'rgba(' + p[0] + ', ' + p[1] + ', ' + p[2] + ', ' + a + ')' : hex;
    }
    function onAccent(hex) {
        return contrast(hex, '#000000') >= contrast(hex, '#ffffff') ? '#000000' : '#ffffff';
    }
    /** Nudge a text color toward black or white until it reaches min contrast on bg. */
    function fixText(text, bg, min) {
        min = min || 4.5;
        if (contrast(text, bg) >= min) return norm(text);
        var toward = onAccent(bg);
        for (var t = 0.05; t <= 1.0001; t += 0.05) {
            var c = mix(text, toward, Math.min(1, t));
            if (contrast(c, bg) >= min) return c;
        }
        return toward;
    }

    // ---- config -> CSS variables and data attributes ---------------------
    function styleFor(cfg) {
        var vars = {}, attrs = {};
        var p = (cfg && cfg.palette) || {};
        var any = false, anyGroup = false, k;
        for (var i = 0; i < TOKENS.length; i++) {
            k = TOKENS[i];
            if (has.call(p, k) && parseHex(p[k])) {
                any = true;
                if (GROUP_TOKENS.indexOf(k) !== -1) anyGroup = true;
            }
        }
        function t(name) { return has.call(p, name) && parseHex(p[name]) ? norm(p[name]) : null; }
        var bg = t('bg'), surface = t('surface'), text = t('text'), dim = t('dim'),
            accent = t('accent'), accent2 = t('accent2'), border = t('border');
        if (bg) vars['--bg-base'] = bg;
        if (surface) {
            vars['--bg-surface'] = surface;
            vars['--bg-surface-hover'] = mix(surface, lum(parseHex(surface)) < 0.4 ? '#ffffff' : '#000000', 0.08);
        }
        if (text) { vars['--text-primary'] = text; vars['--ink'] = text; vars['--shadow-ink'] = text; }
        if (dim) { vars['--text-secondary'] = dim; vars['--text-muted'] = dim; }
        if (accent) {
            var oa = onAccent(accent);
            vars['--accent-primary'] = accent;
            vars['--accent-glow'] = rgba(accent, 0.15);
            vars['--on-accent'] = oa;
            vars['--btn-color'] = oa;
            vars['--filter-active-color'] = oa;
            vars['--card-shadow-hover'] = '0 8px 32px ' + rgba(accent, 0.18);
            vars['--btn-shadow'] = '0 0 20px ' + rgba(accent, 0.3);
            vars['--accent-hover'] = mix(accent, lum(parseHex(accent)) < 0.4 ? '#ffffff' : '#000000', 0.15);
        }
        if (accent2) { vars['--accent-secondary'] = accent2; vars['--on-accent2'] = onAccent(accent2); }
        if (border) { vars['--card-border'] = border; vars['--line'] = border; vars['--nav-border'] = '1px solid ' + border; }
        for (i = 0; i < GROUP_TOKENS.length; i++) {
            if (t(GROUP_TOKENS[i])) vars['--grp-' + GROUP_TOKENS[i]] = t(GROUP_TOKENS[i]);
        }
        if (any) attrs['data-pal'] = '1';
        if (anyGroup) attrs['data-grp'] = '1';

        var sh = (cfg && cfg.shape) || {};
        if (typeof sh.radius === 'number') {
            var r = Math.max(0, Math.min(24, Math.round(sh.radius)));
            vars['--t-radius'] = r + 'px';
            vars['--radius-sm'] = Math.round(r / 2) + 'px';
            vars['--radius-md'] = r + 'px';
            vars['--radius-lg'] = r + 'px';
            attrs['data-radius'] = '1';
        }
        if (typeof sh.border === 'number') {
            var b = Math.max(0, Math.min(4, Math.round(sh.border)));
            vars['--t-bw'] = b + 'px';
            attrs['data-bw'] = '1';
        }
        if (inList(SHADOWS, sh.shadow)) attrs['data-shadow'] = sh.shadow;
        if (inList(Object.keys(DENSITIES), sh.density)) {
            vars['--t-density'] = String(DENSITIES[sh.density]);
            attrs['data-density'] = sh.density;
        }
        if (inList(BACKGROUNDS, sh.background)) attrs['data-bg'] = sh.background;

        var f = (cfg && cfg.fonts) || {};
        if (inList(Object.keys(FONTS), f.display)) vars['--font-display'] = FONTS[f.display];
        if (inList(Object.keys(FONTS), f.ui)) vars['--font-ui'] = FONTS[f.ui];

        if (cfg && inList(MOTIONS, cfg.motion)) attrs['data-motion'] = cfg.motion;
        attrs['data-skin'] = (cfg && inList(SKINS, cfg.skin)) ? cfg.skin : 'classic';
        return { vars: vars, attrs: attrs };
    }

    var applied = { vars: [], attrs: [] };
    var ALL_ATTRS = ['data-skin', 'data-pal', 'data-grp', 'data-radius', 'data-bw', 'data-shadow', 'data-density', 'data-bg', 'data-motion'];
    function applyStyle(style) {
        var root = w.document.documentElement, i;
        for (i = 0; i < applied.vars.length; i++) root.style.removeProperty(applied.vars[i]);
        for (i = 0; i < ALL_ATTRS.length; i++) root.removeAttribute(ALL_ATTRS[i]);
        applied.vars = [];
        for (var name in style.vars) {
            if (has.call(style.vars, name)) { root.style.setProperty(name, style.vars[name]); applied.vars.push(name); }
        }
        for (var a in style.attrs) {
            if (has.call(style.attrs, a)) root.setAttribute(a, style.attrs[a]);
        }
    }

    // ---- saved config (light whitelist; apply.js runs the full validator) --
    function lightClean(o) {
        var out = { skin: 'classic', palette: {}, fonts: {}, shape: {}, motion: '' };
        if (!o || typeof o !== 'object') return out;
        if (has.call(o, 'skin') && inList(SKINS, o.skin)) out.skin = o.skin;
        if (has.call(o, 'palette') && o.palette && typeof o.palette === 'object') {
            for (var i = 0; i < TOKENS.length; i++) {
                if (has.call(o.palette, TOKENS[i]) && parseHex(o.palette[TOKENS[i]])) out.palette[TOKENS[i]] = o.palette[TOKENS[i]];
            }
        }
        if (has.call(o, 'fonts') && o.fonts && typeof o.fonts === 'object') {
            if (has.call(o.fonts, 'display') && has.call(FONTS, o.fonts.display)) out.fonts.display = o.fonts.display;
            if (has.call(o.fonts, 'ui') && has.call(FONTS, o.fonts.ui)) out.fonts.ui = o.fonts.ui;
        }
        if (has.call(o, 'shape') && o.shape && typeof o.shape === 'object') {
            var s = o.shape;
            if (has.call(s, 'radius') && typeof s.radius === 'number' && s.radius >= 0 && s.radius <= 24) out.shape.radius = s.radius;
            if (has.call(s, 'border') && typeof s.border === 'number' && s.border >= 0 && s.border <= 4) out.shape.border = s.border;
            if (has.call(s, 'shadow') && inList(SHADOWS, s.shadow)) out.shape.shadow = s.shadow;
            if (has.call(s, 'density') && has.call(DENSITIES, s.density)) out.shape.density = s.density;
            if (has.call(s, 'background') && inList(BACKGROUNDS, s.background)) out.shape.background = s.background;
        }
        if (has.call(o, 'motion') && inList(MOTIONS, o.motion)) out.motion = o.motion;
        return out;
    }

    function readSaved() {
        try {
            var s = w.localStorage.getItem(KEY);
            if (!s || s.length > MAX_BYTES) return null;
            var o = JSON.parse(s);
            return (o && typeof o === 'object' && !Array.isArray(o)) ? o : null;
        } catch (e) { return null; }
    }

    var search = '';
    try { search = String(w.location.search || ''); } catch (e1) { search = ''; }
    var ignored = /[?&](?:theme=default|safe=1)(?:&|$)/.test(search);
    var saved = ignored ? null : readSaved();
    var light = lightClean(saved);
    try { applyStyle(styleFor(light)); } catch (e2) { /* page keeps stylesheet defaults */ }

    w.FongThemeCore = {
        KEY: KEY, MAX_BYTES: MAX_BYTES, SKINS: SKINS, TOKENS: TOKENS, GROUP_TOKENS: GROUP_TOKENS,
        FONTS: FONTS, SHADOWS: SHADOWS, DENSITIES: DENSITIES, BACKGROUNDS: BACKGROUNDS, MOTIONS: MOTIONS,
        parseHex: parseHex, toHex: toHex, norm: norm, contrast: contrast, mix: mix, onAccent: onAccent,
        fixText: fixText, styleFor: styleFor, applyStyle: applyStyle
    };
    w.FongThemeBoot = { ignored: ignored, hadSaved: !!saved };
})(window);
