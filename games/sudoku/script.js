function Sudoku() {
    this.fullBoard = []; // 9x9 array for the full solution (Integers)
    this.playerBoard = []; // 9x9 array of Cell objects
    // Cell structure: { value: number|null, isGiven: boolean, notes: Array<number>, isError: boolean }

    this.selectedCell = null; // {row, col}
    this.difficulty = 'medium';
    this.isGameOver = false;

    // New State Variables
    this.noteMode = false;
    this.history = []; // Array of board states
    this.inputMode = 'cell-first'; // 'cell-first' or 'digit-first'
    this.selectedNumber = null; // For digit-first mode
}

Sudoku.prototype.init = function() {
    this.cacheDOM();
    this.bindEvents();
    this.restoreGameState() || this.newGame();
};

Sudoku.prototype.cacheDOM = function() {
    this.boardElement = document.getElementById('sudoku-board');
    this.difficultySelector = document.getElementById('difficulty-selector');
    this.newGameBtn = document.getElementById('new-game-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.checkBtn = document.getElementById('check-btn');
    this.numBtns = document.querySelectorAll('.num-btn');
    this.statusMessage = document.getElementById('status-message');

    // Add Note Toggle and Undo buttons dynamically if not in HTML yet
    this.noteBtn = document.getElementById('note-btn');
    this.undoBtn = document.getElementById('undo-btn');
    this.eraseBtn = document.getElementById('erase-btn');
};

Sudoku.prototype.bindEvents = function() {
    var self = this;

    this.newGameBtn.addEventListener('click', function() { self.newGame(); });
    this.resetBtn.addEventListener('click', function() { self.resetBoard(); });
    this.checkBtn.addEventListener('click', function() { self.checkSolution(); });

    if (this.noteBtn) this.noteBtn.addEventListener('click', function() { self.toggleNoteMode(); });
    if (this.undoBtn) this.undoBtn.addEventListener('click', function() { self.undo(); });
    if (this.eraseBtn) this.eraseBtn.addEventListener('click', function() { self.handleInput('clear'); });

    this.difficultySelector.addEventListener('change', function(e) {
        self.difficulty = e.target.value;
    });

    // Numpad clicks
    this.numBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var value = parseInt(e.target.dataset.value);
            if (value) self.handleNumpadInput(value);
        });
    });

    // Keyboard support
    document.addEventListener('keydown', function(e) {
        if (self.isGameOver) return;
        var key = e.key;
        if (key >= '1' && key <= '9') {
            self.handleInput(parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            self.handleInput('clear');
        } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(key) >= 0) {
            self.handleNavigation(key);
        } else if (key.toLowerCase() === 'n') {
            self.toggleNoteMode();
        } else if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z') {
            self.undo();
        }
    });

    // Prevent navigation away if game in progress
    window.addEventListener('beforeunload', function(e) {
        if (!self.isGameOver && self.history.length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
};

Sudoku.prototype.newGame = function() {
    this.difficulty = this.difficultySelector.value;
    this.generateBoard();
    this.maskBoard();
    this.isGameOver = false;
    this.selectedCell = null;
    this.history = []; // Reset history
    this.statusMessage.textContent = '';
    this.render();
};

Sudoku.prototype.resetBoard = function() {
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            var cell = this.playerBoard[r][c];
            if (!cell.isGiven) {
                cell.value = null;
                cell.notes = [];
                cell.isError = false;
            }
        }
    }
    this.isGameOver = false;
    this.statusMessage.textContent = '';
    this.render();
};

Sudoku.prototype.generateBoard = function() {
    this.fullBoard = [];
    for (var i = 0; i < 9; i++) {
        this.fullBoard[i] = [];
        for (var j = 0; j < 9; j++) {
            this.fullBoard[i][j] = 0;
        }
    }
    this.fillDiagonal();
    this.solveBoard(this.fullBoard);
};

Sudoku.prototype.fillDiagonal = function() {
    for (var i = 0; i < 9; i = i + 3) {
        this.fillBox(i, i);
    }
};

Sudoku.prototype.fillBox = function(row, col) {
    var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.shuffleArray(nums);
    var k = 0;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            this.fullBoard[row + i][col + j] = nums[k++];
        }
    }
};

Sudoku.prototype.shuffleArray = function(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};

