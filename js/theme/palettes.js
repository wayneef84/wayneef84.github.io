/**
 * Named palettes for the homepage theme engine (see docs/THEMING_SPEC.md section 4).
 * Data only. Load after js/theme/loader.js. Exposes window.FongPalettes.
 * Strict ES5.
 */
(function (w) {
    'use strict';

    var Core = w.FongThemeCore;

    // bg, surface, text, dim, accent, accent2 are from the spec. border and the
    // four group colors are derived below so every palette is complete.
    var RAW = [
        { id: 'tomato-soup', name: 'Tomato Soup', bg: '#FBEFDC', surface: '#FFF8EC', text: '#2B1B14', dim: '#6B5547', accent: '#D8432B', accent2: '#2F6F68' },
        { id: 'pond-light', name: 'Pond Light', bg: '#0E2A2A', surface: '#153838', text: '#E6F2E4', dim: '#9DB8AE', accent: '#F2C14E', accent2: '#7FD1B9' },
        { id: 'laundromat', name: 'Laundromat', bg: '#EAF3F5', surface: '#FFFFFF', text: '#12303A', dim: '#4F6B75', accent: '#1B7F9E', accent2: '#C23B73' },
        { id: 'sunday-paper', name: 'Sunday Paper', bg: '#F1EDE4', surface: '#FAF8F2', text: '#1D1D1B', dim: '#5C5A54', accent: '#B3261E', accent2: '#1F4E8C' },
        { id: 'night-shift', name: 'Night Shift', bg: '#14110F', surface: '#201B18', text: '#F0E6D8', dim: '#A3968A', accent: '#FF8A3D', accent2: '#8FD694' },
        { id: 'bus-seat', name: 'Bus Seat', bg: '#1F2F7A', surface: '#2B3E96', text: '#FFF4D6', dim: '#C9D0F0', accent: '#FFC20E', accent2: '#FF8A8A' },
        { id: 'mint-chip', name: 'Mint Chip', bg: '#E7F5EC', surface: '#F7FFF9', text: '#17352A', dim: '#4A6B5A', accent: '#1F8A5B', accent2: '#8A4B2A' },
        { id: 'chalkboard', name: 'Chalkboard', bg: '#22302A', surface: '#2C3D35', text: '#F2F0E6', dim: '#A9B8AE', accent: '#F7D56E', accent2: '#F28F8F' },
        { id: 'bubblegum', name: 'Bubblegum', bg: '#FFE3F0', surface: '#FFF5FA', text: '#3F0D2B', dim: '#8A2F63', accent: '#C21874', accent2: '#6A45C9' },
        { id: 'unicorn-dusk', name: 'Unicorn Dusk', bg: '#2A1038', surface: '#3A1B4C', text: '#FFE9F5', dim: '#DDB0E6', accent: '#FF7EC0', accent2: '#9EE6D0' }
    ];

    function complete(p) {
        var t = {
            bg: Core.norm(p.bg), surface: Core.norm(p.surface), text: Core.norm(p.text),
            dim: Core.norm(p.dim), accent: Core.norm(p.accent), accent2: Core.norm(p.accent2)
        };
        t.border = Core.mix(t.bg, t.text, 0.22);
        t.games = t.accent;
        t.tools = t.accent2;
        t.wos = Core.mix(t.accent, t.accent2, 0.5);
        t.more = t.dim;
        return t;
    }

    // Classic = today's look (values read from css/components/global.css)
    var CLASSIC = {
        id: 'classic', name: 'Classic',
        tokens: {
            bg: '#0f1117', surface: '#1a1d27', text: '#f3f4f6', dim: '#9ca3af',
            accent: '#00e5ff', accent2: '#ff0055', border: '#252831',
            games: '#10b981', tools: '#64748b', wos: '#e11d48', more: '#9ca3af'
        }
    };

    var LIST = [CLASSIC];
    for (var i = 0; i < RAW.length; i++) LIST.push({ id: RAW[i].id, name: RAW[i].name, tokens: complete(RAW[i]) });

    /** Palette used by each skin when the config sets no colors. */
    var SKIN_DEFAULT = { 'classic': 'classic', 'print-shop': 'tomato-soup', 'cabinet': 'sunday-paper', 'control-panel': 'night-shift', 'metro-map': 'laundromat', 'handheld': 'mint-chip', 'scrapbook': 'pond-light' };

    function get(id) {
        for (var k = 0; k < LIST.length; k++) if (LIST[k].id === id) return LIST[k];
        return null;
    }
    function copyTokens(t) {
        var o = {};
        for (var key in t) if (Object.prototype.hasOwnProperty.call(t, key)) o[key] = t[key];
        return o;
    }
    /** All tokens a skin shows when nothing is overridden. */
    function skinDefaults(skin) {
        var p = get(Object.prototype.hasOwnProperty.call(SKIN_DEFAULT, skin) ? SKIN_DEFAULT[skin] : 'classic');
        return copyTokens(p.tokens);
    }

    w.FongPalettes = { list: LIST, get: get, skinDefault: SKIN_DEFAULT, skinDefaults: skinDefaults, copyTokens: copyTokens };
})(window);
