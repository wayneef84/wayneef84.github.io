/**
 * FongGDrive: optional "Back up to Google Drive" for game saves. Manual file export and import stay as they are.
 * Off until js/gdrive-config.js holds a Client ID. Google's script (accounts.google.com/gsi/client) is loaded
 * ONLY after the user taps Connect, injected from here. Nothing else touches the network.
 * Token model only (Google Identity Services, scope drive.appdata). No server, no secret, no refresh token.
 * The access token lives in memory only and is never written to storage, so each visit needs a tap on Connect.
 * Files go to the hidden appDataFolder. Restore only returns text: the caller must pass it through
 * FongGameSaves.importJSON (preview, manifest-only keys, size limits, rollback). A Drive file is untrusted input.
 * js/gdrive-auto.js builds optional autosave on the primitives exported here (getMeta, createFile, updateFile, prune).
 * Callbacks are cb(err, result). err is null or { code, message } where message is plain language.
 * Strict ES5. No innerHTML. Docs: docs/GDRIVE_SETUP.md, docs/GAMESAVES.md
 */
(function (w) {
    'use strict';

    var doc = w.document;
    var GIS_URL = 'https://accounts.google.com/gsi/client';
    var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
    var API = 'https://www.googleapis.com/drive/v3/files';
    var UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
    var KEEP = 10;
    var NOT_SET_UP = 'Not set up yet. See docs/GDRIVE_SETUP.md';
    var NAME_RE = /^fong-([A-Za-z0-9_.-]{1,60}?)-(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\.json$/;
    var AUTO_RE = /^fong-auto-([A-Za-z0-9_.-]{1,60})\.json$/;
    var DAILY_RE = /^fong-daily-([A-Za-z0-9_.-]{1,60}?)-(\d{4}-\d{2}-\d{2})\.json$/;
    var KEEP_DAILY = 7;
    var MAX_GAMES_PER_RUN = 1;   // autosave uploads this many changed games per run (oldest change first, they take turns)
    var CONNECT_MS = 120000;     // a sign-in that never answers is given up after this long
    var SILENT_MS = 8000;        // quiet reconnect on page open
    var DISCONNECT_MS = 3000;    // revoke may never call back
    var changeFns = [];
    var ID_RE = /^[A-Za-z0-9_-]{1,200}$/;

    var token = '', expires = 0;
    var tokenClient = null, clientUsed = '';
    var gisLoading = false, gisWaiters = [], gisEl = null, gisTimer = 0;
    var pendingConnect = null;

    function err(code, message) { return { code: code, message: message }; }
    function once(cb) {
        var done = false;
        return function (e, r) { if (done) { return; } done = true; if (typeof cb === 'function') { cb(e || null, r); } };
    }
    function clientId() {
        var id = w.FONG_GDRIVE_CLIENT_ID;
        return typeof id === 'string' ? id.replace(/^\s+|\s+$/g, '') : '';
    }
    function isConfigured() { return clientId().length > 0; }
    function isConnected() { return !!token && Date.now() < expires; }
    function offline() { return !!(w.navigator && w.navigator.onLine === false); }
    function offlineErr() { return err('offline', 'You are offline. Connect to the internet and try again.'); }
    function needConnect() { return err('auth', 'Google Drive is not connected, or the sign-in ran out. Tap Connect and try again.'); }
    function retryMs() { return typeof api._retryMs === 'number' ? api._retryMs : 1200; }

    // ---- connecting ----------------------------------------------------

    function gisReady() { return !!(w.google && w.google.accounts && w.google.accounts.oauth2); }

    function fireChange() {
        for (var i = 0; i < changeFns.length; i++) { try { changeFns[i](isConnected()); } catch (e) { /* ignore */ } }
    }
    function setToken(t, exp) { token = t; expires = exp; fireChange(); }
    function clearToken() { var had = !!token; token = ''; expires = 0; if (had) { fireChange(); } }

    function finishGis(e) {
        gisLoading = false;
        var list = gisWaiters; gisWaiters = [];
        for (var i = 0; i < list.length; i++) { list[i](e); }
    }
    function armGisTimer() {
        w.clearTimeout(gisTimer);
        gisTimer = w.setTimeout(function () { finishGis(err('offline', 'Could not reach Google. Check your connection and try again.')); }, typeof api._gisMs === 'number' ? api._gisMs : 20000);
    }

    // Never injects a second tag: after a timeout the first tag stays and later calls wait on it again.
    function loadGis(cb) {
        if (gisReady()) { cb(null); return; }
        gisWaiters.push(cb);
        if (gisLoading) { return; }
        gisLoading = true;
        armGisTimer();
        if (gisEl) { return; }
        var s = doc.createElement('script');
        gisEl = s;
        s.async = true;
        s.src = GIS_URL;
        s.onload = function () {
            w.clearTimeout(gisTimer); gisEl = null;
            if (gisReady()) { finishGis(null); } else { finishGis(err('load', 'Google sign-in did not start. Try again.')); }
        };
        s.onerror = function () {
            w.clearTimeout(gisTimer); gisEl = null;
            if (s.parentNode) { s.parentNode.removeChild(s); }
            finishGis(offline() ? offlineErr() : err('offline', 'Could not reach Google. Check your connection or any content blocker, then try again.'));
        };
        (doc.head || doc.documentElement).appendChild(s);
    }

    function settle(e, r) {
        var p = pendingConnect; pendingConnect = null;
        if (p) { w.clearTimeout(p.timer); p.cb(e, r); }
    }

    function onToken(resp) {
        if (!resp || resp.error) {
            var code = resp && resp.error ? String(resp.error) : 'unknown';
            if (code === 'access_denied') { settle(err('denied', 'Access was not allowed, so nothing was connected.')); }
            else { settle(err('failed', 'Google sign-in did not finish (' + code.replace(/[^A-Za-z0-9_ -]/g, '').substr(0, 40) + '). Try again.')); }
            return;
        }
        var ok = true;
        try { ok = w.google.accounts.oauth2.hasGrantedAllScopes ? w.google.accounts.oauth2.hasGrantedAllScopes(resp, SCOPE) : true; } catch (e) { ok = true; }
        if (!ok || typeof resp.access_token !== 'string' || !resp.access_token) {
            settle(err('scope', 'Google did not give the arcade permission for its own backup folder. Tap Connect and allow it.'));
            return;
        }
        var secs = Number(resp.expires_in);
        setToken(resp.access_token, Date.now() + ((isFinite(secs) && secs > 60 ? secs : 3600) - 30) * 1000);
        settle(null, { connected: true });
    }

    function onTokenError(e) {
        var t = e && e.type ? String(e.type) : '';
        if (t === 'popup_failed_to_open') { settle(err('popup', 'The sign-in window was blocked. Allow pop-ups for this site, then tap Connect again.')); }
        else if (t === 'popup_closed') { settle(err('closed', 'The sign-in window was closed before it finished. Tap Connect to try again.')); }
        else { settle(err('failed', 'Google sign-in did not finish. Tap Connect to try again.')); }
    }

    // Call from a tap (opts.silent: a quiet try on page open, short timeout, may be blocked).
    // The first tap loads Google's script, so some browsers block the window then: tap Connect again.
    // A new call replaces one that is still waiting. A sign-in that never answers ends after two minutes.
    function connect(cb, opts) {
        cb = once(cb);
        var silent = !!(opts && opts.silent);
        if (!isConfigured()) { cb(err('notconfigured', NOT_SET_UP)); return; }
        if (offline()) { cb(offlineErr()); return; }
        if (pendingConnect) { settle(err('superseded', 'Sign-in was started again.')); }
        var mine = { cb: cb, timer: 0 };
        mine.timer = w.setTimeout(function () {
            if (pendingConnect === mine) { settle(err('timeout', silent ? 'Quiet sign-in did not work.' : 'Google sign-in did not answer. Tap Connect to try again.')); }
        }, typeof api._connectMs === 'number' ? api._connectMs : (silent ? SILENT_MS : CONNECT_MS));
        pendingConnect = mine;
        loadGis(function (e) {
            if (pendingConnect !== mine) { return; }
            if (e) { settle(e); return; }
            try {
                if (!tokenClient || clientUsed !== clientId()) {
                    clientUsed = clientId();
                    tokenClient = w.google.accounts.oauth2.initTokenClient({
                        client_id: clientUsed, scope: SCOPE, callback: onToken, error_callback: onTokenError
                    });
                }
                tokenClient.requestAccessToken({ prompt: '' });
            } catch (x) { settle(err('failed', 'Google sign-in could not start. Try again.')); }
        });
    }

    // Always calls back, even if Google never answers the revoke.
    function disconnect(cb) {
        cb = once(cb);
        var t = token;
        var timer = w.setTimeout(function () { cb(null, { connected: false }); }, typeof api._disconnectMs === 'number' ? api._disconnectMs : DISCONNECT_MS);
        function done() { w.clearTimeout(timer); cb(null, { connected: false }); }
        clearToken();
        if (t && gisReady() && w.google.accounts.oauth2.revoke) {
            try { w.google.accounts.oauth2.revoke(t, done); return; } catch (e) { /* fall through */ }
        }
        done();
    }

    // ---- Drive requests ------------------------------------------------

    function reasonOf(text) {
        try {
            var d = JSON.parse(text);
            var e = d && d.error && d.error.errors && d.error.errors[0];
            return e && typeof e.reason === 'string' ? e.reason : '';
        } catch (x) { return ''; }
    }

    // opts: { method, url, headers, body, create, maxBytes, keepalive }. Calls cb(err, text).
    // Retries once on 429 and rate limits. 5xx is also retried once, except for create (POST) uploads,
    // which are never repeated because the first try may have made the file.
    function request(opts, cb, tried) {
        if (!isConnected()) { clearToken(); cb(needConnect()); return; }
        if (offline()) { cb(offlineErr()); return; }
        var headers = { 'Authorization': 'Bearer ' + token };
        var k;
        if (opts.headers) { for (k in opts.headers) { if (Object.prototype.hasOwnProperty.call(opts.headers, k)) { headers[k] = opts.headers[k]; } } }
        var init = { method: opts.method || 'GET', headers: headers, body: opts.body };
        if (opts.keepalive) { init.keepalive = true; }
        var p;
        try { p = w.fetch(opts.url, init); }
        catch (x) { cb(err('network', 'Could not reach Google Drive.')); return; }
        p.then(function (res) {
            var len = res.headers && typeof res.headers.get === 'function' ? Number(res.headers.get('content-length')) : NaN;
            if (opts.maxBytes && isFinite(len) && len > opts.maxBytes) { return { status: 200, big: true, text: '' }; }
            return res.text().then(function (text) { return { status: res.status, text: text }; });
        }).then(function (r) {
            var s = r.status, reason = s === 403 ? reasonOf(r.text) : '';
            if (r.big) { cb(err('bad', 'That backup is too big to restore.')); return; }
            if (s >= 200 && s < 300) { cb(null, r.text); return; }
            var limited = s === 429 || (s === 403 && /rateLimit/i.test(reason));
            var again = limited || (s >= 500 && !opts.create);
            if (again && !tried && !opts.keepalive) { w.setTimeout(function () { request(opts, cb, true); }, retryMs()); return; }
            if (s === 401) { clearToken(); cb(needConnect()); return; }
            if (s === 403 && /quota/i.test(reason) && !/rateLimit/i.test(reason)) { cb(err('quota', 'Your Google Drive is full, so the backup could not be saved. Free some space and try again.')); return; }
            if (limited) { cb(err('busy', 'Google Drive is busy. Wait a minute and try again.')); return; }
            if (s === 403) { cb(err('forbidden', 'Google Drive said no. Either the Drive API is not turned on for this arcade, or the backup folder permission was not allowed. Tap Connect and allow it, or see docs/GDRIVE_SETUP.md.')); return; }
            if (s === 404) { cb(err('missing', 'That backup was not found. It may have been deleted.')); return; }
            if (s >= 500) { cb(err('busy', 'Google Drive is busy. Wait a minute and try again.')); return; }
            cb(err('http', 'Google Drive returned an error (' + s + ').'));
        }, function () {
            cb(offline() ? offlineErr() : err('network', 'Could not reach Google Drive. Check your connection and try again.'));
        });
    }

    function parseJSON(text) { try { return JSON.parse(text); } catch (e) { return null; } }

    // ---- files ---------------------------------------------------------

    function cleanProps(o) {
        var out = {}, ks = ['hash', 'game', 'device', 'label'], i;
        if (!o || typeof o !== 'object') { return out; }
        for (i = 0; i < ks.length; i++) { if (typeof o[ks[i]] === 'string' && o[ks[i]].length <= 100) { out[ks[i]] = o[ks[i]]; } }
        return out;
    }

    // Kinds: manual (dated, KEEP kept), auto (one rolling file per game), daily (one per day, KEEP_DAILY kept).
    function toItem(f) {
        if (!f || typeof f.id !== 'string' || !ID_RE.test(f.id) || typeof f.name !== 'string') { return null; }
        var m, type, scope, stamp;
        if ((m = DAILY_RE.exec(f.name))) { type = 'daily'; scope = m[1]; stamp = m[2]; }
        else if ((m = AUTO_RE.exec(f.name))) { type = 'auto'; scope = m[1]; stamp = ''; }
        else if ((m = NAME_RE.exec(f.name))) { type = 'manual'; scope = m[1]; stamp = m[2]; }
        else { return null; }   // not one of ours: ignore
        function iso(v) { return typeof v === 'string' && !isNaN(Date.parse(v)) ? new Date(v).toISOString() : ''; }
        var made = iso(f.createdTime), mod = iso(f.modifiedTime);
        var t = type === 'auto' ? (mod || made) : (made || (type === 'manual' ? stamp : stamp + 'T00:00:00.000Z'));
        var size = Number(f.size), props = cleanProps(f.appProperties);
        return { id: f.id, name: f.name, scope: scope, type: type, day: type === 'daily' ? stamp : '', time: t || '', modified: mod, version: typeof f.version === 'string' ? f.version.substr(0, 30) : '',
            hash: props.hash || '', label: props.label || '', size: isFinite(size) ? size : 0 };
    }

    function list(cb) {
        cb = once(cb);
        var items = [], pages = 0;
        function page(token2) {
            var url = API + '?spaces=appDataFolder&orderBy=' + encodeURIComponent('createdTime desc') + '&pageSize=200&fields=' +
                encodeURIComponent('nextPageToken,files(id,name,createdTime,modifiedTime,version,size,appProperties)') + (token2 ? '&pageToken=' + encodeURIComponent(token2) : '');
            request({ method: 'GET', url: url }, function (e, text) {
                if (e) { cb(e); return; }
                var d = parseJSON(text), i, it;
                if (!d || !d.files || Object.prototype.toString.call(d.files) !== '[object Array]') { cb(err('http', 'Google Drive sent a reply the arcade could not read.')); return; }
                for (i = 0; i < d.files.length; i++) { it = toItem(d.files[i]); if (it) { items.push(it); } }
                pages++;
                if (typeof d.nextPageToken === 'string' && d.nextPageToken && pages < 5) { page(d.nextPageToken); return; }
                items.sort(function (a, b) { return a.time < b.time ? 1 : (a.time > b.time ? -1 : 0); });
                cb(null, items);
            });
        }
        page('');
    }

    function remove(fileId, cb) {
        cb = once(cb);
        if (typeof fileId !== 'string' || !ID_RE.test(fileId)) { cb(err('bad', 'That backup id is not valid.')); return; }
        request({ method: 'DELETE', url: API + '/' + fileId }, function (e) { cb(e, e ? undefined : { deleted: true }); });
    }

    function restoreMax() { return (w.FongGameSaves && w.FongGameSaves.MAX_CHARS) || 600000; }

    // Returns the file text only. The caller must pass it through FongGameSaves.importJSON.
    // Content-Length is checked before the body is read, and the length again after.
    function restore(fileId, cb) {
        cb = once(cb);
        if (typeof fileId !== 'string' || !ID_RE.test(fileId)) { cb(err('bad', 'That backup id is not valid.')); return; }
        var max = restoreMax();
        request({ method: 'GET', url: API + '/' + fileId + '?alt=media', maxBytes: max * 4 }, function (e, text) {
            if (e) { cb(e); return; }
            if (typeof text !== 'string' || !text) { cb(err('bad', 'That backup is empty.')); return; }
            if (text.length > max) { cb(err('bad', 'That backup is too big to restore.')); return; }
            cb(null, text);
        });
    }

    // Keeps the newest `keep` files of one kind for one scope. Calls cb(removedCount).
    function prune(type, scope, keep, cb) {
        list(function (e, items) {
            if (e) { cb(0); return; }
            var mine = [], i;
            for (i = 0; i < items.length; i++) { if (items[i].type === type && items[i].scope === scope) { mine.push(items[i]); } }
            mine.sort(function (a, b) {
                var x = type === 'daily' ? a.day : a.time, y = type === 'daily' ? b.day : b.time;
                return x < y ? 1 : (x > y ? -1 : 0);
            });
            var extra = mine.slice(keep), n = 0;
            function next() {
                if (!extra.length) { cb(n); return; }
                var f = extra.shift();
                request({ method: 'DELETE', url: API + '/' + f.id }, function (e2) { if (!e2) { n++; } next(); });
            }
            next();
        });
    }

    function multipart(meta, text) {
        var boundary = 'fong' + Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36);
        while (text.indexOf(boundary) >= 0) { boundary += 'x'; }
        return { type: 'multipart/related; boundary=' + boundary, body: '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(meta) +
            '\r\n--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + text + '\r\n--' + boundary + '--' };
    }

    function fileResult(text) {
        var d = parseJSON(text);
        return { id: d && typeof d.id === 'string' ? d.id : '', version: d && typeof d.version === 'string' ? d.version : '', modified: d && typeof d.modifiedTime === 'string' ? d.modifiedTime : '' };
    }

    // New file in the hidden app folder. props: optional appProperties (strings). Never auto-repeated on a server error.
    function createFile(name, text, props, cb) {
        cb = once(cb);
        var meta = { name: name, parents: ['appDataFolder'], mimeType: 'application/json' };
        if (props) { meta.appProperties = props; }
        var m = multipart(meta, text);
        request({ method: 'POST', create: true, url: UPLOAD + '?uploadType=multipart&fields=' + encodeURIComponent('id,version,modifiedTime'),
            headers: { 'Content-Type': m.type }, body: m.body }, function (e, t) { if (e) { cb(e); } else { var r = fileResult(t); r.name = name; cb(null, r); } });
    }

    // Replace the content of one file in place (and its appProperties). opts.keepalive for a send while the page closes.
    function updateFile(fileId, text, props, cb, opts) {
        cb = once(cb);
        if (typeof fileId !== 'string' || !ID_RE.test(fileId)) { cb(err('bad', 'That backup id is not valid.')); return; }
        var m = multipart({ appProperties: props || {} }, text);
        request({ method: 'PATCH', keepalive: !!(opts && opts.keepalive), url: UPLOAD + '/' + fileId + '?uploadType=multipart&fields=' + encodeURIComponent('id,version,modifiedTime'),
            headers: { 'Content-Type': m.type }, body: m.body }, function (e, t) { if (e) { cb(e); } else { cb(null, fileResult(t)); } });
    }

    // { id, version, modified, hash } for one file, or a 'missing' error.
    function getMeta(fileId, cb) {
        cb = once(cb);
        if (typeof fileId !== 'string' || !ID_RE.test(fileId)) { cb(err('bad', 'That backup id is not valid.')); return; }
        request({ method: 'GET', url: API + '/' + fileId + '?fields=' + encodeURIComponent('id,version,modifiedTime,appProperties') }, function (e, t) {
            if (e) { cb(e); return; }
            var d = parseJSON(t);
            if (!d || typeof d.id !== 'string') { cb(err('http', 'Google Drive sent a reply the arcade could not read.')); return; }
            var r = fileResult(t); r.hash = cleanProps(d.appProperties).hash || '';
            cb(null, r);
        });
    }

    // Optional short name for a save point: letters, digits, spaces and basic punctuation, 30 characters at most.
    function cleanLabel(v) {
        if (typeof v !== 'string') { return ''; }
        v = v.replace(/[^A-Za-z0-9 .,!?'()_+-]/g, '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        return v.length > 30 ? v.substr(0, 30).replace(/\s+$/, '') : v;
    }

    // opts.label: optional save point name, kept in the file's appProperties, never in the file name.
    function backupNow(scope, cb, opts) {
        cb = once(cb);
        var G = w.FongGameSaves;
        if (!G) { cb(err('nosaves', 'Game saves are not available on this page.')); return; }
        if (typeof scope !== 'string' || !/^[A-Za-z0-9_.-]{1,60}$/.test(scope)) { cb(err('bad', 'Unknown game.')); return; }
        if (!isConnected()) { cb(needConnect()); return; }
        var r;
        if (scope === 'all') { r = G.exportAll(); }
        else {
            var known = false, all = G.list(), i;
            for (i = 0; i < all.length; i++) { if (all[i].id === scope) { known = true; } }
            if (!known) { cb(err('bad', 'Unknown game.')); return; }
            r = G.exportGame(scope);
        }
        if (!r.text) { cb(err('bad', 'Nothing to back up.')); return; }
        if (r.warnings && r.warnings.length) {
            cb(err('toobig', 'Not backed up. ' + r.warnings[0] + ' A backup that cannot be restored is not saved.'));
            return;
        }
        var parsed = parseJSON(r.text), has = false, k;
        if (parsed && scope === 'all') { for (k in parsed.games) { if (Object.prototype.hasOwnProperty.call(parsed.games, k)) { has = true; } } }
        else if (parsed) { for (k in parsed.data) { if (Object.prototype.hasOwnProperty.call(parsed.data, k)) { has = true; } } }
        if (!has) { cb(err('empty', 'There is no saved progress to back up yet.')); return; }
        var name = 'fong-' + scope + '-' + new Date().toISOString() + '.json';
        var label = cleanLabel(opts && opts.label);
        createFile(name, r.text, label ? { label: label } : null, function (e, made) {
            if (e) { cb(e); return; }
            var out = { id: made.id, name: name, scope: scope, label: label };
            prune('manual', scope, KEEP, function (n) { out.pruned = n; cb(null, out); });
        });
    }

    function onChange(fn) {
        if (typeof fn !== 'function') { return function () {}; }
        changeFns.push(fn);
        return function () { var i = changeFns.indexOf(fn); if (i >= 0) { changeFns.splice(i, 1); } };
    }

    var api = {
        NOT_SET_UP: NOT_SET_UP,
        KEEP: KEEP,
        cleanLabel: cleanLabel,
        KEEP_DAILY: KEEP_DAILY,
        MAX_GAMES_PER_RUN: MAX_GAMES_PER_RUN,
        onChange: onChange,
        getMeta: getMeta,
        createFile: createFile,
        updateFile: updateFile,
        prune: prune,
        isConfigured: isConfigured,
        isConnected: isConnected,
        connect: connect,
        disconnect: disconnect,
        backupNow: backupNow,
        list: list,
        restore: restore,
        remove: remove
    };
    w.FongGDrive = api;
})(window);
