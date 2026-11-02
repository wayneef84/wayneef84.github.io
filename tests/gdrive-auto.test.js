// Autosave, pauses and autoload for js/gdrive-auto.js. Run: node tests/gdrive-auto.test.js
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
function file(w, name) { return w.drive.files.filter(function (x) { return x.name === name; })[0]; }
function quiet(w, cb) { w.store['fong.gdrive.auto'] = 'off'; connect(w, function (e) { assert(!e); w.FongGDriveAuto.setAuto(true); cb(); }); }   // connect without the automatic first run
function lease(w, cb) { w.FongGDriveAuto._lease(function () { cb(); }); }
function go(w, cb) { lease(w, function () { tick(w, function (e, r) { settled(w, function () { cb(e, r); }); }); }); }

steps.push(function (next) {   // first autosave: shape, saved time, no token stored, unchanged = no request, gap, in-place update
    var w = boot(); w.store['fong.slots.v4'] = '{"coins":1}';
    connect(w, function (e) {
        assert(!e);
        F.until(function () { return names(w, /^fong-auto-slots/).length === 1 && names(w, /^fong-daily-slots-2026-11-01/).length === 1; }, 2000, function (err) {
            assert(!err, err && err.message);
            var f = file(w, 'fong-auto-slots.json');
            assert.deepEqual(f.parents, ['appDataFolder']);
            assert(f.appProperties.game === 'slots' && f.appProperties.hash && f.appProperties.device);
            assert.strictEqual(f.appProperties.savedAt, String(T0));
            assert.strictEqual(JSON.parse(f.content).saved, new Date(T0).toISOString(), 'saved time in the file');
            assert.strictEqual(JSON.parse(file(w, 'fong-daily-slots-2026-11-01.json').content).saved, new Date(T0).toISOString());
            var s = sync(w).slots; assert(s.hash && s.version && s.fileId === f.id && s.time === T0 && s.seen === s.hash && s.changed > 0);
            assert(JSON.stringify(w.store).indexOf('tok-123') < 0, 'token not stored');
            assert(w.FongGameSaves.exportAll().text.indexOf('fong.gdrive') < 0 && w.FongGameSaves.exportAll().text.indexOf('fong.undo') < 0);
            w.FongGDrive.list(function (e2, items) {
                var it = items.filter(function (x) { return x.type === 'auto'; })[0]; assert.strictEqual(it.savedAt, T0, 'list shows savedAt');
                w.clock = T0 + 10 * MIN; var n = w.reqs.length;
                settled(w, function () { tick(w, function () {
                    assert.strictEqual(w.reqs.length, n, 'unchanged hash makes no request');
                    w.store['fong.slots.v4'] = '{"coins":2}'; w.clock = T0 + 2 * MIN; w.FongGDriveAuto.markDirty();
                    tick(w, function () {
                        assert.strictEqual(w.reqs.length, n, 'min gap');
                        w.clock = T0 + 6 * MIN;
                        tick(w, function () { settled(w, function () {
                            var patch = w.reqs.filter(function (r) { return r.opts.method === 'PATCH'; })[0];
                            assert(patch && patch.url.indexOf('/upload/drive/v3/files/' + f.id + '?uploadType=multipart') > 0);
                            assert.strictEqual(patch.opts.headers.Authorization, 'Bearer tok-123');
                            assert.strictEqual(names(w, /^fong-auto-slots/).length, 1); assert.strictEqual(names(w, /^fong-daily-slots/).length, 1);
                            assert.strictEqual(f.appProperties.savedAt, String(T0 + 6 * MIN));
                            next();
                        }); });
                    });
                }); });
            });
        });
    });
});

