// Tests for Nightlite Choir+ recipes (js/recipes.js), the blend data files and the save migration in js/app.js.
// Run: node tests/nightlite.test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
var DIR = path.join(__dirname, '../games/nightlite_choir/js/');
function same(a, b, m) { assert.strictEqual(JSON.stringify(a), JSON.stringify(b), m); }
function read(f) { return fs.readFileSync(DIR + f, 'utf8'); }

// ---- a fake window with a fake DOM: every element is a forgiving stub
var store = {};
function seeded(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeStub() {
    var target = function () {};
    var p = new Proxy(target, {
        get: function (t, k) {
            if (k === 'length') return 0;
            if (k === Symbol.toPrimitive) return function () { return ''; };
            if (k === 'then') return undefined;
            if (k === 'style') return { setProperty: function () {} };
            if (k === 'classList') return { add: function () {}, remove: function () {}, contains: function () { return false; } };
            if (k === 'value') return '70';
            if (k === 'children') return [];
            if (k === 'indexOf') return function () { return -1; };
            if (k === 'getBoundingClientRect') return function () { return { left: 0, top: 0, width: 0, height: 0 }; };
            if (k === 'querySelectorAll') return function () { return []; };
            return p;
        },
        set: function () { return true; },
        apply: function () { return p; }
    });
    return p;
}
function loadWindow(randomFn, withApp, hook) {
    var win = { Math: Object.create(Math) };
    win.window = win;
    if (randomFn) win.Math.random = randomFn;
    win.localStorage = { getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } };
    win.document = { readyState: 'complete', hidden: false, getElementById: function () { return makeStub(); }, querySelector: function () { return makeStub(); }, querySelectorAll: function () { return []; },
                     createElement: function () { return makeStub(); }, createElementNS: function () { return makeStub(); }, addEventListener: function () {}, body: makeStub(), documentElement: makeStub() };
    win.addEventListener = function () {}; win.setTimeout = function () { return 1; }; win.setInterval = function () { return 1; }; win.clearTimeout = function () {};
    win.scrollTo = function () {};
    win.document.defaultView = win;
    var ctx = vm.createContext(win);
    var files = ['js/synth.js', 'js/art.js', 'js/worlds/garden.js', 'js/worlds/attic.js', 'js/worlds/observatory.js', 'js/worlds/blends.js', 'js/worlds/blends_claude.js', 'js/worlds/tiers.js'];
    var i;
    for (i = 0; i < files.length; i++) vm.runInContext(read(files[i].replace('js/', '')), ctx, { filename: files[i] });
    var extras = fs.readdirSync(DIR + 'worlds').filter(function (f) { return /^blends_.*\.js$/.test(f) && f !== 'blends_claude.js'; });
    for (i = 0; i < extras.length; i++) vm.runInContext(read('worlds/' + extras[i]), ctx, { filename: extras[i] });
    vm.runInContext(read('recipes.js'), ctx, { filename: 'recipes.js' });
    vm.runInContext(read('eggs.js'), ctx, { filename: 'eggs.js' });
    vm.runInContext(read('layout.js'), ctx, { filename: 'layout.js' });
    if (hook) hook(win);
    if (withApp) vm.runInContext(read('app.js'), ctx, { filename: 'app.js' });
    return win;
}

var win = loadWindow(null, false);
var R = win.NightliteRecipes;
var bases = [], id, j, wd;
['garden', 'attic', 'observatory'].forEach(function (k) {
    wd = win.NightliteWorlds[k];
    wd.chars.forEach(function (c) { c.world = k; c.bpm = wd.bpm; bases.push(c); });
});
assert.strictEqual(bases.length, 12, '12 base choirers');
var blends = R.collectBlends(win);
var oldCount = 6;
assert(blends.length >= oldCount + 15, 'old 6 plus the 15 from set CLAUDE (plus any later set): ' + blends.length);
var model = R.build(bases, blends);
same(model.errors, [], 'every blend resolves, no shared ingredient sets: ' + model.errors.join('; '));
assert.strictEqual(model.recipes.length, blends.length);

// ---- tiers (js/worlds/tiers.js): 1 grey .. 6 red, every blend has one
var TI = win.NightliteTiers, tierCount = {}, tierIds = Object.keys(TI);
var blendIds = blends.map(function (b) { return b.id; });
assert.strictEqual(blendIds.length, 42, '42 blends: ' + blendIds.length);
blendIds.forEach(function (bid) { assert(TI[bid] >= 1 && TI[bid] <= 6 && TI[bid] === Math.floor(TI[bid]), 'tier 1..6 for ' + bid); tierCount[TI[bid]] = (tierCount[TI[bid]] || 0) + 1; });
tierIds.forEach(function (tid) { assert(blendIds.indexOf(tid) >= 0, 'tiers.js has an unknown id: ' + tid); });
assert.strictEqual(tierIds.length, blendIds.length, 'one tier per blend');
same([1, 2, 3, 4, 5, 6].map(function (t) { return tierCount[t]; }), [12, 10, 8, 6, 4, 2], 'tier counts');
same(model.errors, [], 'build vet has zero errors');

// extras come from any NightliteBlendsExtra_ global: add a fake one and merge it
var fake = loadWindow(null, false);
fake.NightliteBlendsExtra_TEST = { chars: [{ id: 'zzfake', name: 'Zzfake', blend: ['mossle', 'clopsy'], art: {}, synth: {} }, { id: 'lilybop', name: 'dup' }] };
var merged = fake.NightliteRecipes.collectBlends(fake);
assert.strictEqual(merged.length, blends.length + 1, 'extra set merged, duplicate id skipped');

// old six keys are unchanged (sorted pair joined with '+')
['mossweave:mossle+skeinie', 'halohum:glimmow+ringhum', 'dewglint:glintwand+puddlet', 'trotleaf:clopsy+hedgey', 'tockmoon:dozemoon+tocklet', 'twirlwisp:mallowhorn+twirltail'].forEach(function (s) {
    var p = s.split(':');
    assert.strictEqual(model.recipeByKey[p[1]], p[0], 'old recipe ' + p[1]);
});

