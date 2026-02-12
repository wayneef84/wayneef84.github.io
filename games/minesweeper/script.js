
const DIFFICULTIES = {
    'very-easy': { rows: 8, cols: 8, mines: 5, lives: 3 },
    'easy': { rows: 9, cols: 9, mines: 10, lives: 2 },
    'normal': { rows: 16, cols: 16, mines: 40, lives: 1 },
    'hard': { rows: 16, cols: 30, mines: 99, lives: 1 },
    'very-hard': { rows: 20, cols: 30, mines: 150, lives: 1 },
    'custom': { rows: 10, cols: 10, mines: 10, lives: 1 } // Default custom
};

const POWERUPS = {
    HEART: '❤️',
    REVEAL: '👁️'
};

let gameState = {
    board: [],
    rows: 0,
    cols: 0,
    minesCount: 0,
    flagsCount: 0,
    revealedSafeCount: 0,
    totalSafeCells: 0,
    lives: 0,
    maxLives: 0,
    gameOver: false,
    gameWon: false,
    timer: 0,
    timerInterval: null,
    firstClick: true,
    currentDifficulty: 'normal'
};

// Interaction State
let holdDelay = 500;
let holdTimer = null;
let activeCell = null;
let longPressTriggered = false;
let isPointerDown = false;
let lastPointerPos = { x: 0, y: 0 };

// DOM Elements
const boardElement = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const livesElement = document.getElementById('lives');
const minesLeftElement = document.getElementById('mines-left');
const difficultySelect = document.getElementById('difficulty-select');
const themeSelect = document.getElementById('theme-select');
const customSettings = document.getElementById('custom-settings');
const holdDelayInput = document.getElementById('hold-delay');
const resetButton = document.getElementById('reset-btn');
const highScoreElement = document.getElementById('high-score');
const messageElement = document.getElementById('message');
const miniZoomElement = document.getElementById('mini-zoom');

function init() {
    loadSettings();
    setupEventListeners();
    startNewGame();
}

function setupEventListeners() {
    difficultySelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customSettings.style.display = 'flex';
        } else {
            customSettings.style.display = 'none';
            startNewGame();
        }
    });

    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    resetButton.addEventListener('click', startNewGame);

    document.getElementById('apply-custom').addEventListener('click', () => {
        const r = parseInt(document.getElementById('custom-rows').value);
        const c = parseInt(document.getElementById('custom-cols').value);
        const m = parseInt(document.getElementById('custom-mines').value);

        // Ensure at least 9 spots free for first click safety
        if (r < 5 || c < 5 || m < 1 || m >= (r * c) - 9) {
            alert("Invalid Custom Settings. Max mines is (Rows * Cols) - 9.");
            return;
        }

        DIFFICULTIES['custom'].rows = r;
        DIFFICULTIES['custom'].cols = c;
        DIFFICULTIES['custom'].mines = m;
        DIFFICULTIES['custom'].lives = 1;

        startNewGame();
    });

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    holdDelayInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (val < 100) val = 100;
        if (val > 2000) val = 2000;
        holdDelay = val;
        localStorage.setItem('minesweeper_hold_delay', holdDelay);
    });
}

function loadSettings() {
    const savedTheme = localStorage.getItem('minesweeper_theme') || 'classic';
    themeSelect.value = savedTheme;
    setTheme(savedTheme);

    const savedDiff = localStorage.getItem('minesweeper_difficulty') || 'normal';
    if (DIFFICULTIES[savedDiff]) {
        difficultySelect.value = savedDiff;
        if (savedDiff === 'custom') customSettings.style.display = 'flex';
    }

    const savedHoldDelay = localStorage.getItem('minesweeper_hold_delay');
    if (savedHoldDelay) {
        holdDelay = parseInt(savedHoldDelay);
        holdDelayInput.value = holdDelay;
    }
}

function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('minesweeper_theme', theme);
}

