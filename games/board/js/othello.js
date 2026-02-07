/**
 * OTHELLO (REVERSI) GAME ENGINE
 * File: js/othello.js
 */

class OthelloGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 8;
        this.rows = 8;
        this.cellSize = 50;
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = [];
        this.currentPlayer = 'black';
        this.isGameOver = false;
        this.moveHistory = [];
        this.validMoves = [];

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
        // Initialize 8x8 board
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Standard Setup
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';

        this.currentPlayer = 'black';
        this.isGameOver = false;
        this.moveHistory = [];

        this.calculateValidMoves();
        this.updateStatus("Black's Turn", 'black');
        this.draw();

        if (this.gameMode === 'ai' && this.aiColor === 'black') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // Background
        this.ctx.fillStyle = '#2e7d32'; // Classic Green
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#1b5e20';

        for (let i = 0; i <= 8; i++) {
            // Vert
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin + i * this.cellSize, this.margin);
            this.ctx.lineTo(this.margin + i * this.cellSize, this.height - this.margin);
            this.ctx.stroke();

            // Horz
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, this.margin + i * this.cellSize);
            this.ctx.lineTo(this.width - this.margin, this.margin + i * this.cellSize);
            this.ctx.stroke();
        }

        // Highlights for valid moves
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.validMoves.forEach(m => {
            const x = this.margin + m.c * this.cellSize + this.cellSize/2;
            const y = this.margin + m.r * this.cellSize + this.cellSize/2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI*2);
            this.ctx.fill();
        });

        // Pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = this.board[r][c];
                if (cell) {
                    const x = this.margin + c * this.cellSize + this.cellSize/2;
                    const y = this.margin + r * this.cellSize + this.cellSize/2;
                    const radius = (this.cellSize/2) - 4;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, radius, 0, Math.PI*2);

                    if (cell === 'black') {
                        this.ctx.fillStyle = '#000';
                        this.ctx.shadowColor = 'rgba(255,255,255,0.2)';
                    } else {
                        this.ctx.fillStyle = '#fff';
                        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    }
                    this.ctx.shadowBlur = 2;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        // Game Over Overlay
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, this.height/2 - 50, this.width, 100);

            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';

            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(this.isGameOver, this.width/2, this.height/2 - 10);

            const counts = this.countPieces();
            this.ctx.font = '18px Arial';
            this.ctx.fillText(`Black: ${counts.black} | White: ${counts.white}`, this.width/2, this.height/2 + 25);
        }
    }

    handleClick(e) {
        if (this.isGameOver) return;
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) return;

        const { x, y } = GameEngine.getEventCoords(e, this.canvas);
        const c = Math.floor((x - this.margin) / this.cellSize);
        const r = Math.floor((y - this.margin) / this.cellSize);

        if (c < 0 || c >= 8 || r < 0 || r >= 8) return;

        // Check validity
        const move = this.validMoves.find(m => m.r === r && m.c === c);
        if (move) {
            this.executeMove(r, c);
        }
    }

    calculateValidMoves() {
        this.validMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === null) {
                    if (this.getFlips(r, c, this.currentPlayer).length > 0) {
                        this.validMoves.push({r, c});
                    }
                }
            }
        }
    }

    getFlips(r, c, player) {
        const flips = [];
        const opponent = player === 'black' ? 'white' : 'black';
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (let [dr, dc] of directions) {
            let tempFlips = [];
            let nr = r + dr;
            let nc = c + dc;

            while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.board[nr][nc] === opponent) {
                tempFlips.push({r: nr, c: nc});
                nr += dr;
                nc += dc;
            }

            // If we found a line of opponents AND ended on our own piece
            if (tempFlips.length > 0 && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && this.board[nr][nc] === player) {
                flips.push(...tempFlips);
            }
        }
        return flips;
    }

    executeMove(r, c) {
        const flips = this.getFlips(r, c, this.currentPlayer);
        if (flips.length === 0) return; // Should not happen if move was valid

        // Save State
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        // Place Piece
        this.board[r][c] = this.currentPlayer;

        // Flip
        flips.forEach(p => {
            this.board[p.r][p.c] = this.currentPlayer;
        });

        // Next Turn
        const nextPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.currentPlayer = nextPlayer;

        // Check Moves
        this.calculateValidMoves();

        if (this.validMoves.length === 0) {
            // Pass turn
            const otherPlayer = nextPlayer === 'black' ? 'white' : 'black';
            this.currentPlayer = otherPlayer;
            this.calculateValidMoves();

            if (this.validMoves.length === 0) {
                // Game Over
                this.endGame();
            } else {
                this.updateStatus(`${nextPlayer === 'black'?"Black":"White"} has no moves. PASS to ${this.currentPlayer === 'black'?"Black":"White"}.`, 'red');
                // Trigger AI if it's AI turn now after pass
                if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
                    setTimeout(() => this.makeAIMove(), 1500);
                }
            }
        } else {
            this.updateStatus(`${this.currentPlayer === 'black' ? "Black's" : "White's"} Turn`, 'black');
            if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }

        this.draw();
    }

    endGame() {
        const counts = this.countPieces();
        if (counts.black > counts.white) this.isGameOver = "BLACK WINS!";
        else if (counts.white > counts.black) this.isGameOver = "WHITE WINS!";
        else this.isGameOver = "DRAW!";

        this.updateStatus(this.isGameOver, 'black');
        this.draw();
    }

    countPieces() {
        let b = 0, w = 0;
        for(let row of this.board) for(let cell of row) {
            if(cell === 'black') b++;
            if(cell === 'white') w++;
        }
        return { black: b, white: w };
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
        this.calculateValidMoves();
        this.updateStatus(`${this.currentPlayer === 'black' ? "Black's" : "White's"} Turn`, 'black');
        this.draw();
    }

    makeAIMove() {
        if (this.isGameOver) return;
        if (this.validMoves.length === 0) return;

        // Simple Heuristic: Maximize flips + Prefer corners/edges
        let bestMove = this.validMoves[0];
        let bestScore = -Infinity;

        // Corner map
        const weights = [
            [10, -5, 2, 2, 2, 2, -5, 10],
            [-5, -7, -1, -1, -1, -1, -7, -5],
            [2, -1, 1, 0, 0, 1, -1, 2],
            [2, -1, 0, 1, 1, 0, -1, 2],
            [2, -1, 0, 1, 1, 0, -1, 2],
            [2, -1, 1, 0, 0, 1, -1, 2],
            [-5, -7, -1, -1, -1, -1, -7, -5],
            [10, -5, 2, 2, 2, 2, -5, 10]
        ];

        this.validMoves.forEach(m => {
            let score = 0;
            // 1. Position weight
            if (m.r < 8 && m.c < 8) score += weights[m.r][m.c];

            // 2. Flips count
            const flips = this.getFlips(m.r, m.c, this.aiColor);
            score += flips.length;

            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
            }
        });

        // Add some randomness if difficulty is low
        if (this.aiDifficulty === '1') {
            bestMove = this.validMoves[Math.floor(Math.random() * this.validMoves.length)];
        }

        this.executeMove(bestMove.r, bestMove.c);
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) { this.aiColor = color; this.resetGame(); }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
