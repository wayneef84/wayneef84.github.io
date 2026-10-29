/**
 * Slots engine: pure game maths. No DOM, no storage, no timers.
 * Loaded first. Also loaded headless by tests/sim.js.
 *
 * Money rule: everything is in play coins. A pay value is "units", one unit is
 * bet / 10, so coins = units * bet / 10. Bets are always multiples of 10, so
 * payouts are always whole numbers.
 *
 * Symbol indexes: 0..5 = paying tiers (low to high), 6 = wild, 7 = scatter.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var WILD = 6;
    var SCAT = 7;

    var E = {
        WILD: WILD,
        SCAT: SCAT,
        TIERS: 6,
        BETS: [10, 20, 50, 100, 250],
        START_COINS: 1000,
        REFILL_COINS: 1000,
        MAX_COINS: 1000000,
        rng: function () { return Math.random(); }
    };

    E.setRng = function (fn) { E.rng = fn || function () { return Math.random(); }; };

    /** Weighted pick of an index. weights = array of non-negative numbers. */
    E.pickIndex = function (weights, rng) {
        var total = 0;
        var i;
        for (i = 0; i < weights.length; i++) { total += weights[i]; }
        var r = (rng || E.rng)() * total;
        for (i = 0; i < weights.length; i++) {
            if (r < weights[i]) { return i; }
            r -= weights[i];
        }
        // Float edge: fall back to the last symbol that can appear.
        for (i = weights.length - 1; i >= 0; i--) { if (weights[i] > 0) { return i; } }
        return 0;
    };

    /** grid[col][row] of symbol indexes. */
    E.makeGrid = function (cols, rows, weights, rng) {
        var g = [];
        for (var c = 0; c < cols; c++) {
            var col = [];
            for (var r = 0; r < rows; r++) { col.push(E.pickIndex(weights, rng)); }
            g.push(col);
        }
        return g;
    };

    E.cloneGrid = function (g) {
        var out = [];
        for (var c = 0; c < g.length; c++) { out.push(g[c].slice()); }
        return out;
    };

    /** Whole-coin payout for a number of units. Never negative, never NaN. */
    E.coins = function (units, bet) {
        var v = Math.round(units * bet / 10);
        return (isFinite(v) && v > 0) ? v : 0;
    };

    /**
     * Evaluate one line of symbols left to right.
     * pay[tier][k] = units for k+3 matching symbols (k = 0..2).
     * Wild substitutes for any paying tier. A scatter ends a line.
     * Returns { sym, count, units } or null.
     */
    E.evalLine = function (syms, pay) {
        var n = syms.length;
        var lead = -1;
        var i;
        for (i = 0; i < n; i++) {
            if (syms[i] !== WILD) { lead = syms[i]; break; }
        }
        if (lead === SCAT) { return null; }
        if (lead === -1) { lead = 5; }
        var count = 0;
        for (i = 0; i < n; i++) {
            if (syms[i] === lead || syms[i] === WILD) { count++; } else { break; }
        }
        if (count < 3) { return null; }
        var idx = Math.min(count, 5) - 3;
        var units = pay[lead] ? pay[lead][idx] : 0;
        if (!(units > 0)) { return null; }
        return { sym: lead, count: count, units: units };
    };

    /** Evaluate every payline on a grid. lines[i][col] = row. */
    E.evalLines = function (grid, lines, pay) {
        var wins = [];
        var units = 0;
        for (var i = 0; i < lines.length; i++) {
            var syms = [];
            for (var c = 0; c < grid.length; c++) { syms.push(grid[c][lines[i][c]]); }
            var w = E.evalLine(syms, pay);
            if (w) {
                var cells = [];
                for (var k = 0; k < w.count; k++) { cells.push([k, lines[i][k]]); }
                wins.push({ line: i, sym: w.sym, count: w.count, units: w.units, cells: cells });
                units += w.units;
            }
        }
        return { wins: wins, units: units };
    };

    E.countSym = function (grid, sym) {
        var n = 0;
        for (var c = 0; c < grid.length; c++) {
            for (var r = 0; r < grid[c].length; r++) { if (grid[c][r] === sym) { n++; } }
        }
        return n;
    };

    /** The 10 paylines used by the 5x3 modes. lines[i][col] = row (0 = top). */
    E.LINES_5X3 = [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [2, 2, 2, 2, 2],
        [0, 1, 2, 1, 0],
        [2, 1, 0, 1, 2],
        [0, 0, 1, 2, 2],
        [2, 2, 1, 0, 0],
        [1, 0, 0, 0, 1],
        [1, 2, 2, 2, 1],
        [0, 1, 1, 1, 0]
    ];

    /**
     * Clusters: orthogonally touching cells of one tier, wild joins any tier.
     * Higher tiers are claimed first and a cell pays only once.
     * pay[tier][k] = units for size min+k (k = 0..4, the last is "min+4 or more").
     */
    E.evalClusters = function (grid, pay, min) {
        min = min || 3;
        var cols = grid.length;
        var rows = grid[0].length;
        var used = [];
        var c, r;
        for (c = 0; c < cols; c++) { used.push([]); for (r = 0; r < rows; r++) { used[c].push(false); } }
        var wins = [];
        var units = 0;
        for (var t = 5; t >= 0; t--) {
            var seen = [];
            for (c = 0; c < cols; c++) { seen.push([]); for (r = 0; r < rows; r++) { seen[c].push(false); } }
            for (c = 0; c < cols; c++) {
                for (r = 0; r < rows; r++) {
                    if (seen[c][r] || used[c][r] || grid[c][r] !== t) { continue; }
                    var stack = [[c, r]];
                    var cells = [];
                    var real = 0;
                    seen[c][r] = true;
                    while (stack.length) {
                        var p = stack.pop();
                        cells.push(p);
                        if (grid[p[0]][p[1]] === t) { real++; }
                        var nb = [[p[0] + 1, p[1]], [p[0] - 1, p[1]], [p[0], p[1] + 1], [p[0], p[1] - 1]];
                        for (var q = 0; q < 4; q++) {
                            var nc = nb[q][0];
                            var nr = nb[q][1];
                            if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) { continue; }
                            if (seen[nc][nr] || used[nc][nr]) { continue; }
                            var v = grid[nc][nr];
                            if (v === t || v === WILD) { seen[nc][nr] = true; stack.push([nc, nr]); }
                        }
                    }
                    if (cells.length >= min && real >= 1) {
                        var u = pay[t][Math.min(cells.length, min + 4) - min];
                        if (u > 0) {
                            for (var k = 0; k < cells.length; k++) { used[cells[k][0]][cells[k][1]] = true; }
                            wins.push({ sym: t, count: cells.length, units: u, cells: cells });
                            units += u;
                        }
                    }
                }
            }
        }
        return { wins: wins, units: units };
    };

    /** Remove cells, let the rest fall, fill from the top. Returns the new grid. */
    E.tumble = function (grid, cells, weights, rng) {
        var g = E.cloneGrid(grid);
        var i;
        for (i = 0; i < cells.length; i++) { g[cells[i][0]][cells[i][1]] = -1; }
        for (var c = 0; c < g.length; c++) {
            var kept = [];
            for (var r = 0; r < g[c].length; r++) { if (g[c][r] !== -1) { kept.push(g[c][r]); } }
            var missing = g[c].length - kept.length;
            var fresh = [];
            for (i = 0; i < missing; i++) { fresh.push(E.pickIndex(weights, rng)); }
            g[c] = fresh.concat(kept);
        }
        return g;
    };

    /** Shuffle (Fisher-Yates) a copy of an array. */
    E.shuffle = function (arr, rng) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor((rng || E.rng)() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    S.engine = E;
    S.modes = S.modes || { list: [], byId: {} };
    /** Modes call this once. A mode needs id, name, icon, howTo, rtp, roll, create. */
    S.registerMode = function (m) {
        if (S.modes.byId[m.id]) { return; }
        S.modes.byId[m.id] = m;
        S.modes.list.push(m);
    };
}());