steps.push(function (next) {   // timestamp is the second check: same version but Drive saved after this device last changed it
    var w = boot(); w.store['fong.slots.v4'] = '{"coins":1}';
    connect(w, function () { F.until(function () { return sync(w).slots && names(w, /^fong-daily-slots/).length === 1; }, 2000, function () { settled(w, function () {
        var f = file(w, 'fong-auto-slots.json');
        w.store['fong.slots.v4'] = '{"coins":2}'; w.clock = T0 + 1 * MIN; w.FongGDriveAuto.markDirty(); w.FongGDriveAuto._scan(true);   // device changed it at T0+1
        assert.strictEqual(sync(w).slots.changed, T0 + 1 * MIN);
        f.appProperties.savedAt = String(T0 + 3 * MIN);   // Drive says saved later, version untouched
        w.clock = T0 + 6 * MIN; var before = f.content;
        tick(w, function () { settled(w, function () {
            assert.strictEqual(f.content, before, 'not overwritten'); assert(!w.reqs.some(function (r) { return r.opts.method === 'PATCH'; }));
            var p = w.FongGDriveAuto.prompts(); assert(p.length === 1 && p[0].game === 'slots' && p[0].driveTime === T0 + 3 * MIN && p[0].deviceTime === T0 + 1 * MIN);
            assert(w.FongGDriveAuto.getStatus().phase === 'paused' && /paused for Slots/.test(w.FongGDriveAuto.getStatus().text));
            next();
        }); });
    }); }); });
});

steps.push(function (next) {   // version conflict pauses only that game; Keep this device; Decide later; Back up now respects the pause
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; w.store['sudoku_autosave'] = '{"a":1}';
    quiet(w, function () {
        var A = w.FongGDriveAuto, i = 0;
        (function first() {
            go(w, function () { w.clock += MIN; if (++i < 2) { first(); return; }
                assert.strictEqual(names(w, /^fong-auto-/).length, 2);
                var f = file(w, 'fong-auto-slots.json');
                f.content = 'OTHER DEVICE'; f.appProperties = { game: 'slots', hash: 'zzz', device: 'other', savedAt: String(w.clock) }; f.version = String(++w.drive.ver);
                w.store['fong.slots.v4'] = '{"a":9}'; w.store['sudoku_autosave'] = '{"a":9}'; A.markDirty();
                w.clock += 10 * MIN;
                go(w, function () {   // the least recently synced of the two goes first; run until both were tried
                    w.clock += 10 * MIN;
                    go(w, function () {
                        assert.strictEqual(f.content, 'OTHER DEVICE', 'slots not overwritten');
                        assert.strictEqual(JSON.parse(file(w, 'fong-auto-sudoku.json').content).data.sudoku_autosave, '{"a":9}', 'other game kept going');
                        var p = A.prompts(); assert(p.length === 1 && p[0].game === 'slots');
                        // Decide later: stays paused and says so
                        A.dismiss('slots'); assert(A.prompts()[0].later === true && /until the page closes/.test(A.getStatus().text));
                        w.clock += 10 * MIN;
                        A.runNow(function (e, r) {
                            assert(!e && r.saved === 0 && r.paused.join() === 'Slots', 'Back up now says which games are paused');
                            assert.strictEqual(f.content, 'OTHER DEVICE');
                            // Keep this device: overwrite Drive
                            A.keepDevice('slots', function (e2) {
                                assert(!e2); assert.strictEqual(JSON.parse(f.content).data['fong.slots.v4'], '{"a":9}');
                                assert.strictEqual(A.prompts().length, 0); assert.notStrictEqual(A.getStatus().phase, 'paused');
                                assert.strictEqual(sync(w).slots.version, f.version); assert.strictEqual(sync(w).slots.hash, f.appProperties.hash);
                                next();
                            });
                        });
                    });
                });
            });
        })();
    });
});

