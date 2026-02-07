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

    /**
     * Helper to handle touch/click normalization
     * Prevents ghost clicks on mobile
     */
    static addInputListener(element, callback) {
        let touchHandled = false;

        const handle = (e) => {
            // Prevent default only if we are interacting with the game
            // For scrolling purposes, we might need to be careful.
            // But usually board games are fixed size.

            if (e.type === 'touchstart') {
                touchHandled = true;
                // Convert touch to clientX/Y for consistency if needed,
                // but usually the game logic extracts clientX from e.touches[0] or e.clientX

                // If it's a touch event, it has touches array.
                // We can't mutate e to look like a click easily.
                // Just pass it through, but mark as handled.
            }

            if (e.type === 'click' && touchHandled) {
                touchHandled = false; // Reset for next time? Or just return.
                return; // Ignore ghost click
            }

            callback(e);
        };

        element.addEventListener('click', handle);
        element.addEventListener('touchstart', handle, {passive: false});

        return () => {
            element.removeEventListener('click', handle);
            element.removeEventListener('touchstart', handle);
        };
    }

    // Helper for coordinate extraction
    static getEventCoords(e, element) {
        const rect = element.getBoundingClientRect();
        const scaleX = element.width / rect.width;
        const scaleY = element.height / rect.height;

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.type === 'touchstart' && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
            e.preventDefault(); // Prevent scrolling on game board interaction
        }

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;
        return { x, y };
    }
}
