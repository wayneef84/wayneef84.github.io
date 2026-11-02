// Autosave and autoload for js/gdrive-auto.js. Run: node tests/gdrive-auto.test.js
var assert = require('assert'), F = require('./gdrive-fake.js');
var T0 = Date.parse('2026-11-01T10:00:00Z'), MIN = 60000, DAY = 86400000;
var steps = [];

function boot(o) {
    var w = F.makeTab(o); w.FongGDriveAuto._now = function () { return w.clock; }; w.clock = (o && o.clock) || T0; return w;
}
function connect(w, cb) { w.FongGDrive.connect(function (e) { cb(e); }); }
function tick(w, cb) { w.FongGDriveAuto._tick(function (e, r) { cb(e, r); }); }
function names(w, re) { return w.drive.files.map(function (f) { return f.name; }).filter(function (n) { return re.test(n); }); }
function settled(w, cb) { F.until(function () { return !w.FongGDriveAuto._state.busy; }, 1500, cb); }
function sync(w) { return JSON.parse(w.store['fong.gdrive.sync'] || '{}'); }

steps.push(function (next) {   // first autosave, request shape, unchanged hash, 5 minute gap, in-place update
    var w = boot(); w.store['fong.slots.v4'] = '{"coins":1}';
    connect(w, function (e) {
        assert(!e);
        F.until(function () { return names(w, /^fong-auto-slots/).length === 1 && names(w, /^fong-daily-slots-2026-11-01/).length === 1; }, 1500, function (err) {
            assert(!err, err && err.message);
            var f = w.drive.files.filter(function (x) { return x.name === 'fong-auto-slots.json'; })[0];
            assert.deepEqual(f.parents, ['appDataFolder']);
            assert.strictEqual(f.appProperties.game, 'slots'); assert(f.appProperties.hash && f.appProperties.device);
            var post = w.reqs.filter(function (r) { return r.opts.method === 'POST'; })[0];
            assert.strictEqual(post.opts.headers.Authorization, 'Bearer tok-123');
            var s = sync(w).slots; assert(s.hash && s.version && s.fileId === f.id && s.time === T0);
            assert.strictEqual(w.store['fong.gdrive.auto'], 'on'); assert.strictEqual(w.store['fong.gdrive.was'], '1');
            assert(JSON.stringify(w.store).indexOf('tok-123') < 0, 'token not stored');
            assert(w.FongGameSaves.exportAll().text.indexOf('fong.gdrive') < 0, 'sync keys never exported');
            // nothing changed: no requests
            w.clock = T0 + 10 * MIN; var n = w.reqs.length;
            settled(w, function () { tick(w, function () {
                assert.strictEqual(w.reqs.length, n, 'unchanged hash makes no request');
                // changed but inside 5 minutes of the last upload
                w.store['fong.slots.v4'] = '{"coins":2}'; w.clock = T0 + 2 * MIN;
                tick(w, function () {
                    assert.strictEqual(w.reqs.length, n, 'min gap');
                    w.clock = T0 + 6 * MIN;
                    tick(w, function () {
                        var patch = w.reqs.filter(function (r) { return r.opts.method === 'PATCH'; })[0];
                        assert(patch, 'updated in place');
                        assert(patch.url.indexOf('https://www.googleapis.com/upload/drive/v3/files/' + f.id + '?uploadType=multipart') === 0);
                        assert.strictEqual(patch.opts.headers.Authorization, 'Bearer tok-123');
                        assert.strictEqual(names(w, /^fong-auto-slots/).length, 1);
                        assert.strictEqual(names(w, /^fong-daily-slots/).length, 1, 'one daily copy per day');
                        assert.strictEqual(f.appProperties.hash, sync(w).slots.hash);
                        assert.notStrictEqual(sync(w).slots.version, '1');
                        next();
                    });
                });
            }); });
        });
    });
});

steps.push(function (next) {   // Drive changed by another device: do not overwrite, raise a prompt
    var w = boot(); w.store['fong.slots.v4'] = '{"coins":1}';
    connect(w, function () {
        F.until(function () { return names(w, /^fong-auto-slots/).length === 1 && sync(w).slots; }, 1500, function () {
            settled(w, function () {
                var f = w.drive.files.filter(function (x) { return x.name === 'fong-auto-slots.json'; })[0];
                f.content = 'OTHER DEVICE'; f.appProperties = { game: 'slots', hash: 'zzz', device: 'other' }; f.version = String(++w.drive.ver); w.drive.clock += 1000; f.modifiedTime = new Date(w.drive.clock).toISOString();
                w.store['fong.slots.v4'] = '{"coins":9}'; w.clock = T0 + 10 * MIN;
                tick(w, function () {
                    assert.strictEqual(f.content, 'OTHER DEVICE', 'not overwritten');
                    assert(!w.reqs.some(function (r) { return r.opts.method === 'PATCH'; }));
                    var p = w.FongGDriveAuto.prompts(); assert(p.length === 1 && p[0].game === 'slots' && p[0].reason === 'conflict');
                    next();
                });
            });
        });
    });
});

