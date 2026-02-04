/*
 * level_generator.js
 * Generates solvable random levels for Flow Free.
 */

function LevelGenerator() {}

/**
 * Generates a random level.
 * @param {number} width Grid width
 * @param {number} height Grid height
 * @param {number} numPairs Number of color pairs to generate (optional, tries to maximize if null)
 * @returns {object} Level definition { width, height, sources: [{x, y, color}, ...] }
 */
LevelGenerator.prototype.generate = function(width, height, numPairs) {
    var grid = [];
    for (var y = 0; y < height; y++) {
        var row = [];
        for (var x = 0; x < width; x++) {
            row.push({ x: x, y: y, used: false, color: null });
        }
        grid.push(row);
    }

    var availableColors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
        '#FFA500', '#800080', '#A52A2A', '#008080', '#FFC0CB', '#4B0082'
    ];

    // Safety clamp
    if (numPairs > availableColors.length) numPairs = availableColors.length;

    var paths = [];
    var attempts = 0;

    // Strategy: Simple Random Walk with Backtracking support is hard in JS without recursion limits.
    // We will use a "Wander and Avoid" strategy for simplicity in this version.
    // 1. Pick a random empty cell.
    // 2. Walk as far as possible.
    // 3. If path length > 1, save it as a color.

    var colorIndex = 0;

    // Try to fill the grid
    var filledCount = 0;
    var targetFill = width * height;

    // Limit iterations to prevent infinite loops
    for (var i = 0; i < 1000; i++) {
        if (filledCount >= targetFill - 2) break; // Good enough
        if (numPairs && colorIndex >= numPairs) break;

        var start = this.findRandomEmpty(grid, width, height);
        if (!start) break;

        var path = this.generatePath(grid, width, height, start, availableColors[colorIndex]);

        if (path.length >= 3) { // Minimum path length preference
            paths.push(path);
            filledCount += path.length;
            colorIndex++;
            if (colorIndex >= availableColors.length) break;
        } else {
            // Backtrack/Clear failed short path
            this.clearPath(grid, path);
        }
    }

    // Extract sources
    var sources = [];
    for (var i = 0; i < paths.length; i++) {
        var p = paths[i];
        sources.push({ x: p[0].x, y: p[0].y, color: availableColors[i] });
        sources.push({ x: p[p.length - 1].x, y: p[p.length - 1].y, color: availableColors[i] });
    }

    return {
        width: width,
        height: height,
        sources: sources
    };
};

LevelGenerator.prototype.findRandomEmpty = function(grid, width, height) {
    var empty = [];
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (!grid[y][x].used) empty.push(grid[y][x]);
        }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
};

LevelGenerator.prototype.generatePath = function(grid, width, height, start, color) {
    var path = [start];
    start.used = true;
    start.color = color;

    var current = start;

    // Walk until stuck
    while (true) {
        var neighbors = this.getFreeNeighbors(grid, width, height, current);
        if (neighbors.length === 0) break;

        // Prefer neighbors that have fewer free neighbors themselves (heuristic to fill corners)
        // neighbors.sort((a, b) => this.countFreeNeighbors(grid, width, height, a) - this.countFreeNeighbors(grid, width, height, b));

        // Random pick for now
        var next = neighbors[Math.floor(Math.random() * neighbors.length)];

        next.used = true;
        next.color = color;
        path.push(next);
        current = next;

        // Randomly stop to allow other paths? No, try to be greedy to fill board.
    }

    return path;
};

LevelGenerator.prototype.getFreeNeighbors = function(grid, width, height, cell) {
    var res = [];
    var dirs = [{x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}];
    for (var i = 0; i < dirs.length; i++) {
        var nx = cell.x + dirs[i].x;
        var ny = cell.y + dirs[i].y;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (!grid[ny][nx].used) {
                res.push(grid[ny][nx]);
            }
        }
    }
    return res;
};

LevelGenerator.prototype.clearPath = function(grid, path) {
    for (var i = 0; i < path.length; i++) {
        path[i].used = false;
        path[i].color = null;
    }
};
