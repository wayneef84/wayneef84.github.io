/**
 * storage.js
 * Manages local storage for Fall Down game.
 */

const STORAGE_KEY_SCORES = 'falldown_scores';
const STORAGE_KEY_SETTINGS = 'falldown_settings';

const StorageManager = {
    getScores: function() {
        const data = localStorage.getItem(STORAGE_KEY_SCORES);
        return data ? JSON.parse(data) : [];
    },

    saveScore: function(name, score) {
        const scores = this.getScores();
        scores.push({ name: name, score: score, date: new Date().toISOString() });

        // Sort descending
        scores.sort((a, b) => b.score - a.score);

        // Keep top 10
        const topScores = scores.slice(0, 10);
        localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(topScores));
        return topScores;
    },

    isHighScore: function(score) {
        const scores = this.getScores();
        if (scores.length < 10) return true;
        return score > scores[scores.length - 1].score;
    },

    getSettings: function() {
        const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
        return data ? JSON.parse(data) : {
            theme: 'classic',
            difficulty: 'normal'
        };
    },

    saveSettings: function(settings) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    },

    exportData: function() {
        const data = {
            scores: this.getScores(),
            settings: this.getSettings(),
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }
};
