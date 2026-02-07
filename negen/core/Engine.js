/**
 * NEGEN Engine - Core
 * The main entry point for the game loop.
 */
export default class Engine {
    /**
     * @param {Object} config Configuration object
     * @param {HTMLElement} config.canvas The canvas element (optional)
     * @param {number} config.width Target width
     * @param {number} config.height Target height
     */
    constructor(config = {}) {
        this.canvas = config.canvas;
        this.width = config.width || 800;
        this.height = config.height || 600;

        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.timeStep = 1000 / 60; // 60 FPS

        this.isRunning = false;
        this.animationFrameId = null;

        // Systems
        this.input = null; // To be attached
        this.audio = null; // To be attached
        this.renderer = null; // To be attached

        this.scene = null; // Current active scene
    }

    /**
     * Attach a system to the engine.
     * @param {string} name System name (input, audio, renderer)
     * @param {Object} system System instance
     */
    registerSystem(name, system) {
        this[name] = system;
        if (system.init) system.init(this);
    }

    /**
     * Set the active scene.
     * @param {Object} scene A scene object implementing update() and draw()
     */
    loadScene(scene) {
        if (this.scene && this.scene.exit) this.scene.exit();
        this.scene = scene;
        if (this.scene.enter) this.scene.enter(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
        console.log("NEGEN Engine Started");
    }

    stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationFrameId);
        console.log("NEGEN Engine Stopped");
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulatedTime += deltaTime;

        // Fixed timestep update
        while (this.accumulatedTime >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulatedTime -= this.timeStep;
        }

        this.draw();

        this.animationFrameId = requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }
        if (this.input && this.input.update) {
            this.input.update();
        }
    }

    draw() {
        if (this.renderer) {
            this.renderer.clear();
            if (this.scene && this.scene.draw) {
                this.scene.draw(this.renderer);
            }
        }
    }
}
