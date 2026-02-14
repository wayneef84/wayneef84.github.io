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

        // DOM Elements
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.timerDisplay = document.getElementById('timer-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.guessInput = document.getElementById('guess-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.feedbackArea = document.getElementById('feedback-area');
        this.feedbackText = document.getElementById('feedback-text');
        this.gameArea = document.getElementById('game-area');
        this.loadingArea = document.getElementById('loading-area');
        this.startBtn = document.getElementById('start-btn');
        this.genreSelect = document.getElementById('genre-select');
        this.roundDisplay = document.getElementById('round-display');
        this.setupArea = document.getElementById('setup-area');
    }

    /**
     * Initialize game
     */
    init() {
        this.audioEngine.setTrackEndCallback(() => this.handleTrackEnd());

        this.startBtn.addEventListener('click', () => this.startGame());
        this.playPauseBtn.addEventListener('click', () => this.togglePlayback());
        this.submitBtn.addEventListener('click', () => this.submitGuess());
        this.nextBtn.addEventListener('click', () => this.nextRound());

        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
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
        this.updateUI();

        try {
            // Fetch tracks
            const tracks = await this.audioEngine.searchTracks(genre, 50);

            if (tracks.length < this.maxRounds) {
                alert("Not enough tracks found for this genre. Try another one.");
                this.loadingArea.classList.add('hidden');
                this.startBtn.disabled = false;
                return;
            }

            // Shuffle tracks
            this.tracks = this.shuffleArray(tracks).slice(0, this.maxRounds);

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
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.submitBtn.disabled = false;
        this.nextBtn.style.display = 'none';
        this.feedbackArea.classList.add('hidden');
        this.feedbackArea.classList.remove('correct', 'incorrect');
        this.playPauseBtn.textContent = '▶️ Play Preview';

        this.updateUI();

        // Auto-play
        this.playTrack();
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
        this.feedbackText.innerHTML = `Time's up!<br>The song was <strong>${this.currentTrack.trackName}</strong> by <strong>${this.currentTrack.artistName}</strong>`;
        this.feedbackArea.classList.remove('hidden', 'correct');
        this.feedbackArea.classList.add('incorrect');
        this.endRound();
    }

    /**
     * Handle track ending naturally (preview over)
     */
    handleTrackEnd() {
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️ Replay';
        this.stopTimer();
        // Don't auto-fail, let them guess still? Or fail?
        // Usually previews are 30s, and timer is 30s. So they coincide.
        this.handleTimeout();
    }

    /**
     * Submit guess
     */
    submitGuess() {
        const guess = this.guessInput.value.trim();
        if (!guess) return;

        this.stopTimer();
        this.audioEngine.stop();
        this.isPlaying = false;
        this.playPauseBtn.textContent = '▶️ Play Preview';

        const isCorrectTitle = this.gameLogic.checkGuess(guess, this.currentTrack.trackName);
        const isCorrectArtist = this.gameLogic.checkGuess(guess, this.currentTrack.artistName); // Optional: allow guessing artist? Prompt implies "Name That Tune", so usually title. But let's be generous or strict?

        // Prompt says "Name That Tune", implies song title.
        // But maybe bonus points for artist?
        // Let's stick to Title for win condition.

        if (isCorrectTitle) {
            const points = this.gameLogic.calculateScore(this.timeLeft);
            this.score += points;
            this.feedbackText.innerHTML = `Correct! +${points} pts<br><strong>${this.currentTrack.trackName}</strong> by ${this.currentTrack.artistName}`;
            this.feedbackArea.classList.remove('hidden', 'incorrect');
            this.feedbackArea.classList.add('correct');
        } else {
            this.feedbackText.innerHTML = `Wrong!<br>The song was <strong>${this.currentTrack.trackName}</strong> by <strong>${this.currentTrack.artistName}</strong>`;
            this.feedbackArea.classList.remove('hidden', 'correct');
            this.feedbackArea.classList.add('incorrect');
        }

        this.endRound();
    }

    /**
     * End the current round
     */
    endRound() {
        this.guessInput.disabled = true;
        this.submitBtn.disabled = true;
        this.nextBtn.style.display = 'inline-block';
        this.updateUI();
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
        alert(`Game Over! Final Score: ${this.score}`);
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
