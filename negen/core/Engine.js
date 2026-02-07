/**
 * negen/core/Engine.js
 * The heartbeat of the Negen Engine.
 * Implements a fixed-step update loop with variable-step rendering.
 */
(function(global) {
    'use strict';

    // Defaults
    var DEFAULT_FPS = 60;
    var STEP = 1 / DEFAULT_FPS;
    var MAX_FRAME_TIME = 0.25; // Prevent spiral of death on lag spikes

    var Engine = function(options) {
        options = options || {};
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.scene = null;
        this.renderer = options.renderer || null;

        // Bind context
        this._loop = this._loop.bind(this);
        this._handleVisibilityChange = this._handleVisibilityChange.bind(this);

        // Visibility API for auto-pause
        document.addEventListener('visibilitychange', this._handleVisibilityChange);
    };

    Engine.prototype.start = function() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now() / 1000;
        this.accumulator = 0;
        requestAnimationFrame(this._loop);
    };

    Engine.prototype.stop = function() {
        this.isRunning = false;
    };

    Engine.prototype.loadScene = function(scene) {
        if (this.scene && this.scene.exit) {
            this.scene.exit();
        }
        this.scene = scene;
        if (this.scene && this.scene.enter) {
            this.scene.enter(this);
        }
    };

    Engine.prototype._loop = function(timestamp) {
        if (!this.isRunning) return;

        var currentTime = timestamp / 1000; // Seconds
        var frameTime = currentTime - this.lastTime;
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
        var alpha = this.accumulator / STEP;
        this._draw(alpha);

        requestAnimationFrame(this._loop);
    };

    Engine.prototype._update = function(dt) {
        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }
    };

    Engine.prototype._draw = function(alpha) {
        if (this.renderer) {
            this.renderer.clear();
            if (this.scene && this.scene.draw) {
                this.scene.draw(this.renderer, alpha);
            }
        }
    };

    Engine.prototype._handleVisibilityChange = function() {
        if (document.hidden) {
            this.stop();
        } else {
            // Reset timer on resume to avoid huge delta jumps
            this.lastTime = performance.now() / 1000;
            this.start();
        }
    };

    // Export
    global.Negen = global.Negen || {};
    global.Negen.Engine = Engine;

})(typeof window !== 'undefined' ? window : this);