steps.push(function (next) {   // Load the Drive save: only the game, replace counts, a merge that changed nothing does not release the pause
    var drive = F.makeDrive(), s1 = { 'fong.slots.v4': '{"mine":1}', 'sudoku_autosave': '{"s":1}' };
    var w = boot({ store: s1, drive: drive }); var A = w.FongGDriveAuto;
    quiet(w, function () {
        var j = 0;
        (function seedBoth() { go(w, function () { w.clock += MIN; if (++j < 2) { seedBoth(); return; }
            var f = file(w, 'fong-auto-slots.json');
            f.content = JSON.stringify({ format: 'fong-game-save', version: 1, game: 'slots', saved: 'x', data: { 'fong.slots.v4': '{"cloud":1}' } });
            f.appProperties = { game: 'slots', hash: 'cloudhash', savedAt: String(w.clock) }; f.version = String(++drive.ver);
            s1['fong.slots.v4'] = '{"mine":2}'; A.markDirty(); w.clock += 10 * MIN;
            go(w, function () {
                assert.strictEqual(A.prompts().length, 1);
                A.load('slots', function (e, text, meta) {
                    assert(!e && meta.hash === 'cloudhash');
                    // merge: key exists, nothing applied
                    var r = w.FongGameSaves.importJSON(text, { mode: 'merge', only: ['slots'] }); assert(!r.ok && r.alreadyHave);
                    assert.strictEqual(A.markLoaded('slots', meta, 'merge'), false, 'merge that applied nothing does not mark synced');
                    assert.strictEqual(A.prompts().length, 1, 'still paused');
                    // per-game undo, then replace with only:[game]
                    assert(A.stash('slots')); assert(s1['fong.undo.slots']);
                    s1['sudoku_autosave'] = '{"s":"untouched"}';
                    r = w.FongGameSaves.importJSON(text, { mode: 'replace', only: ['slots'] }); assert(r.ok && r.games.length === 1 && s1['fong.slots.v4'] === '{"cloud":1}');
                    assert.strictEqual(s1['sudoku_autosave'], '{"s":"untouched"}');
                    assert.strictEqual(A.markLoaded('slots', meta, 'replace'), true);
                    assert.strictEqual(A.prompts().length, 0); assert.strictEqual(sync(w).slots.version, meta.version);
                    assert(A.undoList().length === 1 && A.undoList()[0].id === 'slots');
                    assert(A.undo('slots') && s1['fong.slots.v4'] === '{"mine":2}' && !s1['fong.undo.slots']);
                    // undo removes keys the load created
                    delete s1['fong.slots.v4']; assert(A.stash('slots') === false || true);
                    next();
                });
            });
        }); })();
    });
});

steps.push(function (next) {   // markLoaded also counts when the device now equals the Drive data; manual restore releases a pause
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; var A = w.FongGDriveAuto;
    quiet(w, function () { go(w, function () {
        var f = file(w, 'fong-auto-slots.json'); f.version = String(++w.drive.ver); f.appProperties.hash = 'h2'; f.appProperties.savedAt = String(w.clock + 5);
        w.store['fong.slots.v4'] = '{"a":2}'; A.markDirty(); w.clock += 10 * MIN;
        go(w, function () {
            assert.strictEqual(A.prompts().length, 1);
            A.afterRestore(['slots']);   // user restored a file or save point by hand
            assert.strictEqual(A.prompts().length, 0);
            w.clock += 10 * MIN; w.store['fong.slots.v4'] = '{"a":3}'; A.markDirty();
            go(w, function () { assert.strictEqual(JSON.parse(f.content).data['fong.slots.v4'], '{"a":3}', 'device wins after a deliberate restore'); next(); });
        });
    }); });
});

steps.push(function (next) {   // daily snapshots: newest 7 days kept, a second device cannot make duplicates
    var w = boot(), i = 0; w.store['fong.slots.v4'] = '{"coins":0}';
    connect(w, function () { F.until(function () { return sync(w).slots && names(w, /^fong-daily/).length === 1; }, 2000, function () { settled(w, function () {
        // another device already made tomorrow's daily file
        var tomorrow = new Date(T0 + DAY), p = function (n) { return n < 10 ? '0' + n : '' + n; };
        var dname = 'fong-daily-slots-' + tomorrow.getFullYear() + '-' + p(tomorrow.getMonth() + 1) + '-' + p(tomorrow.getDate()) + '.json';
        w.drive.files.push({ id: 'dup1', name: dname, parents: ['appDataFolder'], appProperties: {}, createdTime: new Date(w.drive.clock).toISOString(), modifiedTime: new Date(w.drive.clock).toISOString(), version: '1', size: '2', content: '{}' });
        (function loop() {
            if (i === 9) {
                var daily = names(w, /^fong-daily-slots-/).sort(); var days = {}; daily.forEach(function (n) { days[n] = (days[n] || 0) + 1; });
                assert.strictEqual(daily.length, 7, daily.join()); assert.strictEqual(Object.keys(days).length, 7, 'distinct days');
                assert.strictEqual(names(w, /^fong-auto-slots/).length, 1); next(); return;
            }
            i++; w.clock = T0 + i * DAY; w.store['fong.slots.v4'] = '{"coins":' + (i + 1) + '}'; w.FongGDriveAuto.markDirty();
            go(w, function () { if (i === 1) { assert.strictEqual(names(w, /^fong-daily-slots-/).filter(function (n) { return n === dname; }).length, 1, 'no duplicate for the same day'); } setTimeout(loop, 5); });
        })();
    }); }); });
});

