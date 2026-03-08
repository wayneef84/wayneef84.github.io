/**
 * Hub Data - Global Play Counter Hydration
 * Tracks total plays across all games and displays in header
 * Strict ES5 compatible (no const/let, no arrow functions, no fetch)
 */

(function() {
    'use strict';

    // List of all games and projects to track
    var GAME_PATHS = [
        // Card
        'games/cards/blackjack/index.html',
        'games/cards/war/index.html',
        'games/cards/solitaire/index.html',
        'games/cards/big2/index.html',
        // Arcade
        'games/slots/index.html',
        'games/snake/index.html',
        'games/pong/index.html',
        'games/space_invaders/index.html',
        'games/breakout/index.html',
        'games/sky_breakers/index.html',
        'games/animal_stack/index.html',
        'games/sprunki/index.html',
        'games/j/index.html',
        'games/flash_classics/index.html',
        // Puzzle
        'games/flow/index.html',
        'games/sudoku/index.html',
        'games/minesweeper/index.html',
        'games/mahjong/index.html',
        'games/jigsaw/index.html',
        'games/xtc_ball/index.html',
        'games/board/index.html',
        // Educational
        'games/tracing/index.html',
        // Projects
        'projects/shipment-tracker/index.html',
        'projects/md-reader/index.html',
        'projects/encyclopedia/index.html',
        'projects/dev-utils/index.html',
        'projects/input-a11y/index.html',
        'projects/name-that-tune/index.html',
        'projects/code/index.html',
        'projects/regex_builder/index.html',
        'projects/web-archive/index.html',
        'projects/project-ti-tanium/index.html'
    ];

    /**
     * Get total play count across all games
     */
    function getTotalPlayCount() {
        var total = 0;
        for (var i = 0; i < GAME_PATHS.length; i++) {
            var path = GAME_PATHS[i];
            var count = parseInt(localStorage.getItem('playcount_' + path) || '0', 10);
            total += count;
        }
        return total;
    }

    /**
     * Update the play counter display in the header
     */
    function updatePlayCounterDisplay() {
        var totalCount = getTotalPlayCount();
        var playCountElement = document.getElementById('global-play-count');

        if (playCountElement) {
            if (totalCount === 0) {
                playCountElement.textContent = 'Plays: 0';
            } else if (totalCount >= 99999) {
                playCountElement.textContent = 'Plays: 99K+';
            } else if (totalCount >= 1000) {
                var thousands = Math.floor(totalCount / 1000);
                var remainder = totalCount % 1000;
                if (remainder === 0) {
                    playCountElement.textContent = 'Plays: ' + thousands + 'K';
                } else {
                    playCountElement.textContent = 'Plays: ' + thousands + '.' +
                        String(Math.floor(remainder / 100)) + 'K';
                }
            } else {
                playCountElement.textContent = 'Plays: ' + totalCount;
            }
        }
    }

    /**
     * Initialize on DOM ready
     */
    function init() {
        updatePlayCounterDisplay();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose updatePlayCounterDisplay globally so games can call it
    window.updateGlobalPlayCount = updatePlayCounterDisplay;
})();
