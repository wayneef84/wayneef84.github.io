(function() {

    // Constants
    var TILE_W = 60;
    var TILE_H = 80;
    var TILE_D = 10; // Depth/Thickness
    var SHADOW_OFFSET = 5;

    var Game = function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.board = new MahjongBoard();
        this.layoutName = 'turtle';

        this.selectedTile = null;
        this.score = 0;
        this.hints = 3;

        this.camera = { x: 0, y: 0 };

        // Bind methods
        this.handleClick = this.handleClick.bind(this);
        this.loop = this.loop.bind(this);

        // Init Input
        this.canvas.addEventListener('click', this.handleClick);

        // Start
        this.newGame();
        this.loop();
    };

    Game.prototype.newGame = function() {
        var layoutGen = MahjongData.LAYOUTS[this.layoutName];
        if (!layoutGen) {
            console.error("Layout not found:", this.layoutName);
            return;
        }

        this.board.init(layoutGen());
        this.selectedTile = null;
        this.score = 0;
        this.hints = 3;

        this.centerCamera();
        this.draw();

        // Update UI if present
        var scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = this.score;
    };

    Game.prototype.centerCamera = function() {
        // Compute bounds of tiles
        var minX = Infinity, maxX = -Infinity;
        var minY = Infinity, maxY = -Infinity;

        for (var i = 0; i < this.board.tiles.length; i++) {
            var t = this.board.tiles[i];
            var sx = t.x * (TILE_W / 2);
            var sy = t.y * (TILE_H / 2) - t.z * TILE_D;

            if (sx < minX) minX = sx;
            if (sx + TILE_W > maxX) maxX = sx + TILE_W;
            if (sy < minY) minY = sy;
            if (sy + TILE_H > maxY) maxY = sy + TILE_H;
        }

        var boardW = maxX - minX;
        var boardH = maxY - minY;

        this.camera.x = (this.canvas.width - boardW) / 2 - minX;
        this.camera.y = (this.canvas.height - boardH) / 2 - minY;
    };

    Game.prototype.loop = function() {
        this.draw();
        requestAnimationFrame(this.loop);
    };

    Game.prototype.draw = function() {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(this.camera.x, this.camera.y);

        // Sort tiles for Painter's Algorithm
        // Order: Z asc, Y asc, X asc
        // Why Y asc? Lower Y is "back", higher Y is "front".
        // Why X asc? usually left to right.
        var sortedTiles = this.board.tiles.slice().sort(function(a, b) {
            if (a.z !== b.z) return a.z - b.z;
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        for (var i = 0; i < sortedTiles.length; i++) {
            var tile = sortedTiles[i];
            if (!tile.isRemoved) {
                this.drawTile(ctx, tile);
            }
        }

        ctx.restore();
    };

    Game.prototype.drawTile = function(ctx, tile) {
        var sx = tile.x * (TILE_W / 2);
        var sy = tile.y * (TILE_H / 2) - tile.z * TILE_D;

        // Calculate interaction state for visual feedback
        var isFree = this.board.isFree(tile);
        var isSelected = tile.isSelected;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.roundRect(ctx, sx + SHADOW_OFFSET, sy + SHADOW_OFFSET, TILE_W, TILE_H, 5);
        ctx.fill();

        // Side/Depth (Darker)
        // Draw slightly offset to simulate thickness
        // Bottom-Right offset for thickness
        var depthX = 4;
        var depthY = 4;

        ctx.fillStyle = '#1b5e20'; // Dark Green back
        this.roundRect(ctx, sx + depthX, sy + depthY, TILE_W, TILE_H, 5);
        ctx.fill();

        // Face (Ivory/Bone)
        if (isSelected) {
            ctx.fillStyle = '#fff9c4'; // Yellowish highlight
        } else if (!isFree) {
            ctx.fillStyle = '#e0e0e0'; // Dimmed/Grayed if blocked?
            // Standard Mahjong usually keeps same color but maybe darkened.
            // Let's keep it ivory but maybe slight tint.
            ctx.fillStyle = '#f0f0e0';
        } else {
            ctx.fillStyle = '#fcfcf0'; // Bright Ivory
        }

        // Draw Face
        this.roundRect(ctx, sx, sy, TILE_W, TILE_H, 5);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ff0000' : '#8d6e63';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        // Draw Symbol
        this.drawSymbol(ctx, tile, sx, sy);

        // Overlay for blocked?
        if (!isFree) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.roundRect(ctx, sx, sy, TILE_W, TILE_H, 5);
            ctx.fill();
        }
    };

    Game.prototype.roundRect = function(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    Game.prototype.drawSymbol = function(ctx, tile, x, y) {
        // Center text
        var cx = x + TILE_W / 2;
        var cy = y + TILE_H / 2 + 5;

        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Color coding
        if (tile.type === 'DOTS') ctx.fillStyle = '#1565c0'; // Blue
        else if (tile.type === 'BAMS') ctx.fillStyle = '#2e7d32'; // Green
        else if (tile.type === 'CRAKS') ctx.fillStyle = '#c62828'; // Red
        else if (tile.type === 'WINDS') ctx.fillStyle = '#000000'; // Black
        else if (tile.type === 'DRAGONS') {
            if (tile.value === 'R') ctx.fillStyle = '#d32f2f';
            else if (tile.value === 'G') ctx.fillStyle = '#388e3c';
            else ctx.fillStyle = '#1976d2'; // White usually blue frame in some sets
        }
        else if (tile.type === 'FLOWERS') ctx.fillStyle = '#e91e63'; // Pink
        else if (tile.type === 'SEASONS') ctx.fillStyle = '#ff9800'; // Orange

        // Font
        ctx.font = '32px serif';

        // Symbol Logic
        var text = tile.value;

        // Custom rendering for some types
        if (tile.type === 'DOTS') {
            text = '● ' + tile.value; // U+25CF
        } else if (tile.type === 'BAMS') {
            text = '🎋 ' + tile.value; // Bamboo
        } else if (tile.type === 'CRAKS') {
            text = tile.value + ' 万';
        }

        ctx.fillText(text, cx, cy);

        // Small corner index for clarity
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#555';
        ctx.fillText(tile.value, x + 10, y + 10);
    };

    Game.prototype.handleClick = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left - this.camera.x;
        var my = e.clientY - rect.top - this.camera.y;

        // Find top-most tile under cursor
        // Sort Z Descending
        var activeTiles = [];
        for (var i = 0; i < this.board.tiles.length; i++) {
            if (!this.board.tiles[i].isRemoved) activeTiles.push(this.board.tiles[i]);
        }

        activeTiles.sort(function(a, b) {
            return b.z - a.z; // Top first
        });

        for (var i = 0; i < activeTiles.length; i++) {
            var t = activeTiles[i];

            // Hit Test against Face Rect
            var sx = t.x * (TILE_W / 2);
            var sy = t.y * (TILE_H / 2) - t.z * TILE_D;

            if (mx >= sx && mx < sx + TILE_W && my >= sy && my < sy + TILE_H) {
                // Clicked this tile
                this.onTileClick(t);
                return; // Stop after hitting top-most
            }
        }
    };

    Game.prototype.onTileClick = function(tile) {
        if (!this.board.isFree(tile)) {
            console.log("Tile is blocked");
            // Optional: Shake animation or sound
            return;
        }

        if (this.selectedTile === tile) {
            // Deselect
            tile.isSelected = false;
            this.selectedTile = null;
            this.draw();
            return;
        }

        if (this.selectedTile) {
            // Check Match
            if (this.selectedTile.matches(tile)) {
                // Match!
                this.board.removePair(this.selectedTile, tile);
                this.selectedTile = null;
                this.score += 10;

                // Update Score UI
                var s = document.getElementById('score');
                if (s) s.textContent = this.score;

                // Check Win
                if (this.board.isWin()) {
                    alert("Congratulations! You won!");
                }
            } else {
                // Mismatch -> Select new
                this.selectedTile.isSelected = false;
                tile.isSelected = true;
                this.selectedTile = tile;
            }
        } else {
            // Select First
            tile.isSelected = true;
            this.selectedTile = tile;
        }
        this.draw();
    };

    Game.prototype.undo = function() {
        if (this.board.undo()) {
            this.selectedTile = null; // Clear selection on undo
            this.draw();
        }
    };

    Game.prototype.shuffle = function() {
        // Simple reshuffle
        // Keep positions, swap types/values
        // Only active tiles
        // Not implemented in Board yet?
        // Board.reshuffle() should do it.
        // Wait, I implemented reshuffle logic in Board.prototype.reshuffle manually in previous step thought, let's verify if I wrote it.
        // I wrote `Board.prototype.reshuffle`.

        this.board.reshuffle();
        this.selectedTile = null;
        this.draw();
    };

    Game.prototype.hint = function() {
        if (this.hints <= 0) return;

        var pair = this.board.getHint();
        if (pair) {
            this.hints--;
            // Highlight pair momentarily
            // For now, just select the first one
            // Or log it?
            // Let's Flash them.
            // Or just select both.
            // But we only support single selection state.
            // Let's just select pair[0] and flash pair[1].

            pair[0].isSelected = true;
            this.selectedTile = pair[0]; // Set logic state

            // Visual feedback for pair[1]
            // We can add a temporary highlight property or just rely on user finding it.
            // Let's keep it simple: Select first one.

            this.draw();
        } else {
            alert("No moves left! Try Shuffle.");
        }

        var h = document.getElementById('hints');
        if (h) h.textContent = this.hints;
    };

    // Export
    window.MahjongGame = Game;

})();
