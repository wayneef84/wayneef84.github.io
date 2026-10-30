/**
 * F.O.N.G. Jigsaw - model.js (pure, no DOM)
 *
 * New game state, table layout, save/restore (serialize), puzzle-file import
 * validation and the zoom/pan view maths.
 */
(function (root) {
    'use strict';

    var isNode = typeof module === 'object' && module && module.exports;
    var G = isNode ? require('./geometry.js') : root.FongJigsaw.Geometry;
    var Gr = isNode ? require('./groups.js') : root.FongJigsaw.Groups;

    var SAVE_VERSION = 2;
    var FILE_FORMAT = 'fong-jigsaw';
    var MAX_FILE_CHARS = 8 * 1024 * 1024;      // puzzle file text size limit
    var MAX_IMAGE_CHARS = 6 * 1024 * 1024;     // dataURL size limit inside the file
    var MAX_PIECES = 600;
    var SNAP_MIN = 0.05, SNAP_MAX = 0.5, SNAP_DEFAULT = 0.25, SNAP_LITTLE = 0.45;
    var PRESETS = [6, 12, 24, 48, 100, 150, 300];
    var LITTLE_COUNTS = [4, 6, 9, 12];
    var STYLES = ['jigsaw', 'square', 'rounded'];

    function defaultSettings() {
        return {
            count: 24, little: false, style: 'jigsaw',
            snapPct: SNAP_DEFAULT, lock: true, rotate: false,
            ghost: true, sound: true, haptics: true, showTime: false
        };
    }

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
    function isInt(v) { return typeof v === 'number' && isFinite(v) && Math.floor(v) === v; }
    function isNum(v) { return typeof v === 'number' && isFinite(v); }

    /** Clean any settings object into a safe one (unknown keys dropped) */
    function sanitizeSettings(s) {
        var d = defaultSettings();
        if (!s || typeof s !== 'object') { return d; }
        if (isInt(s.count)) { d.count = clamp(s.count, 4, 300); }
        d.little = s.little === true;
        if (STYLES.indexOf(s.style) >= 0) { d.style = s.style; }
        if (isNum(s.snapPct)) { d.snapPct = clamp(s.snapPct, SNAP_MIN, SNAP_MAX); }
        if (s.lock === false) { d.lock = false; }
        d.rotate = s.rotate === true;
        if (s.ghost === false) { d.ghost = false; }
        if (s.sound === false) { d.sound = false; }
        if (s.haptics === false) { d.haptics = false; }
        d.showTime = s.showTime === true;
        if (d.little) { d.snapPct = Math.max(d.snapPct, SNAP_LITTLE); d.count = clamp(d.count, 4, 12); }
        return d;
    }

    /** Table around the board, big enough to scatter every piece */
    function makeLayout(pz) {
        var K = 2.2 * pz.count * pz.pw * pz.ph;
        var s = 2 * (pz.bw + pz.bh);
        var m = (-s + Math.sqrt(s * s + 16 * K)) / 8;
        m = Math.max(m, 1.5 * pz.pw);
        return {
            board: { x: m, y: m, w: pz.bw, h: pz.bh },
            table: { x: 0, y: 0, w: pz.bw + 2 * m, h: pz.bh + 2 * m }
        };
    }

    /**
     * Start a new game.
     * opts: { imgW, imgH, count, style, seed, settings, rng, grid }  (grid {cols,rows} overrides count)
     */
    function newGame(opts) {
        var settings = sanitizeSettings(opts.settings);
        var count = opts.count || settings.count;
        var grid = opts.grid || G.chooseGrid(count, opts.imgW / opts.imgH);
        var pz = G.makePuzzle({
            cols: grid.cols, rows: grid.rows, imgW: opts.imgW, imgH: opts.imgH,
            seed: opts.seed || G.randomSeed(), style: opts.style || settings.style
        });
        var st = Gr.createState(pz, makeLayout(pz), settings);
        st.settings.snapPct = settings.snapPct;
        st.elapsedMs = 0;
        st.celebrated = false;
        Gr.scatter(st, opts.rng || Math.random, true);
        return st;
    }

    // ---- serialize ---------------------------------------------------------------------

    function r2(v) { return Math.round(v * 100) / 100; }

    /** Plain JSON-safe snapshot (no puzzle caches) */
    function serialize(st) {
        var gs = [], idx = {}, k, g, i, ids = [];
        for (i = 0; i < st.order.length; i++) { ids.push(st.order[i]); }
        for (i = 0; i < ids.length; i++) {
            g = st.groups[ids[i]];
            idx[g.id] = i;
            gs.push({ m: g.members.slice().sort(function (a, b) { return a - b; }), x: r2(g.ox), y: r2(g.oy), r: g.rot });
        }
        return {
            v: SAVE_VERSION,
            puzzle: {
                seed: st.pz.seed, cols: st.pz.cols, rows: st.pz.rows,
                imgW: st.pz.imgW, imgH: st.pz.imgH, style: st.pz.style
            },
            settings: {
                snapPct: st.settings.snapPct, lock: st.settings.lock, rotate: st.settings.rotate
            },
            groups: gs,   // already in z-order, bottom to top
            elapsedMs: Math.round(st.elapsedMs || 0),
            celebrated: !!st.celebrated
        };
    }

    /** Strictly validate and rebuild a state from serialize() output. Returns null if bad. */
    function deserialize(obj) {
        var i, j, p, g, seen, count, pz, st, gr, m, pid;
        if (!obj || typeof obj !== 'object' || obj.v !== SAVE_VERSION) { return null; }
        p = obj.puzzle;
        if (!p || !isInt(p.seed) || !isInt(p.cols) || !isInt(p.rows)) { return null; }
        if (p.cols < 1 || p.rows < 1 || p.cols * p.rows > MAX_PIECES) { return null; }
        if (!(p.imgW > 0) || !(p.imgH > 0) || p.imgW > 100000 || p.imgH > 100000) { return null; }
        if (STYLES.indexOf(p.style) < 0) { return null; }
        if (!obj.groups || !(obj.groups instanceof Array) || !obj.groups.length) { return null; }
        count = p.cols * p.rows;
        pz = G.makePuzzle({ cols: p.cols, rows: p.rows, imgW: p.imgW, imgH: p.imgH, seed: p.seed, style: p.style });
        var s = obj.settings || {};
        st = Gr.createState(pz, makeLayout(pz), {
            snapPct: isNum(s.snapPct) ? clamp(s.snapPct, SNAP_MIN, SNAP_MAX) : SNAP_DEFAULT,
            lock: s.lock !== false,
            rotate: s.rotate === true
        });
        seen = {};
        var lim = 100 * (pz.bw + pz.bh);
        for (i = 0; i < obj.groups.length; i++) {
            gr = obj.groups[i];
            if (!gr || !(gr.m instanceof Array) || !gr.m.length) { return null; }
            if (!isNum(gr.x) || !isNum(gr.y) || Math.abs(gr.x) > lim || Math.abs(gr.y) > lim) { return null; }
            if (!isInt(gr.r) || gr.r < 0 || gr.r > 3) { return null; }
            for (j = 0; j < gr.m.length; j++) {
                pid = gr.m[j];
                if (!isInt(pid) || pid < 0 || pid >= count || seen[pid]) { return null; }
                seen[pid] = true;
            }
        }
        for (i = 0; i < count; i++) { if (!seen[i]) { return null; } }
        // rebuild union-find
        st.groups = {}; st.order = [];
        for (i = 0; i < obj.groups.length; i++) {
            gr = obj.groups[i];
            m = gr.m.slice().sort(function (a, b) { return a - b; });
            for (j = 0; j < m.length; j++) { st.parent[m[j]] = m[0]; }
            g = { id: m[0], members: m, ox: gr.x, oy: gr.y, rot: gr.r };
            st.groups[g.id] = g;
            st.order.push(g.id);
        }
        st.elapsedMs = isNum(obj.elapsedMs) && obj.elapsedMs >= 0 ? obj.elapsedMs : 0;
        st.celebrated = obj.celebrated === true;
        // every group must keep its pieces in the same solution-connected shape: not required.
        return st;
    }

    // ---- puzzle file (export / import) -----------------------------------------------------

    var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    /** Decode the first `n` bytes of a base64 string (n <= 12) */
    function b64Head(b64, n) {
        var out = [], i = 0, a, b, c, d;
        while (out.length < n && i + 3 < b64.length + 1) {
            a = B64.indexOf(b64.charAt(i)); b = B64.indexOf(b64.charAt(i + 1));
            c = B64.indexOf(b64.charAt(i + 2)); d = B64.indexOf(b64.charAt(i + 3));
            if (a < 0 || b < 0) { break; }
            out.push(((a << 2) | (b >> 4)) & 255);
            if (c >= 0) { out.push((((b & 15) << 4) | (c >> 2)) & 255); }
            if (d >= 0 && c >= 0) { out.push((((c & 3) << 6) | d) & 255); }
            i += 4;
        }
        return out;
    }

    /** Returns 'jpeg' | 'png' | 'webp' | null for a data URL whose bytes really are that image */
    function sniffDataUrl(url) {
        if (typeof url !== 'string') { return null; }
        var m = /^data:image\/(jpeg|png|webp);base64,/.exec(url);
        if (!m) { return null; }
        var b64 = url.slice(m[0].length, m[0].length + 24);
        var h = b64Head(b64, 12);
        var kind = null;
        if (h.length >= 3 && h[0] === 0xFF && h[1] === 0xD8 && h[2] === 0xFF) { kind = 'jpeg'; }
        else if (h.length >= 8 && h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4E && h[3] === 0x47 &&
                 h[4] === 0x0D && h[5] === 0x0A && h[6] === 0x1A && h[7] === 0x0A) { kind = 'png'; }
        else if (h.length >= 12 && h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46 &&
                 h[8] === 0x57 && h[9] === 0x45 && h[10] === 0x42 && h[11] === 0x50) { kind = 'webp'; }
        return kind === m[1] ? kind : null;
    }

    function cleanName(s) {
        if (typeof s !== 'string') { return ''; }
        return s.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60);
    }

    /** Build the object saved by "Save puzzle as file". imageUrl must be a downscaled data URL. */
    function buildFile(st, imageUrl, name, settings) {
        var cleaned = sanitizeSettings(settings);
        return {
            format: FILE_FORMAT,
            version: SAVE_VERSION,
            name: cleanName(name),
            created: new Date().toISOString(),
            puzzle: {
                seed: st.pz.seed, cols: st.pz.cols, rows: st.pz.rows,
                imgW: st.pz.imgW, imgH: st.pz.imgH, style: st.pz.style
            },
            settings: {
                count: st.pz.count, little: cleaned.little, style: st.pz.style,
                snapPct: st.settings.snapPct, lock: st.settings.lock, rotate: st.settings.rotate
            },
            image: imageUrl
        };
    }

    /**
     * Strict import check. Takes the raw file TEXT. Never evaluates anything.
     * Returns { ok:true, file:{ name, puzzle, settings, image, kind } } or { ok:false, error }.
     */
    function parsePuzzleFile(text) {
        function bad(msg) { return { ok: false, error: msg }; }
        if (typeof text !== 'string') { return bad('That is not a puzzle file.'); }
        if (text.length > MAX_FILE_CHARS) { return bad('That file is too big to be a puzzle.'); }
        var obj;
        try { obj = JSON.parse(text); } catch (e) { return bad('That is not a puzzle file.'); }
        if (!obj || typeof obj !== 'object' || obj instanceof Array) { return bad('That is not a puzzle file.'); }
        if (obj.format !== FILE_FORMAT) { return bad('That is not a puzzle file.'); }
        if (obj.version !== SAVE_VERSION) { return bad('This puzzle file is from a different version.'); }
        var p = obj.puzzle;
        if (!p || typeof p !== 'object') { return bad('The puzzle file is missing its shape.'); }
        if (!isInt(p.seed) || !isInt(p.cols) || !isInt(p.rows)) { return bad('The puzzle file has a bad grid.'); }
        if (p.cols < 1 || p.rows < 1 || p.cols > 60 || p.rows > 60 || p.cols * p.rows > MAX_PIECES) {
            return bad('The puzzle file has a bad grid.');
        }
        if (!isNum(p.imgW) || !isNum(p.imgH) || p.imgW < 1 || p.imgH < 1 || p.imgW > 20000 || p.imgH > 20000) {
            return bad('The puzzle file has a bad picture size.');
        }
        if (STYLES.indexOf(p.style) < 0) { return bad('The puzzle file has an unknown piece style.'); }
        var s = obj.settings;
        if (!s || typeof s !== 'object') { return bad('The puzzle file is missing its settings.'); }
        if (!isNum(s.snapPct) || s.snapPct < SNAP_MIN || s.snapPct > SNAP_MAX) { return bad('The puzzle file has a bad setting.'); }
        if (typeof s.lock !== 'boolean' || typeof s.rotate !== 'boolean') { return bad('The puzzle file has a bad setting.'); }
        if (typeof obj.image !== 'string' || obj.image.length > MAX_IMAGE_CHARS) { return bad('The picture in the file is too big.'); }
        var kind = sniffDataUrl(obj.image);
        if (!kind) { return bad('The picture in the file is not a normal photo.'); }
        if (!/^[A-Za-z0-9+\/]+={0,2}$/.test(obj.image.slice(obj.image.indexOf(',') + 1))) {
            return bad('The picture in the file is damaged.');
        }
        return {
            ok: true,
            file: {
                name: cleanName(obj.name),
                puzzle: { seed: p.seed, cols: p.cols, rows: p.rows, imgW: p.imgW, imgH: p.imgH, style: p.style },
                settings: { snapPct: s.snapPct, lock: s.lock, rotate: s.rotate, little: s.little === true },
                image: obj.image,
                kind: kind
            }
        };
    }

    // ---- view (zoom / pan) --------------------------------------------------------------------------

    /** view = { s, tx, ty }: screen = world * s + t */
    function viewFit(table, vw, vh, pad) {
        pad = pad || 8;
        var s = Math.min((vw - 2 * pad) / table.w, (vh - 2 * pad) / table.h);
        if (!(s > 0)) { s = 0.1; }
        return { s: s, tx: (vw - table.w * s) / 2 - table.x * s, ty: (vh - table.h * s) / 2 - table.y * s };
    }

    function viewLimits(table, vw, vh) {
        var fit = viewFit(table, vw, vh, 8).s;
        return { min: fit * 0.7, max: Math.max(2.5, fit * 4) };
    }

    /** Keep at least a quarter of the viewport covered by the table */
    function viewClamp(view, table, vw, vh) {
        var lim = viewLimits(table, vw, vh);
        view.s = clamp(view.s, lim.min, lim.max);
        var tw = table.w * view.s, th = table.h * view.s;
        var minTx = vw * 0.25 - tw - table.x * view.s, maxTx = vw * 0.75 - table.x * view.s;
        var minTy = vh * 0.25 - th - table.y * view.s, maxTy = vh * 0.75 - table.y * view.s;
        view.tx = clamp(view.tx, minTx, maxTx);
        view.ty = clamp(view.ty, minTy, maxTy);
        return view;
    }

    /** Zoom by factor keeping screen point (sx, sy) fixed */
    function viewZoomAt(view, sx, sy, factor, table, vw, vh) {
        var lim = viewLimits(table, vw, vh);
        var ns = clamp(view.s * factor, lim.min, lim.max);
        var wx = (sx - view.tx) / view.s, wy = (sy - view.ty) / view.s;
        view.s = ns;
        view.tx = sx - wx * ns;
        view.ty = sy - wy * ns;
        return viewClamp(view, table, vw, vh);
    }

    function screenToWorld(view, sx, sy) { return { x: (sx - view.tx) / view.s, y: (sy - view.ty) / view.s }; }
    function worldToScreen(view, wx, wy) { return { x: wx * view.s + view.tx, y: wy * view.s + view.ty }; }

    var api = {
        SAVE_VERSION: SAVE_VERSION,
        FILE_FORMAT: FILE_FORMAT,
        MAX_FILE_CHARS: MAX_FILE_CHARS,
        MAX_IMAGE_CHARS: MAX_IMAGE_CHARS,
        SNAP_MIN: SNAP_MIN, SNAP_MAX: SNAP_MAX, SNAP_DEFAULT: SNAP_DEFAULT, SNAP_LITTLE: SNAP_LITTLE,
        PRESETS: PRESETS,
        LITTLE_COUNTS: LITTLE_COUNTS,
        STYLES: STYLES,
        defaultSettings: defaultSettings,
        sanitizeSettings: sanitizeSettings,
        makeLayout: makeLayout,
        newGame: newGame,
        serialize: serialize,
        deserialize: deserialize,
        sniffDataUrl: sniffDataUrl,
        cleanName: cleanName,
        buildFile: buildFile,
        parsePuzzleFile: parsePuzzleFile,
        viewFit: viewFit,
        viewLimits: viewLimits,
        viewClamp: viewClamp,
        viewZoomAt: viewZoomAt,
        screenToWorld: screenToWorld,
        worldToScreen: worldToScreen
    };

    if (isNode) {
        module.exports = api;
    } else {
        root.FongJigsaw = root.FongJigsaw || {};
        root.FongJigsaw.Model = api;
    }
})(typeof window !== 'undefined' ? window : this);