function startNewGame() {
    stopTimer();
    gameState.timer = 0;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.firstClick = true;
    gameState.flagsCount = 0;
    gameState.revealedSafeCount = 0;

    gameState.currentDifficulty = difficultySelect.value;
    const config = DIFFICULTIES[gameState.currentDifficulty];

    gameState.rows = config.rows;
    gameState.cols = config.cols;
    gameState.minesCount = config.mines;
    gameState.lives = config.lives;
    gameState.maxLives = config.lives;
    gameState.totalSafeCells = (gameState.rows * gameState.cols) - gameState.minesCount;

    gameState.board = [];

    for (let r = 0; r < gameState.rows; r++) {
        let row = [];
        for (let c = 0; c < gameState.cols; c++) {
            row.push({
                r, c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0,
                powerup: null
            });
        }
        gameState.board.push(row);
    }

    renderBoard();
    updateHUD();
    messageElement.textContent = "";
    localStorage.setItem('minesweeper_difficulty', gameState.currentDifficulty);
    loadHighScore();
}

function startTimer() {
    stopTimer();
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateHUD();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateHUD() {
    if(timerElement) timerElement.textContent = gameState.timer;
    if(livesElement) livesElement.textContent = '❤️'.repeat(gameState.lives);
    if(minesLeftElement) minesLeftElement.textContent = gameState.minesCount - gameState.flagsCount;
}

function renderBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${gameState.cols}, 1fr)`;

    gameState.board.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.r = cell.r;
            cellDiv.dataset.c = cell.c;

            cellDiv.addEventListener('click', () => handleLeftClick(cell.r, cell.c));
            cellDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(cell.r, cell.c);
            });
            cellDiv.addEventListener('pointerdown', (e) => handlePointerDown(e, cell.r, cell.c));

            // No initial visual update needed as all are hidden
            boardElement.appendChild(cellDiv);
        });
    });
}

function updateCellVisuals(div, cell) {
    div.className = 'cell';
    div.textContent = '';

    if (cell.isRevealed) {
        div.classList.add('revealed');
        if (cell.isMine) {
            div.classList.add('mine');
            div.textContent = '💣';
        } else if (cell.neighborMines > 0) {
            div.classList.add(`n${cell.neighborMines}`);
            div.textContent = cell.neighborMines;
        }
        // Powerups are consumed, so not shown after reveal generally
    } else if (cell.isFlagged) {
        div.classList.add('flagged');
        div.textContent = '🚩';
    }
}

function getCellDiv(r, c) {
    return boardElement.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
}

function handleLeftClick(r, c) {
    if (gameState.gameOver || gameState.gameWon) return;

    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }

    const cell = gameState.board[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (gameState.firstClick) {
        gameState.firstClick = false;
        startTimer();
        placeMines(r, c);
        calculateNeighbors();
        placePowerups(r, c);
    }

    revealCell(r, c);
    checkWinCondition();
    updateHUD();
}

function handleRightClick(r, c) {
    if (gameState.gameOver || gameState.gameWon) return;

    const cell = gameState.board[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) gameState.flagsCount++;
    else gameState.flagsCount--;

    const div = getCellDiv(r, c);
    updateCellVisuals(div, cell);
    updateHUD();
}

function placeMines(safeR, safeC) {
    let minesPlaced = 0;
    while (minesPlaced < gameState.minesCount) {
        const r = Math.floor(Math.random() * gameState.rows);
        const c = Math.floor(Math.random() * gameState.cols);

        if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;

        if (!gameState.board[r][c].isMine) {
            gameState.board[r][c].isMine = true;
            minesPlaced++;
        }
    }
}

function placePowerups(safeR, safeC) {
    const totalCells = gameState.rows * gameState.cols;
    const heartCount = Math.ceil(totalCells / 200);
    const revealCount = Math.ceil(totalCells / 100);

    let placed = 0;
    while (placed < heartCount) {
        const r = Math.floor(Math.random() * gameState.rows);
        const c = Math.floor(Math.random() * gameState.cols);
        const cell = gameState.board[r][c];
        if (!cell.isMine && !cell.powerup && !(r === safeR && c === safeC)) {
            cell.powerup = POWERUPS.HEART;
            placed++;
        }
    }

    placed = 0;
    while (placed < revealCount) {
        const r = Math.floor(Math.random() * gameState.rows);
        const c = Math.floor(Math.random() * gameState.cols);
        const cell = gameState.board[r][c];
        if (!cell.isMine && !cell.powerup && !(r === safeR && c === safeC)) {
            cell.powerup = POWERUPS.REVEAL;
            placed++;
        }
    }
}

function calculateNeighbors() {
    const deltas = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
    for (let r = 0; r < gameState.rows; r++) {
        for (let c = 0; c < gameState.cols; c++) {
            if (gameState.board[r][c].isMine) continue;
            let count = 0;
            deltas.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < gameState.rows && nc >= 0 && nc < gameState.cols) {
                    if (gameState.board[nr][nc].isMine) count++;
                }
            });
            gameState.board[r][c].neighborMines = count;
        }
    }
}

function revealCell(r, c) {
    const cell = gameState.board[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    const div = getCellDiv(r, c);

    if (cell.isMine) {
        gameState.lives--;
        boardElement.classList.add('shake');
        setTimeout(() => boardElement.classList.remove('shake'), 500);

        if (gameState.lives <= 0) {
            updateCellVisuals(div, cell);
            triggerGameOver(false);
        } else {
            updateCellVisuals(div, cell);
            updateHUD();
            // Don't count as safe reveal
        }
    } else {
        gameState.revealedSafeCount++;

        if (cell.powerup) {
            activatePowerup(cell.powerup, r, c);
            cell.powerup = null; // Consume
        }

        updateCellVisuals(div, cell);

        if (cell.neighborMines === 0 && !cell.isMine) {
            const deltas = [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]];
            deltas.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < gameState.rows && nc >= 0 && nc < gameState.cols) {
                    revealCell(nr, nc);
                }
            });
        }
    }
}

function activatePowerup(type, r, c) {
    const msg = `Found ${type}!`;
    messageElement.textContent = msg;
    setTimeout(() => { if(messageElement.textContent === msg) messageElement.textContent = ""; }, 2000);

    if (type === POWERUPS.HEART) {
        gameState.lives++;
        updateHUD();
    } else if (type === POWERUPS.REVEAL) {
        const range = 2; // 5x5 area
        for (let dr = -range; dr <= range; dr++) {
            for (let dc = -range; dc <= range; dc++) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < gameState.rows && nc >= 0 && nc < gameState.cols) {
                    const target = gameState.board[nr][nc];
                    if (!target.isRevealed && !target.isFlagged && !target.isMine) {
                        revealCell(nr, nc);
                    } else if (target.isMine && !target.isFlagged) {
                        target.isFlagged = true;
                        gameState.flagsCount++;
                        updateCellVisuals(getCellDiv(nr, nc), target);
                    }
                }
            }
        }
    }
}

function checkWinCondition() {
    if (gameState.gameOver) return;

    if (gameState.revealedSafeCount >= gameState.totalSafeCells) {
        triggerGameOver(true);
    }
}

function triggerGameOver(won) {
    gameState.gameOver = true;
    gameState.gameWon = won;
    stopTimer();

    if (won) {
        messageElement.textContent = "VICTORY!";
        messageElement.style.color = "var(--accent-color)";
        checkHighScore();
        gameState.board.forEach(row => {
            row.forEach(cell => {
                if (cell.isMine && !cell.isFlagged) {
                    cell.isFlagged = true;
                    updateCellVisuals(getCellDiv(cell.r, cell.c), cell);
                }
            });
        });
    } else {
        messageElement.textContent = "GAME OVER";
        messageElement.style.color = "#f00";
        gameState.board.forEach(row => {
            row.forEach(cell => {
                if (cell.isMine && !cell.isRevealed) {
                    cell.isRevealed = true;
                    updateCellVisuals(getCellDiv(cell.r, cell.c), cell);
                }
            });
        });
    }
}

function loadHighScore() {
    const key = `minesweeper_highscore_${gameState.currentDifficulty}`;
    const score = localStorage.getItem(key);
    highScoreElement.textContent = score ? `Best Time: ${score}s` : `Best Time: --`;
}

function checkHighScore() {
    if (gameState.currentDifficulty === 'custom') return;

    const key = `minesweeper_highscore_${gameState.currentDifficulty}`;
    const currentBest = localStorage.getItem(key);

    if (!currentBest || gameState.timer < parseInt(currentBest)) {
        localStorage.setItem(key, gameState.timer);
        highScoreElement.textContent = `Best Time: ${gameState.timer}s (NEW RECORD!)`;
    }
}

function handlePointerDown(e, r, c) {
    if (gameState.gameOver || gameState.gameWon) return;

    // Only primary button (left click) or touch
    if (e.button && e.button !== 0) return;

    isPointerDown = true;
    longPressTriggered = false;
    activeCell = { r, c };
    lastPointerPos = { x: e.clientX, y: e.clientY };

    showZoom(r, c, e.clientX, e.clientY);

    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
        handleHoldTimer();
    }, holdDelay);
}

function handlePointerMove(e) {
    if (!isPointerDown) return;

    lastPointerPos = { x: e.clientX, y: e.clientY };

    // Find element under pointer
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;

    // Check if target is a cell
    if (target.classList.contains('cell') && target.dataset.r !== undefined) {
        const r = parseInt(target.dataset.r);
        const c = parseInt(target.dataset.c);

        // If moved to a different cell
        if (activeCell && (activeCell.r !== r || activeCell.c !== c)) {
            // Cancel old timer
            if (holdTimer) clearTimeout(holdTimer);

            // Update active cell
            activeCell = { r, c };
            longPressTriggered = false; // Reset flag for new cell

            holdTimer = setTimeout(() => {
                handleHoldTimer();
            }, holdDelay);
        }

        showZoom(r, c, e.clientX, e.clientY);
    } else {
        // Pointer moved out of cells
        hideZoom();
        if (holdTimer) clearTimeout(holdTimer);
        activeCell = null;
    }
}

function handlePointerUp(e) {
    if (!isPointerDown) return;
    isPointerDown = false;

    if (holdTimer) clearTimeout(holdTimer);
    hideZoom();
}

function handleHoldTimer() {
    if (!activeCell) return;
    longPressTriggered = true;

    // Trigger Flag
    handleRightClick(activeCell.r, activeCell.c);

    // Refresh zoom to show the new flag state
    showZoom(activeCell.r, activeCell.c, lastPointerPos.x, lastPointerPos.y);

    // Feedback
    if (navigator.vibrate) navigator.vibrate(50);
}

function showZoom(r, c, x, y) {
    miniZoomElement.innerHTML = '';
    miniZoomElement.style.display = 'grid';

    // 3x3 Grid
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell'; // Default class

            if (nr >= 0 && nr < gameState.rows && nc >= 0 && nc < gameState.cols) {
                const boardDiv = getCellDiv(nr, nc);

                // Copy classes
                if (boardDiv) {
                    cellDiv.className = boardDiv.className;
                    cellDiv.textContent = boardDiv.textContent;
                }
            } else {
                cellDiv.style.visibility = 'hidden';
            }
            miniZoomElement.appendChild(cellDiv);
        }
    }

    // Position
    // Offset upwards by 100px and centered horizontally
    let top = y - 140;
    let left = x - 60; // 3 cells * 40px = 120px width. Center is 60px.

    // Boundary checks
    if (top < 0) top = y + 40; // Show below if too high
    if (left < 0) left = 0;
    if (left + 120 > window.innerWidth) left = window.innerWidth - 120;

    miniZoomElement.style.top = `${top}px`;
    miniZoomElement.style.left = `${left}px`;
}

function hideZoom() {
    miniZoomElement.style.display = 'none';
    miniZoomElement.innerHTML = '';
}

window.onload = init;
