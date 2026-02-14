/**
 * Play Counter & Advanced Sorting System
 * Tracks play counts, manages hidden games, sorting preferences
 */

(function() {
    'use strict';

    // State Management
    var PlayCounter = {
        getCount: function(gamePath) {
            return parseInt(localStorage.getItem('playcount_' + gamePath) || '0', 10);
        },

        incrementCount: function(gamePath) {
            var count = this.getCount(gamePath);
            count = Math.min(count + 1, 99); // Cap at 99
            localStorage.setItem('playcount_' + gamePath, count);
            return count;
        },

        resetCount: function(gamePath) {
            localStorage.removeItem('playcount_' + gamePath);
        },

        resetAllCounts: function() {
            var keys = Object.keys(localStorage);
            keys.forEach(function(key) {
                if (key.startsWith('playcount_')) {
                    localStorage.removeItem(key);
                }
            });
        },

        formatCount: function(count) {
            if (count === 0) return '';
            if (count >= 99) return '99+';
            return count.toString();
        }
    };

    var HiddenGames = {
        getHidden: function() {
            return JSON.parse(localStorage.getItem('hidden_games') || '[]');
        },

        isHidden: function(gamePath) {
            return this.getHidden().indexOf(gamePath) !== -1;
        },

        hide: function(gamePath) {
            var hidden = this.getHidden();
            if (hidden.indexOf(gamePath) === -1) {
                hidden.push(gamePath);
                localStorage.setItem('hidden_games', JSON.stringify(hidden));
            }
        },

        unhide: function(gamePath) {
            var hidden = this.getHidden();
            var index = hidden.indexOf(gamePath);
            if (index !== -1) {
                hidden.splice(index, 1);
                localStorage.setItem('hidden_games', JSON.stringify(hidden));
            }
        },

        unhideAll: function() {
            localStorage.removeItem('hidden_games');
        }
    };

    var SortPreferences = {
        get: function() {
            return {
                by: localStorage.getItem('sort_by') || 'playcount',
                direction: localStorage.getItem('sort_direction') || 'desc'
            };
        },

        set: function(by, direction) {
            localStorage.setItem('sort_by', by);
            localStorage.setItem('sort_direction', direction);
        }
    };

    // Sorting Functions
    var Sorters = {
        playcount: function(a, b, direction) {
            var countA = PlayCounter.getCount(a.path);
            var countB = PlayCounter.getCount(b.path);
            return direction === 'desc' ? countB - countA : countA - countB;
        },

        name: function(a, b, direction) {
            var nameA = a.name.toLowerCase();
            var nameB = b.name.toLowerCase();
            if (direction === 'asc') {
                return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
            } else {
                return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
            }
        },

        created: function(a, b, direction) {
            // Use array index as proxy for creation order
            var indexA = window.projects ? window.projects.indexOf(a) : 0;
            var indexB = window.projects ? window.projects.indexOf(b) : 0;
            return direction === 'asc' ? indexA - indexB : indexB - indexA;
        },

        category: function(a, b, direction) {
            var catA = a.category || '';
            var catB = b.category || '';
            if (direction === 'asc') {
                return catA < catB ? -1 : catA > catB ? 1 : 0;
            } else {
                return catA > catB ? -1 : catA < catB ? 1 : 0;
            }
        }
    };

    // Render projects with counters and sorting
    function renderProjectsWithCounters(filter) {
        var grid = document.getElementById('grid');
        if (!grid || !window.projects) return;

        grid.innerHTML = '';

        // Get preferences
        var prefs = SortPreferences.get();
        var hidden = HiddenGames.getHidden();

        // Filter projects
        var filtered = window.projects.filter(function(project) {
            // Check hidden status
            if (hidden.indexOf(project.path) !== -1) return false;
            // Check category filter
            return filter === 'all' || project.category === filter;
        });

        // Sort projects
        var sorter = Sorters[prefs.by] || Sorters.playcount;
        filtered.sort(function(a, b) {
            return sorter(a, b, prefs.direction);
        });

        // Render
        var delay = 0.1;
        filtered.forEach(function(project) {
            var card = createCard(project, delay);
            grid.appendChild(card);
            delay += 0.05;
        });
    }

    function createCard(project, delay) {
        var card = document.createElement('a');
        card.href = project.path;
        card.className = 'game-card fade-in';
        if (project.category === 'project') {
            card.classList.add('project');
        }
        card.dataset.category = project.category;
        card.dataset.path = project.path;
        card.style.animationDelay = delay + 's';

        // Get play count
        var playCount = PlayCounter.getCount(project.path);
        var countDisplay = PlayCounter.formatCount(playCount);

        // Build card HTML
        card.innerHTML =
            '<div class="card-icon" role="img" aria-label="' + project.name + '">' + project.icon + '</div>' +
            (countDisplay ? '<div class="play-counter">' + countDisplay + '</div>' : '') +
            '<div class="card-content">' +
                '<span class="game-tag">' + (project.tags ? project.tags[0] : '') + '</span>' +
                '<h3 class="game-title">' + project.name + '</h3>' +
                '<p class="game-desc">' + project.description + '</p>' +
            '</div>';

        // Increment count on click
        card.addEventListener('click', function(e) {
            PlayCounter.incrementCount(project.path);
        });

        return card;
    }

    // Main Menu Management
    function openMainMenu() {
        var menu = document.getElementById('mainMenu');
        if (menu) {
            menu.classList.remove('hidden');
            populateHiddenList();
        }
    }

    function closeMainMenu() {
        var menu = document.getElementById('mainMenu');
        if (menu) menu.classList.add('hidden');
    }

    function populateHiddenList() {
        var list = document.getElementById('hiddenGamesList');
        if (!list || !window.projects) return;

        var hidden = HiddenGames.getHidden();
        if (hidden.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No hidden games</div>';
            return;
        }

        list.innerHTML = '';
        hidden.forEach(function(path) {
            var project = window.projects.find(function(p) { return p.path === path; });
            if (!project) return;

            var item = document.createElement('div');
            item.className = 'hidden-game-item';
            item.innerHTML =
                '<span class="icon">' + project.icon + '</span>' +
                '<span class="name">' + project.name + '</span>' +
                '<button class="unhide-btn" data-path="' + path + '">Show</button>';

            list.appendChild(item);
        });

        // Add unhide button handlers
        list.querySelectorAll('.unhide-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var path = this.getAttribute('data-path');
                HiddenGames.unhide(path);
                populateHiddenList();
                refreshCurrentView();
            });
        });
    }

    function refreshCurrentView() {
        // Get current filter
        var activeFilter = document.querySelector('.filter-btn.active');
        var filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        renderProjectsWithCounters(filter);
    }

    // Initialize
    function init() {
        // Replace global renderProjects
        if (typeof window.renderProjects !== 'undefined') {
            window.originalRenderProjects = window.renderProjects;
        }

        window.renderProjects = renderProjectsWithCounters;

        // Menu button
        var menuBtn = document.getElementById('mainMenuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', openMainMenu);
        }

        // Close menu button
        var closeBtn = document.getElementById('closeMainMenuBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMainMenu);
        }

        // Reset play counts
        var resetCountsBtn = document.getElementById('resetPlayCounts');
        if (resetCountsBtn) {
            resetCountsBtn.addEventListener('click', function() {
                if (confirm('Reset all play counters? This cannot be undone.')) {
                    PlayCounter.resetAllCounts();
                    refreshCurrentView();
                    alert('Play counters reset!');
                }
            });
        }

        // Unhide all games
        var unhideAllBtn = document.getElementById('unhideAllGames');
        if (unhideAllBtn) {
            unhideAllBtn.addEventListener('click', function() {
                HiddenGames.unhideAll();
                populateHiddenList();
                refreshCurrentView();
            });
        }

        // Sort options
        var sortSelect = document.getElementById('sortBy');
        var sortDirSelect = document.getElementById('sortDirection');

        if (sortSelect && sortDirSelect) {
            var prefs = SortPreferences.get();
            sortSelect.value = prefs.by;
            sortDirSelect.value = prefs.direction;

            sortSelect.addEventListener('change', function() {
                SortPreferences.set(this.value, sortDirSelect.value);
                closeMainMenu();
                refreshCurrentView();
            });

            sortDirSelect.addEventListener('change', function() {
                SortPreferences.set(sortSelect.value, this.value);
                closeMainMenu();
                refreshCurrentView();
            });
        }

        // Context menu for hiding games
        document.addEventListener('contextmenu', function(e) {
            var card = e.target.closest('.game-card');
            if (card) {
                e.preventDefault();
                var path = card.getAttribute('data-path');
                if (path && confirm('Hide "' + card.querySelector('.game-title').textContent + '"?')) {
                    HiddenGames.hide(path);
                    refreshCurrentView();
                }
            }
        });
    }

    // Export globally
    window.PlayCounterSystem = {
        init: init,
        refresh: refreshCurrentView
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