// ---- matching: 2 to 5 ingredients, any order
function perms(a) {
    if (a.length <= 1) return [a];
    var out = [], i, rest, sub, k;
    for (i = 0; i < a.length; i++) {
        rest = a.slice(0, i).concat(a.slice(i + 1));
        sub = perms(rest);
        for (k = 0; k < sub.length; k++) out.push([a[i]].concat(sub[k]));
    }
    return out;
}
var sizes = {}, checked = 0;
model.recipes.forEach(function (r) {
    sizes[r.ing.length] = (sizes[r.ing.length] || 0) + 1;
    perms(r.ing).forEach(function (p) { assert.strictEqual(model.match(p), r.id, r.id + ' in order ' + p.join()); checked++; });
    assert.strictEqual(model.match(r.ing.concat([r.ing[0]])), r.id, 'repeated friend counts once');
});
[2, 3, 4, 5].forEach(function (n) { assert(sizes[n] > 0, 'have a recipe with ' + n + ' ingredients'); });
assert.strictEqual(model.match(['mossle']), null, 'one friend never matches');
assert.strictEqual(model.match(['mossle', 'puddlet', 'clopsy']), null);
assert.strictEqual(model.match(['mossle', 'puddlet', 'clopsy', 'skeinie', 'hedgey', 'glimmow']), null, 'six is too many');
assert.strictEqual(model.match(['mossle', 'puddlet']), 'lilybop');
assert.strictEqual(model.match(['puddlet', 'mossle']), 'lilybop');

// ---- hints
var none = {};
var ownedAll = {}; blends.forEach(function (b) { ownedAll[b.id] = true; });
var h = model.hint(['mossle', 'glimmow'], none, none);
same(h, { kind: 'almost', n: 1 }, 'subset of Nodlight (mossle, glimmow, dozemoon): add 1 more');
h = model.hint(['clopsy', 'mallowhorn'], none, none);
same(h, { kind: 'almost', n: 1 }, 'subset of Tootlepip');
h = model.hint(['glimmow', 'hedgey', 'skeinie'], none, none);
same(h, { kind: 'almost', n: 2 }, 'three of the five in Glimmerjig: add 2 more');
assert.strictEqual(model.hint(['mossle', 'puddlet', 'skeinie'], none, none).kind, 'many', 'superset of Lilybop');
assert.strictEqual(model.hint(['mossle', 'clopsy'], none, none), null, 'unrelated pair, no hint');
assert.strictEqual(model.hint(['mossle'], none, none), null, 'one pick, no hint');
// a recipe with a blend the child does not own is not offered as "almost"
assert.strictEqual(model.hint(['mossle', 'puddlet', 'hedgey'], none, none).kind === 'almost', false, 'Sprizzle needs an owned Mossweave, so no almost');
same(model.hint(['puddlet', 'hedgey'], { mossweave: true }, none), { kind: 'almost', n: 1 }, 'with Mossweave owned, puddlet + hedgey is 1 short of Sprizzle');
var foundLily = {}; foundLily[R.keyOf(['mossle', 'puddlet', 'glimmow'])] = true;
assert.strictEqual(model.hint(['mossle', 'glimmow'], none, foundLily).n, 1, 'still almost for Nodlight');
// hints never name a friend
assert(Object.keys(h).join() === 'kind,n' || Object.keys(h).join() === 'kind');

// ---- suggestions
var stage = ['mossle', 'glimmow', 'dozemoon'];
var sg = model.suggest(stage, [], none, none);
var ids = sg.map(function (r) { return r.id; });
assert(ids.indexOf('nodlight') >= 0, 'Nodlight is offered');
assert(ids.indexOf('hushbush') < 0, 'needs hedgey, not on stage');
sg.forEach(function (r) { r.ing.forEach(function (i2) { assert(stage.indexOf(i2) >= 0, 'all ingredients on stage'); }); });
sg = model.suggest(['mossle', 'puddlet', 'glimmow', 'dozemoon'], [], none, none).map(function (r) { return r.id; });
same(sg, ['lilybop', 'nodlight'], 'smaller recipes first');
sg = model.suggest(['mossle', 'puddlet', 'glimmow', 'dozemoon'], [], none, (function () { var f = {}; f['mossle+puddlet'] = true; return f; })()).map(function (r) { return r.id; });
same(sg, ['nodlight', 'lilybop'], 'found recipes go last');
same(model.suggest(['mossle'], [], none, none), [], 'one friend suggests nothing');
sg = model.suggest([], ['glimmow'], none, none).map(function (r) { return r.id; });
assert(sg.indexOf('glowfluff') >= 0 && sg.indexOf('nodlight') >= 0 && sg.indexOf('halohum') >= 0, 'picks: every recipe containing the pick');
sg.forEach(function (id2) { assert(model.recipeOf[id2].ing.indexOf('glimmow') >= 0); });
// recipes with an unowned blend ingredient are never offered
assert(model.suggest(['mossweave', 'puddlet', 'hedgey'], [], none, none).length === 0, 'unowned blend on stage is ignored');
same(model.suggest(['mossweave', 'puddlet', 'hedgey'], [], { mossweave: true }, none).map(function (r) { return r.id; }), ['sprizzle'], 'owned blend counts');
assert(model.suggest([], ['mossweave'], none, none).length === 0, 'picks that need an unowned blend');
// match my stage
same(model.fromStage(['mossle', 'glimmow', 'dozemoon', 'clopsy'], none, none).sort(), ['dozemoon', 'glimmow', 'mossle'], 'prefers the set that is part of an unfound recipe');
same(model.fromStage(['mossle', 'glimmow', 'dozemoon', 'clopsy'], none, { 'dozemoon+glimmow+mossle': true }).length >= 2, true);
same(model.fromStage(['mossle', 'mossle', 'clopsy'], none, none).sort(), ['clopsy', 'mossle'], 'distinct only');
assert.strictEqual(model.fromStage(['mossle', 'puddlet', 'clopsy', 'skeinie', 'hedgey', 'glimmow'], none, (function () { var f = {}; model.recipes.forEach(function (r) { f[r.key] = true; }); return f; })()).length, 5, 'at most 5');
same(model.fromStage(['mossweave', 'clopsy'], none, none), ['clopsy'], 'unowned blends are not picked');

