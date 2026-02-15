/**
 * input.js
 * Handles keyboard and touch input for Fall Down.
 */

const InputManager = {
    keys: {
        left: false,
        right: false
    },
    touchActive: false,
    touchX: 0,
    canvas: null,

    // Acceleration state
    holdStartTime: 0,
    lastDirection: 0,

    init: function() {
        console.log("InputManager initializing...");
        this.canvas = document.getElementById('game-canvas');

        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = true;
            if (e.key === 'ArrowRight') this.keys.right = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.keys.left = false;
            if (e.key === 'ArrowRight') this.keys.right = false;
        });

        // Touch listeners
        if (this.canvas) {
            const options = { passive: false };

            const handleTouch = (e) => {
                e.preventDefault();
                if (e.touches.length > 0) {
                    const rect = this.canvas.getBoundingClientRect();
                    // Handle scaling if canvas display size != resolution
                    const scaleX = this.canvas.width / rect.width;
                    this.touchX = (e.touches[0].clientX - rect.left) * scaleX;
                    this.touchActive = true;
                }
            };

            this.canvas.addEventListener('touchstart', handleTouch, options);
            this.canvas.addEventListener('touchmove', handleTouch, options);

            const handleEnd = (e) => {
                e.preventDefault();
                if (e.touches.length === 0) {
                    this.touchActive = false;
                } else {
                    // If fingers remain, switch to the next one
                    const rect = this.canvas.getBoundingClientRect();
                    const scaleX = this.canvas.width / rect.width;
                    this.touchX = (e.touches[0].clientX - rect.left) * scaleX;
                }
            };

            this.canvas.addEventListener('touchend', handleEnd, options);
            this.canvas.addEventListener('touchcancel', (e) => { this.touchActive = false; }, options);
        } else {
            console.warn("Canvas not found for touch input!");
        }
    },

    /**
     * Returns control state.
     * @param {number} playerX - Current X position of the player (required for relative touch)
     */
    getControlState: function(playerX) {
        let direction = 0;

        // Keyboard
        if (this.keys.left) direction = -1;
        else if (this.keys.right) direction = 1;

        // Touch (Overrides/Complements)
        if (this.touchActive && playerX !== undefined) {
            // Deadzone to prevent jitter when finger is exactly on player
            const deadzone = 10;
            if (this.touchX < playerX - deadzone) {
                direction = -1;
            } else if (this.touchX > playerX + deadzone) {
                direction = 1;
            }
            // If inside deadzone and no keys pressed, direction is 0
        }

        // Calculate Intensity (Acceleration)
        let intensity = 1.0;

        if (direction !== 0) {
            // If direction changed, reset timer
            if (direction !== this.lastDirection) {
                this.holdStartTime = Date.now();
                this.lastDirection = direction;
            }

            const duration = Date.now() - this.holdStartTime;
            // Acceleration curve: starts at 1.0, ramps to 3.0 over 1.5 seconds
            intensity = 1.0 + Math.min(2.0, (duration / 1500) * 2.0);
        } else {
            this.holdStartTime = 0;
            this.lastDirection = 0;
        }

        return { direction, intensity };
    }
};

// Initialize input when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InputManager.init());
} else {
    InputManager.init();
}
