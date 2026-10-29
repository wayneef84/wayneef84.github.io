/**
 * CardNav - one slim navigation strip for every card game page.
 * ES5, classic script, no dependencies, relative paths only.
 *
 * Usage (first thing inside <body>):
 *   <script src="../shared/card-nav.js"></script>
 *   <script>CardNav.mount();</script>
 *
 * The strip shows Home (site homepage), Cards (card hub) and the sibling
 * games. On wide screens the games sit in the strip. On phones they fold into
 * a "Games" menu so the strip stays on one line. Every target is 44px tall.
 *
 * When the page is loaded inside the card hub frame (hub index.html?game=...)
 * the hub already supplies Home, Cards and the game list, so nothing is drawn.
 * Links use target="_top" so they always break out of any frame.
 *
 * Options: CardNav.mount({ current: 'blackjack' })  (default: read from URL)
 */
var CardNav = (function () {
    'use strict';

    var GAMES = [
        { id: 'blackjack', name: 'Blackjack',    path: 'blackjack/index.html' },
        { id: 'war',       name: 'War',          path: 'war/index.html' },
        { id: 'solitaire', name: 'Solitaire',    path: 'solitaire/index.html' },
        { id: 'big2',      name: 'Big 2',        path: 'big2/index.html' },
        { id: '5card',     name: 'Poker 5-Card', path: 'poker/5card/index.html' },
        { id: 'holdem',    name: "Hold'em",      path: 'poker/holdem/index.html' },
        { id: '13card',    name: '13-Card',      path: 'poker/13card/index.html' },
        { id: 'euchre',    name: 'Euchre',       path: 'euchre/index.html' }
    ];

    var TAIL = 'shared/card-nav.js';
    var NAV_ID = 'cardNav';
    var mounted = false;

    var CSS = [
        '#cardNav{box-sizing:border-box;position:relative;z-index:9000;flex:0 0 auto;align-self:stretch;width:100%;height:44px;',
        'display:flex;align-items:stretch;gap:4px;margin:0;',
        'padding:0 max(6px,env(safe-area-inset-right)) 0 max(6px,env(safe-area-inset-left));',
        'background:#0b1220;border-bottom:1px solid rgba(255,255,255,0.14);',
        'font:600 14px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#e2e8f0;-webkit-tap-highlight-color:transparent}',
        '#cardNav *{box-sizing:border-box}',
        '#cardNav a,#cardNav button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;',
        'padding:0 10px;margin:0;border:0;border-radius:0;background:transparent;color:#e2e8f0;font:inherit;text-decoration:none;white-space:nowrap;cursor:pointer}',
        '#cardNav a:hover,#cardNav button:hover{background:rgba(255,255,255,0.1)}',
        '#cardNav a:focus-visible,#cardNav button:focus-visible{outline:2px solid #ffd700;outline-offset:-2px}',
        '#cardNav .cn-title{flex:1 1 auto;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden;',
        'text-overflow:ellipsis;white-space:nowrap;color:#ffd700;padding:0 4px;font-weight:700}',
        '#cardNav .cn-games{display:none;margin:0;padding:0;list-style:none}',
        '#cardNav .cn-games a[aria-current="page"]{color:#0b1220;background:#ffd700}',
        '#cardNav.cn-open .cn-games{display:flex;flex-direction:column;position:absolute;top:44px;right:max(6px,env(safe-area-inset-right));',
        'min-width:200px;background:#0b1220;border:1px solid rgba(255,255,255,0.2);border-top:0;box-shadow:0 10px 24px rgba(0,0,0,0.5);',
        'max-height:calc(100vh - 56px);overflow-y:auto}',
        '#cardNav.cn-open .cn-games a{justify-content:flex-start;width:100%}',
        '@media (min-width:900px){',
        '#cardNav .cn-menu{display:none}',
        '#cardNav .cn-title{display:none}',
        '#cardNav .cn-games,#cardNav.cn-open .cn-games{display:flex;flex-direction:row;position:static;flex:1 1 auto;justify-content:flex-end;',
        'min-width:0;max-height:none;overflow:visible;background:transparent;border:0;box-shadow:none}',
        '#cardNav.cn-open .cn-games a{width:auto}',
        '}'
    ].join('');

    function isFramed() {
        try { return window.self !== window.top; } catch (e) { return true; }
    }

    // Folder of games/cards/ relative to the page, taken from this script's own src.
    function findBase() {
        var scripts = document.getElementsByTagName('script');
        var i, src;
        for (i = scripts.length - 1; i >= 0; i--) {
            src = scripts[i].getAttribute('src') || '';
            if (src.length >= TAIL.length && src.slice(src.length - TAIL.length) === TAIL) {
                return src.slice(0, src.length - TAIL.length);
            }
        }
        return '../';
    }

    function detectCurrent() {
        var p = (window.location.pathname || '').toLowerCase();
        var i;
        for (i = 0; i < GAMES.length; i++) {
            if (p.indexOf('/' + GAMES[i].path.replace('index.html', '')) !== -1) { return GAMES[i].id; }
        }
        return '';
    }

    function nameOf(id) {
        var i;
        for (i = 0; i < GAMES.length; i++) { if (GAMES[i].id === id) { return GAMES[i].name; } }
        return 'Card Games';
    }

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text) { n.textContent = text; }
        return n;
    }

    function link(href, text, label) {
        var a = el('a', '', text);
        a.setAttribute('href', href);
        a.setAttribute('target', '_top');
        if (label) { a.setAttribute('aria-label', label); }
        return a;
    }

    function mount(opts) {
        opts = opts || {};
        if (mounted || isFramed()) { return null; }
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', function () { mount(opts); });
            return null;
        }
        if (document.getElementById(NAV_ID)) { return null; }
        mounted = true;

        var base = findBase();
        var current = opts.current || detectCurrent();

        var style = document.createElement('style');
        style.setAttribute('data-cardnav', '1');
        style.appendChild(document.createTextNode(CSS));
        document.head.appendChild(style);

        var nav = el('nav');
        nav.id = NAV_ID;
        nav.setAttribute('aria-label', 'Card games navigation');

        nav.appendChild(link(base + '../../index.html', '🏠 Home', 'Home, F.O.N.G. Arcade'));
        nav.appendChild(link(base + 'index.html' + (current ? '?game=' + current : ''), '🃏 Cards', 'Card games hub'));
        nav.appendChild(el('span', 'cn-title', nameOf(current)));

        var menu = el('button', 'cn-menu', 'Games ▾');
        menu.setAttribute('type', 'button');
        menu.setAttribute('aria-haspopup', 'true');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-controls', 'cardNavGames');
        nav.appendChild(menu);

        var list = el('ul', 'cn-games');
        list.id = 'cardNavGames';
        var i, li, a;
        for (i = 0; i < GAMES.length; i++) {
            li = el('li');
            a = link(base + GAMES[i].path, GAMES[i].name);
            if (GAMES[i].id === current) { a.setAttribute('aria-current', 'page'); }
            li.appendChild(a);
            list.appendChild(li);
        }
        nav.appendChild(list);

        function setOpen(open) {
            if (open) { nav.className = 'cn-open'; } else { nav.className = ''; }
            menu.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        menu.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(nav.className.indexOf('cn-open') === -1);
        });
        document.addEventListener('click', function (e) {
            if (nav.className.indexOf('cn-open') !== -1 && !nav.contains(e.target)) { setOpen(false); }
        });
        document.addEventListener('keydown', function (e) {
            if ((e.key === 'Escape' || e.keyCode === 27) && nav.className.indexOf('cn-open') !== -1) {
                setOpen(false);
                menu.focus();
            }
        });

        document.body.insertBefore(nav, document.body.firstChild);
        // Pages with fixed-height layouts can subtract this from their height.
        document.documentElement.style.setProperty('--cardnav-h', '45px');
        document.documentElement.className += (document.documentElement.className ? ' ' : '') + 'has-cardnav';
        return nav;
    }

    return { mount: mount, GAMES: GAMES };
}());