// ---- tempo recursion
assert.strictEqual(model.tempo('mossle', 1), 90);
assert.strictEqual(model.tempo('mossweave'), model.byId.mossle.bpm, 'first listed ingredient decides');
assert.strictEqual(model.tempo('sprizzle'), model.byId.mossle.bpm, 'blend of a blend: sprizzle -> mossweave -> mossle');
var tw = [{ id: 'a', bpm: 80 }, { id: 'b', bpm: 120 }];
var tm = R.build(tw, [{ id: 'x', blend: ['a', 'b'] }, { id: 'y', blend: ['x', 'b'] }, { id: 'z', blend: ['y', 'a'] }, { id: 'q', blend: ['b', 'x', 'a'] }]);
assert.strictEqual(tm.tempo('z'), 80, 'three levels deep');
assert.strictEqual(tm.tempo('q'), 120);
assert.strictEqual(tm.errors.length, 0);
var bad = R.build(tw, [{ id: 'e1', blend: ['a'] }, { id: 'e2', blend: ['a', 'a'] }, { id: 'e3', blend: ['a', 'nope'] }, { id: 'e4', blend: ['a', 'b', 'a', 'b', 'a', 'b'] }, { id: 'e5', blend: ['a', 'b'] }, { id: 'e6', blend: ['b', 'a'] }]);
assert.strictEqual(bad.errors.length, 5, 'bad recipes are reported: ' + bad.errors.join('; '));

// tiers: a recipe that uses a blend is on page 2
model.recipes.forEach(function (r) {
    var usesBlend = r.ing.some(function (i2) { return !!model.blendById[i2]; });
    assert.strictEqual(r.tier, usesBlend ? 2 : 1, r.id);
    var ch = model.blendById[r.id];
    if (ch.tier) assert.strictEqual(ch.tier, r.tier, r.id + ' tier in the data matches');
    assert(ch.clue && typeof ch.clue === 'string' || oldCount, 'clue');
});

// every blend: pentatonic notes only, art spec and synth present, rare version also pentatonic
var PENT = { 0: 1, 2: 1, 4: 1, 7: 1, 9: 1 };
function notes(spec, out) {
    var i, e;
    if (spec.kind === 'layers') { spec.layers.forEach(function (l) { notes(l, out); }); return out; }
    if (spec.seq && spec.kind !== 'drum') {
        for (i = 0; i < spec.seq.length; i++) {
            e = spec.seq[i];
            if (e === null || e === undefined) continue;
            out.push(Array.isArray(e) ? e[0] : e);
        }
    }
    return out;
}
blends.forEach(function (b) {
    assert(b.art && b.synth, b.id);
    [b.synth, R.rareSynth(b.synth)].forEach(function (sp) {
        notes(sp, []).forEach(function (m) { assert(PENT[m % 12], b.id + ' note ' + m + ' is not C pentatonic'); });
        var out = win.NightliteSynth.render(sp, 90, 5);
        assert(out.data.length > 0);
        for (var q = 0; q < out.data.length; q += 997) assert(isFinite(out.data[q]));
    });
    var rs = win.NightliteArt.rareSpec(b.art);
    assert(rs.rare && rs.color !== b.art.color || b.art.color.toLowerCase() === '#ffffff', b.id + ' rare color shifted');
    assert(win.NightliteArt.make(rs, false).indexOf('<svg') === 0);
    assert(win.NightliteArt.make(rs, false).length > win.NightliteArt.make(b.art, false).length, 'rare adds sparkles');
});
assert(!('rare' in blends[0].art), 'rareSpec does not change the original spec');

// ---- rare rolls
assert.strictEqual(R.RARE_ODDS, 10);
var rnd = seeded(12345), hits = 0, n = 20000, i;
for (i = 0; i < n; i++) if (R.roll(rnd, true)) hits++;
assert(hits > n * 0.09 && hits < n * 0.11, '1 in 10: ' + hits + ' of ' + n);
rnd = seeded(12345); hits = 0;
for (i = 0; i < n; i++) if (R.roll(rnd, false)) hits++;
assert.strictEqual(hits, 0, 'Off means no rare rolls');
assert.strictEqual(R.roll(function () { return 0.0999; }, true), true);
assert.strictEqual(R.roll(function () { return 0.1; }, true), false);
assert.strictEqual(R.rareId('lilybop'), 'lilybop_rare');
assert(R.isRareId('lilybop_rare') && !R.isRareId('lilybop') && !R.isRareId('_rare'));
assert.strictEqual(R.baseId('lilybop_rare'), 'lilybop');

// ---- the real app with a fake DOM: save migration, eggs, rares
store = {};
store['nightlite.save'] = JSON.stringify({ v: 4, sparks: 12, blends: ['mossweave', 'halohum'], found: ['mossle+skeinie', 'glimmow+ringhum'], nest: { left: 7.5 } });
var app = loadWindow(seeded(99), true);
var N = app.Nightlite;
assert(N, 'app started with the fake DOM');
assert.strictEqual(N.state.sparks, 12);
assert(N.state.owned.mossweave && N.state.owned.halohum, 'old owned blends kept');
assert(N.state.found['mossle+skeinie'] && N.state.found['glimmow+ringhum'], 'old found keys kept');
assert.strictEqual(N.state.nest.left, 7.5, 'old nest kept');
same(N.state.rares, {}, 'no rares in an old save');
N.saveProgress();
var saved = JSON.parse(store['nightlite.save']);
assert.strictEqual(saved.v, 6);
same(saved.blends.sort(), ['halohum', 'mossweave']);
same(saved.found.sort(), ['glimmow+ringhum', 'mossle+skeinie']);
same(saved.rares, []);
assert.strictEqual(saved.sparks, 12);
assert.strictEqual(saved.nest.left, 7.5);
// a v1 save (sparks only) and junk
store = { 'nightlite.save': '{"v":1,"sparks":5}' };
var app2 = loadWindow(seeded(1), true);
assert.strictEqual(app2.Nightlite.state.sparks, 5);
store = { 'nightlite.save': 'not json' };
assert.strictEqual(loadWindow(seeded(1), true).Nightlite.state.sparks, 0);
// a save from the game with a found key for a recipe that is not in this build is ignored, not fatal
store = { 'nightlite.save': JSON.stringify({ v: 5, blends: ['nope', 'mossweave'], found: ['a+b'], rares: ['nope_rare', 'mossweave_rare', 'halohum_rare'] }) };
var app3 = loadWindow(seeded(1), true);
same(Object.keys(app3.Nightlite.state.found), []);
assert(app3.Nightlite.state.rares.mossweave_rare && app3.Nightlite.state.owned.mossweave, 'rare saved in nightlite.save comes back');
assert(app3.Nightlite.charById.mossweave_rare && app3.Nightlite.charById.mossweave_rare.rare, 'rare twin is a placeable choirer');
assert.strictEqual(app3.Nightlite.charById.mossweave_rare.bpm, app3.Nightlite.charById.mossweave.bpm, 'same tempo');
assert.strictEqual(app3.Nightlite.charById.sprizzle.bpm, app3.Nightlite.charById.mossle.bpm, 'tempo recursion in the app');
// rare toggle is stored in nightlite.rare
store = { 'nightlite.rare': '0' };
assert.strictEqual(loadWindow(seeded(1), true).Nightlite.state.rareOn, false);
store = {};
assert.strictEqual(loadWindow(seeded(1), true).Nightlite.state.rareOn, true, 'default On');

