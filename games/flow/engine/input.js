/*
 * input.js
 * Handles mouse and touch input, translating screen coordinates to grid cells.
 */

function InputHandler(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.isDragging = false;

    this.attachEvents();
}

InputHandler.prototype.attachEvents = function() {
    var self = this;

    // Mouse Events
    this.canvas.addEventListener('mousedown', function(e) { self.handleStart(e); });
    this.canvas.addEventListener('mousemove', function(e) { self.handleMove(e); });
    this.canvas.addEventListener('mouseup', function(e) { self.handleEnd(e); });
    this.canvas.addEventListener('mouseleave', function(e) { self.handleEnd(e); });

    // Touch Events
    this.canvas.addEventListener('touchstart', function(e) { self.handleStart(e); }, {passive: false});
    this.canvas.addEventListener('touchmove', function(e) { self.handleMove(e); }, {passive: false});
    this.canvas.addEventListener('touchend', function(e) { self.handleEnd(e); });
};

InputHandler.prototype.getGridCoordinates = function(event) {
    var rect = this.canvas.getBoundingClientRect();
    var clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    var x = clientX - rect.left;
    var y = clientY - rect.top;

    // Map to grid
    // We need the render metrics from the game/grid
    // Ideally, Game should expose "screenToGrid(x, y)" or we calculate here if we know cellSize.
    // Let's ask Game.
    return this.game.screenToGrid(x, y);
};

InputHandler.prototype.handleStart = function(e) {
    e.preventDefault(); // Prevent scroll on touch
    var coords = this.getGridCoordinates(e);
    if (coords) {
        this.isDragging = true;
        this.game.handleInputStart(coords.x, coords.y);
    }
};

InputHandler.prototype.handleMove = function(e) {
    e.preventDefault();
    if (!this.isDragging) return;
    var coords = this.getGridCoordinates(e);
    if (coords) {
        this.game.handleInputMove(coords.x, coords.y);
    }
};

InputHandler.prototype.handleEnd = function(e) {
    e.preventDefault();
    if (this.isDragging) {
        this.isDragging = false;
        this.game.handleInputEnd();
    }
};
