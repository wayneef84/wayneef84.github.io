/**
 * XIANGQI GAME ENGINE (With Undo & Visuals)
 * File: js/game.js
 */

class XiangqiGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.turnDisplay = document.getElementById('turnDisplay');

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
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        const resetBtn = document.getElementById('resetButton');
        if(resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        
        // NEW: Undo Button Listener
        const undoBtn = document.getElementById('undoButton');
        if(undoBtn) undoBtn.addEventListener('click', () => this.undoMove());
        
        this.initControls();
        this.draw();
    }

    initControls() {
        const ms = document.querySelectorAll('input[name="mode"]');
        if(ms.length) ms.forEach(r => r.addEventListener('change', (e) => this.handleModeChange(e.target.value)));
        const ac = document.getElementById('aiColor');
        if(ac) ac.addEventListener('change', (e) => { this.aiColor = e.target.value; this.resetGame(); });
        const ad = document.getElementById('aiDifficulty');
        if(ad) ad.addEventListener('change', (e) => { this.aiDifficulty = parseInt(e.target.value); });
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
            this.ctx.fillText(this.turnDisplay.textContent, this.width/2, this.height/2);
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
            this.turnDisplay.textContent = `${this.currentPlayer === 'red' ? 'BLACK' : 'RED'} WINS!`;
            this.draw();
            return;
        }

        if(XiangqiRules.isInCheck(this.board, nextPlayer)) {
            this.turnDisplay.textContent = `${nextPlayer.toUpperCase()} IN CHECK!`;
            this.turnDisplay.style.color = "red";
        } else {
            this.updateTurnDisplay();
            this.turnDisplay.style.color = "black";
        }

        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    // NEW: Undo Logic
    undoMove() {
        if (this.moveHistory.length === 0) return;

        // If in AI mode, try to revert 2 steps (Computer's move + Player's move)
        // This ensures it goes back to "Player's Turn"
        if (this.gameMode === 'ai' && this.currentPlayer !== this.aiColor) {
            if (this.moveHistory.length >= 2) {
                this.moveHistory.pop(); // Pop AI move
                const state = this.moveHistory.pop(); // Pop Player move
                this.restoreState(state);
            } else if (this.moveHistory.length === 1) {
                // Rare edge case: Only player moved, AI hasn't moved yet (or crashed)
                const state = this.moveHistory.pop();
                this.restoreState(state);
            }
        } else {
            // PvP Mode: Just go back 1 step
            const state = this.moveHistory.pop();
            this.restoreState(state);
        }
    }

    restoreState(state) {
        this.board = state.board;
        this.currentPlayer = state.turn;
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false; // Clear game over state
        this.updateTurnDisplay();
        this.draw();
    }

    makeAIMove() {
        this.turnDisplay.textContent = "AI Thinking...";
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
                this.turnDisplay.textContent = "YOU WIN!";
                this.draw();
            }
        }, 50);
    }

    flashWarning(msg) {
        const old = this.turnDisplay.textContent;
        const oldColor = this.turnDisplay.style.color;
        this.turnDisplay.textContent = msg;
        this.turnDisplay.style.color = 'red';
        setTimeout(() => {
            this.turnDisplay.textContent = old;
            this.turnDisplay.style.color = oldColor;
        }, 2000);
    }

    handleModeChange(mode) {
        this.gameMode = mode;
        const aiControls = document.getElementById('aiControls');
        if(aiControls) aiControls.style.display = mode === 'ai' ? 'block' : 'none';
        this.resetGame();
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.moveHistory = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.updateTurnDisplay();
        this.draw();
        if (this.gameMode === 'ai' && this.aiColor === 'red') setTimeout(() => this.makeAIMove(), 500);
    }

    updateTurnDisplay() {
        this.turnDisplay.textContent = this.currentPlayer === 'red' ? "Red's Turn" : "Black's Turn";
    }
}

window.onload = () => new XiangqiGame();