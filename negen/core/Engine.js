/**
 * negen/core/Engine.js
 * The heartbeat of the Negen Engine.
 * Implements a fixed-step update loop with variable-step rendering.
 */

const DEFAULT_FPS = 60;
const STEP = 1 / DEFAULT_FPS;
const MAX_FRAME_TIME = 0.25; // Prevent spiral of death on lag spikes

export default class Engine {
    constructor(options = {}) {
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.scene = null;
        this.renderer = options.renderer || null;
        this.systems = []; // For Input, Audio, etc.

        // Store dimensions if provided
        this.width = options.width || 0;
        this.height = options.height || 0;
        this.canvas = options.canvas || null;

        // Bind context
        this._loop = this._loop.bind(this);
        this._handleVisibilityChange = this._handleVisibilityChange.bind(this);

        // Visibility API for auto-pause
        document.addEventListener('visibilitychange', this._handleVisibilityChange);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now() / 1000;
        this.accumulator = 0;
        requestAnimationFrame(this._loop);
    }

    stop() {
        this.isRunning = false;
    }

    registerSystem(name, system) {
        this[name] = system;
        this.systems.push(system);
        if (system.init) {
            system.init(this);
        }
    }

    loadScene(scene) {
        if (this.scene && this.scene.exit) {
            this.scene.exit();
        }
        this.scene = scene;
        if (this.scene && this.scene.enter) {
            this.scene.enter(this);
        }
    }

    _loop(timestamp) {
        if (!this.isRunning) return;

        const currentTime = timestamp / 1000; // Seconds
        let frameTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Cap frame time to prevent spiral of death
        if (frameTime > MAX_FRAME_TIME) {
            frameTime = MAX_FRAME_TIME;
        }

        this.accumulator += frameTime;

        // Fixed Update Loop (Logic)
        while (this.accumulator >= STEP) {
            this._update(STEP);
            this.accumulator -= STEP;
        }

        // Variable Render Loop (Graphics)
        // Passes interpolation alpha (0..1) for smooth visual smoothing
        const alpha = this.accumulator / STEP;
        this._draw(alpha);

        requestAnimationFrame(this._loop);
    }

    _update(dt) {
        // Update Systems (Input, Audio, etc.)
        for (const system of this.systems) {
            if (system.update) {
                system.update(dt);
            }
        }

        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }
    }

    _draw(alpha) {
        if (this.renderer) {
            this.renderer.clear();
            if (this.scene && this.scene.draw) {
                this.scene.draw(this.renderer, alpha);
            }
        }
    }

    _handleVisibilityChange() {
        if (document.hidden) {
            this.stop();
        } else {
            // Reset timer on resume to avoid huge delta jumps
            this.lastTime = performance.now() / 1000;
            this.start();
        }
    }
}

// Global Assignment for Backward Compatibility
if (typeof window !== 'undefined') {
    window.Negen = window.Negen || {};
    window.Negen.Engine = Engine;
}