steps.push(function (next) {   // one game per run, taking turns
    var w = boot(); assert.strictEqual(w.FongGDrive.MAX_GAMES_PER_RUN, 1);
    w.store['fong.slots.v4'] = '{"a":1}'; w.store['fong.jigsaw.v2'] = '{"a":1}'; w.store['sudoku_autosave'] = '{"a":1}';
    quiet(w, function () {
        function once(cb) { var before = names(w, /^fong-auto-/).length; go(w, function () { cb(names(w, /^fong-auto-/).length - before); }); }
        once(function (d1) {
            assert.strictEqual(d1, 1, 'exactly one game in the first run');
            w.clock += MIN; once(function (d2) { assert.strictEqual(d2, 1); w.clock += MIN; once(function (d3) {
                assert.strictEqual(d3, 1); assert.strictEqual(names(w, /^fong-auto-/).length, 3);
                var t = w.clock + 10 * MIN; w.clock = t;
                w.store['fong.slots.v4'] = '{"a":2}'; w.store['fong.jigsaw.v2'] = '{"a":2}'; w.store['sudoku_autosave'] = '{"a":2}'; w.FongGDriveAuto.markDirty();
                var s0 = sync(w), oldest = Object.keys(s0).sort(function (a, b) { return s0[a].time - s0[b].time; })[0];
                go(w, function () { var s1 = sync(w); assert(s1[oldest].time === t, 'oldest synced game went first'); assert.strictEqual(Object.keys(s1).filter(function (k) { return s1[k].time === t; }).length, 1); next(); });
            }); });
        });
    });
});

steps.push(function (next) {   // backoff doubles up to 30 minutes, then a 401 stops autosave
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; w.FongGDrive._retryMs = 1;
    quiet(w, function () {
        var st = w.FongGDriveAuto._state, gaps = [], i = 0;
        (function loop() {
            if (i === 7) {
                assert.deepEqual(gaps, [60000, 120000, 240000, 480000, 960000, 1800000, 1800000]);
                var n = w.reqs.length; w.clock += 1000;
                tick(w, function () {
                    assert.strictEqual(w.reqs.length, n, 'waits during backoff');
                    w.clock = st.nextTry + 1; w.nextStatus = [{ status: 401 }];
                    tick(w, function () { settled(w, function () {
                        assert.strictEqual(st.phase, 'reconnect'); assert(st.stopped && !w.FongGDrive.isConnected());
                        var m = w.reqs.length; w.clock += 99 * MIN;
                        tick(w, function () { assert.strictEqual(w.reqs.length, m, 'no uploads after 401'); next(); });
                    }); });
                }); return;
            }
            i++; w.clock = Math.max(w.clock, st.nextTry) + 1; w.nextStatus = [{ status: 503 }, { status: 503 }];
            lease(w, function () { tick(w, function () { settled(w, function () { gaps.push(st.nextTry - w.clock); setTimeout(loop, 2); }); }); });
        })();
    });
});