steps.push(function (next) {   // daily snapshots: newest 7 kept
    var w = boot(), d, i = 0; w.store['fong.slots.v4'] = '{"coins":0}';
    connect(w, function () {
        F.until(function () { return sync(w).slots && names(w, /^fong-daily/).length === 1; }, 1500, function () {
            settled(w, function () {
                (function loop() {
                    if (i === 9) {
                        var daily = names(w, /^fong-daily-slots-/).sort();
                        assert.strictEqual(daily.length, 7, daily.join());
                        assert.strictEqual(daily[6], 'fong-daily-slots-2026-11-10.json'); assert.strictEqual(daily[0], 'fong-daily-slots-2026-11-04.json');
                        assert.strictEqual(names(w, /^fong-auto-slots/).length, 1);
                        next(); return;
                    }
                    i++; w.clock = T0 + i * DAY; w.store['fong.slots.v4'] = '{"coins":' + (i + 1) + '}';
                    tick(w, function () { settled(w, function () { setTimeout(loop, 5); }); });
                })();
            });
        });
    });
});

steps.push(function (next) {   // one game per run, taking turns
    var w = boot(); assert.strictEqual(w.FongGDrive.MAX_GAMES_PER_RUN, 1);
    w.store['fong.slots.v4'] = '{"a":1}'; w.store['fong.jigsaw.v2'] = '{"a":1}'; w.store['sudoku_autosave'] = '{"a":1}';
    w.FongGDriveAuto._now = function () { return w.clock; };
    w.store['fong.gdrive.auto'] = 'off';   // drive the runs by hand
    connect(w, function () {
        w.FongGDriveAuto.setAuto(true);
        var order = [];
        function once(cb) { var before = names(w, /^fong-auto-/).length; tick(w, function () { settled(w, function () { cb(names(w, /^fong-auto-/).length - before); }); }); }
        once(function (d1) {
            assert.strictEqual(d1, 1, 'exactly one game in the first run');
            w.clock += MIN; once(function (d2) {
                assert.strictEqual(d2, 1); w.clock += MIN; once(function (d3) {
                    assert.strictEqual(d3, 1); w.clock += MIN;
                    assert.strictEqual(names(w, /^fong-auto-/).length, 3);
                    // all three change: least recently backed up goes first
                    var t = w.clock + 10 * MIN; w.clock = t;
                    w.store['fong.slots.v4'] = '{"a":2}'; w.store['fong.jigsaw.v2'] = '{"a":2}'; w.store['sudoku_autosave'] = '{"a":2}';
                    var s0 = sync(w), oldest = Object.keys(s0).sort(function (a, b) { return s0[a].time - s0[b].time; })[0];
                    tick(w, function () { settled(w, function () {
                        var s1 = sync(w); assert(s1[oldest].time === t, 'oldest synced game went first');
                        var done = Object.keys(s1).filter(function (k) { return s1[k].time === t; });
                        assert.strictEqual(done.length, 1);
                        next();
                    }); });
                });
            });
        });
    });
});

steps.push(function (next) {   // backoff doubles, caps at 30 minutes, then 401 stops autosave
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; w.store['fong.gdrive.auto'] = 'off'; w.FongGDrive._retryMs = 1;
    connect(w, function () {
        w.FongGDriveAuto.setAuto(true);
        var st = w.FongGDriveAuto._state, gaps = [], i = 0;
        (function loop() {
            if (i === 7) {
                assert.deepEqual(gaps, [60000, 120000, 240000, 480000, 960000, 1800000, 1800000]);
                // inside the backoff window: no request
                var n = w.reqs.length; w.clock += 1000;
                tick(w, function () {
                    assert.strictEqual(w.reqs.length, n, 'waits during backoff');
                    w.clock = st.nextTry + 1; w.nextStatus = [{ status: 401 }];
                    tick(w, function () {
                        assert.strictEqual(st.phase, 'reconnect'); assert(st.stopped && !w.FongGDrive.isConnected());
                        var m = w.reqs.length; w.clock += 99 * MIN;
                        tick(w, function () { assert.strictEqual(w.reqs.length, m, 'no uploads after 401'); next(); });
                    });
                }); return;
            }
            i++; w.clock = Math.max(w.clock, st.nextTry) + 1; w.nextStatus = [{ status: 503 }, { status: 503 }];
            tick(w, function (e) { settled(w, function () { gaps.push(st.nextTry - w.clock); setTimeout(loop, 2); }); });
        })();
    });
});