// eggs: hatching always gives a blend the child lacks, rare about 1 in 10, none when Off, twinkle when all owned
function hatchMany(rareOn, count) {
    store = rareOn ? {} : { 'nightlite.rare': '0' };
    var a = loadWindow(seeded(2024), true), st = a.Nightlite.state, k, got = 0, rare = 0, before, total = Object.keys(a.Nightlite.charById).filter(function (x) { return a.Nightlite.charById[x].isBlend && !a.Nightlite.charById[x].rare; }).length;
    for (k = 0; k < count; k++) {
        st.owned = {}; st.rares = st.rares;
        st.nest = { left: 0 };
        a.Nightlite.hatch();
        assert.strictEqual(Object.keys(st.owned).length, 1, 'hatched exactly one blend');
        got++;
    }
    rare = Object.keys(st.rares).length;
    return { rare: rare, total: total, state: st, app: a };
}
var on = hatchMany(true, 400);
assert(on.rare > 0, 'some rare turned up in 400 hatches (' + on.rare + ' kinds)');
var off = hatchMany(false, 400);
assert.strictEqual(off.rare, 0, 'no rares when Off');
// all owned: a repeat gives the sparks back (full egg cost), a new rare twin does not
store = {};
var all = loadWindow(seeded(3), true), st2 = all.Nightlite.state, ri, refunds = 0, spent;
all.Nightlite.model.recipes.forEach(function (r) { st2.owned[r.id] = true; });
st2.rareOn = false;
st2.sparks = 4; st2.nest = { left: 0 };
all.Nightlite.hatch();
assert.strictEqual(st2.sparks, 7, 'a repeat gives the 3 sparks back');
assert(st2.reveal.refund && !st2.reveal.isNew, 'reveal says repeat');
assert.strictEqual(st2.nest, null);
// eggs lean toward blends not owned yet: with one missing it comes up much more than 1 in N
store = {};
var lean = loadWindow(seeded(4), true), sl = lean.Nightlite.state, hit = 0, miss;
lean.Nightlite.model.recipes.forEach(function (r) { sl.owned[r.id] = true; });
miss = lean.Nightlite.model.recipes[0].id;
for (ri = 0; ri < 300; ri++) {
    sl.owned[miss] = false; sl.rareOn = false; sl.nest = { left: 0 };
    lean.Nightlite.hatch();
    if (sl.reveal.id === miss) hit++;
}
assert(hit > 300 * 3 / (lean.Nightlite.model.recipes.length + 2) * 0.6, 'unowned blend is favored (' + hit + ' of 300)');
// eggs: shimmer is about 1 in 10 (the tier is separate)
store = {};
var rr = loadWindow(seeded(6), true), sr = rr.Nightlite.state, rhits = 0;
for (ri = 0; ri < 600; ri++) { sr.rares = {}; sr.nest = { left: 0 }; rr.Nightlite.hatch(); if (sr.reveal.rare) rhits++; }
assert(rhits > 600 / 10 * 0.6 && rhits < 600 / 10 * 1.4, 'egg shimmer about 1 in 10 (' + rhits + ' of 600)');
assert(R.roll(function () { return 0.19; }, true, 5) && !R.roll(function () { return 0.2; }, true, 5), 'roll takes custom odds');

// the pot empties after a good mix
store = {};
var pm = loadWindow(seeded(7), true), ps = pm.Nightlite.state, rec = pm.Nightlite.model.recipes[0];
rec.ing.forEach(function (id) { ps.owned[id] = true; pm.Nightlite.potPick(id); });
assert(!ps.owned[rec.id], 'not owned before the mix');
pm.Nightlite.mixPot();
assert(ps.owned[rec.id], 'mix made the blend');
assert.strictEqual(ps.pot.filter(Boolean).length, 0, 'pot is empty for the next mix');

