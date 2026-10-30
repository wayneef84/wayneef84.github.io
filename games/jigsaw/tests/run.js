// F.O.N.G. Jigsaw - unit tests for the pure modules.
// Run:  node games/jigsaw/tests/run.js     (CommonJS, no dependencies)
'use strict';

var path = require('path');
var G = require(path.join(__dirname, '..', 'js', 'geometry.js'));
var Gr = require(path.join(__dirname, '..', 'js', 'groups.js'));
var M = require(path.join(__dirname, '..', 'js', 'model.js'));

var passed = 0, failed = 0, section = '';
function group(name) { section = name; console.log('\n' + name); }
function ok(cond, msg) {
    if (cond) { passed++; console.log('  ok   ' + msg); }
    else { failed++; console.log('  FAIL ' + msg + '   [' + section + ']'); }
}
function near(a, b, tol) { return Math.abs(a - b) <= (tol === undefined ? 1e-6 : tol); }

function makeState(cols, rows, opts) {
    opts = opts || {};
    var pz = G.makePuzzle({ cols: cols, rows: rows, imgW: cols * 100, imgH: rows * 100, seed: opts.seed || 7, style: opts.style || 'jigsaw' });
    var st = Gr.createState(pz, M.makeLayout(pz), { snapPct: opts.snapPct || 0.25, lock: opts.lock !== false, rotate: !!opts.rotate });
    // spread every group far apart so nothing is accidentally adjacent or on the board
    var k;
    for (k in st.groups) { st.groups[k].ox = st.board.x + 4000 + k * 700; st.groups[k].oy = st.board.y + 4000 + k * 700; }
    return st;
}

/** put piece's group at the solved spot plus a delta */
function placeNear(st, pid, dx, dy) {
    var g = Gr.groupOf(st, pid);
    Gr.setGroupOffset(st, g.id, st.board.x + dx, st.board.y + dy);
    return g.id;
}
function away(st, pid, ox, oy) {
    var g = Gr.groupOf(st, pid);
    Gr.setGroupOffset(st, g.id, ox, oy);
    return g.id;
}

// ============================================================ geometry
group('geometry: seeded RNG and same seed => same puzzle');
(function () {
    var a = G.makeRng(123), b = G.makeRng(123), c = G.makeRng(124), same = true, diff = false, i;
    for (i = 0; i < 50; i++) { var x = a(), y = b(), z = c(); if (x !== y) { same = false; } if (x !== z) { diff = true; } }
    ok(same, 'same seed gives same random sequence');
    ok(diff, 'different seed gives a different sequence');
    var p1 = G.makePuzzle({ cols: 8, rows: 6, imgW: 800, imgH: 600, seed: 99 });
    var p2 = G.makePuzzle({ cols: 8, rows: 6, imgW: 800, imgH: 600, seed: 99 });
    var p3 = G.makePuzzle({ cols: 8, rows: 6, imgW: 800, imgH: 600, seed: 100 });
    var s1 = [], s2 = [], s3 = [], r, cc;
    for (r = 0; r < 6; r++) { for (cc = 0; cc < 8; cc++) {
        s1.push(G.pieceOps(p1, r, cc)); s2.push(G.pieceOps(p2, r, cc)); s3.push(G.pieceOps(p3, r, cc));
    } }
    ok(JSON.stringify(s1) === JSON.stringify(s2), 'all 48 outlines identical for equal seeds');
    ok(JSON.stringify(s1) !== JSON.stringify(s3), 'a different seed changes the outlines');
    var e1 = G.edgeParams(5, 0, 2, 3), e2 = G.edgeParams(5, 0, 2, 3), e3 = G.edgeParams(5, 1, 2, 3);
    ok(JSON.stringify(e1) === JSON.stringify(e2), 'edgeParams is deterministic');
    ok(JSON.stringify(e1) !== JSON.stringify(e3), 'horizontal and vertical edges get different params');
    var dirs = { '-1': 0, '1': 0 };
    for (i = 0; i < 400; i++) { dirs[String(G.edgeParams(1, 0, i, 0).dir)]++; }
    ok(dirs['-1'] > 120 && dirs['1'] > 120, 'tab directions are mixed (' + dirs['-1'] + '/' + dirs['1'] + ')');
})();

group('geometry: chooseGrid');
(function () {
    var aspects = [0.6, 0.75, 1, 1.333, 1.5, 1.78];
    var counts = [6, 12, 24, 48, 100, 150, 300];
    var worst = 0, worstN = 0, bad = 0, i, j;
    for (i = 0; i < counts.length; i++) {
        for (j = 0; j < aspects.length; j++) {
            var g = G.chooseGrid(counts[i], aspects[j]);
            var n = g.cols * g.rows, cell = aspects[j] * g.rows / g.cols;
            var dev = Math.abs(Math.log(cell));
            if (dev > worst) { worst = dev; }
            var nd = Math.abs(n / counts[i] - 1);
            if (nd > worstN) { worstN = nd; }
            if (cell < 0.65 || cell > 1.55 || nd > 0.2) { bad++; console.log('     grid ' + counts[i] + ' @' + aspects[j] + ' -> ' + g.cols + 'x' + g.rows + ' cell ' + cell.toFixed(2)); }
        }
    }
    ok(bad === 0, 'every preset x aspect: cells between 0.65 and 1.55, count within 20% (worst cell dev ' + worst.toFixed(2) + ', worst count dev ' + (worstN * 100).toFixed(0) + '%)');
    var a = G.chooseGrid(12, 4 / 3), b = G.chooseGrid(300, 4 / 3), c = G.chooseGrid(4, 1);
    ok(a.cols === 4 && a.rows === 3, '12 pieces at 4:3 is 4x3');
    ok(b.cols === 20 && b.rows === 15, '300 pieces at 4:3 is 20x15');
    ok(c.cols === 2 && c.rows === 2, '4 pieces at 1:1 is 2x2');
    var d = G.chooseGrid(6, 0.5625);
    ok(d.rows > d.cols, 'portrait image gives more rows than columns (' + d.cols + 'x' + d.rows + ')');
    var e = G.chooseGrid(10, NaN);
    ok(e.cols * e.rows >= 8, 'bad aspect falls back to something sane');
})();

