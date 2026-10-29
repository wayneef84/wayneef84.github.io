/**
 * Mode 4: Match-3 Reels. 5x4 grid, no paylines.
 * Groups of 4 or more matching symbols that touch (up, down, left, right) win.
 * Wild joins any group. Bigger groups pay more. Target return 95%.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;
    var MIN = 4;

    var CFG = {
        weights: [26, 22, 18, 14, 10, 6, 5, 0],
        pay: [[4, 6, 9, 10, 16], [8, 12, 13, 14, 17], [12, 16, 17, 19, 25], [18, 19, 23, 26, 32], [19, 23, 26, 35, 54], [20, 24, 29, 60, 126]]
    };

    function roll(bet, rng) {
        var grid = E.makeGrid(5, 4, CFG.weights, rng);
        var r = E.evalClusters(grid, CFG.pay, MIN);
        return { grid: grid, wins: r.wins, units: r.units, win: E.coins(r.units, bet), bonus: null };
    }

    function create(host, api) {
        var board = new V.Board(host, { cols: 5, rows: 4 });
        var timers = [];
        var running = false;
        var finishFn = null;
        board.setTheme(api.theme());
        board.setGrid(E.makeGrid(5, 4, CFG.weights), false);
        function later(fn, ms) { timers.push(setTimeout(fn, api.calm() ? Math.min(ms, 120) : ms)); }
        function clearTimers() { for (var i = 0; i < timers.length; i++) { clearTimeout(timers[i]); } timers = []; }
        return {
            setTheme: function (t) { board.setTheme(t); },
            resize: function () { board.resize(V.fitCell(host, 5.3, 4.3, 16, 8, 78)); },
            play: function (bet, done) {
                var res = roll(bet);
                api.credit(res.win, 'spin');
                running = true;
                board.setGrid(res.grid, !api.calm());
                var finish = function () {
                    if (!running) { return; }
                    running = false;
                    finishFn = null;
                    clearTimers();
                    board.setGrid(res.grid, false);
                    var cells = [];
                    for (var i = 0; i < res.wins.length; i++) {
                        for (var k = 0; k < res.wins[i].cells.length; k++) { cells.push(res.wins[i].cells[k]); }
                    }
                    if (cells.length) { board.mark(cells, 'win'); }
                    api.celebrate(res.win, bet);
                    done();
                };
                finishFn = finish;
                later(finish, 1000);
            },
            skip: function () { if (finishFn) { finishFn(); } },
            destroy: function () { running = false; clearTimers(); board.destroy(); }
        };
    }

    function paytable(bet) {
        var rows = [];
        for (var t = 5; t >= 0; t--) {
            var v = [];
            for (var k = 0; k < 5; k++) { v.push(E.coins(CFG.pay[t][k], bet)); }
            rows.push({ sym: t, label: 'group of 4 | 5 | 6 | 7 | 8 or more', vals: v });
        }
        return rows;
    }

    S.registerMode({
        id: 'match3',
        name: 'Match Groups',
        short: 'Match',
        icon: '🧩',
        cta: 'SHUFFLE',
        lever: false,
        howTo: 'Find groups of 4 or more matching symbols that touch. Bigger groups pay more.',
        rtp: 0.95,
        cfg: CFG,
        roll: roll,
        minGroup: MIN,
        paytable: paytable,
        create: create
    });
}());
