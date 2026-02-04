/*
 * grid.js
 * Manages the grid data structure, cell states, and neighbor logic.
 */

var CellType = {
    EMPTY: 0,
    SOURCE: 1,
    PIPE: 2,
    BRIDGE: 3,
    WALL: 4
};

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.type = CellType.EMPTY;
    this.color = null;
    this.connections = []; // Array of directions or neighbor objects
}

function Grid(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];

    this.init();
}

Grid.prototype.init = function() {
    this.cells = [];
    for (var y = 0; y < this.height; y++) {
        var row = [];
        for (var x = 0; x < this.width; x++) {
            row.push(new Cell(x, y));
        }
        this.cells.push(row);
    }
};

Grid.prototype.getCell = function(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        return this.cells[y][x];
    }
    return null;
};

Grid.prototype.setCell = function(x, y, type, color) {
    var cell = this.getCell(x, y);
    if (cell) {
        cell.type = type;
        if (color !== undefined) cell.color = color;
    }
};

Grid.prototype.clear = function() {
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var cell = this.cells[y][x];
            cell.type = CellType.EMPTY;
            cell.color = null;
            cell.connections = [];
        }
    }
};

Grid.prototype.loadLevel = function(level) {
    this.width = level.width;
    this.height = level.height;
    this.init(); // Re-init array structure

    for (var i = 0; i < level.sources.length; i++) {
        var s = level.sources[i];
        this.setCell(s.x, s.y, CellType.SOURCE, s.color);
    }
};

// Placeholder for neighbor logic (to be expanded for Hex/Warp)
Grid.prototype.getNeighbors = function(cell) {
    var neighbors = [];
    var dirs = [
        {dx: 0, dy: -1}, // North
        {dx: 1, dy: 0},  // East
        {dx: 0, dy: 1},  // South
        {dx: -1, dy: 0}  // West
    ];

    for (var i = 0; i < dirs.length; i++) {
        var dir = dirs[i];
        var nx = cell.x + dir.dx;
        var ny = cell.y + dir.dy;
        var neighbor = this.getCell(nx, ny);
        if (neighbor) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
};
