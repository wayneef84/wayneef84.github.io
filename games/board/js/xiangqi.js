/**
 * XIANGQI GAME ENGINE (With Undo & Visuals)
 * File: js/xiangqi.js
 */

class XiangqiGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;
        // statusCallback is a function(msg, color)

        // Dimensions
        this.cols = 9; this.rows = 10; this.cellSize = 45; this.margin = 30;
        this.boardWidth = (this.cols - 1) * this.cellSize;
        this.boardHeight = (this.rows - 1) * this.cellSize;
        this.width = this.boardWidth + this.margin * 2;
        this.height = this.boardHeight + this.margin * 2;
        
        this.canvas.width = this.width; this.canvas.height = this.height;

        // State
        this.board = this.initializeBoard();
        this.moveHistory = []; // HISTORY STACK
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentPlayer = 'red'; 
        this.isGameOver = false;

        // AI
        this.gameMode = 'pvp'; this.aiColor = 'black'; this.aiDifficulty = 2;

        // Events
        this.handleClickBound = (e) => this.handleClick(e);
        this.canvas.addEventListener('click', this.handleClickBound);
        
        // Initial Draw
        this.updateTurnDisplay();
        this.draw();
    }

    destroy() {
        this.canvas.removeEventListener('click', this.handleClickBound);
    }

    // Public methods for external controls
    undo() { this.undoMove(); }
    reset() { this.resetGame(); }
    setMode(mode) {
        this.gameMode = mode;
        this.resetGame();
    }
    setAIColor(color) {
        this.aiColor = color;
        this.resetGame();
    }
    setAIDifficulty(diff) {
        this.aiDifficulty = parseInt(diff);
    }

    initializeBoard() {
        const board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        
        // BLACK (Top)
        const bChars = ['車','馬','象','士','將','士','象','馬','車'];
        const bType = ['chariot','horse','elephant','advisor','general','advisor','elephant','horse','chariot'];
        bType.forEach((t, i) => board[0][i] = { type: t, player: 'black', char: bChars[i] });
        board[2][1] = { type: 'cannon', player: 'black', char: '砲' };
        board[2][7] = { type: 'cannon', player: 'black', char: '砲' };
        [0,2,4,6,8].forEach(c => board[3][c] = { type: 'soldier', player: 'black', char: '卒' });

        // RED (Bottom)
        const rChars = ['俥','傌','相','仕','帥','仕','相','傌','俥'];
        const rType = ['chariot','horse','elephant','advisor','general','advisor','elephant','horse','chariot'];
        rType.forEach((t, i) => board[9][i] = { type: t, player: 'red', char: rChars[i] });
        board[7][1] = { type: 'cannon', player: 'red', char: '炮' };
        board[7][7] = { type: 'cannon', player: 'red', char: '炮' };
        [0,2,4,6,8].forEach(c => board[6][c] = { type: 'soldier', player: 'red', char: '兵' });
        
        return board;
    }

    draw() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawPieces();
        this.drawValidMoves();

        if(this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.75)';
            this.ctx.fillRect(0, this.height/2 - 40, this.width, 80);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            // Use internal state or callback? callback updates DOM, but here we draw on canvas.
            // We can reconstruct the text.
            let text = "";
            if (XiangqiRules.isCheckmate(this.board, this.currentPlayer)) {
                 text = `${this.currentPlayer === 'red' ? 'BLACK' : 'RED'} WINS!`;
            } else {
                 text = "GAME OVER";
            }
            this.ctx.fillText(text, this.width/2, this.height/2);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = '#3d2b1f'; this.ctx.lineWidth = 1.5;
        const right = this.margin + this.boardWidth, bot = this.margin + this.boardHeight;
        
        for(let r=0; r<10; r++) { 
            const y=this.margin+r*this.cellSize; 
            this.ctx.beginPath(); this.ctx.moveTo(this.margin, y); this.ctx.lineTo(right, y); this.ctx.stroke(); 
        }
        for(let c=0; c<9; c++) { 
            const x=this.margin+c*this.cellSize; 
            this.ctx.beginPath(); this.ctx.moveTo(x, this.margin); this.ctx.lineTo(x, this.margin+4*this.cellSize); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.moveTo(x, this.margin+5*this.cellSize); this.ctx.lineTo(x, bot); this.ctx.stroke();
        }
        const yt=this.margin+4*this.cellSize, yb=this.margin+5*this.cellSize;
        this.ctx.beginPath(); this.ctx.moveTo(this.margin,yt); this.ctx.lineTo(this.margin,yb); this.ctx.moveTo(right,yt); this.ctx.lineTo(right,yb); this.ctx.stroke();
        
        const drawX=(ys)=>{ const y=this.margin+ys*this.cellSize, x1=this.margin+3*this.cellSize, x2=this.margin+5*this.cellSize; this.ctx.beginPath(); this.ctx.moveTo(x1,y); this.ctx.lineTo(x2,y+2*this.cellSize); this.ctx.moveTo(x2,y); this.ctx.lineTo(x1,y+2*this.cellSize); this.ctx.stroke(); }
        drawX(0); drawX(7);
        
        this.ctx.fillStyle='rgba(0,0,0,0.2)'; this.ctx.font='24px serif'; this.ctx.textAlign='center';
        this.ctx.fillText("楚 河              漢 界", this.width/2, this.margin+4.5*this.cellSize+8);
    }

    drawPieces() {
        for(let r=0; r<10; r++) for(let c=0; c<9; c++) {
            const p=this.board[r][c];
            if(p) {
                const x=this.margin+c*this.cellSize, y=this.margin+r*this.cellSize;
                if(this.selectedPiece && this.selectedPiece.r===r && this.selectedPiece.c===c) {
                    this.ctx.fillStyle='rgba(0,255,0,0.5)'; this.ctx.beginPath(); this.ctx.arc(x,y,22,0,Math.PI*2); this.ctx.fill();
                }
                this.ctx.fillStyle='#fdf5e6'; this.ctx.beginPath(); this.ctx.arc(x,y,19,0,Math.PI*2); this.ctx.fill();
                this.ctx.strokeStyle=p.player==='red'?'#c00':'#000'; this.ctx.lineWidth=2; this.ctx.stroke();
                this.ctx.fillStyle=p.player==='red'?'#c00':'#000'; this.ctx.font='bold 22px serif'; this.ctx.textAlign='center'; this.ctx.textBaseline='middle'; this.ctx.fillText(p.char,x,y+2);
            }
        }
    }

    drawValidMoves() {
        this.ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
        this.validMoves.forEach(m => {
            const x = this.margin + m.col * this.cellSize;
            const y = this.margin + m.row * this.cellSize;
            this.ctx.beginPath(); this.ctx.arc(x, y, 8, 0, Math.PI * 2); this.ctx.fill();
        });
    }

    handleClick(e) {
        if(this.isGameOver) return;
        if(this.gameMode==='ai' && this.currentPlayer===this.aiColor) return;

        const rect=this.canvas.getBoundingClientRect();
        const scaleX=this.canvas.width/rect.width, scaleY=this.canvas.height/rect.height;
        const c=Math.round(((e.clientX-rect.left)*scaleX - this.margin)/this.cellSize);
        const r=Math.round(((e.clientY-rect.top)*scaleY - this.margin)/this.cellSize);
        
        if(c<0||c>=9||r<0||r>=10) return;
        const piece = this.board[r][c];

        if(piece && piece.player===this.currentPlayer) {
            this.selectedPiece = {r,c}; 
            this.calculateValidMoves(r, c);
            this.draw(); 
            return;
        }

        if(this.selectedPiece) {
            const move = this.validMoves.find(m => m.row === r && m.col === c);
            if (move) {
                this.executeMove(this.selectedPiece.r, this.selectedPiece.c, r, c);
            } else {
                if (XiangqiRules.isValidMove(this.board, this.selectedPiece.r, this.selectedPiece.c, r, c, this.currentPlayer)) {
                     this.flashWarning("Move Illegal: Check or Flying General!");
                } else {
                     this.selectedPiece = null; this.validMoves = []; this.draw();
                }
            }
        }
    }

    calculateValidMoves(r, c) {
        this.validMoves = [];
        for(let tr=0; tr<10; tr++) for(let tc=0; tc<9; tc++) {
            if(XiangqiRules.isValidMove(this.board, r, c, tr, tc, this.currentPlayer)) {
                if(!XiangqiRules.willMoveCauseCheck(this.board, r, c, tr, tc, this.currentPlayer)) {
                    this.validMoves.push({row: tr, col: tc});
                }
            }
        }
    }

    executeMove(fr, fc, tr, tc) {
        // 1. SAVE HISTORY (Deep Copy)
        this.moveHistory.push({
            board: JSON.parse(JSON.stringify(this.board)),
            turn: this.currentPlayer
        });

        // 2. MOVE
        this.board[tr][tc] = this.board[fr][fc];
        this.board[fr][fc] = null;
        this.selectedPiece = null;
        this.validMoves = [];

        const nextPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.currentPlayer = nextPlayer;
        
        if(XiangqiRules.isCheckmate(this.board, nextPlayer)) {
            this.isGameOver = true;
            this.updateTurnDisplay(`${this.currentPlayer === 'red' ? 'BLACK' : 'RED'} WINS!`, 'red');
            this.draw();
            return;
        }

        if(XiangqiRules.isInCheck(this.board, nextPlayer)) {
            this.updateTurnDisplay(`${nextPlayer.toUpperCase()} IN CHECK!`, 'red');
        } else {
            this.updateTurnDisplay(nextPlayer === 'red' ? "Red's Turn" : "Black's Turn", 'black');
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        if (this.gameMode === 'ai' && this.currentPlayer !== this.aiColor) {
            if (this.moveHistory.length >= 2) {
                this.moveHistory.pop();
                const state = this.moveHistory.pop();
                this.restoreState(state);
            } else if (this.moveHistory.length === 1) {
                const state = this.moveHistory.pop();
                this.restoreState(state);
            }
        } else {
            const state = this.moveHistory.pop();
            this.restoreState(state);
        }
    }

    restoreState(state) {
        this.board = state.board;
        this.currentPlayer = state.turn;
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.updateTurnDisplay(this.currentPlayer === 'red' ? "Red's Turn" : "Black's Turn", 'black');
        this.draw();
    }

    makeAIMove() {
        this.updateTurnDisplay("AI Thinking...", 'black');
        setTimeout(() => {
            let move = null;
            if (typeof XiangqiAI !== 'undefined') {
                move = XiangqiAI.getBestMove(this.board, this.aiColor, this.aiDifficulty);
            } 
            if(!move) {
                const moves = XiangqiAI.getAllMoves(this.board, this.aiColor);
                if(moves.length) move = moves[Math.floor(Math.random()*moves.length)];
            }

            if (move) {
                this.executeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            } else {
                this.isGameOver = true;
                this.updateTurnDisplay("YOU WIN!", 'red');
                this.draw();
            }
        }, 50);
    }

    flashWarning(msg) {
        this.updateTurnDisplay(msg, 'red');
        setTimeout(() => {
            this.updateTurnDisplay(this.currentPlayer === 'red' ? "Red's Turn" : "Black's Turn", 'black');
        }, 2000);
    }

    handleModeChange(mode) {
        this.gameMode = mode;
        this.resetGame();
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.moveHistory = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.updateTurnDisplay("Red's Turn", 'black');
        this.draw();
        if (this.gameMode === 'ai' && this.aiColor === 'red') setTimeout(() => this.makeAIMove(), 500);
    }

    updateTurnDisplay(msg, color) {
        // Default update if not passed
        if (!msg) msg = this.currentPlayer === 'red' ? "Red's Turn" : "Black's Turn";

        if (this.statusCallback) {
            this.statusCallback(msg, color);
        }
    }
}
