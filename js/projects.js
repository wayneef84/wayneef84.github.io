const projects = [
    // Games
    { name: "Card Games", path: "games/cards/index.html", category: "cards", icon: "🃏", tags: ["Shared Engine"], description: "Blackjack, War, and more built on a robust shared engine." },
    { name: "Sudoku", path: "games/sudoku/index.html", category: "puzzle", icon: "🧩", tags: ["Classic"], description: "Classic Sudoku puzzle with multiple difficulty levels." },
    { name: "Letter Tracing", path: "games/tracing/index.html", category: "puzzle", icon: "✏️", tags: ["Educational"], description: "Learn to write with voice guidance and stroke validation." },
    { name: "Breakout", path: "games/breakout/index.html", category: "arcade", icon: "🧱", tags: ["Arcade"], description: "Smash bricks with a ball and paddle. Now with particles!" },
    { name: "Pong", path: "games/pong/index.html", category: "arcade", icon: "🏓", tags: ["Arcade"], description: "The original tennis game. 1P vs CPU." },
    { name: "Space Invaders", path: "games/space_invaders/index.html", category: "arcade", icon: "👾", tags: ["Arcade"], description: "Defend Earth from the alien invasion." },
    { name: "Slots", path: "games/slots/index.html", category: "arcade", icon: "🎰", tags: ["Arcade"], description: "Feature-rich slot machine with multiple themes and bonus rounds." },
    { name: "Board Games", path: "games/board/index.html", category: "board", icon: "♟️", tags: ["Strategy"], description: "Play Chess, Checkers, Xiangqi and more." },
    { name: "Snake", path: "games/snake/index.html", category: "arcade", icon: "🐍", tags: ["Classic"], description: "The classic game of snake. Eat apples, grow long, don't crash." },
    { name: "Magic 8 Ball", path: "games/xtc_ball/index.html", category: "puzzle", icon: "🎱", tags: ["Casual"], description: "Ask a question and reveal your destiny." },
    { name: "Sprunki Mixer", path: "games/sprunki/index.html", category: "arcade", icon: "🎵", tags: ["Music"], description: "Mix beats and create music with animated characters." },
    { name: "Poker Hall", path: "games/cards/index.html?game=poker", category: "cards", icon: "♣️", tags: ["New"], description: "Texas Hold'em, 5 Card Draw, and more." },
    { name: "Flow Games", path: "games/flow/index.html", category: "puzzle", icon: "🔗", tags: ["Puzzle"], description: "Connect matching colors with pipes across the board." },
    { name: "Animal Stack", path: "games/animal_stack/index.html", category: "arcade", icon: "🦒", tags: ["Arcade"], description: "Stack animals as high as you can without toppling over." },
    { name: "SKYbreakers", path: "games/sky_breakers/index.html", category: "arcade", icon: "🚀", tags: ["Arcade"], description: "Break through the sky in this high-flying arcade game." },
    { name: "Minesweeper+", path: "games/minesweeper/index.html", category: "puzzle", icon: "💣", tags: ["Classic"], description: "Classic Minesweeper with lives, power-ups, and custom themes." },
    { name: "Mahjong", path: "games/mahjong/index.html", category: "puzzle", icon: "🀄", tags: ["Classic"], description: "Classic Mahjong Solitaire tile matching game." },
    { name: "Solitaire", path: "games/solitaire/index.html", category: "cards", icon: "♠️", tags: ["Classic"], description: "The classic patience card game. Klondike rules." },
    { name: "PuzzLLer", path: "games/puzzller/index.html", category: "puzzle", icon: "🧠", tags: ["Logic"], description: "Navigate grids and solve logic puzzles." },
    { name: "C.o.D.E.", path: "projects/code/index.html", category: "puzzle", icon: "📟", tags: ["Simulation"], description: "Hacking simulator. Crack the numeric code against time." },

    // Tools / Projects
    { name: "Input A11y", path: "projects/input-a11y/index.html", category: "project", icon: "📷", tags: ["Utility"], description: "Barcode and QR code scanner with multiple detection modes." },
    { name: "MD Reader", path: "projects/md-reader/index.html", category: "project", icon: "📖", tags: ["Utility"], description: "Markdown reader and documentation viewer." },
    { name: "Cookbook", path: "projects/md-reader/index.html#COOKBOOK.md", category: "project", icon: "🍳", tags: ["Utility"], description: "Family recipes and cooking guide." },
    { name: "Regex Builder", path: "projects/regex_builder/index.html", category: "project", icon: "☃️", tags: ["Dev Tool"], description: "Build and test regular expressions with a winter theme." },
    { name: "Shipment Tracker", path: "projects/shipment-tracker/index.html", category: "project", icon: "📦", tags: ["Utility"], description: "Track packages from DHL, FedEx, UPS and more." },
    { name: "Test Portal", path: "projects/internal-tests/index.html", category: "project", icon: "🧪", tags: ["Internal"], description: "Centralized testing hub for F.O.N.G. codebase." }
];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProjects('all');
    initFilters();
});

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('fong_theme');

    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    } else {
        themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            themeToggle.textContent = isLight ? '🌙' : '☀️';
            localStorage.setItem('fong_theme', isLight ? 'light' : 'dark');
        });
    }
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Prevent default just in case, though they are buttons
            e.preventDefault();

            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            renderProjects(filter);
        });
    });
}

function renderProjects(filter) {
    const grid = document.getElementById('grid');
    const aboutView = document.getElementById('about-view');

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

    let delay = 0.1;

    projects.forEach(project => {
        // Filter logic: show if filter is 'all' OR category matches
        // For 'project' filter, we want to show things with category 'project' (tools)
        if (filter === 'all' || project.category === filter) {
            const card = document.createElement('a');
            card.href = project.path;
            card.className = 'game-card fade-in';
            if (project.category === 'project') {
                card.classList.add('project');
            }
            card.dataset.category = project.category;
            card.style.animationDelay = `${delay}s`;

            card.innerHTML = `
                <div class="card-icon" role="img" aria-label="${project.name}">${project.icon}</div>
                <div class="card-content">
                    <span class="game-tag">${project.tags[0]}</span>
                    <h3 class="game-title">${project.name}</h3>
                    <p class="game-desc">${project.description}</p>
                </div>
            `;

            grid.appendChild(card);
            delay += 0.05;
        }
    });
}
