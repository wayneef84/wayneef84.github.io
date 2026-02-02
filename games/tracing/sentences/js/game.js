/**
 * Sentence Builder Game
 * Build sentences from words - supports English and Chinese
 * URL: ?group=english-greetings or ?group=chinese-food or ?group=custom
 */

(function() {
    'use strict';

    var state = {
        data: null,
        currentLanguage: null,     // 'english' or 'chinese'
        currentGroup: null,        // group key like 'greetings'
        currentSentenceIndex: 0,
        currentSentence: [],       // words user has added
        targetSentence: null,      // sentence to build
        savedSentences: [],
        completedCount: {},        // Track completion counts: { 'english-greetings-0': 3 }
        settings: {
            audioEnabled: true,
            showHints: true
        }
    };

    var elements = {};

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheElements();
        loadSettings();
        loadData();
        bindEvents();
        handleInitialRoute();
        window.addEventListener('popstate', handlePopState);
    }

    // ========== URL NAVIGATION ==========
    // Simple: ?group=english-greetings or ?group=chinese-food or ?group=custom

    function handleInitialRoute() {
        var params = new URLSearchParams(window.location.search);
        var group = params.get('group');

        var checkData = setInterval(function() {
            if (state.data) {
                clearInterval(checkData);

                if (group) {
                    if (group === 'custom') {
                        showCustomMode(false);
                    } else if (group === 'saved') {
                        showSavedView(false);
                    } else if (group.indexOf('-') !== -1) {
                        // Parse: language-groupname
                        var parts = group.split('-');
                        var lang = parts[0];
                        var groupKey = parts.slice(1).join('-');
                        if (state.data.languages[lang] && state.data.languages[lang].groups[groupKey]) {
                            showPracticeMode(lang, groupKey, false);
                        }
                    }
                }
            }
        }, 100);
    }

    function handlePopState(e) {
        if (e.state) {
            if (e.state.view === 'menu') {
                showMainMenu(false);
            } else if (e.state.view === 'groups' && e.state.language) {
                showLanguageGroups(e.state.language, false);
            } else if (e.state.group) {
                if (e.state.group === 'custom') {
                    showCustomMode(false);
                } else if (e.state.group === 'saved') {
                    showSavedView(false);
                } else {
                    var parts = e.state.group.split('-');
                    showPracticeMode(parts[0], parts.slice(1).join('-'), false);
                }
            }
        } else {
            showMainMenu(false);
        }
    }

    function updateURL(group, pushHistory) {
        var url = new URL(window.location.href);
        url.search = '';
        if (group) {
            url.searchParams.set('group', group);
        }

        var historyState = {
            view: state.currentLanguage ? 'practice' : 'menu',
            group: group,
            language: state.currentLanguage
        };

        if (pushHistory !== false) {
            history.pushState(historyState, '', url.toString());
        } else {
            history.replaceState(historyState, '', url.toString());
        }
    }

    function cacheElements() {
        elements.mainMenu = document.getElementById('main-menu');
        elements.menuEnglish = document.getElementById('menu-english');
        elements.menuChinese = document.getElementById('menu-chinese');
        elements.menuCustom = document.getElementById('menu-custom');
        elements.menuSaved = document.getElementById('menu-saved');
        elements.menuSettings = document.getElementById('menu-settings');

        elements.groupsView = document.getElementById('groups-view');
        elements.groupsGrid = document.getElementById('groups-grid');
        elements.groupsBack = document.getElementById('groups-back');
        elements.groupsTitle = document.getElementById('groups-title');

        elements.savedView = document.getElementById('saved-view');
        elements.savedList = document.getElementById('saved-list');
        elements.savedBack = document.getElementById('saved-back');

        elements.gameContainer = document.getElementById('game-container');
        elements.menuBtn = document.getElementById('menu-btn');
        elements.headerTitle = document.getElementById('header-title');
        elements.speakBtn = document.getElementById('speak-btn');

        elements.targetArea = document.getElementById('target-area');
        elements.targetDisplay = document.getElementById('target-display');
        elements.targetHint = document.getElementById('target-hint');
        elements.buildLabel = document.getElementById('build-label');
        elements.sentenceDisplay = document.getElementById('sentence-display');

        elements.clearBtn = document.getElementById('clear-btn');
        elements.speakSentenceBtn = document.getElementById('speak-sentence-btn');
        elements.checkBtn = document.getElementById('check-btn');
        elements.wordBankLabel = document.getElementById('word-bank-label');
        elements.wordGrid = document.getElementById('word-grid');

        elements.celebration = document.getElementById('celebration');
        elements.celebrationSentence = document.getElementById('celebration-sentence');
        elements.celebrationHint = document.getElementById('celebration-hint');
        elements.celebrationRetry = document.getElementById('celebration-retry');
        elements.celebrationNext = document.getElementById('celebration-next');

        elements.settingsModal = document.getElementById('settings-modal');
        elements.closeSettings = document.getElementById('close-settings');
        elements.audioEnabled = document.getElementById('audio-enabled');
        elements.showHints = document.getElementById('show-hints');
        elements.resetProgress = document.getElementById('reset-progress');
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('sentences-settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                for (var key in parsed) {
                    state.settings[key] = parsed[key];
                }
            }
            var savedSentences = localStorage.getItem('sentences-saved');
            if (savedSentences) {
                state.savedSentences = JSON.parse(savedSentences);
            }
            var completed = localStorage.getItem('sentences-completed');
            if (completed) {
                state.completedCount = JSON.parse(completed);
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        applySettings();
    }

    function saveSettings() {
        try {
            localStorage.setItem('sentences-settings', JSON.stringify(state.settings));
        } catch (e) {}
    }

    function saveSavedSentences() {
        try {
            localStorage.setItem('sentences-saved', JSON.stringify(state.savedSentences));
        } catch (e) {}
    }

    function saveCompleted() {
        try {
            localStorage.setItem('sentences-completed', JSON.stringify(state.completedCount));
        } catch (e) {}
    }

    function applySettings() {
        if (elements.audioEnabled) elements.audioEnabled.checked = state.settings.audioEnabled;
        if (elements.showHints) elements.showHints.checked = state.settings.showHints;
    }

    function loadData() {
        fetch('data/sentences.json')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                state.data = data;
            })
            .catch(function(err) {
                console.error('Failed to load data:', err);
            });
    }

    function bindEvents() {
        elements.menuEnglish.addEventListener('click', function() {
            showLanguageGroups('english', true);
        });
        elements.menuChinese.addEventListener('click', function() {
            showLanguageGroups('chinese', true);
        });
        elements.menuCustom.addEventListener('click', function() {
            showCustomMode(true);
        });
        elements.menuSaved.addEventListener('click', function() {
            showSavedView(true);
        });
        elements.menuSettings.addEventListener('click', function() {
            elements.settingsModal.classList.remove('hidden');
        });

        elements.groupsBack.addEventListener('click', function() { history.back(); });
        elements.savedBack.addEventListener('click', function() { history.back(); });
        elements.menuBtn.addEventListener('click', function() { history.back(); });

        elements.clearBtn.addEventListener('click', clearSentence);
        elements.speakSentenceBtn.addEventListener('click', speakCurrentSentence);
        elements.checkBtn.addEventListener('click', checkSentence);
        elements.speakBtn.addEventListener('click', function() {
            if (state.targetSentence) {
                speakText(state.targetSentence.display, state.currentLanguage);
            }
        });

        elements.celebrationRetry.addEventListener('click', function() {
            elements.celebration.classList.add('hidden');
            clearSentence();
        });
        elements.celebrationNext.addEventListener('click', function() {
            elements.celebration.classList.add('hidden');
            nextSentence();
        });
        elements.celebration.addEventListener('click', function(e) {
            if (e.target === elements.celebration) {
                elements.celebration.classList.add('hidden');
            }
        });

        elements.closeSettings.addEventListener('click', function() {
            elements.settingsModal.classList.add('hidden');
        });
        elements.settingsModal.addEventListener('click', function(e) {
            if (e.target === elements.settingsModal) {
                elements.settingsModal.classList.add('hidden');
            }
        });
        elements.audioEnabled.addEventListener('change', function() {
            state.settings.audioEnabled = this.checked;
            saveSettings();
        });
        elements.showHints.addEventListener('change', function() {
            state.settings.showHints = this.checked;
            saveSettings();
            updateTargetDisplay();
        });
        elements.resetProgress.addEventListener('click', function() {
            if (confirm('Reset all progress and saved sentences?')) {
                localStorage.removeItem('sentences-settings');
                localStorage.removeItem('sentences-saved');
                localStorage.removeItem('sentences-completed');
                state.savedSentences = [];
                state.completedCount = {};
                state.settings = { audioEnabled: true, showHints: true };
                applySettings();
                elements.settingsModal.classList.add('hidden');
                alert('Progress reset!');
            }
        });
    }

    // ========== VIEWS ==========

    function hideAllViews() {
        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.add('hidden');
        elements.savedView.classList.add('hidden');
        elements.gameContainer.style.display = 'none';
    }

    function showMainMenu(pushHistory) {
        state.currentLanguage = null;
        state.currentGroup = null;
        hideAllViews();
        elements.mainMenu.classList.remove('hidden');

        if (pushHistory !== false) {
            history.pushState({ view: 'menu' }, '', window.location.pathname);
        }
    }

    function showLanguageGroups(lang, pushHistory) {
        var langData = state.data.languages[lang];
        if (!langData) return;

        state.currentLanguage = lang;
        hideAllViews();
        elements.groupsView.classList.remove('hidden');
        elements.groupsTitle.textContent = langData.name + ' ' + langData.icon;

        var html = '';
        for (var key in langData.groups) {
            var group = langData.groups[key];
            var sentenceCount = group.sentences ? group.sentences.length : 0;
            html += '<div class="group-card" data-group="' + key + '">';
            html += '<span class="group-icon">' + group.icon + '</span>';
            html += '<span class="group-name">' + group.name + '</span>';
            html += '<span class="group-count">' + sentenceCount + ' sentences</span>';
            html += '</div>';
        }
        elements.groupsGrid.innerHTML = html;

        var cards = elements.groupsGrid.querySelectorAll('.group-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var groupKey = this.getAttribute('data-group');
                showPracticeMode(lang, groupKey, true);
            });
        });

        if (pushHistory !== false) {
            history.pushState({ view: 'groups', language: lang }, '', window.location.pathname);
        }
    }

    function showPracticeMode(lang, groupKey, pushHistory) {
        var langData = state.data.languages[lang];
        if (!langData || !langData.groups[groupKey]) return;

        var group = langData.groups[groupKey];
        state.currentLanguage = lang;
        state.currentGroup = groupKey;
        state.currentSentenceIndex = 0;
        state.targetSentence = group.sentences[0];
        state.currentSentence = [];

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = group.name;

        populateWordBank(group.words);
        updateTargetDisplay();
        updateSentenceDisplay();

        updateURL(lang + '-' + groupKey, pushHistory);
    }

    function showCustomMode(pushHistory) {
        state.currentLanguage = 'english';
        state.currentGroup = 'custom';
        state.targetSentence = null;
        state.currentSentence = [];

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = 'Custom Sentence';
        elements.targetArea.style.display = 'none';

        // Show common words
        var commonWords = ['I', 'you', 'he', 'she', 'we', 'they', 'is', 'am', 'are', 'the', 'a',
            'like', 'love', 'want', 'have', 'go', 'come', 'eat', 'drink', 'see', 'do',
            'good', 'big', 'small', 'happy', 'my', 'your', 'to', 'and', 'but'];
        populateWordBank(commonWords);
        updateSentenceDisplay();

        updateURL('custom', pushHistory);
    }

    function showSavedView(pushHistory) {
        hideAllViews();
        elements.savedView.classList.remove('hidden');

        if (state.savedSentences.length === 0) {
            elements.savedList.innerHTML = '<div class="empty-state"><span class="empty-state-icon">📝</span><p>No saved sentences yet.</p></div>';
        } else {
            var html = '';
            state.savedSentences.forEach(function(sentence, idx) {
                html += '<div class="custom-sentence-card" data-index="' + idx + '">';
                html += '<span class="custom-sentence-text">' + sentence + '</span>';
                html += '<button class="custom-sentence-delete" data-index="' + idx + '">×</button>';
                html += '</div>';
            });
            elements.savedList.innerHTML = html;

            elements.savedList.querySelectorAll('.custom-sentence-delete').forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    state.savedSentences.splice(idx, 1);
                    saveSavedSentences();
                    showSavedView(false);
                });
            });

            elements.savedList.querySelectorAll('.custom-sentence-card').forEach(function(card) {
                card.addEventListener('click', function() {
                    var text = this.querySelector('.custom-sentence-text').textContent;
                    speakText(text, 'english');
                });
            });
        }

        updateURL('saved', pushHistory);
    }

    // ========== GAME LOGIC ==========

    function populateWordBank(words) {
        var html = '';
        words.forEach(function(word) {
            html += '<div class="word-chip" data-word="' + word + '">' + word + '</div>';
        });
        elements.wordGrid.innerHTML = html;

        elements.wordGrid.querySelectorAll('.word-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                var word = this.getAttribute('data-word');
                addWord(word);
            });
        });

        updateWordBankUsage();
    }

    function addWord(word) {
        state.currentSentence.push(word);
        updateSentenceDisplay();
        updateWordBankUsage();

        if (state.settings.audioEnabled) {
            speakText(word, state.currentLanguage);
        }
    }

    function removeWord(index) {
        state.currentSentence.splice(index, 1);
        updateSentenceDisplay();
        updateWordBankUsage();
    }

    function clearSentence() {
        state.currentSentence = [];
        updateSentenceDisplay();
        updateWordBankUsage();
    }

    function updateSentenceDisplay() {
        if (state.currentSentence.length === 0) {
            elements.sentenceDisplay.innerHTML = '<span class="empty-hint">Tap words below to build</span>';
            return;
        }

        var html = '';
        state.currentSentence.forEach(function(word, idx) {
            html += '<span class="sentence-word" data-index="' + idx + '">' + word + '</span>';
        });
        elements.sentenceDisplay.innerHTML = html;

        elements.sentenceDisplay.querySelectorAll('.sentence-word').forEach(function(el) {
            el.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                this.classList.add('removing');
                setTimeout(function() {
                    removeWord(idx);
                }, 200);
            });
        });
    }

    function updateWordBankUsage() {
        elements.wordGrid.querySelectorAll('.word-chip').forEach(function(chip) {
            var word = chip.getAttribute('data-word');
            // Count how many times this word appears in sentence vs target
            var usedCount = state.currentSentence.filter(function(w) { return w === word; }).length;
            var targetCount = state.targetSentence ? state.targetSentence.words.filter(function(w) { return w === word; }).length : 999;

            if (usedCount >= targetCount && targetCount > 0) {
                chip.classList.add('used');
            } else {
                chip.classList.remove('used');
            }
        });
    }

    function updateTargetDisplay() {
        if (!state.targetSentence) {
            elements.targetArea.style.display = 'none';
            return;
        }

        elements.targetArea.style.display = 'block';
        elements.targetDisplay.textContent = state.targetSentence.display;

        if (state.settings.showHints) {
            var hint = '';
            if (state.currentLanguage === 'chinese' && state.targetSentence.english) {
                hint = state.targetSentence.english;
            } else if (state.currentLanguage === 'chinese' && state.targetSentence.pinyin) {
                hint = state.targetSentence.pinyin;
            }
            elements.targetHint.textContent = hint;
        } else {
            elements.targetHint.textContent = '';
        }
    }

    function checkSentence() {
        if (!state.targetSentence) {
            // Custom mode - just save
            if (state.currentSentence.length > 0) {
                var sentence = state.currentSentence.join(' ');
                if (state.savedSentences.indexOf(sentence) === -1) {
                    state.savedSentences.push(sentence);
                    saveSavedSentences();
                    alert('Saved: ' + sentence);
                }
            }
            return;
        }

        // Check if matches target
        var userWords = state.currentSentence.join('|');
        var targetWords = state.targetSentence.words.join('|');

        if (userWords === targetWords) {
            // Correct!
            var sentenceId = state.currentLanguage + '-' + state.currentGroup + '-' + state.currentSentenceIndex;
            state.completedCount[sentenceId] = (state.completedCount[sentenceId] || 0) + 1;
            saveCompleted();

            elements.celebrationSentence.textContent = state.targetSentence.display;
            if (state.currentLanguage === 'chinese' && state.targetSentence.pinyin) {
                elements.celebrationHint.textContent = state.targetSentence.pinyin;
            } else {
                elements.celebrationHint.textContent = '';
            }
            elements.celebration.classList.remove('hidden');

            if (state.settings.audioEnabled) {
                speakText(state.targetSentence.display, state.currentLanguage);
            }
        } else {
            alert('Not quite right. Try again!');
        }
    }

    function nextSentence() {
        var langData = state.data.languages[state.currentLanguage];
        var group = langData.groups[state.currentGroup];

        state.currentSentenceIndex++;
        if (state.currentSentenceIndex >= group.sentences.length) {
            state.currentSentenceIndex = 0;
        }

        state.targetSentence = group.sentences[state.currentSentenceIndex];
        state.currentSentence = [];
        updateTargetDisplay();
        updateSentenceDisplay();
        updateWordBankUsage();
    }

    function speakCurrentSentence() {
        if (state.currentSentence.length === 0) return;
        var text = state.currentLanguage === 'chinese'
            ? state.currentSentence.join('')
            : state.currentSentence.join(' ');
        speakText(text, state.currentLanguage);
    }

    function speakText(text, lang) {
        if (!('speechSynthesis' in window)) return;
        if (!state.settings.audioEnabled) return;
        if (!text) return;

        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'chinese' ? 'zh-CN' : 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }

})();
