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
            icon: '🀄',
            title: 'Big 2',
            funTitle: 'Big 2 大老二',
            description: 'Classic shedding game with HK, Taiwanese & Singapore rulesets. Play vs AI.',
            funDescription: 'Shed your cards before anyone else! Three rulesets, serious AI.',
            version: 'v0.1',
            href: './games/cards/big2/index.html',
            featured: false,
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
            '<div class="featured-label">' + sectionLabel + '</div>' +
            '<div class="featured-icon">' + game.icon + '</div>' +
            '<h1 class="featured-title">' + title + ' <span class="featured-version">' + game.version + '</span></h1>' +
            '<p class="featured-desc">' + desc + '</p>' +
            '<a href="' + game.href + '" class="btn-primary">' + btnLabel + '</a>';
    }

    // ─── CARD RENDERER ────────────────────────────────────────────────────────
    function _catLabel(cat) {
        var labels = { card: 'Card', arcade: 'Arcade', puzzle: 'Puzzle', edu: 'Educational', project: 'Project' };
        return labels[cat] || cat;
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

            var card = document.createElement('a');
            card.href = game.href;
            card.className = 'game-card';
            card.setAttribute('data-category', game.category);

            card.innerHTML =
                '<div class="card-top">' +
                    '<span class="card-icon">' + game.icon + '</span>' +
                    '<span class="category-tag ' + tagClass + '">' + _catLabel(game.category) + '</span>' +
                '</div>' +
                '<div class="game-title">' + title + '</div>' +
                '<p class="game-desc">' + desc + '</p>' +
                '<div class="game-meta"><span>' + game.version + '</span></div>';

            grid.appendChild(card);
        }
    }

    // ─── FILTER BUTTONS ───────────────────────────────────────────────────────
    function initFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var currentFilter = localStorage.getItem('hub_filter') || 'all';

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
        initFilters();
        renderThemeToggle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
