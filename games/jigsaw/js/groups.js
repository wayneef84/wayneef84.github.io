/**
 * F.O.N.G. Jigsaw - groups.js (pure, no DOM)
 *
 * Union-find groups, snapping, hit testing, scatter, gather, hints.
 *
 * Model. A group has an offset O = (ox, oy) and a rotation rot (0..3 quarter turns).
 * Piece (r,c) sits at the world point  O + R(rot) * (c*pw, r*ph)  with its cell
 * rotated by rot. The solved picture is at O = board origin with rot = 0. Because
 * every piece of a group shares one O and one rot, the alignment error between two
 * groups is just the distance between their offsets.
 *
 * Snap rules (see trySnap):
 *   1. Frame:    rot == 0 and |O - boardOrigin| <= snapDistance  -> O = boardOrigin.
 *   2. Neighbour: two different groups snap when they hold solution-adjacent pieces,
 *      have the same rot, and |O1 - O2| <= snapDistance. Merge, repeat (transitive).
 *   snapDistance = settings.snapPct * piece width.
 * A group is "anchored" when it sits exactly on the board; it is "locked" (cannot be
 * picked up) when anchored and settings.lock is on.
 */
(function (root) {
    'use strict';

    var G = (typeof module === 'object' && module && module.exports)
        ? require('./geometry.js')
        : root.FongJigsaw.Geometry;

    var EPS = 1e-9;

    function dist(ax, ay, bx, by) {
        var dx = ax - bx, dy = ay - by;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** Rotate vector by rot quarter turns (clockwise on a y-down screen) */
    function rotVec(rot, x, y) {
        switch (((rot % 4) + 4) % 4) {
            case 1: return [-y, x];
            case 2: return [-x, -y];
            case 3: return [y, -x];
            default: return [x, y];
        }
    }

    // ---- state -------------------------------------------------------------

    /**
     * Create the group state for a puzzle. Pieces start as single groups at the
     * solved position (callers normally scatter afterwards).
     * layout: { board: {x,y,w,h}, table: {x,y,w,h} }
     */
    function createState(pz, layout, settings) {
        var st = {
            pz: pz,
            board: layout.board,
            table: layout.table,
            settings: {
                snapPct: settings && settings.snapPct > 0 ? settings.snapPct : 0.25,
                lock: !settings || settings.lock !== false,
                rotate: !!(settings && settings.rotate)
            },
            parent: [],
            groups: {},
            order: []
        };
        var i;
        for (i = 0; i < pz.count; i++) {
            st.parent.push(i);
            st.groups[i] = { id: i, members: [i], ox: st.board.x, oy: st.board.y, rot: 0 };
            st.order.push(i);
        }
        return st;
    }

    function find(st, i) {
        var root = i, next;
        while (st.parent[root] !== root) { root = st.parent[root]; }
        while (st.parent[i] !== root) { next = st.parent[i]; st.parent[i] = root; i = next; }
        return root;
    }

    function groupOf(st, pieceId) { return st.groups[find(st, pieceId)]; }

    function pieceRC(st, pid) { return { r: Math.floor(pid / st.pz.cols), c: pid % st.pz.cols }; }

    function neighbors(st, pid) {
        var pz = st.pz, r = Math.floor(pid / pz.cols), c = pid % pz.cols, out = [];
        if (r > 0) { out.push(pid - pz.cols); }
        if (r < pz.rows - 1) { out.push(pid + pz.cols); }
        if (c > 0) { out.push(pid - 1); }
        if (c < pz.cols - 1) { out.push(pid + 1); }
        return out;
    }

    function snapDistance(st) { return st.settings.snapPct * st.pz.pw; }

    function isAnchored(st, g) {
        return g.rot === 0 && Math.abs(g.ox - st.board.x) < 1e-6 && Math.abs(g.oy - st.board.y) < 1e-6;
    }

    function isLocked(st, g) { return !!st.settings.lock && isAnchored(st, g); }

    function groupCount(st) {
        var n = 0, k;
        for (k in st.groups) { if (st.groups.hasOwnProperty(k)) { n++; } }
        return n;
    }

    function isComplete(st) { return groupCount(st) === 1; }

    /** Number of successful joins so far, 0 .. count-1 */
    function joins(st) { return st.pz.count - groupCount(st); }

    function largestGroupSize(st) {
        var best = 0, k;
        for (k in st.groups) {
            if (st.groups.hasOwnProperty(k) && st.groups[k].members.length > best) { best = st.groups[k].members.length; }
        }
        return best;
    }

    // ---- geometry of groups -----------------------------------------------------

    /** World position of the cell origin of a piece */
    function pieceOrigin(st, g, pid) {
        var rc = pieceRC(st, pid);
        var v = rotVec(g.rot, rc.c * st.pz.pw, rc.r * st.pz.ph);
        return { x: g.ox + v[0], y: g.oy + v[1] };
    }

    /** Local (unrotated) bounding box of the member cells */
    function localBounds(st, g) {
        var pz = st.pz, minC = Infinity, minR = Infinity, maxC = -1, maxR = -1, i, rc;
        for (i = 0; i < g.members.length; i++) {
            rc = pieceRC(st, g.members[i]);
            if (rc.c < minC) { minC = rc.c; }
            if (rc.c > maxC) { maxC = rc.c; }
            if (rc.r < minR) { minR = rc.r; }
            if (rc.r > maxR) { maxR = rc.r; }
        }
        return { x0: minC * pz.pw, y0: minR * pz.ph, x1: (maxC + 1) * pz.pw, y1: (maxR + 1) * pz.ph };
    }

    /** World bounding box of the group (cells, grown by pad) */
    function worldBounds(st, g, pad) {
        pad = pad || 0;
        var lb = localBounds(st, g);
        var xs = [lb.x0 - pad, lb.x1 + pad], ys = [lb.y0 - pad, lb.y1 + pad];
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, i, j, v, wx, wy;
        for (i = 0; i < 2; i++) {
            for (j = 0; j < 2; j++) {
                v = rotVec(g.rot, xs[i], ys[j]);
                wx = g.ox + v[0]; wy = g.oy + v[1];
                if (wx < minX) { minX = wx; }
                if (wx > maxX) { maxX = wx; }
                if (wy < minY) { minY = wy; }
                if (wy > maxY) { maxY = wy; }
            }
        }
        return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    function moveGroup(st, gid, dx, dy) {
        var g = st.groups[gid];
        g.ox += dx; g.oy += dy;
    }

    function setGroupOffset(st, gid, ox, oy) {
        var g = st.groups[gid];
        g.ox = ox; g.oy = oy;
    }

    /** Keep the group's cell box inside the table; centre it on an axis it cannot fit */
    function clampGroup(st, gid) {
        var g = st.groups[gid], t = st.table, b = worldBounds(st, g, 0), dx = 0, dy = 0;
        var w = b.maxX - b.minX, h = b.maxY - b.minY;
        if (w >= t.w) { dx = (t.x + t.w / 2) - (b.minX + w / 2); }
        else if (b.minX < t.x) { dx = t.x - b.minX; }
        else if (b.maxX > t.x + t.w) { dx = t.x + t.w - b.maxX; }
        if (h >= t.h) { dy = (t.y + t.h / 2) - (b.minY + h / 2); }
        else if (b.minY < t.y) { dy = t.y - b.minY; }
        else if (b.maxY > t.y + t.h) { dy = t.y + t.h - b.maxY; }
        g.ox += dx; g.oy += dy;
        return dx !== 0 || dy !== 0;
    }

    /** Rotate a group by `steps` quarter turns around the centre of its box (world point stays put) */
    function rotateGroup(st, gid, steps) {
        var g = st.groups[gid], lb = localBounds(st, g);
        var px = (lb.x0 + lb.x1) / 2, py = (lb.y0 + lb.y1) / 2;
        var before = rotVec(g.rot, px, py);
        var nr = (((g.rot + steps) % 4) + 4) % 4;
        var after = rotVec(nr, px, py);
        g.ox += before[0] - after[0];
        g.oy += before[1] - after[1];
        g.rot = nr;
        return nr;
    }

    // ---- z-order -------------------------------------------------------------------

    function removeFromOrder(st, gid) {
        var i = st.order.indexOf(gid);
        if (i >= 0) { st.order.splice(i, 1); }
    }

    function bringToFront(st, gid) { removeFromOrder(st, gid); st.order.push(gid); }
    function sendToBack(st, gid) { removeFromOrder(st, gid); st.order.unshift(gid); }

    /** Locked groups always sit under loose ones */
    function normalizeOrder(st) {
        var low = [], high = [], i, g;
        for (i = 0; i < st.order.length; i++) {
            g = st.groups[st.order[i]];
            if (isLocked(st, g)) { low.push(g.id); } else { high.push(g.id); }
        }
        st.order = low.concat(high);
    }

    // ---- hit test ------------------------------------------------------------------

    /**
     * Topmost piece under the world point. Locked groups are skipped unless
     * includeLocked. Returns { gid, pid } or null.
     */
    function hitTest(st, wx, wy, includeLocked) {
        var pz = st.pz, m = pz.margin, k, g, i, pid, rc, inv, lx, ly, poly;
        for (k = st.order.length - 1; k >= 0; k--) {
            g = st.groups[st.order[k]];
            if (!includeLocked && isLocked(st, g)) { continue; }
            inv = rotVec(4 - g.rot, wx - g.ox, wy - g.oy);
            for (i = 0; i < g.members.length; i++) {
                pid = g.members[i];
                rc = pieceRC(st, pid);
                lx = inv[0] - rc.c * pz.pw;
                ly = inv[1] - rc.r * pz.ph;
                if (lx < -m || ly < -m || lx > pz.pw + m || ly > pz.ph + m) { continue; }
                poly = G.piecePolygon(pz, rc.r, rc.c);
                if (G.pointInPolygon(poly, lx, ly)) { return { gid: g.id, pid: pid }; }
            }
        }
        return null;
    }

    // ---- snapping ---------------------------------------------------------------------

    function union(st, a, b) {
        var ra = find(st, a), rb = find(st, b);
        if (ra === rb) { return ra; }
        var ga = st.groups[ra], gb = st.groups[rb], win, lose;
        if (ga.members.length >= gb.members.length) { win = ga; lose = gb; } else { win = gb; lose = ga; }
        st.parent[lose.id] = win.id;
        win.members = win.members.concat(lose.members);
        delete st.groups[lose.id];
        removeFromOrder(st, lose.id);
        return win.id;
    }

    /**
     * Try to snap group gid (call after a drop, a rotate or a keyboard drop).
     * Mutates offsets and merges groups. Returns
     *   { gid, snapped, frame, merges, size, anchored, locked }
     * where gid is the surviving group id and size its member count.
     */
    function trySnap(st, gid) {
        var d = snapDistance(st) + EPS;
        var res = { gid: gid, snapped: false, frame: false, merges: 0, size: 0, anchored: false, locked: false };
        var guard = 0, g, changed, best, i, j, nb, h, H, err, nbs, target;
        while (guard++ <= st.pz.count + 2) {
            g = st.groups[gid];
            changed = false;
            if (g.rot === 0 && !isAnchored(st, g) && dist(g.ox, g.oy, st.board.x, st.board.y) <= d) {
                g.ox = st.board.x; g.oy = st.board.y;
                res.frame = true; res.snapped = true; changed = true;
            }
            best = null;
            for (i = 0; i < g.members.length; i++) {
                nbs = neighbors(st, g.members[i]);
                for (j = 0; j < nbs.length; j++) {
                    nb = nbs[j];
                    h = find(st, nb);
                    if (h === g.id) { continue; }
                    H = st.groups[h];
                    if (H.rot !== g.rot) { continue; }
                    err = dist(H.ox, H.oy, g.ox, g.oy);
                    if (err <= d && (!best || err < best.err)) { best = { H: H, err: err }; }
                }
            }
            if (best) {
                target = isAnchored(st, g) ? { x: g.ox, y: g.oy } : { x: best.H.ox, y: best.H.oy };
                g.ox = target.x; g.oy = target.y;
                best.H.ox = target.x; best.H.oy = target.y;
                gid = union(st, g.id, best.H.id);
                st.groups[gid].ox = target.x; st.groups[gid].oy = target.y;
                res.merges++; res.snapped = true; changed = true;
            }
            if (!changed) { break; }
        }
        g = st.groups[gid];
        res.gid = gid;
        res.size = g.members.length;
        res.anchored = isAnchored(st, g);
        res.locked = isLocked(st, g);
        if (res.locked) { sendToBack(st, gid); }
        return res;
    }

    /** When everything is one group, put it exactly on the board */
    function settleComplete(st) {
        if (!isComplete(st)) { return false; }
        var gid = st.order[0], g = st.groups[gid];
        g.rot = 0; g.ox = st.board.x; g.oy = st.board.y;
        return true;
    }

    // ---- scatter / gather / hint ------------------------------------------------------------

    function placeBox(st, gid, X, Y) {
        var g = st.groups[gid], b = worldBounds(st, g, 0);
        g.ox += X - b.minX;
        g.oy += Y - b.minY;
    }

    function overlapsBoard(st, b) {
        var bd = st.board;
        return !(b.maxX <= bd.x || b.minX >= bd.x + bd.w || b.maxY <= bd.y || b.minY >= bd.y + bd.h);
    }

    /**
     * Scatter all groups that are not locked (or all of them with force) around the board on the table.
     * rng is a function returning [0,1). With settings.rotate, groups get random rotations.
     */
    function scatter(st, rng, force) {
        var t = st.table, i, g, gid, b, w, h, X, Y, tries, ok, ids = [], k;
        for (k in st.groups) {
            if (st.groups.hasOwnProperty(k) && (force || !isLocked(st, st.groups[k]))) { ids.push(st.groups[k].id); }
        }
        // shuffle the stacking order too
        for (i = ids.length - 1; i > 0; i--) {
            k = Math.floor(rng() * (i + 1));
            gid = ids[i]; ids[i] = ids[k]; ids[k] = gid;
        }
        for (i = 0; i < ids.length; i++) {
            gid = ids[i];
            g = st.groups[gid];
            g.rot = st.settings.rotate ? Math.floor(rng() * 4) : 0;
            b = worldBounds(st, g, 0);
            w = b.maxX - b.minX; h = b.maxY - b.minY;
            ok = false;
            for (tries = 0; tries < 60 && !ok; tries++) {
                X = t.x + rng() * Math.max(0, t.w - w);
                Y = t.y + rng() * Math.max(0, t.h - h);
                ok = !overlapsBoard(st, { minX: X, minY: Y, maxX: X + w, maxY: Y + h });
            }
            placeBox(st, gid, X, Y);
            clampGroup(st, gid);
        }
        // stacking: locked groups at the bottom, scattered groups above in random order
        var low = [], inIds = {};
        for (i = 0; i < ids.length; i++) { inIds[ids[i]] = true; }
        for (i = 0; i < st.order.length; i++) {
            if (!inIds[st.order[i]]) { low.push(st.order[i]); }
        }
        st.order = low.concat(ids);
    }

    function isEdgePiece(st, pid) {
        var rc = pieceRC(st, pid), pz = st.pz;
        return rc.r === 0 || rc.c === 0 || rc.r === pz.rows - 1 || rc.c === pz.cols - 1;
    }

    /** Move every loose single edge piece into tidy rows in the top band. Returns number moved. */
    function gatherEdges(st) {
        var pz = st.pz, t = st.table, ids = [], k, g, i, moved = 0;
        for (k in st.groups) {
            if (!st.groups.hasOwnProperty(k)) { continue; }
            g = st.groups[k];
            if (g.members.length === 1 && !isLocked(st, g) && isEdgePiece(st, g.members[0])) { ids.push(g.id); }
        }
        if (!ids.length) { return 0; }
        ids.sort(function (a, b) { return a - b; });
        var stepX = pz.pw * 1.12, stepY = pz.ph * 1.12;
        var padX = 4, padY = 4;
        var perRow = Math.max(1, Math.floor((t.w - 2 * padX) / stepX));
        var rowsNeeded = Math.ceil(ids.length / perRow);
        var band = Math.max(pz.ph, st.board.y - t.y - 2 * padY);
        if (rowsNeeded > 1 && (rowsNeeded - 1) * stepY + pz.ph > band) {
            stepY = Math.max(pz.ph * 0.5, (band - pz.ph) / (rowsNeeded - 1));
        }
        var gap = (t.w - 2 * padX - perRow * stepX);
        var startX = t.x + padX + Math.max(0, gap / 2);
        for (i = 0; i < ids.length; i++) {
            g = st.groups[ids[i]];
            g.rot = 0;
            placeBox(st, g.id, startX + (i % perRow) * stepX, t.y + padY + Math.floor(i / perRow) * stepY);
            clampGroup(st, g.id);
            moved++;
        }
        for (i = 0; i < ids.length; i++) { bringToFront(st, ids[i]); }
        return moved;
    }

    /**
     * Pick a piece to hint. Prefers a piece whose spot touches already-placed pieces,
     * then corners, then anything not yet joined to the main picture.
     * Returns { gid, pid } or null.
     */
    function pickHint(st, rng) {
        var tier1 = [], tier2 = [], tier3 = [], k, g, i, j, pid, nbs, pz = st.pz, rc;
        if (isComplete(st)) { return null; }
        for (k in st.groups) {
            if (!st.groups.hasOwnProperty(k)) { continue; }
            g = st.groups[k];
            if (isAnchored(st, g)) { continue; }
            for (i = 0; i < g.members.length; i++) {
                pid = g.members[i];
                nbs = neighbors(st, pid);
                var touchesPlaced = false;
                for (j = 0; j < nbs.length; j++) {
                    if (isAnchored(st, groupOf(st, nbs[j]))) { touchesPlaced = true; break; }
                }
                rc = pieceRC(st, pid);
                var corner = (rc.r === 0 || rc.r === pz.rows - 1) && (rc.c === 0 || rc.c === pz.cols - 1);
                var item = { gid: g.id, pid: pid };
                if (touchesPlaced) { tier1.push(item); }
                else if (corner) { tier2.push(item); }
                else { tier3.push(item); }
            }
        }
        var pool = tier1.length ? tier1 : (tier2.length ? tier2 : tier3);
        if (!pool.length) { return null; }
        return pool[Math.floor(rng() * pool.length) % pool.length];
    }

    /** Cycle order for keyboard: movable groups, top of the stack last */
    function movableGroupIds(st) {
        var out = [], i, g;
        for (i = st.order.length - 1; i >= 0; i--) {
            g = st.groups[st.order[i]];
            if (!isLocked(st, g)) { out.push(g.id); }
        }
        out.sort(function (a, b) { return st.groups[a].members[0] - st.groups[b].members[0]; });
        return out;
    }

    var api = {
        EPS: EPS,
        dist: dist,
        rotVec: rotVec,
        createState: createState,
        find: find,
        groupOf: groupOf,
        pieceRC: pieceRC,
        neighbors: neighbors,
        snapDistance: snapDistance,
        isAnchored: isAnchored,
        isLocked: isLocked,
        groupCount: groupCount,
        isComplete: isComplete,
        joins: joins,
        largestGroupSize: largestGroupSize,
        pieceOrigin: pieceOrigin,
        localBounds: localBounds,
        worldBounds: worldBounds,
        moveGroup: moveGroup,
        setGroupOffset: setGroupOffset,
        clampGroup: clampGroup,
        rotateGroup: rotateGroup,
        bringToFront: bringToFront,
        sendToBack: sendToBack,
        normalizeOrder: normalizeOrder,
        hitTest: hitTest,
        union: union,
        trySnap: trySnap,
        settleComplete: settleComplete,
        scatter: scatter,
        gatherEdges: gatherEdges,
        isEdgePiece: isEdgePiece,
        pickHint: pickHint,
        movableGroupIds: movableGroupIds
    };

    if (typeof module === 'object' && module && module.exports) {
        module.exports = api;
    } else {
        root.FongJigsaw = root.FongJigsaw || {};
        root.FongJigsaw.Groups = api;
    }
})(typeof window !== 'undefined' ? window : this);