// ---- tiers, luck and egg kinds (js/eggs.js)
var EG = win.NightliteEggs;
function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
function counts(arr) { return arr.map(function (c) { return { total: c[0], owned: c[1] }; }); }
var base = EG.odds(counts([[12, 0], [10, 0], [8, 0], [6, 0], [4, 0], [2, 0]]), 0, 0);
assert(Math.abs(sum(base) - 100) < 1e-9, 'odds add to 100');
assert.strictEqual(base[0], 50); assert.strictEqual(base[5], 0.1);
var depl = EG.odds(counts([[12, 12], [10, 0], [8, 0], [6, 0], [4, 0], [2, 0]]), 0, 0);
assert.strictEqual(depl[0], 0, 'a depleted tier has no share');
assert(Math.abs(depl[1] - 78) < 1e-9, 'its share moved up to the next tier');
assert.strictEqual(depl[2], 14, 'the other tiers stay the same');
var lucky = EG.odds(counts([[12, 0], [10, 0], [8, 0], [6, 0], [4, 0], [2, 0]]), 10, 0);
assert(Math.abs(sum(lucky) - 100) < 1e-9);
assert(Math.abs(lucky[0] - 40) < 1e-9, '10 luck takes 10 points off the lowest tier');
assert(lucky[2] > 14 && lucky[4] > 1.9 && lucky[5] > 0.1, 'and gives them to the higher tiers');
assert(Math.abs(lucky[5] / lucky[1] - 0.1 / 28) < 1e-9, 'in proportion to their normal odds');
var allown = EG.odds(counts([[12, 12], [10, 10], [8, 8], [6, 6], [4, 4], [2, 2]]), 50, 0);
assert.strictEqual(allown[0], 50, 'all owned: nothing to steer');
assert(EG.odds(counts([[12, 0], [10, 0], [8, 0], [6, 0], [4, 0], [2, 0]]), 500, 500)[0] >= 0, 'luck is capped');
assert(EG.sellLuck(1) < EG.sellLuck(2) && EG.sellLuck(5) < EG.sellLuck(6), 'a rarer repeat sells for more luck');
assert.strictEqual(EG.addLuck(59, 16), 60, 'banked luck is capped');
assert.strictEqual(EG.tierOf('x', {}), 1); assert.strictEqual(EG.tierOf('x', { x: 9 }), 1); assert.strictEqual(EG.tierOf('x', { x: 4 }), 4);
var ids = Object.keys(win.NightliteTiers), tcount = [0, 0, 0, 0, 0, 0];
ids.forEach(function (k) { tcount[win.NightliteTiers[k] - 1]++; });
same(tcount, [12, 10, 8, 6, 4, 2]);
// kinds are rolled by weight and every look is valid
var kr = seeded(11), ks = {}, ei, lk;
for (ei = 0; ei < 4000; ei++) { lk = EG.rollEgg(kr); ks[lk.kind] = (ks[lk.kind] || 0) + 1; assert(lk.color >= 0 && lk.color < EG.EGG_COLORS.length && lk.pattern >= 0 && lk.pattern < EG.EGG_PATTERNS); }
assert(ks.plain > 2800 && ks.plain < 3400, 'most eggs are plain (' + ks.plain + ')');
assert(ks.spots > 0 && ks.sparkle > 0 && ks.rainbow > 0, 'specials turn up');
// the real roll: tier shares follow the odds, a golden egg and luck make better tiers likelier
var items = Object.keys(win.NightliteTiers).map(function (k) { return { id: k, tier: win.NightliteTiers[k], owned: false }; });
function tierShare(luck, extra, n) { var rn = seeded(12), t = [0, 0, 0, 0, 0, 0], q; for (q = 0; q < n; q++) t[EG.rollBlend(rn, items, luck, extra).tier - 1]++; return t; }
var t0 = tierShare(0, 0, 6000), t1 = tierShare(0, 45, 6000);
assert(t0[0] > 2700 && t0[0] < 3300, 'about half are grey (' + t0[0] + ')');
assert(t1[0] < t0[0] - 1000 && sum(t1.slice(2)) > sum(t0.slice(2)) * 1.5, 'a golden egg shifts the tiers up');
assert.strictEqual(EG.rollBlend(seeded(1), [], 0, 0), null);
// hatching spends banked luck and a repeat banks new luck by tier
store = {};
var lk2 = loadWindow(seeded(13), true), sk = lk2.Nightlite.state;
lk2.Nightlite.model.recipes.forEach(function (r) { sk.owned[r.id] = true; });
sk.rareOn = false; sk.luck = 7; sk.nest = { left: 0, kind: 'sparkle', color: 1, pattern: 0 };
lk2.Nightlite.hatch();
assert(sk.reveal.refund && sk.reveal.used === 7 + 12, 'the egg used banked luck plus its sparkle boost');
assert.strictEqual(sk.luck, EG.sellLuck(sk.reveal.tier), 'the repeat banked luck by its tier');
store = {};
var sv = loadWindow(seeded(14), true), ss = sv.Nightlite.state;
ss.luck = 12.5; ss.eggsSeen = { sparkle: true, plain: true }; ss.nest = { left: 5, kind: 'rainbow', color: 3, pattern: 1 };
sv.Nightlite.saveProgress();
var sd = JSON.parse(store['nightlite.save']);
assert.strictEqual(sd.v, 6); assert.strictEqual(sd.luck, 12.5); assert.strictEqual(sd.nest.kind, 'rainbow'); assert(sd.eggs.indexOf('sparkle') >= 0);
var rl = loadWindow(seeded(14), true).Nightlite.state;
assert.strictEqual(rl.luck, 12.5); assert.strictEqual(rl.nest.kind, 'rainbow'); assert(rl.eggsSeen.sparkle && rl.eggsSeen.rainbow);
store = { 'nightlite.save': JSON.stringify({ v: 6, luck: 'lots', eggs: ['zzz', 'golden'], nest: { left: 3, kind: 'zzz', color: 99, pattern: -4 } }) };
var bd = loadWindow(seeded(14), true).Nightlite.state;
assert.strictEqual(bd.luck, 0); assert.strictEqual(bd.nest.kind, 'plain'); assert.strictEqual(bd.nest.color, 0); assert.strictEqual(bd.nest.pattern, 0); assert(bd.eggsSeen.golden && !bd.eggsSeen.zzz, 'junk egg data is cleaned');
store = {};

// ---- share code and save version
assert.strictEqual(R.encodeMix(['mossle', null, 'glimmow', null, null, null]), 'mossle..glimmow', 'trailing empty spots dropped');
assert.strictEqual(R.decodeMix('mossle..glimmow', 6).filter(Boolean).length, 2);
assert.strictEqual(R.decodeMix('mossle..glimmow', 6).length, 3);
assert.strictEqual(R.decodeMix('Mossle', 6), null, 'only lowercase ids');
assert.strictEqual(R.decodeMix('<script>', 6), null);
assert.strictEqual(R.decodeMix('a.b.c.d.e.f.g', 6), null, 'too many spots');
assert.strictEqual(R.decodeMix('a.a', 6), null, 'no repeats');
assert.strictEqual(R.decodeMix('..', 6), null, 'nothing on the stage');
assert.strictEqual(R.decodeMix(null, 6), null);
assert.strictEqual(R.compareVersions('v0.7.0', 'v0.6.0'), 1);
assert.strictEqual(R.compareVersions('v0.6.0', 'v0.6.0'), 0);
assert.strictEqual(R.compareVersions('v0.5.9', 'v0.6.0'), -1);
assert.strictEqual(R.compareVersions('v1.0.0', 'v0.9.9'), 1);
assert.strictEqual(R.compareVersions('junk', 'v0.6.0'), 0, 'unreadable version is not newer');
store = { 'nightlite.save': JSON.stringify({ v: 6, app: 'v0.9.0', sparks: 3, blends: ['mossweave', 'futurebeast'], found: ['mossle+skeinie', 'a+b'], rares: ['futurebeast_rare', 'Bad Id!'] }) };
var nw = loadWindow(seeded(8), true), ns = nw.Nightlite.state;
assert.strictEqual(ns.saveNewer, true, 'newer save noticed');
assert.strictEqual(ns.saveApp, 'v0.9.0');
nw.Nightlite.saveProgress();
var back = JSON.parse(store['nightlite.save']);
assert.strictEqual(back.app, 'v0.6.0', 'the save is stamped with this game version');
assert(back.blends.indexOf('futurebeast') >= 0 && back.found.indexOf('a+b') >= 0 && back.rares.indexOf('futurebeast_rare') >= 0, 'unknown entries from a newer game are kept');
assert(back.rares.indexOf('Bad Id!') < 0, 'unsafe ids are not kept');
store = { 'nightlite.save': JSON.stringify({ v: 5, sparks: 3, blends: ['futurebeast'] }) };
var ow = loadWindow(seeded(8), true);
assert.strictEqual(ow.Nightlite.state.saveNewer, false);
ow.Nightlite.saveProgress();
assert.strictEqual(JSON.parse(store['nightlite.save']).blends.indexOf('futurebeast'), -1, 'an old or equal save still drops unknown ids');
store = {};
var sh = loadWindow(seeded(9), true);
sh.Nightlite.state.slots = ['mossle', null, 'mossweave'];
assert.strictEqual(sh.Nightlite.shareUrl().split('&mix=')[1], 'mossle..mossweave');
assert.strictEqual(sh.Nightlite.shareUrl().split('?')[1].split('&')[0], 'w=garden', 'share link names the world');

