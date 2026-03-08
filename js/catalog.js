/**
 * FONG_CATALOG - Single source of truth for all game and project entries.
 *
 * Used by:
 *   - js/hub-filters.js  (main arcade hub)
 *   - projects/index.html (projects hub page)
 *
 * Each entry:
 *   id            - unique slug
 *   category      - 'card' | 'arcade' | 'puzzle' | 'edu' | 'project'
 *   icon          - emoji displayed on card
 *   title         - pro mode label
 *   funTitle      - fun mode label
 *   description   - pro mode description
 *   funDescription- fun mode description
 *   version       - version string
 *   href          - path relative to root (hub) — projects page strips ./projects/ prefix
 *   featured      - eligible for daily hero rotation
 *   isNew         - show NEW badge
 *   theme         - 'both' | 'pro' | 'fun'
 *   hub           - 'arcade' | 'cards' | 'puzzle' | 'projects' | 'home'
 *
 * ES5 strict — no const/let/arrow functions.
 */

var FONG_CATALOG = [
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
        hub: 'cards',
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
        hub: 'cards',
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
        hub: 'cards',
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
        hub: 'cards',
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
        hub: 'cards',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'arcade',
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
        hub: 'puzzle',
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
        hub: 'puzzle',
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
        hub: 'puzzle',
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
        hub: 'puzzle',
        featured: false,
        theme: 'both'
    },
    {
        id: 'jigsaw',
        category: 'puzzle',
        icon: '🧩',
        title: 'Jigsaw Engine',
        funTitle: 'JIGSAW 🧩',
        description: 'Upload any photo and play. Rounded piece shapes, snap sound, and lift effect.',
        funDescription: "Use YOUR own photos! Slice 'em up and snap 'em back together!",
        version: 'v1.1',
        href: './games/jigsaw/index.html',
        hub: 'puzzle',
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
        hub: 'puzzle',
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
        hub: 'puzzle',
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
        hub: 'home',
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
        hub: 'projects',
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
        hub: 'projects',
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
        hub: 'projects',
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
        hub: 'projects',
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
        hub: 'projects',
        featured: false,
        theme: 'both'
    },
    {
        id: 'name-that-tune',
        category: 'project',
        icon: '🎵',
        title: 'Name That Tune',
        funTitle: 'NAME THAT TUNE 🎵',
        description: 'Music guessing game. Identify songs from 30-second previews across 7 genres and decades.',
        funDescription: 'Can you name that tune?! 80s, 90s, Pop, Rock, Hip Hop and more!',
        version: 'v1.0',
        href: './projects/name-that-tune/index.html',
        hub: 'projects',
        featured: false,
        theme: 'both'
    },
    {
        id: 'code',
        category: 'project',
        icon: '🔓',
        title: 'C.o.D.E.',
        funTitle: 'CRACKING ENGINE 🔓',
        description: 'Code Optimization & Decryption Engine. Crack and decode obfuscated code strings.',
        funDescription: 'Hack the planet! Crack codes and decrypt secret strings!',
        version: 'v1.0',
        href: './projects/code/index.html',
        hub: 'projects',
        featured: false,
        theme: 'both'
    },
    {
        id: 'regex-builder',
        category: 'project',
        icon: '☃️',
        title: 'Regex Builder',
        funTitle: 'REGEX BUILDER ☃️',
        description: 'Visual regex builder with live preview and "Snowbank" pattern library. Vanilla JS, no dependencies.',
        funDescription: 'Build regex patterns visually! Save your faves in the Snowbank!',
        version: 'v1.0',
        href: './projects/regex_builder/index.html',
        hub: 'projects',
        featured: false,
        theme: 'both'
    },
    {
        id: 'web-archive',
        category: 'project',
        icon: '🗄️',
        title: 'Web Archive',
        funTitle: 'WEB ARCHIVE 🗄️',
        description: 'Retro web museum. Browse faithfully recreated websites from 1996–2000 in a terminal curator UI.',
        funDescription: 'Dial-up vibes! Visit the old internet — Geocities and all!',
        version: 'v2.0',
        href: './projects/web-archive/index.html',
        hub: 'projects',
        featured: false,
        theme: 'both'
    },
    {
        id: 'project-ti-tanium',
        category: 'project',
        icon: '🧮',
        title: 'TI-tanium',
        funTitle: 'TI CALCULATOR 🧮',
        description: 'TI-84 graphing calculator emulator. Canvas screen, full keypad, and math engine.',
        funDescription: 'Your old TI-84, in the browser! Calculate ALL the things!',
        version: 'v1.0',
        href: './projects/project-ti-tanium/index.html',
        hub: 'projects',
        featured: false,
        theme: 'both'
    }
];
