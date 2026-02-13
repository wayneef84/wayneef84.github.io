class QuizEngine {
    constructor(config) {
        // Settings defaults
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.history = [];
        this.streak = 0;
        this.maxStreak = 0;

        this.settings = {
            timerPerQuestion: config.timer || 15, // seconds
            maxCarryOver: config.carryOverMax || 0,
            totalQuestions: config.limit || 10,
            fastForward: false,
            lockFastForward: false,
            revampMode: config.revampMode || false
        };

        this.timer = null;
        this.timeLeft = 0;
        this.carriedTime = 0;
        this.pendingSelection = null; // Voice Mode

        // Revamp Mode State
        this.powerups = {
            fiftyFifty: 1,
            askAudience: 1,
            skip: 1,
            redo: 1
        };
        this.activeBuffs = {
            extraTime: 0 // rounds remaining
        };
        this.redoActive = false; // "Second Chance" logic

        // State Machine: INIT -> PLAYING -> WAITING_FOR_NEXT -> TRANSITIONING -> ENDED
        this.state = 'INIT';

        // Callback hooks
        this.onTick = config.onTick || (() => {});
        this.onQuestionLoaded = config.onQuestionLoaded || (() => {});
        this.onFeedback = config.onFeedback || (() => {});
        this.onGameEnd = config.onGameEnd || (() => {});
        this.onLootDrop = config.onLootDrop || (() => {}); // New callback
    }

    loadPack(jsonPack) {
        if (!jsonPack || !jsonPack.questions) {
            console.error("Invalid pack format");
            return;
        }

        const clones = JSON.parse(JSON.stringify(jsonPack.questions));
        clones.forEach(q => this.randomizeOptions(q));
        const shuffled = clones.sort(() => 0.5 - Math.random());
        this.questions = shuffled.slice(0, this.settings.totalQuestions);
    }

    randomizeOptions(question) {
        if (!question.options) return;
        const correctKey = question.correct;
        const correctValue = question.options[correctKey];
        const keys = Object.keys(question.options);
        const values = keys.map(k => question.options[k]);

        for (let i = values.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [values[i], values[j]] = [values[j], values[i]];
        }

        let newCorrectKey = correctKey;
        keys.forEach((key, index) => {
            question.options[key] = values[index];
            if (values[index] === correctValue) {
                newCorrectKey = key;
            }
        });
        question.correct = newCorrectKey;
    }

    startRound() {
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.history = [];
        this.carriedTime = 0;
        this.state = 'PLAYING';

        // Reset Powerups/Buffs for new game
        if (this.settings.revampMode) {
            this.powerups = { fiftyFifty: 1, askAudience: 1, skip: 1, redo: 1 };
            this.activeBuffs = { extraTime: 0 };
            this.redoActive = false;
        }

        this.nextQuestion();
    }

    nextQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        this.state = 'PLAYING';
        this.pendingSelection = null;
        this.redoActive = false; // Reset per question unless activated? Usually activated per use.
        // Actually if I activate Redo, it applies to this question.

        const currentQ = this.questions[this.currentIndex];

        // Time Logic
        let baseTime = this.settings.timerPerQuestion;

        // Apply Buffs
        if (this.activeBuffs.extraTime > 0) {
            baseTime += 10;
            this.activeBuffs.extraTime--;
        }

        this.timeLeft = baseTime + this.carriedTime;
        this.carriedTime = 0;

        this.onQuestionLoaded({
            question: currentQ,
            index: this.currentIndex + 1,
            total: this.questions.length,
            score: this.score,
            streak: this.streak,
            powerups: this.powerups, // Update UI
            buffs: this.activeBuffs
        });

        this.startTimer();
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        this.onTick(this.timeLeft);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.onTick(this.timeLeft);
            if (this.timeLeft <= 0) this.timeUp();
        }, 1000);
    }

    timeUp() {
        clearInterval(this.timer);
        this.carriedTime = 0;

        if (this.pendingSelection) {
            this.selectAnswer(this.pendingSelection);
            return;
        }

        this.recordHistory(this.questions[this.currentIndex], null, false, true);
        this.streak = 0;

        this.onFeedback({
            correct: false,
            timeOut: true,
            correctAnswer: this.questions[this.currentIndex].correct
        });

        this.handleTransition();
    }

    setPendingSelection(key) {
        if (this.state !== 'PLAYING') return;
        this.pendingSelection = key;
    }

    selectAnswer(selectedOption) {
        if (this.state !== 'PLAYING') return;

        // "Redo" Logic (Second Chance)
        const currentQ = this.questions[this.currentIndex];
        const isCorrect = currentQ.correct === selectedOption;

        if (!isCorrect && this.redoActive) {
            // Consume Redo
            this.redoActive = false;
            // Notify UI to disable this option but keep playing
            this.onFeedback({
                correct: false,
                selected: selectedOption,
                isRedo: true, // Signal to UI: "Try again!"
                correctAnswer: null // Don't reveal yet
            });
            return; // Don't end turn
        }

        if (this.timer) clearInterval(this.timer);

        this.recordHistory(currentQ, selectedOption, isCorrect, false);

        if (isCorrect) {
            let points = 100;
            if (this.streak >= 2) points = 150;
            this.score += points;
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;

            if (this.timeLeft > 0 && this.settings.maxCarryOver > 0) {
                this.carriedTime = Math.min(this.timeLeft, this.settings.maxCarryOver);
            } else {
                this.carriedTime = 0;
            }

            // LOOT DROP LOGIC
            if (this.settings.revampMode) {
                this.checkLootDrop(currentQ);
            }

        } else {
            this.streak = 0;
            this.carriedTime = 0;
        }

        this.onFeedback({
            correct: isCorrect,
            selected: selectedOption,
            correctAnswer: currentQ.correct,
            score: this.score,
            streak: this.streak
        });

        this.handleTransition();
    }

    checkLootDrop(question) {
        // Difficulty: 1 (Easy) to 10 (Hard). Default 5.
        // Formula: Higher difficulty = higher chance?
        // Let's say: Chance = Difficulty * 5%. (5 -> 25%, 10 -> 50%)
        // Or maybe just fix it at 30% for now.
        // User said: "Questions use their difficulty weights to determine if the chance they get power ups for the right answer."

        let difficulty = question.difficulty || 5;
        // If difficulty is string (e.g. "Hard"), map it? Current packs don't have it, so 5 is default.

        let chance = difficulty * 0.05; // 5 * 0.05 = 0.25 (25%)

        if (Math.random() < chance) {
            // Drop triggered!
            const lootTable = ['fiftyFifty', 'askAudience', 'skip', 'redo', 'buff_time'];
            const loot = lootTable[Math.floor(Math.random() * lootTable.length)];

            let message = "";

            if (loot === 'buff_time') {
                this.activeBuffs.extraTime += 3; // +10s for next 3 rounds
                message = "+10s (3 Rounds)";
            } else {
                this.powerups[loot]++;
                // Pretty names
                const names = { fiftyFifty: "50/50", askAudience: "Audience", skip: "Skip", redo: "Redo" };
                message = "+1 " + names[loot];
            }

            this.onLootDrop({
                loot: loot,
                message: message,
                powerups: this.powerups,
                buffs: this.activeBuffs
            });
        }
    }

    handleTransition() {
        if (this.settings.lockFastForward) {
            this.state = 'TRANSITIONING';
            setTimeout(() => {
                this.currentIndex++;
                this.nextQuestion();
            }, 800);
        } else {
            this.state = 'WAITING_FOR_NEXT';
        }
    }

    triggerFastForward() {
        if (this.state === 'TRANSITIONING' || this.state === 'ENDED') return;
        if (this.timer) clearInterval(this.timer);
        this.currentIndex++;
        this.nextQuestion();
    }

    // POWER UP METHODS
    activatePowerUp(type) {
        if (!this.settings.revampMode) return null;
        if (this.state !== 'PLAYING') return null;
        if (this.powerups[type] <= 0) return null;

        const currentQ = this.questions[this.currentIndex];

        if (type === 'skip') {
            this.powerups.skip--;
            if (this.timer) clearInterval(this.timer);
            // Treat as correct? Or just skip? User said "Skip".
            // If skip, maybe no points but preserve streak?
            // "Skip. And anything else you can think of."
            // I'll make it preserving streak but 0 points.
            this.streak; // Unchanged? Or increment? Unchanged seems fair.
            // Actually record history as skipped
            this.recordHistory(currentQ, "SKIP", null, false); // null correct means skipped

            this.handleTransition();
            return { success: true };
        }

        if (type === 'fiftyFifty') {
            // Return 2 incorrect options
            this.powerups.fiftyFifty--;
            const allKeys = Object.keys(currentQ.options);
            const correct = currentQ.correct;
            const wrongKeys = allKeys.filter(k => k !== correct);
            // Shuffle wrong keys and take 2
            const toRemove = wrongKeys.sort(() => 0.5 - Math.random()).slice(0, 2);
            return { success: true, remove: toRemove };
        }

        if (type === 'askAudience') {
            this.powerups.askAudience--;
            // Simulate: Correct has 50-80% chance. Rest distributed.
            const correct = currentQ.correct;
            const allKeys = Object.keys(currentQ.options);
            let result = {};
            let remaining = 100;

            // Give correct answer a big chunk
            let correctShare = Math.floor(Math.random() * 30) + 50; // 50-80
            result[correct] = correctShare;
            remaining -= correctShare;

            // Distribute rest
            const others = allKeys.filter(k => k !== correct);
            others.forEach((k, idx) => {
                if (idx === others.length - 1) {
                    result[k] = remaining;
                } else {
                    let share = Math.floor(Math.random() * remaining);
                    result[k] = share;
                    remaining -= share;
                }
            });
            return { success: true, distribution: result };
        }

        if (type === 'redo') {
            if (this.redoActive) return null; // Already active
            this.powerups.redo--;
            this.redoActive = true;
            return { success: true };
        }
    }

    recordHistory(question, selected, correct, timeOut) {
        this.history.push({
            id: question.id,
            text: question.text,
            selected: selected,
            correctAnswer: question.correct,
            isCorrect: correct,
            isTimeOut: timeOut
        });
    }

    endGame() {
        this.state = 'ENDED';
        if (this.timer) clearInterval(this.timer);
        this.onGameEnd({
            score: this.score,
            total: this.questions.length * 100,
            history: this.history,
            maxStreak: this.maxStreak
        });
    }
}

// Export for Node.js testing if module.exports is available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
}
