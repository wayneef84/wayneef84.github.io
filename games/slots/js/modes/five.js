/**
 * Mode 2: 5-Reel, 3 rows, 10 paylines.
 * Matches pay from the left reel, 3 or more in a row. Wild fills in.
 * 3 or more scatters anywhere start a free Pick-a-Prize bonus.
 * The bet is spread over the 10 lines. Target return 95% (about 78% lines, 17% bonus).
 */
(function () {
    var S = window.Slots = window.Slots || {};
    var E = S.engine;
    var V = S.view;

    var CFG = {
        weights: [26, 22, 18, 14, 10, 6, 5, 3],
        pay: [[6, 8, 16], [11, 12, 25], [14, 17, 26], [18, 20, 27], [24, 25, 31], [29, 35, 113]]
    };

    function roll(bet, rng) {
        var grid = E.makeGrid(5, 3, CFG.weights, rng);
        var r = E.evalLines(grid, E.LINES_5X3, CFG.pay);
        return {
            grid: grid,
            wins: r.wins,
            units: r.units,
            win: E.coins(r.units, bet),
            bonus: E.countSym(grid, E.SCAT) >= 3 ? 'pick' : null
        };
    }

    function create(host, api) {
        var rs = new V.ReelSet(host, { cols: 5 });
        rs.setTheme(api.theme());
        rs.setGrid(E.makeGrid(5, 3, CFG.weights));
        return {
            setTheme: function (t) { rs.setTheme(t); },
            resize: function () { rs.resize(V.fitCell(host, 5.4, 2.9, 20, 8, 80)); },
            play: function (bet, done) {
                var res = roll(bet);
                api.credit(res.win, 'spin');
                rs.spin(res.grid, api.calm(), function () {
                    if (res.wins.length) { rs.showWins(res.wins, E.LINES_5X3); }
                    api.celebrate(res.win, bet);
                    if (res.bonus) { api.bonus('pick', bet, done); } else { done(); }
                });
            },
            skip: function () { rs.skip(); },
            destroy: function () { rs.destroy(); }
        };
    }

    function paytable(bet) {
        var rows = [];
        for (var t = 5; t >= 0; t--) {
            var v = [];
            for (var k = 0; k < 3; k++) { v.push(E.coins(CFG.pay[t][k], bet)); }
            rows.push({ sym: t, label: '3 | 4 | 5 in a row (per line)', vals: v });
        }
        rows.push({ sym: 7, label: '3 or more anywhere: free Pick-a-Prize', vals: [] });
        return rows;
    }

    S.registerMode({
        id: 'five',
        name: '5-Reel Lines',
        short: '5-Reel',
        icon: '🎡',
        cta: 'SPIN',
        lever: true,
        howTo: 'Match 3 or more from the left on any of 10 lines. 3 scatters open a free bonus.',
        rtp: 0.95,
        cfg: CFG,
        roll: roll,
        paytable: paytable,
        create: create
    });
}());