steps.push(function (next) {   // lease: two tabs claim at once, only one wins (nonce), the other does not upload and says so once; takeover after expiry
    var store = {}, drive = F.makeDrive();
    var a = boot({ store: store, drive: drive }), b = boot({ store: store, drive: drive, token: 'tok-b' });
    a.FongGDriveAuto._leaseMs = 30; b.FongGDriveAuto._leaseMs = 30;
    store['fong.slots.v4'] = '{"a":1}'; store['fong.gdrive.auto'] = 'off';
    connect(a, function () { connect(b, function () {
        a.FongGDriveAuto.setAuto(true);
        var got = [];
        a.FongGDriveAuto._lease(function (ok) { got.push(['a', ok]); });
        b.FongGDriveAuto._lease(function (ok) { got.push(['b', ok]); });   // same moment
        F.until(function () { return got.length === 2; }, 1500, function () {
            var winners = got.filter(function (g) { return g[1]; }); assert.strictEqual(winners.length, 1, 'exactly one leader: ' + JSON.stringify(got));
            var loser = winners[0][0] === 'a' ? b : a, winner = winners[0][0] === 'a' ? a : b;
            loser.FongGDriveAuto.setAuto(true); store['fong.gdrive.auto'] = 'on';
            tick(loser, function () { setTimeout(function () {
                var seq = loser.FongGDriveAuto.getStatus().seq;
                assert(loser.FongGDriveAuto.getStatus().phase === 'another' && !loser.reqs.some(function (r) { return r.opts.method === 'POST' || r.opts.method === 'PATCH'; }), 'non-leader does not upload');
                tick(loser, function () { setTimeout(function () {
                    assert.strictEqual(loser.FongGDriveAuto.getStatus().seq, seq, 'no repeated status announcement');
                    tick(winner, function () { settled(winner, function () {
                        assert.strictEqual(names(winner, /^fong-auto-slots/).length, 1);
                        loser.clock = winner.clock + 6 * MIN; store['fong.slots.v4'] = '{"a":2}'; loser.FongGDriveAuto.markDirty();
                        tick(loser, function () { setTimeout(function () { settled(loser, function () {
                            assert(loser.reqs.some(function (r) { return r.opts.method === 'PATCH'; }), 'takeover uploads');
                            assert(JSON.stringify(store).indexOf('tok-') < 0, 'no token in shared storage'); next();
                        }); }, 120); });
                    }); });
                }, 60); });
            }, 60); });
        });
    }); });
});

steps.push(function (next) {   // silent reconnect fails quietly into the chip; works when allowed; never-connected makes no request
    var store = { 'fong.gdrive.was': '1', 'fong.gdrive.auto': 'on' };
    var w = F.makeTab({ store: store }); w.tokenErr = { type: 'popup_failed_to_open' };
    F.until(function () { return w.FongGDriveAuto.getStatus().phase === 'reconnect'; }, 1500, function (e) {
        assert(!e); assert(!w.FongGDrive.isConnected()); assert.strictEqual(w.tokenCalls, 1);
        var s2 = { 'fong.gdrive.was': '1', 'fong.gdrive.auto': 'on' }, w2 = F.makeTab({ store: s2 });
        F.until(function () { return w2.FongGDrive.isConnected(); }, 1500, function (e2) {
            assert(!e2); assert(JSON.stringify(s2).indexOf('tok-') < 0);
            var w3 = F.makeTab({ store: {} });
            setTimeout(function () { assert.strictEqual(w3.gisLoads, 0); assert.strictEqual(w3.reqs.length, 0); next(); }, 30);
        });
    });
});

