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
            timerPerQuestion: config.timer || 15, // seconds, default 15s per question
            totalQuestions: config.limit || 10,
            fastForward: false, // User can click 'Next' early
            lockFastForward: false // Auto-advance on select
        };

        this.timer = null;
        this.timeLeft = 0;

        // State Machine: INIT -> PLAYING -> WAITING_FOR_NEXT -> TRANSITIONING -> ENDED
        this.state = 'INIT';

        // Callback hooks
        this.onTick = config.onTick || (() => {});
        this.onQuestionLoaded = config.onQuestionLoaded || (() => {});
        this.onFeedback = config.onFeedback || (() => {});
        this.onGameEnd = config.onGameEnd || (() => {});
    }

    loadPack(jsonPack) {
        if (!jsonPack || !jsonPack.questions) {
            console.error("Invalid pack format");
            return;
        }

        // Shuffle and slice based on settings
        // Clone array to avoid mutating the original pack data
        const shuffled = [...jsonPack.questions].sort(() => 0.5 - Math.random());
        this.questions = shuffled.slice(0, this.settings.totalQuestions);
    }

    startRound() {
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.history = [];
        this.state = 'PLAYING';
        this.nextQuestion();
    }

    nextQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        this.state = 'PLAYING';
        const currentQ = this.questions[this.currentIndex];
        this.timeLeft = this.settings.timerPerQuestion;

        this.onQuestionLoaded({
            question: currentQ,
            index: this.currentIndex + 1,
            total: this.questions.length,
            score: this.score,
            streak: this.streak
        });

        this.startTimer();
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);

        // Initial tick
        this.onTick(this.timeLeft);

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    timeUp() {
        clearInterval(this.timer);
        this.recordHistory(this.questions[this.currentIndex], null, false, true); // timeOut = true
        this.streak = 0;

        this.onFeedback({
            correct: false,
            timeOut: true,
            correctAnswer: this.questions[this.currentIndex].correct
        });

        if (this.settings.lockFastForward) {
            this.state = 'TRANSITIONING';
            setTimeout(() => {
                this.currentIndex++;
                this.nextQuestion();
            }, 1500); // Slight delay even in fast mode to register fail
        } else {
            this.state = 'WAITING_FOR_NEXT';
        }
    }

    selectAnswer(selectedOption) {
        if (this.state !== 'PLAYING') return; // Prevent multiple clicks

        if (this.timer) clearInterval(this.timer);

        const currentQ = this.questions[this.currentIndex];
        const isCorrect = currentQ.correct === selectedOption;

        this.recordHistory(currentQ, selectedOption, isCorrect, false);

        if (isCorrect) {
            // Streak Multiplier: 3+ streak = 1.5x points (rounded)
            let points = 100;
            if (this.streak >= 2) { // 3rd correct answer in a row
                 points = 150;
            }
            this.score += points;
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        } else {
            this.streak = 0;
        }

        this.onFeedback({
            correct: isCorrect,
            selected: selectedOption,
            correctAnswer: currentQ.correct,
            score: this.score,
            streak: this.streak
        });

        // LOCK FAST FORWARD LOGIC
        if (this.settings.lockFastForward) {
            this.state = 'TRANSITIONING';
            // Immediate transition, small delay for visual feedback
            setTimeout(() => {
                this.currentIndex++;
                this.nextQuestion();
            }, 800);
        } else {
            this.state = 'WAITING_FOR_NEXT';
        }
        // If not locked, we wait for user to click "Next"
    }

    // "Fast Forward" button action (Manual Next)
    triggerFastForward() {
        if (this.state === 'TRANSITIONING' || this.state === 'ENDED') return;

        if (this.timer) clearInterval(this.timer);
        this.currentIndex++;
        this.nextQuestion();
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
        // Save to LocalStorage if needed
        // localStorage.setItem('j_history', JSON.stringify(this.history));

        this.onGameEnd({
            score: this.score,
            total: this.questions.length * 100, // Max possible base score
            history: this.history,
            maxStreak: this.maxStreak
        });
    }
}
