/**
 * Hub Data - Global Play Counter Hydration
 * Shows the total plays (all catalog games and tools) in the header.
 * Totals come from FongStats (js/player-stats.js). Load AFTER js/catalog.js
 * and js/player-stats.js. Strict ES5.
 */

(function() {
    'use strict';

    /**
     * Update the play counter display in the header
     */
    function updatePlayCounterDisplay() {
        var el = document.getElementById('global-play-count');
        if (!el) return;
        var total = 0;
        if (window.FongStats) {
            try { total = window.FongStats.totalPlays(); } catch (e) { total = 0; }
            el.textContent = 'Plays: ' + window.FongStats.format(total);
        } else {
            el.textContent = 'Plays: 0';
        }
    }

    function init() {
        updatePlayCounterDisplay();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Back/forward navigation can restore the page from cache with a stale number
    window.addEventListener('pageshow', function(ev) {
        if (ev && ev.persisted) updatePlayCounterDisplay();
    });

    // Games and FongStats.recordPlay call this to refresh the header
    window.updateGlobalPlayCount = updatePlayCounterDisplay;
})();
