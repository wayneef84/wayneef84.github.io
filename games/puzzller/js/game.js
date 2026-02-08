const STATE = {
    MENU: 0,
    LEVEL_SELECT: 1,
    PLAYING: 2,
    WIN: 3
};

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.tileSize = 40; // Default tile size

        // Initialize subsystems
        this.renderer = new Renderer(canvas, this.tileSize);
        this.input = new InputHandler();
        this.loader = new LevelLoader(LEVELS);

        // Game State
        this.state = STATE.MENU;
        this.currentLevelIndex = 0;
        this.levelData = null;
        this.player = { x: 0, y: 0, skin: 'dot' };

        // Bind loop
        this.lastTime = 0;
        this.loop = (timestamp) => this.update(timestamp);
    }

    start() {
        requestAnimationFrame(this.loop);
    }

    update(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.handleInput();
        this.draw();

        // Reset input frame state
        this.input.update();

        requestAnimationFrame(this.loop);
    }

    handleInput() {
        if (this.state === STATE.MENU) {
            if (this.input.isJustPressed('Enter') || this.input.isJustPressed('Space')) {
                this.state = STATE.LEVEL_SELECT;
            }
        }
        else if (this.state === STATE.LEVEL_SELECT) {
            // Simple level selection: 1-9 keys or Arrows to navigate?
            // Let's implement simple cycling with arrows for now
            if (this.input.isJustPressed('ArrowRight')) {
                this.currentLevelIndex = (this.currentLevelIndex + 1) % LEVELS.length;
            }
            if (this.input.isJustPressed('ArrowLeft')) {
                this.currentLevelIndex = (this.currentLevelIndex - 1 + LEVELS.length) % LEVELS.length;
            }
            if (this.input.isJustPressed('Enter') || this.input.isJustPressed('Space')) {
                this.loadLevel(this.currentLevelIndex);
                this.state = STATE.PLAYING;
            }

            // Customization Toggle in Level Select
            if (this.input.isJustPressed('KeyC')) {
                const skins = ['dot', 'square', 'emoji'];
                const currentIdx = skins.indexOf(this.player.skin);
                this.player.skin = skins[(currentIdx + 1) % skins.length];
            }
        }
        else if (this.state === STATE.PLAYING) {
            let dx = 0;
            let dy = 0;

            if (this.input.isJustPressed('ArrowUp') || this.input.isJustPressed('KeyW')) dy = -1;
            else if (this.input.isJustPressed('ArrowDown') || this.input.isJustPressed('KeyS')) dy = 1;
            else if (this.input.isJustPressed('ArrowLeft') || this.input.isJustPressed('KeyA')) dx = -1;
            else if (this.input.isJustPressed('ArrowRight') || this.input.isJustPressed('KeyD')) dx = 1;

            if (dx !== 0 || dy !== 0) {
                this.movePlayer(dx, dy);
            }

            if (this.input.isJustPressed('Escape')) {
                this.state = STATE.LEVEL_SELECT;
            }

            // Restart
            if (this.input.isJustPressed('KeyR')) {
                this.loadLevel(this.currentLevelIndex);
            }
        }
        else if (this.state === STATE.WIN) {
            if (this.input.isJustPressed('Enter') || this.input.isJustPressed('Space')) {
                // Next level
                this.currentLevelIndex++;
                if (this.currentLevelIndex >= LEVELS.length) {
                    this.state = STATE.MENU; // Game Complete
                    this.currentLevelIndex = 0;
                } else {
                    this.loadLevel(this.currentLevelIndex);
                    this.state = STATE.PLAYING;
                }
            }
        }
    }

    loadLevel(index) {
        this.levelData = this.loader.loadLevel(index);
        if (this.levelData) {
            this.player.x = this.levelData.playerStart.x;
            this.player.y = this.levelData.playerStart.y;

            // Adjust canvas/tile size if needed
            // For simplicity, we keep constant tile size but we could scale
            // this.tileSize = Math.min(this.canvas.width / this.levelData.width, this.canvas.height / this.levelData.height);
            // this.renderer.tileSize = this.tileSize;
        }
    }

    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        // Check bounds
        if (newX < 0 || newX >= this.levelData.width || newY < 0 || newY >= this.levelData.height) {
            return;
        }

        // Check collision
        const cell = this.levelData.grid[newY][newX];
        if (cell === 1) { // Wall
            return;
        }
        if (cell === 4) { // Obstacle
            return;
        }

        // Move
        this.player.x = newX;
        this.player.y = newY;

        // Check Win Condition (Target is 3)
        // Note: Target might be in grid as 3, OR we check coords.
        // LevelLoader leaves 3 in the grid.
        if (cell === 3) {
            console.log("Win!");
            this.state = STATE.WIN;
        }
    }

    draw() {
        this.renderer.clear();

        if (this.state === STATE.MENU) {
            this.renderer.drawText("PROJECT PUZZLLER", this.canvas.width / 2, this.canvas.height / 2 - 40, '#00bfff', 40);
            this.renderer.drawText("Press ENTER to Start", this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
        else if (this.state === STATE.LEVEL_SELECT) {
            this.renderer.drawText("SELECT LEVEL", this.canvas.width / 2, 50, 'white', 30);
            this.renderer.drawText(`Level: ${this.currentLevelIndex + 1}`, this.canvas.width / 2, this.canvas.height / 2, 'yellow', 40);
            this.renderer.drawText("< Left / Right >", this.canvas.width / 2, this.canvas.height / 2 + 50, '#aaa', 20);
            this.renderer.drawText("Press ENTER to Play", this.canvas.width / 2, this.canvas.height / 2 + 90, 'white', 20);
            this.renderer.drawText(`Skin: ${this.player.skin} (Press C)`, this.canvas.width / 2, this.canvas.height - 50, '#00bfff', 16);
        }
        else if (this.state === STATE.PLAYING) {
            // Center the grid?
            // For now, draw from 0,0
            this.renderer.drawGrid(this.levelData.grid);
            this.renderer.drawPlayer(this.player.x, this.player.y, this.player.skin);
        }
        else if (this.state === STATE.WIN) {
            // Draw game in background slightly dimmed?
            this.renderer.drawGrid(this.levelData.grid);
            this.renderer.drawPlayer(this.player.x, this.player.y, this.player.skin);

            // Overlay
            this.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.renderer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.renderer.drawText("LEVEL COMPLETE!", this.canvas.width / 2, this.canvas.height / 2, '#76ff03', 40);
            this.renderer.drawText("Press ENTER for next level", this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
}

// Export for module usage or global scope
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
} else {
    window.Game = Game;
}
