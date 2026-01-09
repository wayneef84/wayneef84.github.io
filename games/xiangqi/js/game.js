/**
 * XIANGQI GAME ENGINE (Character Fix)
 * File: js/game.js
 */

class XiangqiGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.turnDisplay = document.getElementById('turnDisplay');

        // Dimensions
        this.cols = 9;
        this.rows = 10;
        this.cellSize = 45;
        this.margin = 30;

        // Board Size
        this.boardWidth = (this.cols - 1) * this.cellSize;
        this.boardHeight = (this.rows - 1) * this.cellSize;
        this.width = this.boardWidth + this.margin * 2;
        this.height = this.boardHeight + this.margin * 2;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.currentPlayer = 'red'; 
        
        // AI Settings
        this.gameMode = 'pvp'; 
        this.aiColor = 'black'; 
        this.aiDifficulty = 2;
        this.isAiThinking = false;

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        const resetBtn = document.getElementById('resetButton');
        if(resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        
        this.initControls();
        this.draw();
    }

    initControls() {
        const modeSelectors = document.querySelectorAll('input[name="mode"]');
        if(modeSelectors.length) {
            modeSelectors.forEach(r => r.addEventListener('change', (e) => this.handleModeChange(e.target.value)));
        }
        const aiC = document.getElementById('aiColor');
        if(aiC) aiC.addEventListener('change', (e) => { this.aiColor = e.target.value; this.resetGame(); });
        const aiD = document.getElementById('aiDifficulty');
        if(aiD) aiD.addEventListener('change', (e) => { this.aiDifficulty = parseInt(e.target.value); });
    }

    initializeBoard() {
        const board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

        // --- BLACK PIECES (TOP: Rows 0-3) ---
        // 車(Rook) 馬(Horse) 象(Elephant) 士(Advisor) 將(General)
        const bChars = ['車','馬','象','士','將','士','象','馬','車'];
        const bType = ['chariot','horse','elephant','advisor','general','advisor','elephant','horse','chariot'];
        
        bType.forEach((t, i) => board[0][i] = { type: t, player: 'black', char: bChars[i] });
        board[2][1] = { type: 'cannon', player: 'black', char: '砲' }; // Stone radical
        board[2][7] = { type: 'cannon', player: 'black', char: '砲' };
        [0,2,4,6,8].forEach(c => board[3][c] = { type: 'soldier', player: 'black', char: '卒' });

        // --- RED PIECES (BOTTOM: Rows 6-9) ---
        // 俥(Rook) 傌(Horse) 相(Elephant) 仕(Advisor) 帥(General)
        // NOTICE: These now have the '亻' (Person/Stick) radical!
        const rChars = ['俥','傌','相','仕','帥','仕','相','傌','俥'];
        const rType = ['chariot','horse','elephant','advisor','general','advisor','elephant','horse','chariot'];

        rType.forEach((t, i) => board[9][i] = { type: t, player: 'red', char: rChars[i] });
        board[7][1] = { type: 'cannon', player: 'red', char: '炮' }; // Fire radical
        board[7][7] = { type: 'cannon', player: 'red', char: '炮' };
        [0,2,4,6,8].forEach(c => board[6][c] = { type: 'soldier', player: 'red', char: '兵' }); // Soldier

        return board;
    }

    draw() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawPieces();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#3d2b1f';
        this.ctx.lineWidth = 1.5;

        const rightEdge = this.margin + this.boardWidth;
        const bottomEdge = this.margin + this.boardHeight;

        // Horizontal
        for(let r=0; r<10; r++) {
            const y = this.margin + r * this.cellSize;
            this.ctx.beginPath(); this.ctx.moveTo(this.margin, y); this.ctx.lineTo(rightEdge, y); this.ctx.stroke();
        }
        
        // Vertical
        for(let c=0; c<9; c++) {
            const x = this.margin + c * this.cellSize;
            // Top Half
            this.ctx.beginPath(); this.ctx.moveTo(x, this.margin); this.ctx.lineTo(x, this.margin + 4*this.cellSize); this.ctx.stroke();
            // Bottom Half
            this.ctx.beginPath(); this.ctx.moveTo(x, this.margin + 5*this.cellSize); this.ctx.lineTo(x, bottomEdge); this.ctx.stroke();
        }

        // River Connectors
        const yTop = this.margin + 4*this.cellSize;
        const yBot = this.margin + 5*this.cellSize;
        this.ctx.beginPath();
        this.ctx.moveTo(this.margin, yTop); this.ctx.lineTo(this.margin, yBot); // Left
        this.ctx.moveTo(rightEdge, yTop); this.ctx.lineTo(rightEdge, yBot); // Right
        this.ctx.stroke();

        // Palaces
        const drawX = (yStart) => {
            const y = this.margin + yStart * this.cellSize;
            const x1 = this.margin + 3 * this.cellSize;
            const x2 = this.margin + 5 * this.cellSize;
            this.ctx.beginPath(); 
            this.ctx.moveTo(x1, y); this.ctx.lineTo(x2, y+2*this.cellSize);
            this.ctx.moveTo(x2, y); this.ctx.lineTo(x1, y+2*this.cellSize);
            this.ctx.stroke();
        };
        drawX(0); // Top
        drawX(7); // Bottom
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.font = '24px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText("楚 河              漢 界", this.width/2, this.margin + 4.5*this.cellSize + 8);
    }

    drawPieces() {
        for(let r=0; r<10; r++) {
            for(let c=0; c<9; c++) {
                const p = this.board[r][c];
                if(p) {
                    const x = this.margin + c * this.cellSize;
                    const y = this.margin + r * this.cellSize;
                    
                    if(this.selectedPiece && this.selectedPiece.r === r && this.selectedPiece.c === c) {
                        this.ctx.fillStyle = 'rgba(0,255,0,0.5)';
                        this.ctx.beginPath(); this.ctx.arc(x, y, 22, 0, Math.PI*2); this.ctx.fill();
                    }

                    this.ctx.fillStyle = '#fdf5e6';
                    this.ctx.beginPath(); this.ctx.arc(x, y, 19, 0, Math.PI*2); this.ctx.fill();
                    this.ctx.strokeStyle = p.player === 'red' ? '#c00' : '#000';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();

                    this.ctx.fillStyle = p.player === 'red' ? '#c00' : '#000';
                    this.ctx.font = 'bold 22px serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(p.char, x, y + 2);
                }
            }
        }
    }

    handleClick(e) {
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const c = Math.round((clickX - this.margin) / this.cellSize);
        const r = Math.round((clickY - this.margin) / this.cellSize);

        if (c < 0 || c >= 9 || r < 0 || r >= 10) return;

        const piece = this.board[r][c];
        
        if (piece && piece.player === this.currentPlayer) {
            this.selectedPiece = { r, c };
            this.draw();
            return;
        }

        if (this.selectedPiece) {
            if (XiangqiRules.isValidMove(this.board, this.selectedPiece.r, this.selectedPiece.c, r, c, this.currentPlayer)) {
                this.executeMove(this.selectedPiece.r, this.selectedPiece.c, r, c);
            }
        }
    }

    executeMove(fr, fc, tr, tc) {
        this.board[tr][tc] = this.board[fr][fc];
        this.board[fr][fc] = null;
        this.selectedPiece = null;
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.updateTurnDisplay();
        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
            setTimeout(() => this.makeAIMove(), 500);
        }
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
            }
        }, 50);
    }

    handleModeChange(mode) {
        this.gameMode = mode;
        const aiControls = document.getElementById('aiControls');
        if(aiControls) aiControls.style.display = mode === 'ai' ? 'block' : 'none';
        this.resetGame();
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.updateTurnDisplay();
        this.draw();
        if (this.gameMode === 'ai' && this.aiColor === 'red') setTimeout(() => this.makeAIMove(), 500);
    }

    updateTurnDisplay() {
        this.turnDisplay.textContent = this.currentPlayer === 'red' ? "Red's Turn" : "Black's Turn";
    }
}

window.onload = () => new XiangqiGame();