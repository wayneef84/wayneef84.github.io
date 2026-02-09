class Sudoku {
    constructor() {
        this.fullBoard = []; // 9x9 array for the full solution
        this.playerBoard = []; // 9x9 array for the playable board (0 for empty)
        this.initialBoard = []; // To track fixed cells
        this.selectedCell = null; // {row, col}
        this.difficulty = 'medium';
        this.isGameOver = false;
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.newGame();
    }

    cacheDOM() {
        this.boardElement = document.getElementById('sudoku-board');
        this.difficultySelector = document.getElementById('difficulty-selector');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.numBtns = document.querySelectorAll('.num-btn');
        this.statusMessage = document.getElementById('status-message');
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.resetBtn.addEventListener('click', () => this.resetBoard());
        this.checkBtn.addEventListener('click', () => this.checkSolution());
        this.difficultySelector.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        // Numpad clicks
        this.numBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.target.dataset.value || e.target.dataset.action;
                this.handleInput(value);
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (this.isGameOver) return;
            const key = e.key;
            if (key >= '1' && key <= '9') {
                this.handleInput(parseInt(key));
            } else if (key === 'Backspace' || key === 'Delete') {
                this.handleInput('clear');
            } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                this.handleNavigation(key);
            }
        });
    }

    newGame() {
        this.difficulty = this.difficultySelector.value;
        this.generateBoard();
        this.maskBoard();
        this.isGameOver = false;
        this.selectedCell = null;
        this.statusMessage.textContent = '';
        this.render();
    }

    resetBoard() {
        // Reset player board to initial masked state
        this.playerBoard = JSON.parse(JSON.stringify(this.initialBoard));
        this.isGameOver = false;
        this.statusMessage.textContent = '';
        this.render();
    }

    generateBoard() {
        this.fullBoard = Array(9).fill().map(() => Array(9).fill(0));

        // Fill diagonal 3x3 matrices (independent)
        this.fillDiagonal();

        // Fill remaining blocks
        this.solveBoard(this.fullBoard);
    }

    fillDiagonal() {
        for (let i = 0; i < 9; i = i + 3) {
            this.fillBox(i, i);
        }
    }

    fillBox(row, col) {
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(nums);
        let k = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.fullBoard[row + i][col + j] = nums[k++];
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    isSafe(board, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        // Check col
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
        // Check box
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    }

    solveBoard(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    // Try numbers 1-9 in random order to vary solutions if initial fill is not enough
                    // But standard 1-9 loop is fine since we randomized diagonals.
                    for (let num = 1; num <= 9; num++) {
                        if (this.isSafe(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveBoard(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    maskBoard() {
        const difficulties = {
            'easy': 30,
            'medium': 40,
            'hard': 50,
            'expert': 60
        };

        const holes = difficulties[this.difficulty] || 40;

        // Deep copy fullBoard to playerBoard
        this.playerBoard = this.fullBoard.map(row => [...row]);

        let count = holes;
        while (count > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);

            if (this.playerBoard[row][col] !== 0) {
                this.playerBoard[row][col] = 0;
                count--;
            }
        }

        // Save initial state to know which cells are fixed
        this.initialBoard = this.playerBoard.map(row => [...row]);
    }

    render() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');

                // Add borders for subgrids
                if ((col + 1) % 3 === 0 && col < 8) cell.classList.add('b-right');
                if ((row + 1) % 3 === 0 && row < 8) cell.classList.add('b-bottom');

                const value = this.playerBoard[row][col];
                if (value !== 0) {
                    cell.textContent = value;
                }

                if (this.initialBoard[row][col] !== 0) {
                    cell.classList.add('fixed');
                }

                if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                    cell.classList.add('selected');
                } else if (this.selectedCell) {
                    const selectedValue = this.playerBoard[this.selectedCell.row][this.selectedCell.col];
                    if (selectedValue !== 0 && value === selectedValue) {
                         // Highlight matching numbers
                        cell.classList.add('highlight-match');
                    }
                }

                cell.addEventListener('click', () => {
                    this.selectedCell = { row, col };
                    this.render(); // Re-render to update selection/highlights
                });

                this.boardElement.appendChild(cell);
            }
        }
    }

    handleInput(value) {
        if (!this.selectedCell || this.isGameOver) return;

        const { row, col } = this.selectedCell;

        // Cannot edit fixed cells
        if (this.initialBoard[row][col] !== 0) return;

        if (value === 'clear') {
            this.playerBoard[row][col] = 0;
        } else {
            this.playerBoard[row][col] = parseInt(value);
        }

        this.render();
    }

    handleNavigation(key) {
        if (!this.selectedCell) {
            this.selectedCell = { row: 0, col: 0 };
            this.render();
            return;
        }

        let { row, col } = this.selectedCell;

        if (key === 'ArrowUp') row = Math.max(0, row - 1);
        if (key === 'ArrowDown') row = Math.min(8, row + 1);
        if (key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (key === 'ArrowRight') col = Math.min(8, col + 1);

        this.selectedCell = { row, col };
        this.render();
    }

    checkSolution() {
        let isCorrect = true;
        const cells = this.boardElement.children;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const index = row * 9 + col;
                const cell = cells[index];

                // Clear previous errors
                cell.classList.remove('error');

                const val = this.playerBoard[row][col];
                // Check against generated full board
                if (val !== this.fullBoard[row][col]) {
                    if (val !== 0) {
                        cell.classList.add('error');
                    }
                    isCorrect = false;
                }
            }
        }

        if (isCorrect) {
            this.statusMessage.textContent = "Congratulations! You solved it!";
            this.statusMessage.style.color = "#27ae60";
            this.isGameOver = true;
        } else {
            this.statusMessage.textContent = "Keep trying! Errors highlighted.";
            this.statusMessage.style.color = "#e74c3c";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Sudoku();
    game.init();
});
