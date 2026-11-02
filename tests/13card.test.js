// Unit tests for games/cards/poker/13card/ffa.js. Run: node tests/13card.test.js
var assert = require('assert'), path = require('path');
var F = require(path.join(__dirname, '../games/cards/poker/13card/ffa.js'));

function C(s) { // "AS" "10H" "KD"
    var suit = s.slice(-1), r = s.slice(0, -1), map = { J: 11, Q: 12, K: 13, A: 14 };
    return { id: s, rank: map[r] || +r, suit: suit };
}
function H() { var a = []; for (var i = 0; i < arguments.length; i++) { a.push(C(arguments[i])); } return a; }
function sc(cards) { return F.evalRow(cards).score; }

// ---- row ranking
assert(sc(H('AS', 'AH', '2D')) > sc(H('KS', 'QH', 'JD')), 'front pair > high card');
assert(sc(H('2S', '2H', '2D')) > sc(H('AS', 'AH', 'KD')), 'front trips > pair');
assert.strictEqual(F.evalRow(H('9S', '8S', '7S')).name, 'High Card', 'no straight in front');
assert.strictEqual(F.evalRow(H('9S', '8S', '7S')).cat, 0);
assert.strictEqual(F.evalRow(H('AS', 'KS', 'QS', 'JS', '10S')).name, 'Royal Flush');
assert.strictEqual(F.evalRow(H('AS', '2S', '3S', '4S', '5H')).name, 'Straight', 'wheel');
assert(sc(H('6S', '5H', '4D', '3C', '2S')) > sc(H('AS', '2S', '3S', '4S', '5H')), '6-high beats wheel');
var order = [
    H('AS', 'KH', '9D', '7C', '3S'), H('2S', '2H', '9D', '7C', '3S'), H('2S', '2H', '3D', '3C', '9S'),
    H('2S', '2H', '2D', '7C', '3S'), H('5S', '4H', '3D', '2C', '6S'), H('2S', '9S', '4S', '7S', '3S'),
    H('2S', '2H', '2D', '7C', '7S'), H('2S', '2H', '2D', '2C', '7S'), H('5S', '4S', '3S', '2S', '6S')
];
for (var i = 1; i < order.length; i++) { assert(sc(order[i]) > sc(order[i - 1]), 'category order ' + i); }
assert(sc(H('2S', '2H', '9D', '7C', '3S')) < sc(H('3S', '3H', '4D', '5C', '7S')), 'pair of 3s beats pair of 2s');
assert(sc(H('KS', 'KH', 'AD', '7C', '3S')) > sc(H('KD', 'KC', 'QD', 'JC', '3D')), 'pair kicker');
assert.strictEqual(F.evalRow(H('AS')).score, -1);

// ---- foul detection
function rows(f, m, b) { return { front: H.apply(null, f), mid: H.apply(null, m), back: H.apply(null, b) }; }
var good = rows(['2S', '2H', '3D'], ['4S', '4H', '9D', '9C', '5S'], ['AS', 'AH', 'AD', 'KC', 'KS']);
assert.strictEqual(F.isFoul(good), false);
assert.strictEqual(F.isFoul(rows(['AS', 'AH', 'KD'], ['2S', '4H', '9D', '9C', '5S'], ['3S', '3H', '7D', 'KC', 'QS'])), true, 'mid weaker than front');
assert.strictEqual(F.isFoul(rows(['2S', '2H', '3D'], ['AS', 'AH', 'AD', 'KC', 'KS'], ['4S', '4H', '9D', '9C', '5S'])), true, 'back weaker than mid');
assert.strictEqual(F.isFoul(rows(['KS', 'KH', 'AD'], ['KD', 'KC', 'QD', 'JC', '3D'], ['AS', 'AH', 'AD', 'QC', 'QS'])), true, 'front pair kicker beats mid');
assert.strictEqual(F.isFoul(rows(['2S', '2H', '3D'], ['2D', '2C', '3H', '4C', '5D'], ['AS', 'AH', 'AD', 'KC', 'KS'])), false, 'equal-prefix mid is fine');
assert.strictEqual(F.isFoul({ front: H('2S', '2H'), mid: good.mid, back: good.back }), true, 'bad shape');
assert.strictEqual(F.isFoul(rows(['2S', '2H', '3D'], ['2S', '4H', '9D', '9C', '5S'], ['AS', 'AH', 'AD', 'KC', 'KS'])), true, 'duplicate card');