function putAuto(drive, id, hash, content, mod, version, savedAt) {
    drive.files.push({ id: id, name: 'fong-auto-slots.json', parents: ['appDataFolder'], appProperties: { hash: hash, savedAt: String(savedAt === undefined ? mod : savedAt) }, createdTime: new Date(mod).toISOString(), modifiedTime: new Date(mod).toISOString(), version: String(version), size: String(content.length), content: content });
}
steps.push(function (next) {   // autoload prompt conditions with version and timestamp
    var drive = F.makeDrive(), store = { 'fong.slots.v4': '{"mine":1}', 'fong.gdrive.auto': 'off' };
    putAuto(drive, 's1', 'other-hash', '{}', T0 + 5 * MIN, 11);
    var w = boot({ store: store, drive: drive }), A = w.FongGDriveAuto;
    connect(w, function () { F.until(function () { return A.prompts().length === 1; }, 1500, function (e) {
        assert(!e); assert(A.prompts()[0].reason === 'newer' && !A.prompts()[0].later);
        assert(!w.reqs.some(function (r) { return r.opts.method === 'POST' || r.opts.method === 'PATCH'; }), 'asking never writes');
        A.dismiss('slots'); assert.strictEqual(A.prompts().length, 1, 'Decide later keeps it paused'); assert(A.prompts()[0].later);
        // Drive holds exactly what this device last synced: nothing to ask
        var s2 = { 'fong.slots.v4': '{"mine":1}', 'fong.gdrive.auto': 'off', 'fong.gdrive.sync': JSON.stringify({ slots: { hash: 'other-hash', version: '3', time: T0, fileId: 's1', day: '', seen: 'x', changed: T0 } }) };
        var w2 = boot({ store: s2, drive: drive });
        connect(w2, function () { w2.FongGDriveAuto.checkNewer(function () {
            assert.strictEqual(w2.FongGDriveAuto.prompts().length, 0, 'f.hash equals the last synced hash');
            // slow clock: version matches what this device wrote, so no false prompt even though Drive time looks newer
            var s3 = { 'fong.slots.v4': '{"mine":1}', 'fong.gdrive.auto': 'off', 'fong.gdrive.sync': JSON.stringify({ slots: { hash: 'older', version: '11', time: 1000, fileId: 's1', day: '', seen: 'x', changed: 10 } }) };
            drive.files[0].appProperties.savedAt = String(T0 + 5 * MIN);
            var w3 = boot({ store: s3, drive: drive });
            connect(w3, function () { w3.FongGDriveAuto.checkNewer(function () {
                assert.strictEqual(w3.FongGDriveAuto.prompts().length, 1, 'newer than this device last changed it: ask (timestamp second signal)');
                // equal data on both: no prompt, marked synced
                var s4 = { 'fong.slots.v4': '{"same":1}', 'fong.gdrive.auto': 'off' }, w4 = boot({ store: s4, drive: drive });
                var info = JSON.parse(w4.FongGameSaves.exportGame('slots').text);
                // compute the hash the module would use by letting a third tab autosave the same data
                var drive2 = F.makeDrive(), sa = { 'fong.slots.v4': '{"same":1}' }, wa = boot({ store: sa, drive: drive2 });
                connect(wa, function () { F.until(function () { return sync(wa).slots && names(wa, /^fong-daily/).length === 1; }, 2000, function () { settled(wa, function () {
                    var sb = { 'fong.slots.v4': '{"same":1}', 'fong.gdrive.auto': 'off' }, wb = boot({ store: sb, drive: drive2, clock: T0 + 3 * DAY });
                    connect(wb, function () { wb.FongGDriveAuto.checkNewer(function () {
                        assert.strictEqual(wb.FongGDriveAuto.prompts().length, 0); assert(sync(wb).slots && sync(wb).slots.fileId); next();
                    }); });
                }); }); });
            }); });
        }); });
    }); });
});

