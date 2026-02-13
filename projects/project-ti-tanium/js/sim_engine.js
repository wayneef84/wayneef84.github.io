class SimEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        // Ensure the canvas resolution matches the TI-83+ (96x64)
        this.width = 96;
        this.height = 64;
        this.menuItems = ["ASHELL", "Snake", "Falldown", "Mafia"];
        this.selectedItem = 0;
    }

    init() {
        this.drawMenu();
    }

    drawMenu() {
        // Clear screen with LCD background color
        this.ctx.fillStyle = '#9ea792';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Text
        this.ctx.fillStyle = '#000000';
        // Use a default monospace font, scaled down.
        // 6px is very small, but 96x64 is tiny.
        this.ctx.font = '8px monospace';
        this.ctx.textBaseline = 'top';

        // Header
        this.ctx.fillText("TI-83 Plus", 2, 2);
        this.ctx.fillText("Mem Cleared", 2, 10);

        // Menu items
        for (let i = 0; i < this.menuItems.length; i++) {
            let prefix = (i === this.selectedItem) ? ":" : " ";
            // Draw numbers
            this.ctx.fillText(`${i+1}${prefix}${this.menuItems[i]}`, 2, 25 + (i * 9));
        }

        // Draw cursor (simple invert or arrow? Standard TI is usually just highlighting or numbering)
        // We'll just assume the selection is implicit by number for now or draw a small indicator.
        // Actually, let's draw a box around the selected item or an arrow.
        // Let's draw a small arrow.
        // this.ctx.fillText(">", 80, 25 + (this.selectedItem * 9));
    }

    moveCursor(direction) {
        if (direction === 'UP') {
            this.selectedItem = (this.selectedItem - 1 + this.menuItems.length) % this.menuItems.length;
        } else if (direction === 'DOWN') {
            this.selectedItem = (this.selectedItem + 1) % this.menuItems.length;
        }
        this.drawMenu();
    }
}
