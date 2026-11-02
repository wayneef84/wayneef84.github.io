// Shared fakes for the Drive tests: localStorage, a Drive server, Google Identity Services, and one "tab" per window.
var fs = require('fs'), path = require('path'), vm = require('vm');

function makeDrive() { return { files: [], seq: 0, ver: 0, clock: Date.parse('2026-11-01T10:00:00Z'), log: [] }; }

function makeTab(o) {
    o = o || {};
    var store = o.store || {}, drive = o.drive || makeDrive(), win = { window: null };
    win.window = win; win.store = store; win.drive = drive;
    win.localStorage = {
        get length() { return Object.keys(store).length; },
        key: function (i) { return Object.keys(store)[i] || null; },
        removeItem: function (k) { delete store[k]; },
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
        setItem: function (k, v) { store[k] = String(v); }
    };
    win.FONG_GDRIVE_CLIENT_ID = o.clientId === undefined ? 'abc.apps.googleusercontent.com' : o.clientId;
    win.navigator = { onLine: true };
    win.setTimeout = setTimeout; win.clearTimeout = clearTimeout; win.setInterval = setInterval; win.clearInterval = clearInterval;
    win.reqs = []; win.nextStatus = []; win.gisLoads = 0; win.gisFail = false; win.gisHang = false;
    win.tokenResp = { access_token: o.token || 'tok-123', expires_in: 3600 }; win.tokenErr = null; win.tokenHang = false; win.tokenCalls = 0; win.revoked = 0; win.revokeHang = false;
    win.document = {
        head: { appendChild: function (s) { win.gisLoads++; s.parentNode = win.document.head; if (win.gisHang) { win.hungScript = s; return; } setTimeout(function () {
            if (win.gisFail) { s.onerror(); return; }
            win.google = { accounts: { oauth2: {
                initTokenClient: function (c) { return { requestAccessToken: function () { win.tokenCalls++; if (win.tokenHang) { return; } setTimeout(function () { if (win.tokenErr) { c.error_callback(win.tokenErr); } else { c.callback(win.tokenResp); } }, 0); } }; },
                hasGrantedAllScopes: function (r) { return r.scope_ok !== false; },
                revoke: function (t, cb) { win.revoked++; if (!win.revokeHang) { cb({}); } }
            } } };
            s.onload();
        }, 0); }, removeChild: function () {} },
        createElement: function () { return {}; }
    };
    function iso(n) { return new Date(n).toISOString(); }
    win.fetch = function (url, opts) {
        win.reqs.push({ url: url, opts: opts });
        var forced = win.nextStatus.shift();
        function resp(status, body, headers) { return Promise.resolve({ status: status, headers: { get: function (k) { return headers && headers[k] !== undefined ? headers[k] : null; } }, text: function () { return Promise.resolve(body); } }); }
        if (forced === 'throw') { return Promise.reject(new Error('net')); }
        if (forced) { return resp(forced.status, forced.body || '', forced.headers); }
        var m = opts.method || 'GET', u = url.split('?')[0], id;
        function parts(body) { var a = body.split('\r\n\r\n'); return { meta: JSON.parse(a[1].split('\r\n--')[0]), content: a[2].split('\r\n--')[0] }; }
        function find(i) { return drive.files.filter(function (f) { return f.id === i; })[0]; }
        if (m === 'POST') {
            var pc = parts(opts.body); id = 'id' + (++drive.seq); drive.clock += 1000;
            var f = { id: id, name: pc.meta.name, parents: pc.meta.parents, appProperties: pc.meta.appProperties || {}, createdTime: iso(drive.clock), modifiedTime: iso(drive.clock), version: String(++drive.ver), size: String(pc.content.length), content: pc.content };
            drive.files.push(f); drive.log.push('POST ' + f.name);
            return resp(200, JSON.stringify({ id: id, version: f.version, modifiedTime: f.modifiedTime }));
        }
        if (m === 'PATCH') {
            id = u.split('/').pop(); var ff = find(id); if (!ff) { return resp(404, '{}'); }
            var pu = parts(opts.body); drive.clock += 1000;
            ff.content = pu.content; ff.appProperties = pu.meta.appProperties || {}; ff.modifiedTime = iso(drive.clock); ff.version = String(++drive.ver); ff.size = String(pu.content.length);
            drive.log.push('PATCH ' + ff.name);
            return resp(200, JSON.stringify({ id: id, version: ff.version, modifiedTime: ff.modifiedTime }));
        }
        if (m === 'DELETE') { id = u.split('/').pop(); drive.files = drive.files.filter(function (x) { return x.id !== id; }); drive.log.push('DELETE ' + id); return resp(204, ''); }
        if (url.indexOf('alt=media') > 0) { var g = find(u.split('/').pop()); return g ? resp(200, g.content) : resp(404, '{}'); }
        if (/\/files\/[^?]+\?fields=/.test(url)) { var h = find(u.split('/').pop()); return h ? resp(200, JSON.stringify({ id: h.id, version: h.version, modifiedTime: h.modifiedTime, appProperties: h.appProperties })) : resp(404, '{}'); }
        var sorted = drive.files.slice().sort(function (a, b) { return a.createdTime < b.createdTime ? 1 : -1; });
        return resp(200, JSON.stringify({ files: sorted.map(function (x) { return { id: x.id, name: x.name, createdTime: x.createdTime, modifiedTime: x.modifiedTime, version: x.version, size: x.size, appProperties: x.appProperties }; }).concat([{ id: 'zz', name: 'other.txt' }]) }));
    };
    var ctx = vm.createContext({ window: win, Date: Date, Math: Math, JSON: JSON, Promise: Promise, setTimeout: setTimeout, clearTimeout: clearTimeout, encodeURIComponent: encodeURIComponent, isFinite: isFinite, Number: Number, String: String, Object: Object, parseInt: parseInt, isNaN: isNaN, Array: Array });
    var files = ['js/gamesaves.js', 'js/gdrive-backup.js'];
    if (o.auto !== false) { files.push('js/gdrive-auto.js'); }
    files.forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx); });
    return win;
}

function until(fn, ms, cb) {
    var t0 = Date.now();
    (function poll() { var v; try { v = fn(); } catch (e) { v = false; } if (v) { cb(null, v); } else if (Date.now() - t0 > (ms || 1500)) { cb(new Error('timeout waiting: ' + String(fn))); } else { setTimeout(poll, 5); } })();
}
function seqRun(steps, done) { var i = 0; (function next(e) { if (e) { throw e; } if (i >= steps.length) { done(); return; } steps[i++](next); })(); }

module.exports = { makeTab: makeTab, makeDrive: makeDrive, until: until, seqRun: seqRun };
