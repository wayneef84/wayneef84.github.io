/**
 * Hub Filters & Featured Game Rotation
 * Handles category filtering and rotating featured game display
 * Strict ES5 compatible
 */

(function() {
    'use strict';

    // Game catalog with metadata
    var GAMES = [
        { id: 'blackjack', category: 'card', title: 'Blackjack', href: './games/cards/blackjack/index.html' },
        { id: 'war', category: 'card', title: 'War', href: './games/cards/war/index.html' },
        { id: 'letter-tracing', category: 'edu', title: 'Letter Tracing', href: './games/tracing/index.html' },
        { id: 'j-quiz', category: 'edu', title: 'J Quiz', href: './games/j/index.html' },
        { id: 'slots', category: 'arcade', title: 'Slots', href: './games/slots/index.html' },
        { id: 'snake', category: 'arcade', title: 'Neon Snake', href: './games/snake/index.html' },
        { id: 'sprunki', category: 'arcade', title: 'Sprunki Mixer', href: './games/sprunki/index.html' },
        { id: 'pong', category: 'arcade', title: 'Pong', href: './games/pong/index.html' },
        { id: 'space-invaders', category: 'arcade', title: 'Space Invaders', href: './games/space_invaders/index.html' },
        { id: 'breakout', category: 'arcade', title: 'Breakout', href: './games/breakout/index.html' },
        { id: 'sky-breakers', category: 'arcade', title: 'Sky Breakers', href: './games/sky_breakers/index.html' },
        { id: 'board', category: 'arcade', title: 'Board Games', href: './games/board/index.html' },
        { id: 'animal-stack', category: 'arcade', title: 'Animal Stack', href: './games/animal_stack/index.html' },
        { id: 'flow', category: 'puzzle', title: 'Flow', href: './games/flow/index.html' },
        { id: 'sudoku', category: 'puzzle', title: 'Sudoku', href: './games/sudoku/index.html' },
        { id: 'minesweeper', category: 'puzzle', title: 'Minesweeper', href: './games/minesweeper/index.html' },
        { id: 'mahjong', category: 'puzzle', title: 'Mahjong', href: './games/mahjong/index.html' },
        { id: 'jigsaw', category: 'puzzle', title: 'Jigsaw', href: './games/jigsaw/index.html' },
        { id: 'xtc-ball', category: 'puzzle', title: 'XTC Ball', href: './games/xtc_ball/index.html' }
    ];

    /**
     * Initialize category filters
     */
    function initializeFilters() {
        var filterBtns = document.querySelectorAll('.filter-btn');
        var gameCards = document.querySelectorAll('.game-card');

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var category = btn.getAttribute('data-category');

                // Update active state
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                // Save preference to localStorage
                localStorage.setItem('hub_filter_preference', category);

                // Filter game cards
                filterGameCards(category, gameCards);
            });
        });

        // Restore saved filter preference
        var savedFilter = localStorage.getItem('hub_filter_preference');
        if (savedFilter) {
            var activeBtn = document.querySelector('[data-category="' + savedFilter + '"]');
            if (activeBtn) {
                activeBtn.click();
            }
        }
    }

    /**
     * Filter game cards by category
     */
    function filterGameCards(category, gameCards) {
        gameCards.forEach(function(card) {
            var cardCategory = card.getAttribute('data-category');

            if (category === 'all' || cardCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Rotate featured game on page load
     * Cycles through games that track play count
     */
    function rotateFeaturedGame() {
        var featuredSection = document.querySelector('section:first-of-type');
        if (!featuredSection) return;

        // Games that should be featured (high-interest)
        var featureableGames = [
            { title: 'Blackjack', href: './games/cards/blackjack/index.html', version: 'v1.0.6' },
            { title: 'Sudoku', href: './games/sudoku/index.html', version: 'v2.0' },
            { title: 'Neon Snake', href: './games/snake/index.html', version: 'v1.0' },
            { title: 'Flow', href: './games/flow/index.html', version: 'v1.0' }
        ];

        // Rotate based on day of month (changes daily)
        var dayOfMonth = new Date().getDate();
        var gameIndex = (dayOfMonth - 1) % featureableGames.length;
        var featured = featureableGames[gameIndex];

        // Update featured section title and link
        var h1 = featuredSection.querySelector('h1');
        var p = featuredSection.querySelector('p');
        var playBtn = featuredSection.querySelector('.btn-primary');

        if (h1) h1.textContent = featured.title + ' ' + featured.version;
        if (p) p.textContent = 'Experience featured game. Check back tomorrow for a different game!';
        if (playBtn) playBtn.href = featured.href;
    }

    /**
     * Initialize on DOM ready
     */
    function init() {
        initializeFilters();
        rotateFeaturedGame();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
