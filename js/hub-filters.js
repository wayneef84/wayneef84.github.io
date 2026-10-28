/**
 * Hub Landing Page — Featured Apps + Category Navigation
 * Catalog data lives in js/catalog.js (FONG_CATALOG).
 * Default mode: professional. Add ?mode=fun to URL for arcade theme.
 * Strict ES5 compatible.
 */

(function() {
    'use strict';

    var CATALOG = window.FONG_CATALOG || [];

    // ─── THEME DETECTION ──────────────────────────────────────────────────────
    function getMode() {
        var params = (window.location.search || '').toLowerCase();
        return params.indexOf('mode=fun') !== -1 ? 'fun' : 'pro';
    }

    var MODE = getMode();
    document.documentElement.setAttribute('data-theme', MODE);

    // ─── CATEGORY COUNTS ────────────────────────────────────────────────────
    function getCategoryCount(cat) {
        var count = 0;
        for (var i = 0; i < CATALOG.length; i++) {
            var g = CATALOG[i];
            if (g.theme === 'pro' && MODE === 'fun') continue;
            if (g.theme === 'fun' && MODE === 'pro') continue;
            if (g.parent) continue;
            if (g.category === cat) count++;
        }
        return count;
    }

    // ─── FEATURED APPS ──────────────────────────────────────────────────────
    function renderFeaturedApps() {
        var section = document.getElementById('featured-apps');
        if (!section) return;

        // Find Card Games hub entry and MD Reader
        var cardsEntry = null;
        var mdEntry = null;
        for (var i = 0; i < CATALOG.length; i++) {
            if (CATALOG[i].id === 'poker-hall') cardsEntry = CATALOG[i];
            if (CATALOG[i].id === 'md-reader') mdEntry = CATALOG[i];
        }

        var cardCount = getCategoryCount('card');

        var html = '';

        // Card Games featured card
        if (cardsEntry) {
            var cardsTitle = MODE === 'fun' ? 'CARD ROOM' : 'Card Games';
            var cardsDesc = MODE === 'fun'
                ? 'Blackjack, Poker, War, Big 2 &mdash; shuffle up and deal!'
                : 'Blackjack, Poker, War, Solitaire, Big 2. Shared engine, full rules.';
            var cardsBtnLabel = MODE === 'fun' ? '&#9658; DEAL ME IN!' : 'Enter Card Room';

            html +=
                '<a href="./games/cards/index.html" class="featured-app-card featured-card-games">' +
                    '<div class="featured-app-icon">&#127183;</div>' +
                    '<div class="featured-app-body">' +
                        '<div class="featured-app-label">' + cardCount + ' games</div>' +
                        '<h2 class="featured-app-title">' + cardsTitle + '</h2>' +
                        '<p class="featured-app-desc">' + cardsDesc + '</p>' +
                        '<span class="featured-app-btn">' + cardsBtnLabel + '</span>' +
                    '</div>' +
                '</a>';
        }

        // MD Reader featured card
        if (mdEntry) {
            var mdTitle = MODE === 'fun' ? 'DOC READER' : 'MD Reader';
            var mdDesc = MODE === 'fun'
                ? 'Read all the docs! Markdown made beautiful.'
                : 'Markdown reader and documentation viewer.';
            var mdBtnLabel = MODE === 'fun' ? '&#9658; READ STUFF!' : 'Open Reader';

            html +=
                '<a href="' + mdEntry.href + '" class="featured-app-card featured-md-reader">' +
                    '<div class="featured-app-icon">&#128214;</div>' +
                    '<div class="featured-app-body">' +
                        '<div class="featured-app-label">Tool</div>' +
                        '<h2 class="featured-app-title">' + mdTitle + '</h2>' +
                        '<p class="featured-app-desc">' + mdDesc + '</p>' +
                        '<span class="featured-app-btn">' + mdBtnLabel + '</span>' +
                    '</div>' +
                '</a>';
        }

        section.innerHTML = html;
    }

    // ─── GROUP SECTIONS ─────────────────────────────────────────────────────
    // Each group = heading + "See all" link to browse/ + category cards.
    // Sub-hubs (arcade/, puzzle/, projects/, ...) are kept as the cards.
    var NAV = window.FONG_NAV;
    var modeSuffix = MODE === 'fun' ? '?mode=fun' : '';
    var modeAmp = MODE === 'fun' ? '&mode=fun' : '';

    function t(pro, fun) { return MODE === 'fun' ? fun : pro; }

    function groupCount(id) {
        return NAV.itemsIn(id, { topLevel: true }).length;
    }

    function childCount(parentId) {
        var c = 0;
        for (var i = 0; i < CATALOG.length; i++) { if (CATALOG[i].parent === parentId) c++; }
        return c;
    }

    function navCard(c) {
        return '<a href="' + c.href + '" class="nav-card nav-card-' + c.id + '" role="listitem">' +
            '<div class="nav-card-icon">' + c.icon + '</div>' +
            '<div class="nav-card-body">' +
                '<div class="nav-card-title">' + c.title + '</div>' +
                '<div class="nav-card-count">' + c.count + '</div>' +
                '<p class="nav-card-desc">' + c.desc + '</p>' +
            '</div></a>';
    }

    function n(count, word) { return count === 1 ? '1 ' + word : count + ' ' + word + 's'; }

    function sections() {
        var all = function(group) { return './browse/index.html?group=' + group + modeAmp; };
        return [
            { id: 'games', title: t('Games', 'GAMES'), cards: [
                { id: 'arcade', icon: '&#127918;', title: t('Arcade', 'ARCADE'), href: './arcade/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                  count: n(getCategoryCount('arcade'), 'game'),
                  desc: t('Snake, Slots, Breakout, Byte Runner, Space Invaders and more.', 'Snake, Slots, Byte Runner, shooters &mdash; HIGH SCORES!') },
                { id: 'cards', icon: '&#127183;', title: t('Card Games', 'CARD GAMES'), href: './games/cards/index.html',
                  count: n(getCategoryCount('card'), 'game'),
                  desc: t('Blackjack, Poker, War, Solitaire, Big 2.', 'Blackjack, Poker, War, Big 2 &mdash; deal me in!') },
                { id: 'puzzle', icon: '&#129513;', title: t('Puzzle', 'PUZZLES'), href: './puzzle/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                  count: n(getCategoryCount('puzzle'), 'game'),
                  desc: t('Sudoku, Flow, Mahjong, Minesweeper+, Jigsaw, PuzzLLer.', 'Sudoku, Flow, Mahjong, Jigsaw &mdash; BRAIN POWER!') },
                { id: 'edu', icon: '&#9999;&#65039;', title: t('Educational', 'LEARN!'), href: './games/tracing/index.html',
                  count: n(4, 'mode'),
                  desc: t('Letter, word, sentence and Chinese tracing with voice guidance.', 'Draw letters! Voice says what to write!') },
                { id: 'all', icon: '&#128218;', title: t('All games', 'ALL GAMES'), href: all('games'),
                  count: n(groupCount('games'), 'game'), desc: t('Every game on one page, grouped by type.', 'Every single game, one page!') }
            ] },
            { id: 'tools', title: t('Tools', 'TOOLS'), cards: [
                { id: 'projects', icon: '&#128736;&#65039;', title: t('Projects & Tools', 'PROJECTS'), href: './projects/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                  count: n(getCategoryCount('project'), 'item'),
                  desc: t('Shipment Tracker, Dev Utils, MD Reader, OCR Scanner, TI-tanium.', 'Tracker, DevUtils, Calculator, OCR and more!') },
                { id: 'all', icon: '&#129520;', title: t('All tools', 'ALL TOOLS'), href: all('tools'),
                  count: n(groupCount('tools'), 'tool'), desc: t('Every tool and utility, including the Daily Command Center.', 'Every tool in one list!') }
            ] },
            { id: 'wos', title: t('Whiteout Survival', 'WHITEOUT SURVIVAL'), cards: [
                { id: 'wosky', icon: '&#10052;&#65039;', title: 'WOSKY_3169', href: './wosky/',
                  count: n(childCount('wosky-3169'), 'tool'),
                  desc: 'Personal WOS toolkit: Charms, Chief Gear, Hero Gear, War Academy calculators.' },
                { id: 'all', icon: '&#129518;', title: t('All WOS tools', 'ALL WOS TOOLS'), href: all('wos'),
                  count: n(NAV.itemsIn('wos').length, 'page'), desc: 'Every calculator page, including calc v2 and v3.' }
            ] },
            { id: 'more', title: t('More', 'MORE'), cards: [
                { id: 'more', icon: '&#128451;&#65039;', title: t('Guides, Labs and Archive', 'GUIDES &amp; ARCHIVE'), href: all('more'),
                  count: n(NAV.itemsIn('more').length, 'item'),
                  desc: t('Survival guides, About, Developer Profile, legacy versions.', 'Guides, about, profile and old versions.') },
                { id: 'more2', icon: '&#128100;', title: t('Developer Profile', 'DEV PROFILE'), href: './profile/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                  count: '1 page', desc: 'Who builds F.O.N.G.' }
            ] }
        ];
    }

    function renderGroups() {
        var host = document.getElementById('home-groups');
        if (!host) return;
        var secs = sections();
        var html = '';
        for (var i = 0; i < secs.length; i++) {
            var sec = secs[i], cards = '';
            for (var j = 0; j < sec.cards.length; j++) cards += navCard(sec.cards[j]);
            html +=
                '<section class="nav-section nav-section-' + sec.id + '" aria-label="' + sec.title + '">' +
                    '<div class="section-head"><h2 class="nav-section-title">' + sec.title + '</h2>' +
                    '<a class="section-all" href="./browse/index.html?group=' + sec.id + modeAmp + '">See all &rarr;</a></div>' +
                    '<div class="nav-grid" role="list">' + cards + '</div>' +
                '</section>';
        }
        host.innerHTML = html;
    }

    // ─── JUST ADDED (big cards for spotlight entries) ───────────────────────
    function renderJustAdded() {
        var host = document.getElementById('just-added');
        if (!host) return;
        var cards = '';
        for (var i = 0; i < CATALOG.length; i++) {
            var e = CATALOG[i];
            if (!e.spotlight || e.parent) continue;
            var title = MODE === 'fun' ? (e.funTitle || e.title) : e.title;
            var desc = MODE === 'fun' ? (e.funDescription || e.description) : e.description;
            cards +=
                '<a href="' + NAV.escapeHtml(e.href) + '" class="featured-app-card just-added-card">' +
                    '<div class="featured-app-icon">' + e.icon + '</div>' +
                    '<div class="featured-app-body">' +
                        '<div class="featured-app-label"><span class="badge-new">NEW</span></div>' +
                        '<h2 class="featured-app-title">' + NAV.escapeHtml(title) + '</h2>' +
                        '<p class="featured-app-desc">' + NAV.escapeHtml(desc) + '</p>' +
                        '<span class="featured-app-btn">' + (MODE === 'fun' ? '&#9658; PLAY!' : 'Play') + '</span>' +
                    '</div>' +
                '</a>';
        }
        if (!cards) return;
        host.innerHTML =
            '<div class="section-head"><h2 class="nav-section-title">' + (MODE === 'fun' ? 'JUST ADDED!' : 'Just added') + '</h2></div>' +
            '<div class="just-added-grid">' + cards + '</div>';
        host.hidden = false;
    }

    // ─── NEW STRIP ──────────────────────────────────────────────────────────
    function renderNewStrip() {
        var host = document.getElementById('new-strip');
        if (!host) return;
        var html = '';
        for (var i = 0; i < CATALOG.length; i++) {
            var e = CATALOG[i];
            if (!e.isNew || e.spotlight || e.parent) continue;
            html += '<a class="new-chip" href="' + NAV.escapeHtml(e.href) + '">' + e.icon + ' ' +
                NAV.escapeHtml(MODE === 'fun' ? (e.funTitle || e.title) : e.title) + '</a>';
        }
        host.innerHTML = html ? '<span class="new-label">New</span>' + html : '';
    }

    // ─── SEARCH ─────────────────────────────────────────────────────────────
    function initSearch() {
        var input = document.getElementById('home-search');
        var results = document.getElementById('search-results');
        var groups = document.getElementById('home-groups');
        var featured = document.getElementById('featured-apps');
        if (!input || !results) return;

        function run() {
            var q = input.value.replace(/^\s+|\s+$/g, '');
            if (!q) {
                results.hidden = true; results.innerHTML = '';
                if (groups) groups.style.display = '';
                if (featured) featured.style.display = '';
                return;
            }
            var html = '', count = 0;
            for (var i = 0; i < CATALOG.length; i++) {
                if (NAV.matches(CATALOG[i], q)) { html += NAV.cardHtml(CATALOG[i], MODE, './'); count++; }
            }
            results.innerHTML = count
                ? '<div class="section-head"><h2 class="nav-section-title">' + count + ' result' + (count === 1 ? '' : 's') + '</h2></div><div class="game-grid" role="list">' + html + '</div>'
                : '<p class="empty-note">Nothing matches &ldquo;' + NAV.escapeHtml(q) + '&rdquo;.</p>';
            results.hidden = false;
            if (groups) groups.style.display = 'none';
            if (featured) featured.style.display = 'none';
        }
        input.addEventListener('input', run);
    }

    // ─── THEME TOGGLE LINK ──────────────────────────────────────────────────
    function renderThemeToggle() {
        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        if (MODE === 'fun') {
            toggle.href = window.location.pathname;
            toggle.textContent = 'Professional View';
        } else {
            toggle.href = window.location.pathname + '?mode=fun';
            toggle.innerHTML = '&#127918; Fun Mode';
        }
    }

    // ─── INIT ───────────────────────────────────────────────────────────────
    function init() {
        renderJustAdded();
        renderFeaturedApps();
        renderGroups();
        renderNewStrip();
        initSearch();
        renderThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