Sudoku.prototype.isSafe = function(board, row, col, num) {
    // Check row
    for (var x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    // Check col
    for (var x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }
    // Check box
    var startRow = row - row % 3;
    var startCol = col - col % 3;
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
};

Sudoku.prototype.solveBoard = function(board) {
    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (var num = 1; num <= 9; num++) {
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
};

Sudoku.prototype.maskBoard = function() {
    var difficulties = {
        'easy': 30,
        'medium': 40,
        'hard': 50,
        'expert': 60
    };

    var holes = difficulties[this.difficulty] || 40;

    // Create playerBoard as objects
    this.playerBoard = [];
    for (var row = 0; row < 9; row++) {
        this.playerBoard[row] = [];
        for (var col = 0; col < 9; col++) {
            var val = this.fullBoard[row][col];
            this.playerBoard[row][col] = {
                value: val,
                isGiven: true,
                notes: [],
                isError: false
            };
        }
    }

    var count = holes;
    while (count > 0) {
        var row = Math.floor(Math.random() * 9);
        var col = Math.floor(Math.random() * 9);

        if (this.playerBoard[row][col].value !== null) {
            this.playerBoard[row][col].value = null;
            this.playerBoard[row][col].isGiven = false;
            count--;
        }
    }
};

Sudoku.prototype.render = function() {
    var self = this;
    this.boardElement.innerHTML = '';

    // Numpad active state for Digit-First
    this.numBtns.forEach(function(btn) {
        var val = parseInt(btn.dataset.value);
        if (self.selectedNumber === val) btn.classList.add('selected-number');
        else btn.classList.remove('selected-number');
    });

    // Calculate related cells for Crosshair if a cell is selected
    var relatedCells = {};
    if (this.selectedCell) {
        var r = this.selectedCell.row;
        var c = this.selectedCell.col;
        for (var i = 0; i < 9; i++) {
            relatedCells[r + ',' + i] = true; // Row
            relatedCells[i + ',' + c] = true; // Col
        }
        var startRow = r - r % 3;
        var startCol = c - c % 3;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                relatedCells[(startRow + i) + ',' + (startCol + j)] = true; // Box
            }
        }
    }

    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            var cellData = this.playerBoard[row][col];
            var cellElement = document.createElement('div');
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
                if (cellData.notes.length > 0) {
                    var noteGrid = document.createElement('div');
                    noteGrid.classList.add('notes-grid');
                    for (var n = 1; n <= 9; n++) {
                        var noteEl = document.createElement('div');
                        noteEl.classList.add('note-num');
                        if (cellData.notes.indexOf(n) >= 0) noteEl.textContent = n;
                        noteGrid.appendChild(noteEl);
                    }
                    cellElement.appendChild(noteGrid);
                }
            }

            // Selection & Highlighting
            var isSelected = self.selectedCell && self.selectedCell.row === row && self.selectedCell.col === col;

            if (isSelected) {
                cellElement.classList.add('selected');
            } else if (relatedCells[row + ',' + col]) {
                cellElement.classList.add('related');
            }

            // Highlight Matching Numbers
            var matchValue = self.selectedNumber;
            if (!matchValue && self.selectedCell) {
                matchValue = self.playerBoard[self.selectedCell.row][self.selectedCell.col].value;
            }

            if (matchValue && cellData.value === matchValue) {
                cellElement.classList.add('highlight-match');
            }

            if (cellData.isError) {
                cellElement.classList.add('error');
            }

            // Click Handler
            (function(r, c) {
                cellElement.addEventListener('click', function() {
                    self.handleCellClick(r, c);
                });
            })(row, col);

            this.boardElement.appendChild(cellElement);
        }
    }
};

Sudoku.prototype.handleNumpadInput = function(value) {
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
};

Sudoku.prototype.handleCellClick = function(row, col) {
    // If in Digit-First mode (number selected)
    if (this.selectedNumber !== null) {
        this.selectedCell = { row: row, col: col };
        this.handleInput(this.selectedNumber);
        this.selectedCell = null; // Deselect to stay in 'Brush' mode
        this.render();
    } else {
        // Cell-First mode
        this.selectedCell = { row: row, col: col };
        this.render();
    }
};

Sudoku.prototype.handleInput = function(value) {
    if (!this.selectedCell || this.isGameOver) return;

    var row = this.selectedCell.row;
    var col = this.selectedCell.col;
    var cell = this.playerBoard[row][col];

    if (cell.isGiven) return;

    this.saveState(); // Save state before modification

    if (value === 'clear') {
        cell.value = null;
        cell.notes = [];
        cell.isError = false;
    } else {
        // Check Note Mode
        if (this.noteMode) {
            var noteIndex = cell.notes.indexOf(value);
            if (noteIndex >= 0) {
                cell.notes.splice(noteIndex, 1);
            } else {
                cell.notes.push(value);
            }
        } else {
            cell.value = value;
            cell.notes = []; // Clear notes if value placed
            this.updatePeers(row, col, value); // Smart Cleanup
        }
    }

    this.render();
    this.saveGameState(); // Auto-save after each move
};

