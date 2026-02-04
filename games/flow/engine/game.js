/*
 * game.js
 * Main entry point for the game engine.
 */

function Game(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.grid = null;
    this.inputHandler = null;
    this.pathManager = null;

    this.init();
}

Game.prototype.init = function() {
    console.log("Initializing Flow Game Engine...");

    // Initialize Subsystems
    this.grid = new Grid(5, 5); // Default 5x5 grid
    this.pathManager = new PathManager(this.grid);
    this.inputHandler = new InputHandler(this.canvas, this);

    // Start Loop
    this.lastTime = 0;
    requestAnimationFrame(this.loop.bind(this));
};

Game.prototype.update = function(dt) {
    // Update game logic
};

Game.prototype.render = function() {
    // Clear canvas
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render Grid
    this.renderGrid();
};

Game.prototype.renderGrid = function() {
    if (!this.grid) return;

    var cellSize = Math.min(this.width, this.height) / this.grid.width;

    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var cell = this.grid.getCell(x, y);
            this.ctx.strokeStyle = '#444';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
};

Game.prototype.loop = function(timestamp) {
    var dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
};