// ---- pairwise scoring
var strong = rows(['KS', 'KH', '2D'], ['9S', '9H', '9D', '4C', '4S'], ['AS', 'AH', 'AD', 'AC', 'KC']);
var weak = rows(['2C', '3H', '5D'], ['3S', '4H', '6D', '8C', '9C'], ['7S', '7H', '10D', 'JC', 'QS']);
assert.strictEqual(F.isFoul(strong), false); assert.strictEqual(F.isFoul(weak), false);
var p = F.scorePair(strong, weak);
assert.deepEqual(p.rows, [1, 1, 1]); assert.strictEqual(p.scoop, 1); assert.strictEqual(p.total, 6);
assert.strictEqual(F.scorePair(weak, strong).total, -6);
var mixed = rows(['AS', 'AH', '2D'], ['3S', '3H', '4D', '4C', '5S'], ['6S', '6H', '6D', '8C', '8S']);
// vs strong: front A pair > K pair (win), mid 2 pair < trips full house? strong mid is full house (lose), back lose
var pm = F.scorePair(mixed, strong);
assert.deepEqual(pm.rows, [1, -1, -1]); assert.strictEqual(pm.scoop, 0); assert.strictEqual(pm.total, -1);
// ties
var t1 = rows(['2S', '2H', '3D'], ['4S', '4H', '9D', '9C', '5S'], ['AS', 'AH', 'AD', 'KC', 'KS']);
var t2 = rows(['2D', '2C', '3H'], ['4D', '4C', '9H', '9S', '5H'], ['AC', 'AD', 'AH', 'KD', 'KH']);
var pt = F.scorePair(t1, t2); assert.deepEqual(pt.rows, [0, 0, 0]); assert.strictEqual(pt.total, 0);
// two wins one tie, no scoop
var t3 = rows(['2D', '2C', '4H'], ['4D', '4C', '9H', '9S', '5H'], ['AC', 'AD', 'AH', 'KD', 'KH']);
var p3 = F.scorePair(t3, t1); assert.deepEqual(p3.rows, [1, 0, 0]); assert.strictEqual(p3.total, 1);

