/**
 * TIC TAC TOE GAME ENGINE
 * File: js/tictactoe.js
 */

class TicTacToeGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 3;
        this.rows = 3;
        this.cellSize = 150; // Bigger cells
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = [];
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.moveHistory = [];

        // AI
        this.gameMode = 'pvp';
        this.aiSymbol = 'O';
        this.aiDifficulty = 2;

        // Input
        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    resetGame() {
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.moveHistory = [];
        this.updateStatus("X's Turn", 'black');
        this.draw();

        if (this.gameMode === 'ai' && this.aiSymbol === 'X') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // Clear
        this.ctx.fillStyle = '#f0d9b5';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        // Vertical lines
        for (let i = 1; i < 3; i++) {
            const x = this.margin + i * this.cellSize;
            this.ctx.moveTo(x, this.margin);
            this.ctx.lineTo(x, this.height - this.margin);
        }
        // Horizontal lines
        for (let i = 1; i < 3; i++) {
            const y = this.margin + i * this.cellSize;
            this.ctx.moveTo(this.margin, y);
            this.ctx.lineTo(this.width - this.margin, y);
        }
        this.ctx.stroke();

        // Symbols
        this.ctx.font = '100px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                const cell = this.board[r][c];
                if (cell) {
                    const x = this.margin + c * this.cellSize + this.cellSize / 2;
                    const y = this.margin + r * this.cellSize + this.cellSize / 2;

                    if (cell === 'X') {
                        this.ctx.fillStyle = '#d32f2f';
                    } else {
                        this.ctx.fillStyle = '#1976d2';
                    }
                    this.ctx.fillText(cell, x, y + 8);
                }
            }
        }

        // Game Over Overlay
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.fillText(this.isGameOver, this.width/2, this.height/2);
        }
    }

    handleClick(e) {
        if (this.isGameOver) return;
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiSymbol) return;

        const { x, y } = GameEngine.getEventCoords(e, this.canvas);

        const c = Math.floor((x - this.margin) / this.cellSize);
        const r = Math.floor((y - this.margin) / this.cellSize);

        if (c < 0 || c >= 3 || r < 0 || r >= 3) return;

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
        const win = this.checkWin();
        if (win) {
            this.isGameOver = win === 'Draw' ? 'DRAW!' : `${win} WINS!`;
            this.updateStatus(this.isGameOver, win === 'Draw' ? 'black' : 'red');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus(`${this.currentPlayer}'s Turn`, 'black');
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiSymbol && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    checkWin() {
        const b = this.board;
        // Rows
        for(let r=0; r<3; r++) {
            if(b[r][0] && b[r][0] === b[r][1] && b[r][1] === b[r][2]) return b[r][0];
        }
        // Cols
        for(let c=0; c<3; c++) {
            if(b[0][c] && b[0][c] === b[1][c] && b[1][c] === b[2][c]) return b[0][c];
        }
        // Diagonals
        if(b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return b[0][0];
        if(b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return b[0][2];

        // Draw
        let empty = 0;
        for(let r=0; r<3; r++) for(let c=0; c<3; c++) if(!b[r][c]) empty++;

        return empty === 0 ? 'Draw' : null;
    }

    undo() {
        if (this.moveHistory.length === 0) return;
        let steps = (this.gameMode === 'ai' && this.currentPlayer !== this.aiSymbol) ? 2 : 1;
        if (this.moveHistory.length < steps) steps = this.moveHistory.length;

        for(let i=0; i<steps; i++) {
            const state = this.moveHistory.pop();
            this.board = state.board;
            this.currentPlayer = state.turn;
        }
        this.isGameOver = false;
        this.updateStatus(`${this.currentPlayer}'s Turn`, 'black');
        this.draw();
    }

    makeAIMove() {
        // Simple Minimax
        let bestScore = -Infinity;
        let move;
        const b = this.board;

        // If easy, just random
        if (this.aiDifficulty === '1') {
            const moves = [];
            for(let r=0; r<3; r++) for(let c=0; c<3; c++) if(!b[r][c]) moves.push({r,c});
            move = moves[Math.floor(Math.random()*moves.length)];
            if(move) this.executeMove(move.r, move.c);
            return;
        }

        // Minimax (for Difficulty 2/3)
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                if(!b[r][c]) {
                    b[r][c] = this.aiSymbol;
                    let score = this.minimax(b, 0, false);
                    b[r][c] = null;
                    if(score > bestScore) {
                        bestScore = score;
                        move = {r, c};
                    }
                }
            }
        }
        if(move) this.executeMove(move.r, move.c);
    }

    minimax(board, depth, isMaximizing) {
        let result = this.checkWin();
        if(result === this.aiSymbol) return 10 - depth;
        if(result === (this.aiSymbol==='X'?'O':'X')) return depth - 10;
        if(result === 'Draw') return 0;

        if(isMaximizing) {
            let bestScore = -Infinity;
            for(let r=0; r<3; r++) {
                for(let c=0; c<3; c++) {
                    if(!board[r][c]) {
                        board[r][c] = this.aiSymbol;
                        let score = this.minimax(board, depth+1, false);
                        board[r][c] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            let human = this.aiSymbol==='X'?'O':'X';
            for(let r=0; r<3; r++) {
                for(let c=0; c<3; c++) {
                    if(!board[r][c]) {
                        board[r][c] = human;
                        let score = this.minimax(board, depth+1, true);
                        board[r][c] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) {
        // In TicTacToe, typically X goes first.
        // If user selects "Black" (which is usually second in Chess), we map it:
        // Let's say: X is Red/White (First), O is Black (Second).
        // Actually, let's keep it simple: X always starts.
        // If AI is 'X', AI starts.
        // The Selector gives 'black' or 'red'.
        // Let's map 'red' -> X, 'black' -> O
        this.aiSymbol = (color === 'red') ? 'X' : 'O';
        this.resetGame();
    }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
