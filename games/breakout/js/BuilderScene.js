import Scene from '../../../negen/core/Scene.js';
import LevelManager from './LevelManager.js';
import BreakoutScene from './BreakoutScene.js';

export default class BuilderScene extends Scene {
    enter(engine) {
        this.engine = engine;
        this.width = engine.width;
        this.height = engine.height;

        this.rows = 15;
        this.cols = 12;
        this.grid = []; // 2D array of {active, color}
        this.selectedColor = '#f00';

        // Colors for bricks
        this.colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fff'];

        // Initialize grid
        for (let r=0; r<this.rows; r++) {
            let row = [];
            for (let c=0; c<this.cols; c++) {
                row.push({ active: false, color: this.selectedColor });
            }
            this.grid.push(row);
        }

        // UI State
        this.mode = 'EDIT'; // EDIT, QR_VIEW
        this.qrCodeContainer = null;
        this.importInput = null; // DOM input for importing

        // Create input once
        if (!document.getElementById('breakout-import')) {
            const input = document.createElement('input');
            input.id = 'breakout-import';
            input.style.position = 'absolute';
            input.style.bottom = '10px';
            input.style.left = '10px';
            input.style.width = '200px';
            input.style.zIndex = '100';
            input.placeholder = 'Paste Level Code';
            document.body.appendChild(input);
            this.importInput = input;
        } else {
             this.importInput = document.getElementById('breakout-import');
             this.importInput.style.display = 'block';
        }

        this.importBtn = { x: 220, y: this.height - 40, w: 80, h: 30, text: 'Import' };
        this.playBtn = { x: this.width - 100, y: this.height - 40, w: 80, h: 30, text: 'Play' };
        this.shareBtn = { x: this.width - 200, y: this.height - 40, w: 80, h: 30, text: 'Share' };
        this.clearBtn = { x: this.width - 300, y: this.height - 40, w: 80, h: 30, text: 'Clear' };

        this.paletteY = this.height - 100;
        this.paletteH = 40;
    }

    exit() {
        if (this.importInput) this.importInput.style.display = 'none';
        if (this.qrCodeContainer) this.qrCodeContainer.remove();
    }

    update(dt) {
        if (this.mode === 'QR_VIEW') {
            if (this.engine.input.pointer.isJustPressed || this.engine.input.keys['Escape']) {
                this.mode = 'EDIT';
                if (this.qrCodeContainer) this.qrCodeContainer.style.display = 'none';
            }
            return;
        }

        const mx = this.engine.input.pointer.x;
        const my = this.engine.input.pointer.y;
        const isClick = this.engine.input.pointer.isPressed;
        const isDrag = this.engine.input.pointer.isDown;

        // Grid Input
        const cellW = (this.width - 20) / this.cols;
        const cellH = 20;
        const gridTop = 50;

        if (isDrag && my > gridTop && my < gridTop + this.rows * cellH && mx > 10 && mx < this.width - 10) {
            const c = Math.floor((mx - 10) / cellW);
            const r = Math.floor((my - gridTop) / cellH);
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                // Toggle? Or Paint? Let's Paint.
                // Left click paints, Right (or mode toggle?) erases. Simple paint for now.
                this.grid[r][c].active = true;
                this.grid[r][c].color = this.selectedColor;
            }
        }

        // Palette Input
        if (isClick && my > this.paletteY && my < this.paletteY + this.paletteH) {
             const pW = (this.width - 20) / this.colors.length;
             const idx = Math.floor((mx - 10) / pW);
             if (idx >= 0 && idx < this.colors.length) {
                 this.selectedColor = this.colors[idx];
             }
        }

