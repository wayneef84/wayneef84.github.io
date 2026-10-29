/**
 * FongPWA - registers the service worker (sw.js at the site root), shows the
 * "Update available" toast, and (homepage only) the Install app button.
 * Strict ES5, classic script, no dependencies, no network calls of its own.
 * Docs: docs/PWA.md.
 *
 * Add to a page (path to js/ is relative to that page):
 *   <script src="js/pwa.js"></script>                    registration only
 *   <script src="js/pwa.js" data-install="1"></script>   plus the Install app strip (needs <div id="pwa-install" hidden></div>)
 *
 * Kill switch: ?pwa=off unregisters every service worker, deletes every cache
 * and stays off on this device until ?pwa=on. Does nothing over file:// or in
 * browsers without service workers. Never reloads the page by itself.
 */
(function (w, d) {
    'use strict';

    var TAIL = 'js/pwa.js';
    var OFF_KEY = 'fong_pwa_off';
    var HINT_KEY = 'fong_pwa_hint_dismissed';
    var ownScript = d.currentScript || null;
    var deferred = null;

    function store(method, key, value) {
        try {
            if (method === 'get') { return w.localStorage.getItem(key); }
            if (method === 'set') { w.localStorage.setItem(key, value); }
            if (method === 'del') { w.localStorage.removeItem(key); }
        } catch (e) { /* private mode or blocked */ }
        return null;
    }

    function root() {
        var src = ownScript && ownScript.src ? ownScript.src : '';
        if (src && src.length >= TAIL.length && src.slice(src.length - TAIL.length) === TAIL) {
            return src.slice(0, src.length - TAIL.length);
        }
        return new w.URL('./', w.location.href).href;
    }

    function param(name) {
        var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(w.location.search);
        return m ? decodeURIComponent(m[1]) : null;
    }

    function isStandalone() {
        try {
            if (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) { return true; }
        } catch (e) { /* ignore */ }
        return w.navigator.standalone === true;
    }

    function isIos() {
        var ua = w.navigator.userAgent || '';
        if (/iPhone|iPad|iPod/.test(ua)) { return true; }
        return w.navigator.platform === 'MacIntel' && w.navigator.maxTouchPoints > 1;
    }

    // ---------- small styles and toast ----------
    var cssAdded = false;
    function addCss() {
        if (cssAdded) { return; }
        cssAdded = true;
        var s = d.createElement('style');
        s.textContent = [
            '.pwa-toast{position:fixed;left:50%;bottom:max(12px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:6500;',
            'display:flex;align-items:center;gap:8px;max-width:calc(100% - 24px);padding:6px 8px 6px 16px;border-radius:24px;',
            'background:#1a1d27;color:#f4f6fb;border:1px solid #00e5ff;box-shadow:0 4px 14px rgba(0,0,0,.4);font:600 14px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}',
            '.pwa-toast button,.pwa-strip button{min-height:44px;min-width:44px;padding:0 16px;border-radius:22px;border:2px solid #00e5ff;background:transparent;color:#00e5ff;font:inherit;font-weight:700;cursor:pointer}',
            '.pwa-toast button.pwa-go,.pwa-strip button.pwa-go{background:#00e5ff;color:#0f1117}',
            '.pwa-strip{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:10px auto;padding:8px 12px;max-width:640px;box-sizing:border-box;',
            'color:var(--text-primary,#f4f6fb);font:600 14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center}',
            '.pwa-strip[hidden],.pwa-strip [hidden]{display:none}',
            '.pwa-strip svg{vertical-align:-4px}'
        ].join('');
        d.head.appendChild(s);
    }

    function showToast() {
        if (d.getElementById('pwaToast')) { return; }
        addCss();
        var t = d.createElement('div');
        t.id = 'pwaToast';
        t.className = 'pwa-toast';
        t.setAttribute('role', 'status');
        var msg = d.createElement('span');
        msg.textContent = 'Update available';
        var go = d.createElement('button');
        go.type = 'button';
        go.className = 'pwa-go';
        go.textContent = 'Reload';
        go.addEventListener('click', function () { w.location.reload(); });
        var later = d.createElement('button');
        later.type = 'button';
        later.setAttribute('aria-label', 'Dismiss');
        later.textContent = '×';
        later.addEventListener('click', function () { if (t.parentNode) { t.parentNode.removeChild(t); } });
        t.appendChild(msg);
        t.appendChild(go);
        t.appendChild(later);
        d.body.appendChild(t);
    }

    function note(text) {
        addCss();
        var t = d.createElement('div');
        t.className = 'pwa-toast';
        t.setAttribute('role', 'status');
        t.textContent = text;
        d.body.appendChild(t);
    }

    // ---------- kill switch ----------
    function clearCaches() {
        if (!(w.caches && w.caches.keys)) { return Promise.resolve(); }
        return w.caches.keys().then(function (names) {
            return Promise.all(names.map(function (n) { return w.caches.delete(n); }));
        });
    }

    function turnOff() {
        store('set', OFF_KEY, '1');
        var sw = w.navigator.serviceWorker;
        var unreg = (sw && sw.getRegistrations) ? sw.getRegistrations().then(function (regs) {
            return Promise.all(regs.map(function (r) { return r.unregister(); }));
        }) : Promise.resolve();
        unreg.then(clearCaches).then(function () {
            note('Offline mode is off and saved copies are cleared. Use ?pwa=on to turn it back on.');
            // the old worker may still finish a write that was already in flight, so sweep once more
            w.setTimeout(function () { clearCaches().then(function () {}, function () {}); }, 1000);
        }, function () {});
    }

    // ---------- register ----------
    function register() {
        var sw = w.navigator.serviceWorker;
        var hadController = !!sw.controller;
        sw.addEventListener('controllerchange', function () {
            if (hadController) { showToast(); } // a new worker took over: offer a reload, never force one
            hadController = true;
        });
        var base = root();
        sw.register(base + 'sw.js', { scope: base }).catch(function () { /* quiet */ });
    }

    // ---------- install button (homepage) ----------
    var SHARE_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';

    function setupInstall() {
        var box = d.getElementById('pwa-install');
        if (!box || isStandalone()) { return; }
        addCss();
        box.className = 'pwa-strip';
        box.innerHTML = '<button type="button" class="pwa-go" id="pwa-install-btn" hidden>Install app</button>' +
            '<span id="pwa-ios-hint" hidden>Add to Home Screen: tap the Share icon ' + SHARE_SVG + ' then &ldquo;Add to Home Screen&rdquo;. ' +
            '<button type="button" id="pwa-ios-close">Got it</button></span>';
        var btn = d.getElementById('pwa-install-btn');
        var hint = d.getElementById('pwa-ios-hint');

        function refresh() {
            var showBtn = !!deferred;
            var showHint = !showBtn && isIos() && store('get', HINT_KEY) !== '1' && /^https?:$/.test(w.location.protocol);
            btn.hidden = !showBtn;
            hint.hidden = !showHint;
            box.hidden = !(showBtn || showHint);
        }

        w.addEventListener('beforeinstallprompt', function (e) {
            e.preventDefault();
            deferred = e;
            refresh();
        });
        w.addEventListener('appinstalled', function () {
            deferred = null;
            refresh();
        });
        btn.addEventListener('click', function () {
            var p = deferred;
            if (!p) { return; }
            deferred = null;
            refresh();
            p.prompt();
            if (p.userChoice && p.userChoice.then) { p.userChoice.then(function () {}, function () {}); }
        });
        d.getElementById('pwa-ios-close').addEventListener('click', function () {
            store('set', HINT_KEY, '1');
            refresh();
        });
        refresh();
    }

    function init() {
        var q = param('pwa');
        if (q === 'on') { store('del', OFF_KEY); }
        if (!('serviceWorker' in w.navigator)) { setupInstallSafe(); return; }
        if (q === 'off') { turnOff(); return; }
        if (store('get', OFF_KEY) === '1') { return; }
        if (!/^https?:$/.test(w.location.protocol)) { return; }
        if (d.readyState === 'complete') { register(); } else { w.addEventListener('load', register); }
        setupInstallSafe();
    }

    function setupInstallSafe() {
        try {
            if (ownScript && ownScript.getAttribute('data-install') === '1') { setupInstall(); }
        } catch (e) { /* never break the page */ }
    }

    function start() {
        try { init(); } catch (e) { /* degrade quietly */ }
    }
    if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', start); } else { start(); }
}(window, document));
