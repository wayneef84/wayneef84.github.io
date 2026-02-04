/**
 * CardAssets.js
 * High-quality SVG-based procedural card renderer.
 * Replaces the legacy canvas renderer with crisp vector graphics.
 */

const CardAssets = {
    // Configuration
    width: 200,   // High-res width (displayed at ~100px)
    height: 280,  // High-res height (displayed at ~140px)
    // Backward Compatibility Aliases (for legacy code relying on old property names)
    get cardWidth() { return this.width; },
    get cardHeight() { return this.height; },

    cache: {},
    isLoaded: false,

    // Design System
    colors: {
        red: '#e74c3c',      // Alizarin
        black: '#2c3e50',    // Midnight Blue
        white: '#fdfbf7',    // Warm White (Paper)
        gold: '#f1c40f',     // Sun Flower
        royal: '#3498db',    // Peter River
        backBase: '#2c3e50', // Dark Blue
        backAccent: '#34495e'
    },

    // SVG Paths (Normalized to ~100x100 viewbox)
    paths: {
        H: "M50,30 C50,15 35,0 25,0 C12,0 0,15 0,30 C0,55 50,90 50,90 C50,90 100,55 100,30 C100,15 88,0 75,0 C65,0 50,15 50,30 Z",
        D: "M50,0 L100,50 L50,100 L0,50 Z",
        C: "M50,10 C65,10 75,25 75,35 C75,45 65,55 55,55 L55,55 C65,55 80,55 85,70 C90,85 75,95 60,95 L40,95 C25,95 10,85 15,70 C20,55 35,55 45,55 L45,55 C35,55 25,45 25,35 C25,25 35,10 50,10 Z M50,55 L50,100", // Simplified Club
        S: "M50,0 C50,0 100,40 100,65 C100,85 85,95 70,95 C55,95 50,75 50,75 C50,75 45,95 30,95 C15,95 0,85 0,65 C0,40 50,0 50,0 Z M50,75 L50,100",
        Crown: "M10,40 L30,10 L50,40 L70,10 L90,40 L90,60 L10,60 Z", // Simple Crown for Face Cards
        FaceJ: "M20,20 L80,20 L50,80 Z", // Shield-ish
        FaceQ: "M50,20 A30,30 0 1,0 50,80 A30,30 0 1,0 50,20", // Circle
        FaceK: "M20,20 L80,20 L80,80 L20,80 Z" // Square
    },

    init: function() {
        if (this.isLoaded) return;
        
        const suits = ['H', 'D', 'C', 'S'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        // 1. Generate Card Back
        this.cache['BACK'] = this.createCardBack();

        // 2. Generate Faces
        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.cache[`${rank}${suit}`] = this.createCardFace(rank, suit);
            });
        });

        this.isLoaded = true;
        console.log(`[SVGCardAssets] Generated 53 High-Res textures (${this.width}x${this.height})`);
    },

    getAsset: function(rank, suit) {
        if (!suit) return this.cache['BACK'];
        return this.cache[`${rank}${suit}`] || this.cache['BACK'];
    },

    createCanvas: function() {
        const c = document.createElement('canvas');
        c.width = this.width;
        c.height = this.height;
        return c;
    },

    createCardBack: function() {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const w = this.width;
        const h = this.height;

        // Border
        this.drawRoundedRect(ctx, 0, 0, w, h, 16, this.colors.white);
        
        // Inner Pattern Area
        const m = 12; // margin
        this.drawRoundedRect(ctx, m, m, w - m*2, h - m*2, 10, this.colors.backBase);

        // Pattern (Lattice)
        ctx.save();
        ctx.beginPath();
        ctx.rect(m, m, w - m*2, h - m*2);
        ctx.clip(); // Clip to inner area

        ctx.strokeStyle = this.colors.backAccent;
        ctx.lineWidth = 4;
        const step = 30;
        
        // Diagonals
        for (let x = -h; x < w + h; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + h, h);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + h, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        // Center Logo (Simple Diamond)
        ctx.fillStyle = this.colors.gold;
        ctx.beginPath();
        ctx.moveTo(w/2, h/2 - 30);
        ctx.lineTo(w/2 + 20, h/2);
        ctx.lineTo(w/2, h/2 + 30);
        ctx.lineTo(w/2 - 20, h/2);
        ctx.fill();

        ctx.restore();
        return c;
    },

    createCardFace: function(rank, suit) {
        const c = this.createCanvas();
        const ctx = c.getContext('2d');
        const w = this.width;
        const h = this.height;
        const isRed = (suit === 'H' || suit === 'D');
        const color = isRed ? this.colors.red : this.colors.black;

        // Background
        this.drawRoundedRect(ctx, 0, 0, w, h, 16, this.colors.white);
        // Subtle inner border
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Typography Config
        const fontSize = rank === '10' ? 36 : 42;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // --- Corner Indices ---
        this.drawCorner(ctx, rank, suit, 25, 30, fontSize); // Top Left

        ctx.save();
        ctx.translate(w, h);
        ctx.rotate(Math.PI);
        this.drawCorner(ctx, rank, suit, 25, 30, fontSize); // Bottom Right (Rotated)
        ctx.restore();

        // --- Center Content ---
        if (['J', 'Q', 'K'].includes(rank)) {
            this.drawFaceCardArt(ctx, rank, suit, w/2, h/2);
        } else if (rank === 'A') {
            this.drawPath(ctx, this.paths[suit], w/2 - 35, h/2 - 35, 70, 70, color);
        } else {
            this.drawPips(ctx, parseInt(rank), suit, w, h, color);
        }

        return c;
    },

    drawCorner: function(ctx, rank, suit, x, y, fontSize) {
        ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
        ctx.fillText(rank, x, y);
        
        const pipSize = 24;
        this.drawPath(ctx, this.paths[suit], x - pipSize/2, y + 25, pipSize, pipSize, ctx.fillStyle);
    },

    drawFaceCardArt: function(ctx, rank, suit, x, y) {
        const w = 120;
        const h = 160;
        const left = x - w/2;
        const top = y - h/2;

        // Face Card Border
        ctx.strokeStyle = this.colors.gold;
        ctx.lineWidth = 4;
        ctx.strokeRect(left, top, w, h);

        // Inner Fill
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(left, top, w, h);

        // Crown/Symbol
        let symbol = this.paths.Crown; // Default
        let color = this.colors.gold;

        if (rank === 'J') { symbol = this.paths.FaceJ; color = this.colors.royal; }
        if (rank === 'Q') { symbol = this.paths.FaceQ; color = this.colors.red; }
        if (rank === 'K') { symbol = this.paths.FaceK; color = this.colors.black; }

        // Draw Big Suit behind
        ctx.globalAlpha = 0.1;
        this.drawPath(ctx, this.paths[suit], left + 10, top + 30, w - 20, w - 20,
            (suit==='H'||suit==='D') ? this.colors.red : this.colors.black);
        ctx.globalAlpha = 1.0;

        // Draw Rank Symbol
        this.drawPath(ctx, symbol, x - 30, y - 50, 60, 60, color);

        // Letter in Center
        ctx.fillStyle = color;
        ctx.font = 'bold 60px serif';
        ctx.fillText(rank, x, y + 40);
    },

    drawPips: function(ctx, count, suit, w, h, color) {
        // Pip Layout Grid (Column X, Row Y percentages)
        const layouts = {
            2: [[50, 20], [50, 80]],
            3: [[50, 20], [50, 50], [50, 80]],
            4: [[30, 20], [70, 20], [30, 80], [70, 80]],
            5: [[30, 20], [70, 20], [50, 50], [30, 80], [70, 80]],
            6: [[30, 20], [70, 20], [30, 50], [70, 50], [30, 80], [70, 80]],
            7: [[30, 20], [70, 20], [50, 35], [30, 50], [70, 50], [30, 80], [70, 80]],
            8: [[30, 20], [70, 20], [50, 35], [30, 50], [70, 50], [50, 65], [30, 80], [70, 80]], // 8 is tricky
            9: [[30, 20], [70, 20], [30, 40], [70, 40], [50, 50], [30, 60], [70, 60], [30, 80], [70, 80]],
            10: [[30, 20], [70, 20], [50, 30], [30, 45], [70, 45], [30, 65], [70, 65], [50, 70], [30, 80], [70, 80]] // Standard-ish
        };

        // Fallback for 8/10/7 layouts which are complex - using simpler grid for now
        // Overwriting complex ones with simple 2-col logic
        if (count >= 4 && count !== 5 && count !== 7 && count !== 9) {
             // 4, 6, 8, 10 usually have two columns
        }

        const layout = layouts[count];
        if (!layout) return;

        const pipSize = 34; // Base size

        layout.forEach(pos => {
            const px = (pos[0] / 100) * w;
            const py = (pos[1] / 100) * h;
            
            // Flip bottom pips upside down? (Standard cards do this)
            const isBottom = pos[1] > 50;
            
            ctx.save();
            ctx.translate(px, py);
            if (isBottom) ctx.rotate(Math.PI);
            
            this.drawPath(ctx, this.paths[suit], -pipSize/2, -pipSize/2, pipSize, pipSize, color);
            ctx.restore();
        });
    },

    drawPath: function(ctx, pathStr, x, y, w, h, color) {
        // Quick SVG path parser/drawer
        // Assumes path is defined in 0-100 coordinate space
        // and we scale it to w,h

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(w/100, h/100);
        ctx.fillStyle = color;

        const p = new Path2D(pathStr);
        ctx.fill(p);

        ctx.restore();
    },

    drawRoundedRect: function(ctx, x, y, w, h, r, fill) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r);
        ctx.arcTo(x, y, x+w, y, r);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        // ctx.shadowColor = 'rgba(0,0,0,0.2)';
        // ctx.shadowBlur = 10;
        // ctx.shadowOffsetX = 2;
        // ctx.shadowOffsetY = 2;
    }
};