// ---- stages: one per world, capacity 8 / 9 / 10, laid out as a scene (js/layout.js)
var LY = win.NightliteLayout;
assert(LY, 'layout.js loads');
assert.strictEqual(LY.cap('garden'), 8); assert.strictEqual(LY.cap('attic'), 9); assert.strictEqual(LY.cap('observatory'), 10);
assert.strictEqual(LY.cap('nope'), 8, 'unknown world falls back to the garden');
assert(LY.isWorld('attic') && !LY.isWorld('blends') && !LY.isWorld('__proto__') && !LY.isWorld(null));
['garden', 'attic', 'observatory'].forEach(function (wid) {
    var sp = LY.spots(wid), i, j, half, a2, b2, d2, minRatio = 9, minS = 9, maxS = 0;
    assert.strictEqual(sp.length, LY.cap(wid), wid + ' spot count');
    for (i = 0; i < sp.length; i++) {
        assert(sp[i].s >= 0.7 && sp[i].s <= 1, wid + ' depth scale in range');
        half = LY.SIZE_PCT * sp[i].s / 2;         // half the friend, percent of width
        assert(sp[i].x - half >= 0 && sp[i].x + half <= 100, wid + ' spot ' + i + ' fits across');
        assert(sp[i].y - half / LY.ASPECT >= 0 && sp[i].y + half / LY.ASPECT <= 100, wid + ' spot ' + i + ' fits down');
        minS = Math.min(minS, sp[i].s); maxS = Math.max(maxS, sp[i].s);
        // phone: scene about 340px wide, back friends 56px or more, front 72px or more, never under 44px
        assert(340 * LY.SIZE_PCT / 100 * sp[i].s >= 56, wid + ' smallest friend is 56px on a phone');
        for (j = i + 1; j < sp.length; j++) {
            a2 = sp[i].x - sp[j].x; b2 = (sp[i].y - sp[j].y) * 0.8;      // 1% of height is 0.8% of width at 5:4
            d2 = Math.sqrt(a2 * a2 + b2 * b2);
            assert(d2 > 12, wid + ' spots ' + i + ' and ' + j + ' are apart');
            minRatio = Math.min(minRatio, d2 / (LY.SIZE_PCT * (sp[i].s + sp[j].s) / 2));
        }
    }
    assert(minRatio >= 0.7, wid + ' friends overlap at most a little (ratio ' + minRatio.toFixed(2) + ')');
    assert(maxS === 1 || wid === 'observatory', wid + ' has a front row at full size');
    assert(340 * LY.SIZE_PCT / 100 * maxS >= 72, wid + ' front friends 72px or more');
});
assert(LY.shelves('attic').length === 3 && LY.shelves('garden').length === 0, 'attic has 3 shelf planks');
var sp0 = LY.spots('garden'); sp0[0].x = -5; assert.notStrictEqual(LY.spots('garden')[0].x, -5, 'spots returns a copy');

store = {};
var sg2 = loadWindow(seeded(21), true), N2 = sg2.Nightlite, st3 = N2.state, wi, bases12 = ['mossle', 'glimmow', 'puddlet', 'hedgey', 'clopsy', 'skeinie', 'tocklet', 'mallowhorn', 'dozemoon', 'glintwand', 'twirltail', 'ringhum'];
assert.deepStrictEqual(Object.keys(st3.stages), ['garden', 'attic', 'observatory']);
['garden', 'attic', 'observatory'].forEach(function (wid) {
    N2.enterWorld(wid);
    assert(st3.slots === st3.stages[wid], wid + ' S.slots is the active stage');
    for (wi = 0; wi < 12; wi++) N2.addChar(N2.charById[bases12[wi]]);
    assert.strictEqual(st3.slots.filter(Boolean).length, Math.min(12, LY.cap(wid)), wid + ' fills to its capacity');
    assert.strictEqual(st3.slots.length <= LY.cap(wid), true, wid + ' never holds more than its capacity');
});
assert.strictEqual(st3.stages.garden.filter(Boolean).length, 8);
assert.strictEqual(st3.stages.attic.filter(Boolean).length, 9);
assert.strictEqual(st3.stages.observatory.filter(Boolean).length, 10);
N2.enterWorld('garden');
assert.strictEqual(st3.slots.filter(Boolean).length, 8, 'the garden stage is kept while you visit another world');
assert.strictEqual(st3.slots[0], 'mossle');
assert.strictEqual(N2.shareUrl().split('?')[1].split('&')[0], 'w=garden');
N2.enterWorld('observatory');
assert.strictEqual(N2.shareUrl().split('?')[1].split('&')[0], 'w=observatory');
assert.strictEqual(N2.shareUrl().split('&mix=')[1].split('.').length, 10);

