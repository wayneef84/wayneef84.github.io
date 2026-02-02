/**
 * Chinese Character Learning Game
 * Uses Hanzi Writer for stroke animation and practice
 */

(function() {
    'use strict';

    // Game State
    var state = {
        characters: {},
        hskIndex: {},
        groups: {},
        strokeTypes: [],
        currentHSK: 1,
        currentChar: null,
        currentChars: [], // Current character list (HSK, daily, or group)
        writer: null,
        isQuizMode: false,
        isAnimating: false, // Track if animation is playing
        animationTimer: null, // <--- ADDED: Track the loop timer so we can kill it
        completedChars: [],
        currentView: 'menu', // 'menu', 'characters', 'daily', 'groups', 'group'
        currentGroup: null,
        daily: {
            currentStreak: 0,
            totalDays: 0,
            lastPracticeDate: null,
            todaysCharacters: [],
            todaysProgress: []
        },
        settings: {
            animationSpeed: 1,
            showOutline: true,
            hintsAfterMistakes: 3,
            audioEnabled: true,
            dialect: 'mandarin', // 'mandarin' or 'cantonese'
            showStrokeNumbers: true
        }
    };

    // DOM Elements
    var elements = {};

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheElements();
        loadSettings();
        loadDaily();
        loadData();
        bindEvents();
        updateStreakDisplay();
        handleInitialRoute();

        // Listen for browser back/forward
        window.addEventListener('popstate', handlePopState);
    }

    // ========== URL & HISTORY MANAGEMENT ==========

    function handleInitialRoute() {
        var params = new URLSearchParams(window.location.search);
        var char = params.get('char');
        var group = params.get('group');
        var hsk = params.get('hsk');
        var view = params.get('view');

        // Wait for data to load, then navigate
        var checkData = setInterval(function() {
            if (Object.keys(state.characters).length > 0) {
                clearInterval(checkData);

                if (char && state.characters[char]) {
                    // Direct character link
                    navigateToCharacter(char, false);
                } else if (group && state.groups[group]) {
                    // Group link
                    navigateToGroup(group, char, false);
                } else if (hsk) {
                    // HSK level link
                    navigateToHSK(parseInt(hsk, 10), char, false);
                } else if (view === 'daily') {
                    startDailyMode(false);
                } else if (view === 'groups') {
                    showGroupsView(false);
                } else if (view === 'characters') {
                    showCharactersView(false);
                }
                // else stay on menu
            }
        }, 100);
    }

    function handlePopState(e) {
        if (e.state) {
            // Restore state from history
            if (e.state.view === 'menu') {
                showMainMenu(false);
            } else if (e.state.view === 'groups') {
                showGroupsView(false);
            } else if (e.state.view === 'group' && e.state.group) {
                navigateToGroup(e.state.group, e.state.char, false);
            } else if (e.state.view === 'characters') {
                navigateToHSK(e.state.hsk || 1, e.state.char, false);
            } else if (e.state.view === 'daily') {
                startDailyMode(false);
            }
        } else {
            showMainMenu(false);
        }
    }

    function updateURL(params, pushHistory) {
        var url = new URL(window.location.href);
        url.search = '';

        for (var key in params) {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            }
        }

        var historyState = {
            view: state.currentView,
            char: state.currentChar,
            group: state.currentGroup,
            hsk: state.currentHSK
        };

        if (pushHistory !== false) {
            history.pushState(historyState, '', url.toString());
        } else {
            history.replaceState(historyState, '', url.toString());
        }
    }

    function navigateToCharacter(char, pushHistory) {
        // Find which list contains this character
        var found = false;

        // Check current list first
        if (state.currentChars.indexOf(char) !== -1) {
            selectCharacter(char);
            animateCharacter();
            updateURL({ char: char, view: state.currentView, group: state.currentGroup, hsk: state.currentHSK }, pushHistory);
            return;
        }

        // Check HSK levels
        for (var level = 1; level <= 6; level++) {
            var chars = state.hskIndex[level] || [];
            if (chars.indexOf(char) !== -1) {
                state.currentHSK = level;
                state.currentChars = chars;
                state.currentView = 'characters';
                elements.mainMenu.classList.add('hidden');
                elements.groupsView.classList.add('hidden');
                elements.dailyProgress.classList.add('hidden');
                elements.hskSelect.value = level;
                populateGrid();
                selectCharacter(char);
                animateCharacter();
                updateURL({ char: char, hsk: level, view: 'characters' }, pushHistory);
                found = true;
                break;
            }
        }
    }

    function navigateToGroup(groupKey, char, pushHistory) {
        var group = state.groups[groupKey];
        if (!group) return;

        state.currentView = 'group';
        state.currentGroup = groupKey;
        state.currentChars = group.characters || [];

        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.add('hidden');
        elements.dailyProgress.classList.add('hidden');
        populateGrid();

        var targetChar = char && state.currentChars.indexOf(char) !== -1 ? char : state.currentChars[0];
        if (targetChar) {
            selectCharacter(targetChar);
            animateCharacter();
        }

        updateURL({ group: groupKey, char: targetChar, view: 'group' }, pushHistory);
    }

    function navigateToHSK(level, char, pushHistory) {
        state.currentHSK = level;
        state.currentChars = state.hskIndex[level] || [];
        state.currentView = 'characters';

        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.add('hidden');
        elements.dailyProgress.classList.add('hidden');
        elements.hskSelect.value = level;
        populateGrid();

        var targetChar = char && state.currentChars.indexOf(char) !== -1 ? char : state.currentChars[0];
        if (targetChar) {
            selectCharacter(targetChar);
            animateCharacter();
        }

        updateURL({ hsk: level, char: targetChar, view: 'characters' }, pushHistory);
    }

    function cacheElements() {
        // Main menu
        elements.mainMenu = document.getElementById('main-menu');
        elements.menuDaily = document.getElementById('menu-daily');
        elements.menuCharacters = document.getElementById('menu-characters');
        elements.menuGroups = document.getElementById('menu-groups');
        elements.menuStrokes = document.getElementById('menu-strokes');
        elements.menuSettings = document.getElementById('menu-settings');
        elements.menuStreak = document.getElementById('menu-streak');
        elements.streakText = document.getElementById('streak-text');

        // Groups view
        elements.groupsView = document.getElementById('groups-view');
        elements.groupsGrid = document.getElementById('groups-grid');
        elements.groupsBack = document.getElementById('groups-back');

        // Daily progress
        elements.dailyProgress = document.getElementById('daily-progress');
        elements.dailyCount = document.getElementById('daily-count');
        elements.dailyProgressFill = document.getElementById('daily-progress-fill');
        elements.dailyStreakDisplay = document.getElementById('daily-streak-display');

        // Game elements
        elements.menuBtn = document.getElementById('menu-btn');
        elements.characterTarget = document.getElementById('character-target');
        elements.pinyinDisplay = document.getElementById('pinyin-display');
        elements.jyutpingDisplay = document.getElementById('jyutping-display');
        elements.definitionDisplay = document.getElementById('definition-display');
        elements.strokesDisplay = document.getElementById('strokes-display');
        elements.hskDisplay = document.getElementById('hsk-display');
        elements.characterGrid = document.getElementById('character-grid');
        elements.hskSelect = document.getElementById('hsk-select');
        elements.prevBtn = document.getElementById('prev-btn');
        elements.animateBtn = document.getElementById('animate-btn');
        elements.practiceBtn = document.getElementById('practice-btn');
        elements.nextBtn = document.getElementById('next-btn');
        elements.resetProgress = document.getElementById('reset-progress');
        elements.helpBtn = document.getElementById('help-btn');
        elements.settingsBtn = document.getElementById('settings-btn');
        elements.helpModal = document.getElementById('help-modal');
        elements.settingsModal = document.getElementById('settings-modal');
        elements.closeHelp = document.getElementById('close-help');
        elements.closeSettings = document.getElementById('close-settings');
        elements.strokeGrid = document.getElementById('stroke-grid');
        elements.strokeDetail = document.getElementById('stroke-detail');
        elements.celebration = document.getElementById('celebration');
        elements.celebrationPrev = document.getElementById('celebration-prev');
        elements.celebrationRetry = document.getElementById('celebration-retry');
        elements.celebrationNext = document.getElementById('celebration-next');
        elements.prevCharPreview = document.getElementById('prev-char-preview');
        elements.retryCharPreview = document.getElementById('retry-char-preview');
        elements.nextCharPreview = document.getElementById('next-char-preview');
        elements.animationSpeed = document.getElementById('animation-speed');
        elements.speedValue = document.getElementById('speed-value');
        elements.showOutline = document.getElementById('show-outline');
        elements.showHints = document.getElementById('show-hints');
        elements.hintsValue = document.getElementById('hints-value');
        elements.audioEnabled = document.getElementById('audio-enabled');
        elements.dialectSelect = document.getElementById('dialect-select');
        elements.showStrokeNumbers = document.getElementById('show-stroke-numbers');
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('chinese-settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                // Merge with defaults
                for (var key in parsed) {
                    if (parsed.hasOwnProperty(key)) {
                        state.settings[key] = parsed[key];
                    }
                }
            }
            var completed = localStorage.getItem('chinese-completed');
            if (completed) {
                state.completedChars = JSON.parse(completed);
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        applySettings();
    }

    function loadDaily() {
        try {
            var saved = localStorage.getItem('chinese-daily');
            if (saved) {
                state.daily = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load daily data:', e);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('chinese-settings', JSON.stringify(state.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    function saveDaily() {
        try {
            localStorage.setItem('chinese-daily', JSON.stringify(state.daily));
        } catch (e) {
            console.warn('Could not save daily data:', e);
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem('chinese-completed', JSON.stringify(state.completedChars));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    function resetAllProgress() {
        try {
            // Clear all localStorage for this app
            localStorage.removeItem('chinese-settings');
            localStorage.removeItem('chinese-completed');
            localStorage.removeItem('chinese-daily');

            // Reset state to defaults
            state.completedChars = [];
            state.daily = {
                currentStreak: 0,
                totalDays: 0,
                lastPracticeDate: null,
                todaysCharacters: [],
                todaysProgress: []
            };
            state.settings = {
                animationSpeed: 1,
                showOutline: true,
                hintsAfterMistakes: 3,
                audioEnabled: true,
                dialect: 'mandarin',
                showStrokeNumbers: true
            };

            // Apply defaults to UI
            applySettings();
            updateStreakDisplay();
            populateGrid();

            // Close settings modal
            elements.settingsModal.classList.add('hidden');

            // Show confirmation
            alert('All progress has been reset!');
        } catch (e) {
            console.error('Could not reset progress:', e);
            alert('Error resetting progress. Please try again.');
        }
    }

    function applySettings() {
        if (elements.animationSpeed) {
            elements.animationSpeed.value = state.settings.animationSpeed;
            elements.speedValue.textContent = state.settings.animationSpeed + 'x';
        }
        if (elements.showOutline) {
            elements.showOutline.checked = state.settings.showOutline;
        }
        if (elements.showHints) {
            elements.showHints.value = state.settings.hintsAfterMistakes;
            elements.hintsValue.textContent = state.settings.hintsAfterMistakes;
        }
        if (elements.audioEnabled) {
            elements.audioEnabled.checked = state.settings.audioEnabled;
        }
        if (elements.dialectSelect) {
            elements.dialectSelect.value = state.settings.dialect;
        }
        if (elements.showStrokeNumbers) {
            elements.showStrokeNumbers.checked = state.settings.showStrokeNumbers;
        }
        updateDialectHighlight();
    }

    function updateDialectHighlight() {
        if (!elements.pinyinDisplay || !elements.jyutpingDisplay) return;

        elements.pinyinDisplay.classList.remove('active-dialect');
        elements.jyutpingDisplay.classList.remove('active-dialect');

        if (state.settings.dialect === 'mandarin') {
            elements.pinyinDisplay.classList.add('active-dialect');
        } else {
            elements.jyutpingDisplay.classList.add('active-dialect');
        }
    }

    function updateStreakDisplay() {
        var text = state.daily.currentStreak + ' day streak | ' + state.daily.totalDays + ' total days';
        if (elements.streakText) {
            elements.streakText.textContent = text;
        }
        if (elements.dailyStreakDisplay) {
            elements.dailyStreakDisplay.textContent = state.daily.currentStreak;
        }
    }

    function loadData() {
        // Load character data
        fetch('data/characters.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                state.characters = data.characters;
                state.hskIndex = data.hskIndex;
                state.groups = data.groups || {};
                populateGroupsView();
            })
            .catch(function(err) {
                console.error('Failed to load character data:', err);
            });

        // Load stroke types
        fetch('data/stroke-types.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                state.strokeTypes = data.strokeTypes;
                populateStrokeHelp();
            })
            .catch(function(err) {
                console.error('Failed to load stroke types:', err);
            });
    }

    function bindEvents() {
        // Menu items
        elements.menuDaily.addEventListener('click', function() {
            startDailyMode(true);
        });
        elements.menuCharacters.addEventListener('click', function() {
            showCharactersView(true);
        });
        elements.menuGroups.addEventListener('click', function() {
            showGroupsView(true);
        });
        elements.menuStrokes.addEventListener('click', function() {
            elements.helpModal.classList.remove('hidden');
        });
        elements.menuSettings.addEventListener('click', function() {
            elements.settingsModal.classList.remove('hidden');
        });

        // Menu button in game - go back in history or to menu
        elements.menuBtn.addEventListener('click', function() {
            if (history.length > 1) {
                history.back();
            } else {
                showMainMenu(true);
            }
        });

        // Groups view back button
        elements.groupsBack.addEventListener('click', function() {
            if (history.length > 1) {
                history.back();
            } else {
                showMainMenu(true);
            }
        });

        // HSK Level Selection
        elements.hskSelect.addEventListener('change', function() {
            navigateToHSK(parseInt(this.value, 10), null, true);
        });

        // Action Buttons
        elements.prevBtn.addEventListener('click', prevCharacter);
        elements.animateBtn.addEventListener('click', animateCharacter);
        elements.practiceBtn.addEventListener('click', startPractice);
        elements.nextBtn.addEventListener('click', nextCharacter);

        // Touch character during animation to speak and start practice
        elements.characterTarget.addEventListener('click', handleCharacterTouch);

        // Pinyin/Jyutping click for dialect
        elements.pinyinDisplay.addEventListener('click', function() {
            state.settings.dialect = 'mandarin';
            saveSettings();
            updateDialectHighlight();
            speakCharacter(state.currentChar, 'mandarin');
        });
        elements.jyutpingDisplay.addEventListener('click', function() {
            state.settings.dialect = 'cantonese';
            saveSettings();
            updateDialectHighlight();
            speakCharacter(state.currentChar, 'cantonese');
        });

        // Modal Controls
        elements.helpBtn.addEventListener('click', function() {
            elements.helpModal.classList.remove('hidden');
        });
        elements.settingsBtn.addEventListener('click', function() {
            elements.settingsModal.classList.remove('hidden');
        });
        elements.closeHelp.addEventListener('click', function() {
            elements.helpModal.classList.add('hidden');
        });
        elements.closeSettings.addEventListener('click', function() {
            elements.settingsModal.classList.add('hidden');
        });

        // Close modals on backdrop click
        elements.helpModal.addEventListener('click', function(e) {
            if (e.target === elements.helpModal) {
                elements.helpModal.classList.add('hidden');
            }
        });
        elements.settingsModal.addEventListener('click', function(e) {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.classList.add('hidden');
            }
        });

        // Settings controls
        elements.animationSpeed.addEventListener('input', function() {
            state.settings.animationSpeed = parseFloat(this.value);
            elements.speedValue.textContent = this.value + 'x';
            saveSettings();
        });
        elements.showOutline.addEventListener('change', function() {
            state.settings.showOutline = this.checked;
            saveSettings();
            if (state.writer && state.currentChar) {
                selectCharacter(state.currentChar);
            }
        });
        elements.showHints.addEventListener('input', function() {
            state.settings.hintsAfterMistakes = parseInt(this.value, 10);
            elements.hintsValue.textContent = this.value;
            saveSettings();
        });
        elements.audioEnabled.addEventListener('change', function() {
            state.settings.audioEnabled = this.checked;
            saveSettings();
        });
        elements.dialectSelect.addEventListener('change', function() {
            state.settings.dialect = this.value;
            saveSettings();
            updateDialectHighlight();
        });
        elements.showStrokeNumbers.addEventListener('change', function() {
            state.settings.showStrokeNumbers = this.checked;
            saveSettings();
        });

        // Reset progress button
        elements.resetProgress.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset ALL progress? This will clear:\n• Completed characters\n• Daily streak\n• All settings\n\nThis cannot be undone!')) {
                resetAllProgress();
            }
        });

        // Celebration - click Prev button to go to previous character
        elements.celebrationPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            elements.celebration.classList.add('hidden');
            prevCharacter();
            setTimeout(function() {
                animateCharacter();
            }, 300);
        });

        // Celebration - click Retry button to retry current character
        elements.celebrationRetry.addEventListener('click', function(e) {
            e.stopPropagation();
            elements.celebration.classList.add('hidden');
            setTimeout(function() {
                animateCharacter();
            }, 300);
        });

        // Celebration - click Next button to advance
        elements.celebrationNext.addEventListener('click', function(e) {
            e.stopPropagation();
            elements.celebration.classList.add('hidden');
            nextCharacter();
            setTimeout(function() {
                animateCharacter();
            }, 300);
        });

        // Celebration - click elsewhere to dismiss and stay
        elements.celebration.addEventListener('click', function(e) {
            if (e.target === elements.celebration) {
                elements.celebration.classList.add('hidden');
            }
        });
    }

    // ========== VIEW MANAGEMENT ==========

    function showMainMenu(pushHistory) {
        state.currentView = 'menu';
        state.currentGroup = null;
        elements.mainMenu.classList.remove('hidden');
        elements.groupsView.classList.add('hidden');
        elements.dailyProgress.classList.add('hidden');
        updateStreakDisplay();

        if (pushHistory !== false) {
            history.pushState({ view: 'menu' }, '', window.location.pathname);
        }
    }

    function showCharactersView(pushHistory) {
        state.currentView = 'characters';
        state.currentChars = state.hskIndex[state.currentHSK] || [];
        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.add('hidden');
        elements.dailyProgress.classList.add('hidden');
        populateGrid();

        if (state.currentChars.length > 0) {
            selectCharacter(state.currentChars[0]);
            setTimeout(function() {
                animateCharacter();
            }, 300);
        }

        updateURL({ view: 'characters', hsk: state.currentHSK, char: state.currentChars[0] }, pushHistory);
    }

    function showGroupsView(pushHistory) {
        state.currentView = 'groups';
        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.remove('hidden');

        updateURL({ view: 'groups' }, pushHistory);
    }

    function showGroupCharacters(groupKey, pushHistory) {
        var group = state.groups[groupKey];
        if (!group) return;

        state.currentView = 'group';
        state.currentGroup = groupKey;
        state.currentChars = group.characters || [];

        elements.groupsView.classList.add('hidden');
        elements.dailyProgress.classList.add('hidden');
        populateGrid();

        if (state.currentChars.length > 0) {
            selectCharacter(state.currentChars[0]);
            setTimeout(function() {
                animateCharacter();
            }, 300);
        }

        updateURL({ view: 'group', group: groupKey, char: state.currentChars[0] }, pushHistory);
    }

    function startDailyMode(pushHistory) {
        state.currentView = 'daily';

        // Check if we need to generate new daily characters
        var today = new Date().toISOString().split('T')[0];

        if (state.daily.lastPracticeDate !== today || !state.daily.todaysCharacters || state.daily.todaysCharacters.length === 0) {
            generateDailyCharacters(today);
        }

        state.currentChars = state.daily.todaysCharacters;

        elements.mainMenu.classList.add('hidden');
        elements.dailyProgress.classList.remove('hidden');
        updateDailyProgress();
        populateGrid();

        // Find first incomplete character
        var firstIncomplete = null;
        for (var i = 0; i < state.daily.todaysCharacters.length; i++) {
            if (!state.daily.todaysProgress[i]) {
                firstIncomplete = state.daily.todaysCharacters[i];
                break;
            }
        }

        if (firstIncomplete) {
            selectCharacter(firstIncomplete);
            setTimeout(function() {
                animateCharacter();
            }, 300);
        } else if (state.currentChars.length > 0) {
            selectCharacter(state.currentChars[0]);
        }

        updateURL({ view: 'daily' }, pushHistory);
    }

    function generateDailyCharacters(today) {
        // Get all available characters
        var allChars = [];
        for (var level = 1; level <= 6; level++) {
            var chars = state.hskIndex[level] || [];
            allChars = allChars.concat(chars);
        }

        // Shuffle using date as seed (simple shuffle)
        var shuffled = allChars.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }

        // Take 15 characters
        var selected = shuffled.slice(0, 15);

        // Update streak
        var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (state.daily.lastPracticeDate === yesterday) {
            state.daily.currentStreak++;
        } else if (state.daily.lastPracticeDate !== today) {
            state.daily.currentStreak = 1;
        }

        if (state.daily.lastPracticeDate !== today) {
            state.daily.totalDays++;
        }

        state.daily.lastPracticeDate = today;
        state.daily.todaysCharacters = selected;
        state.daily.todaysProgress = selected.map(function() { return 0; });

        saveDaily();
        updateStreakDisplay();
    }

    function updateDailyProgress() {
        var completed = state.daily.todaysProgress.filter(function(p) { return p === 1; }).length;
        var total = state.daily.todaysCharacters.length;

        if (elements.dailyCount) {
            elements.dailyCount.textContent = completed;
        }
        if (elements.dailyProgressFill) {
            var percent = total > 0 ? (completed / total) * 100 : 0;
            elements.dailyProgressFill.style.width = percent + '%';
        }
    }

    function markDailyCharacterComplete(char) {
        var index = state.daily.todaysCharacters.indexOf(char);
        if (index !== -1) {
            state.daily.todaysProgress[index] = 1;
            saveDaily();
            updateDailyProgress();
        }
    }

    // ========== GROUPS ==========

    function populateGroupsView() {
        if (!elements.groupsGrid) return;

        var html = '';
        for (var key in state.groups) {
            if (state.groups.hasOwnProperty(key)) {
                var group = state.groups[key];
                html += '<div class="group-card" data-group="' + key + '">';
                html += '<span class="group-icon">' + (group.icon || '📁') + '</span>';
                html += '<span class="group-name">' + group.name + '</span>';
                html += '<span class="group-name-zh">' + (group.nameZh || '') + '</span>';
                html += '<span class="group-count">' + (group.characters ? group.characters.length : 0) + ' chars</span>';
                html += '</div>';
            }
        }

        elements.groupsGrid.innerHTML = html;

        // Bind click events
        var cards = elements.groupsGrid.querySelectorAll('.group-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var groupKey = this.getAttribute('data-group');
                showGroupCharacters(groupKey, true);
            });
        });
    }

    // ========== CHARACTER GRID ==========

    function populateGrid() {
        var chars = state.currentChars || [];
        var html = '';

        chars.forEach(function(char) {
            var isCompleted = state.completedChars.indexOf(char) !== -1;
            var isSelected = char === state.currentChar;
            var classes = 'char-cell';
            if (isCompleted) classes += ' completed';
            if (isSelected) classes += ' selected';

            html += '<div class="' + classes + '" data-char="' + char + '">' + char + '</div>';
        });

        elements.characterGrid.innerHTML = html;

        // Bind click events
        var cells = elements.characterGrid.querySelectorAll('.char-cell');
        cells.forEach(function(cell) {
            cell.addEventListener('click', function() {
                var char = this.getAttribute('data-char');
                selectCharacter(char);
                animateCharacter();
                // Update URL with new character
                updateURL({
                    char: char,
                    view: state.currentView,
                    group: state.currentGroup,
                    hsk: state.currentView === 'characters' ? state.currentHSK : null
                }, true);
            });
        });
    }

    function selectCharacter(char) {
        state.currentChar = char;
        state.isQuizMode = false;

        // Update grid selection
        var cells = elements.characterGrid.querySelectorAll('.char-cell');
        cells.forEach(function(cell) {
            cell.classList.remove('selected');
            if (cell.getAttribute('data-char') === char) {
                cell.classList.add('selected');
            }
        });

        // Get character data
        var data = state.characters[char];
        if (!data) {
            console.warn('Character data not found:', char);
            return;
        }

        // Update info panel
        updateInfoPanel(data);

        // Create/update Hanzi Writer
        createWriter(char);
    }

    function updateInfoPanel(data) {
        // Pinyin
        var pinyin = data.pinyin ? data.pinyin.join(', ') : '-';
        elements.pinyinDisplay.textContent = pinyin;

        // Jyutping (Cantonese)
        var jyutping = data.jyutping ? data.jyutping.join(', ') : 'N/A';
        elements.jyutpingDisplay.textContent = jyutping;

        // Definition
        elements.definitionDisplay.textContent = data.definition || '-';

        // Strokes
        elements.strokesDisplay.textContent = 'Strokes: ' + (data.strokeCount || '-');

        // HSK Level
        elements.hskDisplay.textContent = 'HSK ' + (data.hskLevel || '-');

        // Update dialect highlight
        updateDialectHighlight();
    }

    function createWriter(char) {
        // Clear previous writer
        elements.characterTarget.innerHTML = '';

        // Calculate size based on container
        var containerWidth = elements.characterTarget.offsetWidth;
        var size = Math.min(containerWidth - 20, 280);

        // Create new writer
        state.writer = HanziWriter.create(elements.characterTarget, char, {
            width: size,
            height: size,
            padding: 10,
            strokeColor: '#e74c3c',
            radicalColor: '#3498db',
            outlineColor: '#444',
            showOutline: state.settings.showOutline,
            strokeAnimationSpeed: state.settings.animationSpeed,
            delayBetweenStrokes: 200,
            drawingColor: '#f1c40f',
            drawingWidth: 12,
            showHintAfterMisses: state.settings.hintsAfterMistakes,
            highlightOnComplete: true,
            highlightColor: '#2ecc71',
            charDataLoader: function(char, onComplete) {
                return HanziWriter.loadCharacterData(char).then(onComplete);
            },
            onLoadCharNotFound: function() {
                elements.characterTarget.innerHTML = '<div style="color: #e74c3c; text-align: center; padding: 20px;">Character not found in database</div>';
            }
        });

        // Reset practice button state
        elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
    }

    // ========== PRACTICE & ANIMATION ==========

    function animateCharacter() {
        if (!state.writer || !state.currentChar) return;

        // Cancel any ongoing quiz
        if (state.isQuizMode) {
            state.writer.cancelQuiz();
            state.isQuizMode = false;
            elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
        }

        // Clear any old zombie timers just in case
        if (state.animationTimer) {
            clearTimeout(state.animationTimer);
            state.animationTimer = null;
        }

        state.isAnimating = true;
        clearStrokeNumberOverlays();

        // Get stroke count for number overlay
        var charData = state.characters[state.currentChar];
        var strokeCount = charData ? charData.strokeCount : 0;

        if (state.settings.showStrokeNumbers && strokeCount > 0) {
            // Animate stroke-by-stroke with numbers
            var currentStroke = 0;

            function animateNextStroke() {
                // SECURITY CHECK: Stop immediately if flag is off or writer is gone
                if (!state.isAnimating || !state.writer) { 
                    return; 
                }

                if (currentStroke >= strokeCount) {
                    state.isAnimating = false;
                    clearStrokeNumberOverlays();
                    if (state.settings.audioEnabled && state.currentChar) {
                        speakCharacter(state.currentChar);
                    }
                    return;
                }

                addStrokeNumberOverlay(currentStroke + 1, strokeCount);

                state.writer.animateStroke(currentStroke, {
                    onComplete: function() {
                        // CRITICAL: Check if we are still animating before scheduling next one
                        if (!state.isAnimating) return;

                        currentStroke++;
                        
                        // Save the timer ID so we can cancel it later
                        state.animationTimer = setTimeout(animateNextStroke, 400); 
                    }
                });
            }

            state.writer.hideCharacter();
            // Save initial delay timer
            state.animationTimer = setTimeout(animateNextStroke, 200);
        } else {
            // Simple animation without stroke numbers
            state.writer.animateCharacter({
                onComplete: function() {
                    state.isAnimating = false;
                    if (state.settings.audioEnabled && state.currentChar) {
                        speakCharacter(state.currentChar);
                    }
                }
            });
        }
    }

    function handleCharacterTouch() {
        if (state.isAnimating && state.writer) {
            // Stop animation and speak
            cancelAnimation(); // FIX: calling local function, not state.writer

            // Speak the character with definition
            speakWithDefinition();

            // Start practice immediately
            setTimeout(function() {
                startPractice();
            }, 100);
        }
    }

    function cancelAnimation() {
        // 1. Kill the loop timer immediately
        if (state.animationTimer) {
            clearTimeout(state.animationTimer);
            state.animationTimer = null;
        }
    
        // 2. Tell the writer to stop whatever single stroke it might be drawing right now
        if (state.writer) {
            // Try to cancel quiz/animation via library methods if they exist
            // (This catches the case where a single stroke is mid-draw)
            try {
                state.writer.cancelQuiz();
            } catch(e) { /* ignore */ }
        }
    
        state.isAnimating = false;
        state.isQuizMode = false;
        
        // Reset UI
        if (elements.practiceBtn) {
            elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
        }
        clearStrokeNumberOverlays();

        // Recreate the writer to ensure a clean slate
        createWriter(state.currentChar);
    }

    function speakWithDefinition() {
        if (!state.currentChar) return;

        // Speak the character
        speakCharacter(state.currentChar);

        // Show definition briefly
        var charData = state.characters[state.currentChar];
        if (charData && charData.definition) {
            // Could add a toast/popup here showing the definition
            console.log('Definition:', charData.definition);
        }
    }

    function addStrokeNumberOverlay(strokeNum, totalStrokes) {
        var container = elements.characterTarget;

        // Create or update the stroke number display
        var overlay = container.querySelector('.stroke-number-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'stroke-number-overlay';
            container.appendChild(overlay);
        }

        overlay.innerHTML = '<span class="stroke-current">' + strokeNum + '</span><span class="stroke-separator">/</span><span class="stroke-total">' + totalStrokes + '</span>';
        overlay.classList.add('visible');
    }

    function clearStrokeNumberOverlays() {
        var container = elements.characterTarget;
        var overlay = container.querySelector('.stroke-number-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    function startPractice() {
        if (!state.writer) return;

        if (state.isQuizMode) {
            // Cancel quiz mode
            state.writer.cancelQuiz();
            state.isQuizMode = false;
            elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
            clearStrokeNumberOverlays();
            createWriter(state.currentChar);
            return;
        }

        state.isQuizMode = true;
        elements.practiceBtn.innerHTML = '<span class="btn-icon">✖</span><span class="btn-text">Cancel</span>';

        // Show initial stroke number
        if (state.settings.showStrokeNumbers) {
            var charData = state.characters[state.currentChar];
            var totalStrokes = charData ? charData.strokeCount : 0;
            if (totalStrokes > 0) {
                addStrokeNumberOverlay(1, totalStrokes);
            }
        }

        state.writer.quiz({
            onMistake: function(strokeData) {
                showQuizFeedback('Try again', false);
            },
            onCorrectStroke: function(strokeData) {
                showQuizFeedback('Correct!', true);
                // Update stroke number overlay if enabled
                if (state.settings.showStrokeNumbers) {
                    var charData = state.characters[state.currentChar];
                    var totalStrokes = charData ? charData.strokeCount : 0;
                    var completedStrokes = strokeData.strokeNum + 1;
                    if (completedStrokes < totalStrokes) {
                        addStrokeNumberOverlay(completedStrokes + 1, totalStrokes);
                    } else {
                        clearStrokeNumberOverlays();
                    }
                }
            },
            onComplete: function(summaryData) {
                clearStrokeNumberOverlays();
                state.isQuizMode = false;
                elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';

                // Mark as completed
                if (state.completedChars.indexOf(state.currentChar) === -1) {
                    state.completedChars.push(state.currentChar);
                    saveProgress();
                    populateGrid();
                }

                // Mark daily progress if in daily mode
                if (state.currentView === 'daily') {
                    markDailyCharacterComplete(state.currentChar);
                }

                // Show celebration with next character preview
                showCelebration();

                // Speak the character
                if (state.settings.audioEnabled && state.currentChar) {
                    speakCharacter(state.currentChar);
                }
            }
        });
    }

    function showQuizFeedback(message, isCorrect) {
        var existing = elements.characterTarget.querySelector('.quiz-feedback');
        if (existing) existing.remove();

        var feedback = document.createElement('div');
        feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = message;
        elements.characterTarget.appendChild(feedback);

        setTimeout(function() {
            feedback.remove();
        }, 1000);
    }

    function showCelebration() {
        // Set previous character preview
        var prevChar = getPreviousCharacter();
        if (elements.prevCharPreview) {
            elements.prevCharPreview.textContent = prevChar || '';
        }

        // Set current character preview (for retry)
        if (elements.retryCharPreview) {
            elements.retryCharPreview.textContent = state.currentChar || '';
        }

        // Set next character preview
        var nextChar = getNextCharacter();
        if (elements.nextCharPreview) {
            elements.nextCharPreview.textContent = nextChar || '';
        }

        elements.celebration.classList.remove('hidden');
        // No auto-dismiss - user must click a button or tap to dismiss
    }

    function getPreviousCharacter() {
        var chars = state.currentChars || [];
        var currentIndex = chars.indexOf(state.currentChar);

        if (currentIndex === -1 || currentIndex <= 0) {
            return chars[chars.length - 1];
        }
        return chars[currentIndex - 1];
    }

    function getNextCharacter() {
        var chars = state.currentChars || [];
        var currentIndex = chars.indexOf(state.currentChar);

        if (currentIndex === -1 || currentIndex >= chars.length - 1) {
            return chars[0];
        }
        return chars[currentIndex + 1];
    }

    function prevCharacter() {
        var prevChar = getPreviousCharacter();
        if (prevChar) {
            selectCharacter(prevChar);
        }
    }

    function nextCharacter() {
        var nextChar = getNextCharacter();
        if (nextChar) {
            selectCharacter(nextChar);
        }
    }

    // ========== AUDIO ==========

    function speakCharacter(char, forcedDialect) {
        if (!('speechSynthesis' in window)) return;
        if (!state.settings.audioEnabled && !forcedDialect) return;

        var dialect = forcedDialect || state.settings.dialect;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        var utterance = new SpeechSynthesisUtterance(char);

        if (dialect === 'cantonese') {
            utterance.lang = 'zh-HK';
        } else {
            utterance.lang = 'zh-CN';
        }

        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    // ========== STROKE HELP ==========

    function populateStrokeHelp() {
        if (!state.strokeTypes || state.strokeTypes.length === 0) return;

        var html = '';
        state.strokeTypes.forEach(function(stroke, index) {
            html += '<div class="stroke-card" data-index="' + index + '">';
            html += '<span class="stroke-symbol">' + stroke.symbol + '</span>';
            html += '<span class="stroke-chinese">' + stroke.chinese + '</span>';
            html += '<span class="stroke-pinyin">' + stroke.pinyin + '</span>';
            html += '</div>';
        });

        elements.strokeGrid.innerHTML = html;

        var cards = elements.strokeGrid.querySelectorAll('.stroke-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                cards.forEach(function(c) { c.classList.remove('selected'); });
                this.classList.add('selected');

                var index = parseInt(this.getAttribute('data-index'), 10);
                showStrokeDetail(state.strokeTypes[index]);
            });
        });
    }

    function showStrokeDetail(stroke) {
        var html = '<div class="detail-content">';
        html += '<div class="detail-name">';
        html += '<span>' + stroke.chinese + '</span>';
        html += '<span>(' + stroke.pinyin + ')</span>';
        html += '</div>';
        html += '<p class="detail-desc">' + stroke.description + '</p>';
        html += '<p class="detail-example">Example: <span class="example-char">' + stroke.example + '</span></p>';
        html += '</div>';

        elements.strokeDetail.innerHTML = html;
    }

})();