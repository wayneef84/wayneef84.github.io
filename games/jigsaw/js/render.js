/**
 * F.O.N.G. Jigsaw - render.js
 *
 * Draws the table on one canvas. Every piece is cut once into its own offscreen
 * canvas (image clipped to the outline, tab margin included, thin bevel baked in),
 * so a frame is just one drawImage per visible piece. A half-size copy is used
 * when zoomed far out so 300 pieces stay crisp on a phone.
 */
(function (root) {
    'use strict';

    var NS = root.FongJigsaw = root.FongJigsaw || {};
    var G = NS.Geometry, Gr = NS.Groups;

    var COS = [1, 0, -1, 0], SIN = [0, 1, 0, -1];
    var MAX_BITMAP_SIDE = 420;
    var GLOW_MS = 650;
    var HINT_MS = 3200;

    function trace(ctx, ops) {
        var i, o;
        ctx.beginPath();
        for (i = 0; i < ops.length; i++) {
            o = ops[i];
            if (o[0] === 'M') { ctx.moveTo(o[1], o[2]); }
            else if (o[0] === 'L') { ctx.lineTo(o[1], o[2]); }
            else if (o[0] === 'C') { ctx.bezierCurveTo(o[1], o[2], o[3], o[4], o[5], o[6]); }
            else { ctx.closePath(); }
        }
    }

    function Renderer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = 1;
        this.cssW = 0;
        this.cssH = 0;
        this.bmps = [];
        this.mips = [];
        this.bs = 1;            // pixels per board unit in the bitmaps
        this.uw = 0;            // bitmap size in board units
        this.uh = 0;
        this.opsCache = {};
        this.lastDrawMs = 0;
    }

    Renderer.prototype.resize = function (cssW, cssH, dpr) {
        this.dpr = dpr || 1;
        this.cssW = cssW;
        this.cssH = cssH;
        this.canvas.width = Math.max(1, Math.round(cssW * this.dpr));
        this.canvas.height = Math.max(1, Math.round(cssH * this.dpr));
    };

    /** Cut every piece. `image` is a canvas or image. Synchronous (a few hundred ms at most for 300). */
    Renderer.prototype.cut = function (st, image) {
        var pz = st.pz, m = pz.margin, r, c, i;
        var iw = image.width, ih = image.height;
        var kx = iw / pz.bw, ky = ih / pz.bh;
        this.uw = pz.pw + 2 * m;
        this.uh = pz.ph + 2 * m;
        var s = Math.min(Math.max(kx, ky), MAX_BITMAP_SIDE / Math.max(this.uw, this.uh));
        this.bs = Math.max(0.3, s);
        this.bmps = [];
        this.mips = [];
        this.opsCache = {};
        for (r = 0; r < pz.rows; r++) {
            for (c = 0; c < pz.cols; c++) {
                this.bmps.push(this.cutPiece(st, image, r, c, kx, ky));
            }
        }
        for (i = 0; i < this.bmps.length; i++) { this.mips.push(null); }
    };

    Renderer.prototype.ops = function (pz, r, c) {
        var key = r * pz.cols + c;
        var o = this.opsCache[key];
        if (!o) { o = G.pieceOps(pz, r, c); this.opsCache[key] = o; }
        return o;
    };

    Renderer.prototype.cutPiece = function (st, image, r, c, kx, ky) {
        var pz = st.pz, m = pz.margin, s = this.bs;
        var cv = document.createElement('canvas');
        cv.width = Math.ceil(this.uw * s);
        cv.height = Math.ceil(this.uh * s);
        var x = cv.getContext('2d');
        x.setTransform(s, 0, 0, s, m * s, m * s);
        var ops = this.ops(pz, r, c);
        trace(x, ops);
        x.save();
        x.clip();
        // source window in board units, clamped to the board
        var wx0 = c * pz.pw - m, wy0 = r * pz.ph - m;
        var x0 = Math.max(0, wx0), y0 = Math.max(0, wy0);
        var x1 = Math.min(pz.bw, wx0 + this.uw), y1 = Math.min(pz.bh, wy0 + this.uh);
        if (x1 > x0 && y1 > y0) {
            try {
                x.drawImage(image, x0 * kx, y0 * ky, (x1 - x0) * kx, (y1 - y0) * ky,
                    x0 - c * pz.pw, y0 - r * pz.ph, x1 - x0, y1 - y0);
            } catch (e) { /* ignore a bad window */ }
        }
        // bevel: light inside the top-left, shade inside the bottom-right
        var px = 1 / s;
        x.lineJoin = 'round';
        x.save(); x.translate(1.1 * px, 1.1 * px); trace(x, ops);
        x.lineWidth = 2.6 * px; x.strokeStyle = 'rgba(255,255,255,0.30)'; x.stroke(); x.restore();
        x.save(); x.translate(-1.1 * px, -1.1 * px); trace(x, ops);
        x.lineWidth = 2.6 * px; x.strokeStyle = 'rgba(0,0,40,0.22)'; x.stroke(); x.restore();
        x.restore();
        trace(x, ops);
        x.lineWidth = 1.1 * px;
        x.strokeStyle = 'rgba(30,20,60,0.55)';
        x.stroke();
        return cv;
    };

    Renderer.prototype.getBitmap = function (idx, k) {
        if (k < this.bs * 0.5) {
            var mip = this.mips[idx];
            if (!mip) {
                var src = this.bmps[idx];
                mip = document.createElement('canvas');
                mip.width = Math.max(1, Math.ceil(src.width / 2));
                mip.height = Math.max(1, Math.ceil(src.height / 2));
                var mx = mip.getContext('2d');
                mx.imageSmoothingQuality = 'high';
                mx.drawImage(src, 0, 0, mip.width, mip.height);
                this.mips[idx] = mip;
            }
            return mip;
        }
        return this.bmps[idx];
    };

    function setPieceTransform(ctx, k, tx, ty, rot, px, py) {
        var cs = COS[rot], sn = SIN[rot];
        ctx.setTransform(k * cs, k * sn, -k * sn, k * cs, k * px + tx, k * py + ty);
    }

    /** Draw one group's pieces. opts.shadow draws only a shadow pass. */
    Renderer.prototype.drawGroup = function (st, grp, k, tx, ty, vis, shadow) {
        if (this.bmps.length !== st.pz.count) { return; }   // not cut yet
        var ctx = this.ctx, pz = st.pz, m = pz.margin, i, pid, rc, px, py, bmp, cx, cy;
        var rot = grp.rot, cs = COS[rot], sn = SIN[rot];
        var hw = pz.pw / 2, hh = pz.ph / 2;
        var uw = this.uw, uh = this.uh;
        var reach = Math.max(pz.pw, pz.ph) * 0.75 + m;
        for (i = 0; i < grp.members.length; i++) {
            pid = grp.members[i];
            rc = Gr.pieceRC(st, pid);
            var lx = rc.c * pz.pw, ly = rc.r * pz.ph;
            px = grp.ox + cs * lx - sn * ly;
            py = grp.oy + sn * lx + cs * ly;
            // centre of the cell in world space, for culling
            cx = grp.ox + cs * (lx + hw) - sn * (ly + hh);
            cy = grp.oy + sn * (lx + hw) + cs * (ly + hh);
            if (cx + reach < vis.x0 || cx - reach > vis.x1 || cy + reach < vis.y0 || cy - reach > vis.y1) { continue; }
            bmp = this.getBitmap(pid, k);
            if (shadow) {
                // draw far to the left; the shadow offset brings the shadow back (offsets ignore the transform)
                setPieceTransform(ctx, k, tx - 30000, ty, rot, px, py);
            } else {
                setPieceTransform(ctx, k, tx, ty, rot, px, py);
            }
            ctx.drawImage(bmp, -m, -m, uw, uh);
        }
    };

    Renderer.prototype.strokeGroup = function (st, grp, k, tx, ty, style, widthPx, maxPieces, dash) {
        var ctx = this.ctx, pz = st.pz, i, rc, lx, ly, n = Math.min(grp.members.length, maxPieces);
        var rot = grp.rot, cs = COS[rot], sn = SIN[rot];
        ctx.lineWidth = widthPx / k;
        ctx.strokeStyle = style;
        ctx.lineJoin = 'round';
        if (ctx.setLineDash) { ctx.setLineDash(dash ? [6 / k * this.dpr, 5 / k * this.dpr] : []); }
        for (i = 0; i < n; i++) {
            rc = Gr.pieceRC(st, grp.members[i]);
            lx = rc.c * pz.pw; ly = rc.r * pz.ph;
            setPieceTransform(ctx, k, tx, ty, rot, grp.ox + cs * lx - sn * ly, grp.oy + sn * lx + cs * ly);
            trace(ctx, this.ops(pz, rc.r, rc.c));
            ctx.stroke();
        }
        if (ctx.setLineDash) { ctx.setLineDash([]); }
    };

    /**
     * g = { st, view, image, colors, ghost, preview, dragGid, selGid, fx, hint, reduceMotion }
     * Returns true while an animation is running (caller keeps requesting frames).
     */
    Renderer.prototype.draw = function (g, now) {
        var t0 = root.performance && performance.now ? performance.now() : Date.now();
        var ctx = this.ctx, st = g.st, v = g.view, dpr = this.dpr, pz = st.pz;
        var k = dpr * v.s, tx = dpr * v.tx, ty = dpr * v.ty;
        var animating = false, i, grp, gid;
        var col = g.colors || {};
        var vis = {
            x0: -v.tx / v.s, y0: -v.ty / v.s,
            x1: (this.cssW - v.tx) / v.s, y1: (this.cssH - v.ty) / v.s
        };

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.fillStyle = col.bg || '#2a2350';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // table
        ctx.setTransform(k, 0, 0, k, tx, ty);
        var T = st.table;
        ctx.fillStyle = col.table || '#3a3169';
        ctx.fillRect(T.x, T.y, T.w, T.h);
        ctx.lineWidth = 3 / k * dpr;
        ctx.strokeStyle = col.tableEdge || 'rgba(255,255,255,0.18)';
        ctx.strokeRect(T.x, T.y, T.w, T.h);

        // board
        var B = st.board;
        ctx.fillStyle = col.board || 'rgba(255,255,255,0.10)';
        ctx.fillRect(B.x, B.y, B.w, B.h);
        if (g.ghost && g.image) {
            ctx.globalAlpha = 0.22;
            ctx.drawImage(g.image, 0, 0, g.image.width, g.image.height, B.x, B.y, B.w, B.h);
            ctx.globalAlpha = 1;
        }
        ctx.setLineDash && ctx.setLineDash([10 / k * dpr, 7 / k * dpr]);
        ctx.lineWidth = 2.5 / k * dpr;
        ctx.strokeStyle = col.boardEdge || 'rgba(255,255,255,0.55)';
        ctx.strokeRect(B.x, B.y, B.w, B.h);
        ctx.setLineDash && ctx.setLineDash([]);

        // pieces, bottom to top; the lifted group last
        var dragged = null;
        for (i = 0; i < st.order.length; i++) {
            gid = st.order[i];
            if (gid === g.dragGid) { dragged = st.groups[gid]; continue; }
            grp = st.groups[gid];
            this.drawGroup(st, grp, k, tx, ty, vis, false);
        }
        if (dragged) {
            var ctx2 = ctx;
            var sizeOk = dragged.members.length <= 60;
            ctx2.save();
            ctx2.shadowColor = 'rgba(10,5,40,0.55)';
            ctx2.shadowBlur = (sizeOk ? 16 : 0) * dpr;
            ctx2.shadowOffsetX = 30000 + 4 * dpr;
            ctx2.shadowOffsetY = 7 * dpr;
            this.drawGroup(st, dragged, k, tx, ty, vis, true);
            ctx2.restore();
            ctx.shadowColor = 'rgba(0,0,0,0)';
            this.drawGroup(st, dragged, k, tx, ty, vis, false);
            this.strokeGroup(st, dragged, k, tx, ty, 'rgba(255,255,255,0.55)', 2 * dpr, 40, false);
        }

        // glow after a snap
        if (g.fx && g.fx.length) {
            var alive = [];
            for (i = 0; i < g.fx.length; i++) {
                var age = now - g.fx[i].t0;
                if (age < GLOW_MS) {
                    var a = g.reduceMotion ? 0.8 * (1 - age / GLOW_MS) : 0.9 * (1 - age / GLOW_MS);
                    var gg = st.groups[Gr.find(st, g.fx[i].pid)];
                    if (gg) {
                        var wide = (g.reduceMotion ? 3 : 3 + 6 * (age / GLOW_MS)) * dpr;
                        this.strokeGroup(st, gg, k, tx, ty, 'rgba(255,226,120,' + a.toFixed(3) + ')', wide, 80, false);
                    }
                    alive.push(g.fx[i]);
                }
            }
            g.fx = alive;
            if (alive.length) { animating = true; }
        }

        // hint: ring on the piece and its target spot
        if (g.hint) {
            var hage = now - g.hint.t0;
            if (hage < HINT_MS) {
                var pulse = g.reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(hage / 140);
                var hg = st.groups[Gr.find(st, g.hint.pid)];
                var rc = Gr.pieceRC(st, g.hint.pid);
                if (hg) {
                    var lx = rc.c * pz.pw, ly = rc.r * pz.ph;
                    var hr = hg.rot;
                    // target spot
                    setPieceTransform(ctx, k, tx, ty, 0, B.x + lx, B.y + ly);
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(this.getBitmap(g.hint.pid, k), -pz.margin, -pz.margin, this.uw, this.uh);
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 4 / k * dpr;
                    ctx.strokeStyle = 'rgba(255,214,64,' + pulse.toFixed(3) + ')';
                    ctx.setLineDash && ctx.setLineDash([8 / k * dpr, 6 / k * dpr]);
                    trace(ctx, this.ops(pz, rc.r, rc.c));
                    ctx.stroke();
                    ctx.setLineDash && ctx.setLineDash([]);
                    // the piece itself
                    setPieceTransform(ctx, k, tx, ty, hr, hg.ox + COS[hr] * lx - SIN[hr] * ly, hg.oy + SIN[hr] * lx + COS[hr] * ly);
                    ctx.lineWidth = 6 / k * dpr;
                    ctx.strokeStyle = 'rgba(255,214,64,' + pulse.toFixed(3) + ')';
                    trace(ctx, this.ops(pz, rc.r, rc.c));
                    ctx.stroke();
                }
                animating = true;
            } else {
                g.hint = null;
            }
        }

        // keyboard selection
        if (g.selGid !== null && g.selGid !== undefined && st.groups[g.selGid]) {
            var sg = st.groups[g.selGid];
            var wb = Gr.worldBounds(st, sg, 0);
            ctx.setTransform(k, 0, 0, k, tx, ty);
            ctx.lineWidth = 3 / k * dpr;
            ctx.strokeStyle = col.accent || '#ffd640';
            ctx.setLineDash && ctx.setLineDash([8 / k * dpr, 5 / k * dpr]);
            ctx.strokeRect(wb.minX - 6, wb.minY - 6, wb.maxX - wb.minX + 12, wb.maxY - wb.minY + 12);
            ctx.setLineDash && ctx.setLineDash([]);
            if (g.holding) {
                ctx.strokeStyle = 'rgba(255,255,255,0.9)';
                ctx.strokeRect(wb.minX - 10, wb.minY - 10, wb.maxX - wb.minX + 20, wb.maxY - wb.minY + 20);
            }
        }

        // hold-to-preview: the whole picture over the board
        if (g.preview && g.image) {
            ctx.setTransform(k, 0, 0, k, tx, ty);
            ctx.fillStyle = 'rgba(10,5,40,0.45)';
            ctx.fillRect(T.x, T.y, T.w, T.h);
            ctx.drawImage(g.image, 0, 0, g.image.width, g.image.height, B.x, B.y, B.w, B.h);
            ctx.lineWidth = 4 / k * dpr;
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(B.x, B.y, B.w, B.h);
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var t1 = root.performance && performance.now ? performance.now() : Date.now();
        this.lastDrawMs = t1 - t0;
        return animating;
    };

    NS.Render = { Renderer: Renderer, trace: trace, GLOW_MS: GLOW_MS, HINT_MS: HINT_MS };
})(window);
