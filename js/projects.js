var projects = [
    // Games
    { name: "Card Games", path: "games/cards/index.html", category: "cards", icon: "🃏", tags: ["Shared Engine"], description: "Blackjack, War, and more built on a robust shared engine." },
    { name: "Sudoku", path: "games/sudoku/index.html", category: "puzzle", icon: "🧩", tags: ["Classic"], description: "Classic Sudoku puzzle with multiple difficulty levels." },
    { name: "Letter Tracing", path: "games/tracing/index.html", category: "puzzle", icon: "✏️", tags: ["Educational"], description: "Learn to write with voice guidance and stroke validation." },
    { name: "Breakout", path: "games/breakout/index.html", category: "retro", icon: "🧱", tags: ["Retro"], description: "Smash bricks with a ball and paddle. Now with particles!" },
    { name: "Pong", path: "games/pong/index.html", category: "retro", icon: "🏓", tags: ["Retro"], description: "The original tennis game. 1P vs CPU." },
    { name: "Space Invaders", path: "games/space_invaders/index.html", category: "retro", icon: "👾", tags: ["Retro"], description: "Defend Earth from the alien invasion." },
    { name: "Slots", path: "games/slots/index.html", category: "arcade", icon: "🎰", tags: ["Arcade"], description: "Feature-rich slot machine with multiple themes and bonus rounds." },
    { name: "Board Games", path: "games/board/index.html", category: "board", icon: "♟️", tags: ["Strategy"], description: "Play Chess, Checkers, Xiangqi and more." },
    { name: "Snake", path: "games/snake/index.html", category: "retro", icon: "🐍", tags: ["Retro"], description: "The classic game of snake. Eat apples, grow long, don't crash." },
    { name: "Magic 8 Ball", path: "games/xtc_ball/index.html", category: "puzzle", icon: "🎱", tags: ["Casual"], description: "Ask a question and reveal your destiny." },
    { name: "Sprunki Mixer", path: "games/sprunki/index.html", category: "arcade", icon: "🎵", tags: ["Music"], description: "Mix beats and create music with animated characters." },
    { name: "Poker Hall", path: "games/cards/index.html?game=poker", category: "cards", icon: "♣️", tags: ["New"], description: "Texas Hold'em, 5 Card Draw, and more." },
    { name: "Flow Games", path: "games/flow/index.html", category: "puzzle", icon: "🔗", tags: ["Puzzle"], description: "Connect matching colors with pipes across the board." },
    { name: "Animal Stack", path: "games/animal_stack/index.html", category: "arcade", icon: "🦒", tags: ["Arcade"], description: "Stack animals as high as you can without toppling over." },
    { name: "SKYbreakers", path: "games/sky_breakers/index.html", category: "arcade", icon: "🚀", tags: ["Arcade"], description: "Break through the sky in this high-flying arcade game." },
    { name: "Minesweeper+", path: "games/minesweeper/index.html", category: "puzzle", icon: "💣", tags: ["Classic"], description: "Classic Minesweeper with lives, power-ups, and custom themes." },
    { name: "Mahjong", path: "games/mahjong/index.html", category: "puzzle", icon: "🀄", tags: ["Classic"], description: "Classic Mahjong Solitaire tile matching game." },
    { name: "J: Speed Quiz", path: "games/j/index.html", category: "arcade", icon: "⚡", tags: ["Trivia"], description: "High-velocity quiz engine. Test your reflexes and knowledge." },
    { name: "J: Speed Quiz (Legacy)", path: "games/j_v1/index.html", category: "arcade", icon: "⚡", tags: ["Legacy"], description: "Legacy version of the speed quiz engine." },
    { name: "Flash Classics", path: "games/flash_classics/index.html", category: "retro", icon: "🕹️", tags: ["Retro"], description: "Collection of classic Flash-style games: Chopper, Defender, Runner." },
    { name: "Solitaire", path: "games/solitaire/index.html", category: "cards", icon: "♠️", tags: ["Classic"], description: "The classic patience card game. Klondike rules." },
    { name: "PuzzLLer", path: "games/puzzller/index.html", category: "puzzle", icon: "🧠", tags: ["Logic"], description: "Navigate grids and solve logic puzzles." },
    { name: "Jigsaw Engine", path: "games/jigsaw/index.html", category: "puzzle", icon: "🧩", tags: ["New", "Engine"], description: "Create and play custom jigsaw puzzles with any image." },
    { name: "C.o.D.E.", path: "projects/code/index.html", category: "puzzle", icon: "📟", tags: ["Simulation"], description: "Hacking simulator. Crack the numeric code against time." },

    // Tools / Projects
    { name: "Input A11y", path: "projects/input-a11y/index.html", category: "project", icon: "📷", tags: ["Utility"], description: "Barcode and QR code scanner with multiple detection modes." },
    { name: "MD Reader", path: "projects/md-reader/index.html", category: "project", icon: "📖", tags: ["Utility"], description: "Markdown reader and documentation viewer." },
    { name: "Cookbook", path: "projects/md-reader/index.html#COOKBOOK.md", category: "project", icon: "🍳", tags: ["Utility"], description: "Family recipes and cooking guide." },
    { name: "Regex Builder", path: "projects/regex_builder/index.html", category: "project", icon: "☃️", tags: ["Dev Tool"], description: "Build and test regular expressions with a winter theme." },
    { name: "Shipment Tracker", path: "projects/shipment-tracker/index.html", category: "project", icon: "📦", tags: ["Utility"], description: "Track packages from DHL, FedEx, UPS and more." },
    { name: "Test Portal", path: "projects/internal-tests/index.html", category: "project", icon: "🧪", tags: ["Internal"], description: "Centralized testing hub for F.O.N.G. codebase." },
    { name: "J-DevUtils", path: "projects/dev-utils/index.html", category: "project", icon: "🛠️", tags: ["Dev Tool"], description: "The Developer's Utility Belt: Timestamps, JSON, Base64, and more." },
    { name: "Web Archive", path: "projects/web-archive/index.html", category: "project", icon: "🏛️", tags: ["Gallery"], description: "A curated gallery of lost internet artifacts. Stylized historical interface." },
    { name: "Sprunki Survival", path: "projects/sprunki-survival/index.html", category: "project", icon: "📓", tags: ["Guide"], description: "Survival handbook for Incredibox Sprunki characters. Warning: Glitchy" },
    { name: "Survival Manual", path: "projects/survival-doc/index.html", category: "project", icon: "⚠️", tags: ["Docs"], description: "Worst-Case Scenario Survival Handbook style documentation." },
    { name: "Encyclopedia", path: "projects/encyclopedia/index.html", category: "project", icon: "📚", tags: ["Reference"], description: "The definitive interactive documentation of the F.O.N.G. realm." },
    { name: "Project TI-tanium", path: "projects/project-ti-tanium/index.html", category: "project", icon: "🧮", tags: ["Simulation"], description: "Hybrid TI-83+/86 emulator. Runs in Simulation or Emulation mode." }
];

