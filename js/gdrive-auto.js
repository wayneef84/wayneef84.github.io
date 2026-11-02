/**
 * FongGDriveAuto: optional autosave and "Drive has a newer save" check on top of js/gdrive-backup.js (FongGDrive).
 * Does nothing until the user has connected. The access token is never stored or sent between tabs.
 * Device keys (not in the game saves manifest, never exported): fong.gdrive.sync, .auto, .was, .lease, .status, .device,
 * and fong.undo.<game> (one-step undo copy made before a Drive save replaces a game's data).
 * One rolling file per game (fong-auto-<game>.json, updated in place), one dated copy per game per day (7 kept).
 * Before a rolling file is overwritten BOTH must pass: Drive still has the version this device last wrote (or the same
 * content), and the Drive file was not saved after this device last changed the game. If either fails, autosave pauses
 * for that game only and asks (Keep this device, Load the Drive save, Decide later). Version is the authority because
 * clocks differ. Only one tab uploads (a lease in localStorage). Restores are never done here: the UI passes the text
 * through FongGameSaves.importJSON (preview, gate, rollback).
 * Strict ES5. Docs: docs/GAMESAVES.md
 */
(function (w) {
    'use strict';

    var D = w.FongGDrive;
    if (!D) { return; }
    var doc = w.document;
    var SYNC_KEY = 'fong.gdrive.sync', AUTO_KEY = 'fong.gdrive.auto', WAS_KEY = 'fong.gdrive.was';
    var LEASE_KEY = 'fong.gdrive.lease', STATUS_KEY = 'fong.gdrive.status', DEVICE_KEY = 'fong.gdrive.device', UNDO_PREFIX = 'fong.undo.';
    var TICK_MS = 30000, MIN_GAP = 5 * 60000, LEASE_MS = 30000, RENEW_MS = 10000, LEASE_WAIT_MS = 200, SILENT_GAP = 5 * 60000;
    var BACKOFF_START = 60000, BACKOFF_MAX = 30 * 60000, FLUSH_MAX = 60000, VERIFIED_MS = 60000, FULL_MS = 10 * 60000;

    var tab = 't' + Math.floor(Math.random() * 1e9).toString(36) + Date.now().toString(36);
    var nonce = '';
    var st = { phase: 'off', text: '', sticky: false, seq: 0, last: 0, backoff: 0, nextTry: 0, stopped: false, busy: false, leader: false, claiming: false, silentAt: 0, silentBusy: false };
    var fns = [], pending = {}, dismissed = {}, blocked = {}, verified = {}, files = null, tickTimer = 0, renewTimer = 0, chan = null, leaseWaiters = [];
    var sigs = {}, infos = {}, lastScan = null, lastFull = 0, dirty = true, hooked = false;
    var api = { _hashes: 0 };

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
    function utf8len(s) { try { return unescape(encodeURIComponent(s)).length; } catch (e) { return s.length * 3; } }

    // ---- device state ---------------------------------------------------
    function isAuto() { return readKey(AUTO_KEY) === 'on'; }
    function blank() { return { hash: '', version: '', time: 0, fileId: '', day: '', seen: '', changed: 0 }; }
    function getSync() {
        var o = readObj(SYNC_KEY) || {}, out = {}, ks = Object.keys(o), i, v;
        for (i = 0; i < ks.length; i++) {
            v = o[ks[i]];
            if (ks[i] !== '__proto__' && v && typeof v === 'object') {
                out[ks[i]] = { hash: typeof v.hash === 'string' ? v.hash : '', version: typeof v.version === 'string' ? v.version : '', time: Number(v.time) || 0,
                    fileId: typeof v.fileId === 'string' ? v.fileId : '', day: typeof v.day === 'string' ? v.day : '', seen: typeof v.seen === 'string' ? v.seen : '', changed: Number(v.changed) || 0 };
            }
        }
        return out;
    }
    function recOf(id) { return getSync()[id] || blank(); }
    function patchSync(id, patch) {
        var all = getSync(), r = all[id] || blank(), k;
        for (k in patch) { if (has(patch, k)) { r[k] = patch[k]; } }
        all[id] = r; writeKey(SYNC_KEY, JSON.stringify(all));
        lastScan = null;   // what counts as changed has moved
        return r;
    }
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
        api._hashes++;
        if (!r || !r.text) { return null; }
        try { d = JSON.parse(r.text); } catch (e) { return null; }
        if (!d || !d.data || !Object.keys(d.data).length) { return null; }
        return { hash: fnv(JSON.stringify(d.data)), text: r.text, warnings: r.warnings || [] };
    }
    // The file text with its saved time set to t (ISO), so the text and appProperties.savedAt agree.
    function stamp(text, t) {
        try { var d = JSON.parse(text); d.saved = new Date(t).toISOString(); return JSON.stringify(d, null, 2); } catch (e) { return text; }
    }
    function gameName(id) {
        var all = w.FongGameSaves ? w.FongGameSaves.manifest() : [], i;
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

    // ---- change detection: a cheap signature first, hashing only when it moved -------
    function sample(v) { return v.length + ':' + v.substr(0, 16) + v.substr(Math.max(0, v.length - 16)); }
    function signature(g, allKeys) {
        var parts = [], i, v, k;
        for (i = 0; i < g.keys.length; i++) { v = readKey(g.keys[i]); parts.push(v === null ? '-' : sample(v)); }
        if (g.prefixes.length) {
            var mine = [];
            for (i = 0; i < allKeys.length; i++) {
                k = allKeys[i];
                for (var j = 0; j < g.prefixes.length; j++) { if (k.indexOf(g.prefixes[j]) === 0 && g.keys.indexOf(k) < 0) { mine.push(k); break; } }
            }
            mine.sort();
            for (i = 0; i < mine.length; i++) { v = readKey(mine[i]); parts.push(mine[i] + '=' + (v === null ? '-' : sample(v))); }
        }
        return parts.join('|');
    }
    function storageKeys(needed) {
        var out = [], n = 0, i, k;
        if (!needed) { return out; }
        try { n = w.localStorage.length; } catch (e) { return out; }
        for (i = 0; i < n; i++) { try { k = w.localStorage.key(i); } catch (e2) { k = null; } if (typeof k === 'string') { out.push(k); } }
        return out;
    }
    // Where the browser lets us, writes mark the state dirty, so an idle page does no work at all. A full pass still
    // runs every 10 minutes as a safety net. Without the hook (old browsers) the cheap signature is compared each time.
    function hookStorage() {
        try {
            var P = w.Storage && w.Storage.prototype, names = ['setItem', 'removeItem', 'clear'], i;
            if (!P) { return; }
            for (i = 0; i < names.length; i++) {
                (function (name) {
                    var orig = P[name];
                    if (typeof orig !== 'function') { return; }
                    P[name] = function (k) { if (name === 'clear' || typeof k !== 'string' || k.indexOf('fong.gdrive.') !== 0) { dirty = true; } return orig.apply(this, arguments); };
                })(names[i]);
            }
            hooked = true;
        } catch (e) { hooked = false; }
    }

    // Per game: { id, info, rec } for games whose data differs from what Drive was last given. Updates "last changed".
    function scan(force) {
        var t = now(), G = w.FongGameSaves;
        if (!G) { return []; }
        if (!force && hooked && !dirty && lastScan && t - lastFull < FULL_MS) { return lastScan; }
        var full = !!force || t - lastFull >= FULL_MS;
        dirty = false;
        if (full) { lastFull = t; }
        var man = G.manifest(), out = [], i, g, sig, info, rec, needKeys = false, allKeys;
        for (i = 0; i < man.length; i++) { if (man[i].prefixes.length) { needKeys = true; } }
        allKeys = storageKeys(needKeys);
        for (i = 0; i < man.length; i++) {
            g = man[i];
            sig = signature(g, allKeys);
            if (!full && has(sigs, g.id) && sigs[g.id] === sig) { info = infos[g.id]; }
            else { info = gameInfo(g.id); infos[g.id] = info; sigs[g.id] = sig; }
            if (!info) { continue; }
            rec = recOf(g.id);
            if (rec.seen !== info.hash) { rec = patchSync(g.id, { seen: info.hash, changed: t }); }   // the device changed this game now
            if (has(pending, g.id) && pending[g.id].meta.hash && pending[g.id].meta.hash === info.hash) { delete pending[g.id]; delete dismissed[g.id]; updatePauseStatus(); }
            if (rec.hash !== info.hash) { out.push({ id: g.id, info: info, rec: rec, time: rec.time }); }
        }
        lastScan = out;
        return out;
    }

    // ---- status ---------------------------------------------------------
    function prompts() {
        var out = [], ks = Object.keys(pending), i, p;
        for (i = 0; i < ks.length; i++) {
            p = pending[ks[i]];
            out.push({ game: p.game, name: gameName(p.game), reason: p.reason, later: !!dismissed[p.game], meta: p.meta,
                driveTime: p.meta.savedAt || Date.parse(p.meta.modified) || 0, deviceTime: p.deviceTime || 0 });
        }
        return out;
    }
    function getStatus() {
        return { phase: st.phase, text: st.text, sticky: st.sticky, seq: st.seq, last: st.last, connected: D.isConnected(), auto: isAuto(),
            leader: st.leader, perRun: D.MAX_GAMES_PER_RUN, prompts: prompts() };
    }
    function emit() { var s = getStatus(), i; for (i = 0; i < fns.length; i++) { try { fns[i](s); } catch (e) { /* ignore */ } } }
    // Only a real change of phase or text is announced, so a quiet tab does not repeat itself every 30 seconds.
    function setStatus(phase, text, sticky) {
        if (st.phase === phase && st.text === (text || '') && st.sticky === !!sticky) { return; }
        st.phase = phase; st.text = text || ''; st.sticky = !!sticky; st.seq++; emit();
    }
    function updatePauseStatus() {
        var ks = Object.keys(pending), later = 0, i;
        for (i = 0; i < ks.length; i++) { if (dismissed[ks[i]]) { later++; } }
        if (ks.length) {
            setStatus('paused', ks.length === 1 ? 'Auto backup is paused for ' + gameName(ks[0]) + (later ? ' until the page closes or you decide.' : ' until you decide.') : 'Auto backup is paused for ' + ks.length + ' games until you decide.', true);
        } else if (st.phase === 'paused') { setStatus(D.isConnected() ? 'connected' : 'off', '', false); }
        emit();
    }
    function shareLast() {
        writeKey(STATUS_KEY, JSON.stringify({ last: st.last, tab: tab, t: now() }));
        try { if (chan) { chan.postMessage({ type: 'last', last: st.last, tab: tab }); } } catch (e) { /* ignore */ }
    }
    function adoptLast(t) { if (typeof t === 'number' && isFinite(t) && t > st.last && t <= now() + 60000) { st.last = t; emit(); } }
    function onStorage(e) {
        if (!e) { return; }
        if (e.key !== STATUS_KEY && e.key !== SYNC_KEY) { dirty = true; return; }
        var o = readObj(STATUS_KEY);
        if (o && o.tab !== tab) { adoptLast(Number(o.last)); }
        if (e.key === SYNC_KEY) { emit(); }
    }

    // ---- lease: only one tab uploads. Claim with a random nonce, wait a moment, and only proceed if it is still ours -------
    function leaseRead() { return readObj(LEASE_KEY); }
    function leaseWrite() { writeKey(LEASE_KEY, JSON.stringify({ tab: tab, until: now() + LEASE_MS, nonce: nonce })); }
    function ensureLeader(cb) {
        var t = now(), l = leaseRead();
        if (l && l.tab === tab && nonce && l.nonce === nonce && l.until > t) { leaseWrite(); st.leader = true; cb(true); return; }
        if (l && typeof l.until === 'number' && l.until > t && l.tab !== tab) { st.leader = false; cb(false); return; }
        leaseWaiters.push(cb);
        if (st.claiming) { return; }
        st.claiming = true;
        nonce = 'n' + Math.floor(Math.random() * 1e9).toString(36) + t.toString(36);
        leaseWrite();
        w.setTimeout(function () {
            var l2 = leaseRead(), ok = !!(l2 && l2.tab === tab && l2.nonce === nonce), list = leaseWaiters, i;
            st.claiming = false; st.leader = ok; leaseWaiters = [];
            for (i = 0; i < list.length; i++) { list[i](ok); }
        }, typeof api._leaseMs === 'number' ? api._leaseMs : LEASE_WAIT_MS);
    }
    function renewLease() {
        if (!st.leader) { return; }
        var l = leaseRead();
        if (l && l.tab === tab && l.nonce === nonce) { leaseWrite(); } else { st.leader = false; }
    }
    function releaseLease() {
        var l = leaseRead();
        if (l && l.tab === tab) { removeKey(LEASE_KEY); }
        st.leader = false;
    }

    // ---- uploading ------------------------------------------------------------
    function autoName(id) { return 'fong-auto-' + id + '.json'; }
    function findIn(items, id) {
        var i;
        for (i = 0; i < items.length; i++) { if (items[i].type === 'auto' && items[i].scope === id) { return items[i]; } }
        return null;
    }
    function setPause(id, reason, meta) {
        var r = recOf(id);
        pending[id] = { game: id, reason: reason, meta: { id: meta.id, version: meta.version || '', modified: meta.modified || '', savedAt: meta.savedAt || 0, hash: meta.hash || '' }, deviceTime: r.changed || r.time || 0 };
        updatePauseStatus();
    }

    // Writes one game. cb(err, outcome): 'saved', 'same' or 'conflict'. opts.overwrite skips the checks (Keep this device).
    function uploadGame(id, info, opts, cb) {
        opts = opts || {};
        var s = recOf(id), t = now();
        var props = { game: id, hash: info.hash, device: deviceName(), savedAt: String(t) };
        var text = stamp(info.text, t);
        function finish(r) {
            patchSync(id, { hash: info.hash, version: r.version || '', time: t, fileId: r.id || s.fileId, seen: info.hash });
            verified[id] = t;
            dailyCopy(id, info, text, function () { cb(null, 'saved'); });
        }
        function create() {
            D.createFile(autoName(id), text, props, function (e, r) {
                if (e) { cb(e); return; }
                finish(r);
            });
        }
        function update(fileId) {
            D.updateFile(fileId, text, props, function (e, r) {
                if (e && e.code === 'missing') { create(); return; }
                if (e) { cb(e); return; }
                if (!r.id) { r.id = fileId; }
                finish(r);
            });
        }
        function checked(meta) {
            if (meta.hash && meta.hash === info.hash && !opts.overwrite) {   // Drive already has this exact data
                patchSync(id, { hash: info.hash, version: meta.version, time: t, fileId: meta.id, seen: info.hash });
                verified[id] = t; cb(null, 'same'); return;
            }
            var versionOk = (s.version && meta.version === s.version) || (s.hash && meta.hash === s.hash);
            var timeOk = !(meta.savedAt && s.changed && meta.savedAt > s.changed);
            if (!opts.overwrite && (!versionOk || !timeOk)) { setPause(id, 'newer', meta); cb(null, 'conflict'); return; }
            update(meta.id);
        }
        // Fresh list right before a create, so two devices do not both make the file.
        function byList() {
            D.list(function (e, items) {
                if (e) { cb(e); return; }
                files = items;
                var f = findIn(items, id);
                if (f) { checked(f); } else { create(); }
            });
        }
        if (opts.overwrite && opts.fileId) { update(opts.fileId); return; }
        if (s.fileId) {
            D.getMeta(s.fileId, function (e, meta) {
                if (e && e.code === 'missing') { byList(); return; }
                if (e) { cb(e); return; }
                checked(meta);
            });
        } else { byList(); }
    }

    // One dated copy per game per day: the first save of that day (the data as it is then, not the state before).
    function dailyCopy(id, info, text, done) {
        var day = ymd(now()), rec = recOf(id);
        if (rec.day === day) { done(); return; }
        D.list(function (e, items) {
            var i, exists = false;
            if (e) { done(); return; }
            files = items;
            for (i = 0; i < items.length; i++) { if (items[i].type === 'daily' && items[i].scope === id && items[i].day === day) { exists = true; } }
            if (exists) { patchSync(id, { day: day }); done(); return; }
            D.createFile('fong-daily-' + id + '-' + day + '.json', text, { game: id, hash: info.hash, savedAt: String(now()) }, function (e2) {
                if (e2) { done(); return; }   // the daily copy is a bonus: a failure here never fails the backup
                patchSync(id, { day: day });
                D.prune('daily', id, D.KEEP_DAILY, function () { done(); });
            });
        });
    }

    function errorStop(e) {
        if (e.code === 'auth') { st.stopped = true; setStatus('reconnect', 'Tap to reconnect', true); return; }
        st.backoff = st.backoff ? Math.min(st.backoff * 2, BACKOFF_MAX) : BACKOFF_START;
        st.nextTry = now() + st.backoff;
        setStatus('error', e.message, true);
    }

    function eligible(force) {
        var list = scan(!!force), t = now(), out = [], i, it;
        for (i = 0; i < list.length; i++) {
            it = list[i];
            if (has(pending, it.id)) { continue; }                       // paused for this game
            if (blocked[it.id] === it.info.hash) { continue; }
            if (!force && it.rec.time && t - it.rec.time < MIN_GAP) { continue; }
            out.push(it);
        }
        out.sort(function (a, b) { return a.time - b.time; });   // least recently backed up first, so the games take turns
        return out;
    }
    function pausedNames() { var ks = Object.keys(pending), out = [], i; for (i = 0; i < ks.length; i++) { out.push(gameName(ks[i])); } return out; }

    // opts.force: Back up now (every changed game, no waiting time, still respects a pause). Calls cb(err, {saved, conflicts, paused}).
    function run(opts, cb) {
        opts = opts || {}; cb = typeof cb === 'function' ? cb : function () {};
        if (st.busy) { cb(null, { saved: 0, conflicts: 0, paused: pausedNames(), busy: true }); return; }
        if (!D.isConnected()) { cb({ code: 'auth', message: 'Not connected.' }); return; }
        ensureLeader(function (ok) {
            if (!ok) { setStatus('another', 'Another window is backing up', false); cb(null, { saved: 0, conflicts: 0, paused: pausedNames(), another: true }); return; }
            if (st.phase === 'another') { setStatus('connected', '', false); }
            if (st.busy) { cb(null, { saved: 0, conflicts: 0, paused: pausedNames(), busy: true }); return; }
            var list = eligible(!!opts.force);
            if (!opts.force) { list = list.slice(0, D.MAX_GAMES_PER_RUN); }
            var saved = 0, conflicts = 0, i = 0;
            if (!list.length) { cb(null, { saved: 0, conflicts: 0, paused: pausedNames() }); return; }
            st.busy = true;
            function done(e) {
                st.busy = false;
                if (!e) {
                    st.backoff = 0; st.nextTry = 0;
                    if (saved) { st.last = now(); setStatus('backedup', 'Backed up ' + fmtTime(st.last), false); shareLast(); }
                }
                cb(e || null, { saved: saved, conflicts: conflicts, paused: pausedNames() });
            }
            (function next() {
                if (i >= list.length) { done(null); return; }
                var item = list[i++];
                if (item.info.warnings.length) {   // a backup that cannot be restored is not saved
                    blocked[item.id] = item.info.hash;
                    setStatus('error', 'Not backed up. ' + item.info.warnings[0], true);
                    next(); return;
                }
                uploadGame(item.id, item.info, {}, function (e, out) {
                    if (e) { st.busy = false; errorStop(e); cb(e, { saved: saved, conflicts: conflicts, paused: pausedNames() }); return; }
                    if (out === 'saved') { saved++; } else if (out === 'conflict') { conflicts++; }
                    next();
                });
            })();
        });
    }

    function tick(cb) {
        cb = typeof cb === 'function' ? cb : function () {};
        if (doc && doc.visibilityState === 'hidden') { cb(null, null); return; }
        if (!isAuto() || st.stopped) { cb(null, null); return; }
        if (!D.isConnected()) { trySilent(); cb(null, null); return; }
        if (now() < st.nextTry) { cb(null, null); return; }
        run({}, cb);
    }

    // Best effort when the page is going away. Small files only (UTF-8 bytes, about 60 KB with overhead). If the Drive copy
    // was not checked in the last minute it is checked first. The sync record is only written when Drive says it worked.
    function flush() {
        if (!isAuto() || !D.isConnected() || !st.leader || st.busy || st.stopped) { return 0; }
        var list = eligible(true).slice(0, D.MAX_GAMES_PER_RUN), n = 0, i;
        function send(it, s, text, props) {
            D.updateFile(s.fileId, text, props, function (e, r) {
                if (e) { return; }
                patchSync(it.id, { hash: it.info.hash, version: r.version || s.version, time: now(), seen: it.info.hash });
                verified[it.id] = now();
            }, { keepalive: true });
        }
        for (i = 0; i < list.length; i++) {
            (function (it) {
                var s = recOf(it.id), t = now(), text = stamp(it.info.text, t), props = { game: it.id, hash: it.info.hash, device: deviceName(), savedAt: String(t) };
                if (!s.fileId || it.info.warnings.length || utf8len(text) + utf8len(JSON.stringify(props)) + 400 > FLUSH_MAX) { return; }
                n++;
                if (verified[it.id] && t - verified[it.id] <= VERIFIED_MS) { send(it, s, text, props); return; }
                D.getMeta(s.fileId, function (e, meta) {
                    if (e) { return; }
                    var versionOk = (s.version && meta.version === s.version) || (s.hash && meta.hash === s.hash);
                    var timeOk = !(meta.savedAt && s.changed && meta.savedAt > s.changed);
                    if (versionOk && timeOk) { send(it, s, text, props); }
                });
            })(list[i]);
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
        if (!isAuto()) { return; }
        if (!tickTimer) { tickTimer = w.setInterval(function () { tick(); }, TICK_MS); }
        if (!renewTimer) { renewTimer = w.setInterval(function () { if (D.isConnected() && isAuto()) { ensureLeader(function () {}); } }, RENEW_MS); }
    }
    function stopTimers() {
        if (tickTimer) { w.clearInterval(tickTimer); tickTimer = 0; }
        if (renewTimer) { w.clearInterval(renewTimer); renewTimer = 0; }
    }

    // Looks at the auto files on Drive and pauses a game whose Drive copy would block an upload (same test as the upload):
    // a different version than this device last wrote, or saved after this device last changed the game.
    // Equal copies, and a Drive file that holds what this device last synced, are not offered.
    function checkNewer(cb) {
        cb = typeof cb === 'function' ? cb : function () {};
        D.list(function (e, items) {
            if (e) { cb(e); return; }
            files = items;
            var i, f, info, s, known = {}, all = w.FongGameSaves ? w.FongGameSaves.manifest() : [];
            for (i = 0; i < all.length; i++) { known[all[i].id] = true; }
            for (i = 0; i < items.length; i++) {
                f = items[i];
                if (f.type !== 'auto' || !known[f.scope]) { continue; }
                info = gameInfo(f.scope); s = recOf(f.scope);
                if (info && f.hash && f.hash === info.hash) {
                    patchSync(f.scope, { hash: info.hash, version: f.version, time: now(), fileId: f.id, seen: info.hash });
                    delete pending[f.scope]; delete dismissed[f.scope]; continue;
                }
                if (f.hash && s.hash && f.hash === s.hash) { continue; }   // Drive holds what this device last synced
                var versionOk = s.version && f.version === s.version;
                var timeOk = !(f.savedAt && s.changed && f.savedAt > s.changed);
                if (versionOk && timeOk) { continue; }
                setPause(f.scope, 'newer', { id: f.id, version: f.version, modified: f.modified || f.time, savedAt: f.savedAt, hash: f.hash });
            }
            updatePauseStatus(); cb(null);
        });
    }

    function onConnection(connected) {
        if (connected) {
            writeKey(WAS_KEY, '1');
            if (readKey(AUTO_KEY) === null) { writeKey(AUTO_KEY, 'on'); }
            st.stopped = false; st.backoff = 0; st.nextTry = 0; st.silentBusy = false;
            setStatus('connected', 'Connected', false);
            startTimers();
            if (isAuto()) { ensureLeader(function () {}); }
            checkNewer(function () { if (isAuto()) { tick(); } });
        } else {
            stopTimers(); releaseLease(); pending = {}; dismissed = {}; files = null; verified = {};
            if (st.phase !== 'reconnect') { setStatus('off', '', false); }
        }
    }
    D.onChange(onConnection);

    // ---- one-step undo for a Drive load (any game). Not in the manifest, never exported. ------------
    function stash(game) {
        var G = w.FongGameSaves, snap = G && G.snapshot(game);
        if (!snap) { return false; }
        if (!writeKey(UNDO_PREFIX + game, JSON.stringify({ time: now(), data: snap.data }))) { return false; }
        return readKey(UNDO_PREFIX + game) !== null;
    }
    function undoList() {
        var all = w.FongGameSaves ? w.FongGameSaves.manifest() : [], out = [], i, o;
        for (i = 0; i < all.length; i++) {
            o = readObj(UNDO_PREFIX + all[i].id);
            if (o && o.data) { out.push({ id: all[i].id, name: all[i].name, time: Number(o.time) || 0 }); }
        }
        return out;
    }
    function undo(game) {
        var G = w.FongGameSaves, o = readObj(UNDO_PREFIX + game);
        if (!G || !o || !o.data || !G.rollback({ game: game, data: o.data })) { return false; }
        removeKey(UNDO_PREFIX + game);
        patchSync(game, { changed: now() });
        dirty = true;
        return true;
    }

    // ---- public ---------------------------------------------------------------
    api.getStatus = getStatus;
    api.onStatus = function (fn) { if (typeof fn !== 'function') { return function () {}; } fns.push(fn); return function () { var i = fns.indexOf(fn); if (i >= 0) { fns.splice(i, 1); } }; };
    api.isAuto = isAuto;
    api.setAuto = function (on) {
        writeKey(AUTO_KEY, on ? 'on' : 'off');
        if (on) { st.stopped = false; if (D.isConnected()) { startTimers(); ensureLeader(function () {}); } }
        else { stopTimers(); releaseLease(); }
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
    // Gets the Drive text for a paused game. The caller must preview it and apply it through FongGameSaves.importJSON.
    api.load = function (game, cb) {
        var p = has(pending, game) ? pending[game] : null;
        if (!p) { cb({ code: 'missing', message: 'That backup is no longer waiting.' }); return; }
        D.restore(p.meta.id, function (e, text) { cb(e || null, text, p.meta); });
    };
    // After a Drive load was applied. Only counts when the user replaced, or when the device now holds exactly the Drive
    // data. A merge that changed nothing leaves the pause in place, so the newer Drive copy is never overwritten by accident.
    api.markLoaded = function (game, meta, mode) {
        var info = gameInfo(game), t = now();
        dirty = true; delete sigs[game];
        if (!meta || !(mode === 'replace' || (info && meta.hash && info.hash === meta.hash))) { return false; }
        patchSync(game, { hash: info ? info.hash : '', version: meta.version || '', time: t, fileId: meta.id || '', seen: info ? info.hash : '', changed: t });
        delete pending[game]; delete dismissed[game]; updatePauseStatus();
        return true;
    };
    // After a restore the user chose by hand (a file, or a Drive save point): the device is now as the user wants it, so a
    // paused game is released and may overwrite Drive. Keep this device does the same on purpose without a restore.
    api.afterRestore = function (ids) {
        var i, p, t = now();
        dirty = true;
        for (i = 0; i < ids.length; i++) {
            delete sigs[ids[i]];
            if (has(pending, ids[i])) {
                p = pending[ids[i]];
                patchSync(ids[i], { version: p.meta.version, changed: t });
                delete pending[ids[i]]; delete dismissed[ids[i]];
            }
        }
        updatePauseStatus();
    };
    // Keep this device: overwrite the Drive copy with this device's data. The caller asks the grown-ups question first.
    api.keepDevice = function (game, cb) {
        var p = has(pending, game) ? pending[game] : null, info = gameInfo(game);
        if (!p) { cb({ code: 'missing', message: 'Nothing is waiting for that game.' }); return; }
        if (!info) { cb({ code: 'nodata', message: 'This device has no saved data for that game. Load the Drive save instead.' }); return; }
        if (!D.isConnected()) { cb({ code: 'auth', message: 'Not connected.' }); return; }
        if (info.warnings.length) { cb({ code: 'toobig', message: 'Not backed up. ' + info.warnings[0] }); return; }
        uploadGame(game, info, { overwrite: true, fileId: p.meta.id }, function (e) {
            if (e) { cb(e); return; }
            delete pending[game]; delete dismissed[game];
            st.last = now(); shareLast(); updatePauseStatus(); setStatus('backedup', 'Backed up ' + fmtTime(st.last), false);
            cb(null);
        });
    };
    api.dismiss = function (game) { if (has(pending, game)) { dismissed[game] = true; updatePauseStatus(); } };
    api.dismissError = function () { if (st.phase === 'error') { setStatus(D.isConnected() ? 'connected' : 'off', '', false); } };
    api.reconnect = function (cb) { st.stopped = false; D.connect(function (e, r) { if (e) { setStatus('reconnect', 'Tap to reconnect', true); } if (cb) { cb(e, r); } }); };
    api.disconnect = function (cb) { removeKey(WAS_KEY); st.stopped = false; D.disconnect(cb); };
    api.stash = stash; api.undo = undo; api.undoList = undoList;
    api.flush = flush;
    api.markDirty = function () { dirty = true; };
    api._tick = tick; api._run = run; api._lease = ensureLeader; api._state = st; api._scan = scan; api._hooked = function () { return hooked; };
    api._adoptLast = adoptLast; api._timers = function () { return { tick: !!tickTimer, renew: !!renewTimer }; };

    // ---- page events and start ----------------------------------------------
    hookStorage();
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
    var o0 = readObj(STATUS_KEY);
    if (o0 && Number(o0.last) > 0) { st.last = Math.min(Number(o0.last), now()); }
    if (D.isConfigured() && readKey(WAS_KEY) === '1' && isAuto()) { w.setTimeout(trySilent, 0); }

    w.FongGDriveAuto = api;
})(window);
