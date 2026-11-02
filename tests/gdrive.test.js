// Unit tests for js/gdrive-backup.js and the prefix support in js/gamesaves.js. Run: node tests/gdrive.test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');

function makeEnv(clientId) {
    var store = {}, win = { window: null };
    win.window = win;
    win.localStorage = {
        get length() { return Object.keys(store).length; },
        key: function (i) { return Object.keys(store)[i] || null; },
        removeItem: function (k) { delete store[k]; },
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
        setItem: function (k, v) { store[k] = String(v); }
    };
    win.store = store;
    win.FONG_GDRIVE_CLIENT_ID = clientId;
    win.navigator = { onLine: true };
    win.setTimeout = setTimeout; win.clearTimeout = clearTimeout;
    win.reqs = []; win.files = []; win.nextStatus = []; win.gisLoads = 0; win.gisFail = false; win.tokenResp = { access_token: 'tok-123', expires_in: 3600 };
    win.tokenErr = null; win.revoked = 0; var seq = 0;
    win.document = {
        head: { appendChild: function (s) { win.gisLoads++; s.parentNode = win.document.head; setTimeout(function () {
            if (win.gisFail) { s.onerror(); return; }
            win.google = { accounts: { oauth2: {
                initTokenClient: function (c) { return { requestAccessToken: function () { setTimeout(function () { if (win.tokenErr) { c.error_callback(win.tokenErr); } else { c.callback(win.tokenResp); } }, 0); } }; },
                hasGrantedAllScopes: function (r) { return r.scope_ok !== false; },
                revoke: function (t, cb) { win.revoked++; cb({}); }
            } } };
            s.onload();
        }, 0); }, removeChild: function () {} },
        createElement: function () { return {}; }
    };
    win.fetch = function (url, opts) {
        win.reqs.push({ url: url, opts: opts });
        var forced = win.nextStatus.shift();
        function resp(status, body) { return Promise.resolve({ status: status, text: function () { return Promise.resolve(body); } }); }
        if (forced === 'throw') { return Promise.reject(new Error('net')); }
        if (forced) { return resp(forced.status, forced.body || ''); }
        var m = opts.method || 'GET', u = url.split('?')[0];
        if (m === 'POST') {
            var meta = JSON.parse(opts.body.split('\r\n\r\n')[1].split('\r\n--')[0]);
            var id = 'id' + (++seq);
            win.files.push({ id: id, name: meta.name, createdTime: new Date(Date.now() + seq * 1000).toISOString(), size: String(opts.body.length), content: opts.body.split('\r\n\r\n')[2].split('\r\n--')[0] });
            return resp(200, JSON.stringify({ id: id, name: meta.name }));
        }
        if (m === 'DELETE') { var did = u.split('/').pop(); win.files = win.files.filter(function (f) { return f.id !== did; }); return resp(204, ''); }
        if (url.indexOf('alt=media') > 0) { var gid = u.split('/').pop(), f = win.files.filter(function (x) { return x.id === gid; })[0]; return f ? resp(200, f.content) : resp(404, '{}'); }
        var sorted = win.files.slice().sort(function (a, b) { return a.createdTime < b.createdTime ? 1 : -1; });
        return resp(200, JSON.stringify({ files: sorted.map(function (f) { return { id: f.id, name: f.name, createdTime: f.createdTime, size: f.size }; }).concat([{ id: 'zz', name: 'other.txt' }]) }));
    };
    var ctx = vm.createContext({ window: win, Date: Date, Math: Math, JSON: JSON, Promise: Promise, setTimeout: setTimeout, clearTimeout: clearTimeout, encodeURIComponent: encodeURIComponent, isFinite: isFinite, Number: Number, String: String, Object: Object });
    ['js/gamesaves.js', 'js/gdrive-backup.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx); });
    return win;
}

function seqRun(steps, done) { var i = 0; (function next() { if (i >= steps.length) { done(); return; } steps[i++](next); })(); }
function connect(w, cb) { w.FongGDrive.connect(function (e, r) { cb(e, r); }); }

var G, D;

// ---- J Quiz prefixes (sync) ----
(function () {
    var w = makeEnv(''); G = w.FongGameSaves;
    w.store['j_muted'] = 'true'; w.store['j_category_order'] = '["a"]'; w.store['j_history_pack1'] = '[1,2]'; w.store['j_score_pack1'] = '40'; w.store['j_best_pack1'] = '99'; w.store['other'] = 'x';
    var exp = G.exportGame('j-quiz');
    var data = JSON.parse(exp.text).data;
    assert.deepEqual(Object.keys(data).sort(), ['j_best_pack1', 'j_category_order', 'j_history_pack1', 'j_muted', 'j_score_pack1']);
    assert(!data.other);
    assert(G.exportAll().text.indexOf('j_history_pack1') > 0);
    // import into empty store, replace leaves absent keys alone
    var w2 = makeEnv(''); w2.store['j_history_keep'] = '[9]';
    var r = w2.FongGameSaves.importJSON(exp.text, { mode: 'replace' });
    assert(r.ok && r.applied === 5 && w2.store['j_score_pack1'] === '40' && w2.store['j_history_keep'] === '[9]');
    // bad keys under a good prefix, wrong prefix, bad json, long key
    var bad = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'j-quiz', data: {
        'j_history_a b': '[1]', 'j_history_<x>': '[1]', 'j_history_': '[1]', 'x_history_a': '[1]', 'j_history_ok': '{bad', 'j_score_ok': '12', 'j_history_ok2': '[1]',
        'j_history_': '[1]', 'j_best_ok': 5 } });
    r = w2.FongGameSaves.importJSON(bad, { mode: 'replace' });
    assert(r.ok && r.applied === 2, 'only j_score_ok and j_history_ok2 apply, got ' + r.applied);
    assert(w2.store['j_score_ok'] === '12' && w2.store['j_history_ok2'] && !w2.store['x_history_a'] && !w2.store['j_history_a b'] && !w2.store['j_history_ok'] && !w2.store['j_best_ok']);
    var longk = 'j_score_' + new Array(120).join('a');
    var lk = {}; lk[longk] = '1';
    assert(!w2.FongGameSaves.importJSON(JSON.stringify({ format: 'fong-game-save', version: 1, game: 'j-quiz', data: lk })).ok);
    // j_muted is not json, accepted as text
    assert(w2.FongGameSaves.importJSON(JSON.stringify({ format: 'fong-game-save', version: 1, game: 'j-quiz', data: { j_muted: 'true' } }), { mode: 'replace' }).ok);
})();

