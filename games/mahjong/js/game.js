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
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                e.preventDefault();
                var touch = e.touches[0];
                this.handleClick({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    target: this.canvas
                });
            }
        }, {passive: false});

        window.addEventListener('beforeunload', (e) => {
            if (this.board.history.length > 0 && !this.board.isWin()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

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

        var isFree = this.board.isFree(tile);
        var isSelected = tile.isSelected;

        // Constants for 3D look
        var radius = 6;
        var depthX = 6;
        var depthY = 6;

        // --- 1. Shadow ---
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.roundRect(ctx, sx + SHADOW_OFFSET + 2, sy + SHADOW_OFFSET + 2, TILE_W, TILE_H, radius);
        ctx.fill();

        // --- 2. Side (Depth - Back of the tile) ---
        // Create a gradient for the green plastic backing
        var gradSide = ctx.createLinearGradient(sx + depthX, sy + depthY, sx + depthX + TILE_W, sy + depthY + TILE_H);
        gradSide.addColorStop(0, '#43a047'); // Lighter green top-left
        gradSide.addColorStop(1, '#1b5e20'); // Darker green bottom-right

        ctx.fillStyle = gradSide;
        this.roundRect(ctx, sx + depthX, sy + depthY, TILE_W, TILE_H, radius);
        ctx.fill();

        // Side Stroke
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- 3. Face (Top Surface) ---
        // Ivory / Bone gradient
        var gradFace = ctx.createLinearGradient(sx, sy, sx + TILE_W, sy + TILE_H);

        if (isSelected) {
            gradFace.addColorStop(0, '#fffde7'); // Very light yellow
            gradFace.addColorStop(1, '#fff59d'); // Yellowish
        } else {
            gradFace.addColorStop(0, '#ffffff'); // Pure white highlight
            gradFace.addColorStop(1, '#e0e0e0'); // Ivory shadow
        }

        ctx.fillStyle = gradFace;
        this.roundRect(ctx, sx, sy, TILE_W, TILE_H, radius);
        ctx.fill();

        // Face Border
        if (isSelected) {
            ctx.strokeStyle = '#d32f2f'; // Red selection
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#bdbdbd'; // Subtle greyish border
            ctx.lineWidth = 1;
        }
        ctx.stroke();

        // Highlight (Top Gloss)
        ctx.beginPath();
        ctx.moveTo(sx + radius, sy + 2);
        ctx.lineTo(sx + TILE_W - radius, sy + 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- 4. Symbol ---
        this.drawSymbol(ctx, tile, sx, sy);

        // --- 5. Blocked Overlay ---
        if (!isFree) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Darken blocked tiles
            this.roundRect(ctx, sx, sy, TILE_W, TILE_H, radius);
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
        var w = TILE_W;
        var h = TILE_H;

        // Reset Styles
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        switch (tile.type) {
            case 'DOTS':
                this.drawDots(ctx, tile.value, x, y, w, h);
                break;
            case 'BAMS':
                this.drawBams(ctx, tile.value, x, y, w, h);
                break;
            case 'CRAKS':
                this.drawCraks(ctx, tile.value, x, y, w, h);
                break;
            case 'WINDS':
                this.drawWind(ctx, tile.value, x, y, w, h);
                break;
            case 'DRAGONS':
                this.drawDragon(ctx, tile.value, x, y, w, h);
                break;
            case 'FLOWERS':
            case 'SEASONS':
                this.drawFlowerSeason(ctx, tile.type, tile.value, x, y, w, h);
                break;
            default:
                ctx.fillStyle = '#000';
                ctx.font = '24px serif';
                ctx.fillText(tile.value, x + w / 2, y + h / 2);
                break;
        }

        // Small corner index for debug/clarity (optional, maybe remove for cleaner look? Keeping it subtle)
        // ctx.font = '10px sans-serif';
        // ctx.fillStyle = 'rgba(0,0,0,0.2)';
        // ctx.fillText(tile.value, x + 10, y + 10);
    };

    // --- Helpers for Symbols ---

    Game.prototype.drawDots = function(ctx, value, x, y, w, h) {
        // Colors
        var cRed = '#d32f2f';
        var cGreen = '#388e3c';
        var cBlue = '#1976d2';

        var cx = x + w / 2;
        var cy = y + h / 2;
        var size = 10; // Dot radius

        var val = parseInt(value);

        // Helper to draw circle
        var circle = function(px, py, color, r) {
            ctx.beginPath();
            ctx.arc(px, py, r || size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            // detailed inner ring
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        // Positions relative to center
        var d = 16; // spacing

        switch (val) {
            case 1:
                // Large circle
                circle(cx, cy, cRed, 18);
                // Maybe a small inner detail
                circle(cx, cy, '#b71c1c', 8);
                break;
            case 2:
                circle(cx, cy - d, cGreen);
                circle(cx, cy + d, cBlue);
                break;
            case 3:
                circle(cx - d, cy - d, cBlue);
                circle(cx, cy, cRed);
                circle(cx + d, cy + d, cGreen);
                break;
            case 4:
                circle(cx - d, cy - d, cBlue);
                circle(cx + d, cy - d, cGreen);
                circle(cx - d, cy + d, cGreen);
                circle(cx + d, cy + d, cBlue);
                break;
            case 5:
                // 4 corners + center
                this.drawDots(ctx, 4, x, y, w, h);
                circle(cx, cy, cRed);
                break;
            case 6:
                circle(cx - d, cy - d, cGreen);
                circle(cx + d, cy - d, cGreen);
                circle(cx - d, cy, cRed);
                circle(cx + d, cy, cRed);
                circle(cx - d, cy + d, cRed);
                circle(cx + d, cy + d, cRed);
                break;
            case 7:
                // Slanted 3 top (green), 4 bottom? Usually 4 green, 3 red slanted.
                // Let's do: Top-Left, Mid-Leftish, Mid-Rightish...
                // Simplified 7: 3 diagonal (Green), 4 corners (Red)? No.
                // Standard: Top slanted 3 (Green), Bottom 2x2 (Red)?
                // Actually, let's just do a nice pattern.
                // 3 Top (Green), 2 Mid (Red), 2 Bot (Red) -> 7
                circle(cx - d, cy - d*1.2, cGreen);
                circle(cx, cy - d*1.3, cGreen); // slightly offset
                circle(cx + d, cy - d*1.4, cGreen); // slanted

                // Bottom 4
                circle(cx - d, cy, cRed);
                circle(cx + d, cy, cRed);
                circle(cx - d, cy + d*1.2, cRed);
                circle(cx + d, cy + d*1.2, cRed);
                break;
            case 8:
                circle(cx - d, cy - d*1.2, cBlue);
                circle(cx + d, cy - d*1.2, cBlue);
                circle(cx - d, cy - d*0.4, cBlue);
                circle(cx + d, cy - d*0.4, cBlue);
                circle(cx - d, cy + d*0.4, cBlue);
                circle(cx + d, cy + d*0.4, cBlue);
                circle(cx - d, cy + d*1.2, cBlue);
                circle(cx + d, cy + d*1.2, cBlue);
                break;
            case 9:
                // 3x3
                for(var r=-1; r<=1; r++) {
                    for(var c=-1; c<=1; c++) {
                        var col = cRed; // default
                        if(r===-1) col = cGreen; // top row
                        if(r===0) col = cRed; // mid
                        if(r===1) col = cBlue; // bot
                        circle(cx + c*d, cy + r*d, col);
                    }
                }
                break;
        }
    };

    Game.prototype.drawBams = function(ctx, value, x, y, w, h) {
        var cx = x + w / 2;
        var cy = y + h / 2;
        var val = parseInt(value);

        var cGreen = '#2e7d32';
        var cBlue = '#1565c0';
        var cRed = '#c62828';

        if (val === 1) {
            // Bird
            // Use unicode peacock
            ctx.fillStyle = '#000'; // Multi-color via font?
            ctx.font = '40px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Try to draw a peacock emoji if supported, or a generic bird
            // Windows: 🀐 (1 Bam). If not, fallback?
            // Let's use the actual Unicode Mahjong Tile glyph for 1 Bam, but scaled up?
            // No, that draws the whole tile.
            // Let's use a Bird Emoji 🐦.
            ctx.fillText('🐦', cx, cy);
            return;
        }

        // Draw sticks
        var stickW = 4;
        var stickH = 16;
        var gap = 6;

        var drawStick = function(px, py, col) {
            ctx.fillStyle = col;
            // Draw a stick (rect with rounded ends or just rect)
            ctx.fillRect(px - stickW/2, py - stickH/2, stickW, stickH);
            // Detail (white ticks)
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillRect(px - stickW/2, py - 2, stickW, 4);
        };

        // Layouts
        switch(val) {
            case 2:
                drawStick(cx, cy - 12, cGreen);
                drawStick(cx, cy + 12, cBlue);
                break;
            case 3:
                drawStick(cx, cy - 20, cGreen);
                drawStick(cx - 10, cy + 10, cBlue);
                drawStick(cx + 10, cy + 10, cBlue);
                break;
            case 4:
                drawStick(cx - 10, cy - 12, cGreen);
                drawStick(cx + 10, cy - 12, cBlue);
                drawStick(cx - 10, cy + 12, cBlue);
                drawStick(cx + 10, cy + 12, cGreen);
                break;
            case 5:
                drawStick(cx - 12, cy - 15, cGreen);
                drawStick(cx + 12, cy - 15, cBlue);
                drawStick(cx, cy, cRed);
                drawStick(cx - 12, cy + 15, cBlue);
                drawStick(cx + 12, cy + 15, cGreen);
                break;
            case 6:
                for(var i=0; i<3; i++) drawStick(cx - 10, cy - 20 + i*20, cGreen);
                for(var i=0; i<3; i++) drawStick(cx + 10, cy - 20 + i*20, cGreen);
                break;
            case 7:
                // Top: 2 slanted?
                // Bot: 3 straight?
                // Simplified: 2 green top, 1 red mid, 4 green bot?
                // Let's do 3 top, 4 bottom
                drawStick(cx, cy - 25, cRed);
                drawStick(cx - 10, cy - 15, cGreen);
                drawStick(cx + 10, cy - 15, cGreen);

                drawStick(cx - 12, cy + 10, cGreen);
                drawStick(cx + 12, cy + 10, cGreen);
                drawStick(cx - 12, cy + 28, cGreen);
                drawStick(cx + 12, cy + 28, cGreen);
                break;
            case 8:
                // slant top
                // slant bot
                // Just 4 pairs
                 drawStick(cx - 15, cy - 25, cGreen); drawStick(cx + 15, cy - 25, cGreen);
                 drawStick(cx - 10, cy - 8, cGreen); drawStick(cx + 10, cy - 8, cGreen);
                 drawStick(cx - 10, cy + 8, cBlue); drawStick(cx + 10, cy + 8, cBlue);
                 drawStick(cx - 15, cy + 25, cBlue); drawStick(cx + 15, cy + 25, cBlue);
                 break;
            case 9:
                // 3 sets of 3
                for(var r=-1; r<=1; r++) {
                   var col = (r===0) ? cRed : (r===-1 ? cGreen : cBlue);
                   drawStick(cx - 15, cy + r*20, col);
                   drawStick(cx, cy + r*20, col);
                   drawStick(cx + 15, cy + r*20, col);
                }
                break;
        }
    };

    Game.prototype.drawCraks = function(ctx, value, x, y, w, h) {
        var cx = x + w / 2;
        var cy = y + h / 2;
        var val = parseInt(value);

        var cRed = '#d32f2f';
        var cBlack = '#000000';

        var map = ['ERROR', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        var char = map[val] || value;

        // Draw Number (Blue or Black?) usually blue/black.
        ctx.fillStyle = '#000';
        ctx.font = 'bold 28px serif';
        ctx.fillText(char, cx, cy - 12);

        // Draw Wan (Red)
        ctx.fillStyle = cRed;
        ctx.font = 'bold 28px serif';
        ctx.fillText('萬', cx, cy + 16);
    };

    Game.prototype.drawWind = function(ctx, value, x, y, w, h) {
        var cx = x + w / 2;
        var cy = y + h / 2;
        var map = { 'E': '東', 'S': '南', 'W': '西', 'N': '北' };

        ctx.fillStyle = '#000';
        ctx.font = '42px serif';
        ctx.fillText(map[value] || value, cx, cy);
    };

    Game.prototype.drawDragon = function(ctx, value, x, y, w, h) {
        var cx = x + w / 2;
        var cy = y + h / 2;

        if (value === 'R') {
            ctx.fillStyle = '#d32f2f'; // Red
            ctx.font = '42px serif';
            ctx.fillText('中', cx, cy);
        } else if (value === 'G') {
            ctx.fillStyle = '#388e3c'; // Green
            ctx.font = '42px serif';
            ctx.fillText('發', cx, cy);
        } else {
            // White Dragon - Blue Frame
            ctx.strokeStyle = '#1565c0';
            ctx.lineWidth = 3;
            var size = 30;
            ctx.strokeRect(cx - size/2, cy - size/2, size, size);
            // Some texture?
        }
    };

    Game.prototype.drawFlowerSeason = function(ctx, type, value, x, y, w, h) {
        var cx = x + w / 2;
        var cy = y + h / 2;

        // Use Emoji
        ctx.font = '32px serif';
        var txt = value;

        // Flowers: 1=Plum, 2=Orchid, 3=Bamboo, 4=Chrysanthemum
        // Seasons: 1=Spring, 2=Summer, 3=Autumn, 4=Winter

        // Map to emoji if possible
        if (type === 'FLOWERS') {
             var fMap = { '1': '🌸', '2': '🌺', '3': '🎋', '4': '🌼' }; // Bamboo emoji for 3?
             // Actually, 1=Plum (🌸), 2=Orchid (🌺), 3=Bamboo (🎍), 4=Chrysanthemum (🌼)
             if (fMap[value]) txt = fMap[value];
        } else {
             var sMap = { '1': '🌱', '2': '☀️', '3': '🍂', '4': '❄️' };
             if (sMap[value]) txt = sMap[value];
        }

        ctx.fillStyle = (type === 'FLOWERS') ? '#e91e63' : '#ff9800';
        ctx.fillText(txt, cx, cy);

        // Small number corner
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#333';
        ctx.fillText(value, x + 50, y + 12);
    };

    Game.prototype.handleClick = function(e) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;

        var mx = (e.clientX - rect.left) * scaleX - this.camera.x;
        var my = (e.clientY - rect.top) * scaleY - this.camera.y;

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
