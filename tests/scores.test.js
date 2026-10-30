// Unit tests for js/scores.js. Run: node tests/scores.test.js
var assert = require('assert');
var path = require('path');
var passed = 0;
function ok(name, fn) {
    try { fn(); passed++; console.log('ok   ' + name); }
    catch (e) { console.log('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}
function mockStorage() {
    var data = {};
    return { getItem: function (k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
        setItem: function (k, v) { data[k] = String(v); }, removeItem: function (k) { delete data[k]; }, _d: data };
}
function fresh(blocked) {
    delete require.cache[require.resolve(path.join(__dirname, '../js/scores.js'))];
    delete global.localStorage;
    if (blocked) {
        Object.defineProperty(global, 'localStorage', { configurable: true, get: function () { throw new Error('blocked'); } });
    } else { global.localStorage = mockStorage(); }
    return require(path.join(__dirname, '../js/scores.js'));
}

ok('higher is better sorts high to low', function () {
    var S = fresh(); S.register('a', { title: 'A', higherIsBetter: true });
    S.submit('a', 10); S.submit('a', 30); S.submit('a', 20);
    assert.deepStrictEqual(S.list('a').map(function (e) { return e.value; }), [30, 20, 10]);
    assert.strictEqual(S.best('a'), 30);
});
ok('lower is better sorts low to high', function () {
    var S = fresh(); S.register('t', { title: 'T', unit: 'seconds', higherIsBetter: false });
    S.submit('t', 90); S.submit('t', 45); S.submit('t', 60);
    assert.deepStrictEqual(S.list('t').map(function (e) { return e.value; }), [45, 60, 90]);
    assert.strictEqual(S.best('t'), 45);
});
ok('keeps top 5 by default and trims', function () {
    var S = fresh(); S.register('a', { title: 'A' });
    for (var i = 1; i <= 9; i++) { S.submit('a', i * 10); }
    var l = S.list('a');
    assert.strictEqual(l.length, 5); assert.strictEqual(l[0].value, 90); assert.strictEqual(l[4].value, 50);
    var r = S.submit('a', 5); assert.strictEqual(r.rank, null); assert.strictEqual(r.isBest, false);
});
ok('max is configurable', function () {
    var S = fresh(); S.register('a', { title: 'A', max: 2 });
    S.submit('a', 1); S.submit('a', 2); S.submit('a', 3);
    assert.strictEqual(S.list('a').length, 2);
});
ok('ties keep the older score on top and are monotonic', function () {
    var S = fresh(); S.register('a', { title: 'A' });
    S.submit('a', 50, { label: 'first' }); var r = S.submit('a', 50, { label: 'second' });
    var l = S.list('a');
    assert.strictEqual(l[0].label, 'first'); assert.strictEqual(r.rank, 2); assert.strictEqual(r.isBest, false);
    assert.ok(l[1].time > l[0].time);
});
ok('personal best detection and previousBest', function () {
    var S = fresh(); S.register('a', { title: 'A' });
    var r1 = S.submit('a', 10); assert.deepStrictEqual([r1.isBest, r1.rank, r1.previousBest], [true, 1, null]);
    var r2 = S.submit('a', 25); assert.deepStrictEqual([r2.isBest, r2.rank, r2.previousBest], [true, 1, 10]);
    var r3 = S.submit('a', 15); assert.deepStrictEqual([r3.isBest, r3.rank, r3.previousBest], [false, 2, 25]);
});
ok('lower-is-better personal best', function () {
    var S = fresh(); S.register('t', { title: 'T', higherIsBetter: false, unit: 'moves' });
    S.submit('t', 20); var r = S.submit('t', 14);
    assert.strictEqual(r.isBest, true); assert.strictEqual(r.previousBest, 20);
    assert.strictEqual(S.submit('t', 30).isBest, false);
});
ok('zero, negative, NaN and huge values are ignored', function () {
    var S = fresh(); S.register('a', { title: 'A' });
    [0, -5, NaN, Infinity, 'abc', 1e15, null].forEach(function (v) { assert.strictEqual(S.submit('a', v).rank, null); });
    assert.strictEqual(S.list('a').length, 0);
});
ok('bad game ids are refused', function () {
    var S = fresh();
    ['__proto__', 'constructor', '', '<b>', 'a b', 5, null].forEach(function (id) {
        assert.strictEqual(S.register(id, {}), false); assert.strictEqual(S.submit(id, 5).rank, null);
    });
});
ok('reset one game and reset all', function () {
    var S = fresh(); S.register('a', { title: 'A' }); S.register('b', { title: 'B' });
    S.submit('a', 1); S.submit('b', 2);
    S.reset('a'); assert.strictEqual(S.best('a'), null); assert.strictEqual(S.best('b'), 2);
    S.resetAll(); assert.strictEqual(S.best('b'), null);
    assert.strictEqual(S.listAll().length, 2, 'game titles stay registered');
});
ok('survives a reload (persisted)', function () {
    var S = fresh(); S.register('a', { title: 'A' }); S.submit('a', 77);
    var saved = global.localStorage._d['fong.scores.v1'];
    assert.ok(saved);
    delete require.cache[require.resolve('../js/scores.js')];
    var ls = global.localStorage; var S2 = require('../js/scores.js');
    assert.strictEqual(global.localStorage, ls); assert.strictEqual(S2.best('a'), 77);
});
ok('export then import round trip', function () {
    var S = fresh(); S.register('a', { title: 'A' }); S.register('t', { title: 'T', unit: 'seconds', higherIsBetter: false });
    S.submit('a', 5, { label: 'x', extra: { level: 3 } }); S.submit('a', 9); S.submit('t', 61);
    var json = S.exportJSON();
    var before = JSON.stringify(S.listAll());
    S.resetAll(); assert.strictEqual(S.best('a'), null);
    var r = S.importJSON(json, { mode: 'replace' });
    assert.strictEqual(r.ok, true); assert.strictEqual(r.added, 3);
    assert.strictEqual(JSON.stringify(S.listAll()), before);
});
ok('merge adds, does not duplicate; replace drops others', function () {
    var S = fresh(); S.register('a', { title: 'A' }); S.submit('a', 10);
    var json = S.exportJSON();
    S.submit('a', 20);
    var m = S.importJSON(json, { mode: 'merge' });
    assert.strictEqual(m.ok, true); assert.strictEqual(m.added, 0);
    assert.deepStrictEqual(S.list('a').map(function (e) { return e.value; }), [20, 10]);
    var r = S.importJSON(json, { mode: 'replace' });
    assert.deepStrictEqual(S.list('a').map(function (e) { return e.value; }), [10]);
});
ok('dryRun changes nothing', function () {
    var S = fresh(); S.register('a', { title: 'A' }); S.submit('a', 10);
    var json = S.exportJSON(); S.resetAll();
    var r = S.importJSON(json, { mode: 'merge', dryRun: true });
    assert.strictEqual(r.ok, true); assert.strictEqual(r.added, 1); assert.strictEqual(S.best('a'), null);
});
ok('malformed, wrong format, wrong version rejected', function () {
    var S = fresh();
    ['', 'nope', '[]', '123', 'null', '{"format":"x","version":1,"games":{}}',
        '{"format":"fong-scores","version":2,"games":{}}', '{"format":"fong-scores","version":1}',
        '{"format":"fong-scores","version":1,"games":[]}'].forEach(function (s) {
        var r = S.importJSON(s); assert.strictEqual(r.ok, false, s); assert.ok(r.errors.length > 0);
    });
    assert.strictEqual(S.importJSON(42).ok, false);
});
ok('oversized file rejected', function () {
    var S = fresh(); var big = '{"format":"fong-scores","version":1,"games":{},"pad":"' + new Array(270000).join('a') + '"}';
    var r = S.importJSON(big); assert.strictEqual(r.ok, false); assert.ok(/too big/.test(r.errors[0]));
});
ok('__proto__ / constructor keys rejected', function () {
    var S = fresh();
    var r = S.importJSON('{"format":"fong-scores","version":1,"games":{"a":{"entries":[]}},"__proto__":{"x":1}}');
    assert.strictEqual(r.ok, false);
    r = S.importJSON('{"format":"fong-scores","version":1,"games":{"constructor":{"entries":[]}}}');
    assert.strictEqual(r.ok, false);
    assert.strictEqual(({}).x, undefined);
});
ok('hostile content is kept as text only and clamped', function () {
    var S = fresh();
    var evil = { format: 'fong-scores', version: 1, games: {
        'evil-1': { title: '<script>alert(1)</script>' + new Array(200).join('x'), unit: 'bogus', higherIsBetter: true, max: 999, entries: [
            { v: 10, label: '<img src=x onerror=alert(1)>', t: 5 },
            { v: -1, label: 'neg', t: 1 }, { v: 'x' }, { v: 1e99 }, null, 7,
            { v: 20, label: 'ok', t: 6, extra: { __proto__: 1, a: '<b>', deep: { z: 1 } } }] },
        '<bad id>': { entries: [] }, 'toString': { entries: [] } } };
    var r = S.importJSON(JSON.stringify(evil));
    assert.strictEqual(r.ok, true); assert.strictEqual(r.added, 2); assert.ok(r.skipped >= 5);
    var g = S.listAll().filter(function (x) { return x.id === 'evil-1'; })[0];
    assert.ok(g.title.length <= 60); assert.ok(g.title.indexOf('<script>') === 0, 'kept as plain text for textContent');
    assert.strictEqual(g.unit, 'points'); assert.strictEqual(g.max, 10);
    assert.strictEqual(g.scores.length, 2);
    assert.strictEqual(g.scores[0].value, 20);
    var ids = S.listAll().map(function (x) { return x.id; });
    assert.ok(ids.indexOf('evil-1') >= 0 && ids.indexOf('<bad id>') < 0);
});
ok('too many games rejected', function () {
    var S = fresh(); var games = {}; for (var i = 0; i < 250; i++) { games['g' + i] = { entries: [] }; }
    assert.strictEqual(S.importJSON(JSON.stringify({ format: 'fong-scores', version: 1, games: games })).ok, false);
});
ok('unknown games are kept (sanitised) on import', function () {
    var S = fresh();
    var r = S.importJSON(JSON.stringify({ format: 'fong-scores', version: 1, games: { 'future-game': { title: 'Future', entries: [{ v: 3, t: 1 }] } } }));
    assert.strictEqual(r.ok, true); assert.strictEqual(S.best('future-game'), 3);
});
ok('storage blocked: still works from memory and says so', function () {
    var S = fresh(true); S.register('a', { title: 'A' });
    var r = S.submit('a', 12); assert.strictEqual(r.isBest, true);
    assert.strictEqual(S.best('a'), 12); assert.strictEqual(S.isPersistent(), false);
    assert.strictEqual(S.importJSON(S.exportJSON(), { mode: 'merge' }).ok, true);
});
ok('corrupt stored data starts clean', function () {
    var S = fresh(); global.localStorage.setItem('fong.scores.v1', '{not json');
    assert.deepStrictEqual(S.list('a'), []); assert.strictEqual(S.submit('a', 4).isBest, true);
});
ok('format helper', function () {
    var S = fresh();
    assert.strictEqual(S.format(1240, 'points'), '1,240'); assert.strictEqual(S.format(65, 'seconds'), '1:05');
    assert.strictEqual(S.format(1, 'moves'), '1 move'); assert.strictEqual(S.format(12, 'moves'), '12 moves');
    assert.strictEqual(S.format(4, 'level'), 'Level 4');
});
ok('celebrate only on a best and never throws without FongCheer', function () {
    var S = fresh();
    assert.strictEqual(S.celebrate({ isBest: false }), false);
    assert.strictEqual(S.celebrate({ isBest: true }), true);
});
console.log('\n' + passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
