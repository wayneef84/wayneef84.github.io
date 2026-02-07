/**
 * CONNECT 4 GAME ENGINE
 * File: js/connect4.js
 */

class Connect4Game {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 7;
        this.rows = 6;
        this.cellSize = 70;
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = []; // 6x7 array
        this.currentPlayer = 'red'; // red, yellow
        this.isGameOver = false;
        this.moveHistory = [];
        this.animatingPiece = null; // {col, targetRow, y, speed}

        // AI
        this.gameMode = 'pvp';
        this.aiColor = 'yellow';
        this.aiDifficulty = 2;

        // Input
        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    resetGame() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red';
        this.isGameOver = false;
        this.moveHistory = [];
        this.updateStatus("Red's Turn", 'red');
        this.draw();

        if (this.gameMode === 'ai' && this.aiColor === 'red') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // Background (Blue Stand)
        this.ctx.fillStyle = '#0069c0';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Holes
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.margin + c * this.cellSize + this.cellSize / 2;
                const y = this.margin + r * this.cellSize + this.cellSize / 2;
                const radius = this.cellSize / 2 - 5;

                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);

                const val = this.board[r][c];
                if (val) {
                    this.ctx.fillStyle = val;
                } else {
                    this.ctx.fillStyle = '#fff'; // Empty hole shows white background
                }
                this.ctx.fill();
                this.ctx.strokeStyle = '#004ba0';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        // Game Over Overlay
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.isGameOver, this.width/2, this.height/2);
        }
    }

    handleClick(e) {
        if (this.isGameOver) return;
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) return;

        const { x, y } = GameEngine.getEventCoords(e, this.canvas);

        const c = Math.floor((x - this.margin) / this.cellSize);

        if (c >= 0 && c < this.cols) {
            this.attemptMove(c);
        }
    }

    attemptMove(col) {
        // Find lowest empty row
        for (let r = this.rows - 1; r >= 0; r--) {
            if (!this.board[r][col]) {
                this.executeMove(r, col);
                return;
            }
        }
    }

    executeMove(r, c) {
        // History
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        this.board[r][c] = this.currentPlayer;

        const win = this.checkWin();
        if (win) {
            this.isGameOver = `${win.toUpperCase()} WINS!`;
            this.updateStatus(this.isGameOver, win);
        } else {
            // Check full
            let full = true;
            for(let c=0; c<this.cols; c++) if(!this.board[0][c]) full = false;

            if (full) {
                this.isGameOver = "DRAW!";
                this.updateStatus("DRAW!", 'black');
            } else {
                this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
                this.updateStatus(`${this.currentPlayer === 'red' ? "Red's" : "Yellow's"} Turn`, this.currentPlayer === 'red' ? 'red' : 'orange');
            }
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    checkWin() {
        const b = this.board;
        const rows = this.rows;
        const cols = this.cols;

        // Horizontal
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r][c+1] && p===b[r][c+2] && p===b[r][c+3]) return p;
            }
        }
        // Vertical
        for(let r=0; r<rows-3; r++) {
            for(let c=0; c<cols; c++) {
                const p = b[r][c];
                if(p && p===b[r+1][c] && p===b[r+2][c] && p===b[r+3][c]) return p;
            }
        }
        // Diag \
        for(let r=0; r<rows-3; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r+1][c+1] && p===b[r+2][c+2] && p===b[r+3][c+3]) return p;
            }
        }
        // Diag /
        for(let r=3; r<rows; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r-1][c+1] && p===b[r-2][c+2] && p===b[r-3][c+3]) return p;
            }
        }
        return null;
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
        this.updateStatus(`${this.currentPlayer === 'red' ? "Red's" : "Yellow's"} Turn`, this.currentPlayer === 'red' ? 'red' : 'orange');
        this.draw();
    }

    makeAIMove() {
        // Simple 1-step lookahead + random
        const validCols = [];
        for(let c=0; c<this.cols; c++) {
            if(!this.board[0][c]) validCols.push(c);
        }

        if(validCols.length === 0) return;

        // 1. Can I win?
        for(let c of validCols) {
            if(this.simulateMove(c, this.aiColor)) {
                this.attemptMove(c);
                return;
            }
        }

        // 2. Will opponent win?
        const opp = this.aiColor === 'red' ? 'yellow' : 'red';
        for(let c of validCols) {
            if(this.simulateMove(c, opp)) {
                this.attemptMove(c); // Block
                return;
            }
        }

        // 3. Random
        const move = validCols[Math.floor(Math.random() * validCols.length)];
        this.attemptMove(move);
    }

    simulateMove(col, player) {
        // Clone
        const tempBoard = this.board.map(r => [...r]);
        // Drop
        for(let r=this.rows-1; r>=0; r--) {
            if(!tempBoard[r][col]) {
                tempBoard[r][col] = player;
                // Check win logic using tempBoard (need to extract checkWin logic to static or method passing board)
                // Reusing logic:
                return this.checkWinOnBoard(tempBoard) === player;
            }
        }
        return false;
    }

    checkWinOnBoard(b) {
        // Copy paste checkWin but use b instead of this.board
        const rows = this.rows;
        const cols = this.cols;

        // Horizontal
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r][c+1] && p===b[r][c+2] && p===b[r][c+3]) return p;
            }
        }
        // Vertical
        for(let r=0; r<rows-3; r++) {
            for(let c=0; c<cols; c++) {
                const p = b[r][c];
                if(p && p===b[r+1][c] && p===b[r+2][c] && p===b[r+3][c]) return p;
            }
        }
        // Diag \
        for(let r=0; r<rows-3; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r+1][c+1] && p===b[r+2][c+2] && p===b[r+3][c+3]) return p;
            }
        }
        // Diag /
        for(let r=3; r<rows; r++) {
            for(let c=0; c<cols-3; c++) {
                const p = b[r][c];
                if(p && p===b[r-1][c+1] && p===b[r-2][c+2] && p===b[r-3][c+3]) return p;
            }
        }
        return null;
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) { this.aiColor = color; this.resetGame(); }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
