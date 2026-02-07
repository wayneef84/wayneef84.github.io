/**
 * CHESS GAME ENGINE
 * File: js/chess.js
 */

class ChessGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.cols = 8;
        this.rows = 8;
        this.cellSize = Math.floor(Math.min(window.innerWidth, 600) / 10); // Dynamic size? No, stick to fixed or relative
        // Revert to fixed for simplicity
        this.cellSize = 60;
        this.margin = 30;
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        this.board = [];
        this.currentPlayer = 'white';
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
        const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        const wChars = ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'];
        const bChars = ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'];

        // Black (Top)
        for(let i=0; i<8; i++) {
            board[0][i] = { type: pieces[i], player: 'black', char: bChars[i] };
            board[1][i] = { type: 'pawn', player: 'black', char: '♟' };
        }

        // White (Bottom)
        for(let i=0; i<8; i++) {
            board[7][i] = { type: pieces[i], player: 'white', char: wChars[i] };
            board[6][i] = { type: 'pawn', player: 'white', char: '♙' };
        }
        return board;
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.isGameOver = false;
        this.moveHistory = [];
        this.validMoves = [];
        this.selectedPiece = null;
        this.updateStatus("White's Turn", 'black'); // Default color
        this.draw();

        if (this.gameMode === 'ai' && this.aiColor === 'white') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // 1. Draw Board Background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 2. Draw Grid
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const x = this.margin + c * this.cellSize;
                const y = this.margin + r * this.cellSize;
                this.ctx.fillStyle = (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                // Coordinates
                if (c === 0) {
                    this.ctx.fillStyle = (r % 2 === 0) ? '#b58863' : '#f0d9b5';
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(8 - r, x + 2, y + 12);
                }
                if (r === 7) {
                    this.ctx.fillStyle = (c % 2 !== 0) ? '#f0d9b5' : '#b58863';
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(String.fromCharCode(97 + c), x + this.cellSize - 10, y + this.cellSize - 2);
                }
            }
        }

        // 3. Draw Highlights (Selected & Valid Moves)
        if (this.selectedPiece) {
            const x = this.margin + this.selectedPiece.c * this.cellSize;
            const y = this.margin + this.selectedPiece.r * this.cellSize;
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }

        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.validMoves.forEach(m => {
            const x = this.margin + m.col * this.cellSize;
            const y = this.margin + m.row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize/2, y + this.cellSize/2, this.cellSize/6, 0, Math.PI*2);
            this.ctx.fill();
        });

        // 4. Draw Pieces
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${this.cellSize * 0.8}px Arial`; // Use system font for unicode

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p) {
                    const x = this.margin + c * this.cellSize + this.cellSize/2;
                    const y = this.margin + r * this.cellSize + this.cellSize/2 + 5; // Adjustment
                    this.ctx.fillStyle = p.player === 'white' ? '#fff' : '#000';
                    this.ctx.shadowColor = p.player === 'white' ? 'black' : 'white';
                    this.ctx.shadowBlur = 0;
                    // To make them distinct, maybe use stroke text for white?
                    // Unicode pieces are usually filled.
                    // Let's rely on standard colors.
                    if (p.player === 'white') {
                         this.ctx.fillStyle = '#fff';
                         this.ctx.shadowColor = '#000';
                         this.ctx.shadowBlur = 4;
                    } else {
                         this.ctx.fillStyle = '#000';
                         this.ctx.shadowColor = '#fff'; // Slight halo for black on dark squares
                         this.ctx.shadowBlur = 0;
                    }
                    this.ctx.fillText(p.char, x, y);
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
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

        // Move to valid square
        if (this.selectedPiece) {
            const move = this.validMoves.find(m => m.row === r && m.col === c);
            if (move) {
                this.executeMove(this.selectedPiece.r, this.selectedPiece.c, r, c);
            } else {
                this.selectedPiece = null;
                this.validMoves = [];
                this.draw();
            }
        }
    }

    calculateValidMoves(r, c) {
        this.validMoves = [];
        for (let tr = 0; tr < 8; tr++) {
            for (let tc = 0; tc < 8; tc++) {
                if (this.isValidMove(r, c, tr, tc, this.currentPlayer)) {
                    // Safety check (Kings cannot move into check)
                    // Simplified: Allow all valid geometric moves for now, or implement full check check
                    if (!this.willMoveCauseCheck(r, c, tr, tc, this.currentPlayer)) {
                        this.validMoves.push({ row: tr, col: tc });
                    }
                }
            }
        }
    }

    isValidMove(fr, fc, tr, tc, player) {
        if (fr === tr && fc === tc) return false;

        const piece = this.board[fr][fc];
        const target = this.board[tr][tc];

        if (!piece || piece.player !== player) return false;
        if (target && target.player === player) return false; // Cannot capture own

        const dr = tr - fr;
        const dc = tc - fc;
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);

        switch (piece.type) {
            case 'pawn':
                const direction = player === 'white' ? -1 : 1;
                const startRow = player === 'white' ? 6 : 1;

                // Move forward 1
                if (dc === 0 && dr === direction && !target) return true;
                // Move forward 2
                if (dc === 0 && dr === direction * 2 && fr === startRow && !target && !this.board[fr+direction][fc]) return true;
                // Capture diagonal
                if (absDc === 1 && dr === direction && target) return true;
                // En Passant (TODO)
                return false;

            case 'rook':
                if (dr !== 0 && dc !== 0) return false;
                return this.isPathClear(fr, fc, tr, tc);

            case 'knight':
                return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);

            case 'bishop':
                if (absDr !== absDc) return false;
                return this.isPathClear(fr, fc, tr, tc);

            case 'queen':
                if (dr !== 0 && dc !== 0 && absDr !== absDc) return false;
                return this.isPathClear(fr, fc, tr, tc);

            case 'king':
                // Normal move
                if (absDr <= 1 && absDc <= 1) return true;
                // Castling (TODO)
                return false;
        }
        return false;
    }

    isPathClear(fr, fc, tr, tc) {
        const dr = Math.sign(tr - fr);
        const dc = Math.sign(tc - fc);
        let r = fr + dr;
        let c = fc + dc;

        while (r !== tr || c !== tc) {
            if (this.board[r][c]) return false;
            r += dr;
            c += dc;
        }
        return true;
    }

    willMoveCauseCheck(fr, fc, tr, tc, player) {
        // Simulate move
        const tempBoard = this.board.map(row => row.map(cell => cell ? {...cell} : null));
        tempBoard[tr][tc] = tempBoard[fr][fc];
        tempBoard[fr][fc] = null;

        // Find King
        let kr = -1, kc = -1;
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = tempBoard[r][c];
            if(p && p.type === 'king' && p.player === player) { kr = r; kc = c; }
        }

        if (kr === -1) return true; // King dead (shouldn't happen)

        // Check if any enemy can attack King
        const enemy = player === 'white' ? 'black' : 'white';
        // Warning: This creates infinite recursion if isValidMove calls willMoveCauseCheck
        // So we need a raw 'canAttack' check that doesn't check for check

        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = tempBoard[r][c];
            if(p && p.player === enemy) {
                // Use a simplified validation that ignores "check" (to avoid recursion)
                // Just geometry + path clear
                if (this.isValidAttack(tempBoard, r, c, kr, kc, enemy)) return true;
            }
        }
        return false;
    }

    isValidAttack(board, fr, fc, tr, tc, player) {
        // Duplicate logic of isValidMove but accepts a board argument
        // And assumes no recursion
        // Simplified version:
        const piece = board[fr][fc];
        if (!piece) return false;

        const dr = tr - fr;
        const dc = tc - fc;
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);

        // Helper for path clear on custom board
        const isPathClear = () => {
             const stepR = Math.sign(dr);
             const stepC = Math.sign(dc);
             let r = fr + stepR;
             let c = fc + stepC;
             while(r !== tr || c !== tc) {
                 if(board[r][c]) return false;
                 r += stepR;
                 c += stepC;
             }
             return true;
        };

        switch (piece.type) {
            case 'pawn':
                const direction = player === 'white' ? -1 : 1;
                // Pawn attacks diagonally
                return absDc === 1 && dr === direction;
            case 'rook':
                return (dr === 0 || dc === 0) && isPathClear();
            case 'knight':
                return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
            case 'bishop':
                return absDr === absDc && isPathClear();
            case 'queen':
                return (dr === 0 || dc === 0 || absDr === absDc) && isPathClear();
            case 'king':
                return absDr <= 1 && absDc <= 1;
        }
        return false;
    }

    executeMove(fr, fc, tr, tc) {
        // 1. History
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        // 2. Move
        const piece = this.board[fr][fc];
        this.board[tr][tc] = piece;
        this.board[fr][fc] = null;

        // Promotion (Auto Queen)
        if (piece.type === 'pawn') {
            if ((piece.player === 'white' && tr === 0) || (piece.player === 'black' && tr === 7)) {
                piece.type = 'queen';
                piece.char = piece.player === 'white' ? '♕' : '♛';
            }
        }

        this.selectedPiece = null;
        this.validMoves = [];

        // 3. Next Turn
        const nextPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.currentPlayer = nextPlayer;

        // 4. Check Check/Checkmate
        if (this.isInCheck(nextPlayer)) {
            if (this.isCheckmate(nextPlayer)) {
                this.isGameOver = `${this.currentPlayer === 'white' ? 'BLACK' : 'WHITE'} WINS!`;
                this.updateStatus(this.isGameOver, 'red');
            } else {
                this.updateStatus(`${nextPlayer.toUpperCase()} CHECK!`, 'red');
            }
        } else {
            this.updateStatus(`${nextPlayer === 'white' ? "White's" : "Black's"} Turn`, 'black');
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    isInCheck(player) {
        // Find King
        let kr = -1, kc = -1;
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p && p.type === 'king' && p.player === player) { kr = r; kc = c; }
        }
        if (kr === -1) return true;

        const enemy = player === 'white' ? 'black' : 'white';
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p && p.player === enemy) {
                if(this.isValidAttack(this.board, r, c, kr, kc, enemy)) return true;
            }
        }
        return false;
    }

    isCheckmate(player) {
        // Try all moves
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            const p = this.board[r][c];
            if(p && p.player === player) {
                // Generate all moves for this piece
                for(let tr=0; tr<8; tr++) for(let tc=0; tc<8; tc++) {
                    if(this.isValidMove(r, c, tr, tc, player)) {
                        if(!this.willMoveCauseCheck(r, c, tr, tc, player)) {
                            return false; // Found escape
                        }
                    }
                }
            }
        }
        return true;
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

        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.updateStatus(`${this.currentPlayer === 'white' ? "White's" : "Black's"} Turn`, 'black');
        this.draw();
    }

    // Basic AI
    makeAIMove() {
        this.updateStatus("AI Thinking...", 'black');

        // Find all valid moves
        const moves = [];
        for(let r=0; r<8; r++) for(let c=0; c<8; c++) {
            if(this.board[r][c] && this.board[r][c].player === this.aiColor) {
                for(let tr=0; tr<8; tr++) for(let tc=0; tc<8; tc++) {
                    if(this.isValidMove(r, c, tr, tc, this.aiColor)) {
                         if(!this.willMoveCauseCheck(r, c, tr, tc, this.aiColor)) {
                             moves.push({fr:r, fc:c, tr, tc});
                         }
                    }
                }
            }
        }

        if(moves.length === 0) {
            this.isGameOver = "Stalemate / Checkmate"; // Should be detected by checkmate check
            this.updateStatus("GAME OVER");
            return;
        }

        // Simple Heuristic: Material Capture
        let bestMove = moves[0];
        let maxScore = -100;

        // Shuffle
        moves.sort(() => Math.random() - 0.5);

        moves.forEach(m => {
            let score = 0;
            const target = this.board[m.tr][m.tc];
            if (target) {
                if (target.type === 'queen') score = 9;
                else if (target.type === 'rook') score = 5;
                else if (target.type === 'bishop' || target.type === 'knight') score = 3;
                else score = 1;
            }
            if (score > maxScore) {
                maxScore = score;
                bestMove = m;
            }
        });

        this.executeMove(bestMove.fr, bestMove.fc, bestMove.tr, bestMove.tc);
    }

    // Interface stubs
    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) { this.aiColor = color; this.resetGame(); }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