// shared links: w picks the world and its capacity, a bad w falls back to the garden, older 6 spot links still work
function linkApp(search) { store = {}; return loadWindow(seeded(22), true, function (w3) { w3.location = { search: search, href: 'http://x/index.html' + search }; }).Nightlite; }
var ln = linkApp('?w=attic&mix=mossle.glimmow.puddlet.hedgey.clopsy.skeinie.tocklet.mallowhorn.dozemoon');
assert.strictEqual(ln.state.world.id, 'attic');
assert.strictEqual(ln.state.stages.attic.filter(Boolean).length, 9, 'a 9 friend link fills the attic');
assert.strictEqual(ln.state.stages.garden.filter(Boolean).length, 0, 'the garden stays empty');
ln = linkApp('?w=garden&mix=mossle.glimmow.puddlet.hedgey.clopsy.skeinie.tocklet.mallowhorn.dozemoon');
assert.strictEqual(ln.state.stages.garden.filter(Boolean).length, 0, 'too many for the garden: link refused');
ln = linkApp('?mix=mossle.glimmow.puddlet.hedgey.clopsy.skeinie');
assert.strictEqual(ln.state.world.id, 'garden'); assert.strictEqual(ln.state.slots.filter(Boolean).length, 6, 'old 6 spot links work, w defaults to the garden');
ln = linkApp('?w=bogus&mix=mossle');
assert.strictEqual(ln.state.world.id, 'garden'); assert.strictEqual(ln.state.slots[0], 'mossle');
ln = linkApp('?w=observatory&mix=mossle..nopeling');
assert.strictEqual(ln.state.world.id, 'observatory'); assert.strictEqual(ln.state.slots.length, 10); assert.strictEqual(ln.state.slots[2], 'nopeling', 'unknown ids stay as outlines');

// Save then Load: the mix goes back on its own world's stage, a longer older save is cut to the capacity
store = {};
var sl2 = loadWindow(seeded(23), true), N3 = sl2.Nightlite;
N3.enterWorld('attic'); N3.addChar(N3.charById.clopsy); N3.addChar(N3.charById.skeinie);
sl2.document.getElementById = sl2.document.getElementById;          // (stub DOM: buttons are not clicked here)
store['nightlite.mix'] = JSON.stringify({ v: 6, world: 'observatory', bpm: 80, slots: ['dozemoon', null, 'ringhum'] });
N3.loadMix();
assert.strictEqual(N3.state.world.id, 'observatory', 'load enters the saved mix world');
assert.strictEqual(N3.state.stages.observatory[2], 'ringhum');
assert.strictEqual(N3.state.stages.attic[0], 'clopsy', 'the attic stage is untouched');
store['nightlite.mix'] = JSON.stringify({ v: 5, world: 'garden', bpm: 90, slots: ['mossle', 'glimmow', 'puddlet', 'hedgey', 'clopsy', 'skeinie', 'tocklet', 'mallowhorn', 'dozemoon', 'ringhum'] });
N3.loadMix();
assert.strictEqual(N3.state.stages.garden.filter(Boolean).length, 8, 'extra friends beyond the garden capacity are dropped');
store['nightlite.mix'] = JSON.stringify({ slots: ['mossle', 'glimmow'] });     // very old save: no world, no tempo
N3.loadMix();
assert.strictEqual(N3.state.slots.filter(Boolean).length, 2);
// remove, undo and reset act on the active world's stage only
N3.removeAt(0);
assert.strictEqual(N3.state.slots[0], null); assert.strictEqual(N3.state.slots.filter(Boolean).length, 1);
N3.undo();
assert.strictEqual(N3.state.slots[0], 'mossle', 'undo brings the friend back on the same stage');
assert(N3.state.slots === N3.state.stages.garden, 'undo keeps the alias');
N3.clearAll();
assert.strictEqual(N3.state.stages.garden.filter(Boolean).length, 0);
assert(N3.state.slots === N3.state.stages.garden, 'reset keeps the alias');
N3.enterWorld('attic');
assert.strictEqual(N3.state.stages.attic[0], 'clopsy', 'attic friends are still there');
N3.undo();                                        // history was cleared by entering the world
assert.strictEqual(N3.state.stages.attic[0], 'clopsy', 'nothing to undo after entering a world');

// ---- review fixes: prototype-key ids, hatch guard, luck cap
store = {};
var pk = loadWindow(seeded(15), true), pks = pk.Nightlite.state;
pk.Nightlite.enterWorld('garden');
pks.slots[0] = 'constructor'; pks.slots[1] = '__proto__'; pks.slots[2] = 'mossle';
pk.Nightlite.renderStage();
pk.Nightlite.removeAt(0);
pk.Nightlite.removeAt(1);
assert.strictEqual(pks.slots[2], 'mossle', 'prototype-key ids are only outlines and do not break the stage');
store = {};
var hg = loadWindow(seeded(16), true), hgs = hg.Nightlite.state, before = hgs.sparks;
hgs.nest = null; hg.Nightlite.hatch();
assert.strictEqual(hgs.reveal, null, 'hatch with an empty nest rolls nothing');
store = {};
var lc = loadWindow(seeded(17), true), lcs = lc.Nightlite.state;
lcs.luck = 55; lcs.nest = { left: 0, kind: 'golden', color: 0, pattern: 0 };
lc.Nightlite.hatch();
assert(lcs.reveal.used <= 60, 'shown luck is capped');
store = {};

// ---- review fixes
// vetting: every NightliteBlendsExtra_* set plus the base blends must build with no errors (this is how a new set is checked)
var vetted = [], gk;
for (gk in win) if (gk.indexOf('NightliteBlendsExtra_') === 0) vetted.push(gk);
assert(vetted.length >= 1, 'at least the CLAUDE set is loaded');
var vet = R.build(bases, R.collectBlends(win));
assert.strictEqual(vet.errors.length, 0, 'vetting: ' + vet.errors.join('; '));
assert.strictEqual(vet.valid.length, R.collectBlends(win).length, 'every blend is valid');