group('geometry: neighbouring edges complement');
(function () {
    var pz = G.makePuzzle({ cols: 7, rows: 5, imgW: 700, imgH: 500, seed: 31 });
    var r, c, allSame = true, oneOwner = true, tabs = 0, blanks = 0, flatBorders = true;
    function sidesAbs(rr, cc) { return G.pieceSides(pz, rr, cc); }
    function peak(chain) {
        // furthest flattened point from the straight line of the edge
        var ops = [['M', chain.x0, chain.y0]], i;
        for (i = 0; i < chain.segs.length; i++) { ops.push(['C'].concat(chain.segs[i])); }
        var poly = G.flatten(ops, 12), end = chain.segs[chain.segs.length - 1];
        var dx = end[4] - chain.x0, dy = end[5] - chain.y0, len = Math.sqrt(dx * dx + dy * dy), best = 0, bp = null, k, d;
        for (k = 0; k < poly.length; k++) {
            d = Math.abs((poly[k][0] - chain.x0) * dy - (poly[k][1] - chain.y0) * dx) / len;
            if (d > best) { best = d; bp = poly[k]; }
        }
        return bp;
    }
    for (r = 0; r < pz.rows; r++) {
        for (c = 0; c < pz.cols; c++) {
            var s = sidesAbs(r, c);
            if (c < pz.cols - 1) {
                var n = sidesAbs(r, c + 1);
                var rev = G.reverseChain(n[3]);                   // neighbour's left, walked backwards
                if (JSON.stringify(rev) !== JSON.stringify(s[1])) { allSame = false; }
                var pk = peak(s[1]);
                var inA = G.pointInPolygon(offset(G.piecePolygon(pz, r, c), c * pz.pw, r * pz.ph), pk[0], pk[1]);
                var inB = G.pointInPolygon(offset(G.piecePolygon(pz, r, c + 1), (c + 1) * pz.pw, r * pz.ph), pk[0], pk[1]);
                if (inA === inB) { oneOwner = false; }
                if (inA) { tabs++; } else { blanks++; }
            }
            if (r < pz.rows - 1) {
                var m = sidesAbs(r + 1, c);
                var rev2 = G.reverseChain(m[0]);
                if (JSON.stringify(rev2) !== JSON.stringify(s[2])) { allSame = false; }
                var pk2 = peak(m[0]);
                var inC = G.pointInPolygon(offset(G.piecePolygon(pz, r, c), c * pz.pw, r * pz.ph), pk2[0], pk2[1]);
                var inD = G.pointInPolygon(offset(G.piecePolygon(pz, r + 1, c), c * pz.pw, (r + 1) * pz.ph), pk2[0], pk2[1]);
                if (inC === inD) { oneOwner = false; }
                if (inC) { tabs++; } else { blanks++; }
            }
            // outer border sides are straight
            var poly = G.piecePolygon(pz, r, c), b = G.polygonBounds(poly);
            if (c === 0 && b.minX < -1e-9) { flatBorders = false; }
            if (r === 0 && b.minY < -1e-9) { flatBorders = false; }
            if (c === pz.cols - 1 && b.maxX > pz.pw + 1e-9) { flatBorders = false; }
            if (r === pz.rows - 1 && b.maxY > pz.ph + 1e-9) { flatBorders = false; }
        }
    }
    function offset(poly, dx, dy) { var o = [], i; for (i = 0; i < poly.length; i++) { o.push([poly[i][0] + dx, poly[i][1] + dy]); } return o; }
    ok(allSame, 'every shared edge: one piece\'s side is exactly the neighbour\'s side reversed');
    ok(oneOwner, 'every shared edge bulges into exactly one of the two pieces (tab on one side, blank on the other)');
    ok(tabs > 10 && blanks > 10, 'both tabs and blanks occur (' + tabs + ' / ' + blanks + ')');
    ok(flatBorders, 'outer border sides are flat');
})();