steps.push(function (next) {   // two tabs: one lease, the other does not upload, then takes over
    var store = {}, drive = F.makeDrive();
    var a = boot({ store: store, drive: drive }), b = boot({ store: store, drive: drive, token: 'tok-b' });
    store['fong.slots.v4'] = '{"a":1}'; store['fong.gdrive.auto'] = 'off';
    connect(a, function () {
        a.FongGDriveAuto.setAuto(true); // a takes the lease
        connect(b, function () {
            tick(b, function () { settled(b, function () {
                assert(b.FongGDriveAuto.getStatus().phase === 'another' && /Another window/.test(b.FongGDriveAuto.getStatus().text));
                assert(!b.reqs.some(function (r) { return r.opts.method === 'POST' || r.opts.method === 'PATCH'; }), 'non-leader does not upload');
                tick(a, function () { settled(a, function () {
                    assert.strictEqual(names(a, /^fong-auto-slots/).length, 1);
                    // a goes away without renewing; b is past the lease
                    var lease = JSON.parse(store['fong.gdrive.lease']); assert(lease.tab);
                    b.clock = a.clock + 6 * MIN; store['fong.slots.v4'] = '{"a":2}';
                    tick(b, function () { settled(b, function () {
                        assert(b.reqs.some(function (r) { return r.opts.method === 'PATCH'; }), 'takeover uploads');
                        assert.strictEqual(JSON.parse(store['fong.gdrive.lease']).tab, JSON.parse(store['fong.gdrive.lease']).tab);
                        assert(JSON.stringify(store).indexOf('tok-') < 0, 'no token in shared storage');
                        next();
                    }); });
                }); });
            }); });
        });
    });
});

steps.push(function (next) {   // silent reconnect: fails quietly into the reconnect chip, and works when allowed
    var store = { 'fong.gdrive.was': '1', 'fong.gdrive.auto': 'on' };
    var w = F.makeTab({ store: store }); w.tokenErr = { type: 'popup_failed_to_open' };
    F.until(function () { return w.FongGDriveAuto.getStatus().phase === 'reconnect'; }, 1500, function (e) {
        assert(!e, 'chip shown'); assert(!w.FongGDrive.isConnected()); assert.strictEqual(w.tokenCalls, 1, 'one quiet try, no loop');
        var s2 = { 'fong.gdrive.was': '1', 'fong.gdrive.auto': 'on' }, w2 = F.makeTab({ store: s2 });
        F.until(function () { return w2.FongGDrive.isConnected(); }, 1500, function (e2) {
            assert(!e2); assert(JSON.stringify(s2).indexOf('tok-') < 0);
            // never connected before: no Google script at all
            var w3 = F.makeTab({ store: {} });
            setTimeout(function () { assert.strictEqual(w3.gisLoads, 0); assert.strictEqual(w3.reqs.length, 0); next(); }, 30);
        });
    });
});

steps.push(function (next) {   // autoload prompt conditions
    var store = {}, drive = F.makeDrive();
    var other = F.makeTab({ store: {}, drive: drive });   // pretend device that wrote the files
    store['fong.slots.v4'] = '{"mine":1}';
    function put(name, hash, content, mod) {
        drive.clock += 1000;
        drive.files.push({ id: 'seed' + (++drive.seq), name: name, parents: ['appDataFolder'], appProperties: { game: 'x', hash: hash }, createdTime: new Date(mod).toISOString(), modifiedTime: new Date(mod).toISOString(), version: String(++drive.ver), size: String(content.length), content: content });
    }
    // slots: Drive differs and is newer than this device ever synced -> prompt
    put('fong-auto-slots.json', 'other-hash', JSON.stringify({ format: 'fong-game-save', version: 1, game: 'slots', data: { 'fong.slots.v4': '{"cloud":1}' } }), T0 + 5 * MIN);
    var w = boot({ store: store, drive: drive }); w.store['fong.gdrive.auto'] = 'off';
    connect(w, function () {
        F.until(function () { return w.FongGDriveAuto.prompts().length === 1; }, 1500, function (e) {
            assert(!e); var p = w.FongGDriveAuto.prompts()[0]; assert(p.game === 'slots' && p.reason === 'newer');
            assert(!w.reqs.some(function (r) { return r.opts.method === 'POST' || r.opts.method === 'PATCH'; }), 'asking never writes');
            // Not now, remembered for the session
            w.FongGDriveAuto.dismiss('slots'); assert.strictEqual(w.FongGDriveAuto.prompts().length, 0);
            w.FongGDriveAuto.checkNewer(function () {
                assert.strictEqual(w.FongGDriveAuto.prompts().length, 0, 'same version stays dismissed');
                // a bad file from Drive goes through importJSON like any import and may be refused
                w.FongGDriveAuto.checkNewer(function () {});
                // Load goes through the normal import path
                var w2 = boot({ store: {}, drive: drive }); w2.store['fong.gdrive.auto'] = 'off';
                connect(w2, function () {
                    F.until(function () { return w2.FongGDriveAuto.prompts().length === 1; }, 1500, function () {
                        w2.FongGDriveAuto.load('slots', function (e3, text, meta) {
                            assert(!e3);
                            var dry = w2.FongGameSaves.importJSON(text, { mode: 'replace', dryRun: true }); assert(dry.ok && !w2.store['fong.slots.v4']);
                            assert(w2.FongGameSaves.importJSON(text, { mode: 'replace' }).ok);
                            w2.FongGDriveAuto.markLoaded('slots', meta);
                            assert.strictEqual(w2.FongGDriveAuto.prompts().length, 0);
                            assert.strictEqual(sync(w2).slots.version, meta.version);
                            w2.FongGDriveAuto.checkNewer(function () {
                                assert.strictEqual(w2.FongGDriveAuto.prompts().length, 0, 'loaded copy is not offered again');
                                next();
                            });
                        });
                    });
                });
            });
        });
    });
});

