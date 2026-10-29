/**
 * Headless pay-logic simulation for Slots. No browser needed.
 *   node games/slots/tests/sim.js [spinsPerMode]        (default 1000000)
 *
 * For every mode it plays many rounds with a seeded random generator and reports:
 *   - return to player (RTP) against the stated target
 *   - hit rate and biggest win
 *   - checks: every win is a whole number, a counted win never pays 0, nothing is negative,
 *     a bankroll that follows the real rules (bet, credit, free refill) never goes below 0.
 * Exit code 1 if a check fails or an RTP is more than 3 points from its target.
 * ES5 on purpose, same as the game.
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var root = path.join(__dirname, '..', 'js');
var sandbox = {};
sandbox.window = sandbox;
vm.createContext(sandbox);
['engine.js', 'themes.js', 'modes/classic.js', 'modes/five.js', 'modes/cascade.js', 'modes/match3.js', 'modes/pick.js', 'modes/wheel.js'].forEach(function (f) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
});
var S = sandbox.Slots;
var E = S.engine;

function mulberry32(a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

var N = parseInt(process.argv[2], 10) || 1000000;
var failures = [];
function check(ok, msg) { if (!ok) { failures.push(msg); } }

function totalWin(mode, res, bet, rng) {
    var win = res.win;
    if (res.bonus === 'pick') { win += S.bonusLogic.pickRandom(bet, true, rng); }
    if (res.bonus === 'wheel') { win += S.bonusLogic.wheelRandom(bet, true, rng); }
    return win;
}

console.log('Slots sim, ' + N + ' rounds per mode, seeded\n');
console.log('mode      target  measured  diff    hit%   big win (x bet)  bonus%');
var bets = E.BETS;
S.modes.list.forEach(function (mode) {
    var rng = mulberry32(12345 + mode.id.length);
    E.setRng(rng);
    var staked = 0;
    var paid = 0;
    var hits = 0;
    var best = 0;
    var bonuses = 0;
    var bank = E.START_COINS;
    var minBank = bank;
    var refills = 0;
    for (var i = 0; i < N; i++) {
        var bet = bets[i % bets.length];
        var res = mode.roll(bet, rng);
        var win = totalWin(mode, res, bet, rng);
        check(win === Math.floor(win) && win >= 0 && isFinite(win), mode.id + ': bad payout ' + win);
        var counted = (res.wins && res.wins.length) || (res.steps && res.steps.length) || (!res.wins && !res.steps && win > 0);
        if (res.bonus) { bonuses++; }
        if (res.wins || res.steps) {
            if (counted && !res.bonus) { check(res.win > 0, mode.id + ': counted win paid 0 (bet ' + bet + ')'); }
            if (!counted && !res.bonus) { check(res.win === 0, mode.id + ': paid without a win'); }
        }
        staked += bet;
        paid += win;
        if (win > 0) { hits++; }
        if (win / bet > best) { best = win / bet; }
        // Bankroll rules as the game applies them.
        if (bank < bet) {
            if (bank < bets[0]) { bank += E.REFILL_COINS; refills++; }
            while (bank < bet && bet > bets[0]) { bet = bets[bets.indexOf(bet) - 1]; }
        }
        bank -= bet;
        check(bank >= 0, mode.id + ': negative balance');
        bank += win;
        if (bank < minBank) { minBank = bank; }
    }
    var rtp = paid / staked;
    var diff = (rtp - mode.rtp) * 100;
    var okRtp = Math.abs(diff) <= 3;
    check(okRtp, mode.id + ': RTP ' + (rtp * 100).toFixed(2) + '% is more than 3 points from target ' + (mode.rtp * 100));
    function pad(s, n) { s = String(s); while (s.length < n) { s += ' '; } return s; }
    console.log(pad(mode.id, 9) + ' ' + pad((mode.rtp * 100).toFixed(1) + '%', 7) + ' ' + pad((rtp * 100).toFixed(2) + '%', 9) +
        pad((diff >= 0 ? '+' : '') + diff.toFixed(2), 7) + ' ' + pad((hits / N * 100).toFixed(1), 6) + ' ' + pad(best.toFixed(1), 16) +
        (bonuses ? (bonuses / N * 100).toFixed(2) : '-'));
});

// Exact checks for the two bonus screens (every box and slice, no randomness).
(function () {
    var bet = 10;
    var picks = S.bonusLogic.pickBoxes(bet, false);
    var sum = 0;
    picks.forEach(function (v) { sum += v; check(v > 0, 'pick: zero prize'); });
    var exact = 3 * sum / picks.length / bet;
    console.log('\npick exact RTP  ' + (exact * 100).toFixed(2) + '% (bet 10)');
    check(Math.abs(exact - 0.95) < 0.0001, 'pick exact RTP is ' + exact);
    var sl = S.bonusLogic.wheelSlices(bet, false);
    var ws = 0;
    sl.forEach(function (v) { ws += v; check(v > 0, 'wheel: zero slice'); });
    var wexact = ws / sl.length / bet;
    console.log('wheel exact RTP ' + (wexact * 100).toFixed(2) + '% (bet 10)');
    check(Math.abs(wexact - 0.95) < 0.0001, 'wheel exact RTP is ' + wexact);
    bets.forEach(function (b) {
        S.bonusLogic.pickBoxes(b, false).concat(S.bonusLogic.wheelSlices(b, false), S.bonusLogic.pickBoxes(b, true), S.bonusLogic.wheelSlices(b, true)).forEach(function (v) {
            check(v === Math.floor(v) && v > 0, 'bonus value not a whole positive number at bet ' + b + ': ' + v);
        });
    });
}());

console.log('');
if (failures.length) {
    var seen = {};
    failures.forEach(function (f) { if (!seen[f]) { seen[f] = true; console.log('FAIL ' + f); } });
    process.exit(1);
}
console.log('All checks passed.');
