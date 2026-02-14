// Game Logic Module
// Handles achievements, high scores, and option generation

const GameLogic = {
    achievements: [
        { id: 'first_win', name: 'Rookie', description: 'Complete your first game.', icon: '🎵' },
        { id: 'perfect_game', name: 'Maestro', description: 'Get all questions correct in a game.', icon: '🎼' },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Answer correctly within 5 seconds.', icon: '⚡' },
        { id: 'high_score_1000', name: 'Chart Topper', description: 'Score over 1000 points.', icon: '🏆' },
        { id: 'genre_master', name: 'Genre Master', description: 'Play 5 different genres.', icon: '🎧' }
    ],

    /**
     * Generate multiple choice options
     * @param {Object} correctTrack The correct track object
     * @param {Array} allTracks Pool of available tracks
     * @param {number} count Number of options (default 4)
     * @returns {Array} Array of track objects (shuffled)
     */
    generateOptions: function(correctTrack, allTracks, count = 4) {
        // Filter out the correct track from the pool
        const wrongTracks = allTracks.filter(t => t.trackId !== correctTrack.trackId);

        // Shuffle wrong tracks and take (count - 1)
        const shuffledWrong = this.shuffleArray(wrongTracks).slice(0, count - 1);

        // Combine with correct track
        const options = [...shuffledWrong, correctTrack];

        // Shuffle final options
        return this.shuffleArray(options);
    },

    /**
     * Check if an achievement is unlocked
     * @param {string} achievementId
     * @param {Object} stats Current game stats (score, time, correctCount, totalPlayed)
     * @returns {boolean} True if unlocked
     */
    checkAchievement: function(achievementId, stats) {
        switch (achievementId) {
            case 'first_win':
                return stats.totalPlayed >= 1;
            case 'perfect_game':
                return stats.correctCount === stats.totalQuestions && stats.totalQuestions >= 5;
            case 'speed_demon':
                return stats.lastAnswerTime <= 5;
            case 'high_score_1000':
                return stats.score >= 1000;
            case 'genre_master':
                // Requires tracking distinct genres played
                return stats.distinctGenres >= 5;
            default:
                return false;
        }
    },

    /**
     * Calculate score based on time remaining
     * @param {number} timeLeft Time remaining in seconds
     * @param {number} maxTime Max time in seconds (default 30)
     * @returns {number} Score
     */
    calculateScore: function(timeLeft, maxTime = 30) {
        // Base score for correct answer
        const baseScore = 100;

        // Time bonus: more points for faster answers
        const timeBonus = Math.floor(timeLeft * 10);

        return baseScore + timeBonus;
    },

    /**
     * Shuffle array helper
     */
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Save high score to localStorage
     * @param {number} score
     */
    saveHighScore: function(score) {
        const currentHigh = parseInt(localStorage.getItem('ntt_high_score') || '0');
        if (score > currentHigh) {
            localStorage.setItem('ntt_high_score', score);
            return true; // New high score!
        }
        return false;
    },

    /**
     * Get high score
     */
    getHighScore: function() {
        return parseInt(localStorage.getItem('ntt_high_score') || '0');
    },

    /**
     * Save achievement
     */
    saveAchievement: function(id) {
        let unlocked = JSON.parse(localStorage.getItem('ntt_achievements') || '[]');
        if (!unlocked.includes(id)) {
            unlocked.push(id);
            localStorage.setItem('ntt_achievements', JSON.stringify(unlocked));
            return true; // Newly unlocked
        }
        return false;
    },

    /**
     * Get unlocked achievements
     */
    getUnlockedAchievements: function() {
        return JSON.parse(localStorage.getItem('ntt_achievements') || '[]');
    }
};

// Export
if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
}
