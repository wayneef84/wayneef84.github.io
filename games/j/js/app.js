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
        revampToggle: document.getElementById('revampToggle'), // NEW
        // Voice Settings
        voiceToggle: document.getElementById('voiceToggle'),
        autoReadToggle: document.getElementById('autoReadToggle'),
        speechRate: document.getElementById('speechRate'),
        speechPitch: document.getElementById('speechPitch'),
        rateValue: document.getElementById('rateValue'),
        pitchValue: document.getElementById('pitchValue'),
        // Time Settings
        timerDuration: document.getElementById('timerDuration'),
        carryOverMax: document.getElementById('carryOverMax'),
        timeValue: document.getElementById('timeValue'),
        carryValue: document.getElementById('carryValue'),
        // Multi-Pack Elements
        multiPackSelection: document.getElementById('multiPackSelection'),
        multiPackList: document.getElementById('multiPackList'),
        packLimitRange: document.getElementById('packLimitRange'),
        packLimitDisplay: document.getElementById('packLimitDisplay'),
        // History
        historyPlaceholder: document.getElementById('historyTop'),
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
        feedbackBackdrop: document.getElementById('feedbackBackdrop'),
        feedbackArea: document.getElementById('feedbackArea'),
        feedbackTitle: document.getElementById('feedbackTitle'),
        feedbackText: document.getElementById('feedbackText'),
        feedbackNextBtn: document.getElementById('feedbackNextBtn'),
        endScreen: document.getElementById('endScreen'),
        finalScore: document.getElementById('finalScore'),
        scoreLabel: document.getElementById('scoreLabel'),
        finalCorrect: document.getElementById('finalCorrect'),
        finalStreak: document.getElementById('finalStreak'),
        restartBtn: document.getElementById('restartBtn'),
        changePack: document.getElementById('changePack'),
        backToPacksBtn: document.getElementById('backToPacksBtn'),
        // Revamp Elements
        powerupBar: document.getElementById('powerupBar'),
        buffsContainer: document.getElementById('buffsContainer'),
        powerupBtns: document.querySelectorAll('.powerup-btn')
    };

    var engine = null;
    var currentPackData = null;
    var currentPackFile = null; // null if custom game
    var isCustomGame = false;
    var gameSettings = {
        limit: 10,
        showPercent: false,
        voiceMode: false,
        autoRead: false,
        speechRate: 1.0,
        speechPitch: 1.0,
        timerDuration: 15,
        carryOverMax: 0,
        revampMode: false // NEW
    };

    // Speaker Utility
    var Speaker = {
        synth: window.speechSynthesis,
        speak: function(text) {
            if (!this.synth) return;
            this.cancel(); // Stop previous
            if (!text) return;

            var utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = gameSettings.speechRate;
            utterance.pitch = gameSettings.speechPitch;
            this.synth.speak(utterance);
        },
        cancel: function() {
            if (this.synth) this.synth.cancel();
        }
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
                    if (Array.isArray(data)) {
                        MANIFEST.packs = data; // Legacy format
                    } else {
                        MANIFEST = data; // New format
                    }

                    renderPackSelector();

                    const params = new URLSearchParams(window.location.search);
                    const packPath = params.get('pack');
                    if (packPath) {
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

        var totalQ = 0;
        var i;
        for (i = 0; i < MANIFEST.packs.length; i++) {
            totalQ += (MANIFEST.packs[i].count || 0);
        }
        if (dom.totalQuestions) dom.totalQuestions.textContent = totalQ;
        if (dom.totalPacks) dom.totalPacks.textContent = MANIFEST.packs.length;

        renderGroups('');

        if (dom.packSearch) {
            dom.packSearch.addEventListener('input', function() {
                renderGroups(this.value.toLowerCase());
            });
        }
    }

    function renderGroups(searchTerm) {
        if (!dom.packGrid) return;
        dom.packGrid.innerHTML = '';

        var groups = MANIFEST.groups || [{id: 'default', title: 'All Packs', icon: '', description: ''}];
        var packs = MANIFEST.packs;

        groups.forEach(function(group) {
            var groupPacks = packs.filter(function(p) {
                if (MANIFEST.groups && MANIFEST.groups.length > 0) {
                    return p.groupId === group.id;
                }
                return true;
            });

            if (searchTerm) {
                groupPacks = groupPacks.filter(function(p) {
                    return p.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                           (p.category && p.category.toLowerCase().indexOf(searchTerm) !== -1);
                });
            }

            if (groupPacks.length === 0) return;

            var groupHeader = document.createElement('div');
            groupHeader.className = 'group-header';
            groupHeader.innerHTML = `
                <h2>${group.icon || ''} ${group.title}</h2>
                <p>${group.description || ''}</p>
            `;
            groupHeader.style.gridColumn = "1 / -1";
            groupHeader.style.marginTop = "20px";
            groupHeader.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            groupHeader.style.paddingBottom = "5px";

            dom.packGrid.appendChild(groupHeader);

            groupPacks.forEach(function(pack) {
                var card = document.createElement('button');
                card.className = 'pack-card';
                card.setAttribute('data-pack', pack.path);

                var best = ScoreManager.getHighScore(pack.id);
                var bestHtml = best > 0 ? `<div class="pack-best">Best: ${best}</div>` : '';

                card.innerHTML =
                    '<div class="pack-icon">' + (pack.icon || '\u2753') + '</div>' +
                    '<div class="pack-info">' +
                        '<div class="pack-name">' + pack.title + '</div>' +
                        '<div class="pack-meta">' +
                            '<span class="pack-category">' + (group.title || 'General') + '</span>' +
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

    var ScoreManager = {
        saveScore: function(packId, score) {
            if (!packId || packId === 'custom_mix') return;
            var key = 'j_score_' + packId;
            var current = this.getHighScore(packId);
            if (score > current) {
                localStorage.setItem(key, score);
            }
            var historyKey = 'j_history_' + packId;
            var history = this.getHistory(packId);
            history.unshift({date: new Date().toISOString(), score: score});
            if (history.length > 5) history.pop();
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
        currentPackFile = packFile;

        if (packFile === 'custom') {
            isCustomGame = true;
            dom.setupTitle.textContent = "CUSTOM MIX";
            dom.multiPackSelection.classList.remove('hidden');
            if (dom.historyPlaceholder) dom.historyPlaceholder.classList.add('hidden');
            renderMultiPackList();
            if (!skipPushState) {
                const url = new URL(window.location);
                url.searchParams.delete('pack');
                history.pushState(null, '', url);
            }
        } else {
            isCustomGame = false;
            dom.multiPackSelection.classList.add('hidden');
            if (dom.historyPlaceholder) dom.historyPlaceholder.classList.remove('hidden');
            var packMeta = MANIFEST.packs.find(p => p.path === packFile);
            if (packMeta) {
                dom.setupTitle.textContent = packMeta.title.toUpperCase();
                renderHistory(packMeta);
            } else {
                dom.setupTitle.textContent = "GAME SETUP";
            }
            if (!skipPushState) {
                const url = new URL(window.location);
                url.searchParams.set('pack', packFile);
                history.pushState({pack: packFile}, '', url);
            }
        }
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
            var group = MANIFEST.groups.find(g => g.id === pack.groupId);
            var groupName = group ? group.title : (pack.category || 'General');
            label.innerHTML = `
                <input type="checkbox" name="mixPack" value="${pack.path}" style="margin-right: 10px;">
                <span style="flex:1;">${pack.title}</span>
                <span style="font-size:0.8rem; opacity:0.6;">${groupName}</span>
            `;
            dom.multiPackList.appendChild(label);
        });
        updatePackLimitRange();
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
            range.value = count;
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
        if (!dom.historyPlaceholder) return;

        var best = ScoreManager.getHighScore(packMeta.id);
        var history = ScoreManager.getHistory(packMeta.id);

        if (history.length === 0) {
            dom.historyPlaceholder.innerHTML = '';
            return;
        }

        // Show last 3 records
        var recent = history.slice(-3).reverse();
        var html = '<label class="setup-label">Recent Records</label>';

        recent.forEach(function(h) {
            var d = new Date(h.date).toLocaleDateString();
            html += '<div class="history-item">' +
                    '<span class="score">' + h.score + ' pts</span>' +
                    '<span class="date">' + d + '</span>' +
                    '</div>';
        });

        if (dom.historyPlaceholder) {
            dom.historyPlaceholder.innerHTML = html;
        }
    }

    function startGame() {
        var limit = 10;
        var selectedLimit = document.querySelector('input[name="qLimit"]:checked');
        if (selectedLimit) {
            limit = parseInt(selectedLimit.value, 10);
            if (limit === 0) limit = 1000;
        }
        gameSettings.limit = limit;
        gameSettings.showPercent = dom.percentToggle.checked;
        gameSettings.revampMode = dom.revampToggle.checked; // NEW

        if (dom.voiceToggle) gameSettings.voiceMode = dom.voiceToggle.checked;
        if (dom.autoReadToggle) gameSettings.autoRead = dom.autoReadToggle.checked;
        if (dom.speechRate) gameSettings.speechRate = parseFloat(dom.speechRate.value);
        if (dom.speechPitch) gameSettings.speechPitch = parseFloat(dom.speechPitch.value);
        if (dom.timerDuration) gameSettings.timerDuration = parseInt(dom.timerDuration.value, 10);
        if (dom.carryOverMax) gameSettings.carryOverMax = parseInt(dom.carryOverMax.value, 10);

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
        if (packLimit < selectedPaths.length) {
            selectedPaths = selectedPaths.sort(() => 0.5 - Math.random()).slice(0, packLimit);
        }
        var promises = selectedPaths.map(path => fetch(path).then(r => r.json()));
        Promise.all(promises).then(function(packs) {
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
            timer: gameSettings.timerDuration,
            carryOverMax: gameSettings.carryOverMax,
            revampMode: gameSettings.revampMode, // NEW
            onTick: updateTimer,
            onQuestionLoaded: renderQuestion,
            onFeedback: showFeedback,
            onGameEnd: showEndScreen,
            onLootDrop: showLootDrop // NEW
        });
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;

        dom.startGameBtn.addEventListener('click', startGame);
        dom.cancelSetupBtn.addEventListener('click', function() {
            dom.setupModal.classList.add('hidden');
            quitToPacks();
        });
        if (dom.customGameBtn) {
            dom.customGameBtn.addEventListener('click', function() {
                openSetupModal('custom');
            });
        }
        if (dom.speechRate) {
            dom.speechRate.addEventListener('input', function() {
                if (dom.rateValue) dom.rateValue.textContent = this.value + 'x';
            });
        }
        if (dom.speechPitch) {
            dom.speechPitch.addEventListener('input', function() {
                if (dom.pitchValue) dom.pitchValue.textContent = this.value;
            });
        }
        if (dom.timerDuration) {
            dom.timerDuration.addEventListener('input', function() {
                var val = parseInt(this.value, 10);
                if (dom.timeValue) dom.timeValue.textContent = formatTime(val) + (val < 60 ? 's' : '');
            });
        }
        if (dom.carryOverMax) {
            dom.carryOverMax.addEventListener('input', function() {
                var val = parseInt(this.value, 10);
                if (dom.carryValue) dom.carryValue.textContent = formatTime(val) + (val < 60 ? 's' : '');
            });
        }

        var keys = Object.keys(dom.answers);
        var k;
        for (k = 0; k < keys.length; k++) {
            (function(key) {
                dom.answers[key].addEventListener('click', function() {
                    if (gameSettings.voiceMode) {
                        if (engine.pendingSelection === key) {
                            engine.selectAnswer(key);
                            Speaker.cancel();
                        } else {
                            engine.setPendingSelection(key);
                            var txt = dom.answers[key].querySelector('.option-text')?.textContent || "Image Option";
                            Speaker.speak(txt);
                            updatePendingVisuals(key);
                        }
                    } else {
                        engine.selectAnswer(key);
                    }
                });
            })(keys[k]);
        }

        dom.lockToggle.addEventListener('change', function(e) {
            engine.settings.lockFastForward = e.target.checked;
            updateNextButtonState();
            if (engine.settings.lockFastForward && engine.state === 'WAITING_FOR_NEXT') {
                engine.triggerFastForward();
            }
        });

        dom.nextBtn.addEventListener('click', function() {
            engine.triggerFastForward();
        });

        // Feedback Next Button (Inside Menu)
        if (dom.feedbackNextBtn) {
            dom.feedbackNextBtn.addEventListener('click', function() {
                engine.triggerFastForward();
            });
        }

        // Backdrop Click (Escapeable)
        if (dom.feedbackBackdrop) {
            dom.feedbackBackdrop.addEventListener('click', function(e) {
                // If clicked on backdrop itself (not children)
                if (e.target === dom.feedbackBackdrop) {
                     // Check if only "Next" is available (simple mode)
                     // For now, always hide. If we add more options, check logic here.
                     dom.feedbackBackdrop.classList.add('hidden');
                }
            });
        }

        dom.restartBtn.addEventListener('click', function() {
            dom.endScreen.classList.add('hidden');
            engine.loadPack(currentPackData);
            engine.startRound();
        });

        if (dom.changePack) {
            dom.changePack.addEventListener('click', function(e) {
                e.preventDefault();
                quitToPacks(false);
            });
        }

        if (dom.backToPacksBtn) {
            dom.backToPacksBtn.addEventListener('click', function() {
                if(confirm("Quit current game and return to pack selection?")) {
                    quitToPacks(false);
                }
            });
        }

        window.addEventListener('popstate', function(event) {
            const params = new URLSearchParams(window.location.search);
            const packPath = params.get('pack');
            if (packPath) {
                openSetupModal(packPath, true);
            } else {
                dom.setupModal.classList.add('hidden');
                quitToPacks(true);
            }
        });

        // POWERUP BINDINGS (NEW)
        dom.powerupBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.dataset.type;
                const result = engine.activatePowerUp(type);
                if (result && result.success) {
                    // Update visuals for specific powerups
                    if (type === 'fiftyFifty') {
                        result.remove.forEach(k => {
                            const b = dom.answers[k];
                            b.disabled = true;
                            b.style.opacity = '0.3';
                        });
                    } else if (type === 'askAudience') {
                        showAudienceOverlay(result.distribution);
                    } else if (type === 'redo') {
                        this.classList.add('active'); // Highlight Redo as active
                    }
                    updatePowerUpUI(engine.powerups);
                }
            });
        });
    }

    function quitToPacks(skipUrlUpdate) {
        if (engine && engine.timer) clearInterval(engine.timer);
        Speaker.cancel();
        dom.endScreen.classList.add('hidden');
        dom.packSelector.classList.remove('hidden');
        dom.gameContainer.classList.add('hidden');
        dom.setupModal.classList.add('hidden');
        if (!skipUrlUpdate) {
            const url = new URL(window.location);
            url.searchParams.delete('pack');
            history.pushState(null, '', url);
        }
        renderPackSelector();
    }

    function formatTime(seconds) {
        seconds = parseInt(seconds, 10);
        if (isNaN(seconds)) return "0";
        if (seconds < 60) return seconds;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function updateTimer(seconds) {
        dom.timerDisplay.textContent = formatTime(seconds);
        if (seconds <= 5) {
            dom.timerDisplay.classList.add('danger');
        } else {
            dom.timerDisplay.classList.remove('danger');
        }
    }

    function renderQuestion(data) {
        if (dom.feedbackBackdrop) dom.feedbackBackdrop.classList.add('hidden');
        dom.feedbackArea.classList.add('hidden'); // Legacy check
        dom.mediaContainer.classList.add('hidden');
        dom.nextBtn.disabled = true;
        updateNextButtonState();

        var keys = Object.keys(dom.answers);
        keys.forEach(k => {
            dom.answers[k].classList.remove('pending-selection');
            dom.answers[k].style.opacity = '1';
            // Remove overlays
            const overlay = dom.answers[k].querySelector('.audience-overlay');
            if (overlay) overlay.remove();
        });

        // Reset Redo active state visually
        dom.powerupBtns.forEach(b => b.classList.remove('active'));

        dom.qCount.textContent = data.index + '/' + data.total;
        dom.questionText.textContent = data.question.text;

        if (gameSettings.autoRead) {
            Speaker.speak(data.question.text);
        }

        dom.scoreValue.textContent = data.score;
        dom.streakValue.textContent = data.streak;

        var progress = ((data.index - 1) / data.total) * 100;
        dom.progressBar.style.width = progress + '%';

        // Revamp UI Updates
        if (gameSettings.revampMode) {
            dom.powerupBar.classList.remove('hidden');
            dom.buffsContainer.classList.remove('hidden');
            updatePowerUpUI(data.powerups);
            updateBuffsUI(data.buffs);
        } else {
            dom.powerupBar.classList.add('hidden');
            dom.buffsContainer.classList.add('hidden');
        }

        // Render Options
        var i, key, btn, optionText;
        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            btn = dom.answers[key];
            optionText = data.question.options[key];
            btn.disabled = false;
            btn.className = 'answer-btn';
            btn.innerHTML = '';

            var label = document.createElement('span');
            label.className = 'option-label';
            label.textContent = key;
            btn.appendChild(label);

            if (optionText) {
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

        // Media (Image or Audio)
        dom.mediaContainer.innerHTML = '';
        if (data.question.media) {
            dom.mediaContainer.classList.remove('hidden');
            const media = data.question.media;
            // Check if audio
            if (media.endsWith('.mp3') || media.endsWith('.wav') || media.endsWith('.ogg')) {
                dom.mediaContainer.innerHTML = `
                    <div class="audio-wrapper">
                        <audio controls autoplay>
                            <source src="${media}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>`;
            } else {
                dom.mediaContainer.innerHTML = '<img src="' + media + '" alt="Question Media" style="max-width:100%; border-radius: 8px;">';
            }
        } else if (data.question.audio) { // Explicit audio field
             dom.mediaContainer.classList.remove('hidden');
             dom.mediaContainer.innerHTML = `
                    <div class="audio-wrapper">
                        <audio controls autoplay>
                            <source src="${data.question.audio}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>`;
        }
    }

    function updatePendingVisuals(selectedKey) {
        var keys = Object.keys(dom.answers);
        keys.forEach(k => {
            if (k === selectedKey) {
                dom.answers[k].classList.add('pending-selection');
            } else {
                dom.answers[k].classList.remove('pending-selection');
            }
        });
    }

    function showFeedback(data) {
        Speaker.cancel();

        // Handle Redo Feedback
        if (data.isRedo) {
            // Don't show full overlay, just indicate wrong selection
            var btn = dom.answers[data.selected];
            if (btn) {
                btn.classList.add('incorrect');
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }
            // Remove Redo active status from button
            dom.powerupBtns.forEach(b => b.classList.remove('active'));
            return;
        }

        var keys = Object.keys(dom.answers);
        var i;
        for (i = 0; i < keys.length; i++) {
            dom.answers[keys[i]].disabled = true;
            dom.answers[keys[i]].classList.remove('pending-selection');
        }

        var correctBtn = dom.answers[data.correctAnswer];

        if (engine.settings.lockFastForward) {
            if (correctBtn) correctBtn.classList.add('pop-correct');
             if (!data.correct && !data.timeOut && data.selected) {
                var selectedBtn = dom.answers[data.selected];
                if (selectedBtn) selectedBtn.classList.add('incorrect');
            }
        } else {
            if (dom.feedbackBackdrop) dom.feedbackBackdrop.classList.remove('hidden');
            dom.feedbackArea.classList.remove('hidden'); // Ensure content is visible within backdrop

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

        if (data.score !== undefined) dom.scoreValue.textContent = data.score;
        if (data.streak !== undefined) dom.streakValue.textContent = data.streak;
    }

    function showEndScreen(data) {
        dom.progressBar.style.width = '100%';
        dom.endScreen.classList.remove('hidden');
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

    // REVAMP FUNCTIONS (NEW)
    function updatePowerUpUI(powerups) {
        if (!powerups) return;
        dom.powerupBtns.forEach(btn => {
            const type = btn.dataset.type;
            const count = powerups[type] || 0;
            const countSpan = btn.querySelector('.count');
            if (countSpan) countSpan.textContent = count;
            btn.disabled = count <= 0;
        });
    }

    function updateBuffsUI(buffs) {
        if (!buffs) return;
        dom.buffsContainer.innerHTML = '';
        if (buffs.extraTime > 0) {
            const el = document.createElement('div');
            el.className = 'buff-tag';
            el.innerHTML = `<span>⏳</span> +10s (${buffs.extraTime})`;
            dom.buffsContainer.appendChild(el);
        }
    }

    function showLootDrop(data) {
        const toast = document.createElement('div');
        toast.className = 'loot-toast';
        toast.textContent = data.message;
        document.body.appendChild(toast);

        // Remove after animation
        setTimeout(() => toast.remove(), 2000);

        updatePowerUpUI(data.powerups);
        updateBuffsUI(data.buffs);
    }

    function showAudienceOverlay(distribution) {
        Object.keys(distribution).forEach(key => {
            const btn = dom.answers[key];
            if (btn) {
                const pct = distribution[key];
                const overlay = document.createElement('div');
                overlay.className = 'audience-overlay';
                overlay.textContent = pct + '%';
                btn.appendChild(overlay);
            }
        });
    }
});
