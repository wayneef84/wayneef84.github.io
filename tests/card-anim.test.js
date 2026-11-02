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

// keep and back:false end states (WAAPI path and CSS-transition fallback)
function fakeEl(withAnim) {
    var el = { style: { opacity: '0' }, parentNode: null, offsetWidth: 22, offsetHeight: 22, anims: [],
        getBoundingClientRect: function () { return { left: 10, top: 10, width: 20, height: 20 }; } };
    if (withAnim) {
        el.animate = function () { var a = { cancel: function () { el.style.transform = ''; }, onfinish: null }; el.anims.push(a); return a; };
    }
    return el;
}
global.document = { body: { appendChild: function (n) { n.parentNode = global.document.body; }, removeChild: function (n) { n.parentNode = null; } }, hidden: false };
var from = fakeEl(false), to = fakeEl(false);
to.getBoundingClientRect = function () { return { left: 110, top: 60, width: 20, height: 20 }; };
var flown = fakeEl(true), fdone = 0;
A.fly(flown, from, to, function () { fdone++; }, { keep: true, duration: 60 });
assert.strictEqual(flown.anims.length, 1);
flown.anims[0].onfinish();
assert.strictEqual(fdone, 1); assert.strictEqual(flown.style.opacity, '1', 'keep leaves fly element visible');
assert(/translate\(/.test(flown.style.transform), 'keep leaves fly element at the destination');
assert(flown.parentNode, 'keep does not remove the node');
var gone = fakeEl(true);
A.fly(gone, from, to, null, { duration: 60 }); gone.anims[0].onfinish();
assert.strictEqual(gone.parentNode, null, 'without keep the node is removed');
var sw = fakeEl(true); sw.style.opacity = '1';
var sdone = 0;
A.sweep([sw], to, function () { sdone++; }, { back: false, duration: 60 });
sw.anims[0].onfinish();
assert.strictEqual(sdone, 1); assert.strictEqual(sw.anims.length, 1, 'no slide-back animation');
assert(/translate\(/.test(sw.style.transform) && /scale\(0.35\)/.test(sw.style.transform), 'back:false stays at the destination');
var sb = fakeEl(true); sb.style.opacity = '1';
A.sweep([sb], to, null, { duration: 60 }); sb.anims[0].onfinish();
assert.strictEqual(sb.anims.length, 2, 'default sweep slides back');
sb.anims[1].onfinish(); assert.strictEqual(sb.style.transform, '');
// cancelAll leaves a kept element visible too
var kc = fakeEl(true); A.fly(kc, from, to, null, { keep: true }); A.cancelAll();
assert.strictEqual(kc.style.opacity, '1');
// fallback path (no element.animate)
var fb = fakeEl(false), sf = fakeEl(false); sf.style.opacity = '1';
var pending = 2;
function finFb() { pending--; if (pending === 0) {
    assert.strictEqual(fb.style.opacity, '1', 'fallback keep visible'); assert(/translate\(/.test(fb.style.transform));
    assert(/translate\(/.test(sf.style.transform), 'fallback back:false stays');
    console.log('card-anim tests passed'); process.exit(0);
} }
A.fly(fb, from, to, finFb, { keep: true, duration: 60 });
A.sweep([sf], to, finFb, { back: false, duration: 60 });
setTimeout(function () { console.log('fallback timeout'); process.exit(1); }, 3000);