// ---- foul payment, double foul, pair counts
var foulRows = rows(['AS', 'AH', 'KD'], ['2S', '4H', '9D', '9C', '5S'], ['3S', '3H', '7D', 'KC', 'QS']);
var foulRows2 = rows(['AC', 'AD', 'KH'], ['2C', '4D', '9H', '8C', '5C'], ['3C', '3D', '7H', 'KS', 'QC']);
assert.strictEqual(F.isFoul(foulRows2), true);
var r1 = F.scoreRound([{ id: 'a', rows: foulRows }, { id: 'b', rows: strong }, { id: 'c', rows: weak }], 2);
assert.strictEqual(r1.pairs.length, 3);
assert.strictEqual(r1.points.a, -12); assert.strictEqual(r1.points.b, 6 + 6); assert.strictEqual(r1.points.c, 0);
assert.strictEqual(r1.points.a + r1.points.b + r1.points.c, 0);
assert.strictEqual(r1.coins.a, -24);
assert.strictEqual(r1.fouls.a, true); assert.strictEqual(r1.fouls.b, false);
// foul pays 6 to each non-fouled, collects nothing
var r2 = F.scoreRound([{ id: 'a', rows: foulRows }, { id: 'b', rows: weak }], 1);
assert.strictEqual(r2.points.a, -6); assert.strictEqual(r2.points.b, 6);
// double foul pair is 0, each still pays the clean player
var r3 = F.scoreRound([{ id: 'a', rows: foulRows }, { id: 'b', rows: foulRows2 }], 1);
assert.strictEqual(r3.points.a, 0); assert.strictEqual(r3.points.b, 0); assert.strictEqual(r3.owes.length, 0);
var r4 = F.scoreRound([{ id: 'a', rows: foulRows }, { id: 'b', rows: foulRows2 }, { id: 'c', rows: strong }], 1);
assert.strictEqual(r4.points.a, -6); assert.strictEqual(r4.points.b, -6); assert.strictEqual(r4.points.c, 12);
// null rows count as a foul
var r5 = F.scoreRound([{ id: 'a', rows: null }, { id: 'b', rows: strong }], 1);
assert.strictEqual(r5.points.b, 6);
// pair counts
function randPlayers(n, rng) {
    var d = F.shuffle(F.makeDeck(), rng), ps = [];
    for (var k = 0; k < n; k++) {
        var cards = d.slice(k * 13, k * 13 + 13);
        ps.push({ id: 'p' + k, rows: F.rowsFromIdx(cards, F.arrange(cards, 'balanced')) });
    }
    return ps;
}
for (var n = 2; n <= 4; n++) {
    var rr = F.scoreRound(randPlayers(n, Math.random), 1);
    assert.strictEqual(rr.pairs.length, n * (n - 1) / 2, n + ' players pair count');
}
assert.strictEqual(F.scoreRound(randPlayers(4, Math.random), 1).pairs.length, 6);

// ---- settlement
var ex = F.scoreRound([{ id: 'A', rows: strong }, { id: 'B', rows: strong }], 1); // shape only
function fromOwes(owes, ids) {
    var net = {}; ids.forEach(function (x) { net[x] = 0; });
    owes.forEach(function (o) { net[o.from] -= o.points; net[o.to] += o.points; });
    return net;
}
var wayne = [{ from: 'A', to: 'B', points: 2 }, { from: 'A', to: 'C', points: 2 }, { from: 'D', to: 'A', points: 2 }];
var nets = fromOwes(wayne, ['A', 'B', 'C', 'D']);
assert.deepEqual(nets, { A: -2, B: 2, C: 2, D: -2 });
var st = F.settle(nets, ['A', 'B', 'C', 'D']);
function key(s) { return s.from + '>' + s.to + ':' + s.coins; }
assert.deepEqual(st.map(key).sort(), ['A>B:1', 'A>C:1', 'D>B:1', 'D>C:1']);
function applySettle(s, ids) {
    var net = {}; ids.forEach(function (x) { net[x] = 0; });
    s.forEach(function (t) { assert(t.coins > 0 && t.from !== t.to); net[t.from] -= t.coins; net[t.to] += t.coins; });
    return net;
}
assert.deepEqual(applySettle(st, ['A', 'B', 'C', 'D']), nets);
// non-proportional falls back to few transfers
var odd = { A: -3, B: 2, C: 1 };
var so = F.settle(odd, ['A', 'B', 'C']); assert.deepEqual(applySettle(so, ['A', 'B', 'C']), odd); assert.strictEqual(so.length, 2);
var odd2 = { A: -3, B: 3, C: -1, D: 1 };
var so2 = F.settle(odd2, ['A', 'B', 'C', 'D']); assert.deepEqual(applySettle(so2, ['A', 'B', 'C', 'D']), odd2); assert.strictEqual(so2.length, 2, 'exact matches first');
var odd3 = { A: -5, B: -1, C: 4, D: 2 };
var so3 = F.settle(odd3, ['A', 'B', 'C', 'D']); assert.deepEqual(applySettle(so3, ['A', 'B', 'C', 'D']), odd3); assert(so3.length <= 3);
assert.deepEqual(F.settle({ A: 0, B: 0 }, ['A', 'B']), []);
// random games conserve and settlement reproduces nets
var ids;
for (var g = 0; g < 400; g++) {
    var np = 2 + (g % 3), ante = [1, 2, 5][g % 3];
    var round = F.scoreRound(randPlayers(np, Math.random), ante);
    ids = Object.keys(round.coins);
    var sum = 0; ids.forEach(function (x) { sum += round.coins[x]; });
    assert.strictEqual(sum, 0, 'nets conserve');
    var s2 = F.settle(round.coins, ids);
    assert.deepEqual(applySettle(s2, ids), round.coins, 'settlement matches nets');
    assert(s2.length <= np * np);
    var fromOw = fromOwes(round.owes, ids); ids.forEach(function (x) { assert.strictEqual(fromOw[x] * ante, round.coins[x]); });
}
// random net vectors incl. odd ones
for (g = 0; g < 500; g++) {
    var ids2 = ['a', 'b', 'c', 'd'].slice(0, 2 + g % 3), nn = {}, tot = 0;
    for (var q = 0; q < ids2.length - 1; q++) { nn[ids2[q]] = Math.floor(Math.random() * 41) - 20; tot += nn[ids2[q]]; }
    nn[ids2[ids2.length - 1]] = -tot;
    assert.deepEqual(applySettle(F.settle(nn, ids2), ids2), nn);
}

