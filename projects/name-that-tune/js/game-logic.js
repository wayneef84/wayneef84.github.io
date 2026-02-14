// Game Logic Module
// Handles string comparison and scoring

const GameLogic = {
    /**
     * Calculate Levenshtein distance between two strings
     * @param {string} a
     * @param {string} b
     * @returns {number} Distance
     */
    calculateLevenshteinDistance: function(a, b) {
        const matrix = [];

        // Increment along the first column of each row
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // Increment each column in the first row
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1 // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    },

    /**
     * Normalize string for comparison (lowercase, remove punctuation)
     * @param {string} str
     * @returns {string}
     */
    normalizeString: function(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s]|_/g, "") // Remove punctuation
            .replace(/\s+/g, " ") // Collapse whitespace
            .trim();
    },

    /**
     * Check if the guess matches the target
     * @param {string} guess User's guess
     * @param {string} target Actual answer (Song Title or Artist)
     * @returns {boolean} True if match is close enough
     */
    checkGuess: function(guess, target) {
        if (!guess || !target) return false;

        const normalizedGuess = this.normalizeString(guess);
        const normalizedTarget = this.normalizeString(target);

        // Direct match check
        if (normalizedGuess === normalizedTarget) return true;

        // Also check if the guess is contained within the target (e.g. "Bohemian" for "Bohemian Rhapsody")
        // But only if the guess is substantial enough (e.g. > 3 chars)
        if (normalizedGuess.length > 3 && normalizedTarget.includes(normalizedGuess)) {
             // Calculate ratio of length to ensure it's not too short
             if (normalizedGuess.length / normalizedTarget.length > 0.5) {
                 return true;
             }
        }

        const distance = this.calculateLevenshteinDistance(normalizedGuess, normalizedTarget);
        const maxLength = Math.max(normalizedGuess.length, normalizedTarget.length);

        // Calculate similarity ratio (0 to 1)
        const similarity = 1 - (distance / maxLength);

        // Threshold for "close enough"
        return similarity >= 0.8;
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
        // e.g. 30s left = 300 points bonus, 1s left = 10 points bonus
        const timeBonus = Math.floor(timeLeft * 10);

        return baseScore + timeBonus;
    }
};

// Export for usage if using modules, but for vanilla script tag inclusion:
if (typeof window !== 'undefined') {
    window.GameLogic = GameLogic;
}
if (typeof module !== 'undefined') {
    module.exports = GameLogic;
}
