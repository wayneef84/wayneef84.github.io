/**
 * input.js
 * Handles keyboard and touch input for Fall Down.
 */

const InputManager = {
    keys: {
        left: false,
        right: false
    },
    touch: {
        left: false,
        right: false
    },
    holdStartTime: 0,
    lastDirection: 0, // -1 (left), 0 (none), 1 (right)

    init: function() {
        console.log("InputManager initializing...");

        // Keyboard listeners
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.setKey('left', true);
            if (e.key === 'ArrowRight') this.setKey('right', true);
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.setKey('left', false);
            if (e.key === 'ArrowRight') this.setKey('right', false);
        });

        // Touch listeners
        const leftZone = document.getElementById('touch-left');
        const rightZone = document.getElementById('touch-right');

        if (leftZone && rightZone) {
            const options = { passive: false };

            // Touch Start
            leftZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.setTouch('left', true);
            }, options);

            rightZone.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.setTouch('right', true);
            }, options);

            // Touch End
            leftZone.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.setTouch('left', false);
            }, options);

            rightZone.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.setTouch('right', false);
            }, options);

            // Touch Cancel/Leave (safety)
             leftZone.addEventListener('touchcancel', (e) => { this.setTouch('left', false); }, options);
             rightZone.addEventListener('touchcancel', (e) => { this.setTouch('right', false); }, options);
        } else {
            console.warn("Touch zones not found!");
        }
    },

    setKey: function(key, state) {
        if (this.keys[key] !== state) {
            this.keys[key] = state;
            this.updateHoldState();
        }
    },

    setTouch: function(side, state) {
        if (this.touch[side] !== state) {
            this.touch[side] = state;
            this.updateHoldState();
        }
    },

    updateHoldState: function() {
        // Calculate effective direction
        // Priority: if both keys are pressed, cancel out (0)
        // If one key and one touch? Treat as additive? Or logical OR.

        const leftActive = this.keys.left || this.touch.left;
        const rightActive = this.keys.right || this.touch.right;

        let currentDirection = 0;
        if (leftActive && !rightActive) currentDirection = -1;
        else if (rightActive && !leftActive) currentDirection = 1;

        // If direction changed, reset timer
        if (currentDirection !== this.lastDirection) {
            this.holdStartTime = Date.now();
            this.lastDirection = currentDirection;
        } else if (currentDirection === 0) {
            this.holdStartTime = 0;
        }
    },

    getControlState: function() {
        const leftActive = this.keys.left || this.touch.left;
        const rightActive = this.keys.right || this.touch.right;

        let direction = 0;
        if (leftActive && !rightActive) direction = -1;
        else if (rightActive && !leftActive) direction = 1;

        let intensity = 1.0;
        if (direction !== 0) {
            const duration = Date.now() - this.holdStartTime;
            // Acceleration curve: starts at 1.0, ramps to 3.0 over 1.5 seconds
            intensity = 1.0 + Math.min(2.0, (duration / 1500) * 2.0);
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
