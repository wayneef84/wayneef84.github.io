// Main Game Controller
// Coordinates UI, AudioEngine, and GameLogic

class GameController {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.gameLogic = window.GameLogic;

        this.tracks = [];
        this.currentTrack = null;
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.timer = null;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.correctCount = 0;

        // DOM Elements
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.feedbackArea = document.getElementById('feedback-area');
        this.feedbackText = document.getElementById('feedback-text');
        this.gameArea = document.getElementById('game-area');
        this.loadingArea = document.getElementById('loading-area');
        this.startBtn = document.getElementById('start-btn');
        this.genreSelect = document.getElementById('genre-select');
        this.roundDisplay = document.getElementById('round-display');
        this.setupArea = document.getElementById('setup-area');

        // New Multiple Choice UI
        this.optionsContainer = document.getElementById('options-container');
        this.optionBtns = []; // Will be populated dynamically

        // Stats Display on Setup
        this.highScoreDisplay = document.getElementById('high-score-setup');
    }

    /**
     * Initialize game
     */
    init() {
        console.log("GameController initialized");
        this.audioEngine.setTrackEndCallback(() => this.handleTrackEnd());

        this.startBtn.addEventListener('click', () => {
            console.log("Start button clicked");
            this.startGame();
        });
        this.playPauseBtn.addEventListener('click', () => this.togglePlayback());

        document.getElementById('achievements-btn').addEventListener('click', () => this.showAchievements());
        document.getElementById('back-to-setup-btn').addEventListener('click', () => this.endGame());

        // Load High Score
        this.updateHighScoreDisplay();
    }

    updateHighScoreDisplay() {
        const highScore = this.gameLogic.getHighScore();
        if (this.highScoreDisplay) {
            this.highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
    }

    /**
     * Start a new game
     */
    async startGame() {
        const genre = this.genreSelect.value;

        // Show loading, hide setup
        this.loadingArea.classList.remove('hidden');
        this.startBtn.disabled = true;

        this.score = 0;
        this.round = 1;
        this.correctCount = 0;
        this.updateUI();

        try {
            // Fetch tracks
            const tracks = await this.audioEngine.searchTracks(genre, 50);

            if (tracks.length < this.maxRounds * 4) { // Need enough for distractors
                alert("Not enough tracks found for this genre. Try another one.");
                this.loadingArea.classList.add('hidden');
                this.startBtn.disabled = false;
                return;
            }

            // Shuffle tracks
            this.tracks = this.shuffleArray(tracks).slice(0, this.maxRounds);
            // Keep the rest as potential distractors
            this.distractorPool = tracks;

            // Switch to game view
            this.loadingArea.classList.add('hidden');
            this.setupArea.style.display = 'none'; // No 'hidden' class on setupArea initially
            this.gameArea.classList.remove('hidden');

            this.startRound();

        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Failed to load tracks. Please check your internet connection.");
            this.loadingArea.classList.add('hidden');
            this.startBtn.disabled = false;
        }
    }

    /**
     * Start a new round
     */
    startRound() {
        this.currentTrack = this.tracks[this.round - 1];
        this.timeLeft = 30;
        this.isPlaying = false;

        // Reset UI
        this.feedbackArea.classList.add('hidden');
        this.feedbackArea.classList.remove('correct', 'incorrect');
        this.playPauseBtn.textContent = '▶️ Play Preview';

        // Generate Options
        this.generateOptionsUI();

        this.updateUI();

        // Auto-play
        this.playTrack();
    }

    /**
     * Generate 4 Multiple Choice Buttons
     */
    generateOptionsUI() {
        this.optionsContainer.innerHTML = ''; // Clear previous

        // Pick 3 random wrong tracks from pool + current correct track
        // Ensure distractors are not the current track
        const distractors = this.distractorPool
            .filter(t => t.trackId !== this.currentTrack.trackId)
            .sort(() => 0.5 - Math.random()) // Simple shuffle
            .slice(0, 3);

        const options = [...distractors, this.currentTrack];

        // Shuffle options
        this.shuffleArray(options);

        options.forEach(track => {
            const btn = document.createElement('button');
            btn.className = 'option-btn btn secondary';
            // Display Title - Artist
            btn.innerHTML = `<strong>${track.trackName}</strong><br><span class="artist">${track.artistName}</span>`;
            btn.dataset.trackId = track.trackId;

            btn.addEventListener('click', () => this.handleOptionClick(track, btn));

            this.optionsContainer.appendChild(btn);
        });
    }

    /**
     * Handle Option Click
     */
    handleOptionClick(selectedTrack, btnElement) {
        if (this.timeLeft <= 0) return; // Ignore if time up

        this.stopTimer();
        this.audioEngine.stop();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️ Play Preview';

        // Disable all buttons
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);

        const isCorrect = (selectedTrack.trackId === this.currentTrack.trackId);

        if (isCorrect) {
            btnElement.classList.add('correct-choice');
            const points = this.gameLogic.calculateScore(this.timeLeft);
            this.score += points;
            this.correctCount++;

            this.feedbackText.innerHTML = `Correct! +${points} pts`;
            this.feedbackArea.classList.remove('hidden', 'incorrect');
            this.feedbackArea.classList.add('correct');

            // Check Achievements
            if (this.timeLeft >= 25) { // 30s - 5s = 25s left
                this.unlockAchievement('speed_demon');
            }

        } else {
            btnElement.classList.add('wrong-choice');
            // Highlight correct answer
            allBtns.forEach(b => {
                if (parseInt(b.dataset.trackId) === this.currentTrack.trackId) {
                    b.classList.add('correct-choice');
                }
            });

            this.feedbackText.innerHTML = `Wrong! The correct answer was highlighted.`;
            this.feedbackArea.classList.remove('hidden', 'correct');
            this.feedbackArea.classList.add('incorrect');
        }

        // Delay before next round
        setTimeout(() => this.nextRound(), 2000);
    }

    /**
     * Play current track
     */
    playTrack() {
        if (!this.currentTrack) return;

        this.audioEngine.play(this.currentTrack.previewUrl)
            .then(() => {
                this.isPlaying = true;
                this.playPauseBtn.textContent = '⏸️ Pause';
                this.startTimer();
            })
            .catch(err => console.error("Play error:", err));
    }

    /**
     * Toggle Play/Pause
     */
    togglePlayback() {
        if (this.isPlaying) {
            this.audioEngine.pause();
            this.stopTimer();
            this.playPauseBtn.textContent = '▶️ Resume';
            this.isPlaying = false;
        } else {
            this.audioEngine.resume();
            this.startTimer();
            this.playPauseBtn.textContent = '⏸️ Pause';
            this.isPlaying = true;
        }
    }

    /**
     * Start countdown timer
     */
    startTimer() {
        this.stopTimer(); // Clear existing
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.audioEngine.stop();
                this.isPlaying = false;
                this.handleTimeout();
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Handle timer running out
     */
    handleTimeout() {
        // Disable buttons
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
            b.disabled = true;
            if (parseInt(b.dataset.trackId) === this.currentTrack.trackId) {
                b.classList.add('correct-choice');
            }
        });

        this.feedbackText.innerHTML = `Time's up!`;
        this.feedbackArea.classList.remove('hidden', 'correct');
        this.feedbackArea.classList.add('incorrect');

        setTimeout(() => this.nextRound(), 2000);
    }

    /**
     * Handle track ending naturally (preview over)
     */
    handleTrackEnd() {
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️ Replay';
        this.stopTimer();
        this.handleTimeout();
    }

    /**
     * Go to next round
     */
    nextRound() {
        if (this.round < this.maxRounds) {
            this.round++;
            this.startRound();
        } else {
            this.endGame();
        }
    }

    /**
     * End Game
     */
    endGame() {
        this.gameArea.classList.add('hidden');
        this.setupArea.style.display = 'block';
        this.startBtn.disabled = false;

        // Save High Score
        const isNewHigh = this.gameLogic.saveHighScore(this.score);
        this.updateHighScoreDisplay();

        // Check Completion Achievements
        this.unlockAchievement('first_win');
        if (this.score >= 1000) this.unlockAchievement('high_score_1000');
        if (this.correctCount === this.maxRounds) this.unlockAchievement('perfect_game');

        let msg = `Game Over! Final Score: ${this.score}`;
        if (isNewHigh) msg += "\nNew High Score! 🏆";
        alert(msg);
    }

    /**
     * Unlock Achievement
     */
    unlockAchievement(id) {
        // Here we could implement a toast notification
        // For now, just save it
        if (this.gameLogic.saveAchievement(id)) {
            // Show toast?
            console.log(`Achievement Unlocked: ${id}`);
            alert(`Achievement Unlocked: ${id}`);
        }
    }

    showAchievements() {
        const unlocked = this.gameLogic.getUnlockedAchievements();
        const all = this.gameLogic.achievements;

        let msg = "Achievements:\n\n";
        all.forEach(a => {
            const has = unlocked.includes(a.id);
            msg += `${has ? '✅' : '🔒'} ${a.name}: ${a.description}\n`;
        });

        alert(msg);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.timerDisplay.textContent = `Time: ${this.timeLeft}s`;
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.roundDisplay.textContent = `Round: ${this.round} / ${this.maxRounds}`;
    }

    /**
     * Shuffle array helper
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
    window.gameController.init();
});