group('geometry: area sums and no gaps');
(function () {
    var styles = ['jigsaw', 'square'], si;
    for (si = 0; si < styles.length; si++) {
        var pz = G.makePuzzle({ cols: 9, rows: 6, imgW: 900, imgH: 640, seed: 4242, style: styles[si] });
        var total = 0, r, c, minA = Infinity, maxA = 0, within = true;
        for (r = 0; r < pz.rows; r++) { for (c = 0; c < pz.cols; c++) {
            var poly = G.piecePolygon(pz, r, c), a = G.polygonArea(poly), b = G.polygonBounds(poly);
            total += a;
            if (a < minA) { minA = a; } if (a > maxA) { maxA = a; }
            if (b.minX < -pz.margin || b.minY < -pz.margin || b.maxX > pz.pw + pz.margin || b.maxY > pz.ph + pz.margin) { within = false; }
        } }
        ok(near(total, pz.bw * pz.bh, 1e-6), styles[si] + ': summed piece area ' + total.toFixed(4) + ' = board area ' + (pz.bw * pz.bh).toFixed(4));
        ok(within, styles[si] + ': every outline stays inside the tab margin');
        ok(minA > 0.5 * pz.pw * pz.ph && maxA < 1.5 * pz.pw * pz.ph, styles[si] + ': piece areas are sane (' + minA.toFixed(0) + '..' + maxA.toFixed(0) + ')');
        // coverage: every random board point is in exactly one piece
        var rng = G.makeRng(1), k, bad = 0, n = 4000, cnt;
        for (k = 0; k < n; k++) {
            var x = rng() * pz.bw, y = rng() * pz.bh;
            cnt = 0;
            for (r = 0; r < pz.rows; r++) { for (c = 0; c < pz.cols; c++) {
                if (x < (c - 1) * pz.pw || x > (c + 2) * pz.pw || y < (r - 1) * pz.ph || y > (r + 2) * pz.ph) { continue; }
                if (G.pointInPolygon(G.piecePolygon(pz, r, c), x - c * pz.pw, y - r * pz.ph)) { cnt++; }
            } }
            if (cnt !== 1) { bad++; }
        }
        ok(bad === 0, styles[si] + ': ' + n + ' random board points each fall in exactly one piece (no gaps, no overlap)');
    }
    var rz = G.makePuzzle({ cols: 3, rows: 3, imgW: 300, imgH: 300, seed: 1, style: 'rounded' });
    var ra = G.polygonArea(G.piecePolygon(rz, 1, 1));
    ok(ra > 0.9 * rz.pw * rz.ph && ra < rz.pw * rz.ph, 'rounded style: a piece is a rounded square (area ' + ra.toFixed(0) + ')');
})();

// ============================================================ snapping
group('snapping: board frame');
(function () {
    var st = makeState(4, 3), d = Gr.snapDistance(st);
    ok(near(d, 25), 'default snapDistance is 25% of piece width (' + d + ')');
    var gid = placeNear(st, 5, 0.9 * d, 0);
    var res = Gr.trySnap(st, gid);
    ok(res.snapped && res.frame, 'piece inside snapDistance of its spot snaps to the frame');
    var g = Gr.groupOf(st, 5);
    ok(near(g.ox, st.board.x) && near(g.oy, st.board.y), 'it lands exactly on the board position');
    ok(res.anchored && res.locked && Gr.isLocked(st, g), 'with lock on the anchored piece is locked');
    ok(Gr.hitTest(st, st.board.x + 150, st.board.y + 150) === null, 'locked piece cannot be picked up (hit test skips it)');
    var inc = Gr.hitTest(st, st.board.x + 150, st.board.y + 150, true);
    ok(inc && inc.pid === 5, 'but it is found when locked pieces are included');
    ok(st.order[0] === g.id, 'locked group sits at the bottom of the z-order');

    var st2 = makeState(4, 3), d2 = Gr.snapDistance(st2);
    var g2 = placeNear(st2, 5, d2 + 0.01, 0);
    var r2 = Gr.trySnap(st2, g2);
    ok(!r2.snapped && !r2.frame, 'just outside snapDistance (+0.01) does not snap');
    var g3 = placeNear(st2, 5, d2, 0);
    var r3 = Gr.trySnap(st2, g3);
    ok(r3.snapped && r3.frame, 'exactly at snapDistance snaps (boundary is inclusive)');
    var g4 = placeNear(st2, 6, 0.8 * d2, 0.8 * d2);
    var r4 = Gr.trySnap(st2, g4);
    ok(!r4.frame, 'distance is Euclidean: an offset of 0.8d,0.8d (1.13d away) does not snap');
    var st3 = makeState(4, 3);
    var g5 = placeNear(st3, 5, 0, 0);
    st3.settings.rotate = true;
    Gr.rotateGroup(st3, g5, 1);
    var r5 = Gr.trySnap(st3, g5);
    ok(!r5.snapped, 'rotated piece in the right place does not snap');
    Gr.rotateGroup(st3, g5, 3);
    Gr.setGroupOffset(st3, g5, st3.board.x + 3, st3.board.y - 2);
    ok(Gr.trySnap(st3, g5).frame, 'after rotating back it snaps');
})();

group('snapping: lock toggle');
(function () {
    var st = makeState(3, 3, { lock: false });
    var gid = placeNear(st, 4, 5, 5);
    var res = Gr.trySnap(st, gid);
    ok(res.anchored && !res.locked, 'lock off: piece is placed but not locked');
    var g = Gr.groupOf(st, 4);
    var hit = Gr.hitTest(st, st.board.x + 150, st.board.y + 150);
    ok(hit && hit.gid === g.id, 'lock off: it can still be picked up');
    st.settings.lock = true;
    ok(Gr.isLocked(st, g) && Gr.hitTest(st, st.board.x + 150, st.board.y + 150) === null, 'switching lock on locks already placed pieces');
})();

