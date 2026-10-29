/**
 * Mode 1: Classic 3-Reel. Three drums, one middle payline.
 * Three matching symbols pay big, two matching from the left pay a little.
 * Wild fills in for any paying symbol. Target return 94%.
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;

    var CFG = {
        weights: [26, 22, 18, 14, 10, 6, 6, 0],
        pay3: [55, 65, 125, 135, 150, 520],
        pay2: [5, 12, 13, 16, 17, 19]
    };

    /** Middle row, left to right. Returns { sym, count, units } or null. */
    function evalCenter(grid) {
        var s = [grid[0][1], grid[1][1], grid[2][1]];
        var lead = -1;
        var i;
        for (i = 0; i < 3; i++) { if (s[i] !== E.WILD) { lead = s[i]; break; } }
        if (lead === E.SCAT) { return null; }
        if (lead === -1) { lead = 5; }
        var count = 0;
        for (i = 0; i < 3; i++) { if (s[i] === lead || s[i] === E.WILD) { count++; } else { break; } }
        var units = count === 3 ? CFG.pay3[lead] : (count === 2 ? CFG.pay2[lead] : 0);
        return units > 0 ? { sym: lead, count: count, units: units } : null;
    }

    function roll(bet, rng) {
        var grid = E.makeGrid(3, 3, CFG.weights, rng);
        var w = evalCenter(grid);
        var wins = [];
        if (w) {
            var cells = [];
            for (var i = 0; i < w.count; i++) { cells.push([i, 1]); }
            wins.push({ cells: cells, units: w.units, sym: w.sym });
        }
        var units = w ? w.units : 0;
        return { grid: grid, wins: wins, units: units, win: E.coins(units, bet), bonus: null };
    }

    function create(host, api) {
        var rs = new V.ReelSet(host, { cols: 3, centerMark: true });
        rs.setTheme(api.theme());
        rs.setGrid(E.makeGrid(3, 3, CFG.weights));
        return {
            setTheme: function (t) { rs.setTheme(t); },
            resize: function () { rs.resize(V.fitCell(host, 3.6, 2.9, 24, 8, 92)); },
            play: function (bet, done) {
                var res = roll(bet);
                api.credit(res.win, 'spin');
                rs.spin(res.grid, api.calm(), function () {
                    if (res.wins.length) { rs.showWins(res.wins); }
                    api.celebrate(res.win, bet);
                    done();
                });
            },
            skip: function () { rs.skip(); },
            destroy: function () { rs.destroy(); }
        };
    }

    function paytable(bet) {
        var rows = [];
        for (var t = 5; t >= 0; t--) {
            rows.push({ sym: t, label: '3 in a row | first 2', vals: [E.coins(CFG.pay3[t], bet), E.coins(CFG.pay2[t], bet)] });
        }
        return rows;
    }

    S.registerMode({
        id: 'classic',
        name: 'Classic 3-Reel',
        short: 'Classic',
        icon: '🎰',
        cta: 'SPIN',
        lever: true,
        howTo: 'Spin the 3 reels. Match symbols on the middle line to win coins.',
        rtp: 0.94,
        cfg: CFG,
        roll: roll,
        evalCenter: evalCenter,
        paytable: paytable,
        create: create
    });
}());
