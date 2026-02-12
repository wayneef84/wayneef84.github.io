document.addEventListener('DOMContentLoaded', function() {
    // Pack Registry - all available packs
    var PACK_REGISTRY = [
        { file: 'sprunki_v1.json', title: 'Sprunki Beats & Lore', icon: '\uD83C\uDFB5', category: 'Gaming', count: 10 },
        { file: 'science_v1.json', title: 'General Science', icon: '\uD83E\uDDEA', category: 'Science', count: 80 },
        { file: 'geography_v1.json', title: 'World Geography', icon: '\uD83C\uDF0D', category: 'Geography', count: 80 },
        { file: 'history_v1.json', title: 'World History', icon: '\uD83C\uDFDB\uFE0F', category: 'History', count: 80 },
        { file: 'movies_v1.json', title: 'Movies & Film', icon: '\uD83C\uDFAC', category: 'Entertainment', count: 80 },
        { file: 'sports_v1.json', title: 'Sports & Athletics', icon: '\u26BD', category: 'Sports', count: 80 },
        { file: 'technology_v1.json', title: 'Technology & Computing', icon: '\uD83D\uDCBB', category: 'Technology', count: 80 },
        { file: 'food_v1.json', title: 'Food & Cuisine', icon: '\uD83C\uDF73', category: 'Lifestyle', count: 80 },
        { file: 'animals_v1.json', title: 'Animals & Nature', icon: '\uD83E\uDD81', category: 'Nature', count: 80 },
        { file: 'math_v1.json', title: 'Mathematics', icon: '\uD83D\uDCCA', category: 'Science', count: 80 },
        { file: 'space_v1.json', title: 'Space & Astronomy', icon: '\uD83D\uDE80', category: 'Science', count: 80 },
        { file: 'mythology_v1.json', title: 'Mythology & Legends', icon: '\u2694\uFE0F', category: 'History', count: 80 },
        { file: 'music_v1.json', title: 'Music & Artists', icon: '\uD83C\uDFB8', category: 'Entertainment', count: 80 },
        { file: 'literature_v1.json', title: 'Literature & Books', icon: '\uD83D\uDCDA', category: 'Culture', count: 80 },
        { file: 'popculture_v1.json', title: 'Pop Culture', icon: '\uD83D\uDCFA', category: 'Entertainment', count: 80 },
        { file: 'videogames_v1.json', title: 'Video Games', icon: '\uD83C\uDFAE', category: 'Gaming', count: 80 },
        { file: 'language_v1.json', title: 'Language & Words', icon: '\uD83D\uDCAC', category: 'Culture', count: 80 }
    ];

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
        changePack: document.getElementById('changePack')
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

        // Calculate totals
        var totalQ = 0;
        var i;
        for (i = 0; i < PACK_REGISTRY.length; i++) {
            totalQ += PACK_REGISTRY[i].count;
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
            card.setAttribute('data-pack', pack.file);
            card.innerHTML =
                '<div class="pack-icon">' + pack.icon + '</div>' +
                '<div class="pack-info">' +
                    '<div class="pack-name">' + pack.title + '</div>' +
                    '<div class="pack-meta">' +
                        '<span class="pack-category">' + pack.category + '</span>' +
                        '<span class="pack-count">' + pack.count + ' Q</span>' +
                    '</div>' +
                '</div>';

            (function(packFile) {
                card.addEventListener('click', function() {
                    loadAndStartPack(packFile);
                });
            })(pack.file);

            dom.packGrid.appendChild(card);
        }
    }

    function loadAndStartPack(packFile) {
        // Show loading state
        if (dom.packGrid) {
            dom.packGrid.innerHTML = '<div class="loading-state">Loading pack...</div>';
        }

        fetch('packs/' + packFile)
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load pack');
                return response.json();
            })
            .then(function(data) {
                currentPackData = data;

                // Switch to game view
                if (dom.packSelector) dom.packSelector.classList.add('hidden');
                if (dom.gameContainer) dom.gameContainer.classList.remove('hidden');

                dom.packTitle.textContent = currentPackData.meta.title.toUpperCase();

                setupEngine();
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

        engine.loadPack(currentPackData);
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

        // Change Pack
        if (dom.changePack) {
            dom.changePack.addEventListener('click', function(e) {
                e.preventDefault();
                if (engine && engine.timer) clearInterval(engine.timer);
                dom.endScreen.classList.add('hidden');
                renderPackSelector();
            });
        }
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

        // Highlight Buttons
        var correctBtn = dom.answers[data.correctAnswer];
        if (correctBtn) correctBtn.classList.add('correct');

        if (!data.correct && !data.timeOut && data.selected) {
            var selectedBtn = dom.answers[data.selected];
            if (selectedBtn) selectedBtn.classList.add('incorrect');
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