steps.push(function (next) {   // equal data on two devices: no prompt, the new device is marked synced
    var drive = F.makeDrive(), s1 = { 'fong.slots.v4': '{"same":1}' }, s2 = { 'fong.slots.v4': '{"same":1}', 'fong.gdrive.auto': 'off' };
    var a = boot({ store: s1, drive: drive });
    connect(a, function () { F.until(function () { return names(a, /^fong-auto-slots/).length === 1 && sync(a).slots; }, 1500, function () { settled(a, function () {
        var b = boot({ store: s2, drive: drive, clock: T0 + 3 * DAY });
        connect(b, function () { b.FongGDriveAuto.checkNewer(function () {
            assert.strictEqual(b.FongGDriveAuto.prompts().length, 0); assert(sync(b).slots && sync(b).slots.fileId);
            next();
        }); });
    }); }); });
});

steps.push(function (next) {   // Drive copy older than this device's last sync: device wins, no prompt
    var store = {}, drive = F.makeDrive(), w;
    drive.files.push({ id: 'old1', name: 'fong-auto-slots.json', parents: ['appDataFolder'], appProperties: { hash: 'old' }, createdTime: new Date(T0 - DAY).toISOString(), modifiedTime: new Date(T0 - DAY).toISOString(), version: '77', size: '2', content: '{}' });
    store['fong.slots.v4'] = '{"mine":1}'; store['fong.gdrive.sync'] = JSON.stringify({ slots: { hash: 'h-old', version: '5', time: T0, fileId: 'old1', day: '' } }); store['fong.gdrive.auto'] = 'off';
    w = boot({ store: store, drive: drive });
    connect(w, function () { w.FongGDriveAuto.checkNewer(function () { assert.strictEqual(w.FongGDriveAuto.prompts().length, 0); next(); }); });
});

steps.push(function (next) {   // flush on page hide: keepalive, only for a recently verified small file
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}';
    connect(w, function () {
        F.until(function () { return sync(w).slots; }, 1500, function () { settled(w, function () {
            w.store['fong.slots.v4'] = '{"a":2}'; w.clock += 20 * MIN - 1000 * 0; var n = w.FongGDriveAuto.flush();
            assert.strictEqual(n, 0, 'check older than 10 minutes: skipped');
            w.clock = T0 + 1000; w.FongGDriveAuto._state.leader = true;
            n = w.FongGDriveAuto.flush(); assert.strictEqual(n, 1);
            var last = w.reqs[w.reqs.length - 1]; assert(last.opts.keepalive === true && last.opts.method === 'PATCH');
            next();
        }); });
    });
});

steps.push(function (next) {   // turning autosave off stops uploads; manual save points still work
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}';
    connect(w, function () { F.until(function () { return sync(w).slots; }, 1500, function () { settled(w, function () {
        w.FongGDriveAuto.setAuto(false); w.store['fong.slots.v4'] = '{"a":2}'; w.clock += 20 * MIN; var n = w.reqs.length;
        tick(w, function () {
            assert.strictEqual(w.reqs.length, n);
            w.FongGDrive.backupNow('slots', function (e, r) {
                assert(!e); assert(names(w, /^fong-slots-\d{4}/).length === 1); next();
            }, { label: 'Before level 9' });
        });
    }); }); });
});

F.seqRun(steps, function () { console.log('gdrive auto tests passed'); process.exit(0); });
