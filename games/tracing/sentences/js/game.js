/**
 * Chinese Sentence Builder Game
 * Build sentences from word banks, practice predefined sentences, create custom sentences
 */

(function() {
    'use strict';

    // Game State
    var state = {
        words: {},
        groups: {},
        currentSentence: [],      // Words user has added
        targetSentence: null,     // Target sentence when practicing
        currentGroup: null,
        currentSentenceIndex: 0,
        currentView: 'menu',      // 'menu', 'groups', 'sentences', 'practice', 'custom', 'saved'
        savedSentences: [],
        completedSentences: [],
        settings: {
            audioEnabled: true,
            showPinyin: true,
            showEnglish: true
        }
    };

    // DOM Elements
    var elements = {};

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        cacheElements();
        loadSettings();
        loadData();
        bindEvents();
        handleInitialRoute();
        window.addEventListener('popstate', handlePopState);
    }

    // ========== URL & HISTORY MANAGEMENT ==========

    function handleInitialRoute() {
        var params = new URLSearchParams(window.location.search);
        var group = params.get('group');
        var sentence = params.get('sentence');
        var view = params.get('view');

        // Wait for data to load
        var checkData = setInterval(function() {
            if (Object.keys(state.words).length > 0) {
                clearInterval(checkData);

                if (view === 'custom') {
                    showCustomMode(false);
                } else if (view === 'saved') {
                    showSavedView(false);
                } else if (group && state.groups[group]) {
                    if (sentence !== null) {
                        var idx = parseInt(sentence, 10);
                        showPracticeMode(group, idx, false);
                    } else {
                        showSentenceList(group, false);
                    }
                } else if (view === 'groups') {
                    showGroupsView(false);
                } else if (view === 'practice') {
                    showRandomPractice(false);
                }
                // else stay on menu
            }
        }, 100);
    }

    function handlePopState(e) {
        if (e.state) {
            if (e.state.view === 'menu') {
                showMainMenu(false);
            } else if (e.state.view === 'groups') {
                showGroupsView(false);
            } else if (e.state.view === 'sentences' && e.state.group) {
                showSentenceList(e.state.group, false);
            } else if (e.state.view === 'practice' && e.state.group) {
                showPracticeMode(e.state.group, e.state.sentence || 0, false);
            } else if (e.state.view === 'custom') {
                showCustomMode(false);
            } else if (e.state.view === 'saved') {
                showSavedView(false);
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
            group: state.currentGroup,
            sentence: state.currentSentenceIndex
        };

        if (pushHistory !== false) {
            history.pushState(historyState, '', url.toString());
        } else {
            history.replaceState(historyState, '', url.toString());
        }
    }

    function cacheElements() {
        // Main menu
        elements.mainMenu = document.getElementById('main-menu');
        elements.menuPractice = document.getElementById('menu-practice');
        elements.menuGroups = document.getElementById('menu-groups');
        elements.menuCustom = document.getElementById('menu-custom');
        elements.menuSaved = document.getElementById('menu-saved');
        elements.menuSettings = document.getElementById('menu-settings');

        // Groups view
        elements.groupsView = document.getElementById('groups-view');
        elements.groupsGrid = document.getElementById('groups-grid');
        elements.groupsBack = document.getElementById('groups-back');

        // Sentence list view
        elements.sentenceListView = document.getElementById('sentence-list-view');
        elements.sentenceList = document.getElementById('sentence-list');
        elements.sentenceListBack = document.getElementById('sentence-list-back');
        elements.sentenceListTitle = document.getElementById('sentence-list-title');

        // Saved view
        elements.savedView = document.getElementById('saved-view');
        elements.savedList = document.getElementById('saved-list');
        elements.savedBack = document.getElementById('saved-back');

        // Game container
        elements.gameContainer = document.getElementById('game-container');
        elements.menuBtn = document.getElementById('menu-btn');
        elements.headerTitle = document.getElementById('header-title');
        elements.speakBtn = document.getElementById('speak-btn');
        elements.settingsBtn = document.getElementById('settings-btn');

        // Sentence area
        elements.sentenceDisplay = document.getElementById('sentence-display');
        elements.sentencePinyin = document.getElementById('sentence-pinyin');
        elements.sentenceEnglish = document.getElementById('sentence-english');

        // Action buttons
        elements.clearBtn = document.getElementById('clear-btn');
        elements.speakSentenceBtn = document.getElementById('speak-sentence-btn');
        elements.saveBtn = document.getElementById('save-btn');
        elements.checkBtn = document.getElementById('check-btn');

        // Word bank
        elements.wordBankLabel = document.getElementById('word-bank-label');
        elements.wordGrid = document.getElementById('word-grid');

        // Celebration
        elements.celebration = document.getElementById('celebration');
        elements.celebrationSentence = document.getElementById('celebration-sentence');
        elements.celebrationPinyin = document.getElementById('celebration-pinyin');
        elements.celebrationRetry = document.getElementById('celebration-retry');
        elements.celebrationNext = document.getElementById('celebration-next');

        // Settings modal
        elements.settingsModal = document.getElementById('settings-modal');
        elements.closeSettings = document.getElementById('close-settings');
        elements.audioEnabled = document.getElementById('audio-enabled');
        elements.showPinyin = document.getElementById('show-pinyin');
        elements.showEnglish = document.getElementById('show-english');
        elements.resetProgress = document.getElementById('reset-progress');
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('sentences-settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                for (var key in parsed) {
                    if (parsed.hasOwnProperty(key)) {
                        state.settings[key] = parsed[key];
                    }
                }
            }
            var savedSentences = localStorage.getItem('sentences-saved');
            if (savedSentences) {
                state.savedSentences = JSON.parse(savedSentences);
            }
            var completed = localStorage.getItem('sentences-completed');
            if (completed) {
                state.completedSentences = JSON.parse(completed);
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        applySettings();
    }

    function saveSettings() {
        try {
            localStorage.setItem('sentences-settings', JSON.stringify(state.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    function saveSavedSentences() {
        try {
            localStorage.setItem('sentences-saved', JSON.stringify(state.savedSentences));
        } catch (e) {
            console.warn('Could not save sentences:', e);
        }
    }

    function saveCompleted() {
        try {
            localStorage.setItem('sentences-completed', JSON.stringify(state.completedSentences));
        } catch (e) {
            console.warn('Could not save completed:', e);
        }
    }

    function applySettings() {
        if (elements.audioEnabled) {
            elements.audioEnabled.checked = state.settings.audioEnabled;
        }
        if (elements.showPinyin) {
            elements.showPinyin.checked = state.settings.showPinyin;
        }
        if (elements.showEnglish) {
            elements.showEnglish.checked = state.settings.showEnglish;
        }
    }

    function loadData() {
        fetch('data/sentences.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                state.words = data.words;
                state.groups = data.groups;
                populateGroupsView();
            })
            .catch(function(err) {
                console.error('Failed to load sentence data:', err);
            });
    }

    function bindEvents() {
        // Menu items
        elements.menuPractice.addEventListener('click', function() {
            showRandomPractice(true);
        });
        elements.menuGroups.addEventListener('click', function() {
            showGroupsView(true);
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

        // Back buttons
        elements.groupsBack.addEventListener('click', function() {
            history.back();
        });
        elements.sentenceListBack.addEventListener('click', function() {
            history.back();
        });
        elements.savedBack.addEventListener('click', function() {
            history.back();
        });
        elements.menuBtn.addEventListener('click', function() {
            history.back();
        });

        // Action buttons
        elements.clearBtn.addEventListener('click', clearSentence);
        elements.speakSentenceBtn.addEventListener('click', speakCurrentSentence);
        elements.saveBtn.addEventListener('click', saveCurrentSentence);
        elements.checkBtn.addEventListener('click', checkSentence);

        // Celebration
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

        // Settings
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
        elements.showPinyin.addEventListener('change', function() {
            state.settings.showPinyin = this.checked;
            saveSettings();
            updateSentenceDisplay();
        });
        elements.showEnglish.addEventListener('change', function() {
            state.settings.showEnglish = this.checked;
            saveSettings();
            updateSentenceDisplay();
        });
        elements.resetProgress.addEventListener('click', function() {
            if (confirm('Reset all progress and saved sentences?')) {
                localStorage.removeItem('sentences-settings');
                localStorage.removeItem('sentences-saved');
                localStorage.removeItem('sentences-completed');
                state.savedSentences = [];
                state.completedSentences = [];
                state.settings = { audioEnabled: true, showPinyin: true, showEnglish: true };
                applySettings();
                elements.settingsModal.classList.add('hidden');
                alert('Progress reset!');
            }
        });
    }

    // ========== VIEW MANAGEMENT ==========

    function hideAllViews() {
        elements.mainMenu.classList.add('hidden');
        elements.groupsView.classList.add('hidden');
        elements.sentenceListView.classList.add('hidden');
        elements.savedView.classList.add('hidden');
        elements.gameContainer.style.display = 'none';
    }

    function showMainMenu(pushHistory) {
        state.currentView = 'menu';
        hideAllViews();
        elements.mainMenu.classList.remove('hidden');

        if (pushHistory !== false) {
            history.pushState({ view: 'menu' }, '', window.location.pathname);
        }
    }

    function showGroupsView(pushHistory) {
        state.currentView = 'groups';
        hideAllViews();
        elements.groupsView.classList.remove('hidden');

        updateURL({ view: 'groups' }, pushHistory);
    }

    function showSentenceList(groupKey, pushHistory) {
        var group = state.groups[groupKey];
        if (!group) return;

        state.currentView = 'sentences';
        state.currentGroup = groupKey;
        hideAllViews();
        elements.sentenceListView.classList.remove('hidden');
        elements.sentenceListTitle.textContent = group.name + ' ' + group.nameZh;

        var html = '';
        group.sentences.forEach(function(sentence, idx) {
            var sentenceId = groupKey + '-' + idx;
            var isCompleted = state.completedSentences.indexOf(sentenceId) !== -1;
            html += '<div class="sentence-card' + (isCompleted ? ' completed' : '') + '" data-index="' + idx + '">';
            html += '<div class="sentence-card-chinese">' + sentence.chinese.join('') + '</div>';
            html += '<div class="sentence-card-pinyin">' + sentence.pinyin + '</div>';
            html += '<div class="sentence-card-english">' + sentence.english + '</div>';
            html += '</div>';
        });
        elements.sentenceList.innerHTML = html;

        // Bind click events
        var cards = elements.sentenceList.querySelectorAll('.sentence-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                showPracticeMode(groupKey, idx, true);
            });
        });

        updateURL({ group: groupKey, view: 'sentences' }, pushHistory);
    }

    function showPracticeMode(groupKey, sentenceIndex, pushHistory) {
        var group = state.groups[groupKey];
        if (!group || !group.sentences[sentenceIndex]) return;

        state.currentView = 'practice';
        state.currentGroup = groupKey;
        state.currentSentenceIndex = sentenceIndex;
        state.targetSentence = group.sentences[sentenceIndex];
        state.currentSentence = [];

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = group.name;
        elements.saveBtn.style.display = 'none';
        elements.checkBtn.style.display = 'block';

        // Show target English (as hint)
        if (state.settings.showEnglish) {
            elements.sentenceEnglish.textContent = 'Build: "' + state.targetSentence.english + '"';
        }

        populateWordBank(state.targetSentence.chinese);
        updateSentenceDisplay();

        updateURL({ group: groupKey, sentence: sentenceIndex, view: 'practice' }, pushHistory);
    }

    function showRandomPractice(pushHistory) {
        // Pick a random group and sentence
        var groupKeys = Object.keys(state.groups);
        if (groupKeys.length === 0) return;

        var randomGroup = groupKeys[Math.floor(Math.random() * groupKeys.length)];
        var group = state.groups[randomGroup];
        var randomIndex = Math.floor(Math.random() * group.sentences.length);

        showPracticeMode(randomGroup, randomIndex, pushHistory);
    }

    function showCustomMode(pushHistory) {
        state.currentView = 'custom';
        state.targetSentence = null;
        state.currentSentence = [];

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = 'Custom Sentence';
        elements.saveBtn.style.display = 'block';
        elements.checkBtn.style.display = 'none';
        elements.sentenceEnglish.textContent = '';

        // Show all common words
        populateFullWordBank();
        updateSentenceDisplay();

        updateURL({ view: 'custom' }, pushHistory);
    }

    function showSavedView(pushHistory) {
        state.currentView = 'saved';
        hideAllViews();
        elements.savedView.classList.remove('hidden');

        if (state.savedSentences.length === 0) {
            elements.savedList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>No saved sentences yet.</p><p>Create custom sentences and save them!</p></div>';
        } else {
            var html = '';
            state.savedSentences.forEach(function(sentence, idx) {
                html += '<div class="custom-sentence-card">';
                html += '<span class="custom-sentence-text">' + sentence + '</span>';
                html += '<button class="custom-sentence-delete" data-index="' + idx + '">×</button>';
                html += '</div>';
            });
            elements.savedList.innerHTML = html;

            // Bind delete buttons
            var deleteButtons = elements.savedList.querySelectorAll('.custom-sentence-delete');
            deleteButtons.forEach(function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    deleteSavedSentence(idx);
                });
            });

            // Bind click to speak
            var cards = elements.savedList.querySelectorAll('.custom-sentence-card');
            cards.forEach(function(card) {
                card.addEventListener('click', function() {
                    var text = this.querySelector('.custom-sentence-text').textContent;
                    speakText(text);
                });
            });
        }

        updateURL({ view: 'saved' }, pushHistory);
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
                html += '<span class="group-count">' + group.sentences.length + ' sentences</span>';
                html += '</div>';
            }
        }
        elements.groupsGrid.innerHTML = html;

        var cards = elements.groupsGrid.querySelectorAll('.group-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                var groupKey = this.getAttribute('data-group');
                showSentenceList(groupKey, true);
            });
        });
    }

    // ========== WORD BANK ==========

    function populateWordBank(targetWords) {
        // Include target words plus some distractors
        var wordSet = {};
        targetWords.forEach(function(w) { wordSet[w] = true; });

        // Add some random distractors
        var allWords = Object.keys(state.words);
        var distractorCount = Math.min(5, allWords.length);
        for (var i = 0; i < distractorCount; i++) {
            var randomWord = allWords[Math.floor(Math.random() * allWords.length)];
            if (!wordSet[randomWord]) {
                wordSet[randomWord] = true;
            }
        }

        var wordList = Object.keys(wordSet);
        // Shuffle
        for (var j = wordList.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var temp = wordList[j];
            wordList[j] = wordList[k];
            wordList[k] = temp;
        }

        renderWordBank(wordList);
    }

    function populateFullWordBank() {
        // Show common words for custom mode
        var commonWords = ['我', '你', '他', '她', '们', '是', '不', '很', '好', '吗', '的', '了',
                           '在', '有', '没', '这', '那', '什么', '吃', '喝', '去', '来', '看', '听',
                           '说', '学习', '工作', '爱', '喜欢', '想', '要', '能', '会', '可以',
                           '今天', '明天', '昨天', '。', '？', '！'];
        renderWordBank(commonWords);
    }

    function renderWordBank(wordList) {
        var html = '';
        wordList.forEach(function(word) {
            var isUsed = state.currentSentence.indexOf(word) !== -1;
            html += '<div class="word-chip' + (isUsed ? ' used' : '') + '" data-word="' + word + '">' + word + '</div>';
        });
        elements.wordGrid.innerHTML = html;

        var chips = elements.wordGrid.querySelectorAll('.word-chip');
        chips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                var word = this.getAttribute('data-word');
                addWordToSentence(word);
            });
        });
    }

    // ========== SENTENCE BUILDING ==========

    function addWordToSentence(word) {
        state.currentSentence.push(word);
        updateSentenceDisplay();
        updateWordBankUsage();

        if (state.settings.audioEnabled) {
            speakText(word);
        }
    }

    function removeWordFromSentence(index) {
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
            elements.sentenceDisplay.innerHTML = '<span class="empty-hint">Tap words below to build a sentence</span>';
            elements.sentencePinyin.textContent = '';
            if (state.targetSentence && state.settings.showEnglish) {
                elements.sentenceEnglish.textContent = 'Build: "' + state.targetSentence.english + '"';
            } else if (!state.targetSentence) {
                elements.sentenceEnglish.textContent = '';
            }
            return;
        }

        var html = '';
        state.currentSentence.forEach(function(word, idx) {
            html += '<span class="sentence-word" data-index="' + idx + '">' + word + '</span>';
        });
        elements.sentenceDisplay.innerHTML = html;

        // Bind click to remove
        var words = elements.sentenceDisplay.querySelectorAll('.sentence-word');
        words.forEach(function(wordEl) {
            wordEl.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                this.classList.add('removing');
                setTimeout(function() {
                    removeWordFromSentence(idx);
                }, 200);
            });
        });

        // Update pinyin
        if (state.settings.showPinyin) {
            var pinyinParts = [];
            state.currentSentence.forEach(function(word) {
                var wordData = state.words[word];
                if (wordData && wordData.pinyin && wordData.pinyin.length > 0) {
                    pinyinParts.push(wordData.pinyin[0]);
                }
            });
            elements.sentencePinyin.textContent = pinyinParts.join(' ');
        } else {
            elements.sentencePinyin.textContent = '';
        }
    }

    function updateWordBankUsage() {
        var chips = elements.wordGrid.querySelectorAll('.word-chip');
        chips.forEach(function(chip) {
            var word = chip.getAttribute('data-word');
            if (state.currentSentence.indexOf(word) !== -1) {
                chip.classList.add('used');
            } else {
                chip.classList.remove('used');
            }
        });
    }

    // ========== ACTIONS ==========

    function speakCurrentSentence() {
        var text = state.currentSentence.join('');
        speakText(text);
    }

    function speakText(text) {
        if (!('speechSynthesis' in window)) return;
        if (!state.settings.audioEnabled) return;
        if (!text) return;

        window.speechSynthesis.cancel();

        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }

    function saveCurrentSentence() {
        if (state.currentSentence.length === 0) {
            alert('Build a sentence first!');
            return;
        }

        var sentence = state.currentSentence.join('');
        if (state.savedSentences.indexOf(sentence) === -1) {
            state.savedSentences.push(sentence);
            saveSavedSentences();
            alert('Sentence saved!');
        } else {
            alert('This sentence is already saved.');
        }
    }

    function deleteSavedSentence(index) {
        state.savedSentences.splice(index, 1);
        saveSavedSentences();
        showSavedView(false);
    }

    function checkSentence() {
        if (!state.targetSentence) return;

        var userSentence = state.currentSentence.join('');
        var targetSentence = state.targetSentence.chinese.join('');

        if (userSentence === targetSentence) {
            // Correct!
            var sentenceId = state.currentGroup + '-' + state.currentSentenceIndex;
            if (state.completedSentences.indexOf(sentenceId) === -1) {
                state.completedSentences.push(sentenceId);
                saveCompleted();
            }

            elements.celebrationSentence.textContent = targetSentence;
            elements.celebrationPinyin.textContent = state.targetSentence.pinyin;
            elements.celebration.classList.remove('hidden');

            if (state.settings.audioEnabled) {
                speakText(targetSentence);
            }
        } else {
            // Incorrect - show hint
            alert('Not quite! Try again.\nHint: ' + state.targetSentence.english);
        }
    }

    function nextSentence() {
        var group = state.groups[state.currentGroup];
        if (!group) return;

        var nextIndex = state.currentSentenceIndex + 1;
        if (nextIndex >= group.sentences.length) {
            nextIndex = 0;
        }

        showPracticeMode(state.currentGroup, nextIndex, true);
    }

})();