group('snapping: piece to piece (no frame)');
(function () {
    var st = makeState(4, 3), d = Gr.snapDistance(st);
    // pieces 5 (r1,c1) and 6 (r1,c2) are neighbours. Park 5 far from the board.
    var farX = st.board.x + 2000, farY = st.board.y + 2000;
    var a = away(st, 5, farX, farY);
    var b = away(st, 6, farX + 0.6 * d, farY - 0.5 * d);
    var res = Gr.trySnap(st, b);
    ok(res.snapped && !res.frame && res.merges === 1 && res.size === 2, 'two adjacent pieces aligned within snapDistance merge');
    var g = Gr.groupOf(st, 5);
    ok(Gr.groupOf(st, 6) === g, 'they now share one group');
    var p5 = Gr.pieceOrigin(st, g, 5), p6 = Gr.pieceOrigin(st, g, 6);
    ok(near(p6.x - p5.x, 100) && near(p6.y - p5.y, 0), 'merged pieces are exactly aligned (neighbour spacing 100,0)');
    ok(!Gr.isAnchored(st, g), 'merged group away from the board is not anchored');

    var st2 = makeState(4, 3);
    away(st2, 5, farX, farY);
    var c = away(st2, 6, farX + d + 0.5, farY);
    ok(!Gr.trySnap(st2, c).snapped, 'neighbours just outside snapDistance do not merge');

    var st3 = makeState(4, 3);
    away(st3, 5, farX, farY);
    var e = away(st3, 7, farX, farY);   // 7 is not adjacent to 5 (two columns apart)
    ok(!Gr.trySnap(st3, e).snapped, 'same alignment but not solution-neighbours does not merge');
    var st4 = makeState(4, 3);
    away(st4, 5, farX, farY);
    var f = away(st4, 10, farX, farY);  // diagonal-ish (r2,c2) vs (r1,c1): not edge-adjacent
    ok(!Gr.trySnap(st4, f).snapped, 'diagonal pieces do not merge');
})();

group('snapping: transitive merge and groups');
(function () {
    var st = makeState(4, 3), d = Gr.snapDistance(st);
    var fx = st.board.x + 2000, fy = st.board.y + 2000;
    var a = away(st, 0, fx, fy);
    away(st, 1, fx + 0.2 * d, fy);
    var c = away(st, 2, fx + 0.1 * d, fy + 0.1 * d);
    var res = Gr.trySnap(st, c);
    ok(res.merges === 2 && res.size === 3, 'dropping a piece next to two near-aligned neighbours merges all three (transitive), merges=' + res.merges);
    ok(Gr.groupCount(st) === 10 && Gr.joins(st) === 2, 'group count and joins are right (10 groups, 2 joins)');
    // moving a group moves all members rigidly
    var g = Gr.groupOf(st, 0);
    var before = Gr.pieceOrigin(st, g, 2);
    Gr.moveGroup(st, g.id, 40, -10);
    var after = Gr.pieceOrigin(st, g, 2);
    ok(near(after.x - before.x, 40) && near(after.y - before.y, -10), 'a merged group moves rigidly');
    // merged group then snapped to the frame as one body
    Gr.setGroupOffset(st, g.id, st.board.x + 0.5 * d, st.board.y - 0.3 * d);
    var r2 = Gr.trySnap(st, g.id);
    ok(r2.frame && r2.anchored && r2.size === 3, 'a merged group snaps to the frame as one body');
    var p2 = Gr.pieceOrigin(st, Gr.groupOf(st, 2), 2);
    ok(near(p2.x, st.board.x + 200) && near(p2.y, st.board.y), 'every member lands on its solved cell');
    // an anchored group and a loose neighbour near its spot merge via the frame rule
    var h = placeNear(st, 3, 0.7 * d, 0.4 * d);
    var r3 = Gr.trySnap(st, h);
    ok(r3.frame && r3.size === 4, 'a loose piece snapping to the frame also joins the anchored neighbour group (size 4)');
    // rotation mismatch blocks merge
    var st2 = makeState(4, 3, { rotate: true });
    var x0 = away(st2, 0, fx, fy), x1 = away(st2, 1, fx, fy);
    Gr.rotateGroup(st2, x1, 1);
    Gr.setGroupOffset(st2, x1, fx, fy);
    ok(!Gr.trySnap(st2, x1).snapped, 'rotation mismatch blocks piece-to-piece snap');
    Gr.setGroupOffset(st2, x1, fx, fy); st2.groups[x1].rot = 0;
    ok(Gr.trySnap(st2, x1).snapped, 'matching rotation allows it');
})();

group('snapping: little hands (45%) and tunable distance');
(function () {
    var st = makeState(2, 2, { snapPct: 0.45 });
    ok(near(Gr.snapDistance(st), 45), 'snapDistance at 45% is 45');
    var g = placeNear(st, 0, 40, 0);
    ok(Gr.trySnap(st, g).frame, 'a piece 40 units off (0.4 widths) snaps in little hands');
    var st2 = makeState(2, 2, { snapPct: 0.05 });
    var g2 = placeNear(st2, 0, 6, 0);
    ok(!Gr.trySnap(st2, g2).snapped, 'slider at 5%: 6 units off does not snap');
    var g3 = placeNear(st2, 0, 4.9, 0);
    ok(Gr.trySnap(st2, g3).snapped, 'slider at 5%: 4.9 units off does snap');
    ok(M.sanitizeSettings({ little: true, snapPct: 0.1, count: 40 }).snapPct === 0.45, 'little hands settings force 45% snapping');
    ok(M.sanitizeSettings({ little: true, count: 40 }).count === 12, 'little hands caps pieces at 12');
    ok(M.sanitizeSettings({ snapPct: 7 }).snapPct === 0.5 && M.sanitizeSettings({ snapPct: -1 }).snapPct === 0.05, 'snapPct is clamped to 5..50%');
})();

