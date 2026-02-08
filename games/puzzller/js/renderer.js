class Renderer {
    constructor(canvas, tileSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = tileSize;
    }

    clear() {
        this.ctx.fillStyle = '#1a1a1a'; // Dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(grid) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const cell = grid[y][x];
                this.drawTile(x, y, cell);
            }
        }
    }

    drawTile(x, y, type) {
        const ts = this.tileSize;
        const px = x * ts;
        const py = y * ts;

        switch (type) {
            case 0: // Floor
                this.ctx.fillStyle = '#2a2a2a';
                this.ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);
                break;
            case 1: // Wall
                this.ctx.fillStyle = '#555';
                this.ctx.fillRect(px, py, ts, ts);
                // Add some detail
                this.ctx.strokeStyle = '#333';
                this.ctx.strokeRect(px, py, ts, ts);
                break;
            case 3: // Target (Pink Dot)
                this.ctx.fillStyle = '#2a2a2a'; // Floor under target
                this.ctx.fillRect(px + 1, py + 1, ts - 2, ts - 2);

                this.ctx.fillStyle = '#ff69b4'; // Hot Pink
                this.ctx.beginPath();
                this.ctx.arc(px + ts/2, py + ts/2, ts/3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 4: // Obstacle
                this.ctx.fillStyle = '#8b4513'; // Saddle Brown
                this.ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
                break;
        }
    }

    drawPlayer(x, y, skin = 'dot') {
        const ts = this.tileSize;
        const px = x * ts;
        const py = y * ts;

        // Customization Hook
        switch (skin) {
            case 'square':
                this.ctx.fillStyle = '#00bfff'; // Deep Sky Blue
                this.ctx.fillRect(px + 4, py + 4, ts - 8, ts - 8);
                break;
            case 'emoji':
                this.ctx.font = `${ts * 0.8}px sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🤠', px + ts/2, py + ts/2 + 2);
                break;
            case 'dot':
            default:
                this.ctx.fillStyle = '#00bfff'; // Deep Sky Blue
                this.ctx.beginPath();
                this.ctx.arc(px + ts/2, py + ts/2, ts/3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }

    drawText(text, x, y, color = 'white', size = 20) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y);
    }
}

// Export for module usage or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
} else {
    window.Renderer = Renderer;
}