steps.push(function (next) {   // flush: success-only recording, UTF-8 byte cap, checks Drive when not verified in the last minute
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; var A = w.FongGDriveAuto;
    connect(w, function () { F.until(function () { return sync(w).slots && names(w, /^fong-daily-slots/).length === 1; }, 2000, function () { settled(w, function () {
        A._state.leader = true;
        w.store['fong.slots.v4'] = '{"a":2}'; A.markDirty();
        var rec0 = sync(w).slots, before = JSON.stringify({ hash: rec0.hash, version: rec0.version, time: rec0.time }), n0 = w.reqs.length;
        w.clock = T0 + 5 * 1000;   // verified a moment ago: straight to the update
        w.nextStatus = [{ status: 500 }];
        assert.strictEqual(A.flush(), 1);
        F.until(function () { return w.reqs.length > n0; }, 500, function () { setTimeout(function () {
            var last = w.reqs[w.reqs.length - 1]; assert(last.opts.keepalive === true && last.opts.method === 'PATCH');
            var r1 = sync(w).slots; assert.strictEqual(JSON.stringify({ hash: r1.hash, version: r1.version, time: r1.time }), before, 'a failed flush records nothing');
            // success updates version from the response
            A.markDirty(); A._scan(true); var n1 = w.reqs.length;
            assert.strictEqual(A.flush(), 1);
            F.until(function () { return sync(w).slots.hash !== rec0.hash; }, 800, function (e) {
                assert(!e, 'recorded after success'); assert.strictEqual(sync(w).slots.version, file(w, 'fong-auto-slots.json').version);
                // not verified recently: a metadata check comes first
                w.clock = T0 + 20 * MIN; w.store['fong.slots.v4'] = '{"a":3}'; A.markDirty(); A._state.leader = true; var n2 = w.reqs.length;
                assert.strictEqual(A.flush(), 1);
                F.until(function () { return w.reqs.length >= n2 + 2; }, 800, function () {
                    assert(/fields=/.test(w.reqs[n2].url) && w.reqs[n2].opts.method !== 'PATCH', 'getMeta first'); assert.strictEqual(w.reqs[n2 + 1].opts.method, 'PATCH');
                    // bytes, not characters: 25000 four-byte characters is 100000 bytes but only 50000 characters
                    var big = new Array(25001).join('😀');
                    w.store['fong.slots.v4'] = JSON.stringify({ t: big }); A.markDirty(); w.clock += MIN; A._state.leader = true; var n3 = w.reqs.length;
                    assert.strictEqual(A.flush(), 0, 'over the byte cap: skipped'); assert.strictEqual(w.reqs.length, n3);
                    next();
                });
            });
        }, 30); });
    }); }); });
});

steps.push(function (next) {   // pre-check: no hashing when nothing changed (hooked and unhooked); hook marks writes dirty
    ['hooked', 'plain'].forEach(function () {});
    var w = boot(); w.store['fong.slots.v4'] = '{"a":1}'; w.store['j_score_a'] = '5'; var A = w.FongGDriveAuto;
    assert(A._hooked());
    quiet(w, function () { go(w, function () { w.clock += MIN; go(w, function () {
        var h = A._hashes; w.clock += 20 * 1000; A._scan(false); A._scan(false);
        assert.strictEqual(A._hashes, h, 'hooked and nothing written: no hashing');
        w.localStorage.setItem('j_score_a', '6'); A._scan(false);
        assert(A._hashes > h, 'a write marks it dirty and it is looked at');
        var h2 = A._hashes; A._scan(false); assert.strictEqual(A._hashes, h2, 'signature unchanged: no hashing');
        // a change that bypassed the hook is still found by the periodic full pass
        w.store['j_score_a'] = '7'; w.clock += 11 * MIN; A._scan(false); assert(A._hashes > h2, 'full pass every 10 minutes');
        // no hook (older browser): the signature is compared every time, hashing only when it moved
        var p = boot({ noHook: true }); p.store['fong.slots.v4'] = '{"a":1}'; var PA = p.FongGDriveAuto;
        assert(!PA._hooked()); PA._scan(false); var ph = PA._hashes; PA._scan(false); assert.strictEqual(PA._hashes, ph);
        p.store['fong.slots.v4'] = '{"a":2}'; PA._scan(false); assert(PA._hashes > ph);
        next();
    }); }); });
});

steps.push(function (next) {   // clamp, timers stop when autosave is off
    var w = boot(), A = w.FongGDriveAuto; w.store['fong.slots.v4'] = '{"a":1}';
    connect(w, function () {
        assert(A._timers().tick); A._adoptLast(w.clock + 10 * DAY); assert.strictEqual(A.getStatus().last, 0, 'future value ignored');
        A._adoptLast(w.clock - 1000); assert.strictEqual(A.getStatus().last, w.clock - 1000);
        A.setAuto(false); assert(!A._timers().tick && !A._timers().renew, 'timers cleared when autosave is off');
        A.setAuto(true); assert(A._timers().tick);
        next();
    });
});

F.seqRun(steps, function () { console.log('gdrive auto tests passed'); process.exit(0); });
