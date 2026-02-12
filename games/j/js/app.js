document.addEventListener('DOMContentLoaded', function() {
    // Pack Registry - will be loaded from manifest
    var MANIFEST = { groups: [], packs: [] };

    // DOM Elements
    var dom = {
        // Pack Selector
        packSelector: document.getElementById('packSelector'),
        packGrid: document.getElementById('packGrid'),
        packSearch: document.getElementById('packSearch'),
        totalQuestions: document.getElementById('totalQuestions'),
        totalPacks: document.getElementById('totalPacks'),
        customGameBtn: document.getElementById('customGameBtn'),
        // Setup Modal
        setupModal: document.getElementById('setupModal'),
        setupTitle: document.getElementById('setupTitle'),
        startGameBtn: document.getElementById('startGameBtn'),
        cancelSetupBtn: document.getElementById('cancelSetupBtn'),
        limitOptions: document.querySelectorAll('input[name="qLimit"]'),
        percentToggle: document.getElementById('percentToggle'),
        // Multi-Pack Elements
        multiPackSelection: document.getElementById('multiPackSelection'),
        multiPackList: document.getElementById('multiPackList'),
        packLimitRange: document.getElementById('packLimitRange'),
        packLimitDisplay: document.getElementById('packLimitDisplay'),
        // History
        historyPlaceholder: document.getElementById('historyPlaceholder'),
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
        scoreLabel: document.getElementById('scoreLabel'),
        finalCorrect: document.getElementById('finalCorrect'),
        finalStreak: document.getElementById('finalStreak'),
        restartBtn: document.getElementById('restartBtn'),
        changePack: document.getElementById('changePack'),
        backToPacksBtn: document.getElementById('backToPacksBtn')
    };

    var engine = null;
    var currentPackData = null;
    var currentPackFile = null; // null if custom game
    var isCustomGame = false;
    var gameSettings = {
        limit: 10,
        showPercent: false
    };

    // Show pack selector on load
    renderPackSelector();
    bindEvents(); // Bind controls immediately

    function renderPackSelector() {
        // Show selector, hide game
        if (dom.packSelector) dom.packSelector.classList.remove('hidden');
        if (dom.gameContainer) dom.gameContainer.classList.add('hidden');
        if (dom.endScreen) dom.endScreen.classList.add('hidden');
        if (dom.setupModal) dom.setupModal.classList.add('hidden');

        // Check if registry is loaded
        if (MANIFEST.packs.length === 0) {
            if (dom.packGrid) {
                dom.packGrid.innerHTML = '<div class="loading-state">Loading packs...</div>';
            }

            fetch('packs/manifest.json')
                .then(function(response) {
                    if (!response.ok) throw new Error('Failed to load manifest');
                    return response.json();
                })
                .then(function(data) {
                    // Normalize data structure if needed
                    if (Array.isArray(data)) {
                        MANIFEST.packs = data; // Legacy format
                    } else {
                        MANIFEST = data; // New format
                    }

                    renderPackSelector(); // Re-render with data

                    // Check URL for pack
                    const params = new URLSearchParams(window.location.search);
                    const packPath = params.get('pack');
                    if (packPath) {
                        // Validate path against registry
                        const isValid = MANIFEST.packs.some(p => p.path === packPath);
                        if (isValid) {
                            openSetupModal(packPath, true);
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
        for (i = 0; i < MANIFEST.packs.length; i++) {
            totalQ += (MANIFEST.packs[i].count || 0);
        }
        if (dom.totalQuestions) dom.totalQuestions.textContent = totalQ;
        if (dom.totalPacks) dom.totalPacks.textContent = MANIFEST.packs.length;

        // Render groups and packs
        renderGroups('');

        // Search handler
        if (dom.packSearch) {
            dom.packSearch.addEventListener('input', function() {
                renderGroups(this.value.toLowerCase());
            });
        }
    }

    function renderGroups(searchTerm) {
        if (!dom.packGrid) return;
        dom.packGrid.innerHTML = '';

        // If legacy manifest (no groups defined), create a default group
        var groups = MANIFEST.groups || [{id: 'default', title: 'All Packs', icon: '', description: ''}];
        var packs = MANIFEST.packs;

        groups.forEach(function(group) {
            // Filter packs for this group
            var groupPacks = packs.filter(function(p) {
                if (MANIFEST.groups && MANIFEST.groups.length > 0) {
                    // Normalize legacy/missing groupIds to 'niche' or similar if needed, or strict match
                    return p.groupId === group.id;
                }
                return true;
            });

            // Apply search filter
            if (searchTerm) {
                groupPacks = groupPacks.filter(function(p) {
                    return p.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                           (p.category && p.category.toLowerCase().indexOf(searchTerm) !== -1);
                });
            }

            if (groupPacks.length === 0) return; // Skip empty groups

            // Render Group Header
            var groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.innerHTML = `
                <h2>${group.icon || ''} ${group.title}</h2>
                <p>${group.description || ''}</p>
            `;
            // Add style for full-width header
            groupHeader.style.gridColumn = "1 / -1";
            groupHeader.style.marginTop = "20px";
            groupHeader.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            groupHeader.style.paddingBottom = "5px";

            dom.packGrid.appendChild(groupHeader);

            // Render Packs
            groupPacks.forEach(function(pack) {
                var card = document.createElement('button');
                card.className = 'pack-card';
                card.setAttribute('data-pack', pack.path);

                // Get high score
                var best = ScoreManager.getHighScore(pack.id);
                var bestHtml = best > 0 ? `<div class="pack-best">Best: ${best}</div>` : '';

                card.innerHTML =
                    '<div class="pack-icon">' + (pack.icon || '\u2753') + '</div>' +
                    '<div class="pack-info">' +
                        '<div class="pack-name">' + pack.title + '</div>' +
                        '<div class="pack-meta">' +
                            '<span class="pack-category">' + (pack.category || 'General') + '</span>' +
                            '<span class="pack-count">' + (pack.count || '?') + ' Q</span>' +
                        '</div>' +
                    '</div>' + bestHtml;

                card.addEventListener('click', function() {
                    openSetupModal(pack.path);
                });

                dom.packGrid.appendChild(card);
            });
        });
    }

    // --- Score Manager ---
    var ScoreManager = {
        saveScore: function(packId, score) {
            if (!packId || packId === 'custom_mix') return; // Don't save for custom mix (or maybe separate logic)
            var key = 'j_score_' + packId;
            var current = this.getHighScore(packId);
            if (score > current) {
                localStorage.setItem(key, score);
            }

            // Save history log
            var historyKey = 'j_history_' + packId;
            var history = this.getHistory(packId);
            history.unshift({date: new Date().toISOString(), score: score});
            if (history.length > 5) history.pop(); // Keep last 5
            localStorage.setItem(historyKey, JSON.stringify(history));
        },
        getHighScore: function(packId) {
            var key = 'j_score_' + packId;
            return parseInt(localStorage.getItem(key) || '0', 10);
        },
        getHistory: function(packId) {
            var key = 'j_history_' + packId;
            try {
                return JSON.parse(localStorage.getItem(key) || '[]');
            } catch(e) { return []; }
        },
        resetPackHistory: function(packId) {
            localStorage.removeItem('j_score_' + packId);
            localStorage.removeItem('j_history_' + packId);
        }
    };

    function openSetupModal(packFile, skipPushState) {
        currentPackFile = packFile; // If null, it's custom game

        // Reset/Hide UI elements based on mode
        if (packFile === 'custom') {
            // CUSTOM GAME MODE
            isCustomGame = true;
            dom.setupTitle.textContent = "CUSTOM MIX";
            dom.multiPackSelection.classList.remove('hidden');
            if (dom.historyPlaceholder) dom.historyPlaceholder.classList.add('hidden');

            // Populate Multi-Pack List
            renderMultiPackList();

            // Update URL for custom game? Maybe not needed, or '?pack=custom'
            if (!skipPushState) {
                const url = new URL(window.location);
                url.searchParams.delete('pack'); // Don't track custom state in URL for now (complex to restore)
                history.pushState(null, '', url);
            }
        } else {
            // SINGLE PACK MODE
            isCustomGame = false;
            dom.multiPackSelection.classList.add('hidden');
            if (dom.historyPlaceholder) dom.historyPlaceholder.classList.remove('hidden');

            // Find pack metadata
            var packMeta = MANIFEST.packs.find(p => p.path === packFile);
            if (packMeta) {
                dom.setupTitle.textContent = packMeta.title.toUpperCase();
                renderHistory(packMeta);
            } else {
                dom.setupTitle.textContent = "GAME SETUP";
            }

            // Update URL if not skipped
            if (!skipPushState) {
                const url = new URL(window.location);
                url.searchParams.set('pack', packFile);
                history.pushState({pack: packFile}, '', url);
            }
        }

        // Show modal
        dom.setupModal.classList.remove('hidden');
    }

    function renderMultiPackList() {
        dom.multiPackList.innerHTML = '';

        MANIFEST.packs.forEach(function(pack) {
            var label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.padding = '5px 0';
            label.style.cursor = 'pointer';

            label.innerHTML = `
                <input type="checkbox" name="mixPack" value="${pack.path}" style="margin-right: 10px;">
                <span style="flex:1;">${pack.title}</span>
                <span style="font-size:0.8rem; opacity:0.6;">${pack.category}</span>
            `;
            dom.multiPackList.appendChild(label);
        });

        // Update range slider max based on selection
        updatePackLimitRange();

        // Listen for checkbox changes
        var checkboxes = dom.multiPackList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(cb) {
            cb.addEventListener('change', updatePackLimitRange);
        });
    }

    function updatePackLimitRange() {
        var checked = dom.multiPackList.querySelectorAll('input[type="checkbox"]:checked');
        var count = checked.length;
        var range = dom.packLimitRange;

        if (count === 0) {
            range.max = 1;
            range.value = 1;
            range.disabled = true;
            dom.packLimitDisplay.textContent = "0";
        } else {
            range.disabled = false;
            range.max = count;
            range.value = count; // Default to all selected
            dom.packLimitDisplay.textContent = "ALL";
        }

        range.oninput = function() {
            if (parseInt(this.value) === parseInt(this.max)) {
                dom.packLimitDisplay.textContent = "ALL";
            } else {
                dom.packLimitDisplay.textContent = this.value;
            }
        };
    }

    function renderHistory(packMeta) {
        var best = ScoreManager.getHighScore(packMeta.id);
        var history = ScoreManager.getHistory(packMeta.id);

        var html = `<label class="setup-label">RECORDS</label>
                    <div class="history-box" style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                            <span>High Score:</span>
                            <span style="color:var(--accent); font-weight:bold;">${best}</span>
                        </div>
                        ${history.length > 0 ? '<hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin: 5px 0;">' : ''}
                        <div class="history-list" style="font-size: 0.8rem; color: var(--text-secondary);">`;

        history.forEach(function(h) {
            var d = new Date(h.date).toLocaleDateString();
            html += `<div style="display:flex; justify-content:space-between;"><span>${d}</span><span>${h.score} pts</span></div>`;
        });

        html += `</div>
                 <button id="resetHistoryBtn" style="width:100%; margin-top:10px; background:none; border:1px solid #ef4444; color:#ef4444; padding:5px; border-radius:4px; cursor:pointer; font-size:0.8rem;">RESET HISTORY</button>
                 </div>`;

        dom.historyPlaceholder.innerHTML = html;

        // Bind Reset
        document.getElementById('resetHistoryBtn').addEventListener('click', function() {
            if(confirm("Clear records for this pack?")) {
                ScoreManager.resetPackHistory(packMeta.id);
                renderHistory(packMeta); // Re-render in place
            }
        });
    }

    function startGame() {
        // Get settings common to both modes
        var limit = 10;
        var selectedLimit = document.querySelector('input[name="qLimit"]:checked');
        if (selectedLimit) {
            limit = parseInt(selectedLimit.value, 10);
            if (limit === 0) limit = 1000; // "All"
        }
        gameSettings.limit = limit;
        gameSettings.showPercent = dom.percentToggle.checked;

        dom.setupModal.classList.add('hidden');
        if (dom.packGrid) {
            dom.packGrid.innerHTML = '<div class="loading-state">Loading pack...</div>';
        }

        if (isCustomGame) {
            startCustomGame();
        } else {
            startSinglePackGame();
        }
    }

    function startSinglePackGame() {
        if (!currentPackFile) return;

        fetch(currentPackFile)
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load pack');
                return response.json();
            })
            .then(function(data) {
                currentPackData = data;
                initGameUI("single");
            })
            .catch(handleLoadError);
    }

    function startCustomGame() {
        var checked = Array.from(dom.multiPackList.querySelectorAll('input[type="checkbox"]:checked'));
        if (checked.length === 0) {
            alert("Please select at least one pack.");
            openSetupModal('custom');
            return;
        }

        var selectedPaths = checked.map(cb => cb.value);
        var packLimit = parseInt(dom.packLimitRange.value);

        // If limit < selected count, shuffle and slice
        if (packLimit < selectedPaths.length) {
            selectedPaths = selectedPaths.sort(() => 0.5 - Math.random()).slice(0, packLimit);
        }

        // Fetch all selected packs
        var promises = selectedPaths.map(path => fetch(path).then(r => r.json()));

        Promise.all(promises).then(function(packs) {
            // Merge packs
            var allQuestions = [];
            packs.forEach(function(p) {
                if (p.questions) allQuestions = allQuestions.concat(p.questions);
            });

            currentPackData = {
                meta: {
                    id: 'custom_mix',
                    title: 'Custom Mix'
                },
                questions: allQuestions
            };

            initGameUI("custom");
        }).catch(handleLoadError);
    }

    function initGameUI(mode) {
        // Switch to game view
        if (dom.packSelector) dom.packSelector.classList.add('hidden');
        if (dom.gameContainer) dom.gameContainer.classList.remove('hidden');

        dom.packTitle.textContent = currentPackData.meta.title.toUpperCase();

        setupEngine();
        engine.loadPack(currentPackData);
        engine.startRound();
    }

    function handleLoadError(e) {
        console.error(e);
        if (dom.packGrid) {
            dom.packGrid.innerHTML = '<div class="loading-state error">Failed to load pack. <button onclick="location.reload()">Retry</button></div>';
        }
    }

    var eventsBound = false;

    function setupEngine() {
        engine = new QuizEngine({
            limit: gameSettings.limit,
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

        // Setup Modal Events
        dom.startGameBtn.addEventListener('click', startGame);

        dom.cancelSetupBtn.addEventListener('click', function() {
            dom.setupModal.classList.add('hidden');
            quitToPacks();
        });

        // Custom Game Button
        if (dom.customGameBtn) {
            dom.customGameBtn.addEventListener('click', function() {
                openSetupModal('custom');
            });
        }

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

            // If custom game, reuse the merged data? Yes.
            // If we wanted to re-roll random packs, we'd need to store the selection.
            // For now, re-using merged data is standard behavior.
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
                // If we popped back into a pack state, show modal
                // Don't auto-start, just show setup
                openSetupModal(packPath, true);
            } else {
                // We popped back to root
                dom.setupModal.classList.add('hidden');
                quitToPacks(true); // Skip pushing state
            }
        });
    }

    function quitToPacks(skipUrlUpdate) {
        if (engine && engine.timer) clearInterval(engine.timer);
        dom.endScreen.classList.add('hidden');
        dom.packSelector.classList.remove('hidden');
        dom.gameContainer.classList.add('hidden'); // Ensure game is hidden
        dom.setupModal.classList.add('hidden');

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
        dom.scoreValue.textContent = data.score; // Keeping points for running score
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

            // Reset classes
            btn.className = 'answer-btn';

            // Clear previous content
            btn.innerHTML = '';

            // Create Label (A, B, C, D)
            var label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = key;
            btn.appendChild(label);

            if (optionText) {
                // Check for image URL
                // Simple heuristic: ends with .jpg, .png, .gif, .webp, or contains /flagcdn.com/
                var isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(optionText) || optionText.indexOf('flagcdn.com') !== -1;

                if (isImage) {
                    var img = document.createElement('img');
                    img.src = optionText;
                    img.className = 'option-image';
                    img.alt = "Option " + key;
                    btn.appendChild(img);
                } else {
                    var text = document.createElement('span');
                    text.className = 'option-text';
                    text.textContent = optionText;
                    btn.appendChild(text);
                }
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        }

        // Media (Question Image)
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
            if (correctBtn) correctBtn.classList.add('pop-correct');
             if (!data.correct && !data.timeOut && data.selected) {
                var selectedBtn = dom.answers[data.selected];
                if (selectedBtn) selectedBtn.classList.add('incorrect');
            }
        } else {
            // Show feedback overlay
            dom.feedbackArea.classList.remove('hidden');

            if (data.correct) {
                dom.feedbackTitle.textContent = "CORRECT!";
                dom.feedbackTitle.style.color = "var(--correct)";
                dom.feedbackText.textContent = "";
            } else if (data.timeOut) {
                dom.feedbackTitle.textContent = "TIME'S UP!";
                dom.feedbackTitle.style.color = "var(--incorrect)";
                dom.feedbackText.textContent = "The correct answer was (" + data.correctAnswer + ")";
            } else {
                dom.feedbackTitle.textContent = "WRONG!";
                dom.feedbackTitle.style.color = "var(--incorrect)";
                dom.feedbackText.textContent = "The correct answer was (" + data.correctAnswer + ")";
            }

            if (correctBtn) correctBtn.classList.add('correct');
            if (!data.correct && !data.timeOut && data.selected) {
                var selectedBtn = dom.answers[data.selected];
                if (selectedBtn) selectedBtn.classList.add('incorrect');
            }
        }

        if (!engine.settings.lockFastForward) {
            dom.nextBtn.disabled = false;
        }

        // Update Stats
        if (data.score !== undefined) dom.scoreValue.textContent = data.score;
        if (data.streak !== undefined) dom.streakValue.textContent = data.streak;
    }

    function showEndScreen(data) {
        dom.progressBar.style.width = '100%';
        dom.endScreen.classList.remove('hidden');

        // Save Score (only if single pack)
        if (!isCustomGame && currentPackData && currentPackData.meta && currentPackData.meta.id) {
            ScoreManager.saveScore(currentPackData.meta.id, data.score);
        }

        if (gameSettings.showPercent) {
            var pct = Math.round((data.score / data.total) * 100);
            dom.finalScore.textContent = pct + '%';
            dom.scoreLabel.textContent = 'GRADE';
        } else {
            dom.finalScore.textContent = data.score;
            dom.scoreLabel.textContent = 'PTS';
        }

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
