class Sudoku {
    constructor() {
        this.fullBoard = []; // 9x9 array for the full solution (Integers)
        this.playerBoard = []; // 9x9 array of Cell objects
        // Cell structure: { value: number|null, isGiven: boolean, notes: Set<number>, isError: boolean }

        this.selectedCell = null; // {row, col}
        this.difficulty = 'medium';
        this.isGameOver = false;

        // New State Variables
        this.noteMode = false;
        this.history = []; // Array of board states
        this.inputMode = 'cell-first'; // 'cell-first' or 'digit-first'
        this.selectedNumber = null; // For digit-first mode
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

        // Add Note Toggle and Undo buttons dynamically if not in HTML yet
        // Ideally should be in HTML, but for now we can append or assume existing
        // Let's create them if missing in cacheDOM or handle them here
        this.noteBtn = document.getElementById('note-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.eraseBtn = document.getElementById('erase-btn');
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.resetBtn.addEventListener('click', () => this.resetBoard());
        this.checkBtn.addEventListener('click', () => this.checkSolution());

        if (this.noteBtn) this.noteBtn.addEventListener('click', () => this.toggleNoteMode());
        if (this.undoBtn) this.undoBtn.addEventListener('click', () => this.undo());
        if (this.eraseBtn) this.eraseBtn.addEventListener('click', () => this.handleInput('clear'));

        this.difficultySelector.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        // Numpad clicks
        this.numBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = parseInt(e.target.dataset.value);
                if (value) this.handleNumpadInput(value);
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
            } else if (key.toLowerCase() === 'n') {
                this.toggleNoteMode();
            } else if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z') {
                this.undo();
            }
        });

        // Prevent navigation away if game in progress
        window.addEventListener('beforeunload', (e) => {
            // Check if board has been modified from initial state
            // Logic slightly more complex with objects, check history length or dirty flag
            if (!this.isGameOver && this.history.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    newGame() {
        this.difficulty = this.difficultySelector.value;
        this.generateBoard();
        this.maskBoard();
        this.isGameOver = false;
        this.selectedCell = null;
        this.history = []; // Reset history
        this.statusMessage.textContent = '';
        this.render();
    }

    resetBoard() {
        // Restore to initial state (just reload the masked board or replay history[0]?)
        // Easiest is to regenerate from maskBoard using same fullBoard? No, maskBoard is random.
        // We need to store the initial state of playerBoard after masking.
        // Let's implement history properly later. For now, simple reset clears non-given cells.

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = this.playerBoard[r][c];
                if (!cell.isGiven) {
                    cell.value = null;
                    cell.notes = new Set();
                    cell.isError = false;
                }
            }
        }
        this.isGameOver = false;
        this.statusMessage.textContent = '';
        this.render();
    }

    generateBoard() {
        this.fullBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.fillDiagonal();
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
                    for (let num = 1; num <= 9; num++) {
                        if (this.isSafe(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveBoard(board)) return true;
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

        // Create playerBoard as objects
        this.playerBoard = this.fullBoard.map(row =>
            row.map(val => ({
                value: val,
                isGiven: true,
                notes: new Set(),
                isError: false
            }))
        );

        let count = holes;
        while (count > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);

            if (this.playerBoard[row][col].value !== null) {
                this.playerBoard[row][col].value = null;
                this.playerBoard[row][col].isGiven = false;
                count--;
            }
        }
    }

    render() {
        this.boardElement.innerHTML = '';

        // Numpad active state for Digit-First
        this.numBtns.forEach(btn => {
            const val = parseInt(btn.dataset.value);
            if (this.selectedNumber === val) btn.classList.add('selected-number');
            else btn.classList.remove('selected-number');
        });

        // Calculate related cells for Crosshair if a cell is selected
        let relatedCells = new Set();
        if (this.selectedCell) {
            const { row: r, col: c } = this.selectedCell;
            for (let i = 0; i < 9; i++) {
                relatedCells.add(`${r},${i}`); // Row
                relatedCells.add(`${i},${c}`); // Col
            }
            let startRow = r - r % 3;
            let startCol = c - c % 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    relatedCells.add(`${startRow + i},${startCol + j}`); // Box
                }
            }
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellData = this.playerBoard[row][col];
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');

                // Borders
                if ((col + 1) % 3 === 0 && col < 8) cellElement.classList.add('b-right');
                if ((row + 1) % 3 === 0 && row < 8) cellElement.classList.add('b-bottom');

                // Value
                if (cellData.value !== null) {
                    cellElement.textContent = cellData.value;
                    if (cellData.isGiven) cellElement.classList.add('fixed');
                    else cellElement.classList.add('player-input');
                } else {
                    // Render Notes Grid
                    if (cellData.notes.size > 0) {
                        const noteGrid = document.createElement('div');
                        noteGrid.classList.add('notes-grid');
                        for (let n = 1; n <= 9; n++) {
                            const noteEl = document.createElement('div');
                            noteEl.classList.add('note-num');
                            if (cellData.notes.has(n)) noteEl.textContent = n;
                            noteGrid.appendChild(noteEl);
                        }
                        cellElement.appendChild(noteGrid);
                    }
                }

                // Selection & Highlighting
                const isSelected = this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col;

                if (isSelected) {
                    cellElement.classList.add('selected');
                } else if (relatedCells.has(`${row},${col}`)) {
                    cellElement.classList.add('related');
                }

                // Highlight Matching Numbers
                // If a number is selected via Digit-First OR via Cell selection
                let matchValue = this.selectedNumber;
                if (!matchValue && this.selectedCell) {
                    matchValue = this.playerBoard[this.selectedCell.row][this.selectedCell.col].value;
                }

                if (matchValue && cellData.value === matchValue) {
                    cellElement.classList.add('highlight-match');
                }

                if (cellData.isError) {
                    cellElement.classList.add('error');
                }

                // Click Handler
                cellElement.addEventListener('click', () => {
                    this.handleCellClick(row, col);
                });

                this.boardElement.appendChild(cellElement);
            }
        }
    }

    handleNumpadInput(value) {
        if (this.selectedCell) {
            // Cell-First: Apply to selected cell
            this.handleInput(value);
        } else {
            // Digit-First: Select number
            if (this.selectedNumber === value) {
                this.selectedNumber = null; // Toggle off
            } else {
                this.selectedNumber = value;
            }
            this.render();
        }
    }

    handleCellClick(row, col) {
        // If in Digit-First mode (number selected)
        if (this.selectedNumber !== null) {
             this.selectedCell = { row, col };
             this.handleInput(this.selectedNumber);
             this.selectedCell = null; // Deselect to stay in 'Brush' mode
             this.render();
        } else {
            // Cell-First mode
            this.selectedCell = { row, col };
            this.render();
        }
    }

    handleInput(value) {
        if (!this.selectedCell || this.isGameOver) return;

        const { row, col } = this.selectedCell;
        const cell = this.playerBoard[row][col];

        if (cell.isGiven) return;

        this.saveState(); // Save state before modification

        if (value === 'clear') {
            cell.value = null;
            cell.notes.clear();
            cell.isError = false;
        } else {
            // Check Note Mode
            if (this.noteMode) {
                if (cell.notes.has(value)) cell.notes.delete(value);
                else cell.notes.add(value);
            } else {
                cell.value = value;
                cell.notes.clear(); // Clear notes if value placed
                this.updatePeers(row, col, value); // Smart Cleanup
            }
        }

        this.render();
    }

    updatePeers(row, col, value) {
        // Remove 'value' from notes in the same row, col, and box
        for (let i = 0; i < 9; i++) {
            // Row
            if (i !== col) this.playerBoard[row][i].notes.delete(value);
            // Col
            if (i !== row) this.playerBoard[i][col].notes.delete(value);
        }

        // Box
        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (startRow + r !== row || startCol + c !== col) {
                    this.playerBoard[startRow + r][startCol + c].notes.delete(value);
                }
            }
        }
    }

    toggleNoteMode() {
        this.noteMode = !this.noteMode;
        if (this.noteBtn) {
            this.noteBtn.classList.toggle('active', this.noteMode);
            this.noteBtn.textContent = this.noteMode ? '✎ ON' : '✎ OFF';
        }
    }

    saveState() {
        // Deep clone playerBoard
        const state = this.playerBoard.map(row =>
            row.map(cell => ({
                value: cell.value,
                isGiven: cell.isGiven,
                notes: new Set(cell.notes), // Clone Set
                isError: cell.isError
            }))
        );
        this.history.push(state);
        if (this.history.length > 50) this.history.shift(); // Limit history size
    }

    undo() {
        if (this.history.length === 0) return;

        const previousState = this.history.pop();
        this.playerBoard = previousState;
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

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.playerBoard[row][col];
                cell.isError = false; // Reset errors

                if (cell.value !== this.fullBoard[row][col]) {
                    if (cell.value !== null) {
                        cell.isError = true;
                    }
                    isCorrect = false;
                }
            }
        }

        this.render(); // Re-render to show errors

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
