/**
 * BOARD GAME ARCADE MAIN ENTRY
 * File: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const engine = new GameEngine('gameCanvas');

    // UI Elements
    const undoBtn = document.getElementById('undoButton');
    const resetBtn = document.getElementById('resetButton');
    const switchBtn = document.getElementById('switchButton'); // Will be added in index.html
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const aiColor = document.getElementById('aiColor');
    const aiDifficulty = document.getElementById('aiDifficulty');
    const aiControls = document.getElementById('aiControls');
    const turnDisplay = document.getElementById('turnDisplay');

    // Score State
    let activeGameId = '';
    let scoreP1 = 0;
    let scoreP2 = 0;
    let lastWinMsg = "";

    // Engine Status Callback
    engine.updateStatus = (msg, color) => {
        if (turnDisplay) {
            turnDisplay.textContent = msg;
            if (color) turnDisplay.style.color = color;
        }

        // Scoring Logic
        const upperMsg = msg.toUpperCase();
        if (upperMsg !== lastWinMsg && (upperMsg.includes('WINS') || upperMsg.includes('VICTORY') || upperMsg.includes('DEFEAT'))) {
            lastWinMsg = upperMsg;

            // Heuristic to attribute win
            let p1Wins = false;
            let p2Wins = false;

            if (upperMsg.includes('VICTORY')) p1Wins = true;
            else if (upperMsg.includes('DEFEAT')) p2Wins = true;
            else {
                // Game specific parsing
                if (activeGameId === 'gomoku' || activeGameId === 'othello') {
                    // For these games, Black is P1, White is P2
                    if (upperMsg.includes('BLACK')) p1Wins = true;
                    if (upperMsg.includes('WHITE')) p2Wins = true;
                } else {
                    // Standard logic (Chess/Checkers/Connect4)
                    // White/Red/X = P1
                    // Black/Yellow/O = P2
                    if (upperMsg.includes('WHITE') || upperMsg.includes('RED') || upperMsg.includes('X WINS')) p1Wins = true;
                    else if (upperMsg.includes('BLACK') || upperMsg.includes('YELLOW') || upperMsg.includes('O WINS')) p2Wins = true;
                }
            }

            if (p1Wins) scoreP1++;
            if (p2Wins) scoreP2++;

            updateScoreBoard();
        }

        // Reset lastWinMsg on new game start
        if (msg.includes('Turn') || msg.includes('Setup')) {
            lastWinMsg = "";
        }
    };

    function updateScoreBoard() {
        const p1 = document.getElementById('scoreP1');
        const p2 = document.getElementById('scoreP2');
        if (p1) p1.textContent = scoreP1;
        if (p2) p2.textContent = scoreP2;
    }

    // Components
    let settings = null;
    if (typeof SettingsMenu !== 'undefined') {
        settings = new SettingsMenu();
    }

    let overlay = null;
    if (typeof GameOverlay !== 'undefined') {
        overlay = new GameOverlay(
            (gameId) => loadGame(gameId),
            () => settings && settings.show()
        );
    }

    // Load Game Logic
    function loadGame(gameId) {
        console.log("Loading game:", gameId);
        activeGameId = gameId;

        let GameClass = null;
        switch(gameId) {
            case 'xiangqi': if (typeof XiangqiGame !== 'undefined') GameClass = XiangqiGame; break;
            case 'chess': if (typeof ChessGame !== 'undefined') GameClass = ChessGame; break;
            case 'checkers': if (typeof CheckersGame !== 'undefined') GameClass = CheckersGame; break;
            case 'tictactoe': if (typeof TicTacToeGame !== 'undefined') GameClass = TicTacToeGame; break;
            case 'connect4': if (typeof Connect4Game !== 'undefined') GameClass = Connect4Game; break;
            case 'mancala': if (typeof MancalaGame !== 'undefined') GameClass = MancalaGame; break;
            case 'dots': if (typeof DotsGame !== 'undefined') GameClass = DotsGame; break;
            case 'battleship': if (typeof BattleshipGame !== 'undefined') GameClass = BattleshipGame; break;
            case 'gomoku': if (typeof GomokuGame !== 'undefined') GameClass = GomokuGame; break;
            case 'othello': if (typeof OthelloGame !== 'undefined') GameClass = OthelloGame; break;
            default: console.error("Unknown game:", gameId);
        }

        if (GameClass) {
            engine.loadGame(GameClass);

            // Reset UI state
            const pvpRadio = document.querySelector('input[name="mode"][value="pvp"]');
            if (pvpRadio) {
                pvpRadio.checked = true;
                // Force event listener to trigger if needed, or just set display
                if (aiControls) aiControls.style.display = 'none';
            }
        }
    }

    // Event Listeners
    if (switchBtn && overlay) {
        switchBtn.addEventListener('click', () => overlay.show());
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (engine.currentGame && engine.currentGame.undo) engine.currentGame.undo();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (engine.currentGame) {
                if (engine.currentGame.reset) engine.currentGame.reset();
                else if (engine.currentGame.resetGame) engine.currentGame.resetGame();
            }
        });
    }

    modeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const mode = e.target.value;
            if (aiControls) aiControls.style.display = mode === 'ai' ? 'flex' : 'none';
            if (engine.currentGame && engine.currentGame.setMode) engine.currentGame.setMode(mode);
        });
    });

    if (aiColor) {
        aiColor.addEventListener('change', (e) => {
            if (engine.currentGame && engine.currentGame.setAIColor) engine.currentGame.setAIColor(e.target.value);
        });
    }

    if (aiDifficulty) {
        aiDifficulty.addEventListener('change', (e) => {
            if (engine.currentGame && engine.currentGame.setAIDifficulty) engine.currentGame.setAIDifficulty(e.target.value);
        });
    }

    // Initial Load
    // If overlay exists, show it. Otherwise fallback to Xiangqi.
    if (overlay) {
        overlay.show();
    } else {
        loadGame('xiangqi');
    }
});
