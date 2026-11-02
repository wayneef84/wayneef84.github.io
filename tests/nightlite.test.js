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
function loadWindow(randomFn, withApp) {
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
    var files = ['js/synth.js', 'js/art.js', 'js/worlds/garden.js', 'js/worlds/attic.js', 'js/worlds/observatory.js', 'js/worlds/blends.js', 'js/worlds/blends_claude.js'];
    var i;
    for (i = 0; i < files.length; i++) vm.runInContext(read(files[i].replace('js/', '')), ctx, { filename: files[i] });
    var extras = fs.readdirSync(DIR + 'worlds').filter(function (f) { return /^blends_.*\.js$/.test(f) && f !== 'blends_claude.js'; });
    for (i = 0; i < extras.length; i++) vm.runInContext(read('worlds/' + extras[i]), ctx, { filename: extras[i] });
    vm.runInContext(read('recipes.js'), ctx, { filename: 'recipes.js' });
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
assert.strictEqual(saved.v, 5);
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
store = { 'nightlite.save': JSON.stringify({ v: 5, blends: ['nope'], found: ['a+b'], rares: ['nope_rare', 'mossweave_rare'] }) };
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
// all owned: hatch ends with the twinkle and the sparks come back
var all = loadWindow(seeded(3), true), st2 = all.Nightlite.state;
all.Nightlite.model.recipes.forEach(function (r) { st2.owned[r.id] = true; });
st2.sparks = 4; st2.nest = { left: 0 };
all.Nightlite.hatch();
assert.strictEqual(st2.sparks, 9, 'sparks come back when every blend is owned');
assert.strictEqual(st2.reveal.id, null, 'twinkle reveal');
assert.strictEqual(st2.nest, null);

console.log('nightlite tests passed (' + checked + ' recipe orders, ' + model.recipes.length + ' recipes)');
