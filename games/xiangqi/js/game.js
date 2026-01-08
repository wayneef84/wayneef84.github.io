class XiangqiGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.turnDisplay = document.getElementById('turnDisplay');

        // Board dimensions
        this.cols = 9;
        this.rows = 10;
        this.cellSize = 45;
        this.margin = 30;

        // Canvas size
        this.width = this.cols * this.cellSize + this.margin * 2;
        this.height = this.rows * this.cellSize + this.margin * 2;

        // Set canvas dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Game state
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.currentPlayer = 'red'; // red moves first

        // AI state
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.aiColor = 'red'; // 'red' or 'black' - which color AI plays
        this.aiDifficulty = 2; // 1, 2, or 3
        this.isAiThinking = false;

        // Bind events
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('resetButton').addEventListener('click', () => this.resetGame());

        // Mode selection
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleModeChange(e.target.value));
        });

        // AI color selection
        document.getElementById('aiColor').addEventListener('change', (e) => {
            this.aiColor = e.target.value;
            // Reset game when changing AI color to avoid confusion
            this.resetGame();
        });

        // AI difficulty
        document.getElementById('aiDifficulty').addEventListener('change', (e) => {
            this.aiDifficulty = parseInt(e.target.value);
        });

        // Initial draw
        this.draw();
    }

    initializeBoard() {
        // Create empty board
        const board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

        // Red pieces (bottom, rows 0-4)
        board[0][0] = { type: 'chariot', player: 'red', char: '車' };
        board[0][1] = { type: 'horse', player: 'red', char: '馬' };
        board[0][2] = { type: 'elephant', player: 'red', char: '相' };
        board[0][3] = { type: 'advisor', player: 'red', char: '仕' };
        board[0][4] = { type: 'general', player: 'red', char: '帥' };
        board[0][5] = { type: 'advisor', player: 'red', char: '仕' };
        board[0][6] = { type: 'elephant', player: 'red', char: '相' };
        board[0][7] = { type: 'horse', player: 'red', char: '馬' };
        board[0][8] = { type: 'chariot', player: 'red', char: '車' };

        board[2][1] = { type: 'cannon', player: 'red', char: '炮' };
        board[2][7] = { type: 'cannon', player: 'red', char: '炮' };

        board[3][0] = { type: 'soldier', player: 'red', char: '兵' };
        board[3][2] = { type: 'soldier', player: 'red', char: '兵' };
        board[3][4] = { type: 'soldier', player: 'red', char: '兵' };
        board[3][6] = { type: 'soldier', player: 'red', char: '兵' };
        board[3][8] = { type: 'soldier', player: 'red', char: '兵' };

        // Black pieces (top, rows 5-9)
        board[9][0] = { type: 'chariot', player: 'black', char: '車' };
        board[9][1] = { type: 'horse', player: 'black', char: '馬' };
        board[9][2] = { type: 'elephant', player: 'black', char: '象' };
        board[9][3] = { type: 'advisor', player: 'black', char: '士' };
        board[9][4] = { type: 'general', player: 'black', char: '將' };
        board[9][5] = { type: 'advisor', player: 'black', char: '士' };
        board[9][6] = { type: 'elephant', player: 'black', char: '象' };
        board[9][7] = { type: 'horse', player: 'black', char: '馬' };
        board[9][8] = { type: 'chariot', player: 'black', char: '車' };

        board[7][1] = { type: 'cannon', player: 'black', char: '炮' };
        board[7][7] = { type: 'cannon', player: 'black', char: '炮' };

        board[6][0] = { type: 'soldier', player: 'black', char: '卒' };
        board[6][2] = { type: 'soldier', player: 'black', char: '卒' };
        board[6][4] = { type: 'soldier', player: 'black', char: '卒' };
        board[6][6] = { type: 'soldier', player: 'black', char: '卒' };
        board[6][8] = { type: 'soldier', player: 'black', char: '卒' };

        return board;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.drawBoard();
        this.drawRiver();
        this.drawPalaces();
        this.drawPieces();
    }

    drawBoard() {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;

        // Draw vertical lines (9 columns)
        for (let col = 0; col < this.cols; col++) {
            const x = this.margin + col * this.cellSize;
            const y1 = this.margin;
            const y2 = this.margin + (this.rows - 1) * this.cellSize;

            this.ctx.beginPath();
            this.ctx.moveTo(x, y1);
            this.ctx.lineTo(x, y2);
            this.ctx.stroke();
        }

        // Draw horizontal lines (10 rows, with gap at river)
        for (let row = 0; row < this.rows; row++) {
            const y = this.margin + row * this.cellSize;

            // Full line for rows 0, 5, 9
            if (row === 0 || row === 5 || row === 9) {
                const x1 = this.margin;
                const x2 = this.margin + (this.cols - 1) * this.cellSize;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y);
                this.ctx.lineTo(x2, y);
                this.ctx.stroke();
            } else {
                // Split lines at river for other rows
                const x1 = this.margin;
                const x2 = this.margin + (this.cols - 1) * this.cellSize;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y);
                this.ctx.lineTo(x2, y);
                this.ctx.stroke();
            }
        }
    }

    drawRiver() {
        const riverY = this.margin + 4.5 * this.cellSize;
        const riverHeight = this.cellSize;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(100, 150, 200, 0.1)';
        this.ctx.fillRect(
            this.margin,
            riverY,
            (this.cols - 1) * this.cellSize,
            riverHeight
        );

        // Draw "河界" (River Boundary) text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 20px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('楚河', this.margin + 2 * this.cellSize, riverY + riverHeight / 2);
        this.ctx.fillText('漢界', this.margin + 6 * this.cellSize, riverY + riverHeight / 2);
        this.ctx.restore();
    }

    drawPalaces() {
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1.5;

        // Black palace (top) - rows 7-9, cols 3-5
        this.drawPalaceX(3, 7);

        // Red palace (bottom) - rows 0-2, cols 3-5
        this.drawPalaceX(3, 0);
    }

    drawPalaceX(startCol, startRow) {
        const x1 = this.margin + startCol * this.cellSize;
        const y1 = this.margin + startRow * this.cellSize;
        const x2 = this.margin + (startCol + 2) * this.cellSize;
        const y2 = this.margin + (startRow + 2) * this.cellSize;

        // Draw X
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x2, y1);
        this.ctx.lineTo(x1, y2);
        this.ctx.stroke();
    }

    drawPieces() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const isSelected = this.selectedPiece &&
                                     this.selectedPiece.row === row &&
                                     this.selectedPiece.col === col;
                    this.drawPiece(col, row, piece, isSelected);
                }
            }
        }
    }

    drawPiece(col, row, piece, isSelected) {
        const x = this.margin + col * this.cellSize;
        const y = this.margin + row * this.cellSize;
        const radius = 18;

        this.ctx.save();

        // Draw piece circle background
        this.ctx.fillStyle = piece.player === 'red' ? '#FFE4E1' : '#F0F0F0';
        this.ctx.strokeStyle = piece.player === 'red' ? '#8B0000' : '#000';
        this.ctx.lineWidth = 2.5;

        // Highlight selected piece
        if (isSelected) {
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            this.ctx.shadowBlur = 15;
            this.ctx.lineWidth = 3.5;
            this.ctx.strokeStyle = '#FFD700';
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;

        // Draw Chinese character
        this.ctx.fillStyle = piece.player === 'red' ? '#8B0000' : '#000';
        this.ctx.font = 'bold 24px serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(piece.char, x, y);

        this.ctx.restore();
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Convert to board coordinates
        const col = Math.round((clickX - this.margin) / this.cellSize);
        const row = Math.round((clickY - this.margin) / this.cellSize);

        // Check if click is within board bounds
        if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
            return;
        }

        // Prevent interaction during AI's turn
        if (this.isAiThinking || (this.gameMode === 'ai' && this.currentPlayer === this.aiColor)) {
            return;
        }

        const clickedPiece = this.board[row][col];

        // If no piece is selected
        if (!this.selectedPiece) {
            if (clickedPiece && clickedPiece.player === this.currentPlayer) {
                // Select the piece (only if it belongs to current player)
                this.selectedPiece = { row, col };
                this.draw();
            }
        } else {
            // A piece is already selected
            const selectedRow = this.selectedPiece.row;
            const selectedCol = this.selectedPiece.col;

            // If clicking the same piece, deselect it
            if (row === selectedRow && col === selectedCol) {
                this.selectedPiece = null;
                this.draw();
            } else if (clickedPiece && clickedPiece.player === this.currentPlayer) {
                // Clicking another piece of same player - switch selection
                this.selectedPiece = { row, col };
                this.draw();
            } else {
                // Attempt to move - validate first
                const isValid = XiangqiRules.isValidMove(
                    this.board,
                    selectedRow,
                    selectedCol,
                    row,
                    col,
                    this.currentPlayer
                );

                if (isValid) {
                    // Valid move - execute it
                    this.board[row][col] = this.board[selectedRow][selectedCol];
                    this.board[selectedRow][selectedCol] = null;
                    this.selectedPiece = null;

                    // Toggle player
                    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                    this.updateTurnDisplay();

                    this.draw();

                    // Trigger AI move if in AI mode and it's AI's turn
                    if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
                        this.makeAIMove();
                    }
                } else {
                    // Invalid move - flash the board and keep selection
                    this.flashInvalidMove();
                }
            }
        }
    }

    updateTurnDisplay() {
        const playerName = this.currentPlayer === 'red' ? 'Red' : 'Black';
        this.turnDisplay.textContent = `${playerName}'s Turn`;
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.currentPlayer = 'red';
        this.updateTurnDisplay();
        this.draw();

        // If in AI mode and it's AI's turn (AI is Red), trigger AI move
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiColor) {
            setTimeout(() => {
                this.makeAIMove();
            }, 100); // Small delay to ensure board is drawn
        }
    }

    flashInvalidMove() {
        // Visual feedback for invalid move - briefly flash red overlay
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.restore();

        // Restore normal view after brief delay
        setTimeout(() => {
            this.draw();
        }, 150);
    }

    handleModeChange(mode) {
        this.gameMode = mode;
        const aiControls = document.getElementById('aiControls');

        if (mode === 'ai') {
            aiControls.style.display = 'flex';
            // If it's currently AI's turn, trigger AI move after brief delay
            if (this.currentPlayer === this.aiColor) {
                setTimeout(() => {
                    this.makeAIMove();
                }, 100); // Small delay to ensure UI is ready
            }
        } else {
            aiControls.style.display = 'none';
        }
    }

    makeAIMove() {
        if (this.isAiThinking || this.gameMode !== 'ai' || this.currentPlayer !== this.aiColor) {
            return;
        }

        this.isAiThinking = true;
        this.turnDisplay.textContent = 'AI is thinking...';

        // Delay to show thinking message
        setTimeout(() => {
            const move = XiangqiAI.getBestMove(this.board, this.aiColor, this.aiDifficulty);

            if (move) {
                // Execute AI move
                this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
                this.board[move.from.row][move.from.col] = null;

                // Toggle player
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                this.updateTurnDisplay();
                this.draw();
            }

            this.isAiThinking = false;
        }, 500); // 500ms delay for "thinking" effect
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new XiangqiGame();
});
