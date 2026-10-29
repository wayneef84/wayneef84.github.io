/**
 * FongHome - small fixed "Home" pill for pages that have no way back to the
 * F.O.N.G. Arcade homepage. ES5, classic script, no dependencies.
 *
 * Add to a page (path to js/ is relative to that page):
 *   <script src="../../js/home-link.js" data-corner="br"></script>
 *
 * Attributes on the script tag (all optional):
 *   data-root    relative path from the page to the site root, e.g. "../../".
 *                Default: taken from this script's own src, then from the URL.
 *   data-corner  tl, tr, bl or br. Default tl. Pick the corner with nothing
 *                clickable in it (check at 390x844 and 1280x900).
 *   data-label   Text after the house icon. Default "Home".
 *
 * It does nothing when the page already links to the homepage, and mounts
 * itself once the DOM is ready. Manual use: FongHome.mount({ corner: 'tr' }).
 * Targets are at least 44x44 px and respect safe-area insets. It never takes
 * space in the layout (position: fixed).
 */
var FongHome = (function () {
    'use strict';

    var TAIL = 'js/home-link.js';
    var ID = 'fongHome';
    var ownScript = document.currentScript || null;

    var CSS = [
        '#fongHome{position:fixed;z-index:6000;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;',
        'min-height:44px;min-width:44px;padding:0 14px;margin:0;border-radius:22px;',
        'background:rgba(15,23,42,0.82);color:#fff;border:1px solid rgba(255,255,255,0.35);box-shadow:0 2px 8px rgba(0,0,0,0.35);',
        'font:600 14px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-decoration:none;white-space:nowrap;',
        'opacity:0.85;-webkit-tap-highlight-color:transparent}',
        '#fongHome:hover,#fongHome:focus{opacity:1;background:rgba(15,23,42,0.95)}',
        '#fongHome:focus-visible{outline:2px solid #ffd700;outline-offset:2px}',
        '#fongHome.fh-tl{top:max(8px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left))}',
        '#fongHome.fh-tr{top:max(8px,env(safe-area-inset-top));right:max(8px,env(safe-area-inset-right))}',
        '#fongHome.fh-bl{bottom:max(8px,env(safe-area-inset-bottom));left:max(8px,env(safe-area-inset-left))}',
        '#fongHome.fh-br{bottom:max(8px,env(safe-area-inset-bottom));right:max(8px,env(safe-area-inset-right))}',
        '@media print{#fongHome{display:none}}'
    ].join('');

    function attr(name) {
        return ownScript ? ownScript.getAttribute(name) : null;
    }

    function endsWithTail(src) {
        return src.length >= TAIL.length && src.slice(src.length - TAIL.length) === TAIL;
    }

    function rootFromScripts() {
        var scripts = document.getElementsByTagName('script');
        var i, src;
        for (i = scripts.length - 1; i >= 0; i--) {
            src = (scripts[i].getAttribute('src') || '').split('?')[0];
            if (endsWithTail(src)) { return src.slice(0, src.length - TAIL.length); }
        }
        return null;
    }

    // Last resort: count folders in the URL path (right on GitHub Pages root).
    function rootFromPath() {
        var parts = (window.location.pathname || '/').split('/');
        var depth = parts.length - 2; // drop leading '' and the file name
        var out = '';
        var i;
        for (i = 0; i < depth; i++) { out += '../'; }
        return out;
    }

    function resolveRoot(opts) {
        var r = opts && opts.root;
        if (r === undefined || r === null) { r = attr('data-root'); }
        if (r === undefined || r === null) { r = rootFromScripts(); }
        if (r === undefined || r === null) { r = rootFromPath(); }
        if (r !== '' && r.charAt(r.length - 1) !== '/') { r += '/'; }
        return r;
    }

    function clean(href) {
        var a = document.createElement('a');
        a.href = href;
        var p = a.pathname || '';
        if (p.charAt(0) !== '/') { p = '/' + p; } // old IE drops the slash
        return a.protocol + '//' + a.host + p.replace(/index\.html$/, '');
    }

    function pageLinksHome(homeHref) {
        var target = clean(homeHref);
        var links = document.getElementsByTagName('a');
        var i, h;
        for (i = 0; i < links.length; i++) {
            h = links[i].getAttribute('href');
            if (h && h.charAt(0) !== '#' && clean(links[i].href) === target) { return true; }
        }
        return false;
    }

    function mount(opts) {
        opts = opts || {};
        if (document.getElementById(ID) || !document.body) { return null; }
        var root = resolveRoot(opts);
        var home = root + 'index.html';
        if (!opts.force && pageLinksHome(home)) { return null; }

        var corner = opts.corner || attr('data-corner') || 'tl';
        if (!/^(tl|tr|bl|br)$/.test(corner)) { corner = 'tl'; }
        var label = opts.label || attr('data-label') || 'Home';

        var style = document.createElement('style');
        style.setAttribute('data-fonghome', '1');
        style.appendChild(document.createTextNode(CSS));
        document.head.appendChild(style);

        var a = document.createElement('a');
        a.id = ID;
        a.className = 'fh-' + corner;
        a.setAttribute('href', home);
        a.setAttribute('aria-label', 'Home, F.O.N.G. Arcade');
        a.appendChild(document.createTextNode('🏠 ' + label));
        document.body.appendChild(a);
        return a;
    }

    function auto() {
        if (window.FongHomeNoAuto) { return; }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { mount(); });
        } else {
            mount();
        }
    }
    auto();

    return { mount: mount };
}());
