/**
 * Sentence Builder Game v3.0
 * Two-level building: Words from letters, Sentences from words
 * URL: ?group=english-greetings or ?group=chinese-food or ?group=custom
 */

(function() {
    'use strict';

    var state = {
        data: null,
        currentLanguage: null,     // 'english' or 'chinese'
        currentGroup: null,        // group key like 'greetings'

        // Mode: 'word' (build words from letters) or 'sentence' (build sentences from words)
        gameMode: 'word',

        // Word building state (Level 1)
        currentWordIndex: 0,
        currentWordLetters: [],    // Letters/chars user has added
        targetWord: null,          // Word object we're building

        // Sentence building state (Level 2)
        currentSentenceIndex: 0,
        currentSentence: [],       // words user has added
        targetSentence: null,      // sentence to build

        // Progress tracking
        unlockedWords: {},         // { 'english-greetings': ['hello', 'good'] }
        completedCount: {},        // Track completion counts

        savedSentences: [],
        settings: {
            audioEnabled: true,
            showHints: true,
            voiceSpeed: 0.85,
            voicePitch: 1.0,
            preferredVoice: 'default'
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

        // Mode indicator
        elements.modeIndicator = document.getElementById('mode-indicator');
        elements.modeWord = document.getElementById('mode-word');
        elements.modeSentence = document.getElementById('mode-sentence');
        elements.unlockedIndicator = document.getElementById('unlocked-indicator');
        elements.unlockedCount = document.getElementById('unlocked-count');
        elements.totalWords = document.getElementById('total-words');

        // Target
        elements.targetArea = document.getElementById('target-area');
        elements.targetLabel = document.getElementById('target-label');
        elements.targetDisplay = document.getElementById('target-display');
        elements.targetHint = document.getElementById('target-hint');

        // Word building (Level 1)
        elements.wordBuildArea = document.getElementById('word-build-area');
        elements.wordDisplay = document.getElementById('word-display');
        elements.letterBank = document.getElementById('letter-bank');
        elements.letterGrid = document.getElementById('letter-grid');

        // Sentence building (Level 2)
        elements.sentenceArea = document.getElementById('sentence-area');
        elements.buildLabel = document.getElementById('build-label');
        elements.sentenceDisplay = document.getElementById('sentence-display');
        elements.wordBank = document.getElementById('word-bank');
        elements.wordBankLabel = document.getElementById('word-bank-label');
        elements.wordGrid = document.getElementById('word-grid');

        elements.clearBtn = document.getElementById('clear-btn');
        elements.speakSentenceBtn = document.getElementById('speak-sentence-btn');
        elements.checkBtn = document.getElementById('check-btn');

        elements.celebration = document.getElementById('celebration');
        elements.celebrationSentence = document.getElementById('celebration-sentence');
        elements.celebrationHint = document.getElementById('celebration-hint');
        elements.celebrationRetry = document.getElementById('celebration-retry');
        elements.celebrationNext = document.getElementById('celebration-next');

        elements.settingsModal = document.getElementById('settings-modal');
        elements.closeSettings = document.getElementById('close-settings');
        elements.audioEnabled = document.getElementById('audio-enabled');
        elements.showHints = document.getElementById('show-hints');
        elements.voiceSpeed = document.getElementById('voice-speed');
        elements.voicePitch = document.getElementById('voice-pitch');
        elements.voiceSelect = document.getElementById('voice-select');
        elements.voiceSelectRow = document.getElementById('voice-select-row');
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
            var unlocked = localStorage.getItem('sentences-unlocked');
            if (unlocked) {
                state.unlockedWords = JSON.parse(unlocked);
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

    function saveUnlockedWords() {
        try {
            localStorage.setItem('sentences-unlocked', JSON.stringify(state.unlockedWords));
        } catch (e) {}
    }

    function applySettings() {
        if (elements.audioEnabled) elements.audioEnabled.checked = state.settings.audioEnabled;
        if (elements.showHints) elements.showHints.checked = state.settings.showHints;
        if (elements.voiceSpeed) elements.voiceSpeed.value = state.settings.voiceSpeed;
        if (elements.voicePitch) elements.voicePitch.value = state.settings.voicePitch;
        if (elements.voiceSelect) elements.voiceSelect.value = state.settings.preferredVoice;
        populateVoiceList();
    }

    function populateVoiceList() {
        if (!('speechSynthesis' in window)) return;
        if (!elements.voiceSelect || !elements.voiceSelectRow) return;

        var voices = window.speechSynthesis.getVoices();
        var relevantVoices = [];

        for (var i = 0; i < voices.length; i++) {
            // Include English and Chinese voices
            if (voices[i].lang.indexOf('en') === 0 || voices[i].lang.indexOf('zh') === 0) {
                relevantVoices.push(voices[i]);
            }
        }

        if (relevantVoices.length === 0) {
            elements.voiceSelectRow.style.display = 'none';
            return;
        }

        elements.voiceSelectRow.style.display = 'flex';
        var html = '<option value="default">Default</option>';
        for (var j = 0; j < relevantVoices.length; j++) {
            var v = relevantVoices[j];
            var selected = state.settings.preferredVoice === v.name ? ' selected' : '';
            html += '<option value="' + v.name + '"' + selected + '>' + v.name + '</option>';
        }
        elements.voiceSelect.innerHTML = html;
    }

    // Setup voice list (voices load async)
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
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

        // Mode switching
        elements.modeWord.addEventListener('click', function() {
            if (state.gameMode !== 'word') {
                switchToWordMode();
            }
        });
        elements.modeSentence.addEventListener('click', function() {
            if (state.gameMode !== 'sentence' && !elements.modeSentence.disabled) {
                switchToSentenceMode();
            }
        });

        elements.clearBtn.addEventListener('click', clearCurrent);
        elements.speakSentenceBtn.addEventListener('click', speakCurrent);
        elements.checkBtn.addEventListener('click', checkCurrent);
        elements.speakBtn.addEventListener('click', function() {
            if (state.gameMode === 'word' && state.targetWord) {
                speakText(state.targetWord.word, state.currentLanguage);
            } else if (state.targetSentence) {
                speakText(state.targetSentence.display, state.currentLanguage);
            }
        });

        elements.celebrationRetry.addEventListener('click', function() {
            elements.celebration.classList.add('hidden');
            clearCurrent();
        });
        elements.celebrationNext.addEventListener('click', function() {
            elements.celebration.classList.add('hidden');
            nextItem();
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
        if (elements.voiceSpeed) {
            elements.voiceSpeed.addEventListener('input', function() {
                state.settings.voiceSpeed = parseFloat(this.value);
                saveSettings();
            });
        }
        if (elements.voicePitch) {
            elements.voicePitch.addEventListener('input', function() {
                state.settings.voicePitch = parseFloat(this.value);
                saveSettings();
            });
        }
        if (elements.voiceSelect) {
            elements.voiceSelect.addEventListener('change', function() {
                state.settings.preferredVoice = this.value;
                saveSettings();
            });
        }
        elements.resetProgress.addEventListener('click', function() {
            if (confirm('Reset all progress and saved sentences?')) {
                localStorage.removeItem('sentences-settings');
                localStorage.removeItem('sentences-saved');
                localStorage.removeItem('sentences-completed');
                localStorage.removeItem('sentences-unlocked');
                state.savedSentences = [];
                state.completedCount = {};
                state.unlockedWords = {};
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
            var wordCount = group.words ? group.words.length : 0;
            var sentenceCount = group.sentences ? group.sentences.length : 0;

            // Check unlocked count
            var unlockedKey = lang + '-' + key;
            var unlocked = state.unlockedWords[unlockedKey] || [];
            var unlockedCount = unlocked.length;

            html += '<div class="group-card" data-group="' + key + '">';
            html += '<span class="group-icon">' + group.icon + '</span>';
            html += '<span class="group-name">' + group.name + '</span>';
            html += '<span class="group-count">' + unlockedCount + '/' + wordCount + ' words</span>';
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

        state.currentLanguage = lang;
        state.currentGroup = groupKey;

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = langData.groups[groupKey].name;

        // Check if any words are unlocked
        var unlockedKey = lang + '-' + groupKey;
        var unlocked = state.unlockedWords[unlockedKey] || [];

        // Start in word mode by default (unless all words unlocked)
        var group = langData.groups[groupKey];
        if (unlocked.length >= group.words.length) {
            switchToSentenceMode();
        } else {
            switchToWordMode();
        }

        updateURL(lang + '-' + groupKey, pushHistory);
    }

    function showCustomMode(pushHistory) {
        state.currentLanguage = 'english';
        state.currentGroup = 'custom';
        state.gameMode = 'sentence';
        state.targetSentence = null;
        state.currentSentence = [];

        hideAllViews();
        elements.gameContainer.style.display = 'flex';
        elements.headerTitle.textContent = 'Custom Sentence';

        // Hide mode indicator and word building for custom mode
        elements.modeIndicator.style.display = 'none';
        elements.unlockedIndicator.style.display = 'none';
        elements.targetArea.style.display = 'none';
        elements.wordBuildArea.style.display = 'none';
        elements.letterBank.style.display = 'none';
        elements.sentenceArea.style.display = 'block';
        elements.wordBank.style.display = 'block';

        // Show common words
        var commonWords = [
            { word: 'I', letters: ['I'] },
            { word: 'you', letters: ['y','o','u'] },
            { word: 'he', letters: ['h','e'] },
            { word: 'she', letters: ['s','h','e'] },
            { word: 'we', letters: ['w','e'] },
            { word: 'they', letters: ['t','h','e','y'] },
            { word: 'is', letters: ['i','s'] },
            { word: 'am', letters: ['a','m'] },
            { word: 'are', letters: ['a','r','e'] },
            { word: 'the', letters: ['t','h','e'] },
            { word: 'a', letters: ['a'] },
            { word: 'like', letters: ['l','i','k','e'] },
            { word: 'love', letters: ['l','o','v','e'] },
            { word: 'want', letters: ['w','a','n','t'] },
            { word: 'have', letters: ['h','a','v','e'] },
            { word: 'go', letters: ['g','o'] },
            { word: 'come', letters: ['c','o','m','e'] },
            { word: 'eat', letters: ['e','a','t'] },
            { word: 'drink', letters: ['d','r','i','n','k'] },
            { word: 'see', letters: ['s','e','e'] },
            { word: 'do', letters: ['d','o'] },
            { word: 'good', letters: ['g','o','o','d'] },
            { word: 'big', letters: ['b','i','g'] },
            { word: 'small', letters: ['s','m','a','l','l'] },
            { word: 'happy', letters: ['h','a','p','p','y'] },
            { word: 'my', letters: ['m','y'] },
            { word: 'your', letters: ['y','o','u','r'] },
            { word: 'to', letters: ['t','o'] },
            { word: 'and', letters: ['a','n','d'] },
            { word: 'but', letters: ['b','u','t'] }
        ];
        populateWordBank(commonWords, true);
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

    // ========== MODE SWITCHING ==========

    function switchToWordMode() {
        state.gameMode = 'word';
        state.currentWordIndex = 0;
        state.currentWordLetters = [];

        // Show word building UI, hide sentence building UI
        elements.modeIndicator.style.display = 'flex';
        elements.unlockedIndicator.style.display = 'block';
        elements.targetArea.style.display = 'block';
        elements.wordBuildArea.style.display = 'block';
        elements.letterBank.style.display = 'block';
        elements.sentenceArea.style.display = 'none';
        elements.wordBank.style.display = 'none';

        elements.targetLabel.textContent = 'Build this word:';

        loadNextWord();
        updateModeButtons();
    }

    function switchToSentenceMode() {
        state.gameMode = 'sentence';
        state.currentSentenceIndex = 0;
        state.currentSentence = [];

        // Show sentence building UI, hide word building UI
        elements.modeIndicator.style.display = 'flex';
        elements.unlockedIndicator.style.display = 'block';
        elements.targetArea.style.display = 'block';
        elements.wordBuildArea.style.display = 'none';
        elements.letterBank.style.display = 'none';
        elements.sentenceArea.style.display = 'block';
        elements.wordBank.style.display = 'block';

        elements.targetLabel.textContent = 'Build this sentence:';

        loadNextSentence();
        populateWordBankForSentence();
        updateModeButtons();
    }

    function updateModeButtons() {
        var group = getGroupData();
        if (!group) return;

        var unlockedKey = state.currentLanguage + '-' + state.currentGroup;
        var unlocked = state.unlockedWords[unlockedKey] || [];
        var totalWords = group.words.length;

        elements.unlockedCount.textContent = unlocked.length;
        elements.totalWords.textContent = totalWords;

        // Enable sentence mode only if some words are unlocked
        var canBuildSentences = unlocked.length > 0;
        elements.modeSentence.disabled = !canBuildSentences;

        elements.modeWord.classList.toggle('active', state.gameMode === 'word');
        elements.modeSentence.classList.toggle('active', state.gameMode === 'sentence');
    }

    function getGroupData() {
        if (!state.data || !state.currentLanguage || !state.currentGroup) return null;
        var langData = state.data.languages[state.currentLanguage];
        if (!langData) return null;
        return langData.groups[state.currentGroup];
    }

    // ========== WORD BUILDING (Level 1) ==========

    function loadNextWord() {
        var group = getGroupData();
        if (!group) return;

        var unlockedKey = state.currentLanguage + '-' + state.currentGroup;
        var unlocked = state.unlockedWords[unlockedKey] || [];

        // Find next locked word
        var foundIndex = -1;
        for (var i = 0; i < group.words.length; i++) {
            var word = group.words[i].word;
            if (unlocked.indexOf(word) === -1) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex === -1) {
            // All words unlocked! Switch to sentence mode
            switchToSentenceMode();
            return;
        }

        state.currentWordIndex = foundIndex;
        state.targetWord = group.words[foundIndex];
        state.currentWordLetters = [];

        updateTargetDisplay();
        updateWordDisplay();
        populateLetterBank();
    }

    function populateLetterBank() {
        var group = getGroupData();
        if (!group) return;

        var isChinese = state.currentLanguage === 'chinese';
        var letters = [];

        if (isChinese) {
            // For Chinese: collect all unique characters from group words
            group.words.forEach(function(wordObj) {
                var chars = wordObj.characters || [];
                chars.forEach(function(c) {
                    if (letters.indexOf(c) === -1) {
                        letters.push(c);
                    }
                });
            });
        } else {
            // For English: show relevant letters (from all words in group) + some extras
            var usedLetters = {};
            group.words.forEach(function(wordObj) {
                var wordLetters = wordObj.letters || [];
                wordLetters.forEach(function(l) {
                    usedLetters[l.toLowerCase()] = true;
                    if (l === l.toUpperCase() && l.length === 1) {
                        usedLetters[l] = true; // Keep uppercase like 'I'
                    }
                });
            });
            letters = Object.keys(usedLetters);
        }

        // Shuffle letters
        letters = shuffleArray(letters);

        var html = '';
        letters.forEach(function(letter) {
            var isUpper = letter === letter.toUpperCase() && letter.length === 1 && /[A-Z]/.test(letter);
            var chipClass = 'letter-chip';
            if (isChinese) chipClass += ' chinese';
            if (isUpper) chipClass += ' uppercase';
            html += '<div class="' + chipClass + '" data-letter="' + letter + '">' + letter + '</div>';
        });
        elements.letterGrid.innerHTML = html;

        elements.letterGrid.querySelectorAll('.letter-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                var letter = this.getAttribute('data-letter');
                addLetter(letter);
            });
        });
    }

    function addLetter(letter) {
        state.currentWordLetters.push(letter);
        updateWordDisplay();
        updateLetterBankUsage();

        if (state.settings.audioEnabled) {
            // For capital I, say "eye" not "capital I"
            var textToSpeak = letter;
            if (letter === 'I') {
                textToSpeak = 'eye';
            }
            speakText(textToSpeak, state.currentLanguage);
        }

        checkWordComplete();
    }

    function removeLetter(index) {
        state.currentWordLetters.splice(index, 1);
        updateWordDisplay();
        updateLetterBankUsage();
    }

    function updateWordDisplay() {
        if (state.currentWordLetters.length === 0) {
            elements.wordDisplay.innerHTML = '<span class="empty-hint">Tap letters below</span>';
            return;
        }

        var isChinese = state.currentLanguage === 'chinese';
        var html = '';
        state.currentWordLetters.forEach(function(letter, idx) {
            var letterClass = 'word-letter';
            if (isChinese) letterClass += ' chinese';
            html += '<span class="' + letterClass + '" data-index="' + idx + '">' + letter + '</span>';
        });
        elements.wordDisplay.innerHTML = html;

        elements.wordDisplay.querySelectorAll('.word-letter').forEach(function(el) {
            el.addEventListener('click', function() {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                this.classList.add('removing');
                setTimeout(function() {
                    removeLetter(idx);
                }, 200);
            });
        });
    }

    function updateLetterBankUsage() {
        var target = getTargetLetters();
        if (!target) return;

        // Count how many of each letter we need vs have used
        var targetCounts = {};
        target.forEach(function(l) {
            targetCounts[l] = (targetCounts[l] || 0) + 1;
        });

        var usedCounts = {};
        state.currentWordLetters.forEach(function(l) {
            usedCounts[l] = (usedCounts[l] || 0) + 1;
        });

        elements.letterGrid.querySelectorAll('.letter-chip').forEach(function(chip) {
            var letter = chip.getAttribute('data-letter');
            var needed = targetCounts[letter] || 0;
            var used = usedCounts[letter] || 0;

            if (used >= needed && needed > 0) {
                chip.classList.add('used');
            } else {
                chip.classList.remove('used');
            }
        });
    }

    function getTargetLetters() {
        if (!state.targetWord) return null;
        return state.currentLanguage === 'chinese'
            ? state.targetWord.characters
            : state.targetWord.letters;
    }

    function checkWordComplete() {
        var target = getTargetLetters();
        if (!target) return;

        if (arraysEqual(state.currentWordLetters, target)) {
            // Word complete! Unlock it
            unlockWord(state.targetWord.word);
            showWordCelebration();
        }
    }

    function unlockWord(word) {
        var key = state.currentLanguage + '-' + state.currentGroup;
        if (!state.unlockedWords[key]) {
            state.unlockedWords[key] = [];
        }
        if (state.unlockedWords[key].indexOf(word) === -1) {
            state.unlockedWords[key].push(word);
            saveUnlockedWords();
        }
        updateModeButtons();
    }

    function showWordCelebration() {
        elements.celebrationSentence.textContent = state.targetWord.word;
        if (state.currentLanguage === 'chinese') {
            // Could add pinyin hint here
            elements.celebrationHint.textContent = 'Word unlocked!';
        } else {
            elements.celebrationHint.textContent = 'Word unlocked!';
        }
        elements.celebration.classList.remove('hidden');

        if (state.settings.audioEnabled) {
            // For capital I, say "eye" in context
            var textToSpeak = state.targetWord.word;
            if (textToSpeak === 'I') {
                textToSpeak = 'eye';
            }
            speakText(textToSpeak, state.currentLanguage);
        }
    }

    // ========== SENTENCE BUILDING (Level 2) ==========

    function loadNextSentence() {
        var group = getGroupData();
        if (!group || !group.sentences || group.sentences.length === 0) return;

        if (state.currentSentenceIndex >= group.sentences.length) {
            state.currentSentenceIndex = 0;
        }

        state.targetSentence = group.sentences[state.currentSentenceIndex];
        state.currentSentence = [];
        updateTargetDisplay();
        updateSentenceDisplay();
    }

    function populateWordBankForSentence() {
        var group = getGroupData();
        if (!group) return;

        var unlockedKey = state.currentLanguage + '-' + state.currentGroup;
        var unlocked = state.unlockedWords[unlockedKey] || [];

        populateWordBank(group.words, false, unlocked);
    }

    function populateWordBank(words, allUnlocked, unlockedList) {
        var html = '';
        words.forEach(function(wordObj) {
            var word = wordObj.word;
            var isUnlocked = allUnlocked || (unlockedList && unlockedList.indexOf(word) !== -1);
            var chipClass = 'word-chip';
            if (isUnlocked) {
                chipClass += ' unlocked';
            } else {
                chipClass += ' locked';
            }
            html += '<div class="' + chipClass + '" data-word="' + word + '" data-unlocked="' + isUnlocked + '">' + word + '</div>';
        });
        elements.wordGrid.innerHTML = html;

        elements.wordGrid.querySelectorAll('.word-chip').forEach(function(chip) {
            chip.addEventListener('click', function() {
                var isUnlocked = this.getAttribute('data-unlocked') === 'true';
                if (!isUnlocked) return;
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
            // For capital I, say "eye" not "I" phonetically
            var textToSpeak = word;
            if (word === 'I') {
                textToSpeak = 'eye';
            }
            speakText(textToSpeak, state.currentLanguage);
        }
    }

    function removeWord(index) {
        state.currentSentence.splice(index, 1);
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
        if (!state.targetSentence) return;

        var targetWords = state.targetSentence.words || [];
        var targetCounts = {};
        targetWords.forEach(function(w) {
            targetCounts[w] = (targetCounts[w] || 0) + 1;
        });

        var usedCounts = {};
        state.currentSentence.forEach(function(w) {
            usedCounts[w] = (usedCounts[w] || 0) + 1;
        });

        elements.wordGrid.querySelectorAll('.word-chip').forEach(function(chip) {
            var word = chip.getAttribute('data-word');
            var needed = targetCounts[word] || 0;
            var used = usedCounts[word] || 0;

            if (used >= needed && needed > 0) {
                chip.classList.add('used');
            } else {
                chip.classList.remove('used');
            }
        });
    }

    // ========== COMMON ACTIONS ==========

    function updateTargetDisplay() {
        if (state.gameMode === 'word') {
            if (!state.targetWord) {
                elements.targetArea.style.display = 'none';
                return;
            }
            elements.targetArea.style.display = 'block';
            elements.targetDisplay.textContent = state.targetWord.word;
            elements.targetHint.textContent = '';
        } else {
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
    }

    function clearCurrent() {
        if (state.gameMode === 'word') {
            state.currentWordLetters = [];
            updateWordDisplay();
            updateLetterBankUsage();
        } else {
            state.currentSentence = [];
            updateSentenceDisplay();
            updateWordBankUsage();
        }
    }

    function speakCurrent() {
        if (state.gameMode === 'word') {
            if (state.currentWordLetters.length === 0) return;
            var text = state.currentWordLetters.join(state.currentLanguage === 'chinese' ? '' : '');
            speakText(text, state.currentLanguage);
        } else {
            if (state.currentSentence.length === 0) return;
            var text = state.currentLanguage === 'chinese'
                ? state.currentSentence.join('')
                : state.currentSentence.join(' ');
            speakText(text, state.currentLanguage);
        }
    }

    function checkCurrent() {
        if (state.gameMode === 'word') {
            checkWordComplete();
        } else {
            checkSentence();
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

    function nextItem() {
        if (state.gameMode === 'word') {
            loadNextWord();
        } else {
            nextSentence();
        }
    }

    function nextSentence() {
        var group = getGroupData();
        if (!group) return;

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

    // ========== UTILITIES ==========

    function speakText(text, lang) {
        if (!('speechSynthesis' in window)) return;
        if (!state.settings.audioEnabled) return;
        if (!text) return;

        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'chinese' ? 'zh-CN' : 'en-US';
        utterance.rate = state.settings.voiceSpeed || 0.85;
        utterance.pitch = state.settings.voicePitch || 1.0;

        // Try to use preferred voice
        if (state.settings.preferredVoice && state.settings.preferredVoice !== 'default') {
            var voices = window.speechSynthesis.getVoices();
            for (var i = 0; i < voices.length; i++) {
                if (voices[i].name === state.settings.preferredVoice) {
                    utterance.voice = voices[i];
                    break;
                }
            }
        }

        window.speechSynthesis.speak(utterance);
    }

    function shuffleArray(array) {
        var arr = array.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    }

    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

})();