var steps = [];

steps.push(function (next) {   // blank client id
    var w = makeEnv(''); D = w.FongGDrive;
    assert(!D.isConfigured() && !D.isConnected());
    D.connect(function (e) {
        assert(e && e.code === 'notconfigured' && e.message === 'Not set up yet. See docs/GDRIVE_SETUP.md');
        assert.strictEqual(w.gisLoads, 0, 'no Google script when blank');
        D.backupNow('all', function (e2) { assert(e2 && e2.code === 'auth'); assert.strictEqual(w.reqs.length, 0); next(); });
    });
});

steps.push(function (next) {   // connect, upload shape, list, restore, no token in storage
    var w = makeEnv('abc.apps.googleusercontent.com'); D = w.FongGDrive; G = w.FongGameSaves;
    assert(D.isConfigured());
    assert.strictEqual(w.gisLoads, 0, 'GIS not loaded before Connect');
    w.store['nightlite.save'] = '{"v":1,"sparks":5}';
    D.backupNow('all', function (e0) {
        assert(e0 && e0.code === 'auth');
        connect(w, function (e, r) {
            assert(!e && D.isConnected() && w.gisLoads === 1);
            D.backupNow('nightlite-choir', function (e1, up) {
                assert(!e1, e1 && e1.message);
                var post = w.reqs.filter(function (q) { return q.opts.method === 'POST'; })[0];
                assert(post.url.indexOf('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart') === 0);
                assert.strictEqual(post.opts.headers.Authorization, 'Bearer tok-123');
                assert(/^multipart\/related; boundary=/.test(post.opts.headers['Content-Type']));
                assert(post.opts.body.indexOf('"parents":["appDataFolder"]') > 0);
                assert(/"name":"fong-nightlite-choir-\d{4}-\d\d-\d\dT[\d:.]+Z\.json"/.test(post.opts.body));
                var all = JSON.stringify(w.store);
                assert(all.indexOf('tok-123') < 0, 'token never in storage');
                D.list(function (e2, items) {
                    assert(!e2 && items.length === 1 && items[0].scope === 'nightlite-choir' && items[0].id === up.id && items[0].size > 0);
                    var lq = w.reqs[w.reqs.length - 1].url;
                    assert(lq.indexOf('spaces=appDataFolder') > 0 && lq.indexOf('createdTime%20desc') > 0);
                    D.restore(items[0].id, function (e3, text) {
                        assert(!e3);
                        w.store['nightlite.save'] = '{"v":1,"sparks":1}';
                        var dry = G.importJSON(text, { mode: 'replace', dryRun: true });
                        assert(dry.ok && w.store['nightlite.save'] === '{"v":1,"sparks":1}');
                        assert(G.importJSON(text, { mode: 'replace' }).ok && w.store['nightlite.save'] === '{"v":1,"sparks":5}');
                        D.remove(items[0].id, function (e4) { assert(!e4 && w.files.length === 0); next(); });
                    });
                });
            });
        });
    });
});

