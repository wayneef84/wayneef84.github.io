/*
 * path.js
 * Handles path creation, validation, and rendering logic.
 */

function PathManager(grid) {
    this.grid = grid;
    this.paths = {}; // Map of color -> Array of cells
    this.completed = {}; // Map of color -> boolean
}

PathManager.prototype.reset = function() {
    this.paths = {};
    this.completed = {};
};

PathManager.prototype.startPath = function(x, y) {
    var cell = this.grid.getCell(x, y);
    if (!cell) return null;

    // Must start on a Source or an existing Pipe of that color
    var color = cell.color;
    if (!color) return null;

    // If starting on a source, clear existing path for this color (unless we are continuing from the *other* source end? No, simplified: touch source = reset path usually, or continue)
    // Actually, usually:
    // - Touch Source: Start new path from here.
    // - Touch Pipe End: Continue path.
    // - Touch Pipe Middle: Cut path here?

    // Simplest implementation:
    // If Source: Clear old path, start new [Source].
    // If Pipe: Truncate path to here.

    if (cell.type === CellType.SOURCE) {
        // Find if this source is already connected?
        // For now, just reset.
        this.clearPath(color);
        this.paths[color] = [cell];
        this.completed[color] = false;
        return color;
    } else if (cell.type === CellType.PIPE) {
        // Truncate
        var path = this.paths[color];
        var idx = path.indexOf(cell);
        if (idx !== -1) {
            // Remove cells after this one from grid
            for (var i = idx + 1; i < path.length; i++) {
                var p = path[i];
                if (p.type === CellType.PIPE) {
                    p.type = CellType.EMPTY;
                    p.color = null;
                }
            }
            // Truncate array
            this.paths[color] = path.slice(0, idx + 1);
            this.completed[color] = false;
            return color;
        }
    }
    return null;
};

PathManager.prototype.extendPath = function(color, x, y) {
    var path = this.paths[color];
    if (!path || path.length === 0) return;

    var head = path[path.length - 1];
    var target = this.grid.getCell(x, y);

    // 1. Must be neighbor
    if (Math.abs(head.x - target.x) + Math.abs(head.y - target.y) !== 1) return;

    // 2. Backtracking: If target is the previous cell in path
    if (path.length > 1 && path[path.length - 2] === target) {
        // Backtrack
        var removed = path.pop();
        if (removed.type === CellType.PIPE) {
            removed.type = CellType.EMPTY;
            removed.color = null;
        }
        this.completed[color] = false;
        return;
    }

    // 3. Collision Check
    if (target.type !== CellType.EMPTY) {
        // Allow connecting to SAME COLOR SOURCE
        if (target.type === CellType.SOURCE && target.color === color) {
            // Check if it's the *other* source (not the one we started at)
            if (target !== path[0]) {
                // Complete!
                path.push(target);
                this.completed[color] = true;
            }
        }
        // Block everything else (Walls, other pipes, own pipe loops)
        return;
    }

    // 4. Move Valid: Add Pipe
    target.type = CellType.PIPE;
    target.color = color;
    path.push(target);
};

PathManager.prototype.clearPath = function(color) {
    var path = this.paths[color];
    if (!path) return;

    for (var i = 0; i < path.length; i++) {
        var cell = path[i];
        if (cell.type === CellType.PIPE) {
            cell.type = CellType.EMPTY;
            cell.color = null;
        }
    }
    delete this.paths[color];
    delete this.completed[color];
};

PathManager.prototype.isLevelComplete = function() {
    // 1. All sources connected?
    // Count sources in grid? Or pass in expected number?
    // We can check if `completed` keys match expected colors.
    // For now, let's just check if we have any incomplete paths? No.

    // Better: Iterate all sources in grid, ensure they are connected.
    // Simpler: Just return true if all *current* paths are complete and fill the board?
    // "Flow Free" requires all pairs connected AND board 100% full (usually).

    // Let's rely on the Game to know how many pairs exist.
    // But basic check:
    for (var key in this.paths) {
        if (!this.completed[key]) return false;
    }
    // Also check if we found paths for ALL colors?
    // Assuming Game handles "You Won" logic based on this + pair count.

    return true;
};

PathManager.prototype.getCompletionPercent = function() {
    var filled = 0;
    var total = this.grid.width * this.grid.height;
    for (var y = 0; y < this.grid.height; y++) {
        for (var x = 0; x < this.grid.width; x++) {
            if (this.grid.getCell(x, y).type !== CellType.EMPTY) {
                filled++;
            }
        }
    }
    return Math.floor((filled / total) * 100);
};
