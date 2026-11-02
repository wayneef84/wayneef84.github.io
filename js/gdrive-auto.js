/**
 * FongGDriveAuto: optional autosave and "newer backup found" check on top of js/gdrive-backup.js (FongGDrive).
 * Does nothing until the user has connected. The access token is never stored or sent between tabs.
 * Device keys (not in the game saves manifest, never exported): fong.gdrive.sync, .auto, .was, .lease, .status, .device.
 * One rolling file per game (fong-auto-<game>.json, updated in place), one dated copy per game per day (7 kept).
 * The device wins when it changed, unless Drive was changed by another device since this one last synced:
 * then it asks (a "newer backup found" prompt) instead of overwriting. Only one tab uploads (a lease in localStorage).
 * Restores are never done here: the UI passes the text through FongGameSaves.importJSON (preview, gate, rollback).
 * Strict ES5. Docs: docs/GAMESAVES.md
 */
(function (w) {
    'use strict';

    var D = w.FongGDrive;
    if (!D) { return; }
    var doc = w.document;
    var SYNC_KEY = 'fong.gdrive.sync', AUTO_KEY = 'fong.gdrive.auto', WAS_KEY = 'fong.gdrive.was';
    var LEASE_KEY = 'fong.gdrive.lease', STATUS_KEY = 'fong.gdrive.status', DEVICE_KEY = 'fong.gdrive.device';
    var TICK_MS = 30000, MIN_GAP = 5 * 60000, LEASE_MS = 30000, RENEW_MS = 10000, SILENT_GAP = 5 * 60000;
    var BACKOFF_START = 60000, BACKOFF_MAX = 30 * 60000, FLUSH_MAX = 60000, VERIFIED_MS = 10 * 60000;

    var tab = 't' + Math.floor(Math.random() * 1e9).toString(36) + Date.now().toString(36);
    var st = { phase: 'off', text: '', sticky: false, seq: 0, last: 0, backoff: 0, nextTry: 0, stopped: false, busy: false, leader: false, silentAt: 0, silentBusy: false };
    var fns = [], pending = {}, dismissed = {}, blocked = {}, verified = {}, files = null, tickTimer = 0, renewTimer = 0, chan = null;
    var api = {};

    function now() { return typeof api._now === 'function' ? api._now() : Date.now(); }
    function readKey(k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } }
    function writeKey(k, v) { try { w.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
    function removeKey(k) { try { w.localStorage.removeItem(k); } catch (e) { /* ignore */ } }
    function readObj(k) {
        var v = readKey(k), o = null;
        if (v) { try { o = JSON.parse(v); } catch (e) { o = null; } }
        return o && typeof o === 'object' && !Array.isArray(o) ? o : null;
    }
    function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

    // ---- device state ---------------------------------------------------
    function isAuto() { return readKey(AUTO_KEY) === 'on'; }
    function getSync() {
        var o = readObj(SYNC_KEY) || {}, out = {}, ks = Object.keys(o), i, v;
        for (i = 0; i < ks.length; i++) {
            v = o[ks[i]];
            if (ks[i] !== '__proto__' && v && typeof v === 'object') {
                out[ks[i]] = { hash: typeof v.hash === 'string' ? v.hash : '', version: typeof v.version === 'string' ? v.version : '', time: Number(v.time) || 0,
                    fileId: typeof v.fileId === 'string' ? v.fileId : '', day: typeof v.day === 'string' ? v.day : '' };
            }
        }
        return out;
    }
    function putSync(id, rec) { var all = getSync(); all[id] = rec; writeKey(SYNC_KEY, JSON.stringify(all)); }
    function deviceName() {
        var d = readKey(DEVICE_KEY);
        if (!d) { d = 'd' + Math.floor(Math.random() * 1e9).toString(36) + Date.now().toString(36); writeKey(DEVICE_KEY, d); }
        return d;
    }
    function fnv(str) {
        var h = 2166136261, i;
        for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
        return h.toString(16) + '.' + str.length;
    }
    // { hash, text, warnings } for a game, or null when it has no saved data. The hash covers the data only, not the time.
    function gameInfo(id) {
        var G = w.FongGameSaves, r = G && G.exportGame(id), d;
        if (!r || !r.text) { return null; }
        try { d = JSON.parse(r.text); } catch (e) { return null; }
        if (!d || !d.data || !Object.keys(d.data).length) { return null; }
        return { hash: fnv(JSON.stringify(d.data)), text: r.text, warnings: r.warnings || [] };
    }
    function gameName(id) {
        var all = w.FongGameSaves ? w.FongGameSaves.list() : [], i;
        for (i = 0; i < all.length; i++) { if (all[i].id === id) { return all[i].name; } }
        return id;
    }
    function ymd(t) {
        var d = new Date(t), p = function (n) { return n < 10 ? '0' + n : '' + n; };
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }
    function fmtTime(t) {
        try { return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return new Date(t).toISOString(); }
    }

    // ---- status ---------------------------------------------------------
    function prompts() {
        var out = [], ks = Object.keys(pending), i, p;
        for (i = 0; i < ks.length; i++) {
            p = pending[ks[i]];
            if (!dismissed[p.game + ':' + p.meta.version]) { out.push({ game: p.game, name: gameName(p.game), reason: p.reason, meta: p.meta }); }
        }
        return out;
    }
    function getStatus() {
        return { phase: st.phase, text: st.text, sticky: st.sticky, seq: st.seq, last: st.last, connected: D.isConnected(), auto: isAuto(),
            leader: st.leader, perRun: D.MAX_GAMES_PER_RUN, prompts: prompts() };
    }
    function emit() { var s = getStatus(), i; for (i = 0; i < fns.length; i++) { try { fns[i](s); } catch (e) { /* ignore */ } } }
    function setStatus(phase, text, sticky) { st.phase = phase; st.text = text || ''; st.sticky = !!sticky; st.seq++; emit(); }
    function shareLast() {
        writeKey(STATUS_KEY, JSON.stringify({ last: st.last, tab: tab, t: now() }));
        try { if (chan) { chan.postMessage({ type: 'last', last: st.last, tab: tab }); } } catch (e) { /* ignore */ }
    }
    function adoptLast(t) { if (typeof t === 'number' && t > st.last) { st.last = t; emit(); } }
    function onStorage(e) {
        if (!e || (e.key !== STATUS_KEY && e.key !== SYNC_KEY)) { return; }
        var o = readObj(STATUS_KEY);
        if (o && o.tab !== tab) { adoptLast(Number(o.last)); }
        if (e.key === SYNC_KEY) { emit(); }
    }

    // ---- lease (only one tab uploads) ----------------------------------------
    function takeLease() {
        var l = readObj(LEASE_KEY), t = now();
        if (!l || typeof l.until !== 'number' || l.until < t || l.tab === tab) {
            writeKey(LEASE_KEY, JSON.stringify({ tab: tab, until: t + LEASE_MS }));
            var back = readObj(LEASE_KEY);
            st.leader = !!(back && back.tab === tab);
        } else { st.leader = false; }
        return st.leader;
    }
    function releaseLease() {
        var l = readObj(LEASE_KEY);
        if (l && l.tab === tab) { removeKey(LEASE_KEY); }
        st.leader = false;
    }

    // ---- uploading ------------------------------------------------------------
    function autoName(id) { return 'fong-auto-' + id + '.json'; }

    function findAuto(id) {
        var i;
        if (!files) { return null; }
        for (i = 0; i < files.length; i++) { if (files[i].type === 'auto' && files[i].scope === id) { return files[i]; } }
        return null;
    }
    function haveDaily(id, day) {
        var i;
        if (!files) { return false; }
        for (i = 0; i < files.length; i++) { if (files[i].type === 'daily' && files[i].scope === id && files[i].day === day) { return true; } }
        return false;
    }
    function loadFiles(cb) {
        if (files) { cb(null); return; }
        D.list(function (e, items) { if (!e) { files = items; } cb(e); });
    }

    function setConflict(id, meta) {
        pending[id] = { game: id, reason: 'conflict', meta: { id: meta.id, version: meta.version || '', modified: meta.modified || '' } };
        emit();
    }

    function dailyCopy(id, info, done) {
        var day = ymd(now()), rec = getSync()[id];
        if (!rec || rec.day === day || haveDaily(id, day)) { if (rec && rec.day !== day) { rec.day = day; putSync(id, rec); } done(); return; }
        D.createFile('fong-daily-' + id + '-' + day + '.json', info.text, { game: id, hash: info.hash }, function (e) {
            if (e) { done(); return; }   // the daily copy is a bonus: a failure here never fails the backup
            if (files) { files.push({ type: 'daily', scope: id, day: day, id: '', name: '' }); }
            rec.day = day; putSync(id, rec);
            D.prune('daily', id, D.KEEP_DAILY, function () { done(); });
        });
    }

    // Writes one game. cb(err, outcome) with outcome 'saved', 'same' or 'conflict'.
    function uploadGame(id, info, cb) {
        var s = getSync()[id] || { hash: '', version: '', time: 0, fileId: '', day: '' };
        var props = { game: id, hash: info.hash, device: deviceName() };
        function finish(r, day) {
            putSync(id, { hash: info.hash, version: r.version || '', time: now(), fileId: r.id || s.fileId, day: day || s.day });
            verified[id] = now();
            dailyCopy(id, info, function () { cb(null, 'saved'); });
        }
        function create() {
            D.createFile(autoName(id), info.text, props, function (e, r) {
                if (e) { cb(e); return; }
                if (files) { files.push({ type: 'auto', scope: id, id: r.id, version: r.version, hash: info.hash }); }
                finish(r);
            });
        }
        function checked(meta) {
            // The file on Drive matches what this device last wrote (same version, or same content): safe to overwrite.
            var mine = (s.version && meta.version === s.version) || (s.hash && meta.hash === s.hash);
            if (meta.hash && meta.hash === info.hash) {   // Drive already has this exact data
                putSync(id, { hash: info.hash, version: meta.version, time: now(), fileId: meta.id, day: s.day });
                verified[id] = now(); cb(null, 'same'); return;
            }
            if (!mine) { setConflict(id, meta); cb(null, 'conflict'); return; }
            D.updateFile(meta.id, info.text, props, function (e, r) {
                if (e) { cb(e); return; }
                if (!r.id) { r.id = meta.id; }
                finish(r);
            });
        }
        function withFile() {
            var f = s.fileId ? { id: s.fileId } : findAuto(id);
            if (!f) { create(); return; }
            D.getMeta(f.id, function (e, meta) {
                if (e && e.code === 'missing') { s.fileId = ''; create(); return; }
                if (e) { cb(e); return; }
                checked(meta);
            });
        }
        if (s.fileId) { withFile(); } else { loadFiles(function (e) { if (e) { cb(e); } else { withFile(); } }); }
    }

    function changedGames(force) {
        var all = w.FongGameSaves ? w.FongGameSaves.list() : [], sync = getSync(), out = [], i, info, s, t = now();
        for (i = 0; i < all.length; i++) {
            if (!all[i].hasData || has(pending, all[i].id)) { continue; }
            info = gameInfo(all[i].id);
            if (!info) { continue; }
            s = sync[all[i].id];
            if (s && s.hash === info.hash) { continue; }
            if (blocked[all[i].id] === info.hash) { continue; }
            if (!force && s && s.time && t - s.time < MIN_GAP) { continue; }
            out.push({ id: all[i].id, info: info, time: s ? s.time : 0 });
        }
        out.sort(function (a, b) { return a.time - b.time; });   // least recently backed up first, so the games take turns
        return out;
    }

    function errorStop(e) {
        if (e.code === 'auth') { st.stopped = true; setStatus('reconnect', 'Tap to reconnect', true); return; }
        st.backoff = st.backoff ? Math.min(st.backoff * 2, BACKOFF_MAX) : BACKOFF_START;
        st.nextTry = now() + st.backoff;
        setStatus('error', e.message, true);
    }

    // opts.force: Back up now (every changed game, no waiting time). Calls cb(err, {saved, conflicts}).
    function run(opts, cb) {
        opts = opts || {}; cb = typeof cb === 'function' ? cb : function () {};
        if (st.busy) { cb(null, { saved: 0, conflicts: 0, busy: true }); return; }
        if (!D.isConnected()) { cb({ code: 'auth', message: 'Not connected.' }); return; }
        if (!takeLease()) { setStatus('another', 'Another window is backing up', false); cb(null, { saved: 0, conflicts: 0, another: true }); return; }
        var list = changedGames(!!opts.force);
        if (!opts.force) { list = list.slice(0, D.MAX_GAMES_PER_RUN); }
        var saved = 0, conflicts = 0, i = 0;
        if (!list.length) { cb(null, { saved: 0, conflicts: 0 }); return; }
        st.busy = true;
        function done(e) {
            st.busy = false;
            if (!e) {
                st.backoff = 0; st.nextTry = 0;
                if (saved) { st.last = now(); setStatus('backedup', 'Backed up ' + fmtTime(st.last), false); shareLast(); }
                else if (conflicts) { setStatus('connected', 'A newer backup was found', true); }
            }
            cb(e || null, { saved: saved, conflicts: conflicts });
        }
        (function next() {
            if (i >= list.length) { done(null); return; }
            var item = list[i++];
            if (item.info.warnings.length) {   // a backup that cannot be restored is not saved
                blocked[item.id] = item.info.hash;
                setStatus('error', 'Not backed up. ' + item.info.warnings[0], true);
                next(); return;
            }
            uploadGame(item.id, item.info, function (e, out) {
                if (e) { st.busy = false; errorStop(e); cb(e, { saved: saved, conflicts: conflicts }); return; }
                if (out === 'saved') { saved++; } else if (out === 'conflict') { conflicts++; }
                next();
            });
        })();
    }

    function tick(cb) {
        cb = typeof cb === 'function' ? cb : function () {};
        if (doc && doc.visibilityState === 'hidden') { cb(null, null); return; }
        if (!isAuto() || st.stopped) { cb(null, null); return; }
        if (!D.isConnected()) { trySilent(); cb(null, null); return; }
        if (now() < st.nextTry) { cb(null, null); return; }
        run({}, cb);
    }

    // Best effort when the page is going away: only small files for games whose Drive copy was checked a moment ago.
    function flush() {
        if (!isAuto() || !D.isConnected() || !st.leader || st.busy || st.stopped) { return 0; }
        var list = changedGames(true).slice(0, D.MAX_GAMES_PER_RUN), n = 0, i, it, s;
        for (i = 0; i < list.length; i++) {
            it = list[i]; s = getSync()[it.id];
            if (!s || !s.fileId || !verified[it.id] || now() - verified[it.id] > VERIFIED_MS || it.info.warnings.length || it.info.text.length > FLUSH_MAX) { continue; }
            if (has(pending, it.id)) { continue; }
            D.updateFile(s.fileId, it.info.text, { game: it.id, hash: it.info.hash, device: deviceName() }, function () {}, { keepalive: true });
            putSync(it.id, { hash: it.info.hash, version: s.version, time: now(), fileId: s.fileId, day: s.day });
            n++;
        }
        return n;
    }

    // ---- connecting -----------------------------------------------------------
    function trySilent() {
        if (st.silentBusy || readKey(WAS_KEY) !== '1' || !isAuto() || !D.isConfigured() || D.isConnected()) { return; }
        if (now() - st.silentAt < SILENT_GAP) { return; }
        st.silentAt = now(); st.silentBusy = true;
        setStatus('connecting', 'Connecting...', false);
        D.connect(function (e) {
            st.silentBusy = false;
            if (e && !D.isConnected()) { st.stopped = true; setStatus('reconnect', 'Tap to reconnect', true); }
        }, { silent: true });
    }

    function startTimers() {
        if (!tickTimer) { tickTimer = w.setInterval(function () { tick(); }, TICK_MS); }
        if (!renewTimer) { renewTimer = w.setInterval(function () { if (D.isConnected() && isAuto()) { takeLease(); } }, RENEW_MS); }
    }
    function stopTimers() {
        if (tickTimer) { w.clearInterval(tickTimer); tickTimer = 0; }
        if (renewTimer) { w.clearInterval(renewTimer); renewTimer = 0; }
    }

    // Looks at the auto files on Drive. A game gets a "newer backup found" prompt when its Drive copy differs from the
    // device and was changed after this device last synced it. Equal copies are just marked as synced.
    function checkNewer(cb) {
        cb = typeof cb === 'function' ? cb : function () {};
        files = null;
        loadFiles(function (e) {
            if (e) { cb(e); return; }
            var i, f, info, s, known = {}, all = w.FongGameSaves ? w.FongGameSaves.list() : [];
            for (i = 0; i < all.length; i++) { known[all[i].id] = true; }
            for (i = 0; i < files.length; i++) {
                f = files[i];
                if (f.type !== 'auto' || !known[f.scope]) { continue; }
                info = gameInfo(f.scope); s = getSync()[f.scope] || { hash: '', version: '', time: 0, fileId: '', day: '' };
                if (info && f.hash && f.hash === info.hash) { putSync(f.scope, { hash: info.hash, version: f.version, time: now(), fileId: f.id, day: s.day }); delete pending[f.scope]; continue; }
                if (f.version && s.version === f.version) { continue; }   // nothing new on Drive since this device wrote it
                if (!s.time || Date.parse(f.modified || f.time) > s.time) {
                    pending[f.scope] = { game: f.scope, reason: 'newer', meta: { id: f.id, version: f.version || '', modified: f.modified || f.time || '' } };
                }
            }
            emit(); cb(null);
        });
    }

    function onConnection(connected) {
        if (connected) {
            writeKey(WAS_KEY, '1');
            if (readKey(AUTO_KEY) === null) { writeKey(AUTO_KEY, 'on'); }
            st.stopped = false; st.backoff = 0; st.nextTry = 0; st.silentBusy = false;
            setStatus('connected', 'Connected', false);
            startTimers();
            if (isAuto()) { takeLease(); }
            checkNewer(function () { if (isAuto()) { tick(); } });
        } else {
            stopTimers(); releaseLease(); pending = {}; files = null; verified = {};
            if (st.phase !== 'reconnect') { setStatus('off', '', false); }
        }
    }
    D.onChange(onConnection);

    // ---- public ---------------------------------------------------------------
    api.getStatus = getStatus;
    api.onStatus = function (fn) { if (typeof fn !== 'function') { return function () {}; } fns.push(fn); return function () { var i = fns.indexOf(fn); if (i >= 0) { fns.splice(i, 1); } }; };
    api.isAuto = isAuto;
    api.setAuto = function (on) {
        writeKey(AUTO_KEY, on ? 'on' : 'off');
        if (on) { st.stopped = false; if (D.isConnected()) { startTimers(); takeLease(); } } else { releaseLease(); }
        emit();
    };
    api.lastTimes = function () {
        var s = getSync(), out = [], ks = Object.keys(s), i;
        for (i = 0; i < ks.length; i++) { if (s[ks[i]].time) { out.push({ id: ks[i], name: gameName(ks[i]), time: s[ks[i]].time }); } }
        out.sort(function (a, b) { return b.time - a.time; });
        return out;
    };
    api.runNow = function (cb) { st.nextTry = 0; run({ force: true }, cb); };
    api.prompts = prompts;
    api.checkNewer = checkNewer;
    // Gets the Drive text for a prompt. The caller must preview it and apply it through FongGameSaves.importJSON.
    api.load = function (game, cb) {
        var p = has(pending, game) ? pending[game] : null;
        if (!p) { cb({ code: 'missing', message: 'That backup is no longer waiting.' }); return; }
        D.restore(p.meta.id, function (e, text) { cb(e || null, text, p.meta); });
    };
    // Call after the restore was applied, so the same backup is not offered again and the next autosave is allowed.
    api.markLoaded = function (game, meta) {
        var info = gameInfo(game), s = getSync()[game] || { day: '' };
        putSync(game, { hash: info ? info.hash : '', version: meta && meta.version ? meta.version : '', time: now(), fileId: meta && meta.id ? meta.id : '', day: s.day });
        delete pending[game]; emit();
    };
    api.dismiss = function (game) { if (has(pending, game)) { dismissed[game + ':' + pending[game].meta.version] = true; emit(); } };
    api.dismissError = function () { if (st.phase === 'error') { setStatus(D.isConnected() ? 'connected' : 'off', '', false); } };
    // From a tap: the real sign-in window.
    api.reconnect = function (cb) { st.stopped = false; D.connect(function (e, r) { if (e) { setStatus('reconnect', 'Tap to reconnect', true); } if (cb) { cb(e, r); } }); };
    api.disconnect = function (cb) { removeKey(WAS_KEY); st.stopped = false; D.disconnect(cb); };
    api.flush = flush;
    api._tick = tick;
    api._run = run;
    api._lease = takeLease;
    api._state = st;

    // ---- page events and start ----------------------------------------------
    try { if (typeof w.BroadcastChannel === 'function') { chan = new w.BroadcastChannel('fong-gdrive'); chan.onmessage = function (m) { if (m && m.data && m.data.tab !== tab && m.data.type === 'last') { adoptLast(Number(m.data.last)); } }; } } catch (e) { chan = null; }
    if (w.addEventListener) {
        w.addEventListener('storage', onStorage);
        w.addEventListener('pagehide', function () { flush(); releaseLease(); });
    }
    if (doc && doc.addEventListener) {
        doc.addEventListener('visibilitychange', function () {
            if (doc.visibilityState === 'hidden') { flush(); }
            else if (D.isConnected() && isAuto()) { w.setTimeout(function () { tick(); }, 500); }
        });
    }
    var o = readObj(STATUS_KEY);
    if (o && Number(o.last) > 0) { st.last = Number(o.last); }
    if (D.isConfigured() && readKey(WAS_KEY) === '1' && isAuto()) { w.setTimeout(trySilent, 0); }

    w.FongGDriveAuto = api;
})(window);
