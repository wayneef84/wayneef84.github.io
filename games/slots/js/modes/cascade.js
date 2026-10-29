/**
 * Mode 3: Cascade. 5x3 grid, same 10 lines as 5-Reel.
 * Winning symbols vanish, the rest fall and new ones drop in. If that makes a
 * new win, it pays x2, then x3 and so on (up to 8 steps). 3 scatters on the
 * first drop start a free Prize Wheel bonus. Target return 95%.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;
    var MAX_STEPS = 8;

    var CFG = {
        weights: [26, 22, 18, 14, 10, 6, 5, 3],
        pay: [[3, 4, 9], [8, 10, 11], [10, 11, 15], [11, 12, 16], [13, 14, 17], [14, 15, 39]]
    };

    function uniqueCells(wins) {
        var seen = {};
        var out = [];
        for (var i = 0; i < wins.length; i++) {
            for (var k = 0; k < wins[i].cells.length; k++) {
                var c = wins[i].cells[k];
                var key = c[0] + ',' + c[1];
                if (!seen[key]) { seen[key] = true; out.push(c); }
            }
        }
        return out;
    }

    function roll(bet, rng) {
        var first = E.makeGrid(5, 3, CFG.weights, rng);
        var g = first;
        var steps = [];
        var mult = 1;
        var total = 0;
        for (var s = 0; s < MAX_STEPS; s++) {
            var r = E.evalLines(g, E.LINES_5X3, CFG.pay);
            if (!r.units) { break; }
            var cells = uniqueCells(r.wins);
            var next = E.tumble(g, cells, CFG.weights, rng);
            var units = r.units * mult;
            steps.push({ grid: g, wins: r.wins, cells: cells, mult: mult, units: units, next: next });
            total += units;
            mult++;
            g = next;
        }
        return {
            grid: first,
            steps: steps,
            finalGrid: g,
            units: total,
            win: E.coins(total, bet),
            bonus: E.countSym(first, E.SCAT) >= 3 ? 'wheel' : null
        };
    }

    function create(host, api) {
        var board = new V.Board(host, { cols: 5, rows: 3 });
        var theme = null;
        var timers = [];
        var running = false;
        var finishFn = null;
        board.setTheme(api.theme());
        board.setGrid(E.makeGrid(5, 3, CFG.weights), false);

        function later(fn, ms) { timers.push(setTimeout(fn, api.calm() ? Math.min(ms, 120) : ms)); }
        function clearTimers() { for (var i = 0; i < timers.length; i++) { clearTimeout(timers[i]); } timers = []; }

        function dropList(cells) {
            // Everything at or above the lowest removed cell in a column moves or is new.
            var low = {};
            var out = [];
            var i, c, r;
            for (i = 0; i < cells.length; i++) {
                if (low[cells[i][0]] === undefined || cells[i][1] > low[cells[i][0]]) { low[cells[i][0]] = cells[i][1]; }
            }
            for (c in low) {
                if (Object.prototype.hasOwnProperty.call(low, c)) {
                    for (r = 0; r <= low[c]; r++) { out.push([Number(c), r]); }
                }
            }
            return out;
        }

        return {
            setTheme: function (t) { theme = t; board.setTheme(t); },
            resize: function () { board.resize(V.fitCell(host, 5.3, 3.4, 16, 8, 78)); },
            play: function (bet, done) {
                var res = roll(bet);
                api.credit(res.win, 'spin');
                running = true;
                board.setBadge('');
                board.setGrid(res.grid, !api.calm());
                var i = 0;
                var finish = function () {
                    if (!running) { return; }
                    running = false;
                    finishFn = null;
                    clearTimers();
                    board.clearMarks();
                    board.setGrid(res.finalGrid, false);
                    board.setBadge('');
                    api.celebrate(res.win, bet);
                    if (res.bonus) { api.bonus('wheel', bet, done); } else { done(); }
                };
                finishFn = finish;
                var step = function () {
                    if (!running) { return; }
                    if (i >= res.steps.length) { later(finish, 500); return; }
                    var st = res.steps[i];
                    board.setGrid(st.grid, false);
                    board.mark(st.cells, 'win');
                    if (st.mult > 1) { board.setBadge('x' + st.mult); }
                    S.sfx.play(st.mult > 1 ? 'win' : 'pop');
                    later(function () {
                        board.vanish(st.cells);
                        S.sfx.play('pop');
                        later(function () {
                            board.setGrid(st.next, dropList(st.cells));
                            i++;
                            later(step, 700);
                        }, 380);
                    }, 800);
                };
                later(step, 800);
            },
            skip: function () { if (finishFn) { finishFn(); } },
            destroy: function () { running = false; clearTimers(); board.destroy(); }
        };
    }

    function paytable(bet) {
        var rows = [];
        for (var t = 5; t >= 0; t--) {
            var v = [];
            for (var k = 0; k < 3; k++) { v.push(E.coins(CFG.pay[t][k], bet)); }
            rows.push({ sym: t, label: '3 | 4 | 5 in a row (per line)', vals: v });
        }
        rows.push({ sym: 7, label: '3 or more on the first drop: free Prize Wheel', vals: [] });
        return rows;
    }

    S.registerMode({
        id: 'cascade',
        name: 'Cascade',
        short: 'Cascade',
        icon: '🌊',
        cta: 'DROP',
        lever: false,
        howTo: 'Winning symbols pop and new ones fall in. Each chain pays more: x2, x3 and up.',
        rtp: 0.95,
        cfg: CFG,
        roll: roll,
        paytable: paytable,
        create: create
    });
}());