group('solving a whole puzzle by dropping pieces near their spots');
(function () {
    var sizes = [[4, 3], [8, 6], [20, 15]], i;
    for (i = 0; i < sizes.length; i++) {
        var st = M.newGame({ imgW: sizes[i][0] * 100, imgH: sizes[i][1] * 100, count: sizes[i][0] * sizes[i][1], seed: 11 + i, rng: G.makeRng(5) });
        ok(st.pz.count === sizes[i][0] * sizes[i][1], sizes[i][0] + 'x' + sizes[i][1] + ': new game has all pieces');
        var rng = G.makeRng(77), ids = [], k, n = st.pz.count;
        for (k = 0; k < n; k++) { ids.push(k); }
        for (k = n - 1; k > 0; k--) { var j = Math.floor(rng() * (k + 1)); var t = ids[k]; ids[k] = ids[j]; ids[j] = t; }
        var d = Gr.snapDistance(st), done = false;
        for (k = 0; k < n; k++) {
            var g = Gr.groupOf(st, ids[k]);
            if (Gr.isLocked(st, g)) { continue; }
            // drop with an error of up to 90% of d in a random direction
            var ang = rng() * 6.283, mag = 0.9 * d * rng();
            Gr.setGroupOffset(st, g.id, st.board.x + Math.cos(ang) * mag, st.board.y + Math.sin(ang) * mag);
            Gr.trySnap(st, g.id);
        }
        ok(Gr.isComplete(st) && Gr.joins(st) === n - 1, sizes[i][0] + 'x' + sizes[i][1] + ': solved to one group (' + Gr.groupCount(st) + ' group)');
        var one = st.groups[st.order[0]];
        ok(Gr.isAnchored(st, one) && one.members.length === n, sizes[i][0] + 'x' + sizes[i][1] + ': final group is exactly on the board');
    }
})();

group('snapping: solving without ever touching the board frame');
(function () {
    var st = makeState(4, 3, { lock: true }), n = 12, k;
    var fx = st.board.x + 3000, fy = st.board.y + 3000, d = Gr.snapDistance(st);
    for (k = 0; k < n; k++) {
        var r = Math.floor(k / 4), c = k % 4;
        var gg = Gr.groupOf(st, k);
        // lay them out so each is within 0.5d of its right place relative to a far-away board
        Gr.setGroupOffset(st, gg.id, fx + 0.3 * d * ((k % 3) - 1), fy + 0.3 * d * ((k % 2) - 0.5));
        Gr.trySnap(st, gg.id);
    }
    ok(Gr.isComplete(st), 'a picture assembled off-board counts as complete');
    ok(Gr.settleComplete(st) && Gr.isAnchored(st, st.groups[st.order[0]]), 'settleComplete moves it onto the board');
})();