steps.push(function (next) {   // too big refused, empty refused
    var w = makeEnv('abc'); D = w.FongGDrive;
    w.store['nightlite.save'] = '{"a":"' + new Array(200010).join('x') + '"}';
    connect(w, function () {
        D.backupNow('nightlite-choir', function (e) {
            assert(e && e.code === 'toobig'); assert(!w.reqs.length);
            delete w.store['nightlite.save'];
            D.backupNow('all', function (e2) { assert(e2 && e2.code === 'empty'); assert(!w.reqs.length); next(); });
        });
    });
});

steps.push(function (next) {   // prune keeps newest 10 per scope, other scope untouched
    var w = makeEnv('abc'); D = w.FongGDrive;
    w.store['slots'] = 'x'; w.store['fong.slots.v4'] = '{"c":1}'; w.store['nightlite.vol'] = '3';
    connect(w, function () {
        var i = 0, last;
        (function loop() {
            if (i === 12) {
                var slots = w.files.filter(function (f) { return /^fong-slots-/.test(f.name); });
                var other = w.files.filter(function (f) { return /^fong-nightlite-choir-/.test(f.name); });
                assert.strictEqual(slots.length, 10); assert.strictEqual(other.length, 1);
                assert(slots.some(function (f) { return f.id === last; }), 'newest kept');
                next(); return;
            }
            D.backupNow(i === 5 ? 'nightlite-choir' : 'slots', function (e, r) { assert(!e, e && e.message); last = i === 5 ? last : r.id; i++; setTimeout(loop, 2); });
        })();
    });
});

steps.push(function (next) {   // 401, 403, 429 retry, 5xx twice, offline, quota
    var w = makeEnv('abc'); D = w.FongGDrive; D._retryMs = 1;
    connect(w, function () {
        w.nextStatus = [{ status: 429 }];
        D.list(function (e, items) {
            assert(!e && w.reqs.length === 2, '429 retried once');
            w.reqs.length = 0; w.nextStatus = [{ status: 503 }, { status: 503 }];
            D.list(function (e2) {
                assert(e2 && e2.code === 'busy' && w.reqs.length === 2);
                w.nextStatus = [{ status: 403, body: JSON.stringify({ error: { errors: [{ reason: 'accessNotConfigured' }] } }) }];
                D.list(function (e3) {
                    assert(e3 && e3.code === 'forbidden' && /Drive API/.test(e3.message));
                    w.nextStatus = [{ status: 403, body: JSON.stringify({ error: { errors: [{ reason: 'storageQuotaExceeded' }] } }) }];
                    D.list(function (e4) {
                        assert(e4 && e4.code === 'quota');
                        w.navigator.onLine = false;
                        D.list(function (e5) {
                            assert(e5 && e5.code === 'offline');
                            w.navigator.onLine = true; w.nextStatus = ['throw'];
                            D.list(function (e6) {
                                assert(e6 && e6.code === 'network');
                                w.nextStatus = [{ status: 401 }];
                                D.list(function (e7) {
                                    assert(e7 && e7.code === 'auth' && !D.isConnected() && /Connect/.test(e7.message));
                                    next();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

steps.push(function (next) {   // connect failures and disconnect
    var w = makeEnv('abc'); D = w.FongGDrive;
    w.gisFail = true;
    connect(w, function (e) {
        assert(e && e.code === 'offline');
        w.gisFail = false; w.tokenErr = { type: 'popup_failed_to_open' };
        connect(w, function (e2) {
            assert(e2 && e2.code === 'popup');
            w.tokenErr = { type: 'popup_closed' };
            connect(w, function (e3) {
                assert(e3 && e3.code === 'closed');
                w.tokenErr = null; w.tokenResp = { error: 'access_denied' };
                connect(w, function (e4) {
                    assert(e4 && e4.code === 'denied');
                    w.tokenResp = { access_token: 'tok-9', scope_ok: false };
                    connect(w, function (e5) {
                        assert(e5 && e5.code === 'scope' && !D.isConnected());
                        w.tokenResp = { access_token: 'tok-9', expires_in: 3600 };
                        connect(w, function (e6) {
                            assert(!e6 && D.isConnected());
                            D.disconnect(function () { assert(!D.isConnected() && w.revoked === 1); next(); });
                        });
                    });
                });
            });
        });
    });
});

seqRun(steps, function () { console.log('gdrive tests passed'); });
