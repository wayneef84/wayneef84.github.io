// Main Game Controller
// Coordinates UI, AudioEngine, and GameLogic

class GameController {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.gameLogic = window.GameLogic;

        this.tracks = [];
        this.distractorPool = [];
        this.currentTrack = null;
        this.score = 0;
        this.round = 1;
        this.maxRounds = 5;
        this.timer = null;
        this.timeLeft = 30;
        this.isPlaying = false;
        this.correctCount = 0;
        this.pendingSelection = null; // For double tap

        // Settings
        this.settings = {
            volume: 1.0,
            theme: 'default',
            difficulty: 'normal',
            doubleTap: false
        };

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
        this.optionBtns = [];

        // Stats Display on Setup
        this.highScoreDisplay = document.getElementById('high-score-setup');

        // Settings Elements
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.themeSelect = document.getElementById('theme-select');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.doubleTapToggle = document.getElementById('double-tap-toggle');
    }

    /**
     * Initialize game
     */
    init() {
        this.loadSettings();
        this.audioEngine.setTrackEndCallback(() => this.handleTrackEnd());

        this.startBtn.addEventListener('click', () => this.startGame());
        this.playPauseBtn.addEventListener('click', () => this.togglePlayback());

        document.getElementById('achievements-btn').addEventListener('click', () => this.showAchievements());
        document.getElementById('back-to-setup-btn').addEventListener('click', () => this.endGame());

        // Settings Listeners
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Live update for theme/volume
        this.volumeSlider.addEventListener('input', (e) => this.audioEngine.setVolume(parseFloat(e.target.value)));
        this.themeSelect.addEventListener('change', (e) => this.applyTheme(e.target.value));

        // Load High Score
        this.updateHighScoreDisplay();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('ntt_settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
        this.applySettings();
    }

    applySettings() {
        this.audioEngine.setVolume(this.settings.volume);
        this.applyTheme(this.settings.theme);

        // Update UI inputs
        this.volumeSlider.value = this.settings.volume;
        this.themeSelect.value = this.settings.theme;
        this.difficultySelect.value = this.settings.difficulty;
        this.doubleTapToggle.checked = this.settings.doubleTap;
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    openSettings() {
        this.settingsModal.classList.remove('hidden');
    }

    closeSettings() {
        // Revert live preview if not saved? Or just keep it.
        // Usually settings should apply on Save, but volume/theme is nice to preview.
        // Let's assume Save just persists it.
        this.loadSettings(); // Revert to saved if cancelled (implicit cancel by X)
        this.settingsModal.classList.add('hidden');
    }

    saveSettings() {
        this.settings.volume = parseFloat(this.volumeSlider.value);
        this.settings.theme = this.themeSelect.value;
        this.settings.difficulty = this.difficultySelect.value;
        this.settings.doubleTap = this.doubleTapToggle.checked;

        localStorage.setItem('ntt_settings', JSON.stringify(this.settings));
        this.settingsModal.classList.add('hidden');

        // Ensure applied
        this.applySettings();
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

            // Need enough for distractors
            if (!tracks || tracks.length < this.maxRounds * 4) {
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
            this.setupArea.style.display = 'none';
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

        // Set time based on difficulty
        switch (this.settings.difficulty) {
            case 'easy': this.timeLeft = 30; break;
            case 'hard': this.timeLeft = 10; break;
            case 'normal': default: this.timeLeft = 20; break;
        }

        this.isPlaying = false;
        this.pendingSelection = null;

        // Reset UI
        this.feedbackArea.classList.add('hidden');
        this.feedbackArea.classList.remove('correct', 'incorrect');
        this.playPauseBtn.textContent = '▶️ Play Preview';

        // Generate Options
        try {
            this.generateOptionsUI();
        } catch (e) {
            console.error("Error generating options:", e);
            alert("An error occurred while setting up the round.");
            this.endGame();
            return;
        }

        this.updateUI();

        // Auto-play
        this.playTrack();
    }

    /**
     * Generate 4 Multiple Choice Buttons
     */
    generateOptionsUI() {
        this.optionsContainer.innerHTML = ''; // Clear previous

        if (!this.distractorPool || this.distractorPool.length === 0) {
            console.error("Distractor pool empty!");
            return;
        }

        const distractors = this.distractorPool
            .filter(t => t.trackId !== this.currentTrack.trackId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const options = [...distractors, this.currentTrack];
        this.shuffleArray(options);

        options.forEach(track => {
            const btn = document.createElement('button');
            btn.className = 'option-btn'; // Base class

            btn.innerHTML = `<strong>${track.trackName}</strong><span class="artist">${track.artistName}</span>`;

            const tid = track.trackId || Math.random().toString();
            btn.dataset.trackId = tid;
            btn.style.display = 'flex';

            btn.addEventListener('click', () => this.handleOptionClick(track, btn));

            this.optionsContainer.appendChild(btn);
        });
    }

    /**
     * Handle Option Click
     */
    handleOptionClick(selectedTrack, btnElement) {
        if (this.timeLeft <= 0) return;

        // Double Tap Logic
        if (this.settings.doubleTap) {
            if (this.pendingSelection !== btnElement) {
                // First tap
                if (this.pendingSelection) {
                    this.pendingSelection.classList.remove('pending-selection');
                }
                this.pendingSelection = btnElement;
                btnElement.classList.add('pending-selection');
                return; // Wait for second tap
            } else {
                // Second tap (confirm)
                btnElement.classList.remove('pending-selection');
                this.pendingSelection = null;
            }
        }

        // Proceed with selection
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

            if (this.timeLeft >= (this.settings.difficulty === 'hard' ? 5 : 25)) {
                this.unlockAchievement('speed_demon');
            }

        } else {
            btnElement.classList.add('wrong-choice');
            allBtns.forEach(b => {
                if (b.dataset.trackId == this.currentTrack.trackId) {
                    b.classList.add('correct-choice');
                }
            });

            this.feedbackText.innerHTML = `Wrong! The correct answer was highlighted.`;
            this.feedbackArea.classList.remove('hidden', 'correct');
            this.feedbackArea.classList.add('incorrect');
        }

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
        const allBtns = document.querySelectorAll('.option-btn');
        allBtns.forEach(b => {
            b.disabled = true;
            if (b.dataset.trackId == this.currentTrack.trackId) {
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
        if (this.gameLogic.saveAchievement(id)) {
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