// ---- bankroll save and load
var store = {}, fake = {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); }
};
var s0 = F.loadState(fake); assert.strictEqual(s0.bank.you, 100); assert.strictEqual(s0.ante, 1); assert.strictEqual(s0.npcs, 3);
s0.bank.you = -37; s0.ante = 5; s0.npcs = 2; s0.skip = true; s0.rounds = 4;
assert(F.saveState(fake, s0)); assert.strictEqual(F.STORE_KEY, 'fong.13card.save');
var s1 = F.loadState(fake); assert.strictEqual(s1.bank.you, -37); assert.strictEqual(s1.ante, 5); assert.strictEqual(s1.npcs, 2); assert.strictEqual(s1.skip, true);
store['fong.13card.save'] = '{bad'; assert.strictEqual(F.loadState(fake).bank.you, 100);
store['fong.13card.save'] = '[1,2]'; assert.strictEqual(F.loadState(fake).bank.you, 100);
store['fong.13card.save'] = 'null'; assert.strictEqual(F.loadState(fake).ante, 1);
store['fong.13card.save'] = JSON.stringify({ v: 2, bank: { you: 5 } }); assert.strictEqual(F.loadState(fake).bank.you, 100, 'unknown version');
store['fong.13card.save'] = JSON.stringify({ v: 1, ante: 10, npcs: 9, skip: 'yes', bank: { you: 'lots', n1: 1e30, n2: -1e30, n3: null, evil: 1 } });
var s2b = F.loadState(fake);
assert.strictEqual(s2b.ante, 1, 'ante 10 rejected'); assert.strictEqual(s2b.npcs, 3, 'npcs capped'); assert.strictEqual(s2b.skip, false);
assert.strictEqual(s2b.bank.you, 100); assert.strictEqual(s2b.bank.n1, 1000000000); assert.strictEqual(s2b.bank.n2, -1000000000); assert.strictEqual(s2b.bank.n3, 100);
assert(!Object.prototype.hasOwnProperty.call(s2b.bank, 'evil'));
store['fong.13card.save'] = '{"v":1,"bank":{"__proto__":{"you":7},"you":3.6}}';
var s3b = F.loadState(fake); assert.strictEqual(s3b.bank.you, 4); assert.strictEqual(({}).you, undefined);
store['fong.13card.save'] = new Array(30000).join('x'); assert.strictEqual(F.loadState(fake).bank.you, 100);
assert.strictEqual(F.loadState({ getItem: function () { throw new Error('blocked'); } }).bank.you, 100);
assert.strictEqual(F.saveState({ setItem: function () { throw new Error('full'); } }, s0), false);
var rs = F.resetBanks(s0); assert.strictEqual(rs.bank.you, 100); assert.strictEqual(rs.rounds, 0);
var neg = F.defaultState(); neg.bank.you = -5000; F.saveState(fake, neg); assert.strictEqual(F.loadState(fake).bank.you, -5000, 'can go below zero');