        // Buttons
        if (isClick) {
            if (this.checkBtn(mx, my, this.playBtn)) {
                this.playLevel();
            } else if (this.checkBtn(mx, my, this.shareBtn)) {
                this.shareLevel();
            } else if (this.checkBtn(mx, my, this.clearBtn)) {
                this.clearGrid();
            } else if (this.checkBtn(mx, my, this.importBtn)) {
                this.importLevel();
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
        const scene = new BreakoutScene();
        // Manually inject level data into scene before loading
        // Or update BreakoutScene constructor/enter to accept it.
        // Engine.loadScene calls enter(engine). We can set prop on scene instance first.
        scene.levelData = levelData;
        this.engine.loadScene(scene);
    }

    shareLevel() {
        const levelData = {
            rows: this.rows,
            cols: this.cols,
            grid: this.grid
        };
        const code = LevelManager.serialize(levelData);
        console.log("Generated Code:", code);

        this.mode = 'QR_VIEW';
        if (!this.qrCodeContainer) {
            this.qrCodeContainer = document.createElement('div');
            this.qrCodeContainer.style.position = 'absolute';
            this.qrCodeContainer.style.top = '50%';
            this.qrCodeContainer.style.left = '50%';
            this.qrCodeContainer.style.transform = 'translate(-50%, -50%)';
            this.qrCodeContainer.style.background = '#fff';
            this.qrCodeContainer.style.padding = '20px';
            this.qrCodeContainer.style.border = '5px solid #000';
            this.qrCodeContainer.style.zIndex = '200';
            this.qrCodeContainer.style.textAlign = 'center';
            document.body.appendChild(this.qrCodeContainer);
        }

        this.qrCodeContainer.innerHTML = '';
        this.qrCodeContainer.style.display = 'block';

        // Generate QR
        // Assume QRCode is loaded globally from lib
        new QRCode(this.qrCodeContainer, {
            text: code,
            width: 256,
            height: 256,
            correctLevel: QRCode.CorrectLevel.H
        });

        const p = document.createElement('p');
        p.innerText = "Scan to Share! (Tap to close)";
        p.style.color = '#000';
        p.style.marginTop = '10px';
        this.qrCodeContainer.appendChild(p);
    }

    importLevel() {
        const code = this.importInput.value;
        if (!code) {
            alert("Paste code first!");
            return;
        }
        const level = LevelManager.deserialize(code);
        if (level) {
            this.rows = level.rows;
            this.cols = level.cols;
            this.grid = level.grid;
            alert("Level Imported!");
        } else {
            alert("Invalid Code");
        }
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

        if (this.mode === 'QR_VIEW') {
            renderer.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            renderer.ctx.fillRect(0,0,this.width, this.height);
            return;
        }

        // Draw Grid
        const cellW = (this.width - 20) / this.cols;
        const cellH = 20;
        const gridTop = 50;

        renderer.ctx.strokeStyle = '#444';
        for(let r=0; r<this.rows; r++) {
            for(let c=0; c<this.cols; c++) {
                const x = 10 + c*cellW;
                const y = gridTop + r*cellH;
                renderer.ctx.strokeRect(x, y, cellW, cellH);

                if (this.grid[r][c].active) {
                    renderer.ctx.fillStyle = this.grid[r][c].color;
                    renderer.ctx.fillRect(x+1, y+1, cellW-2, cellH-2);
                }
            }
        }

        // Draw Palette
        const pW = (this.width - 20) / this.colors.length;
        for(let i=0; i<this.colors.length; i++) {
            const x = 10 + i*pW;
            renderer.ctx.fillStyle = this.colors[i];
            renderer.ctx.fillRect(x, this.paletteY, pW-5, this.paletteH);
            if (this.colors[i] === this.selectedColor) {
                renderer.ctx.strokeStyle = '#fff';
                renderer.ctx.lineWidth = 3;
                renderer.ctx.strokeRect(x, this.paletteY, pW-5, this.paletteH);
                renderer.ctx.lineWidth = 1;
            }
        }

        // Draw Buttons
        this.drawBtn(renderer, this.playBtn, '#0f0');
        this.drawBtn(renderer, this.shareBtn, '#00f');
        this.drawBtn(renderer, this.clearBtn, '#f00');
        this.drawBtn(renderer, this.importBtn, '#ff0');

        renderer.drawText("LEVEL BUILDER", this.width/2, 30, 24, '#fff');
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
