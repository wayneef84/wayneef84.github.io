/**
 * NEGEN Input Manager
 * Handles Keyboard, Mouse, and Touch inputs.
 */
export default class InputManager {
    constructor() {
        this.keys = {}; // Current state of keys
        this.prevKeys = {}; // Previous frame state

        this.pointer = {
            x: 0,
            y: 0,
            isDown: false,
            isPressed: false, // Click/Tap this frame
            isReleased: false
        };

        this.bindings = {}; // Virtual key bindings

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        // Touch to mouse mapping (simple)
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
    }

    init(engine) {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        if (engine.canvas) {
            const c = engine.canvas;
            c.addEventListener('mousedown', this.handleMouseDown);
            c.addEventListener('mouseup', this.handleMouseUp);
            c.addEventListener('mousemove', this.handleMouseMove);

            c.addEventListener('touchstart', this.handleTouchStart, {passive: false});
            c.addEventListener('touchend', this.handleTouchEnd, {passive: false});
            c.addEventListener('touchmove', this.handleTouchMove, {passive: false});
        }
    }

    update() {
        // Reset single-frame states
        this.pointer.isPressed = false;
        this.pointer.isReleased = false;

        // Copy current keys to prevKeys
        this.prevKeys = { ...this.keys };
    }

    // --- Keyboard Handlers ---
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    isKeyPressed(code) {
        return !!this.keys[code] && !this.prevKeys[code];
    }

    // --- Pointer Handlers ---
    updatePointerPos(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.pointer.x = clientX - rect.left;
        this.pointer.y = clientY - rect.top;
    }

    handleMouseDown(e) {
        this.pointer.isDown = true;
        this.pointer.isPressed = true;
        this.updatePointerPos(e, e.target);
    }

    handleMouseUp(e) {
        this.pointer.isDown = false;
        this.pointer.isReleased = true;
    }

    handleMouseMove(e) {
        this.updatePointerPos(e, e.target);
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.pointer.isDown = true;
        this.pointer.isPressed = true;
        this.updatePointerPos(e, e.target);
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.pointer.isDown = false;
        this.pointer.isReleased = true;
    }

    handleTouchMove(e) {
        e.preventDefault();
        this.updatePointerPos(e, e.target);
    }
}
