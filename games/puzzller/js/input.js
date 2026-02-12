class InputHandler {
    constructor() {
        this.keys = {}; // Current state (held)
        this.justPressed = {}; // Pressed this frame (buffer)

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
        this.justPressed[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    isJustPressed(code) {
        return !!this.justPressed[code];
    }

    // Call this at the end of the game loop to clear the frame buffer
    update() {
        this.justPressed = {};
    }

    // Method to simulate key presses from touch controls
    simulateKey(code, isDown) {
        if (isDown) {
            if (!this.keys[code]) { // Only trigger justPressed if not already held
                this.justPressed[code] = true;
            }
            this.keys[code] = true;
        } else {
            this.keys[code] = false;
        }
    }
}

// Export for module usage or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
} else {
    window.InputHandler = InputHandler;
}