group('hit testing, z-order, clamp, rotation, scatter, gather, hint');
(function () {
    var st = makeState(4, 3);
    // stack piece 1 on top of piece 0 at identical position
    away(st, 0, 500, 500); away(st, 1, 500, 500);
    Gr.bringToFront(st, 1);
    var pz = st.pz;
    // piece 0 cell origin = (500,500); piece 1 origin = (600,500). Point inside cell of piece 0.
    var hit = Gr.hitTest(st, 550, 550);
    ok(hit && hit.pid === 0, 'point inside a piece cell picks that piece');
    // overlapping: put group 1 so its cell origin is at 500,500 (offset = 500-100)
    away(st, 1, 400, 500);
    Gr.bringToFront(st, 1);
    hit = Gr.hitTest(st, 550, 550);
    ok(hit && hit.pid === 1, 'topmost piece wins when pieces overlap');
    Gr.bringToFront(st, 0);
    hit = Gr.hitTest(st, 550, 550);
    ok(hit && hit.pid === 0, 'after bringToFront the other wins');
    ok(Gr.hitTest(st, 5000, 5000) === null, 'empty table misses');
    // a blank (notch) point is outside its piece polygon: find a bbox point not in polygon
    var poly = G.piecePolygon(pz, 1, 1), found = false, x, y;
    for (x = -pz.margin; x < pz.pw + pz.margin && !found; x += 2) { for (y = -pz.margin; y < pz.ph + pz.margin && !found; y += 2) {
        if (!G.pointInPolygon(poly, x, y)) { found = true; away(st, 5, 1000, 1000); var h2 = Gr.hitTest(st, 1000 + 100 + x, 1000 + 100 + y); if (h2 && h2.pid === 5) { found = false; } }
    } }
    ok(found, 'the empty corner of a piece bounding box does not hit the piece');
    // tab hit: a point beyond the cell box that is inside the polygon
    var tabHit = false;
    for (x = -pz.margin; x < pz.pw + pz.margin && !tabHit; x += 2) { for (y = -pz.margin; y < pz.ph + pz.margin && !tabHit; y += 2) {
        if ((x < 0 || y < 0 || x > pz.pw || y > pz.ph) && G.pointInPolygon(poly, x, y)) {
            away(st, 5, 1000, 1000);
            var h3 = Gr.hitTest(st, 1100 + x, 1100 + y);
            tabHit = !!(h3 && h3.pid === 5);
        }
    } }
    ok(tabHit, 'a point on a tab (outside the cell box) hits its piece');

    // clamp
    var gid = away(st, 3, -500, 9000);
    Gr.clampGroup(st, gid);
    var b = Gr.worldBounds(st, st.groups[gid], 0);
    ok(b.minX >= st.table.x - 1e-6 && b.maxY <= st.table.y + st.table.h + 1e-6, 'clamp pulls a lost piece back into the table');
    // clamp big group
    var st2 = makeState(4, 3);
    var ids = [], k;
    var fx = st2.board.x + 3000, fy = st2.board.y + 3000;
    for (k = 0; k < 12; k++) { var gg = Gr.groupOf(st2, k); Gr.setGroupOffset(st2, gg.id, fx, fy); Gr.trySnap(st2, gg.id); }
    var big = st2.groups[st2.order[0]];
    Gr.setGroupOffset(st2, big.id, -10000, -10000);
    Gr.clampGroup(st2, big.id);
    var bb = Gr.worldBounds(st2, big, 0);
    ok(bb.minX >= st2.table.x - 1e-6 && bb.maxX <= st2.table.x + st2.table.w + 1e-6 && bb.minY >= st2.table.y - 1e-6, 'clamp keeps a merged group inside the table');

    // rotate
    var st3 = makeState(4, 3, { rotate: true });
    var g0 = away(st3, 5, 700, 600), g1 = away(st3, 6, 700, 600);
    Gr.trySnap(st3, g1);
    var gm = Gr.groupOf(st3, 5);
    var c0 = Gr.worldBounds(st3, gm, 0);
    var cx = (c0.minX + c0.maxX) / 2, cy = (c0.minY + c0.maxY) / 2;
    Gr.rotateGroup(st3, gm.id, 1);
    var c1 = Gr.worldBounds(st3, gm, 0);
    ok(near((c1.minX + c1.maxX) / 2, cx, 1e-6) && near((c1.minY + c1.maxY) / 2, cy, 1e-6), 'rotating a group keeps its centre fixed');
    ok(near(c1.maxX - c1.minX, c0.maxY - c0.minY) && near(c1.maxY - c1.minY, c0.maxX - c0.minX), 'rotating swaps width and height');
    Gr.rotateGroup(st3, gm.id, 3);
    ok(gm.rot === 0 && near(gm.ox, 700, 1e-6) && near(gm.oy, 600, 1e-6), 'four quarter turns return to the start');
    // hit test while rotated
    Gr.rotateGroup(st3, gm.id, 1);
    var po = Gr.pieceOrigin(st3, gm, 5);
    var any = Gr.hitTest(st3, (c1.minX + c1.maxX) / 2, (c1.minY + c1.maxY) / 2);
    ok(any && (any.pid === 5 || any.pid === 6), 'hit test works on a rotated group');
    ok(po.x === po.x, 'pieceOrigin is finite when rotated');

    // scatter
    var st4 = M.newGame({ imgW: 1200, imgH: 900, count: 48, seed: 3, rng: G.makeRng(9) });
    var onBoard = 0, outside = 0;
    for (var kk in st4.groups) {
        var wb = Gr.worldBounds(st4, st4.groups[kk], 0);
        if (!(wb.maxX <= st4.board.x || wb.minX >= st4.board.x + st4.board.w || wb.maxY <= st4.board.y || wb.minY >= st4.board.y + st4.board.h)) { onBoard++; }
        if (wb.minX < -1e-6 || wb.minY < -1e-6 || wb.maxX > st4.table.w + 1e-6 || wb.maxY > st4.table.h + 1e-6) { outside++; }
    }
    ok(onBoard === 0, 'scatter keeps all 48 pieces off the board area');
    ok(outside === 0, 'scatter keeps all pieces inside the table');
    // gather edges
    var moved = Gr.gatherEdges(st4);
    var expectedEdges = 2 * (st4.pz.cols + st4.pz.rows) - 4;
    ok(moved === expectedEdges, 'gatherEdges moved every edge piece (' + moved + ' of ' + expectedEdges + ')');
    var inBand = true, ys = [];
    for (var pid = 0; pid < st4.pz.count; pid++) {
        if (!Gr.isEdgePiece(st4, pid)) { continue; }
        var wb2 = Gr.worldBounds(st4, Gr.groupOf(st4, pid), 0);
        ys.push(wb2.minY);
        if (wb2.minY < st4.table.y - 1e-6 || wb2.maxY > st4.board.y + 1e-6 || wb2.minX < -1e-6 || wb2.maxX > st4.table.w + 1e-6) { inBand = false; }
    }
    ok(inBand, 'gathered edge pieces sit tidily in the band above the board, inside the table');
    // hint
    var hnt = Gr.pickHint(st4, G.makeRng(2));
    ok(hnt && st4.groups[hnt.gid] && st4.groups[hnt.gid].members.indexOf(hnt.pid) >= 0, 'pickHint returns a real piece');
    var corner = (function () { var rc = Gr.pieceRC(st4, hnt.pid); return (rc.r === 0 || rc.r === st4.pz.rows - 1) && (rc.c === 0 || rc.c === st4.pz.cols - 1); })();
    ok(corner, 'with nothing placed the hint is a corner piece');
    // after placing corner 0, hint prefers touching pieces
    var gA = placeNear(st4, 0, 0, 0); Gr.trySnap(st4, gA);
    var okTouch = true, t;
    for (t = 0; t < 20; t++) { var hh = Gr.pickHint(st4, G.makeRng(t + 10)); if (Gr.neighbors(st4, hh.pid).indexOf(0) < 0) { okTouch = false; } }
    ok(okTouch, 'once a piece is placed hints pick its neighbours');
})();

