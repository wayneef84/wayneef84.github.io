/**
 * MANCALA GAME ENGINE
 * File: js/mancala.js
 */

class MancalaGame {
    constructor(canvas, ctx, statusCallback) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.statusCallback = statusCallback;

        // Constants
        this.pitWidth = 80;
        this.pitHeight = 80;
        this.storeWidth = 100;
        this.margin = 20;

        this.width = (this.storeWidth * 2) + (this.pitWidth * 6) + (this.margin * 4);
        this.height = (this.pitHeight * 2) + (this.margin * 3);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // State
        // Pits: 0-5 (Bottom/Player 1), 6 (Store 1), 7-12 (Top/Player 2 - Reversed for logic?), 13 (Store 2)
        // Let's use standard indexing:
        // P1 (Red/Bottom): 0, 1, 2, 3, 4, 5. Store: 6.
        // P2 (Blue/Top): 7, 8, 9, 10, 11, 12. Store: 13.
        // Sowing is CCW: 0->1...->6->7...->13->0
        this.pits = [];
        this.currentPlayer = 0; // 0 = P1 (Red), 1 = P2 (Blue)
        this.isGameOver = false;
        this.moveHistory = [];
        this.extraTurn = false;

        // AI
        this.gameMode = 'pvp';
        this.aiPlayerIndex = 1; // AI is usually Top (Blue)
        this.aiDifficulty = 2;

        // Input
        this.inputCleanup = GameEngine.addInputListener(this.canvas, (e) => this.handleClick(e));