// Initialize function
function init() {
    try {
        initTheme();
    } catch (e) {
        console.warn("Theme initialization failed:", e);
    }

    try {
        renderProjects('all');
    } catch (e) {
        console.error("Project rendering failed:", e);
    }

    try {
        initFilters();
    } catch (e) {
        console.warn("Filter initialization failed:", e);
    }
}

// Handle Loading State
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function initTheme() {
    // Theme is now managed by the inline theme switcher in index.html
    // This function is kept as a no-op for backward compatibility
}

function initFilters() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var i, btn;

    for (i = 0; i < filterBtns.length; i++) {
        btn = filterBtns[i];
        btn.addEventListener('click', function(e) {
            e.preventDefault();

            var filter = this.dataset.filter;

            // Update active button
            var j;
            for (j = 0; j < filterBtns.length; j++) {
                filterBtns[j].classList.remove('active');
                filterBtns[j].setAttribute('aria-pressed', 'false');
            }
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');

            renderProjects(filter);
        });
    }
}

function renderProjects(filter) {
    var grid = document.getElementById('grid');
    var aboutView = document.getElementById('about-view');

    // Handle About View
    if (filter === 'about') {
        if (grid) grid.classList.add('hidden');
        if (aboutView) {
            aboutView.classList.remove('hidden');
            // Initialize about section if needed
            if (typeof initAboutSection === 'function' && !aboutView.dataset.initialized) {
                initAboutSection();
                aboutView.dataset.initialized = 'true';
            }
        }
        return;
    }

    // Handle Standard Grid View
    if (aboutView) aboutView.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');

    if (!grid) return;

    grid.innerHTML = '';

    var delay = 0.1;
    var i, project, card;

    for (i = 0; i < projects.length; i++) {
        project = projects[i];
        try {
            if (filter === 'all' || project.category === filter) {
                card = document.createElement('a');
                card.href = project.path;
                card.className = 'game-card fade-in';
                if (project.category === 'project') {
                    card.classList.add('project');
                }
                card.dataset.category = project.category;
                card.style.animationDelay = delay + 's';

                card.innerHTML =
                    '<div class="card-icon" role="img" aria-label="' + project.name + '">' + project.icon + '</div>' +
                    '<div class="card-content">' +
                        '<span class="game-tag">' + (project.tags ? project.tags[0] : '') + '</span>' +
                        '<h3 class="game-title">' + project.name + '</h3>' +
                        '<p class="game-desc">' + project.description + '</p>' +
                    '</div>';

                grid.appendChild(card);
                delay += 0.05;
            }
        } catch (err) {
            console.error("Error rendering project:", project, err);
        }
    }
}