Sudoku.prototype.updatePeers = function(row, col, value) {
    // Remove 'value' from notes in the same row, col, and box
    for (var i = 0; i < 9; i++) {
        // Row
        if (i !== col) {
            var rowIndex = this.playerBoard[row][i].notes.indexOf(value);
            if (rowIndex >= 0) this.playerBoard[row][i].notes.splice(rowIndex, 1);
        }
        // Col
        if (i !== row) {
            var colIndex = this.playerBoard[i][col].notes.indexOf(value);
            if (colIndex >= 0) this.playerBoard[i][col].notes.splice(colIndex, 1);
        }
    }

    // Box
    var startRow = row - row % 3;
    var startCol = col - col % 3;
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            if (startRow + r !== row || startCol + c !== col) {
                var boxIndex = this.playerBoard[startRow + r][startCol + c].notes.indexOf(value);
                if (boxIndex >= 0) this.playerBoard[startRow + r][startCol + c].notes.splice(boxIndex, 1);
            }
        }
    }
};

Sudoku.prototype.toggleNoteMode = function() {
    this.noteMode = !this.noteMode;
    if (this.noteBtn) {
        if (this.noteMode) {
            this.noteBtn.classList.add('active');
            this.noteBtn.textContent = '✎ ON';
        } else {
            this.noteBtn.classList.remove('active');
            this.noteBtn.textContent = '✎ OFF';
        }
    }
};

Sudoku.prototype.saveState = function() {
    // Deep clone playerBoard
    var state = [];
    for (var row = 0; row < 9; row++) {
        state[row] = [];
        for (var col = 0; col < 9; col++) {
            var cell = this.playerBoard[row][col];
            state[row][col] = {
                value: cell.value,
                isGiven: cell.isGiven,
                notes: cell.notes.slice(), // Clone array
                isError: cell.isError
            };
        }
    }
    this.history.push(state);
    if (this.history.length > 50) this.history.shift(); // Limit history size
};

Sudoku.prototype.undo = function() {
    if (this.history.length === 0) return;

    var previousState = this.history.pop();
    this.playerBoard = previousState;
    this.render();
};

Sudoku.prototype.handleNavigation = function(key) {
    if (!this.selectedCell) {
        this.selectedCell = { row: 0, col: 0 };
        this.render();
        return;
    }

    var row = this.selectedCell.row;
    var col = this.selectedCell.col;

    if (key === 'ArrowUp') row = Math.max(0, row - 1);
    if (key === 'ArrowDown') row = Math.min(8, row + 1);
    if (key === 'ArrowLeft') col = Math.max(0, col - 1);
    if (key === 'ArrowRight') col = Math.min(8, col + 1);

    this.selectedCell = { row: row, col: col };
    this.render();
};

Sudoku.prototype.checkSolution = function() {
    var isCorrect = true;

    for (var row = 0; row < 9; row++) {
        for (var col = 0; col < 9; col++) {
            var cell = this.playerBoard[row][col];
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
        this.clearAutoSave(); // Clear save when game is won
    } else {
        this.statusMessage.textContent = "Keep trying! Errors highlighted.";
        this.statusMessage.style.color = "#e74c3c";
    }
};

Sudoku.prototype.saveGameState = function() {
    try {
        var state = {
            fullBoard: this.fullBoard,
            playerBoard: this.playerBoard,
            selectedCell: this.selectedCell,
            difficulty: this.difficulty,
            history: this.history,
            noteMode: this.noteMode,
            isGameOver: this.isGameOver,
            timestamp: Date.now()
        };
        localStorage.setItem('sudoku_autosave', JSON.stringify(state));
    } catch (e) {
        // Silent fail if localStorage quota exceeded
        console.warn('Sudoku auto-save failed:', e);
    }
};

Sudoku.prototype.restoreGameState = function() {
    try {
        var saved = localStorage.getItem('sudoku_autosave');
        if (!saved) return false;

        var state = JSON.parse(saved);

        // Validate state integrity (check required fields)
        if (!state.fullBoard || !state.playerBoard || state.fullBoard.length !== 9) {
            this.clearAutoSave();
            return false;
        }

        // Restore state
        this.fullBoard = state.fullBoard;
        this.playerBoard = state.playerBoard;
        this.selectedCell = state.selectedCell;
        this.difficulty = state.difficulty;
        this.history = state.history || [];
        this.noteMode = state.noteMode || false;
        this.isGameOver = state.isGameOver || false;

        // Update difficulty selector to match restored state
        this.difficultySelector.value = this.difficulty;

        this.render();
        return true;
    } catch (e) {
        // Corrupted data - clear and start fresh
        console.warn('Sudoku auto-save corrupted:', e);
        this.clearAutoSave();
        return false;
    }
};

Sudoku.prototype.clearAutoSave = function() {
    try {
        localStorage.removeItem('sudoku_autosave');
    } catch (e) {
        // Silent fail
    }
};

document.addEventListener('DOMContentLoaded', function() {
    var game = new Sudoku();
    game.init();

    // Auto-save on every significant change
    var saveInterval = setInterval(function() {
        if (!game.isGameOver) {
            game.saveGameState();
        }
    }, 2000); // Save every 2 seconds if game is in progress
});
