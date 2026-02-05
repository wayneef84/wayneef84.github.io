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
    this.levelGenerator = null;

    this.activeColor = null;
    this.totalPairs = 0;

    this.init();
}

Game.prototype.init = function() {
    console.log("Initializing Flow Game Engine...");

    // Initialize Subsystems
    this.levelGenerator = new LevelGenerator();
    this.grid = new Grid(5, 5); // Default
    this.pathManager = new PathManager(this.grid);
    this.inputHandler = new InputHandler(this.canvas, this);

    // Start Loop
    this.lastTime = 0;
    requestAnimationFrame(this.loop.bind(this));

    // Start initial random game
    this.startRandomLevel(5, 5, 5);
};

Game.prototype.startRandomLevel = function(width, height, numPairs) {
    // Generate Level
    var level = this.levelGenerator.generate(width, height, numPairs);

    // Load into Grid
    this.grid.loadLevel(level);
    this.pathManager.reset();

    this.totalPairs = level.sources.length / 2;
    this.activeColor = null;

    console.log("Started Level: " + width + "x" + height + " with " + this.totalPairs + " pairs.");
};

Game.prototype.screenToGrid = function(screenX, screenY) {
    if (!this.grid) return null;

    var cellSize = Math.min(this.width, this.height) / Math.max(this.grid.width, this.grid.height);
    // Centering offset
    var offsetX = (this.width - (cellSize * this.grid.width)) / 2;
    var offsetY = (this.height - (cellSize * this.grid.height)) / 2;

    var col = Math.floor((screenX - offsetX) / cellSize);
    var row = Math.floor((screenY - offsetY) / cellSize);

    if (col >= 0 && col < this.grid.width && row >= 0 && row < this.grid.height) {
        return { x: col, y: row };
    }
    return null;
};

// Input Delegates
Game.prototype.handleInputStart = function(x, y) {
    var color = this.pathManager.startPath(x, y);
    if (color) {
        this.activeColor = color;
        // Force a render or update logic?
    }
};

Game.prototype.handleInputMove = function(x, y) {
    if (this.activeColor) {
        var path = this.pathManager.paths[this.activeColor];
        if (!path || path.length === 0) return;

        // Loop to interpolate path if input skipped cells
        var maxSteps = 100; // Safety limit

        while (maxSteps-- > 0) {
            var head = path[path.length - 1];
            if (head.x === x && head.y === y) break;

            // If adjacent or same, just try to move
            if (Math.abs(head.x - x) + Math.abs(head.y - y) <= 1) {
                this.pathManager.extendPath(this.activeColor, x, y);
                break;
            }

            // Interpolate towards target
            var dx = x - head.x;
            var dy = y - head.y;
            var moved = false;

            // Try major axis first
            var tryXFirst = Math.abs(dx) >= Math.abs(dy);
            var attempts = [];

            var signX = (dx > 0) ? 1 : ((dx < 0) ? -1 : 0);
            var signY = (dy > 0) ? 1 : ((dy < 0) ? -1 : 0);

            if (tryXFirst) {
                if (signX !== 0) attempts.push({x: head.x + signX, y: head.y});
                if (signY !== 0) attempts.push({x: head.x, y: head.y + signY});
            } else {
                if (signY !== 0) attempts.push({x: head.x, y: head.y + signY});
                if (signX !== 0) attempts.push({x: head.x + signX, y: head.y});
            }

            for (var i = 0; i < attempts.length; i++) {
                var target = attempts[i];
                var lenBefore = path.length;
                this.pathManager.extendPath(this.activeColor, target.x, target.y);
                if (path.length !== lenBefore) {
                    moved = true;
                    break;
                }
            }

            if (!moved) break; // Stuck
        }

        if (this.pathManager.isLevelComplete()) {
            var percent = this.pathManager.getCompletionPercent();
            if (percent === 100 && this.checkAllPairsConnected()) {
                // Victory!
                // console.log("Victory!");
                // Just a visual cue for now, or alert?
            }
        }
    }
};

Game.prototype.handleInputEnd = function() {
    this.activeColor = null;
};

Game.prototype.checkAllPairsConnected = function() {
    var completedCount = 0;
    for (var key in this.pathManager.completed) {
        if (this.pathManager.completed[key]) completedCount++;
    }
    return completedCount === this.totalPairs;
};

// Rendering
Game.prototype.update = function(dt) {
    // Logic updates if needed (animations)
};

Game.prototype.render = function() {
    // Clear
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (!this.grid) return;

    var cellSize = Math.min(this.width, this.height) / Math.max(this.grid.width, this.grid.height);
    var offsetX = (this.width - (cellSize * this.grid.width)) / 2;
    var offsetY = (this.height - (cellSize * this.grid.height)) / 2;

    // Draw Grid Lines
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (var x = 0; x <= this.grid.width; x++) {
        this.ctx.moveTo(offsetX + x * cellSize, offsetY);
        this.ctx.lineTo(offsetX + x * cellSize, offsetY + this.grid.height * cellSize);
    }
    for (var y = 0; y <= this.grid.height; y++) {
        this.ctx.moveTo(offsetX, offsetY + y * cellSize);
        this.ctx.lineTo(offsetX + this.grid.width * cellSize, offsetY + y * cellSize);
    }
    this.ctx.stroke();

    // Draw Paths & Sources
    // We iterate cells to draw? Or iterate Paths?
    // Drawing pipes is better done by iterating paths to handle connections nicely.

    // 1. Draw Paths (Pipes)
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (var color in this.pathManager.paths) {
        var path = this.pathManager.paths[color];
        if (path.length < 1) continue;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = cellSize * 0.4;

        this.ctx.beginPath();
        // Move to center of first cell
        this.ctx.moveTo(
            offsetX + (path[0].x + 0.5) * cellSize,
            offsetY + (path[0].y + 0.5) * cellSize
        );

        for (var i = 1; i < path.length; i++) {
            this.ctx.lineTo(
                offsetX + (path[i].x + 0.5) * cellSize,
                offsetY + (path[i].y + 0.5) * cellSize
            );
        }
        this.ctx.stroke();
    }

    // 2. Draw Sources (Circles)
    // Also draw "Heads" of paths if dragging?

    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            var cell = this.grid.getCell(x, y);
            if (cell.type === CellType.SOURCE) {
                this.ctx.fillStyle = cell.color;
                var cx = offsetX + (x + 0.5) * cellSize;
                var cy = offsetY + (y + 0.5) * cellSize;
                var r = cellSize * 0.35;

                this.ctx.beginPath();
                this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
                this.ctx.fill();

                // Optional: Glow or border if complete?
            }
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