// ============================================================ model
group('model: serialize round trip');
(function () {
    var st = M.newGame({ imgW: 1000, imgH: 750, count: 24, seed: 2024, rng: G.makeRng(3), settings: { snapPct: 0.3, rotate: true, lock: false } });
    var rng = G.makeRng(8), k;
    for (k = 0; k < 24; k += 2) {
        var g = Gr.groupOf(st, k);
        Gr.setGroupOffset(st, g.id, st.board.x + 2 * (rng() - 0.5) * 10, st.board.y + 2 * (rng() - 0.5) * 10);
        Gr.trySnap(st, g.id);
    }
    st.elapsedMs = 123456;
    var json = JSON.stringify(M.serialize(st));
    var back = M.deserialize(JSON.parse(json));
    ok(!!back, 'deserialize accepts its own output');
    ok(JSON.stringify(M.serialize(back)) === json, 'serialize(deserialize(x)) is identical to x');
    ok(back.pz.seed === st.pz.seed && back.pz.cols === st.pz.cols && back.pz.rows === st.pz.rows, 'seed and grid survive');
    ok(JSON.stringify(G.pieceOps(back.pz, 2, 3)) === JSON.stringify(G.pieceOps(st.pz, 2, 3)), 'the same seed rebuilds the same piece shapes after reload');
    ok(Gr.groupCount(back) === Gr.groupCount(st) && back.elapsedMs === 123456, 'group count and elapsed survive');
    ok(back.settings.snapPct === 0.3 && back.settings.rotate === true && back.settings.lock === false, 'snap, rotate and lock settings survive');
    var same = true, i;
    for (i = 0; i < 24; i++) {
        var a = Gr.groupOf(st, i), b = Gr.groupOf(back, i);
        var pa = Gr.pieceOrigin(st, a, i), pb = Gr.pieceOrigin(back, b, i);
        if (Math.abs(pa.x - pb.x) > 0.01 || Math.abs(pa.y - pb.y) > 0.01 || a.members.length !== b.members.length) { same = false; }
    }
    ok(same, 'every piece is in the same place with the same group size');
    ok(json.length < 4000, 'a 24 piece save is small (' + json.length + ' chars)');
    // union-find still works after restore
    var loose = -1;
    for (i = 0; i < 24; i++) { if (Gr.groupOf(back, i).members.length === 1) { loose = i; break; } }
    ok(loose >= 0 && Gr.find(back, loose) === loose, 'restored union-find roots are consistent');

    function mut(fn) { var o = JSON.parse(json); fn(o); return M.deserialize(o); }
    ok(mut(function () {}) !== null, 'control: unmodified copy is accepted');
    ok(mut(function (o) { o.v = 1; }) === null, 'old version rejected');
    ok(mut(function (o) { o.groups[0].m.pop(); if (!o.groups[0].m.length) { o.groups.shift(); } }) === null, 'missing piece rejected');
    ok(mut(function (o) { o.groups[0].m.push(o.groups[1].m[0]); }) === null, 'duplicate piece rejected');
    ok(mut(function (o) { o.groups[0].x = null; }) === null, 'null coordinate rejected');
    ok(mut(function (o) { o.groups[0].x = 1e12; }) === null, 'absurd coordinate rejected');
    ok(mut(function (o) { o.groups[0].r = 9; }) === null, 'bad rotation rejected');
    ok(mut(function (o) { o.puzzle.cols = 0; }) === null, 'zero columns rejected');
    ok(mut(function (o) { o.puzzle.cols = 500; o.puzzle.rows = 500; }) === null, 'huge grid rejected');
    ok(mut(function (o) { o.puzzle.style = 'weird'; }) === null, 'unknown style rejected');
    ok(mut(function (o) { o.groups = 'x'; }) === null, 'non-array groups rejected');
    ok(M.deserialize(null) === null && M.deserialize('hi') === null && M.deserialize([]) === null, 'null, string and array rejected');
})();