        this.resetGame();
    }

    destroy() {
        if (this.inputCleanup) this.inputCleanup();
    }

    resetGame() {
        // Init 4 stones per pit
        this.pits = Array(14).fill(4);
        this.pits[6] = 0;
        this.pits[13] = 0;

        this.currentPlayer = 0; // P1 Starts
        this.isGameOver = false;
        this.moveHistory = [];
        this.extraTurn = false;

        this.updateStatus("Player 1's Turn", 'red');
        this.draw();

        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayerIndex) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    draw() {
        // Board Background
        this.ctx.fillStyle = '#8d6e63';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = '#5d4037';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.width, this.height);

        // Draw Pits
        // P1 (Bottom): 0-5. Left to Right.
        // P2 (Top): 7-12. Right to Left (so they align).

        const startX = this.margin + this.storeWidth + this.margin;

        // P2 Top Row (indices 12 down to 7)
        for(let i=0; i<6; i++) {
            const idx = 12 - i;
            const x = startX + i * this.pitWidth;
            const y = this.margin;
            this.drawPit(x, y, this.pits[idx], idx === 13 ? 'store' : 'pit', 1);
        }

        // P1 Bottom Row (indices 0 to 5)
        for(let i=0; i<6; i++) {
            const idx = i;
            const x = startX + i * this.pitWidth;
            const y = this.margin + this.pitHeight + this.margin;
            this.drawPit(x, y, this.pits[idx], 'pit', 0);
        }

        // Stores
        // Store 2 (P2) - Left
        this.drawPit(this.margin, this.margin, this.pits[13], 'store', 1);

        // Store 1 (P1) - Right
        this.drawPit(this.width - this.margin - this.storeWidth, this.margin, this.pits[6], 'store', 0);

        // Game Over
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

    drawPit(x, y, count, type, owner) {
        const w = type === 'store' ? this.storeWidth : this.pitWidth;
        const h = type === 'store' ? (this.pitHeight * 2 + this.margin) : this.pitHeight;

        this.ctx.fillStyle = '#3e2723';
        this.ctx.beginPath();
        // Rounded rect
        this.ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 20);
        this.ctx.fill();

        // Label (stones)
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(count, x + w/2, y + h/2);

        // Stones visual (simple dots)
        // ... (Optional polish)

        // Highlight active player side
        if (this.currentPlayer === owner && !this.isGameOver && type !== 'store') {
            this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x+2, y+2, w-4, h-4);
        }
    }

    handleClick(e) {
        if (this.isGameOver) return;
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayerIndex) return;

        const { x, y } = GameEngine.getEventCoords(e, this.canvas);

        // Identify pit
        let clickedPit = -1;
        const startX = this.margin + this.storeWidth + this.margin;

        // Check P1 Row
        if (y > this.margin + this.pitHeight) {
            const col = Math.floor((x - startX) / this.pitWidth);
            if (col >= 0 && col < 6) clickedPit = col;
        }
        // Check P2 Row
        else {
            const col = Math.floor((x - startX) / this.pitWidth);
            if (col >= 0 && col < 6) clickedPit = 12 - col;
        }

        if (clickedPit !== -1) {
            // Validate: Must be own side
            if (this.currentPlayer === 0 && (clickedPit < 0 || clickedPit > 5)) return;
            if (this.currentPlayer === 1 && (clickedPit < 7 || clickedPit > 12)) return;

            // Validate: Must have stones
            if (this.pits[clickedPit] === 0) return;

            this.executeMove(clickedPit);
        }
    }

    executeMove(startPit) {
        this.moveHistory.push({
            pits: [...this.pits],
            turn: this.currentPlayer
        });

        let stones = this.pits[startPit];
        this.pits[startPit] = 0;
        let current = startPit;

        while (stones > 0) {
            current = (current + 1) % 14;

            // Skip opponent store
            if (this.currentPlayer === 0 && current === 13) continue;
            if (this.currentPlayer === 1 && current === 6) continue;

            this.pits[current]++;
            stones--;
        }

        // Rules
        let repeatTurn = false;

        // 1. End in own store?
        if (this.currentPlayer === 0 && current === 6) repeatTurn = true;
        else if (this.currentPlayer === 1 && current === 13) repeatTurn = true;

        // 2. Capture? (End in empty pit on own side)
        else {
            const isOwnSide = (this.currentPlayer === 0 && current >= 0 && current <= 5) ||
                              (this.currentPlayer === 1 && current >= 7 && current <= 12);

            if (isOwnSide && this.pits[current] === 1) {
                // Capture opposite
                const opposite = 12 - current;
                if (this.pits[opposite] > 0) {
                    const captured = this.pits[opposite] + 1; // +1 is the one we just placed
                    this.pits[opposite] = 0;
                    this.pits[current] = 0;
                    const store = this.currentPlayer === 0 ? 6 : 13;
                    this.pits[store] += captured;
                }
            }
        }

        // Check End Game
        if (this.checkEmptySide(0) || this.checkEmptySide(1)) {
            this.endGame();
        } else {
            if (!repeatTurn) {
                this.currentPlayer = 1 - this.currentPlayer;
            }
            this.updateStatus(repeatTurn ? `Go Again, Player ${this.currentPlayer+1}` : `Player ${this.currentPlayer+1}'s Turn`,
                              this.currentPlayer === 0 ? 'red' : 'blue');
        }

        this.draw();

        if (!this.isGameOver && this.gameMode === 'ai' && this.currentPlayer === this.aiPlayerIndex) {
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }

    checkEmptySide(playerIdx) {
        const start = playerIdx === 0 ? 0 : 7;
        const end = playerIdx === 0 ? 5 : 12;
        for(let i=start; i<=end; i++) {
            if(this.pits[i] > 0) return false;
        }
        return true;
    }

    endGame() {
        // Collect remaining
        let p1Sum = 0;
        for(let i=0; i<=5; i++) p1Sum += this.pits[i];

        let p2Sum = 0;
        for(let i=7; i<=12; i++) p2Sum += this.pits[i];

        // Usually remaining go to their own store
        this.pits[6] += p1Sum;
        this.pits[13] += p2Sum;

        // Clear pits
        for(let i=0; i<=5; i++) this.pits[i] = 0;
        for(let i=7; i<=12; i++) this.pits[i] = 0;

        // Winner
        if (this.pits[6] > this.pits[13]) {
            this.isGameOver = "PLAYER 1 WINS!";
        } else if (this.pits[13] > this.pits[6]) {
            this.isGameOver = "PLAYER 2 WINS!";
        } else {
            this.isGameOver = "DRAW!";
        }
        this.updateStatus(this.isGameOver);
    }

    undo() {
        // ... (Same pattern)
        if(this.moveHistory.length > 0) {
            const state = this.moveHistory.pop();
            this.pits = state.pits;
            this.currentPlayer = state.turn;
            this.isGameOver = false;
            this.draw();
        }
    }

    makeAIMove() {
        // Logic for AI (Random legal move)
        const start = this.aiPlayerIndex === 0 ? 0 : 7;
        const end = this.aiPlayerIndex === 0 ? 5 : 12;
        const valid = [];
        for(let i=start; i<=end; i++) {
            if(this.pits[i] > 0) valid.push(i);
        }
        if(valid.length > 0) {
            const move = valid[Math.floor(Math.random() * valid.length)];
            this.executeMove(move);
        }
    }

    setMode(mode) { this.gameMode = mode; this.resetGame(); }
    setAIColor(color) {
        this.aiPlayerIndex = (color === 'red') ? 0 : 1;
        this.resetGame();
    }
    setAIDifficulty(diff) { this.aiDifficulty = diff; }

    updateStatus(msg, color) {
        if (this.statusCallback) this.statusCallback(msg, color);
    }
}