// ---- NPC arrangements: always legal, fast
var pers = ['cautious', 'greedy', 'balanced'], worst = 0, total = 0;
for (var d = 0; d < 2000; d++) {
    var deck = F.shuffle(F.makeDeck()), cards = deck.slice(0, 13), pr = pers[d % 3];
    var t0 = Date.now();
    var idx = F.arrange(cards, pr);
    var dt = Date.now() - t0; total += dt; if (dt > worst) { worst = dt; }
    var rw = F.rowsFromIdx(cards, idx);
    assert(F.validShape(rw), 'uses all 13 cards once');
    assert.strictEqual(F.isFoul(rw), false, 'npc never fouls (' + pr + ')');
}
assert(worst < 100, 'slowest NPC decision ' + worst + 'ms');
// personalities differ on a known hand: greedy back >= cautious back
var hand = H('AS', 'AH', 'AD', 'KS', 'KH', '9D', '9C', '9S', '5H', '4C', '3D', '2S', '7H');
var gr = F.rowsFromIdx(hand, F.arrange(hand, 'greedy')), ca = F.rowsFromIdx(hand, F.arrange(hand, 'cautious'));
assert(F.evalRow(gr.back).score >= F.evalRow(ca.back).score);
assert(F.evalRow(ca.front).score >= F.evalRow(gr.front).score);
// personalities differ on fixed deals (seeded) and behave as described
var seed = 12345;
function rng() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
var diff = { 'cautious-greedy': 0, 'cautious-balanced': 0, 'greedy-balanced': 0 }, gapOk = true, backOk = true;
function catGap(r) { return F.evalRow(r.back).cat - F.evalRow(r.front).cat; }
for (var fd = 0; fd < 60; fd++) {
    var fc = F.shuffle(F.makeDeck(), rng).slice(0, 13);
    var ra = {}, key2 = {};
    pers.forEach(function (pp) { ra[pp] = F.rowsFromIdx(fc, F.arrange(fc, pp)); key2[pp] = JSON.stringify(ra[pp], function (k, v) { return k === 'id' ? v : (k === 'rank' || k === 'suit' ? undefined : v); }); });
    if (key2.cautious !== key2.greedy) { diff['cautious-greedy']++; }
    if (key2.cautious !== key2.balanced) { diff['cautious-balanced']++; }
    if (key2.greedy !== key2.balanced) { diff['greedy-balanced']++; }
    if (catGap(ra.cautious) > catGap(ra.greedy) || catGap(ra.cautious) > catGap(ra.balanced)) { gapOk = false; }
    if (F.evalRow(ra.greedy.back).score < F.evalRow(ra.cautious.back).score || F.evalRow(ra.greedy.back).score < F.evalRow(ra.balanced.back).score) { backOk = false; }
}
assert(diff['cautious-greedy'] > 5 && diff['cautious-balanced'] > 5 && diff['greedy-balanced'] > 5, JSON.stringify(diff));
assert(gapOk, 'cautious has the smallest category gap');
assert(backOk, 'greedy has the strongest back');
// plain layout has right shape
assert(F.validShape(F.plainRows(hand)));
assert.strictEqual(F.NPCS.length, 3);
console.log('13card tests passed (avg NPC ' + (total / 2000).toFixed(1) + 'ms, worst ' + worst + 'ms)');
