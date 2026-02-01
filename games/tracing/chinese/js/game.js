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
        strokeTypes: [],
        currentHSK: 1,
        currentChar: null,
        writer: null,
        isQuizMode: false,
        completedChars: [],
        settings: {
            animationSpeed: 1,
            showOutline: true,
            hintsAfterMistakes: 3,
            audioEnabled: true
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
    }

    function cacheElements() {
        elements.characterTarget = document.getElementById('character-target');
        elements.pinyinDisplay = document.getElementById('pinyin-display');
        elements.jyutpingDisplay = document.getElementById('jyutping-display');
        elements.definitionDisplay = document.getElementById('definition-display');
        elements.strokesDisplay = document.getElementById('strokes-display');
        elements.hskDisplay = document.getElementById('hsk-display');
        elements.characterGrid = document.getElementById('character-grid');
        elements.hskSelect = document.getElementById('hsk-select');
        elements.animateBtn = document.getElementById('animate-btn');
        elements.practiceBtn = document.getElementById('practice-btn');
        elements.nextBtn = document.getElementById('next-btn');
        elements.helpBtn = document.getElementById('help-btn');
        elements.settingsBtn = document.getElementById('settings-btn');
        elements.helpModal = document.getElementById('help-modal');
        elements.settingsModal = document.getElementById('settings-modal');
        elements.closeHelp = document.getElementById('close-help');
        elements.closeSettings = document.getElementById('close-settings');
        elements.strokeGrid = document.getElementById('stroke-grid');
        elements.strokeDetail = document.getElementById('stroke-detail');
        elements.celebration = document.getElementById('celebration');
        elements.animationSpeed = document.getElementById('animation-speed');
        elements.speedValue = document.getElementById('speed-value');
        elements.showOutline = document.getElementById('show-outline');
        elements.showHints = document.getElementById('show-hints');
        elements.hintsValue = document.getElementById('hints-value');
        elements.audioEnabled = document.getElementById('audio-enabled');
    }

    function loadSettings() {
        try {
            var saved = localStorage.getItem('chinese-settings');
            if (saved) {
                state.settings = JSON.parse(saved);
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

    function saveSettings() {
        try {
            localStorage.setItem('chinese-settings', JSON.stringify(state.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem('chinese-completed', JSON.stringify(state.completedChars));
        } catch (e) {
            console.warn('Could not save progress:', e);
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
    }

    function loadData() {
        // Load character data
        fetch('data/characters.json')
            .then(function(response) { return response.json(); })
            .then(function(data) {
                state.characters = data.characters;
                state.hskIndex = data.hskIndex;
                populateGrid();
                // Select first character
                var firstChar = state.hskIndex[state.currentHSK][0];
                if (firstChar) {
                    selectCharacter(firstChar);
                }
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
        // HSK Level Selection
        elements.hskSelect.addEventListener('change', function() {
            state.currentHSK = parseInt(this.value, 10);
            populateGrid();
            // Select first character of new level
            var chars = state.hskIndex[state.currentHSK];
            if (chars && chars.length > 0) {
                selectCharacter(chars[0]);
            }
        });

        // Action Buttons
        elements.animateBtn.addEventListener('click', animateCharacter);
        elements.practiceBtn.addEventListener('click', startPractice);
        elements.nextBtn.addEventListener('click', nextCharacter);

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
                // Recreate writer with new outline setting
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

        // Celebration click to dismiss
        elements.celebration.addEventListener('click', function() {
            elements.celebration.classList.add('hidden');
        });
    }

    function populateGrid() {
        var chars = state.hskIndex[state.currentHSK] || [];
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
                selectCharacter(this.getAttribute('data-char'));
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
                // Use default CDN loader
                return HanziWriter.loadCharacterData(char).then(onComplete);
            },
            onLoadCharNotFound: function() {
                elements.characterTarget.innerHTML = '<div style="color: #e74c3c; text-align: center; padding: 20px;">Character not found in database</div>';
            }
        });

        // Reset practice button state
        elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
    }

    function animateCharacter() {
        if (!state.writer) return;

        // Cancel any ongoing quiz
        if (state.isQuizMode) {
            state.writer.cancelQuiz();
            state.isQuizMode = false;
            elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
        }

        state.writer.animateCharacter({
            onComplete: function() {
                // Speak the character if audio enabled
                if (state.settings.audioEnabled && state.currentChar) {
                    speakCharacter(state.currentChar);
                }
            }
        });
    }

    function startPractice() {
        if (!state.writer) return;

        if (state.isQuizMode) {
            // Cancel quiz mode
            state.writer.cancelQuiz();
            state.isQuizMode = false;
            elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';
            // Reset the character display
            createWriter(state.currentChar);
            return;
        }

        state.isQuizMode = true;
        elements.practiceBtn.innerHTML = '<span class="btn-icon">✖</span><span class="btn-text">Cancel</span>';

        state.writer.quiz({
            onMistake: function(strokeData) {
                showQuizFeedback('Try again', false);
            },
            onCorrectStroke: function(strokeData) {
                showQuizFeedback('Correct!', true);
            },
            onComplete: function(summaryData) {
                state.isQuizMode = false;
                elements.practiceBtn.innerHTML = '<span class="btn-icon">✏️</span><span class="btn-text">Practice</span>';

                // Mark as completed
                if (state.completedChars.indexOf(state.currentChar) === -1) {
                    state.completedChars.push(state.currentChar);
                    saveProgress();
                    populateGrid(); // Update grid to show completion
                }

                // Show celebration
                showCelebration();

                // Speak the character
                if (state.settings.audioEnabled && state.currentChar) {
                    speakCharacter(state.currentChar);
                }
            }
        });
    }

    function showQuizFeedback(message, isCorrect) {
        // Remove existing feedback
        var existing = elements.characterTarget.querySelector('.quiz-feedback');
        if (existing) existing.remove();

        var feedback = document.createElement('div');
        feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
        feedback.textContent = message;
        elements.characterTarget.appendChild(feedback);

        // Remove after animation
        setTimeout(function() {
            feedback.remove();
        }, 1000);
    }

    function showCelebration() {
        elements.celebration.classList.remove('hidden');
        setTimeout(function() {
            elements.celebration.classList.add('hidden');
        }, 2000);
    }

    function nextCharacter() {
        var chars = state.hskIndex[state.currentHSK] || [];
        var currentIndex = chars.indexOf(state.currentChar);

        if (currentIndex === -1 || currentIndex >= chars.length - 1) {
            // Go back to first character
            selectCharacter(chars[0]);
        } else {
            selectCharacter(chars[currentIndex + 1]);
        }
    }

    function speakCharacter(char) {
        if (!('speechSynthesis' in window)) return;

        var data = state.characters[char];
        if (!data || !data.pinyin || data.pinyin.length === 0) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        var utterance = new SpeechSynthesisUtterance(char);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;

        window.speechSynthesis.speak(utterance);
    }

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

        // Bind click events
        var cards = elements.strokeGrid.querySelectorAll('.stroke-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                // Remove selected from all
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
