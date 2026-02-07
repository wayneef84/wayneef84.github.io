/**
 * BATTLESHIP GAME ENGINE
 * File: js/battleship.js
 */

class BattleshipGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cellSize = 35;
        this.gridSize = 10;
        this.margin = 20;

        // Layout: Left (Player), Right (Enemy)
        this.width = (this.gridSize * this.cellSize * 2) + (this.margin * 3);
        this.height = (this.gridSize * this.cellSize) + (this.margin * 4) + 50; // Extra for UI

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.phase = 'setup'; // setup, playing, gameover
        this.playerGrid = [];
        this.enemyGrid = []; // 'water', 'ship', 'hit', 'miss'
        this.enemyShips = []; // List of ships to check sunk status
        this.playerShips = [];

        this.shipsConfig = [
            {name: 'Carrier', size: 5},
            {name: 'Battleship', size: 4},
            {name: 'Cruiser', size: 3},
            {name: 'Submarine', size: 3},
            {name: 'Destroyer', size: 2}
        ];

        this.moveHistory = []; // Hard to undo in battleship (fog of war), but we'll try

        this.gameMode = 'pvp'; // Actually always PvAI for now
        this.aiDifficulty = 2;

        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    resetGame() {
        this.phase = 'setup';
        this.playerGrid = this.createGrid();
        this.enemyGrid = this.createGrid();
        this.playerShips = [];
        this.enemyShips = [];
        this.isGameOver = false;

        // Auto place for now
        this.placeShipsRandomly(this.playerGrid, this.playerShips);
        this.placeShipsRandomly(this.enemyGrid, this.enemyShips);

        this.updateStatus("Setup: Press START to begin (or click to shuffle)", 'black');
        this.draw();
    }

    createGrid() {
        return Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill({type: 'water', shot: false}));
    }

    placeShipsRandomly(grid, shipList) {
        // Clear grid first
        for(let r=0; r<10; r++) for(let c=0; c<10; c++) grid[r][c] = {type: 'water', shot: false};
        shipList.length = 0;

        this.shipsConfig.forEach(conf => {
            let placed = false;
            while(!placed) {
                const r = Math.floor(Math.random()*10);
                const c = Math.floor(Math.random()*10);
                const hor = Math.random() > 0.5;
                if(this.canPlace(grid, r, c, conf.size, hor)) {
                    const ship = {name: conf.name, hits: 0, size: conf.size, coords: []};
                    for(let i=0; i<conf.size; i++) {
                        const nr = r + (hor ? 0 : i);
                        const nc = c + (hor ? i : 0);
                        grid[nr][nc] = {type: 'ship', shot: false, shipRef: ship};
                        ship.coords.push({r:nr, c:nc});
                    }
                    shipList.push(ship);
                    placed = true;
                }
            }
        });
    }

    canPlace(grid, r, c, size, hor) {
        for(let i=0; i<size; i++) {
            const nr = r + (hor ? 0 : i);
            const nc = c + (hor ? i : 0);
            if(nr >= 10 || nc >= 10) return false;
            if(grid[nr][nc].type !== 'water') return false;
        }
        return true;
    }

    draw() {
        this.ctx.fillStyle = '#87ceeb'; // Sky/Bg
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Player Grid
        this.drawGrid(this.margin, this.margin + 40, this.playerGrid, true, "Your Fleet");

        // Draw Enemy Grid
        const enemyX = this.margin + (this.gridSize * this.cellSize) + this.margin;
        this.drawGrid(enemyX, this.margin + 40, this.enemyGrid, false, "Enemy Waters"); // false = hide ships

        // Draw Start Button (if setup)
        if (this.phase === 'setup') {
            this.ctx.fillStyle = '#4caf50';
            this.ctx.fillRect(this.width/2 - 60, this.height - 50, 120, 40);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("START", this.width/2, this.height - 23);
        }

        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.fillText(this.isGameOver, this.width/2, this.height/2);
        }
    }

    drawGrid(offsetX, offsetY, grid, showShips, title) {
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, offsetX + (this.gridSize * this.cellSize)/2, offsetY - 10);

        for(let r=0; r<10; r++) {
            for(let c=0; c<10; c++) {
                const cell = grid[r][c];
                const x = offsetX + c * this.cellSize;
                const y = offsetY + r * this.cellSize;

                // Base color
                if (cell.type === 'water') this.ctx.fillStyle = '#2196f3';
                else if (cell.type === 'ship') this.ctx.fillStyle = showShips ? '#795548' : '#2196f3';

                // Hit/Miss overrides
                if (cell.shot) {
                    if (cell.type === 'water') this.ctx.fillStyle = '#fff'; // Miss
                    else this.ctx.fillStyle = '#f44336'; // Hit
                }

                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                // Pegs
                if (cell.shot) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.cellSize/2, y + this.cellSize/2, 5, 0, Math.PI*2);
                    this.ctx.fillStyle = (cell.type === 'ship') ? '#000' : '#ccc';
                    this.ctx.fill();
                }
            }
        }
    }

    handleClick(e) {
        const { x, y } = GameEngine.getEventCoords(e, this.canvas);

        if (this.phase === 'setup') {
            // Check Start Button
            if (x > this.width/2 - 60 && x < this.width/2 + 60 && y > this.height - 50 && y < this.height - 10) {
                this.phase = 'playing';
                this.updateStatus("BATTLE STARTED! Click Enemy Grid to Fire.", 'red');
                this.draw();
                return;
            }
            // Shuffle on grid click
            const pGridX = this.margin;
            const pGridY = this.margin + 40;
            if (x > pGridX && x < pGridX + 350 && y > pGridY && y < pGridY + 350) {
                this.placeShipsRandomly(this.playerGrid, this.playerShips);
                this.draw();
            }
            return;
        }

        if (this.phase === 'playing' && !this.isGameOver) {
            // Check Enemy Grid Click
            const eGridX = this.margin + 350 + this.margin;
            const eGridY = this.margin + 40;

            if (x > eGridX && x < eGridX + 350 && y > eGridY && y < eGridY + 350) {
                const c = Math.floor((x - eGridX) / this.cellSize);
                const r = Math.floor((y - eGridY) / this.cellSize);

                if (r>=0 && r<10 && c>=0 && c<10) {
                    if (!this.enemyGrid[r][c].shot) {
                        this.fireAt(this.enemyGrid, r, c, this.enemyShips);
                        if (!this.isGameOver) {
                            setTimeout(() => this.aiTurn(), 500);
                        }
                    }
                }
            }
        }
    }

    fireAt(grid, r, c, shipList) {
        const cell = grid[r][c];
        cell.shot = true;

        let msg = "MISS!";
        let color = 'black';

        if (cell.type === 'ship') {
            msg = "HIT!";
            color = 'red';
            cell.shipRef.hits++;
            if (cell.shipRef.hits === cell.shipRef.size) {
                msg = `SUNK ${cell.shipRef.name}!`;
            }
        }

        this.updateStatus(msg, color);

        // Check Win
        if (shipList.every(s => s.hits === s.size)) {
            this.isGameOver = (grid === this.enemyGrid) ? "VICTORY!" : "DEFEAT!";
        }

        this.draw();
    }

    aiTurn() {
        if(this.isGameOver) return;

        // Random fire
        let valid = false;
        let r, c;
        while(!valid) {
            r = Math.floor(Math.random()*10);
            c = Math.floor(Math.random()*10);
            if (!this.playerGrid[r][c].shot) valid = true;
        }

        this.fireAt(this.playerGrid, r, c, this.playerShips);
    }

    // Stub interfaces
    undo() { }
    setMode(m) { }
    setAIColor(c) { }
    setAIDifficulty(d) { }
    updateStatus(msg, color) { if (this.statusCallback) this.statusCallback(msg, color); }
}
