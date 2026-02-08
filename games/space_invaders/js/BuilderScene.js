import Scene from '../../../negen/core/Scene.js';
import InvadersScene from './InvadersScene.js';
// Reuse LevelManager or create new one? JSON stringify is enough for now.

export default class BuilderScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;

        this.rows = 5;
        this.cols = 11;
        this.grid = []; // 2D array of {active, type}
        this.selectedType = 1; // 1=Basic, 2=Diver, 3=Rainbow

        // Colors mapping
        this.typeColors = {
            1: '#fff',
            2: '#f0f',
            3: '#0ff' // Placeholder for rainbow
        };

        // Initialize grid
        for (let r=0; r<this.rows; r++) {
            let row = [];
            for (let c=0; c<this.cols; c++) {
                row.push({ active: false, type: 1 });
            }
            this.grid.push(row);
        }

        // Buttons
        this.playBtn = { x: this.width - 100, y: this.height - 40, w: 80, h: 30, text: 'Play' };
        this.shareBtn = { x: this.width - 200, y: this.height - 40, w: 80, h: 30, text: 'Share' };
        this.clearBtn = { x: this.width - 300, y: this.height - 40, w: 80, h: 30, text: 'Clear' };

        this.paletteY = this.height - 100;
        this.paletteH = 40;
    }

    update(dt) {
        const mx = this.engine.input.pointer.x;
        const my = this.engine.input.pointer.y;
        const isClick = this.engine.input.pointer.isPressed;
        const isDrag = this.engine.input.pointer.isDown;

        // Grid Input
        const cellW = 30;
        const cellH = 20;
        const gap = 5;
        const startX = 50;
        const startY = 80;

        // Bounding box of grid
        const gridW = this.cols * (cellW + gap);
        const gridH = this.rows * (cellH + gap);

        if (isDrag && my > startY && my < startY + gridH && mx > startX && mx < startX + gridW) {
            const c = Math.floor((mx - startX) / (cellW + gap));
            const r = Math.floor((my - startY) / (cellH + gap));
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                this.grid[r][c].active = true;
                this.grid[r][c].type = this.selectedType;
            }
        }

        // Palette Input (Select Type)
        if (isClick && my > this.paletteY && my < this.paletteY + this.paletteH) {
             // 3 Types
             const pW = 100;
             const startPX = 50;
             const idx = Math.floor((mx - startPX) / pW);
             if (idx >= 0 && idx < 3) {
                 this.selectedType = idx + 1;
             }
        }

        // Buttons
        if (isClick) {
            if (this.checkBtn(mx, my, this.playBtn)) {
                this.playLevel();
            } else if (this.checkBtn(mx, my, this.clearBtn)) {
                this.clearGrid();
            } else if (this.checkBtn(mx, my, this.shareBtn)) {
                alert("QR Generation shared with Breakout - Logic similar.");
            }
        }
    }

    checkBtn(mx, my, btn) {
        return mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h;
    }

    playLevel() {
        const levelData = {
            rows: this.rows,
            cols: this.cols,
            grid: this.grid
        };
        const scene = new InvadersScene();
        scene.levelData = levelData;
        this.engine.loadScene(scene);
    }

    clearGrid() {
        for(let r=0; r<this.rows; r++) {
            for(let c=0; c<this.cols; c++) {
                this.grid[r][c].active = false;
            }
        }
    }

    draw(renderer) {
        renderer.clear('#222');

        // Draw Grid
        const cellW = 30;
        const cellH = 20;
        const gap = 5;
        const startX = 50;
        const startY = 80;

        for(let r=0; r<this.rows; r++) {
            for(let c=0; c<this.cols; c++) {
                const x = startX + c*(cellW+gap);
                const y = startY + r*(cellH+gap);

                renderer.ctx.strokeStyle = '#444';
                renderer.ctx.strokeRect(x, y, cellW, cellH);

                if (this.grid[r][c].active) {
                    const type = this.grid[r][c].type;
                    renderer.ctx.fillStyle = this.typeColors[type];
                    renderer.ctx.fillRect(x, y, cellW, cellH);
                }
            }
        }

        // Draw Palette
        const pW = 100;
        const startPX = 50;
        const labels = ["Basic", "Diver", "Rainbow"];
        for(let i=0; i<3; i++) {
            const x = startPX + i*pW;
            const type = i+1;
            renderer.ctx.fillStyle = this.typeColors[type];
            renderer.ctx.fillRect(x, this.paletteY, pW-10, this.paletteH);
            renderer.ctx.fillStyle = '#000';
            renderer.ctx.fillText(labels[i], x + 10, this.paletteY + 25);

            if (type === this.selectedType) {
                renderer.ctx.strokeStyle = '#fff';
                renderer.ctx.lineWidth = 3;
                renderer.ctx.strokeRect(x, this.paletteY, pW-10, this.paletteH);
                renderer.ctx.lineWidth = 1;
            }
        }

        // Draw Buttons
        this.drawBtn(renderer, this.playBtn, '#0f0');
        this.drawBtn(renderer, this.shareBtn, '#00f');
        this.drawBtn(renderer, this.clearBtn, '#f00');

        renderer.drawText("INVADERS BUILDER", this.width/2, 30, 24, '#fff');
    }

    drawBtn(renderer, btn, color) {
        renderer.ctx.fillStyle = color;
        renderer.ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
        renderer.ctx.fillStyle = '#000';
        renderer.ctx.font = '16px Arial';
        renderer.ctx.textAlign = 'center';
        renderer.ctx.textBaseline = 'middle';
        renderer.ctx.fillText(btn.text, btn.x + btn.w/2, btn.y + btn.h/2);
    }
}
