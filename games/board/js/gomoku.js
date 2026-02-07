/**
 * GOMOKU GAME ENGINE
 * File: js/gomoku.js
 */

class GomokuGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 15;
        this.rows = 15;
        this.cellSize = 30;
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = [];
        this.currentPlayer = 'black'; // Black usually goes first in Gomoku
        this.isGameOver = false;
        this.moveHistory = [];

        // AI
        this.gameMode = 'pvp';
        this.aiColor = 'white';
        this.aiDifficulty = 2;

        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    resetGame() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'black';
        this.isGameOver = false;
        this.moveHistory = [];
        this.updateStatus("Black's Turn", 'black');
        this.draw();

        if (this.gameMode === 'ai' && this.aiColor === 'black') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#eecfa1'; // Bamboo color
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#5c4033';
        this.ctx.lineCap = 'butt';

        this.ctx.beginPath();
        // Vertical lines
        for (let i = 0; i <= this.cols; i++) {
            const x = this.margin + i * this.cellSize;
            this.ctx.moveTo(x, this.margin);
            this.ctx.lineTo(x, this.height - this.margin);
        }
        // Horizontal lines
        for (let i = 0; i <= this.rows; i++) {
            const y = this.margin + i * this.cellSize;
            this.ctx.moveTo(this.margin, y);
            this.ctx.lineTo(this.width - this.margin, y);
        }
        this.ctx.stroke();

        // Pieces
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.board[r][c];
                if (cell) {
                    // Pieces are placed on intersections in Gomoku,
                    // but for simplicity with our grid engine, we can place them in cells
                    // OR on intersections.
                    // Standard Gomoku is on intersections.
                    // If we use cells (like TicTacToe), it's easier for hit detection.
                    // Let's stick to "in the cell" for visual consistency with other games here,
                    // or shift to intersections if we want to be purist.
                    // Looking at the grid code above: `x = margin + i * cellSize`.
                    // If we click, we map to `floor((x-margin)/cellSize)`. This maps to cells.
                    // So we will draw IN the cell center.

                    const x = this.margin + c * this.cellSize + this.cellSize / 2;
                    const y = this.margin + r * this.cellSize + this.cellSize / 2;
                    const radius = (this.cellSize / 2) - 2;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI * 2);

                    if (cell === 'black') {
                        this.ctx.fillStyle = '#000';
                        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        this.ctx.shadowBlur = 5;
                    } else {
                        this.ctx.fillStyle = '#fff';
                        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        this.ctx.shadowBlur = 5;
                    }
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        // Game Over Overlay
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.isGameOver, this.width/2, this.height/2 + 10);
        }
    }

    handleClick(e) {
        if (this.isGameOver) return;
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) return;

        const { x, y } = GameEngine.getEventCoords(e, this.canvas);

        const c = Math.floor((x - this.margin) / this.cellSize);
        const r = Math.floor((y - this.margin) / this.cellSize);

        if (c < 0 || c >= this.cols || r < 0 || r >= this.rows) return;

        if (!this.board[r][c]) {
            this.executeMove(r, c);
        }
    }

    executeMove(r, c) {
        // History
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        this.board[r][c] = this.currentPlayer;

        // Check Win
        const win = this.checkWin(r, c, this.currentPlayer);
        if (win) {
            this.isGameOver = `${this.currentPlayer.toUpperCase()} WINS!`;
            this.updateStatus(this.isGameOver, this.currentPlayer === 'black' ? 'black' : 'red'); // Red usually used for white in our UI text
        } else {
            // Check Draw (Board Full)
            let full = true;
            for(let i=0; i<this.rows; i++) for(let j=0; j<this.cols; j++) if(!this.board[i][j]) full = false;

            if (full) {
                this.isGameOver = "DRAW!";
                this.updateStatus("DRAW!", 'black');
            } else {
                this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
                this.updateStatus(`${this.currentPlayer === 'black' ? "Black's" : "White's"} Turn`, 'black');
            }
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    checkWin(r, c, player) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal \
            [1, -1]  // Diagonal /
        ];

        for (let [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < 5; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // Check negative direction
            for (let i = 1; i < 5; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) return true;
        }
        return false;
    }

    undo() {
        if (this.moveHistory.length === 0) return;
        let steps = (this.gameMode === 'ai' && this.currentPlayer !== this.aiColor) ? 2 : 1;
        if (this.moveHistory.length < steps) steps = this.moveHistory.length;

        for(let i=0; i<steps; i++) {
            const state = this.moveHistory.pop();
            this.board = state.board;
            this.currentPlayer = state.turn;
        }
        this.isGameOver = false;
        this.updateStatus(`${this.currentPlayer === 'black' ? "Black's" : "White's"} Turn`, 'black');
        this.draw();
    }

    makeAIMove() {
        // Very Simple AI: Pick random available spot near existing pieces or center
        // A real Gomoku AI is hard, we'll do a basic "try to block or win" check then random

        const moves = [];
        // Collect empty spots
        for(let r=0; r<this.rows; r++) {
            for(let c=0; c<this.cols; c++) {
                if(!this.board[r][c]) moves.push({r, c});
            }
        }

        if (moves.length === 0) return;

        // 1. Try to find a winning move
        for(let m of moves) {
            this.board[m.r][m.c] = this.aiColor;
            if (this.checkWin(m.r, m.c, this.aiColor)) {
                this.board[m.r][m.c] = null;
                this.executeMove(m.r, m.c);
                return;
            }
            this.board[m.r][m.c] = null;
        }

        // 2. Try to block opponent winning move
        const opponent = this.aiColor === 'black' ? 'white' : 'black';
        for(let m of moves) {
            this.board[m.r][m.c] = opponent;
            if (this.checkWin(m.r, m.c, opponent)) {
                this.board[m.r][m.c] = null;
                this.executeMove(m.r, m.c);
                return;
            }
            this.board[m.r][m.c] = null;
        }

        // 3. Pick a move that is adjacent to any existing piece (to keep game focused)
        // Filter moves that have neighbors
        const strategicMoves = moves.filter(m => {
            for(let dr=-1; dr<=1; dr++) {
                for(let dc=-1; dc<=1; dc++) {
                    if(dr===0 && dc===0) continue;
                    const nr = m.r+dr, nc = m.c+dc;
                    if(nr>=0 && nr<this.rows && nc>=0 && nc<this.cols && this.board[nr][nc]) return true;
                }
            }
            return false;
        });

        const candidates = strategicMoves.length > 0 ? strategicMoves : moves;
        const move = candidates[Math.floor(Math.random() * candidates.length)];

        this.executeMove(move.r, move.c);
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) {
        this.aiColor = color;
        this.resetGame();
    }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
