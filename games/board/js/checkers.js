/**
 * CHECKERS GAME ENGINE
 * File: js/checkers.js
 */

class CheckersGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 8;
        this.rows = 8;
        this.cellSize = 60;
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.moveHistory = [];

        // AI
        this.gameMode = 'pvp';
        this.aiColor = 'black';
        this.aiDifficulty = 2;

        // Events
        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        // Black (Top) - Rows 0, 1, 2
        for(let r=0; r<3; r++) {
            for(let c=0; c<8; c++) {
                if((r+c)%2 !== 0) board[r][c] = { type: 'man', player: 'black' };
            }
        }
        // Red (Bottom) - Rows 5, 6, 7
        for(let r=5; r<8; r++) {
            for(let c=0; c<8; c++) {
                if((r+c)%2 !== 0) board[r][c] = { type: 'man', player: 'red' };
            }
        }
        return board;
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.isGameOver = false;
        this.moveHistory = [];
        this.validMoves = [];
        this.selectedPiece = null;
        this.updateStatus("Red's Turn", 'black');
        this.draw();

        if (this.gameMode === 'ai' && this.aiColor === 'red') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // 1. Draw Board
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.width, this.height);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const x = this.margin + c * this.cellSize;
                const y = this.margin + r * this.cellSize;
                // Checkers board: Dark squares are playable
                // (r+c)%2 !== 0 is Dark
                this.ctx.fillStyle = (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }

        // 2. Highlights
        if (this.selectedPiece) {
            const x = this.margin + this.selectedPiece.c * this.cellSize;
            const y = this.margin + this.selectedPiece.r * this.cellSize;
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x+2, y+2, this.cellSize-4, this.cellSize-4);
        }

        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.validMoves.forEach(m => {
            const x = this.margin + m.col * this.cellSize;
            const y = this.margin + m.row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize/2, y + this.cellSize/2, this.cellSize/6, 0, Math.PI*2);
            this.ctx.fill();
        });

        // 3. Pieces
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p) {
                    const cx = this.margin + c * this.cellSize + this.cellSize/2;
                    const cy = this.margin + r * this.cellSize + this.cellSize/2;
                    const radius = this.cellSize/2 - 6;

                    this.ctx.beginPath();
                    this.ctx.arc(cx, cy, radius, 0, Math.PI*2);
                    this.ctx.fillStyle = p.player === 'red' ? '#d32f2f' : '#212121';
                    this.ctx.fill();

                    this.ctx.lineWidth = 2;
                    this.ctx.strokeStyle = p.player === 'red' ? '#ffcdd2' : '#757575';
                    this.ctx.stroke();

                    // King Indicator
                    if (p.type === 'king') {
                        this.ctx.fillStyle = '#ffd700';
                        this.ctx.font = '20px Arial';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText('♔', cx, cy + 2);
                    }
                }
            }
        }

        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
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
        const r = Math.floor((y - this.margin) / this.cellSize);

        if (c < 0 || c >= 8 || r < 0 || r >= 8) return;

        const piece = this.board[r][c];

        // Select own piece
        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = { r, c };
            this.calculateValidMoves(r, c);
            this.draw();
            return;
        }

        // Move
        if (this.selectedPiece) {
            const move = this.validMoves.find(m => m.row === r && m.col === c);
            if (move) {
                this.executeMove(this.selectedPiece.r, this.selectedPiece.c, r, c, move);
            } else {
                this.selectedPiece = null;
                this.validMoves = [];
                this.draw();
            }
        }
    }

    calculateValidMoves(r, c) {
        this.validMoves = [];
        const piece = this.board[r][c];
        if (!piece) return;

        const dirs = [];
        // Red moves UP (-1), Black moves DOWN (+1)
        if (piece.player === 'red' || piece.type === 'king') dirs.push(-1);
        if (piece.player === 'black' || piece.type === 'king') dirs.push(1);

        // Simple Moves & Jumps
        dirs.forEach(dr => {
            [-1, 1].forEach(dc => {
                const tr = r + dr;
                const tc = c + dc;

                if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                    if (!this.board[tr][tc]) {
                        // Empty square - regular move
                        // Check if jumps are forced? Not implemented for simplicity
                        this.validMoves.push({ row: tr, col: tc, isJump: false });
                    } else if (this.board[tr][tc].player !== piece.player) {
                        // Enemy - check jump
                        const jr = tr + dr;
                        const jc = tc + dc;
                        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && !this.board[jr][jc]) {
                            this.validMoves.push({ row: jr, col: jc, isJump: true, captured: {r: tr, c: tc} });
                        }
                    }
                }
            });
        });

        // Forced Jumps Logic (Optional but good)
        // If any jump exists, filter out non-jumps?
        // Let's implement forced jumps for better gameplay
        const hasJump = this.validMoves.some(m => m.isJump);
        if (hasJump) {
            this.validMoves = this.validMoves.filter(m => m.isJump);
        }
    }

    executeMove(fr, fc, tr, tc, move) {
        // 1. History
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        // 2. Move
        const piece = this.board[fr][fc];
        this.board[tr][tc] = piece;
        this.board[fr][fc] = null;

        // Capture
        if (move.isJump && move.captured) {
            this.board[move.captured.r][move.captured.c] = null;
        }

        // Promotion
        if (piece.type === 'man') {
            if ((piece.player === 'red' && tr === 0) || (piece.player === 'black' && tr === 7)) {
                piece.type = 'king';
            }
        }

        this.selectedPiece = null;
        this.validMoves = [];

        // Check Multi-Jump (TODO: If jump was made, check if same piece can jump again)
        // For simplicity: End turn always.

        // 3. Next Turn
        const nextPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.currentPlayer = nextPlayer;

        // 4. Check Win
        if (!this.canMove(nextPlayer)) {
            this.isGameOver = `${this.currentPlayer === 'red' ? 'BLACK' : 'RED'} WINS!`;
            this.updateStatus(this.isGameOver, 'red');
        } else {
            this.updateStatus(`${nextPlayer === 'red' ? "Red's" : "Black's"} Turn`, 'black');
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    canMove(player) {
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p && p.player === player) {
                // Check if any valid move exists
                // Hack: use calculateValidMoves on a temp selectedPiece
                // But calculateValidMoves uses 'this.selectedPiece' which is not set?
                // Ah, calculateValidMoves(r, c) calculates for (r,c) regardless of selection
                // Wait, my calculateValidMoves takes r,c arguments.
                // But it writes to this.validMoves.
                // I need a pure function `getMoves(r, c)`

                // Let's just implement a quick check
                const dirs = [];
                if (p.player === 'red' || p.type === 'king') dirs.push(-1);
                if (p.player === 'black' || p.type === 'king') dirs.push(1);

                for(let dr of dirs) {
                    for(let dc of [-1, 1]) {
                        const tr = r + dr, tc = c + dc;
                        if(tr>=0 && tr<8 && tc>=0 && tc<8) {
                            if(!this.board[tr][tc]) return true; // Can move
                            if(this.board[tr][tc].player !== player) {
                                // Check jump
                                const jr = tr + dr, jc = tc + dc;
                                if(jr>=0 && jr<8 && jc>=0 && jc<8 && !this.board[jr][jc]) return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    makeAIMove() {
        this.updateStatus("AI Thinking...", 'black');

        // Find all moves
        let allMoves = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            if(this.board[r][c] && this.board[r][c].player === this.aiColor) {
                // We need to re-implement move generation or use the method
                // But calculateValidMoves relies on side-effects (modifying this.validMoves)
                // I'll wrap it
                const oldMoves = this.validMoves;
                this.calculateValidMoves(r, c);
                const moves = this.validMoves;
                moves.forEach(m => allMoves.push({fr:r, fc:c, ...m}));
                this.validMoves = oldMoves; // Restore
            }
        }

        if(allMoves.length === 0) {
            this.isGameOver = "Stalemate"; // Or Loss
             this.updateStatus("YOU WIN!", 'red');
            return;
        }

        // Prioritize Jumps
        const jumps = allMoves.filter(m => m.isJump);
        const moves = jumps.length > 0 ? jumps : allMoves;

        // Random pick
        const move = moves[Math.floor(Math.random() * moves.length)];

        this.executeMove(move.fr, move.fc, move.row, move.col, move);
    }

    // Interface
    undo() {
        if (this.moveHistory.length === 0) return;
        let steps = (this.gameMode === 'ai' && this.currentPlayer !== this.aiColor) ? 2 : 1;
        if (this.moveHistory.length < steps) steps = this.moveHistory.length;

        for(let i=0; i<steps; i++) {
            const state = this.moveHistory.pop();
            this.board = state.board;
            this.currentPlayer = state.turn;
        }
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.updateStatus(`${this.currentPlayer === 'red' ? "Red's" : "Black's"} Turn`, 'black');
        this.draw();
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) { this.aiColor = color; this.resetGame(); }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
