/**
 * ui.js
 * Manages UI interactions for Fall Down.
 */

const UIManager = {
    init: function() {
        console.log("UIManager initializing...");

        // Bind Menu Buttons
        document.getElementById('btn-start').addEventListener('click', () => {
            Game.start();
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showScreen('settings-menu');
        });

        document.getElementById('btn-scores').addEventListener('click', () => {
            this.showHighScores();
        });

        // Bind Settings Buttons
        document.getElementById('btn-settings-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Theme Select
        const themeBtns = document.querySelectorAll('#theme-select .toggle-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateToggle('#theme-select', e.target);
                const theme = e.target.dataset.value;
                Game.setTheme(theme);
                this.saveSettings();
            });
        });

        // Difficulty Select
        const diffBtns = document.querySelectorAll('#difficulty-select .toggle-btn');
        diffBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.updateToggle('#difficulty-select', e.target);
                const diff = e.target.dataset.value;
                Game.setDifficulty(diff);
                this.saveSettings();
            });
        });

        // Bind High Score Buttons
        document.getElementById('btn-scores-back').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('btn-export').addEventListener('click', () => {
            this.exportData();
        });

        // Bind Game Over Buttons
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.hideOverlay('game-over-overlay');
            Game.start();
        });

        document.getElementById('btn-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('btn-save-score').addEventListener('click', () => {
            this.saveHighScore();
        });

        // Initialize UI State from Settings
        this.loadSettingsUI();
    },

    showScreen: function(screenId) {
        // Hide all overlays
        document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
        document.getElementById('hud').classList.add('hidden');

        // Show target
        document.getElementById(screenId).classList.remove('hidden');
    },

    hideMenu: function() {
        document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    },

    showHUD: function() {
        document.getElementById('hud').classList.remove('hidden');
    },

    updateScore: function(score) {
        document.getElementById('score-val').textContent = score;
    },

    updateLevel: function(level) {
        const el = document.getElementById('level-val');
        if (el) el.textContent = level;
    },

    updateLives: function(lives) {
        const el = document.getElementById('lives-val');
        if (el) el.textContent = lives;
    },

    showGameOver: function(score, isHighScore) {
        document.getElementById('final-score-val').textContent = score;
        const newScoreDiv = document.getElementById('new-high-score');
        const retryBtn = document.getElementById('btn-retry');
        const menuBtn = document.getElementById('btn-menu');

        if (isHighScore) {
            newScoreDiv.classList.remove('hidden');
            retryBtn.classList.add('hidden');
            menuBtn.classList.add('hidden');
            document.getElementById('player-name').value = '';
            setTimeout(() => document.getElementById('player-name').focus(), 100);
        } else {
            newScoreDiv.classList.add('hidden');
            retryBtn.classList.remove('hidden');
            menuBtn.classList.remove('hidden');
        }

        this.showScreen('game-over-overlay');
        document.getElementById('hud').classList.add('hidden');
    },

    saveHighScore: function() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim() || 'Anonymous';
        const score = parseInt(document.getElementById('final-score-val').textContent);

        StorageManager.saveScore(name, score);

        // Hide input, show buttons
        document.getElementById('new-high-score').classList.add('hidden');
        document.getElementById('btn-retry').classList.remove('hidden');
        document.getElementById('btn-menu').classList.remove('hidden');

        // Refresh high scores list (optional, but good practice)
        // this.showHighScores(); // No, we are staying on game over screen
    },

    showHighScores: function() {
        const list = document.getElementById('scores-list');
        list.innerHTML = '';

        const scores = StorageManager.getScores();

        if (scores.length === 0) {
            list.innerHTML = '<div style="padding:10px; color:#777;">No scores yet.</div>';
        } else {
            scores.forEach((s, index) => {
                const item = document.createElement('div');
                item.className = 'score-item';
                item.innerHTML = `
                    <span class="score-rank">${index + 1}.</span>
                    <span class="score-name">${this.escapeHtml(s.name)}</span>
                    <span class="score-val">${s.score}</span>
                `;
                list.appendChild(item);
            });
        }

        this.showScreen('high-scores-menu');
    },

    updateToggle: function(groupId, activeBtn) {
        const group = document.querySelector(groupId);
        group.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    },

    saveSettings: function() {
        const settings = {
            theme: Game.theme,
            difficulty: Game.difficulty
        };
        StorageManager.saveSettings(settings);
    },

    loadSettingsUI: function() {
        if (typeof StorageManager === 'undefined') return;

        const settings = StorageManager.getSettings();

        // Update Theme UI
        const themeGroup = document.getElementById('theme-select');
        const themeBtn = themeGroup.querySelector(`[data-value="${settings.theme}"]`);
        if (themeBtn) this.updateToggle('#theme-select', themeBtn);

        // Update Difficulty UI
        const diffGroup = document.getElementById('difficulty-select');
        const diffBtn = diffGroup.querySelector(`[data-value="${settings.difficulty}"]`);
        if (diffBtn) this.updateToggle('#difficulty-select', diffBtn);
    },

    exportData: function() {
        const data = StorageManager.exportData();
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `falldown_data_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    hideOverlay: function(id) {
        document.getElementById(id).classList.add('hidden');
    },

    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIManager.init());
} else {
    UIManager.init();
}
