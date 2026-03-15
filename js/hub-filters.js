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

    // ─── NAVIGATION CARDS ───────────────────────────────────────────────────
    function renderNavCards() {
        var grid = document.getElementById('nav-grid');
        if (!grid) return;

        var modeSuffix = MODE === 'fun' ? '?mode=fun' : '';

        var categories = [
            {
                id: 'arcade',
                icon: '&#127918;',
                title: MODE === 'fun' ? 'ARCADE' : 'Arcade',
                href: './arcade/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                cat: 'arcade',
                desc: MODE === 'fun'
                    ? 'Snake, Slots, Breakout, shooters &mdash; HIGH SCORES!'
                    : 'Snake, Slots, Breakout, Space Invaders and more.'
            },
            {
                id: 'cards',
                icon: '&#127183;',
                title: MODE === 'fun' ? 'CARD GAMES' : 'Card Games',
                href: './games/cards/index.html',
                cat: 'card',
                desc: MODE === 'fun'
                    ? 'Blackjack, Poker, War, Big 2 &mdash; deal me in!'
                    : 'Blackjack, Poker, War, Solitaire, Big 2.'
            },
            {
                id: 'puzzle',
                icon: '&#129513;',
                title: MODE === 'fun' ? 'PUZZLES' : 'Puzzle',
                href: './puzzle/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                cat: 'puzzle',
                desc: MODE === 'fun'
                    ? 'Sudoku, Flow, Mahjong, Jigsaw &mdash; BRAIN POWER!'
                    : 'Sudoku, Flow, Mahjong, Minesweeper+, Jigsaw and more.'
            },
            {
                id: 'edu',
                icon: '&#9999;&#65039;',
                title: MODE === 'fun' ? 'LEARN!' : 'Educational',
                href: './games/tracing/index.html',
                cat: 'edu',
                desc: MODE === 'fun'
                    ? 'Draw letters! Voice says what to write!'
                    : 'Letter Tracing with voice guidance and stroke validation.'
            },
            {
                id: 'projects',
                icon: '&#128736;&#65039;',
                title: MODE === 'fun' ? 'PROJECTS' : 'Projects & Tools',
                href: './projects/' + (modeSuffix ? 'index.html' + modeSuffix : ''),
                cat: 'project',
                desc: MODE === 'fun'
                    ? 'Tracker, DevUtils, Calculator, OCR and more!'
                    : 'Shipment Tracker, Dev Utils, TI Calculator, OCR Scanner and more.'
            },
            {
                id: 'wosky',
                icon: '&#10052;&#65039;',
                title: 'WOSKY_3169',
                href: './wosky/',
                cat: 'wosky',
                desc: 'Personal WOS toolkit — Charms, Chief Gear, Hero Gear, War Academy calculators.'
            }
        ];

        var html = '';
        for (var i = 0; i < categories.length; i++) {
            var c = categories[i];
            var count = getCategoryCount(c.cat);
            var countLabel = count === 1 ? '1 app' : count + ' ' + (c.cat === 'project' || c.cat === 'wosky' ? 'tools' : 'games');

            html +=
                '<a href="' + c.href + '" class="nav-card nav-card-' + c.id + '" role="listitem">' +
                    '<div class="nav-card-icon">' + c.icon + '</div>' +
                    '<div class="nav-card-body">' +
                        '<div class="nav-card-title">' + c.title + '</div>' +
                        '<div class="nav-card-count">' + countLabel + '</div>' +
                        '<p class="nav-card-desc">' + c.desc + '</p>' +
                    '</div>' +
                '</a>';
        }

        grid.innerHTML = html;
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
        renderFeaturedApps();
        renderNavCards();
        renderThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
