// Review fixes for js/gdrive-backup.js and js/gamesaves.js. Run: node tests/gdrive-review.test.js
var assert = require('assert'), F = require('./gdrive-fake.js');
function T(o) { o = o || {}; o.auto = false; return F.makeTab(o); }
function connect(w, cb) { w.FongGDrive.connect(function (e) { cb(e); }); }
var steps = [];

steps.push(function (next) {   // 2: connect timeout and supersede
    var w = T(); w.tokenHang = true; w.FongGDrive._connectMs = 30;
    var first = null, t0 = Date.now();
    connect(w, function (e) { first = e; });
    setTimeout(function () {
        connect(w, function (e2) {   // a second tap replaces the first one
            assert(first && first.code === 'superseded', 'first replaced');
            assert(e2 && e2.code === 'timeout' && Date.now() - t0 < 2000);
            w.tokenHang = false;
            connect(w, function (e3) { assert(!e3 && w.FongGDrive.isConnected()); next(); });
        });
    }, 5);
});

steps.push(function (next) {   // 3: one script tag even after the timeout
    var w = T(); w.gisHang = true; w.FongGDrive._gisMs = 20; w.FongGDrive._connectMs = 500;
    connect(w, function (e) {
        assert(e && e.code === 'offline'); assert.strictEqual(w.gisLoads, 1);
        connect(w, function (e2) {
            assert(e2); assert.strictEqual(w.gisLoads, 1, 'no second script tag');
            next();
        });
    });
});

steps.push(function (next) {   // 4: disconnect always calls back
    var w = T(); w.revokeHang = true; w.FongGDrive._disconnectMs = 20;
    connect(w, function () {
        w.FongGDrive.disconnect(function (e, r) { assert(!e && r.connected === false && !w.FongGDrive.isConnected()); next(); });
    });
});

steps.push(function (next) {   // 5: create is not retried on 5xx, but is retried on 429
    var w = T(); w.FongGDrive._retryMs = 1; w.store['nightlite.save'] = '{"v":1}';
    connect(w, function () {
        w.nextStatus = [{ status: 503 }];
        w.FongGDrive.backupNow('nightlite-choir', function (e) {
            assert(e && e.code === 'busy');
            assert.strictEqual(w.reqs.filter(function (r) { return r.opts.method === 'POST'; }).length, 1, 'one POST only');
            w.reqs.length = 0; w.nextStatus = [{ status: 429 }];
            w.FongGDrive.backupNow('nightlite-choir', function (e2) {
                assert(!e2); assert.strictEqual(w.reqs.filter(function (r) { return r.opts.method === 'POST'; }).length, 2, '429 retried');
                assert.strictEqual(w.drive.files.length, 1);
                next();
            });
        });
    });
});

steps.push(function (next) {   // 6: restore checks Content-Length before reading
    var w = T(); w.FongGDrive._retryMs = 1;
    connect(w, function () {
        w.nextStatus = [{ status: 200, body: 'x', headers: { 'content-length': String(600000 * 4 + 1) } }];
        w.FongGDrive.restore('abc', function (e) { assert(e && /too big/.test(e.message)); next(); });
    });
});

steps.push(function (next) {   // label sanitizing and listing
    var w = T(), D = w.FongGDrive;
    assert.strictEqual(D.cleanLabel('  Hi   there <script> '), 'Hi there script');
    assert.strictEqual(D.cleanLabel(new Array(60).join('a')).length, 30);
    assert.strictEqual(D.cleanLabel(5), '');
    w.store['nightlite.save'] = '{"v":1}';
    connect(w, function () {
        D.backupNow('nightlite-choir', function (e) {
            assert(!e);
            D.list(function (e2, items) {
                assert(!e2 && items.length === 1 && items[0].type === 'manual' && items[0].label === 'Level 5 done');
                assert(/^fong-nightlite-choir-\d{4}/.test(items[0].name) && items[0].name.indexOf('Level') < 0, 'label is not in the file name');
                next();
            });
        }, { label: 'Level 5 done' });
    });
});

steps.push(function (next) {   // 7 and 8: odd prefixed keys warn, list keeps prefixes separate
    var w = T(), G = w.FongGameSaves;
    w.store['j_score_a'] = '5'; w.store['j_history_bad key'] = '[1]'; w.store['j_best_' + new Array(130).join('z')] = '1';
    var r = G.exportGame('j-quiz');
    assert(r.warnings.length === 1 && /cannot be restored/.test(r.warnings[0]), r.warnings.join('|'));
    assert(Object.keys(JSON.parse(r.text).data).join() === 'j_score_a');
    assert(G.exportAll().warnings.length === 1 && G.exportWarnings().length === 1);
    var j = G.list().filter(function (g) { return g.id === 'j-quiz'; })[0];
    assert.deepEqual(j.keys, ['j_muted', 'j_category_order']); assert.deepEqual(j.prefixes, ['j_history_', 'j_score_', 'j_best_']);
    connect(w, function () {
        w.FongGDrive.backupNow('j-quiz', function (e) {
            assert(e && e.code === 'toobig' && /cannot be restored/.test(e.message)); assert.strictEqual(w.reqs.length, 0);
            next();
        });
    });
});

steps.push(function (next) {   // 9: prefix cap on import and export warning
    var w = T(), G = w.FongGameSaves, data = {}, i;
    for (i = 0; i < 250; i++) { data['j_score_p' + i] = '1'; w.store['j_history_q' + i] = '[1]'; }
    var text = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'j-quiz', data: data });
    var r = G.importJSON(text, { mode: 'replace' });
    assert(r.ok && r.applied === 200 && r.skipped === 50, r.applied + ' ' + r.skipped);
    assert(G.exportGame('j-quiz').warnings.some(function (x) { return /more than the 200/.test(x); }));
    next();
});

steps.push(function (next) {   // blank id: no new module calls anything
    var w = T({ clientId: '' });
    assert(!w.FongGDrive.isConfigured());
    w.FongGDrive.connect(function (e) { assert(e.code === 'notconfigured'); assert.strictEqual(w.gisLoads, 0); next(); });
});

F.seqRun(steps, function () { console.log('gdrive review tests passed'); process.exit(0); });
