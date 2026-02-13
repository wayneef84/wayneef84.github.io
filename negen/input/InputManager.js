/**
 * NEGEN Input Manager (v2)
 * Unified handling for Keyboard, Mouse, Touch, and Gamepad.
 * Supports "Action Mapping", "Profiles", and "Debouncing".
 */
export default class InputManager {
    constructor() {
        this.keys = {};       // Current raw key state
        this.prevKeys = {};   // Previous frame key state

        // Pointer State (Mouse/Touch)
        this.pointer = {
            x: 0,
            y: 0,
            isDown: false,
            isPressed: false,
            isReleased: false,
            _framePressed: false, // Internal latch
            _frameReleased: false
        };
        this.activeTouchId = null;

        // Gamepad State
        this.gamepads = [];
        this.prevGamepadButtons = []; // Snapshot for edge detection

        // Action System
        this.actions = {}; // { "JUMP": { inputs: ['Space', 'Gamepad_0'], pressed: false, down: false, released: false, timer: 0, debounce: 0 } }

        // Profiles (Presets of bindings)
        this.profiles = {
            'default': {}
        };
        this.currentProfile = 'default';

        // Bindings
        this._bindMethods();
    }

    _bindMethods() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
    }

    init(engine) {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('gamepadconnected', (e) => console.log('Gamepad connected:', e.gamepad.id));

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

    /**
     * Define a logical action.
     * @param {string} name - Action Name (e.g., "FIRE")
     * @param {Array<string>} inputs - Array of input codes (e.g., ["Space", "KeyZ", "Gamepad_0"])
     * @param {number} debounceMs - Min time between triggers in ms
     */
    bindAction(name, inputs, debounceMs = 0) {
        this.profiles[this.currentProfile][name] = {
            inputs: inputs,
            debounce: debounceMs,
            lastTriggerTime: 0
        };

        // Initialize runtime state if not exists
        if (!this.actions[name]) {
            this.actions[name] = { down: false, pressed: false, released: false, value: 0 };
        }
    }

    setProfile(profileName) {
        if (!this.profiles[profileName]) {
            this.profiles[profileName] = {};
        }
        this.currentProfile = profileName;
    }

    update(dt = 0.016) {
        // 1. Reset Single-Frame States
        this.pointer.isPressed = this.pointer._framePressed;
        this.pointer.isReleased = this.pointer._frameReleased;

        // Clear latches for next frame
        this.pointer._framePressed = false;
        this.pointer._frameReleased = false;

        // 2. Poll Gamepads
        this._pollGamepads();

        // 3. Update Actions based on current bindings
        const bindings = this.profiles[this.currentProfile];
        const now = performance.now();

        for (const [actionName, config] of Object.entries(bindings)) {
            let isDown = false;
            let value = 0; // For analog support later

            // Check all bound inputs
            for (const code of config.inputs) {
                if (this._checkInput(code)) {
                    isDown = true;
                    value = 1; // Binary for now
                    break;
                }
            }

            const state = this.actions[actionName] || { down: false, pressed: false, released: false };
            const wasDown = state.down;

            state.down = isDown;
            state.value = value;
            state.pressed = false;
            state.released = false;

            if (isDown && !wasDown) {
                // Check Debounce
                if (now - config.lastTriggerTime >= config.debounce) {
                    state.pressed = true;
                    config.lastTriggerTime = now;
                } else {
                    // Ignored by debounce, treat as held?
                    // Usually we just ignore the 'pressed' event but 'down' remains true.
                }
            }

            if (!isDown && wasDown) {
                state.released = true;
            }

            this.actions[actionName] = state;
        }

        // 4. Cycle Keys
        this.prevKeys = { ...this.keys };
    }

    _checkInput(code) {
        // Gamepad Checks
        if (code.startsWith('Gamepad_Btn')) {
            const btnIndex = parseInt(code.split('_')[2]);
            return this._isGamepadBtnDown(btnIndex);
        }
        if (code.startsWith('Gamepad_Axis')) {
            // e.g. Gamepad_Axis_0_Pos (Left Stick Right)
            return this._checkGamepadAxis(code);
        }

        // Mouse Checks
        if (code === 'MouseLeft') return this.pointer.isDown;

        // Keyboard Checks
        return !!this.keys[code];
    }

    _pollGamepads() {
        const gps = navigator.getGamepads ? navigator.getGamepads() : [];
        this.gamepads = [];
        for(let i=0; i<gps.length; i++) {
            if(gps[i]) this.gamepads.push(gps[i]);
        }
    }

    _isGamepadBtnDown(btnIndex) {
        // Any connected gamepad
        for(const gp of this.gamepads) {
            if (gp.buttons[btnIndex] && gp.buttons[btnIndex].pressed) return true;
        }
        return false;
    }

    _checkGamepadAxis(code) {
        // Format: Gamepad_Axis_Index_Dir (e.g. "Gamepad_Axis_0_Pos" for X > 0.5)
        const parts = code.split('_');
        const axisIndex = parseInt(parts[2]);
        const dir = parts[3]; // 'Pos' (+) or 'Neg' (-)

        for(const gp of this.gamepads) {
            if (gp.axes[axisIndex]) {
                const val = gp.axes[axisIndex];
                if (dir === 'Pos' && val > 0.5) return true;
                if (dir === 'Neg' && val < -0.5) return true;
            }
        }
        return false;
    }

    // --- Public Queries ---

    isActive(actionName) {
        return this.actions[actionName] && this.actions[actionName].down;
    }

    isJustPressed(actionName) {
        return this.actions[actionName] && this.actions[actionName].pressed;
    }

    isJustReleased(actionName) {
        return this.actions[actionName] && this.actions[actionName].released;
    }

    // --- Low Level Handlers ---

    handleKeyDown(e) { this.keys[e.code] = true; }
    handleKeyUp(e) { this.keys[e.code] = false; }

    updatePointerPos(e, canvas, touch = null) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (touch) {
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Scale for canvas resolution vs css size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        this.pointer.x = (clientX - rect.left) * scaleX;
        this.pointer.y = (clientY - rect.top) * scaleY;
    }

    handleMouseDown(e) {
        this.pointer.isDown = true;
        this.pointer._framePressed = true; // Latch
        this.updatePointerPos(e, e.target);
    }
    handleMouseUp(e) {
        this.pointer.isDown = false;
        this.pointer._frameReleased = true; // Latch
    }
    handleMouseMove(e) { this.updatePointerPos(e, e.target); }

    handleTouchStart(e) {
        e.preventDefault();
        // Track the newest touch
        if (e.changedTouches.length > 0) {
            const touch = e.changedTouches[e.changedTouches.length - 1];
            this.activeTouchId = touch.identifier;
            this.pointer.isDown = true;
            this.pointer._framePressed = true;
            this.updatePointerPos(e, e.target, touch);
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        let activeEnded = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.activeTouchId) {
                activeEnded = true;
                break;
            }
        }

        if (activeEnded) {
            if (e.touches.length > 0) {
                // Switch to last remaining touch
                const newTouch = e.touches[e.touches.length - 1];
                this.activeTouchId = newTouch.identifier;
                this.updatePointerPos(e, e.target, newTouch);
            } else {
                this.pointer.isDown = false;
                this.pointer._frameReleased = true;
                this.activeTouchId = null;
            }
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === this.activeTouchId) {
                this.updatePointerPos(e, e.target, e.changedTouches[i]);
                break;
            }
        }
    }
}