group('model: puzzle file import validation');
(function () {
    var PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    var JPG = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
    var st = M.newGame({ imgW: 800, imgH: 600, count: 12, seed: 5, rng: G.makeRng(1) });
    var good = M.buildFile(st, PNG, 'Kitten <b>day</b>', { little: false });
    var text = JSON.stringify(good);
    var r = M.parsePuzzleFile(text);
    ok(r.ok && r.file.puzzle.cols === 4 && r.file.puzzle.rows === 3 && r.file.kind === 'png', 'a valid file is accepted');
    ok(r.ok && r.file.name === 'Kitten bday/b', 'name is stripped of angle brackets (' + (r.ok ? r.file.name : '') + ')');
    var j = JSON.parse(JSON.stringify(good)); j.image = JPG;
    ok(M.parsePuzzleFile(JSON.stringify(j)).ok, 'a jpeg data URL with real magic bytes is accepted');
    function bad(label, fn) {
        var o = JSON.parse(text); var out = fn(o);
        var t = typeof out === 'string' ? out : JSON.stringify(o);
        var res = M.parsePuzzleFile(t);
        ok(!res.ok && typeof res.error === 'string' && res.error.length > 0, 'rejects: ' + label);
    }
    bad('not JSON', function () { return 'hello {'; });
    bad('empty string', function () { return ''; });
    bad('JSON array', function () { return '[1,2,3]'; });
    bad('JSON null', function () { return 'null'; });
    bad('wrong format tag', function (o) { o.format = 'something'; });
    bad('missing format', function (o) { delete o.format; });
    bad('newer version', function (o) { o.version = 3; });
    bad('missing puzzle', function (o) { delete o.puzzle; });
    bad('cols 0', function (o) { o.puzzle.cols = 0; });
    bad('cols 61', function (o) { o.puzzle.cols = 61; });
    bad('600+ pieces', function (o) { o.puzzle.cols = 40; o.puzzle.rows = 20; });
    bad('fractional cols', function (o) { o.puzzle.cols = 2.5; });
    bad('string seed', function (o) { o.puzzle.seed = '5'; });
    bad('NaN-like image size', function (o) { o.puzzle.imgW = 'wide'; });
    bad('image size too large', function (o) { o.puzzle.imgW = 99999; });
    bad('unknown style', function (o) { o.puzzle.style = '<script>'; });
    bad('snapPct 0.9', function (o) { o.settings.snapPct = 0.9; });
    bad('snapPct 0.01', function (o) { o.settings.snapPct = 0.01; });
    bad('lock not boolean', function (o) { o.settings.lock = 'yes'; });
    bad('missing image', function (o) { delete o.image; });
    bad('image is a URL', function (o) { o.image = 'https://example.com/a.png'; });
    bad('image is javascript:', function (o) { o.image = 'javascript:alert(1)'; });
    bad('svg data URL', function (o) { o.image = 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+'; });
    bad('html data URL', function (o) { o.image = 'data:text/html;base64,PGgxPmhpPC9oMT4='; });
    bad('png label but text bytes', function (o) { o.image = 'data:image/png;base64,SGVsbG8gd29ybGQgdGhpcyBpcyBub3QgYW4gaW1hZ2U='; });
    bad('jpeg label on png bytes', function (o) { o.image = 'data:image/jpeg;base64,' + PNG.split(',')[1]; });
    bad('base64 with illegal characters', function (o) { o.image = PNG + '<script>'; });
    bad('image not a string', function (o) { o.image = { a: 1 }; });
    bad('image over the size limit', function (o) { o.image = 'data:image/png;base64,iVBORw0KGgo' + new Array(M.MAX_IMAGE_CHARS + 10).join('A'); });
    bad('file text over the size limit', function () { return new Array(M.MAX_FILE_CHARS + 2).join(' '); });
    ok(!M.parsePuzzleFile(undefined).ok && !M.parsePuzzleFile(42).ok, 'non-string input rejected');
    var proto = M.parsePuzzleFile('{"__proto__":{"polluted":1},"format":"fong-jigsaw","version":2}');
    ok(!proto.ok && ({}).polluted === undefined, 'prototype pollution attempt does nothing');
    ok(M.sniffDataUrl(PNG) === 'png' && M.sniffDataUrl(JPG) === 'jpeg' && M.sniffDataUrl('data:image/gif;base64,R0lGODlh') === null, 'sniffDataUrl identifies png, jpeg and refuses gif');
    var webp = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    ok(M.sniffDataUrl(webp) === 'webp', 'sniffDataUrl identifies webp');
})();

group('model: view zoom and pan');
(function () {
    var table = { x: 0, y: 0, w: 1000, h: 800 }, vw = 360, vh = 500;
    var v = M.viewFit(table, vw, vh, 8);
    ok(v.s > 0 && v.s * table.w <= vw - 15, 'fit makes the table fit the viewport (scale ' + v.s.toFixed(3) + ')');
    var wp = M.screenToWorld(v, 200, 250);
    var v2 = M.viewZoomAt({ s: v.s, tx: v.tx, ty: v.ty }, 200, 250, 2, table, vw, vh);
    var wp2 = M.screenToWorld(v2, 200, 250);
    ok(near(wp.x, wp2.x, 1e-6) && near(wp.y, wp2.y, 1e-6) && near(v2.s, v.s * 2, 1e-9), 'zoom keeps the point under the finger fixed');
    var v3 = M.viewZoomAt({ s: v.s, tx: v.tx, ty: v.ty }, 100, 100, 1000, table, vw, vh);
    ok(v3.s <= M.viewLimits(table, vw, vh).max + 1e-9, 'zoom is capped');
    var v4 = M.viewZoomAt({ s: v.s, tx: v.tx, ty: v.ty }, 100, 100, 0.0001, table, vw, vh);
    ok(v4.s >= M.viewLimits(table, vw, vh).min - 1e-9, 'zoom out is capped');
    var v5 = M.viewClamp({ s: v.s, tx: 99999, ty: -99999 }, table, vw, vh);
    ok(v5.tx <= vw && v5.ty >= -table.h * v5.s, 'pan is clamped so the table never leaves the screen');
})();

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
