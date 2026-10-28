/**
 * Strict validator for the theme JSON (docs/THEMING_SPEC.md section 7).
 * Imported data is never trusted: every field is checked against a whitelist,
 * unknown keys are dropped and reported, and the result is a fresh object.
 * Text is returned as plain strings. It must only ever be shown with
 * textContent or an escape function. Exposes window.FongThemeValidate.
 * Load after js/theme/loader.js. Strict ES5.
 */
(function (w) {
    'use strict';

    var Core = w.FongThemeCore;
    var has = Object.prototype.hasOwnProperty;

    var LIMITS = {
        fileBytes: 65536, cssBytes: 8192, jsBytes: 16384, name: 40, groups: 12,
        itemsPerGroup: 40, hidden: 200, pinned: 12, labels: 400, order: 24,
        depth: 8, nodes: 20000
    };
    var FORMAT = 'fong-theme';
    var VERSION = 1;
    var TOP_KEYS = ['format', 'version', 'name', 'skin', 'palette', 'fonts', 'shape', 'motion', 'labels',
        'groups', 'order', 'hidden', 'pinned', 'behaviors', 'css', 'js'];
    var BUILTIN_GROUPS = ['games', 'tools', 'wos', 'more'];
    // 'pinned' is the favorites section. These ids cannot be used by custom groups.
    var RESERVED = BUILTIN_GROUPS.concat(['pinned', 'site-title', 'customize', 'home', 'search']);
    // These must always stay visible. They cannot be hidden or renamed by theme data.
    var PROTECTED = ['customize', 'home', 'search'];
    var HUB_IDS = ['hub-arcade', 'hub-cards', 'hub-puzzle', 'hub-edu', 'hub-games-all', 'hub-projects',
        'hub-tools-all', 'hub-wosky', 'hub-wos-all', 'hub-more', 'hub-profile'];
    var BEHAVIORS = ['sortMostPlayed', 'showPlayCounts', 'showNewBadges', 'showJustAdded'];
    var DANGEROUS = ['__proto__', 'constructor', 'prototype'];
    var ID_RE = /^[a-z0-9-]{1,24}$/;
    var CATALOG_ID_RE = /^[A-Za-z0-9_.-]{1,80}$/;

    function defaultConfig() {
        return {
            format: FORMAT, version: VERSION, name: '', skin: 'classic', palette: {}, fonts: {}, shape: {},
            motion: 'full', labels: {}, groups: [], order: [], hidden: [], pinned: [],
            behaviors: { sortMostPlayed: false, showPlayCounts: false, showNewBadges: true, showJustAdded: true },
            css: '', js: ''
        };
    }

    function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
    function byteLen(s) {
        try { return unescape(encodeURIComponent(s)).length; } catch (e) { return s.length * 3; }
    }

    /** Walk the parsed tree. Returns an error string if a dangerous key, too much depth or too many nodes. */
    function scan(v) {
        var count = 0;
        function rec(x, depth) {
            if (++count > LIMITS.nodes) return 'file has too many entries';
            if (depth > LIMITS.depth) return 'file is nested too deeply';
            if (x === null || typeof x !== 'object') return '';
            var keys = Object.keys(x), r;
            for (var i = 0; i < keys.length; i++) {
                if (DANGEROUS.indexOf(keys[i]) !== -1) return 'forbidden key "' + keys[i] + '"';
                r = rec(x[keys[i]], depth + 1);
                if (r) return r;
            }
            return '';
        }
        return rec(v, 0);
    }

    /** Control, zero-width and direction-override characters. */
    function invisible(n) {
        return n < 32 || (n >= 127 && n <= 159) || n === 0x2028 || n === 0x2029 || (n >= 0x200b && n <= 0x200f) ||
            (n >= 0x202a && n <= 0x202e) || (n >= 0x2066 && n <= 0x2069) || n === 0xfeff;
    }

    /** Clean a name: plain text only, no control characters, no angle brackets. Returns '' if nothing is left. */
    function cleanName(s, notes, where) {
        if (typeof s !== 'string') return '';
        var out = '';
        for (var c = 0; c < s.length; c++) { if (!invisible(s.charCodeAt(c))) out += s.charAt(c); }
        if (out.length !== s.length && notes) notes.push(where + ': removed hidden or control characters');
        if (/[<>]/.test(out)) { out = out.replace(/[<>]/g, ''); if (notes) notes.push(where + ': removed < and > characters'); }
        return out.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
    }

    function catalogIds() {
        var set = Object.create(null), c = w.FONG_CATALOG;
        if (c && typeof c.length === 'number') {
            for (var i = 0; i < c.length; i++) if (c[i] && typeof c[i].id === 'string') set[c[i].id] = true;
        }
        return set;
    }

    /**
     * validate(input, opts). input: a JSON string or an already parsed value.
     * opts.catalogIds: optional map of valid ids (defaults to FONG_CATALOG).
     * Returns { ok, config, report: { errors, warnings, dropped, notes } }.
     * ok is false only when nothing can be used (config is then null).
     */
    function validate(input, opts) {
        var report = { errors: [], warnings: [], dropped: [], notes: [] };
        function fail(msg) { report.errors.push(msg); return { ok: false, config: null, report: report }; }
        var ids = (opts && opts.catalogIds) || catalogIds();
        var raw = input;

        if (typeof input === 'string') {
            if (byteLen(input) > LIMITS.fileBytes) return fail('File is too big (limit is 64 KB).');
            try { raw = JSON.parse(input); } catch (e) { return fail('This is not valid JSON.'); }
        }
        if (!isObj(raw)) return fail('The theme must be a JSON object.');
        var bad = scan(raw);
        if (bad) return fail('Rejected: ' + bad + '.');
        if (raw.format !== FORMAT) return fail('This is not a F.O.N.G. theme file (format must be "' + FORMAT + '").');
        if (typeof raw.version !== 'number' || raw.version !== Math.floor(raw.version) || raw.version < 1) {
            return fail('The version number is missing or not valid.');
        }
        if (raw.version > VERSION) return fail('This theme is from a newer version (' + raw.version + '). This site understands version ' + VERSION + ' only. Update the site first.');

        var cfg = defaultConfig();
        var k, i, v;

        for (k in raw) {
            if (has.call(raw, k) && TOP_KEYS.indexOf(k) === -1) report.dropped.push('Unknown key "' + String(k).slice(0, 40) + '" was ignored.');
        }

        // name
        if (has.call(raw, 'name')) {
            var nm = cleanName(raw.name, report.notes, 'name');
            if (typeof raw.name !== 'string') report.dropped.push('name: must be text.');
            else if (nm.length > LIMITS.name) { report.dropped.push('name: longer than 40 characters.'); }
            else cfg.name = nm;
        }
        // skin
        if (has.call(raw, 'skin')) {
            if (Core.SKINS.indexOf(raw.skin) !== -1) cfg.skin = raw.skin;
            else report.dropped.push('skin: unknown skin, using Classic.');
        }
        // palette
        if (has.call(raw, 'palette')) {
            if (!isObj(raw.palette)) report.dropped.push('palette: must be an object.');
            else {
                for (k in raw.palette) {
                    if (!has.call(raw.palette, k)) continue;
                    if (Core.TOKENS.indexOf(k) === -1) { report.dropped.push('palette.' + String(k).slice(0, 20) + ': unknown color name.'); continue; }
                    var hx = Core.norm(raw.palette[k]);
                    if (typeof raw.palette[k] !== 'string' || !hx) report.dropped.push('palette.' + k + ': must be #RGB or #RRGGBB.');
                    else cfg.palette[k] = hx;
                }
            }
        }
        // fonts
        if (has.call(raw, 'fonts')) {
            if (!isObj(raw.fonts)) report.dropped.push('fonts: must be an object.');
            else {
                for (k in raw.fonts) {
                    if (!has.call(raw.fonts, k)) continue;
                    if (k !== 'display' && k !== 'ui') { report.dropped.push('fonts.' + String(k).slice(0, 20) + ': unknown.'); continue; }
                    if (typeof raw.fonts[k] === 'string' && has.call(Core.FONTS, raw.fonts[k])) cfg.fonts[k] = raw.fonts[k];
                    else report.dropped.push('fonts.' + k + ': not a bundled font.');
                }
            }
        }
        // shape
        if (has.call(raw, 'shape')) {
            if (!isObj(raw.shape)) report.dropped.push('shape: must be an object.');
            else {
                var sh = raw.shape;
                for (k in sh) {
                    if (!has.call(sh, k)) continue;
                    v = sh[k];
                    if (k === 'radius') {
                        if (typeof v === 'number' && v >= 0 && v <= 24 && v === Math.floor(v)) cfg.shape.radius = v;
                        else report.dropped.push('shape.radius: whole number from 0 to 24.');
                    } else if (k === 'border') {
                        if (typeof v === 'number' && v >= 0 && v <= 4 && v === Math.floor(v)) cfg.shape.border = v;
                        else report.dropped.push('shape.border: whole number from 0 to 4.');
                    } else if (k === 'shadow') {
                        if (Core.SHADOWS.indexOf(v) !== -1) cfg.shape.shadow = v; else report.dropped.push('shape.shadow: none, soft or hard.');
                    } else if (k === 'density') {
                        if (typeof v === 'string' && has.call(Core.DENSITIES, v)) cfg.shape.density = v; else report.dropped.push('shape.density: compact, cozy or roomy.');
                    } else if (k === 'background') {
                        if (Core.BACKGROUNDS.indexOf(v) !== -1) cfg.shape.background = v; else report.dropped.push('shape.background: none, dots, grid, paper or stripes.');
                    } else report.dropped.push('shape.' + String(k).slice(0, 20) + ': unknown.');
                }
            }
        }
        // motion
        if (has.call(raw, 'motion')) {
            if (Core.MOTIONS.indexOf(raw.motion) !== -1) cfg.motion = raw.motion;
            else report.dropped.push('motion: full, reduced or off.');
        }

        // groups (before labels, order, hidden, which refer to group ids)
        var groupIds = Object.create(null);
        if (has.call(raw, 'groups')) {
            if (!Array.isArray(raw.groups)) report.dropped.push('groups: must be a list.');
            else {
                if (raw.groups.length > LIMITS.groups) report.dropped.push('groups: only the first 12 are used, ' + (raw.groups.length - LIMITS.groups) + ' ignored.');
                var gmax = Math.min(raw.groups.length, LIMITS.groups);
                for (i = 0; i < gmax; i++) {
                    var g = raw.groups[i];
                    if (!isObj(g)) { report.dropped.push('groups[' + i + ']: must be an object.'); continue; }
                    var gid = g.id;
                    if (typeof gid !== 'string' || !ID_RE.test(gid)) { report.dropped.push('groups[' + i + ']: id must be 1 to 24 characters of a-z, 0-9 and "-".'); continue; }
                    if (RESERVED.indexOf(gid) !== -1) { report.dropped.push('groups[' + i + ']: id "' + gid + '" is reserved.'); continue; }
                    if (ids[gid] === true || gid.indexOf('hub-') === 0) { report.dropped.push('groups[' + i + ']: id "' + gid + '" is already used by an app, pick another.'); continue; }
                    if (groupIds[gid]) { report.dropped.push('groups[' + i + ']: id "' + gid + '" is used twice.'); continue; }
                    var glabel = cleanName(g.label, report.notes, 'groups[' + i + '].label');
                    if (glabel.length > LIMITS.name) { report.dropped.push('groups[' + i + '].label: longer than 40 characters, using the id.'); glabel = ''; }
                    var items = [], seen = Object.create(null);
                    if (g.items !== undefined && !Array.isArray(g.items)) report.dropped.push('groups[' + i + '].items: must be a list.');
                    else if (g.items) {
                        var unknown = [], over = 0;
                        for (var j = 0; j < g.items.length && j < 2000; j++) {
                            var it = g.items[j];
                            if (typeof it !== 'string' || !CATALOG_ID_RE.test(it) || !ids[it]) { unknown.push(typeof it === 'string' ? it.slice(0, 40) : '(not text)'); continue; }
                            if (seen[it]) continue;
                            if (items.length >= LIMITS.itemsPerGroup) { over++; continue; }
                            seen[it] = true; items.push(it);
                        }
                        if (unknown.length) report.dropped.push('groups[' + i + ']: unknown item ids dropped: ' + unknown.slice(0, 10).join(', ') + (unknown.length > 10 ? ' and ' + (unknown.length - 10) + ' more' : '') + '.');
                        if (over) report.dropped.push('groups[' + i + ']: only 40 items per group, ' + over + ' ignored.');
                    }
                    groupIds[gid] = true;
                    cfg.groups.push({ id: gid, label: glabel || gid, items: items });
                }
            }
        }

        function knownGroup(id) { return BUILTIN_GROUPS.indexOf(id) !== -1 || id === 'pinned' || groupIds[id] === true; }

        // labels
        if (has.call(raw, 'labels')) {
            if (!isObj(raw.labels)) report.dropped.push('labels: must be an object.');
            else {
                var lkeys = Object.keys(raw.labels), lcount = 0;
                for (i = 0; i < lkeys.length; i++) {
                    k = lkeys[i];
                    if (lcount >= LIMITS.labels) { report.dropped.push('labels: only the first 400 are used.'); break; }
                    var okKey = k === 'site-title' || knownGroup(k) || HUB_IDS.indexOf(k) !== -1 || (CATALOG_ID_RE.test(k) && ids[k] === true);
                    if (!okKey) { report.dropped.push('labels."' + k.slice(0, 40) + '": unknown id' + (PROTECTED.indexOf(k) !== -1 ? ' (this item cannot be renamed)' : '') + '.'); continue; }
                    if (typeof raw.labels[k] !== 'string') { report.dropped.push('labels.' + k + ': must be text.'); continue; }
                    var lv = cleanName(raw.labels[k], report.notes, 'labels.' + k);
                    if (!lv) { report.dropped.push('labels.' + k + ': empty name.'); continue; }
                    if (lv.length > LIMITS.name) { report.dropped.push('labels.' + k + ': longer than 40 characters.'); continue; }
                    cfg.labels[k] = lv; lcount++;
                }
            }
        }
        // order
        if (has.call(raw, 'order')) {
            if (!Array.isArray(raw.order)) report.dropped.push('order: must be a list.');
            else {
                var oseen = Object.create(null);
                for (i = 0; i < raw.order.length && i < 200; i++) {
                    var o = raw.order[i];
                    if (typeof o !== 'string' || !knownGroup(o)) { report.dropped.push('order: unknown group "' + (typeof o === 'string' ? o.slice(0, 24) : '?') + '".'); continue; }
                    if (oseen[o]) continue;
                    if (cfg.order.length >= LIMITS.order) { report.dropped.push('order: too many entries.'); break; }
                    oseen[o] = true; cfg.order.push(o);
                }
            }
        }
        // hidden
        if (has.call(raw, 'hidden')) {
            if (!Array.isArray(raw.hidden)) report.dropped.push('hidden: must be a list.');
            else {
                var hseen = Object.create(null), hover = 0;
                for (i = 0; i < raw.hidden.length && i < 2000; i++) {
                    var hd = raw.hidden[i];
                    if (typeof hd === 'string' && PROTECTED.indexOf(hd) !== -1) { report.dropped.push('hidden: "' + hd + '" must always stay visible.'); continue; }
                    if (typeof hd !== 'string' || !(knownGroup(hd) || HUB_IDS.indexOf(hd) !== -1 || (CATALOG_ID_RE.test(hd) && ids[hd] === true))) {
                        report.dropped.push('hidden: unknown id "' + (typeof hd === 'string' ? hd.slice(0, 40) : '?') + '".'); continue;
                    }
                    if (hseen[hd]) continue;
                    if (cfg.hidden.length >= LIMITS.hidden) { hover++; continue; }
                    hseen[hd] = true; cfg.hidden.push(hd);
                }
                if (hover) report.dropped.push('hidden: only 200 are used, ' + hover + ' ignored.');
            }
        }
        // pinned
        if (has.call(raw, 'pinned')) {
            if (!Array.isArray(raw.pinned)) report.dropped.push('pinned: must be a list.');
            else {
                var pseen = Object.create(null), pover = 0, punk = [];
                for (i = 0; i < raw.pinned.length && i < 2000; i++) {
                    var pn = raw.pinned[i];
                    if (typeof pn !== 'string' || !CATALOG_ID_RE.test(pn) || ids[pn] !== true) { punk.push(typeof pn === 'string' ? pn.slice(0, 40) : '?'); continue; }
                    if (pseen[pn]) continue;
                    if (cfg.pinned.length >= LIMITS.pinned) { pover++; continue; }
                    pseen[pn] = true; cfg.pinned.push(pn);
                }
                if (punk.length) report.dropped.push('pinned: unknown ids dropped: ' + punk.slice(0, 10).join(', ') + '.');
                if (pover) report.dropped.push('pinned: only 12 are used, ' + pover + ' ignored.');
            }
        }
        // behaviors
        if (has.call(raw, 'behaviors')) {
            if (!isObj(raw.behaviors)) report.dropped.push('behaviors: must be an object.');
            else {
                for (k in raw.behaviors) {
                    if (!has.call(raw.behaviors, k)) continue;
                    if (BEHAVIORS.indexOf(k) === -1) { report.dropped.push('behaviors.' + String(k).slice(0, 20) + ': unknown.'); continue; }
                    if (typeof raw.behaviors[k] === 'boolean') cfg.behaviors[k] = raw.behaviors[k];
                    else report.dropped.push('behaviors.' + k + ': must be true or false.');
                }
            }
        }
        // css and js: accepted by the schema, ignored in this version
        var hadCode = false;
        if (has.call(raw, 'css')) {
            if (typeof raw.css !== 'string') report.dropped.push('css: must be text.');
            else if (raw.css.length) hadCode = true;
        }
        if (has.call(raw, 'js')) {
            if (typeof raw.js !== 'string') report.dropped.push('js: must be text.');
            else if (raw.js.length) hadCode = true;
        }
        if (hadCode) report.warnings.push('Custom CSS and scripts are not supported yet. The "css" and "js" fields were removed.');

        return { ok: true, config: cfg, report: report };
    }

    /** Plain-text lines for showing a report. */
    function reportLines(report) {
        var out = [], i;
        for (i = 0; i < report.errors.length; i++) out.push('Error: ' + report.errors[i]);
        for (i = 0; i < report.warnings.length; i++) out.push('Note: ' + report.warnings[i]);
        for (i = 0; i < report.dropped.length; i++) out.push('Removed: ' + report.dropped[i]);
        for (i = 0; i < report.notes.length; i++) out.push('Cleaned: ' + report.notes[i]);
        return out;
    }

    w.FongThemeValidate = {
        validate: validate, defaultConfig: defaultConfig, reportLines: reportLines, cleanName: cleanName,
        LIMITS: LIMITS, FORMAT: FORMAT, VERSION: VERSION, BUILTIN_GROUPS: BUILTIN_GROUPS, RESERVED: RESERVED,
        PROTECTED: PROTECTED, HUB_IDS: HUB_IDS, BEHAVIORS: BEHAVIORS
    };
})(window);
