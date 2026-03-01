/**
 * Hub Filters, Theme Switcher & Card Renderer
 * Single source of truth for all game/project catalog data.
 * Default mode: professional. Add ?mode=fun to URL for arcade theme.
 * Strict ES5 compatible.
 */

(function() {
    'use strict';

    // ─── CATALOG ─────────────────────────────────────────────────────────────
    // Each entry has both a professional label and a fun label.
    // "featured" marks games eligible for the daily hero rotation.
    // "theme" controls which mode(s) display the entry:
    //   'both' = show in pro + fun, 'fun' = fun only, 'pro' = pro only

    var CATALOG = [
        // ── Card Games ───────────────────────────────────────────────
        {
            id: 'blackjack',
            category: 'card',
            icon: '🃏',
            title: 'Blackjack',
            funTitle: 'Blackjack 🔥',
            description: 'Production-ready card engine with Insurance, Double Down, and Split.',
            funDescription: 'Hit, stand, or bust! Can you beat the dealer?',
            version: 'v1.0.6',
            href: './games/cards/blackjack/index.html',
            featured: true,
            theme: 'both'
        },
        {
            id: 'war',
            category: 'card',
            icon: '⚔️',
            title: 'War',
            funTitle: 'WAR! ⚔️',
            description: 'Shared card engine implementation. Endless and standard modes.',
            funDescription: 'Flip cards and go to WAR! Endless battles await.',
            version: 'v1.1.0',
            href: './games/cards/war/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'solitaire',
            category: 'card',
            icon: '♠️',
            title: 'Solitaire',
            funTitle: 'Solo Solitaire ♠️',
            description: 'Classic Klondike patience card game.',
            funDescription: 'The classic one-player card game. Can you win?',
            version: 'v1.0',
            href: './games/cards/solitaire/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'poker-hall',
            category: 'card',
            icon: '♣️',
            title: 'Poker Hall',
            funTitle: 'Poker Night 🎲',
            description: "Texas Hold'em, 5 Card Draw, 13 Card. Shared engine suite.",
            funDescription: "All-in! Hold'em, Draw, and more at the Poker Hall.",
            version: 'v0.9',
            href: './games/cards/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'big2',
            category: 'card',
            icon: '🂢',
            title: 'Big 2',
            funTitle: 'Big 2 大老二',
            description: 'Classic shedding game with HK, Taiwanese & Singapore rulesets. Play vs AI.',
            funDescription: 'Shed your cards before anyone else! Three rulesets, serious AI.',
            version: 'v0.1',
            href: './games/cards/big2/index.html',
            featured: false,
            isNew: true,
            theme: 'both'
        },

        // ── Arcade Games ─────────────────────────────────────────────
        {
            id: 'slots',
            category: 'arcade',
            icon: '🎰',
            title: 'Slots',
            funTitle: 'JACKPOT SLOTS 🎰',
            description: '3D CSS slot machine. Physical lever, 20 themes, particle effects, RTP control.',
            funDescription: 'Pull the lever and win big! 20 themes and JACKPOTS!',
            version: 'v3.1',
            href: './games/slots/index.html',
            featured: true,
            theme: 'both'
        },
        {
            id: 'snake',
            category: 'arcade',
            icon: '🐍',
            title: 'Neon Snake',
            funTitle: 'NEON SNAKE 🐍',
            description: 'Canvas-based snake with Web Audio, swipe/button controls, and speed ramp.',
            funDescription: "Slither, grow, and don't crash! Neon lights, epic sounds.",
            version: 'v3.0',
            href: './games/snake/index.html',
            featured: true,
            theme: 'both'
        },
        {
            id: 'pong',
            category: 'arcade',
            icon: '🏓',
            title: 'Pong',
            funTitle: 'PONG! 🏓',
            description: 'NEGEN Engine. 1-player vs CPU or local 2-player.',
            funDescription: 'Bip boop! The OG tennis game is back. 1P vs CPU.',
            version: 'v1.0',
            href: './games/pong/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'space-invaders',
            category: 'arcade',
            icon: '👾',
            title: 'Space Invaders',
            funTitle: 'SPACE INVADERS 👾',
            description: 'NEGEN Engine. Grid movement, shooting, and increasing difficulty.',
            funDescription: 'Aliens incoming! Blast them before they reach you!',
            version: 'v1.0',
            href: './games/space_invaders/index.html',
            featured: false,
            isNew: true,
            theme: 'both'
        },
        {
            id: 'breakout',
            category: 'arcade',
            icon: '🧱',
            title: 'Breakout',
            funTitle: 'BREAKOUT! 🧱',
            description: 'NEGEN Engine. Physics, particle effects, paddle and ball mechanics.',
            funDescription: 'Smash bricks with a ball! Particles fly everywhere!',
            version: 'v1.0',
            href: './games/breakout/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'sky-breakers',
            category: 'arcade',
            icon: '🚀',
            title: 'Sky Breakers',
            funTitle: 'SKY BREAKERS 🚀',
            description: 'Canvas shooter. Vertical scrolling with procedural enemy waves.',
            funDescription: 'Rockets! Lasers! Explosions! Break through the sky!',
            version: 'v1.0',
            href: './games/sky_breakers/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'animal-stack',
            category: 'arcade',
            icon: '🦒',
            title: 'Animal Stack',
            funTitle: 'ANIMAL STACK 🦒',
            description: 'Physics-based stacking game with procedurally generated animals.',
            funDescription: 'Stack giraffes on penguins on bears... how HIGH can you go?!',
            version: 'v1.0',
            href: './games/animal_stack/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'sprunki',
            category: 'arcade',
            icon: '🎵',
            title: 'Sprunki Mixer',
            funTitle: 'SPRUNKI MIXER 🎵',
            description: 'DOM/Audio mixer. Phase 1 & 2 themes, reverse mode. Requires local server.',
            funDescription: 'Mix beats with the Sprunkis! Make some music magic!',
            version: 'v1.1',
            href: './games/sprunki/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'j-quiz',
            category: 'arcade',
            icon: '⚡',
            title: 'J: Speed Quiz',
            funTitle: 'SPEED QUIZ ⚡',
            description: 'High-velocity quiz engine. Configurable question sets and difficulty.',
            funDescription: 'Fast! Fast! FAST! Quiz questions at lightning speed!',
            version: 'v4.x',
            href: './games/j/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'flash-classics',
            category: 'arcade',
            icon: '🕹️',
            title: 'Flash Classics',
            funTitle: 'FLASH CLASSICS 🕹️',
            description: 'Collection of Flash-era arcade ports: Chopper, Defender, Runner.',
            funDescription: "Old-school Flash vibes! Chopper, Defender, Runner - all here!",
            version: 'v1.0',
            href: './games/flash_classics/index.html',
            featured: false,
            theme: 'both'
        },

        // ── Puzzle Games ─────────────────────────────────────────────
        {
            id: 'flow',
            category: 'puzzle',
            icon: '🔗',
            title: 'Flow',
            funTitle: 'FLOW 🔗',
            description: 'Pipe connection puzzle. Connect matching colors to fill the board.',
            funDescription: 'Connect the dots! Fill the whole board with color pipes!',
            version: 'v1.0',
            href: './games/flow/index.html',
            featured: true,
            theme: 'both'
        },
        {
            id: 'sudoku',
            category: 'puzzle',
            icon: '🔢',
            title: 'Sudoku',
            funTitle: 'SUDOKU 🔢',
            description: 'Classic Sudoku with dual input (tap/keyboard), auto-save, and difficulty levels.',
            funDescription: "Fill the grid! Numbers, logic, and brain power - let's go!",
            version: 'v2.0',
            href: './games/sudoku/index.html',
            featured: true,
            theme: 'both'
        },
        {
            id: 'minesweeper',
            category: 'puzzle',
            icon: '💣',
            title: 'Minesweeper+',
            funTitle: 'MINESWEEPER 💣',
            description: 'Enhanced Minesweeper with lives, power-ups, hold-to-flag, and custom themes.',
            funDescription: "Don't blow up! Hold to flag, lives to spare, power-ups!",
            version: 'v1.0',
            href: './games/minesweeper/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'mahjong',
            category: 'puzzle',
            icon: '🀄',
            title: 'Mahjong',
            funTitle: 'MAHJONG 🀄',
            description: 'Mahjong Solitaire with 3D CSS tile rendering.',
            funDescription: 'Match tiles, clear the board! Classic 3D Mahjong!',
            version: 'v1.0',
            href: './games/mahjong/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'jigsaw',
            category: 'puzzle',
            icon: '🧩',
            title: 'Jigsaw Engine',
            funTitle: 'JIGSAW 🧩',
            description: 'Custom image jigsaw generator. Upload any image and play.',
            funDescription: "Use YOUR own photos! Slice 'em up and put 'em back together!",
            version: 'v1.0',
            href: './games/jigsaw/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'xtc-ball',
            category: 'puzzle',
            icon: '🎱',
            title: 'XTC Ball',
            funTitle: 'MAGIC 8 BALL 🎱',
            description: 'Magic 8-Ball with synthesized audio response and SVG animations.',
            funDescription: 'Ask it anything! The mystical ball KNOWS ALL!',
            version: 'v5.0',
            href: './games/xtc_ball/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'board',
            category: 'puzzle',
            icon: '♟️',
            title: 'Board Games',
            funTitle: 'BOARD GAMES ♟️',
            description: 'Chess, Checkers, Xiangqi (Chinese Chess). AI opponents included.',
            funDescription: 'Chess! Checkers! Chinese Chess! Beat the AI if you dare!',
            version: 'v0.3.1',
            href: './games/board/index.html',
            featured: false,
            theme: 'both'
        },

        // ── Educational ───────────────────────────────────────────────
        {
            id: 'letter-tracing',
            category: 'edu',
            icon: '✏️',
            title: 'Letter Tracing',
            funTitle: 'LETTER TRACING ✏️',
            description: 'Educational writing app with voice guidance and stroke validation. Letters, words, sentences, and Chinese characters.',
            funDescription: 'Draw letters! Voice says what to write. Great for little ones!',
            version: 'v5.1',
            href: './games/tracing/index.html',
            featured: false,
            theme: 'both'
        },

        // ── Projects / Tools ──────────────────────────────────────────
        {
            id: 'shipment-tracker',
            category: 'project',
            icon: '📦',
            title: 'Shipment Tracker',
            funTitle: 'Package Tracker 📦',
            description: 'Offline-first multi-carrier tracking. DHL, FedEx, UPS. IndexedDB storage.',
            funDescription: "Where's my package?! Track ALL your deliveries here.",
            version: 'v1.2',
            href: './projects/shipment-tracker/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'md-reader',
            category: 'project',
            icon: '📖',
            title: 'MD Reader',
            funTitle: 'Doc Reader 📖',
            description: 'Markdown reader and documentation viewer.',
            funDescription: 'Read all the docs! Markdown made beautiful.',
            version: 'v1.0',
            href: './projects/md-reader/index.html',
            featured: false,
            theme: 'pro'
        },
        {
            id: 'encyclopedia',
            category: 'project',
            icon: '📚',
            title: 'Encyclopedia',
            funTitle: 'The Big Book 📚',
            description: 'Definitive interactive documentation of the F.O.N.G. realm.',
            funDescription: 'Everything you ever wanted to know about F.O.N.G.!',
            version: 'v1.0',
            href: './projects/encyclopedia/index.html',
            featured: false,
            theme: 'both'
        },
        {
            id: 'dev-utils',
            category: 'project',
            icon: '🛠️',
            title: 'Dev Utils',
            funTitle: 'Dev Toolbox 🛠️',
            description: 'JSON validator, Base64 & URL encoder/decoder, CSV↔JSON, timestamp & date tools.',
            funDescription: 'Your developer Swiss Army knife — JSON, Base64, CSV, timestamps and more!',
            version: 'v1.0',
            href: './projects/dev-utils/index.html',
            featured: false,
            theme: 'pro'
        },
        {
            id: 'input-a11y',
            category: 'project',
            icon: '📷',
            title: 'Input A11y',
            funTitle: 'OCR Scanner 📷',
            description: 'Camera-based OCR text scanner with Google Search/Lens integration. PWA, offline-first.',
            funDescription: 'Point your camera at anything and scan the text — magic!',
            version: 'v2.0',
            href: './projects/input-a11y/index.html',
            featured: false,
            theme: 'both'
        }
    ];

    // ─── THEME DETECTION ──────────────────────────────────────────────────────
    function getMode() {
        var params = (window.location.search || '').toLowerCase();
        return params.indexOf('mode=fun') !== -1 ? 'fun' : 'pro';
    }

    var MODE = getMode();

    // Apply theme attribute to <html> immediately
    document.documentElement.setAttribute('data-theme', MODE);

    // ─── FEATURED GAME ROTATION ───────────────────────────────────────────────
    function renderFeatured() {
        var section = document.getElementById('featured-section');
        if (!section) return;

        var eligible = [];
        for (var i = 0; i < CATALOG.length; i++) {
            if (CATALOG[i].featured) eligible.push(CATALOG[i]);
        }
        if (!eligible.length) return;

        var dayIndex = (new Date().getDate() - 1) % eligible.length;
        var game = eligible[dayIndex];

        var title = MODE === 'fun' ? game.funTitle : game.title;
        var desc  = MODE === 'fun' ? game.funDescription : game.description;
        var btnLabel = MODE === 'fun' ? '&#9658; PLAY NOW!' : 'Play Now';
        var sectionLabel = MODE === 'fun' ? '&#9733; TODAY\'S PICK' : 'FEATURED GAME';

        section.innerHTML =
            '<div class="featured-content">' +
                '<div class="featured-label">' + sectionLabel + '</div>' +
                '<div class="featured-icon">' + game.icon + '</div>' +
                '<h1 class="featured-title">' + title + ' <span class="featured-version">' + game.version + '</span></h1>' +
                '<p class="featured-desc">' + desc + '</p>' +
                '<a href="' + game.href + '" class="btn-primary">' + btnLabel + '</a>' +
            '</div>' +
            '<div class="featured-visual" aria-hidden="true">' +
                '<div class="featured-visual-icon">' + game.icon + '</div>' +
            '</div>';
    }

    // ─── CARD RENDERER ────────────────────────────────────────────────────────
    function _catLabel(cat) {
        var labels = { card: 'Card', arcade: 'Arcade', puzzle: 'Puzzle', edu: 'Educational', project: 'Project' };
        return labels[cat] || cat;
    }

    function _getCategoryCount(cat) {
        var count = 0;
        for (var i = 0; i < CATALOG.length; i++) {
            var g = CATALOG[i];
            if (g.theme === 'pro' && MODE === 'fun') continue;
            if (g.theme === 'fun' && MODE === 'pro') continue;
            if (cat !== 'all' && g.category !== cat) continue;
            count++;
        }
        return count;
    }

    function updateGameCount(category) {
        var el = document.getElementById('game-count');
        if (!el) return;
        var count = _getCategoryCount(category);
        el.textContent = count + ' games';
    }

    function renderCards(category) {
        var grid = document.getElementById('game-grid');
        if (!grid) return;

        grid.innerHTML = '';

        for (var i = 0; i < CATALOG.length; i++) {
            var game = CATALOG[i];

            // Theme filtering
            if (game.theme === 'pro' && MODE === 'fun') continue;
            if (game.theme === 'fun' && MODE === 'pro') continue;

            // Category filtering
            if (category !== 'all' && game.category !== category) continue;

            var title = MODE === 'fun' ? game.funTitle : game.title;
            var desc  = MODE === 'fun' ? game.funDescription : game.description;
            var tagClass = 'tag-' + game.category;
            var badgeHtml = game.isNew ? '<span class="badge-new">NEW</span>' : '';

            var card = document.createElement('a');
            card.href = game.href;
            card.className = 'game-card';
            card.setAttribute('data-category', game.category);

            card.innerHTML =
                '<div class="card-top">' +
                    '<span class="card-icon">' + game.icon + '</span>' +
                    '<span class="category-tag ' + tagClass + '">' + _catLabel(game.category) + '</span>' +
                '</div>' +
                '<div class="game-title">' + title + badgeHtml + '</div>' +
                '<p class="game-desc">' + desc + '</p>' +
                '<div class="game-meta"><span>' + game.version + '</span></div>';

            grid.appendChild(card);
        }

        updateGameCount(category);
    }

    // ─── QUICK PLAY CAROUSEL ──────────────────────────────────────────────────
    function renderCarousel() {
        var section = document.getElementById('carousel-section');
        if (!section) return;

        var cardsHtml = '';
        for (var i = 0; i < CATALOG.length; i++) {
            var game = CATALOG[i];
            if (game.theme === 'pro' && MODE === 'fun') continue;
            if (game.theme === 'fun' && MODE === 'pro') continue;
            cardsHtml +=
                '<a class="carousel-card" href="' + game.href + '">' +
                    '<div class="carousel-card-icon">' + game.icon + '</div>' +
                    '<div class="carousel-card-name">' + game.title + '</div>' +
                '</a>';
        }

        var titleLabel = MODE === 'fun' ? '&#127918; Quick Play' : 'Quick Play';

        section.innerHTML =
            '<div class="carousel-header">' +
                '<h3 class="carousel-title">' + titleLabel + '</h3>' +
                '<div class="carousel-controls">' +
                    '<button class="carousel-btn" id="carousel-prev" aria-label="Scroll left">&#8249;</button>' +
                    '<button class="carousel-btn" id="carousel-next" aria-label="Scroll right">&#8250;</button>' +
                '</div>' +
            '</div>' +
            '<div class="carousel-track" id="carousel-track">' + cardsHtml + '</div>';

        var track = document.getElementById('carousel-track');
        var prevBtn = document.getElementById('carousel-prev');
        var nextBtn = document.getElementById('carousel-next');

        if (prevBtn && track) {
            prevBtn.addEventListener('click', function() {
                if (track.scrollBy) {
                    track.scrollBy({ left: -300, behavior: 'smooth' });
                } else {
                    track.scrollLeft -= 300;
                }
            });
        }
        if (nextBtn && track) {
            nextBtn.addEventListener('click', function() {
                if (track.scrollBy) {
                    track.scrollBy({ left: 300, behavior: 'smooth' });
                } else {
                    track.scrollLeft += 300;
                }
            });
        }
    }

    // ─── MOBILE FILTER POPUP ──────────────────────────────────────────────────
    function initMobileFilter(filterBtns, currentFilter) {
        var bar = document.querySelector('.filter-bar');
        if (!bar) return;

        var LABELS = {
            all: 'All', arcade: 'Arcade', card: 'Card',
            puzzle: 'Puzzle', edu: 'Educational', project: 'Projects'
        };
        var CATEGORIES = [
            { cat: 'all',     label: 'All' },
            { cat: 'arcade',  label: 'Arcade' },
            { cat: 'card',    label: 'Card' },
            { cat: 'puzzle',  label: 'Puzzle' },
            { cat: 'edu',     label: 'Educational' },
            { cat: 'project', label: 'Projects' }
        ];

        // ── Build mobile trigger button ──
        var wrap = document.createElement('div');
        wrap.className = 'filter-mobile-trigger';
        wrap.id = 'filter-mobile-trigger';

        var currentLabel = LABELS[currentFilter] || 'All';
        var currentCount = _getCategoryCount(currentFilter);

        wrap.innerHTML =
            '<button class="filter-mobile-btn" id="filter-mobile-btn">' +
                '<span id="filter-mobile-label">' + currentLabel + ' (' + currentCount + ')</span>' +
                '<span class="filter-mobile-arrow">&#9662;</span>' +
            '</button>';

        bar.parentNode.insertBefore(wrap, bar);

        // ── Build popup overlay ──
        var optionsHtml = '';
        for (var i = 0; i < CATEGORIES.length; i++) {
            var c = CATEGORIES[i];
            var count = _getCategoryCount(c.cat);
            var activeClass = c.cat === currentFilter ? ' active' : '';
            optionsHtml +=
                '<button class="filter-popup-option' + activeClass + '" data-category="' + c.cat + '" data-label="' + c.label + '">' +
                    c.label +
                    '<span class="filter-popup-count">(' + count + ')</span>' +
                '</button>';
        }

        var overlay = document.createElement('div');
        overlay.className = 'filter-popup-overlay';
        overlay.id = 'filter-popup-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML =
            '<div class="filter-popup">' +
                '<div class="filter-popup-header">' +
                    '<span class="filter-popup-title">Filter Games</span>' +
                    '<button class="filter-popup-close" id="filter-popup-close" aria-label="Close">&#10005;</button>' +
                '</div>' +
                '<div class="filter-popup-options">' + optionsHtml + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // ── Open / close ──
        function openPopup() {
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
        }
        function closePopup() {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
        }

        document.getElementById('filter-mobile-btn').addEventListener('click', openPopup);
        document.getElementById('filter-popup-close').addEventListener('click', closePopup);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closePopup();
        });

        // ── Option selection ──
        var optionBtns = overlay.querySelectorAll('.filter-popup-option');
        for (var j = 0; j < optionBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var cat = btn.getAttribute('data-category');
                    var label = btn.getAttribute('data-label');
                    var count = _getCategoryCount(cat);

                    // Sync desktop pill buttons
                    for (var k = 0; k < filterBtns.length; k++) {
                        filterBtns[k].classList.toggle('active', filterBtns[k].getAttribute('data-category') === cat);
                    }
                    // Sync popup options
                    for (var m = 0; m < optionBtns.length; m++) {
                        optionBtns[m].classList.toggle('active', optionBtns[m].getAttribute('data-category') === cat);
                    }

                    // Update trigger label
                    var labelEl = document.getElementById('filter-mobile-label');
                    if (labelEl) labelEl.textContent = label + ' (' + count + ')';

                    localStorage.setItem('hub_filter', cat);
                    renderCards(cat);
                    closePopup();
                });
            })(optionBtns[j]);
        }
    }

    // ─── FILTER BUTTONS ───────────────────────────────────────────────────────
    function initFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var currentFilter = localStorage.getItem('hub_filter') || 'all';

        // Add game counts to each filter button label
        for (var i = 0; i < filterBtns.length; i++) {
            var cat = filterBtns[i].getAttribute('data-category');
            var label = filterBtns[i].textContent.trim();
            var count = _getCategoryCount(cat);
            filterBtns[i].innerHTML = label + '<span class="filter-count">(' + count + ')</span>';
        }

        // Set initial active state
        for (var i = 0; i < filterBtns.length; i++) {
            if (filterBtns[i].getAttribute('data-category') === currentFilter) {
                filterBtns[i].classList.add('active');
            } else {
                filterBtns[i].classList.remove('active');
            }
        }

        renderCards(currentFilter);

        // Attach click handlers (IIFE for loop closure)
        for (var j = 0; j < filterBtns.length; j++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var cat = btn.getAttribute('data-category');
                    for (var k = 0; k < filterBtns.length; k++) {
                        filterBtns[k].classList.remove('active');
                    }
                    btn.classList.add('active');
                    localStorage.setItem('hub_filter', cat);
                    renderCards(cat);
                });
            })(filterBtns[j]);
        }

        initMobileFilter(filterBtns, currentFilter);
    }

    // ─── THEME TOGGLE LINK ────────────────────────────────────────────────────
    function renderThemeToggle() {
        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        if (MODE === 'fun') {
            toggle.href = window.location.pathname;
            toggle.textContent = 'Professional View';
        } else {
            toggle.href = window.location.pathname + '?mode=fun';
            toggle.textContent = '🎮 Fun Mode';
        }
    }

    // ─── INIT ─────────────────────────────────────────────────────────────────
    function init() {
        renderFeatured();
        renderCarousel();
        initFilters();
        renderThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
