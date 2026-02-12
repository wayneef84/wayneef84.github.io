document.addEventListener('DOMContentLoaded', function() {
    // Pack Registry - will be loaded from manifest
    var PACK_REGISTRY = [];

    // DOM Elements
    var dom = {
        // Pack Selector
        packSelector: document.getElementById('packSelector'),
        packGrid: document.getElementById('packGrid'),
        packSearch: document.getElementById('packSearch'),
        totalQuestions: document.getElementById('totalQuestions'),
        totalPacks: document.getElementById('totalPacks'),
        // Game Elements
        gameContainer: document.getElementById('gameContainer'),
        packTitle: document.getElementById('packTitle'),
        qCount: document.getElementById('qCount'),
        questionText: document.getElementById('questionText'),
        mediaContainer: document.getElementById('mediaContainer'),
        answerGrid: document.getElementById('answerGrid'),
        answers: {
            'A': document.querySelector('button[data-option="A"]'),
            'B': document.querySelector('button[data-option="B"]'),
            'C': document.querySelector('button[data-option="C"]'),
            'D': document.querySelector('button[data-option="D"]')
        },
        scoreValue: document.getElementById('scoreValue'),
        streakValue: document.getElementById('streakValue'),
        progressBar: document.getElementById('progressBar'),
        timerDisplay: document.getElementById('timerDisplay'),
        lockToggle: document.getElementById('lockToggle'),
        nextBtn: document.getElementById('nextBtn'),
        feedbackArea: document.getElementById('feedbackArea'),
        feedbackTitle: document.getElementById('feedbackTitle'),
        feedbackText: document.getElementById('feedbackText'),
        endScreen: document.getElementById('endScreen'),
        finalScore: document.getElementById('finalScore'),
        finalCorrect: document.getElementById('finalCorrect'),
        finalStreak: document.getElementById('finalStreak'),
        restartBtn: document.getElementById('restartBtn'),
        changePack: document.getElementById('changePack'),
        backToPacksBtn: document.getElementById('backToPacksBtn') // New button
    };

    var engine = null;
    var currentPackData = null;

    // Show pack selector on load
    renderPackSelector();

    function renderPackSelector() {
        // Show selector, hide game
        if (dom.packSelector) dom.packSelector.classList.remove('hidden');
        if (dom.gameContainer) dom.gameContainer.classList.add('hidden');
        if (dom.endScreen) dom.endScreen.classList.add('hidden');

        // Check if registry is loaded
        if (PACK_REGISTRY.length === 0) {
            if (dom.packGrid) {
                dom.packGrid.innerHTML = '<div class="loading-state">Loading packs...</div>';
            }

            fetch('packs/manifest.json')
                .then(function(response) {
                    if (!response.ok) throw new Error('Failed to load manifest');
                    return response.json();
                })
                .then(function(data) {
                    PACK_REGISTRY = data;
                    renderPackSelector(); // Re-render with data

                    // Check URL for pack
                    const params = new URLSearchParams(window.location.search);
                    const packPath = params.get('pack');
                    if (packPath) {
                        // Validate path against registry
                        const isValid = PACK_REGISTRY.some(p => p.path === packPath);
                        if (isValid) {
                            loadAndStartPack(packPath, true); // true = skip pushState
                        } else {
                            console.warn('Invalid pack path in URL:', packPath);
                            history.replaceState(null, '', window.location.pathname);
                        }
                    }
                })
                .catch(function(e) {
                    console.error(e);
                    if (dom.packGrid) {
                        dom.packGrid.innerHTML = '<div class="loading-state error">Failed to load packs. <button onclick="location.reload()">Retry</button></div>';
                    }
                });
            return;
        }

        // Calculate totals
        var totalQ = 0;
        var i;
        for (i = 0; i < PACK_REGISTRY.length; i++) {
            totalQ += (PACK_REGISTRY[i].count || 0);
        }
        if (dom.totalQuestions) dom.totalQuestions.textContent = totalQ;
        if (dom.totalPacks) dom.totalPacks.textContent = PACK_REGISTRY.length;

        // Render pack cards
        renderPacks('');

        // Search handler
        if (dom.packSearch) {
            dom.packSearch.addEventListener('input', function() {
                renderPacks(this.value.toLowerCase());
            });
        }
    }

    function renderPacks(searchTerm) {
        if (!dom.packGrid) return;
        dom.packGrid.innerHTML = '';

        var i, pack, card, match;
        for (i = 0; i < PACK_REGISTRY.length; i++) {
            pack = PACK_REGISTRY[i];
            match = !searchTerm ||
                pack.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                pack.category.toLowerCase().indexOf(searchTerm) !== -1;

            if (!match) continue;

            card = document.createElement('button');
            card.className = 'pack-card';
            card.setAttribute('data-pack', pack.path);
            card.innerHTML =
                '<div class="pack-icon">' + (pack.icon || '\u2753') + '</div>' +
                '<div class="pack-info">' +
                    '<div class="pack-name">' + pack.title + '</div>' +
                    '<div class="pack-meta">' +
                        '<span class="pack-category">' + (pack.category || 'General') + '</span>' +
                        '<span class="pack-count">' + (pack.count || '?') + ' Q</span>' +
                    '</div>' +
                '</div>';

            (function(packPath) {
                card.addEventListener('click', function() {
                    loadAndStartPack(packPath, false); // false = push new state
                });
            })(pack.path);

            dom.packGrid.appendChild(card);
        }
    }

    function loadAndStartPack(packFile, skipPushState) {
        // Show loading state
        if (dom.packGrid) {
            dom.packGrid.innerHTML = '<div class="loading-state">Loading pack...</div>';
        }

        fetch(packFile)
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load pack');
                return response.json();
            })
            .then(function(data) {
                currentPackData = data;

                // Update URL without reloading
                if (!skipPushState) {
                    const url = new URL(window.location);
                    url.searchParams.set('pack', packFile);
                    history.pushState({pack: packFile}, '', url);
                }

                // Switch to game view
                if (dom.packSelector) dom.packSelector.classList.add('hidden');
                if (dom.gameContainer) dom.gameContainer.classList.remove('hidden');

                dom.packTitle.textContent = currentPackData.meta.title.toUpperCase();

                setupEngine();
                engine.loadPack(currentPackData);
                bindEvents();
                engine.startRound();
            })
            .catch(function(e) {
                console.error(e);
                if (dom.packGrid) {
                    dom.packGrid.innerHTML = '<div class="loading-state error">Failed to load pack. <button onclick="location.reload()">Retry</button></div>';
                }
            });
    }

    var eventsBound = false;

    function setupEngine() {
        engine = new QuizEngine({
            limit: 10,
            timer: 15,
            onTick: updateTimer,
            onQuestionLoaded: renderQuestion,
            onFeedback: showFeedback,
            onGameEnd: showEndScreen
        });
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        // Answer Clicks
        var keys = Object.keys(dom.answers);
        var k;
        for (k = 0; k < keys.length; k++) {
            (function(key) {
                dom.answers[key].addEventListener('click', function() {
                    engine.selectAnswer(key);
                });
            })(keys[k]);
        }

        // Lock Toggle
        dom.lockToggle.addEventListener('change', function(e) {
            engine.settings.lockFastForward = e.target.checked;
            updateNextButtonState();

            // FIX: If we enable auto-forward while waiting, trigger it immediately
            if (engine.settings.lockFastForward && engine.state === 'WAITING_FOR_NEXT') {
                engine.triggerFastForward();
            }
        });

        // Next Button
        dom.nextBtn.addEventListener('click', function() {
            engine.triggerFastForward();
        });

        // Restart
        dom.restartBtn.addEventListener('click', function() {
            dom.endScreen.classList.add('hidden');
            engine.loadPack(currentPackData);
            engine.startRound();
        });

        // Change Pack (End Screen)
        if (dom.changePack) {
            dom.changePack.addEventListener('click', function(e) {
                e.preventDefault();
                quitToPacks(false); // Update URL
            });
        }

        // Back to Packs (In-Game)
        if (dom.backToPacksBtn) {
            dom.backToPacksBtn.addEventListener('click', function() {
                if(confirm("Quit current game and return to pack selection?")) {
                    quitToPacks(false); // Update URL
                }
            });
        }

        // Browser Back Button
        window.addEventListener('popstate', function(event) {
            const params = new URLSearchParams(window.location.search);
            const packPath = params.get('pack');

            if (packPath) {
                // If we popped back into a pack state, load it without pushing state
                loadAndStartPack(packPath, true);
            } else {
                // We popped back to root
                quitToPacks(true); // Skip pushing state
            }
        });
    }

    function quitToPacks(skipUrlUpdate) {
        if (engine && engine.timer) clearInterval(engine.timer);
        dom.endScreen.classList.add('hidden');
        dom.packSelector.classList.remove('hidden');
        dom.gameContainer.classList.add('hidden'); // Ensure game is hidden

        if (!skipUrlUpdate) {
            // Remove query param
            const url = new URL(window.location);
            url.searchParams.delete('pack');
            history.pushState(null, '', url);
        }

        renderPackSelector();
    }

    // --- Render Functions ---

    function updateTimer(seconds) {
        dom.timerDisplay.textContent = seconds;
        if (seconds <= 5) {
            dom.timerDisplay.classList.add('danger');
        } else {
            dom.timerDisplay.classList.remove('danger');
        }
    }

    function renderQuestion(data) {
        // Reset UI
        dom.feedbackArea.classList.add('hidden');
        dom.mediaContainer.classList.add('hidden');
        dom.nextBtn.disabled = true;
        updateNextButtonState();

        // Update Text
        dom.qCount.textContent = data.index + '/' + data.total;
        dom.questionText.textContent = data.question.text;

        // Update Score/Streak
        dom.scoreValue.textContent = data.score;
        dom.streakValue.textContent = data.streak;

        // Progress Bar
        var progress = ((data.index - 1) / data.total) * 100;
        dom.progressBar.style.width = progress + '%';

        // Render Options
        var keys = Object.keys(dom.answers);
        var i, key, btn, optionText, textSpan;
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            btn = dom.answers[key];
            optionText = data.question.options[key];

            btn.disabled = false;

            // Remove previous feedback classes
            btn.className = 'answer-btn';

            textSpan = btn.querySelector('.option-text');
            if (optionText) {
                textSpan.textContent = optionText;
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        }

        // Media
        if (data.question.media) {
            dom.mediaContainer.classList.remove('hidden');
            dom.mediaContainer.innerHTML = '<img src="' + data.question.media + '" alt="Question Image" style="max-width:100%; border-radius: 8px;">';
        }
    }

    function showFeedback(data) {
        // Disable all buttons
        var keys = Object.keys(dom.answers);
        var i;
        for (i = 0; i < keys.length; i++) {
            dom.answers[keys[i]].disabled = true;
        }

        var correctBtn = dom.answers[data.correctAnswer];

        if (engine.settings.lockFastForward) {
            // New "Pop" Animation logic
            if (correctBtn) correctBtn.classList.add('pop-correct');

            // If incorrect, still show it briefly (maybe?)
            // The request said: "unless it's clicked somewhere then it just disappears"
            // The 'pop-correct' animation fades out at the end (100% -> opacity: 0).

            // If user selected WRONG answer, we probably should show it as red briefly?
            // The prompt only mentioned the correct answer behavior ("The green should pop up...").
            // I'll keep the incorrect logic for now but focusing on the pop.
             if (!data.correct && !data.timeOut && data.selected) {
                var selectedBtn = dom.answers[data.selected];
                if (selectedBtn) selectedBtn.classList.add('incorrect');
            }

        } else {
            // Standard Logic
            if (correctBtn) correctBtn.classList.add('correct');

            if (!data.correct && !data.timeOut && data.selected) {
                var selectedBtn = dom.answers[data.selected];
                if (selectedBtn) selectedBtn.classList.add('incorrect');
            }
        }

        if (!engine.settings.lockFastForward) {
            dom.nextBtn.disabled = false;
        }

        // Update Stats immediately
        if (data.score !== undefined) dom.scoreValue.textContent = data.score;
        if (data.streak !== undefined) dom.streakValue.textContent = data.streak;
    }

    function showEndScreen(data) {
        dom.progressBar.style.width = '100%';
        dom.endScreen.classList.remove('hidden');

        dom.finalScore.textContent = data.score;

        var correctCount = 0;
        var h;
        for (h = 0; h < data.history.length; h++) {
            if (data.history[h].isCorrect) correctCount++;
        }
        dom.finalCorrect.textContent = correctCount + '/' + data.history.length;
        dom.finalStreak.textContent = data.maxStreak;
    }

    function updateNextButtonState() {
        if (engine.settings.lockFastForward) {
            dom.nextBtn.style.display = 'none';
        } else {
            dom.nextBtn.style.display = 'block';
        }
    }
});
