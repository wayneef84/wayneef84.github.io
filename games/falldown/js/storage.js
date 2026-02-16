/**
 * storage.js
 * Manages local storage for Fall Down game using FongDB.
 */

const STORAGE_DB_NAME = 'FalldownDB';
const STORAGE_DB_VERSION = 1;

const StorageManager = {
    db: null,
    ready: false,

    init: function() {
        if (this.ready) return Promise.resolve();

        this.db = new FongDB({
            name: STORAGE_DB_NAME,
            version: STORAGE_DB_VERSION,
            stores: {
                scores: { keyPath: 'id', autoIncrement: true },
                settings: { keyPath: 'id' }
            }
        });

        return this.db.init().then(() => {
            console.log('Falldown storage initialized');
            this.ready = true;
        }).catch(err => {
            console.error('Failed to initialize storage:', err);
            // Fallback? Ideally not needed if adapters work.
        });
    },

    ensureInit: function() {
        return this.init();
    },

    getScores: function() {
        return this.ensureInit().then(() => {
            return this.db.getAll('scores');
        }).then(scores => {
            // Sort descending by score
            if (!scores) return [];
            scores.sort((a, b) => b.score - a.score);
            return scores.slice(0, 10);
        });
    },

    saveScore: function(name, score) {
        return this.ensureInit().then(() => {
            return this.db.put('scores', {
                name: name,
                score: score,
                date: new Date().toISOString()
            });
        }).then(() => {
            return this.getScores();
        });
    },

    isHighScore: function(score) {
        return this.getScores().then(scores => {
            if (scores.length < 10) return true;
            return score > scores[scores.length - 1].score;
        });
    },

    getSettings: function() {
        return this.ensureInit().then(() => {
            return this.db.get('settings', 'config');
        }).then(data => {
            return data ? data.value : {
                theme: 'classic',
                difficulty: 'normal'
            };
        });
    },

    saveSettings: function(settings) {
        return this.ensureInit().then(() => {
            return this.db.put('settings', { id: 'config', value: settings });
        });
    },

    exportData: function() {
        return Promise.all([
            this.getScores(),
            this.getSettings()
        ]).then(([scores, settings]) => {
            const data = {
                scores: scores,
                settings: settings,
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        });
    }
};
