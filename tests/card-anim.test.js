// Unit tests for games/cards/shared/card-anim.js. Run: node tests/card-anim.test.js
var assert = require('assert'), path = require('path');
var A = require(path.join(__dirname, '../games/cards/shared/card-anim.js'));
var P = A.pure;

// pure parts
assert.deepEqual(P.staggerDelays(4, 50), [0, 50, 100, 150]);
assert.deepEqual(P.staggerDelays(0, 50), []);
assert.strictEqual(P.staggerDelays(9999, 1).length, 500);
var plan = P.dealPlan(3, 2, 10);
assert.strictEqual(plan.length, 6);
assert.deepEqual(plan.map(function (p) { return p.target; }), [0, 1, 2, 0, 1, 2]);
assert.deepEqual(plan.map(function (p) { return p.delay; }), [0, 10, 20, 30, 40, 50]);
assert.strictEqual(P.totalTime(plan, 300), 350);
assert.strictEqual(P.totalTime([], 300), 0);
assert.strictEqual(P.clamp(NaN, 1, 5), 1); assert.strictEqual(P.clamp(9, 1, 5), 5);
assert.strictEqual(P.isReduced(false, false, false), false);
assert.strictEqual(P.isReduced(true, false, false), true);
assert.strictEqual(P.isReduced(false, true, false), true);
assert.strictEqual(P.isReduced(false, false, true), true);

// reduced paths call done immediately and run final-state callbacks
function run(setup) {
    A.skip = false; delete global.FongPrefs; delete global.matchMedia;
    setup();
    var calls = [], arrived = [], swapped = 0, order = [];
    assert.strictEqual(A.reduced(), true);
    A.deal({}, [{}, {}, {}], { rounds: 2, onArrive: function (t, i, r) { arrived.push(i + ':' + r); } }, function () { calls.push('deal'); });
    assert.deepEqual(calls, ['deal']); assert.strictEqual(arrived.length, 6);
    A.flip({ style: {} }, function () { calls.push('flip'); }, { swap: function () { swapped++; } });
    assert.strictEqual(swapped, 1); assert.deepEqual(calls, ['deal', 'flip']);
    A.sweep([{}, {}], {}, function () { calls.push('sweep'); });
    A.fly(null, {}, {}, function () { calls.push('fly'); });
    A.pulse({ style: {} }, function () { calls.push('pulse'); });
    assert.deepEqual(calls, ['deal', 'flip', 'sweep', 'fly', 'pulse']);
    assert.strictEqual(A.activeCount(), 0);
}
run(function () { global.FongPrefs = { get: function (k) { return k === 'calm'; } }; });
run(function () { global.matchMedia = function () { return { matches: true }; }; });
run(function () { A.skip = true; });
// empty targets still finish
A.skip = true; var fin = 0; A.deal({}, [], {}, function () { fin++; }); assert.strictEqual(fin, 1);
A.cancelAll(); assert.strictEqual(A.activeCount(), 0);
A.skip = false;
assert.strictEqual(A.reduced(), false);
console.log('card-anim tests passed');
