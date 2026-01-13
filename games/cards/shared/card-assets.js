/**
 * CardAssets.js
 * A lightweight renderer that programmatically generates card textures.
 * This avoids the need for external image files and ensures crisp graphics on Retina screens.
 */

const CardAssets = {
    // Configuration
    cardWidth: 100,  // Base resolution (will scale via CSS)
    cardHeight: 140,
    cache: {},       // Stores the pre-rendered images
    isLoaded: false,

    // Colors
    colors: {
        red: '#D40000',
        black: '#2D2D2D',
        white: '#FFFFFF',
        back: '#2c3e50', // Dark blue back
        pattern: '#34495e'
    },

    init: function() {
        if (this.isLoaded) return;
        
        const suits = ['H', 'D', 'C', 'S'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        // 1. Generate the "Card Back"
        this.cache['BACK'] = this.createCardBack();

        // 2. Generate all 52 faces
        suits.forEach(suit => {
            ranks.forEach(rank => {
                const key = `${rank}${suit}`; // e.g., "10H" or "KS"
                this.cache[key] = this.createCardFace(rank, suit);
            });
        });

        this.isLoaded = true;
        console.log('[CardAssets] Generated 53 textures (52 faces + 1 back)');
    },

    // Returns the standard HTMLCanvasElement for a specific card
    getAsset: function(rank, suit) {
        if (!suit) return this.cache['BACK']; // If no arguments, return back
        return this.cache[`${rank}${suit}`];
    },

    // --- Drawing Logic (The "Printing Press") ---

    createBaseCanvas: function() {
        const c = document.createElement('canvas');
        c.width = this.cardWidth;
        c.height = this.cardHeight;
        return c;
    },

    createCardBack: function() {
        const c = this.createBaseCanvas();
        const ctx = c.getContext('2d');

        // Card Shape
        this.drawRoundedRect(ctx, 0, 0, c.width, c.height, 8, this.colors.white);
        
        // Pattern Area (Inset)
        const margin = 6;
        this.drawRoundedRect(ctx, margin, margin, c.width - (margin*2), c.height - (margin*2), 4, this.colors.back);
        
        // Simple Cross-hatch Pattern
        ctx.strokeStyle = this.colors.pattern;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<c.width; i+=10) { ctx.moveTo(i,0); ctx.lineTo(i, c.height); }
        for(let i=0; i<c.height; i+=10) { ctx.moveTo(0,i); ctx.lineTo(c.width, i); }
        ctx.stroke();

        return c;
    },

    createCardFace: function(rank, suit) {
        const c = this.createBaseCanvas();
        const ctx = c.getContext('2d');
        const isRed = (suit === 'H' || suit === 'D');
        const color = isRed ? this.colors.red : this.colors.black;

        // Background
        this.drawRoundedRect(ctx, 0, 0, c.width, c.height, 8, this.colors.white);

        // --- TOP LEFT (Tightened Spacing) ---
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.font = 'bold 18px Arial';
        // Moved Y from 22 -> 20 (closer to top)
        ctx.fillText(rank, 15, 20);
        // Moved Y from 38 -> 32 (closer to number)
        this.drawSuitIcon(ctx, suit, 15, 32, 10);

        // --- BOTTOM RIGHT (Rotated 180°) ---
        ctx.save();
        // Translate to bottom-right margin
        ctx.translate(c.width - 15, c.height - 20);
        ctx.rotate(Math.PI);
        // Draw Number at anchor (Closest to corner)
        ctx.fillText(rank, 0, 0);
        // Draw Suit "above" number in rotated space (visually inner)
        this.drawSuitIcon(ctx, suit, 0, 13, 10); 
        ctx.restore();

        // --- CENTER ART ---
        if (['J', 'Q', 'K'].includes(rank)) {
            // Draw Box for Face Card
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(30, 30, 40, 80);
            ctx.font = '40px serif';
            ctx.fillText(rank, 50, 85);
        } else {
            // Big Center Pip
            this.drawSuitIcon(ctx, suit, 50, 70, 30);
        }

        return c;
    },

    drawSuitIcon: function(ctx, suit, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        const scale = size / 20; // Normalize path scale
        ctx.scale(scale, scale);
        ctx.fillStyle = (suit === 'H' || suit === 'D') ? this.colors.red : this.colors.black;
        
        ctx.beginPath();
        if (suit === 'H') { // Heart
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-10, -10, -20, 5, 0, 20);
            ctx.bezierCurveTo(20, 5, 10, -10, 0, 0);
        } else if (suit === 'D') { // Diamond
            ctx.moveTo(0, -20);
            ctx.lineTo(15, 0);
            ctx.lineTo(0, 20);
            ctx.lineTo(-15, 0);
        } else if (suit === 'C') { // Club
            // 1. Top Circle
            ctx.moveTo(0, -12); 
            ctx.arc(0, -12, 8, 0, Math.PI * 2);
            
            // 2. Bottom Right Circle (Move pen first!)
            ctx.moveTo(10, 2); 
            ctx.arc(10, 2, 8, 0, Math.PI * 2);
            
            // 3. Bottom Left Circle (Move pen first!)
            ctx.moveTo(-10, 2); 
            ctx.arc(-10, 2, 8, 0, Math.PI * 2);
            
            // 4. Stem (Triangle-ish)
            ctx.moveTo(0, 0); 
            ctx.lineTo(-2, 20); 
            ctx.lineTo(2, 20); 
            ctx.lineTo(0, 0);
        } else if (suit === 'S') { // Spade
            ctx.moveTo(0, -20);
            ctx.bezierCurveTo(15, -10, 20, 10, 0, 10);
            ctx.bezierCurveTo(-20, 10, -15, -10, 0, -20);
            ctx.moveTo(0, 0); ctx.lineTo(-2, 20); ctx.lineTo(2, 20);
        }
        ctx.fill();
        ctx.restore();
    },

    drawRoundedRect: function(ctx, x, y, w, h, r, fill) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.arcTo(x+w, y, x+w, y+h, r);
        ctx.arcTo(x+w, y+h, x, y+h, r);
        ctx.arcTo(x, y+h, x, y, r);
        ctx.arcTo(x, y, x+w, y, r);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
};