/**
 * BOARD GAME ENGINE
 * Handles shared resources and game switching
 */

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentGame = null;
    }

    loadGame(GameClass) {
        // Cleanup old game
        if (this.currentGame) {
            if (this.currentGame.destroy) {
                this.currentGame.destroy();
            }
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Initialize new game
        // Pass canvas/ctx so game can set dimensions
        this.currentGame = new GameClass(this.canvas, this.ctx, (msg) => this.updateStatus(msg));
    }

    updateStatus(msg) {
        const el = document.getElementById('turnDisplay');
        if (el) el.textContent = msg;
    }
}
