/**
 * FongGDrive: optional "Back up to Google Drive" for game saves. Manual file export and import stay as they are.
 * Off until js/gdrive-config.js holds a Client ID. Google's script (accounts.google.com/gsi/client) is loaded
 * ONLY after the user taps Connect, injected from here. Nothing else touches the network.
 * Token model only (Google Identity Services, scope drive.appdata). No server, no secret, no refresh token.
 * The access token lives in memory only and is never written to storage, so each visit needs a tap on Connect.
 * Files go to the hidden appDataFolder. Restore only returns text: the caller must pass it through
 * FongGameSaves.importJSON (preview, manifest-only keys, size limits, rollback). A Drive file is untrusted input.
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
    var ID_RE = /^[A-Za-z0-9_-]{1,200}$/;

    var token = '', expires = 0;
    var tokenClient = null, clientUsed = '';
    var gisLoading = false, gisWaiters = [];
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

    function loadGis(cb) {
        if (gisReady()) { cb(null); return; }
        gisWaiters.push(cb);
        if (gisLoading) { return; }
        gisLoading = true;
        function finish(e) {
            gisLoading = false;
            var list = gisWaiters; gisWaiters = [];
            for (var i = 0; i < list.length; i++) { list[i](e); }
        }
        var s = doc.createElement('script');
        s.async = true;
        s.src = GIS_URL;
        var timer = w.setTimeout(function () { s.onload = s.onerror = null; finish(err('offline', 'Could not reach Google. Check your connection and try again.')); }, 20000);
        s.onload = function () {
            w.clearTimeout(timer);
            if (gisReady()) { finish(null); } else { finish(err('load', 'Google sign-in did not start. Try again.')); }
        };
        s.onerror = function () {
            w.clearTimeout(timer);
            if (s.parentNode) { s.parentNode.removeChild(s); }
            finish(offline() ? offlineErr() : err('offline', 'Could not reach Google. Check your connection or any content blocker, then try again.'));
        };
        (doc.head || doc.documentElement).appendChild(s);
    }

    function settle(e, r) {
        var cb = pendingConnect; pendingConnect = null;
        if (cb) { cb(e, r); }
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
        token = resp.access_token;
        var secs = Number(resp.expires_in);
        expires = Date.now() + ((isFinite(secs) && secs > 60 ? secs : 3600) - 30) * 1000;
        settle(null, { connected: true });
    }

    function onTokenError(e) {
        var t = e && e.type ? String(e.type) : '';
        if (t === 'popup_failed_to_open') { settle(err('popup', 'The sign-in window was blocked. Allow pop-ups for this site, then tap Connect again.')); }
        else if (t === 'popup_closed') { settle(err('closed', 'The sign-in window was closed before it finished. Tap Connect to try again.')); }
        else { settle(err('failed', 'Google sign-in did not finish. Tap Connect to try again.')); }
    }

    // Call from a tap. The first tap loads Google's script, so some browsers block the window then: tap Connect again.
    function connect(cb) {
        cb = once(cb);
        if (!isConfigured()) { cb(err('notconfigured', NOT_SET_UP)); return; }
        if (offline()) { cb(offlineErr()); return; }
        if (pendingConnect) { cb(err('busy', 'Sign-in is already open.')); return; }
        pendingConnect = cb;
        loadGis(function (e) {
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

    function disconnect(cb) {
        cb = once(cb);
        var t = token;
        token = ''; expires = 0;
        if (t && gisReady() && w.google.accounts.oauth2.revoke) {
            try { w.google.accounts.oauth2.revoke(t, function () { cb(null, { connected: false }); }); return; } catch (e) { /* fall through */ }
        }
        cb(null, { connected: false });
    }

    // ---- Drive requests ------------------------------------------------

    function reasonOf(text) {
        try {
            var d = JSON.parse(text);
            var e = d && d.error && d.error.errors && d.error.errors[0];
            return e && typeof e.reason === 'string' ? e.reason : '';
        } catch (x) { return ''; }
    }

    // opts: { method, url, headers, body }. Calls cb(err, text).
    function request(opts, cb, tried) {
        if (!isConnected()) { token = ''; cb(needConnect()); return; }
        if (offline()) { cb(offlineErr()); return; }
        var headers = { 'Authorization': 'Bearer ' + token };
        var k;
        if (opts.headers) { for (k in opts.headers) { if (Object.prototype.hasOwnProperty.call(opts.headers, k)) { headers[k] = opts.headers[k]; } } }
        var p;
        try { p = w.fetch(opts.url, { method: opts.method || 'GET', headers: headers, body: opts.body }); }
        catch (x) { cb(err('network', 'Could not reach Google Drive.')); return; }
        p.then(function (res) {
            return res.text().then(function (text) { return { status: res.status, text: text }; });
        }).then(function (r) {
            var s = r.status, reason = s === 403 ? reasonOf(r.text) : '';
            if (s >= 200 && s < 300) { cb(null, r.text); return; }
            var rate = s === 429 || s >= 500 || (s === 403 && /rateLimit/i.test(reason));
            if (rate && !tried) { w.setTimeout(function () { request(opts, cb, true); }, retryMs()); return; }
            if (s === 401) { token = ''; expires = 0; cb(needConnect()); return; }
            if (s === 403 && /quota/i.test(reason) && !/rateLimit/i.test(reason)) { cb(err('quota', 'Your Google Drive is full, so the backup could not be saved. Free some space and try again.')); return; }
            if (s === 403 && /rateLimit/i.test(reason)) { cb(err('busy', 'Google Drive is busy. Wait a minute and try again.')); return; }
            if (s === 403) { cb(err('forbidden', 'Google Drive said no. Either the Drive API is not turned on for this arcade, or the backup folder permission was not allowed. Tap Connect and allow it, or see docs/GDRIVE_SETUP.md.')); return; }
            if (s === 404) { cb(err('missing', 'That backup was not found. It may have been deleted.')); return; }
            if (s === 429 || s >= 500) { cb(err('busy', 'Google Drive is busy. Wait a minute and try again.')); return; }
            cb(err('http', 'Google Drive returned an error (' + s + ').'));
        }, function () {
            cb(offline() ? offlineErr() : err('network', 'Could not reach Google Drive. Check your connection and try again.'));
        });
    }

    function parseJSON(text) { try { return JSON.parse(text); } catch (e) { return null; } }

    // ---- files ---------------------------------------------------------

    function toItem(f) {
        if (!f || typeof f.id !== 'string' || !ID_RE.test(f.id) || typeof f.name !== 'string') { return null; }
        var m = NAME_RE.exec(f.name);
        if (!m) { return null; }   // not one of ours: ignore
        var t = typeof f.createdTime === 'string' && !isNaN(Date.parse(f.createdTime)) ? new Date(f.createdTime).toISOString() : m[2];
        var size = Number(f.size);
        return { id: f.id, name: f.name, scope: m[1], time: t, size: isFinite(size) ? size : 0 };
    }

    function list(cb) {
        cb = once(cb);
        var items = [], pages = 0;
        function page(token2) {
            var url = API + '?spaces=appDataFolder&orderBy=' + encodeURIComponent('createdTime desc') + '&pageSize=200&fields=' +
                encodeURIComponent('nextPageToken,files(id,name,createdTime,size)') + (token2 ? '&pageToken=' + encodeURIComponent(token2) : '');
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

    function restore(fileId, cb) {
        cb = once(cb);
        if (typeof fileId !== 'string' || !ID_RE.test(fileId)) { cb(err('bad', 'That backup id is not valid.')); return; }
        request({ method: 'GET', url: API + '/' + fileId + '?alt=media' }, function (e, text) {
            if (e) { cb(e); return; }
            var max = (w.FongGameSaves && w.FongGameSaves.MAX_CHARS) || 600000;
            if (typeof text !== 'string' || !text) { cb(err('bad', 'That backup is empty.')); return; }
            if (text.length > max) { cb(err('bad', 'That backup is too big to restore.')); return; }
            cb(null, text);
        });
    }

    // Keeps the newest KEEP files for one scope. Calls cb(removedCount).
    function prune(scope, cb) {
        list(function (e, items) {
            if (e) { cb(0); return; }
            var mine = [], i;
            for (i = 0; i < items.length; i++) { if (items[i].scope === scope) { mine.push(items[i]); } }
            var extra = mine.slice(KEEP), n = 0;
            function next() {
                if (!extra.length) { cb(n); return; }
                var f = extra.shift();
                request({ method: 'DELETE', url: API + '/' + f.id }, function (e2) { if (!e2) { n++; } next(); });
            }
            next();
        });
    }

    function backupNow(scope, cb) {
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
        var boundary = 'fong' + Date.now().toString(36) + Math.floor(Math.random() * 1e9).toString(36);
        while (r.text.indexOf(boundary) >= 0) { boundary += 'x'; }
        var meta = JSON.stringify({ name: name, parents: ['appDataFolder'], mimeType: 'application/json' });
        var body = '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + meta +
            '\r\n--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + r.text + '\r\n--' + boundary + '--';
        request({
            method: 'POST',
            url: UPLOAD + '?uploadType=multipart&fields=' + encodeURIComponent('id,name,createdTime,size'),
            headers: { 'Content-Type': 'multipart/related; boundary=' + boundary },
            body: body
        }, function (e, text) {
            if (e) { cb(e); return; }
            var d = parseJSON(text);
            var out = { id: d && typeof d.id === 'string' ? d.id : '', name: name, scope: scope };
            prune(scope, function (n) { out.pruned = n; cb(null, out); });
        });
    }

    var api = {
        NOT_SET_UP: NOT_SET_UP,
        KEEP: KEEP,
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
