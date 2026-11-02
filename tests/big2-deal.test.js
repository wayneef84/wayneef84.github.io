// Unit tests for the Big 2 deal rules (games/cards/big2/big2.js, ruleset.js). Run: node tests/big2-deal.test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var dir = path.join(__dirname, '../games/cards/big2/');
var ctx = vm.createContext({ Math: Math, setTimeout: function () {}, console: console });
vm.runInContext(fs.readFileSync(dir + 'ruleset.js', 'utf8') + '\n' + fs.readFileSync(dir + 'big2.js', 'utf8') +
    '\nthis.Deal=Big2Deal;this.Opts=Big2Options;this.RS=Big2Rulesets;this.Game=Big2Game;this.Eval=Big2Evaluator;', ctx);
var Deal = ctx.Deal, Opts = ctx.Opts, RS = ctx.RS, Game = ctx.Game;

// seeded rng (mulberry32)
function seeded(n) { var a = n >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function key(c) { return c.rank + '-' + c.suit; }
function same(a, b) { return a && b && a.rank === b.rank && a.suit === b.suit; }
function has(hand, c) { for (var i = 0; i < hand.length; i++) { if (same(hand[i], c)) { return true; } } return false; }

var ids = ['hongkong', 'taiwanese', 'singapore', 'pokerhands'];
var counts = { faceUpStart: 0, nobody: 0, pile: 0, normal: 0 };

// Old 4 player deal, copied from before this change, to prove 4 player hands do not change.
function oldDeal(rs, rng) {
    var cards = [], suits = ['DIAMONDS', 'CLUBS', 'HEARTS', 'SPADES'];
    var ranks = ['THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','JACK','QUEEN','KING','ACE','TWO'], id = 0;
    for (var s = 0; s < 4; s++) { for (var r = 0; r < 13; r++) { cards.push({ suit: suits[s], rank: ranks[r], uuid: 'c' + (id++) }); } }
    for (var i = cards.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = cards[i]; cards[i] = cards[j]; cards[j] = t; }
    var hands = []; for (var p = 0; p < 4; p++) { hands.push(cards.splice(0, rs.startingHandSize)); }
    var starter = 0;
    for (var q = 0; q < 4; q++) { if (has(hands[q], { rank: 'THREE', suit: 'DIAMONDS' })) { starter = q; break; } }
    return { hands: hands, starter: starter };
}

ids.forEach(function (rid) {
    var rs = RS[rid];
    var order = Deal.suitOrder(rs);
    var low = { rank: 'THREE', suit: order[0] }, second = { rank: 'THREE', suit: order[1] };
    assert.deepEqual(Deal.startCard(rs), rs.firstTurnRule === 'diamond3' ? { rank: 'THREE', suit: 'DIAMONDS' } : low);
    if (rid === 'singapore') { assert.deepEqual(Deal.startCard(rs), { rank: 'THREE', suit: 'SPADES' }); assert.deepEqual(Deal.fallbackCard(rs), { rank: 'THREE', suit: 'HEARTS' }); }
    else { assert.deepEqual(Deal.startCard(rs), { rank: 'THREE', suit: 'DIAMONDS' }); assert.deepEqual(Deal.fallbackCard(rs), { rank: 'THREE', suit: 'CLUBS' }); }
    var sc = Deal.startCard(rs), fb = Deal.fallbackCard(rs);

    for (var n = 0; n < 1500; n++) {
        [4, 3, 2].forEach(function (pc) {
            var d = Deal.deal(rs, pc, { rng: seeded(n * 7 + pc) });
            var all = [], seen = {};
            d.hands.forEach(function (h) { h.forEach(function (c) { all.push(c); }); });
            d.extra.forEach(function (c) { all.push(c); });
            // pickup card sits in a hand, not in extra; discarded/unpicked face-up card stays in extra (2p) or is the 1 leftover (3p)
            if (pc === 3 && d.pickupIdx < 0) { all.push(d.faceUp); }
            assert.strictEqual(d.hands.length, pc);
            all.forEach(function (c) { assert(!seen[c.uuid], 'duplicate ' + c.uuid); seen[c.uuid] = 1; });
            assert.strictEqual(all.length, 52, 'no card lost');
            if (pc === 4) {
                d.hands.forEach(function (h) { assert.strictEqual(h.length, 13); });
                assert(!d.faceUp && d.extra.length === 0);
                assert.strictEqual(d.starterIdx, d.hands.map(function (h) { return has(h, sc); }).indexOf(true));
                assert(same(d.mustInclude, sc) && d.mustInclude.uuid);
                var o = oldDeal(rs, seeded(n * 7 + pc));
                for (var p = 0; p < 4; p++) { assert.deepEqual(d.hands[p].map(function (c) { return c.uuid; }), o.hands[p].map(function (c) { return c.uuid; })); }
                if (rid !== 'singapore') { assert.strictEqual(d.starterIdx, o.starter); }
            } else if (pc === 3) {
                assert.strictEqual(d.extra.length, 0);
                assert(d.faceUp);
                if (same(d.faceUp, sc)) {
                    counts.faceUpStart++;
                    assert.strictEqual(d.scenario, 'three-faceup-start');
                    var hi = d.hands.map(function (h) { return has(h, fb); }).indexOf(true);
                    assert.strictEqual(d.pickupIdx, hi); assert.strictEqual(d.starterIdx, hi);
                    assert(same(d.mustInclude, sc) && has(d.hands[hi], sc));
                } else {
                    counts.normal++;
                    var h3 = d.hands.map(function (h) { return has(h, sc); }).indexOf(true);
                    assert.strictEqual(d.pickupIdx, h3); assert.strictEqual(d.starterIdx, h3);
                    assert(same(d.mustInclude, sc) && has(d.hands[h3], d.faceUp));
                }
                d.hands.forEach(function (h, i) { assert.strictEqual(h.length, i === d.pickupIdx ? 18 : 17); });
            } else {
                var sizes = d.hands.map(function (h) { return h.length; });
                if (d.pickupIdx >= 0) {
                    assert.strictEqual(d.extra.length, 17);
                    sizes.forEach(function (z, i) { assert.strictEqual(z, i === d.pickupIdx ? 18 : 17); });
                    assert(has(d.hands[d.pickupIdx], d.faceUp));
                    assert.strictEqual(d.starterIdx, d.pickupIdx);
                    if (same(d.faceUp, sc)) {
                        counts.faceUpStart++;
                        assert.strictEqual(d.scenario, 'two-faceup-start');
                        assert(has(d.hands[d.pickupIdx], fb) && same(d.mustInclude, sc));
                    } else { counts.normal++; assert(has(d.hands[d.pickupIdx], sc) && same(d.mustInclude, sc)); }
                } else {
                    assert.strictEqual(d.extra.length, 18);
                    assert.deepEqual(sizes, [17, 17]);
                    assert(d.faceUp && d.extra.indexOf(d.faceUp) >= 0, 'discarded with the extra pile');
                    if (d.scenario === 'two-start-in-pile') { counts.pile++; assert(!has(d.hands[0], sc) && !has(d.hands[1], sc)); }
                    else { counts.nobody++; assert.strictEqual(d.scenario, 'two-faceup-start-nobody'); }
                    // lowest dealt card
                    var lows = null, li = -1;
                    d.hands.forEach(function (h, i) { h.forEach(function (c) { if (!lows || Deal.cardValue(c, rs) < Deal.cardValue(lows, rs)) { lows = c; li = i; } }); });
                    assert.strictEqual(d.starterIdx, li); assert(same(d.mustInclude, lows));
                }
            }
            assert(!d.viaWinner);
        });
    }
});
assert(counts.faceUpStart > 100 && counts.pile > 100 && counts.nobody >= 1 && counts.normal > 1000, JSON.stringify(counts));

// Lowest card of rank and suit by the ruleset order: reversed uses spades then hearts
assert.deepEqual(Deal.suitOrder(RS.singapore), ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS']);
assert.deepEqual(Deal.suitOrder(RS.hongkong), ['DIAMONDS', 'CLUBS', 'HEARTS', 'SPADES']);
// explicit startingCard and diamond3 are honored
var custom = { suitOrder: 'standard', firstTurnRule: 'lowest', startingCard: { rank: 'THREE', suit: 'HEARTS' }, startingHandSize: 13 };
assert.deepEqual(Deal.startCard(custom), { rank: 'THREE', suit: 'HEARTS' });
assert.deepEqual(Deal.fallbackCard(custom), { rank: 'THREE', suit: 'DIAMONDS' });
var d0 = Deal.deal(custom, 3, { rng: seeded(5) }); assert(has(d0.hands[d0.starterIdx], d0.mustInclude));
assert.deepEqual(Deal.startCard({ suitOrder: 'reversed', firstTurnRule: 'diamond3' }), { rank: 'THREE', suit: 'DIAMONDS' });

// Last winner mode
[4, 3, 2].forEach(function (pc) {
    for (var w = 0; w < pc; w++) {
        var d = Deal.deal(RS.hongkong, pc, { rng: seeded(11 + w), whoStarts: 'winner', lastWinnerIdx: w });
        assert.strictEqual(d.starterIdx, w); assert(d.viaWinner); assert.strictEqual(d.mustInclude, null);
        var cnt = 0; d.hands.forEach(function (h) { cnt += h.length; }); assert.strictEqual(cnt + d.extra.length + (pc === 3 && d.pickupIdx < 0 ? 1 : 0), 52);
    }
    // first game: no last winner means lowest card
    var f = Deal.deal(RS.hongkong, pc, { rng: seeded(3), whoStarts: 'winner', lastWinnerIdx: null });
    var g = Deal.deal(RS.hongkong, pc, { rng: seeded(3), whoStarts: 'lowest' });
    assert.strictEqual(f.starterIdx, g.starterIdx); assert(!f.viaWinner);
    // winner seat out of range falls back
    assert(!Deal.deal(RS.hongkong, pc, { rng: seeded(3), whoStarts: 'winner', lastWinnerIdx: 9 }).viaWinner);
});

// Game level: opening play rule honored, including the picked-up card, and pass rules
function mkPlayers(n) { var a = []; for (var i = 0; i < n; i++) { a.push({ id: 'player' + i, name: 'P' + i, type: 'human' }); } return a; }
var forced = 0;
for (var s = 1; s < 400; s++) {
    [2, 3, 4].forEach(function (pc) {
        var g = new Game(RS.hongkong, mkPlayers(pc), { rng: seeded(s) });
        g.deal();
        assert.strictEqual(g.state, 'PLAYING');
        var cur = g.currentPlayer(), must = g._getMustIncludeCard(cur);
        assert(must, 'starter must include a card');
        // a single that is not the required card is refused, the required card alone is accepted by validatePlay when it is a legal single
        var other = null;
        cur.hand.forEach(function (c) { if (!other && c.uuid !== must.uuid) { other = c; } });
        var r = g.playCards(cur.id, [other]); assert(!r.ok);
        assert(!g.validatePlay([other]).valid);
        assert(g.validatePlay([must]).valid);
        // flag off disables it
        var off = Object.create(RS.hongkong); off.firstPlayMustIncludeStartCard = false;
        var g2 = new Game(off, mkPlayers(pc), { rng: seeded(s) }); g2.deal();
        assert.strictEqual(g2._getMustIncludeCard(g2.currentPlayer()), null);
        if (pc === 3 && same(g.dealInfo.faceUp, Deal.startCard(RS.hongkong))) { forced++; assert(must.uuid === g.dealInfo.faceUp.uuid); }
        var ok = g.playCards(cur.id, [must]); assert(ok.ok, ok.error);
        assert.strictEqual(g._getMustIncludeCard(g.currentPlayer()), null);
        var snap = g._getSnapshot(); assert(snap.dealInfo);
    });
}
assert(forced > 5);

// Describe and explain give plain text
var di = Deal.deal(RS.singapore, 3, { rng: seeded(1) });
assert(/picked it up|picked/.test(Deal.describe(di, ['A', 'B', 'C'])));
assert(/17 cards each/.test(Deal.explain(RS.hongkong, 3, 'lowest')) && /Last winner/.test(Deal.explain(RS.hongkong, 4, 'winner')));
assert(/♠/.test(Deal.explain(RS.singapore, 4, 'lowest')));

// Options: defaults and tamper safety
assert.deepEqual(Opts.sanitize(null), { v: 1, players: 4, whoStarts: 'lowest', lastWinner: null });
assert.deepEqual(Opts.sanitize({ v: 1, players: 3, whoStarts: 'winner', lastWinner: 'player2' }), { v: 1, players: 3, whoStarts: 'winner', lastWinner: 'player2' });
assert.strictEqual(Opts.sanitize({ v: 1, players: 5 }).players, 4);
assert.strictEqual(Opts.sanitize({ v: 1, players: '3' }).players, 4);
assert.strictEqual(Opts.sanitize({ v: 2, players: 3 }).players, 4);
assert.strictEqual(Opts.sanitize({ v: 1, whoStarts: 'constructor' }).whoStarts, 'lowest');
assert.strictEqual(Opts.sanitize({ v: 1, lastWinner: 'player9' }).lastWinner, null);
assert.strictEqual(Opts.sanitize({ v: 1, lastWinner: '<img>' }).lastWinner, null);
assert.strictEqual(Opts.sanitize([1, 2]).players, 4);
assert.strictEqual(Opts.sanitize(JSON.parse('{"__proto__":{"players":2},"v":1}')).players, 4);
var store = {}, ls = { getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; }, setItem: function (k, v) { store[k] = v; } };
assert.strictEqual(Opts.KEY, 'fong.big2.opts');
assert(Opts.save(ls, { v: 1, players: 2, whoStarts: 'winner', lastWinner: 'player1', evil: 1 }));
assert.deepEqual(JSON.parse(store['fong.big2.opts']), { v: 1, players: 2, whoStarts: 'winner', lastWinner: 'player1' });
assert.strictEqual(Opts.load(ls).players, 2);
store['fong.big2.opts'] = '{bad'; assert.strictEqual(Opts.load(ls).players, 4);
assert.strictEqual(Opts.load({ getItem: function () { throw new Error('x'); } }).players, 4);

// Scoring: never-played penalty uses the dealt count
var gs = new Game(RS.hongkong, mkPlayers(3), { rng: seeded(2) }); gs.deal();
gs.players[0].hand = []; gs.players[1].hand = gs.players[1].hand.slice(0, 5); gs.players[1].dealtCount = 17;
gs.players[2].dealtCount = gs.players[2].hand.length; gs._handleWin('player0');
assert.strictEqual(gs.scores.player1, 5); assert.strictEqual(gs.scores.player2, gs.players[2].hand.length * 3);

// Review fixes: real hand size in the message, spare pile count, null storage
(function () {
    var names = ['A', 'B', 'C', 'D'];
    var d4 = Deal.deal(RS.hongkong, 4, { rng: seeded(1) });
    assert(/Dealt 13 each\./.test(Deal.describe(d4, names)));
    var small = Object.create(RS.hongkong); small.startingHandSize = 10;
    var d10 = Deal.deal(small, 4, { rng: seeded(1) });
    assert.strictEqual(d10.handSize, 10); assert(/Dealt 10 each\./.test(Deal.describe(d10, names)));
    for (var i = 1; i < 300; i++) {
        var d = Deal.deal(RS.hongkong, 2, { rng: seeded(i) });
        var down = 0; d.extra.forEach(function (c) { if (c !== d.faceUp) { down++; } });
        assert.strictEqual(down, 17, 'face down spare count is 17 in every 2 player case');
    }
    assert(/17 face down/.test(Deal.explain(RS.hongkong, 2, 'lowest')));
    assert(/13 cards each/.test(Deal.explain(RS.hongkong, 4, 'lowest')));
    assert.deepEqual(Opts.load(null), Opts.defaults());
    assert.strictEqual(Opts.save(null, Opts.defaults()), false);
    assert.strictEqual(Opts.save({ setItem: function () { throw new Error('full'); } }, Opts.defaults()), false);
})();

console.log('big2 deal tests passed', JSON.stringify(counts));
