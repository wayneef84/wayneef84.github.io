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