// a bad later set: duplicate ingredient set, cycle, a blend that needs a rejected one, base id clash, bad count
var badSet = R.build(bases, [
    { id: 'g1', blend: ['mossle', 'puddlet'] },
    { id: 'g2', blend: ['puddlet', 'mossle'] },          // same set as g1
    { id: 'c1', blend: ['c2', 'clopsy'] },
    { id: 'c2', blend: ['c1', 'skeinie'] },               // cycle with c1
    { id: 'd1', blend: ['g2', 'skeinie'] },               // needs a rejected blend
    { id: 'mossle', blend: ['clopsy', 'skeinie'] },       // clashes with a base id
    { id: 'ok1', blend: ['g1', 'hedgey'] }
]);
same(badSet.valid.map(function (c) { return c.id; }), ['g1', 'ok1'], 'only working blends stay: ' + badSet.errors.join('; '));
assert.strictEqual(badSet.errors.length, 5);
assert.strictEqual(badSet.match(['mossle', 'puddlet']), 'g1');
assert(!badSet.byId.g2 && !badSet.byId.c1 && !badSet.blendById.d1, 'rejected blends are nowhere in the tables');
assert.strictEqual(badSet.recipes.length, 2);
var selfCycle = R.build(bases, [{ id: 's1', blend: ['s1', 'mossle'] }, { id: 'a1', blend: ['a2', 'mossle'] }, { id: 'a2', blend: ['a3', 'mossle'] }, { id: 'a3', blend: ['a1', 'clopsy'] }]);
assert.strictEqual(selfCycle.valid.length, 0, 'self use and a 3 cycle are rejected');
// the app drops a bad extra from every list (eggs, tray, counts)
store = {};
var badApp = (function () {
    var warned = [];
    var w2 = loadWindow(seeded(7), true, function (w3) {
        w3.NightliteBlendsExtra_ZZ = { chars: [{ id: 'dupset', name: 'Dupset', blend: ['puddlet', 'mossle'], art: { body: 'round', color: '#aabbcc' }, synth: { kind: 'tone', seq: [60] } }] };
        w3.console = { warn: function (m) { warned.push(m); } };
    });
    return { w: w2, warned: warned };
})();
assert(badApp.w.Nightlite, 'app runs with a bad extra set');
assert(!badApp.w.Nightlite.charById.dupset, 'creature with a duplicate recipe does not exist');
assert(badApp.warned.length >= 1 && /dupset/.test(badApp.warned[0]), 'errors are visible in console.warn');
assert.strictEqual(badApp.w.NightliteBlends.chars.length, blends.length, 'blend list has no orphans');

// hints: a whole recipe inside the pick wins over "almost"
assert.strictEqual(model.hint(['mossle', 'puddlet', 'glimmow'], none, none).kind, 'many', 'Lilybop inside, glimmow is part of Nodlight: not "almost"');

// rare voice and noise friends are not louder than the base
function peakOf(spec) {
    var out = win.NightliteSynth.render(spec, 90, 11).data, pk = 0, q;
    for (q = 0; q < out.length; q++) if (Math.abs(out[q]) > pk) pk = Math.abs(out[q]);
    return pk;
}
var loudChecked = 0;
blends.forEach(function (b) {
    var base = peakOf(b.synth), rare = peakOf(R.rareSynth(b.synth));
    assert(rare <= base * 1.3 + 1e-9, b.id + ' rare peak ' + rare + ' vs base ' + base);
    assert(rare > 0.01, b.id + ' rare is not silent');
    loudChecked++;
});
['voice', 'noise'].forEach(function (kind) {
    var spec = kind === 'voice' ? { kind: 'voice', amp: 0.7, seq: [[72, 'o', 3], null, null, null, [76, 'o', 2], null, null, null, null, null, null, null, null, null, null, null] }
                                : { kind: 'noise', lp: 900, lfo: 2, depth: 0.7, amp: 0.5 };
    assert(peakOf(R.rareSynth(spec)) <= peakOf(spec) * 1.3 + 1e-9, kind + ' rare not louder');
    assert.strictEqual(R.rareSynth(spec).amp, spec.amp, kind + ' wrapper keeps the amp');
});
assert(loudChecked >= 21);

// drum voices: note-based voices only go up whole octaves, unpitched ones get 1.25
['kick', 'snare', 'hat', 'tick', 'clap', 'tom', 'shaker', 'pop', 'wood', 'drip', 'rustle', 'clop', 'click', 'whoosh', 'thrum'].forEach(function (v) {
    var spec = { kind: 'drum', voice: v, pitch: 1, amp: 0.6, pattern: 'x...x.x.x...x.x.' }, rs = R.rareSynth(spec), ratio = rs.pitch / spec.pitch;
    if (v === 'drip' || v === 'clop' || v === 'thrum') assert.strictEqual(ratio, 2, v + ' goes up an octave');
    else if (v === 'whoosh') assert.strictEqual(ratio, 1, 'whoosh is left alone');
    else assert.strictEqual(ratio, 1.25, v + ' is unpitched');
    assert(peakOf(rs) > 0.01 && peakOf(rs) <= peakOf(spec) * 1.3 + 1e-9, v + ' renders and is not louder');
});
var dr = R.rareSynth({ kind: 'drum', voice: 'drip', pitch: 0.8 });
assert.strictEqual(dr.pitch, 1.6);

// tamper test: hand edited saves
store = { 'nightlite.save': JSON.stringify({ v: 5, sparks: 1e9,
    blends: ['constructor', '__proto__', 'toString', 'hasOwnProperty', 5, null, 'mossweave'],
    found: ['constructor', '__proto__', 'valueOf', 'mossle+skeinie', { a: 1 }],
    rares: ['constructor', '__proto___rare', 'toString_rare', 'halohum_rare', 'mossweave_rare', 'mossweave_rare_rare', '_rare'] }) };
var tam = loadWindow(seeded(5), true).Nightlite.state;
same(Object.keys(tam.owned).sort(), ['mossweave'], 'only real blends owned');
same(Object.keys(tam.found), ['mossle+skeinie']);
same(Object.keys(tam.rares), ['mossweave_rare'], 'rares need the blend owned and a real id');
assert.strictEqual(tam.sparks, 99, 'sparks are capped');
assert.strictEqual(Object.prototype.polluted, undefined);
var longList = [], li;
for (li = 0; li < 250; li++) longList.push('nothing' + li);
longList[210] = 'halohum'; longList[10] = 'dewglint';
store = { 'nightlite.save': JSON.stringify({ v: 5, blends: longList, found: longList.slice(), rares: longList.map(function (x) { return x + '_rare'; }) }) };
var cap = loadWindow(seeded(5), true).Nightlite.state;
same(Object.keys(cap.owned), ['dewglint'], 'lists are cut at 200 entries');
store = { 'nightlite.save': JSON.stringify({ v: 5, blends: ['halohum'], found: [], rares: ['nothing_rare'] }) };
same(Object.keys(loadWindow(seeded(5), true).Nightlite.state.rares), [], 'unknown rare ignored');

// hatch while the pot screen is open does not break
store = {};
var pa = loadWindow(seeded(8), true);
pa.Nightlite.state.screen = 'pot';
pa.Nightlite.state.nest = { left: 0 };
pa.Nightlite.hatch();
assert.strictEqual(Object.keys(pa.Nightlite.state.owned).length, 1);

console.log('nightlite tests passed (' + checked + ' recipe orders, ' + model.recipes.length + ' recipes)');
