/**
 * F.O.N.G. Jigsaw - geometry.js (pure, no DOM)
 *
 * Grid choice, seeded edges, bezier piece outlines, flattening and hit tests.
 * Works in the browser (window.FongJigsaw.Geometry) and in node (module.exports).
 *
 * Coordinates: the solved board has its top-left at (0,0). A piece (r,c) has its
 * cell origin at (c*pw, r*ph). pieceOps() returns the outline in LOCAL coordinates
 * (origin = the cell's top-left), so tabs reach into negative / over-size values
 * by at most `margin`.
 *
 * Shared edges are built once in one canonical direction and walked forward by
 * one piece and backward by its neighbour, so the two outlines are the same curve
 * (a tab on one side is exactly a blank on the other, no gaps, no overlap).
 */
(function (root) {
    'use strict';

    var PIECE_W = 100;          // board units per cell width
    var TAB_MARGIN = 0.34;      // tab reach as a fraction of max(pw, ph)
    var CURVE_STEPS = 10;

    function imul(a, b) {
        if (Math.imul) { return Math.imul(a, b); }
        var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
        var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
    }

    // mulberry32: small, fast, seedable
    function makeRng(seed) {
        var a = seed | 0;
        return function () {
            a = (a + 0x6D2B79F5) | 0;
            var t = imul(a ^ (a >>> 15), 1 | a);
            t = (t + imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function hash4(seed, k, r, c) {
        var h = (seed | 0) ^ 0x9E3779B9;
        h = imul(h ^ (k + 0x7F4A7C15), 0x85EBCA6B);
        h = imul(h ^ (h >>> 13) ^ (r + 1), 0xC2B2AE35);
        h = imul(h ^ (h >>> 16) ^ ((c + 1) * 65537), 0x27D4EB2F);
        return (h ^ (h >>> 15)) | 0;
    }

    function randomSeed() {
        return Math.floor(Math.random() * 2147483647) + 1;
    }

    /**
     * Pick cols x rows for about `count` pieces with near-square cells.
     * aspect = image width / image height.
     */
    function chooseGrid(count, aspect) {
        count = Math.max(1, Math.round(count));
        aspect = (aspect > 0 && isFinite(aspect)) ? aspect : 1;
        var minSide = count >= 4 ? 2 : 1;
        var best = null, rows, k, cols, n, cellAspect, cost;
        for (rows = minSide; rows <= count; rows++) {
            var base = count / rows;
            for (k = 0; k < 2; k++) {
                cols = k === 0 ? Math.floor(base) : Math.ceil(base);
                if (cols < minSide) { continue; }
                n = rows * cols;
                cellAspect = aspect * rows / cols;
                cost = Math.abs(Math.log(cellAspect)) + 1.2 * Math.abs(Math.log(n / count));
                if (!best || cost < best.cost - 1e-12) {
                    best = { cols: cols, rows: rows, cost: cost };
                }
            }
        }
        if (!best) { best = { cols: minSide, rows: minSide, cost: 0 }; }
        return { cols: best.cols, rows: best.rows };
    }

    /**
     * Build the puzzle description. Cells are PIECE_W wide; the cell height follows
     * the image so the picture is not stretched.
     */
    function makePuzzle(opts) {
        var cols = Math.max(1, opts.cols | 0);
        var rows = Math.max(1, opts.rows | 0);
        var imgW = opts.imgW > 0 ? opts.imgW : cols;
        var imgH = opts.imgH > 0 ? opts.imgH : rows;
        var pw = PIECE_W;
        var ph = PIECE_W * (imgH / rows) / (imgW / cols);
        var style = opts.style === 'square' || opts.style === 'rounded' ? opts.style : 'jigsaw';
        return {
            seed: (opts.seed | 0) || 1,
            cols: cols, rows: rows,
            imgW: imgW, imgH: imgH,
            pw: pw, ph: ph,
            bw: cols * pw, bh: rows * ph,
            margin: TAB_MARGIN * Math.max(pw, ph),
            style: style,
            count: cols * rows,
            _chains: {}, _polys: {}
        };
    }

    // ---- edges -------------------------------------------------------------

    /** Random parameters for one shared edge. kind: 0 = horizontal, 1 = vertical */
    function edgeParams(seed, kind, r, c) {
        var rng = makeRng(hash4(seed, kind, r, c));
        var j = 0.04;
        function u() { return (rng() * 2 - 1) * j; }
        return {
            dir: rng() < 0.5 ? -1 : 1,
            size: 0.9 + rng() * 0.2,
            a: u(), b: u(), c: u(), d: u(), e: u()
        };
    }

    function flatChain(x0, y0, x1, y1) {
        return {
            x0: x0, y0: y0,
            segs: [[x0 + (x1 - x0) / 3, y0 + (y1 - y0) / 3, x0 + 2 * (x1 - x0) / 3, y0 + 2 * (y1 - y0) / 3, x1, y1]]
        };
    }

    /** Absolute bezier chain from (x0,y0) to (x1,y1) with a tab on the +normal side times dir */
    function tabChain(x0, y0, x1, y1, p) {
        var dx = x1 - x0, dy = y1 - y0;
        var len = Math.sqrt(dx * dx + dy * dy);
        var ux = dx / len, uy = dy / len;
        var nx = -uy * p.dir, ny = ux * p.dir;
        var t = 0.1 * p.size;
        function pt(l, w) {
            return [x0 + ux * l * len + nx * w * len, y0 + uy * l * len + ny * w * len];
        }
        var a = p.a, b = p.b, c = p.c, d = p.d, e = p.e;
        var p1 = pt(0.2, a);
        var p2 = pt(0.5 + b + d, -t + c);
        var p3 = pt(0.5 - t + b, t + c);
        var p4 = pt(0.5 - 2 * t + b - d, 3 * t + c);
        var p5 = pt(0.5 + 2 * t + b - d, 3 * t + c);
        var p6 = pt(0.5 + t + b, t + c);
        var p7 = pt(0.5 + b + d, -t + c);
        var p8 = pt(0.8, e);
        return {
            x0: x0, y0: y0,
            segs: [
                [p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]],
                [p4[0], p4[1], p5[0], p5[1], p6[0], p6[1]],
                [p7[0], p7[1], p8[0], p8[1], x1, y1]
            ]
        };
    }

    /**
     * Canonical chain for the shared edge.
     * kind 0: horizontal edge BELOW row r at column c, walked left to right.
     * kind 1: vertical edge RIGHT of column c at row r, walked top to bottom.
     */
    function edgeChain(pz, kind, r, c) {
        var key = kind + ':' + r + ':' + c;
        var hit = pz._chains[key];
        if (hit) { return hit; }
        var x0, y0, x1, y1;
        if (kind === 0) {
            x0 = c * pz.pw; y0 = (r + 1) * pz.ph; x1 = (c + 1) * pz.pw; y1 = y0;
        } else {
            x0 = (c + 1) * pz.pw; y0 = r * pz.ph; x1 = x0; y1 = (r + 1) * pz.ph;
        }
        var chain = pz.style === 'jigsaw'
            ? tabChain(x0, y0, x1, y1, edgeParams(pz.seed, kind, r, c))
            : flatChain(x0, y0, x1, y1);
        pz._chains[key] = chain;
        return chain;
    }

    function reverseChain(ch) {
        var pts = [[ch.x0, ch.y0]], i, s;
        for (i = 0; i < ch.segs.length; i++) {
            s = ch.segs[i];
            pts.push([s[4], s[5]]);
        }
        var out = [];
        for (i = ch.segs.length - 1; i >= 0; i--) {
            s = ch.segs[i];
            out.push([s[2], s[3], s[0], s[1], pts[i][0], pts[i][1]]);
        }
        var last = pts[pts.length - 1];
        return { x0: last[0], y0: last[1], segs: out };
    }

    /** The four directed sides of piece (r,c), clockwise: top, right, bottom, left. */
    function pieceSides(pz, r, c) {
        var x = c * pz.pw, y = r * pz.ph, X = x + pz.pw, Y = y + pz.ph;
        var top = r === 0 ? flatChain(x, y, X, y) : edgeChain(pz, 0, r - 1, c);
        var right = c === pz.cols - 1 ? flatChain(X, y, X, Y) : edgeChain(pz, 1, r, c);
        var bottom = r === pz.rows - 1 ? flatChain(X, Y, x, Y) : reverseChain(edgeChain(pz, 0, r, c));
        var left = c === 0 ? flatChain(x, Y, x, y) : reverseChain(edgeChain(pz, 1, r, c - 1));
        return [top, right, bottom, left];
    }

    /** Outline of piece (r,c) in LOCAL coordinates as ops: ['M',x,y] ['L',x,y] ['C',x1,y1,x2,y2,x,y] ['Z'] */
    function pieceOps(pz, r, c) {
        var ox = c * pz.pw, oy = r * pz.ph;
        var ops = [], i, j, s, side;
        if (pz.style === 'rounded') {
            var w = pz.pw, h = pz.ph, rr = 0.16 * Math.min(w, h), k = rr * 0.5523;
            ops.push(['M', rr, 0]);
            ops.push(['L', w - rr, 0]);
            ops.push(['C', w - rr + k, 0, w, rr - k, w, rr]);
            ops.push(['L', w, h - rr]);
            ops.push(['C', w, h - rr + k, w - rr + k, h, w - rr, h]);
            ops.push(['L', rr, h]);
            ops.push(['C', rr - k, h, 0, h - rr + k, 0, h - rr]);
            ops.push(['L', 0, rr]);
            ops.push(['C', 0, rr - k, rr - k, 0, rr, 0]);
            ops.push(['Z']);
            return ops;
        }
        var sides = pieceSides(pz, r, c);
        ops.push(['M', sides[0].x0 - ox, sides[0].y0 - oy]);
        for (i = 0; i < 4; i++) {
            side = sides[i];
            for (j = 0; j < side.segs.length; j++) {
                s = side.segs[j];
                ops.push(['C', s[0] - ox, s[1] - oy, s[2] - ox, s[3] - oy, s[4] - ox, s[5] - oy]);
            }
        }
        ops.push(['Z']);
        return ops;
    }

    // ---- polygons / hit test ------------------------------------------------

    function flatten(ops, steps) {
        steps = steps || CURVE_STEPS;
        var poly = [], cx = 0, cy = 0, i, k, o, t, mt, x, y;
        for (i = 0; i < ops.length; i++) {
            o = ops[i];
            if (o[0] === 'M' || o[0] === 'L') {
                cx = o[1]; cy = o[2];
                poly.push([cx, cy]);
            } else if (o[0] === 'C') {
                for (k = 1; k <= steps; k++) {
                    t = k / steps; mt = 1 - t;
                    x = mt * mt * mt * cx + 3 * mt * mt * t * o[1] + 3 * mt * t * t * o[3] + t * t * t * o[5];
                    y = mt * mt * mt * cy + 3 * mt * mt * t * o[2] + 3 * mt * t * t * o[4] + t * t * t * o[6];
                    poly.push([x, y]);
                }
                cx = o[5]; cy = o[6];
            }
        }
        return poly;
    }

    /** Signed area (positive for clockwise on a y-down screen) */
    function polygonArea(poly) {
        var a = 0, i, p, q;
        for (i = 0; i < poly.length; i++) {
            p = poly[i]; q = poly[(i + 1) % poly.length];
            a += p[0] * q[1] - q[0] * p[1];
        }
        return a / 2;
    }

    function pointInPolygon(poly, x, y) {
        var inside = false, i, j = poly.length - 1, a, b;
        for (i = 0; i < poly.length; j = i++) {
            a = poly[i]; b = poly[j];
            if (((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) {
                inside = !inside;
            }
        }
        return inside;
    }

    /** Cached local-space polygon for piece (r,c) */
    function piecePolygon(pz, r, c) {
        var key = r * pz.cols + c;
        var hit = pz._polys[key];
        if (!hit) {
            hit = flatten(pieceOps(pz, r, c), CURVE_STEPS);
            pz._polys[key] = hit;
        }
        return hit;
    }

    function polygonBounds(poly) {
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, i;
        for (i = 0; i < poly.length; i++) {
            if (poly[i][0] < minX) { minX = poly[i][0]; }
            if (poly[i][0] > maxX) { maxX = poly[i][0]; }
            if (poly[i][1] < minY) { minY = poly[i][1]; }
            if (poly[i][1] > maxY) { maxY = poly[i][1]; }
        }
        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    var api = {
        PIECE_W: PIECE_W,
        TAB_MARGIN: TAB_MARGIN,
        makeRng: makeRng,
        hash4: hash4,
        randomSeed: randomSeed,
        chooseGrid: chooseGrid,
        makePuzzle: makePuzzle,
        edgeParams: edgeParams,
        edgeChain: edgeChain,
        reverseChain: reverseChain,
        pieceSides: pieceSides,
        pieceOps: pieceOps,
        flatten: flatten,
        polygonArea: polygonArea,
        pointInPolygon: pointInPolygon,
        piecePolygon: piecePolygon,
        polygonBounds: polygonBounds
    };

    if (typeof module === 'object' && module && module.exports) {
        module.exports = api;
    } else {
        root.FongJigsaw = root.FongJigsaw || {};
        root.FongJigsaw.Geometry = api;
    }
})(typeof window !== 'undefined' ? window : this);
