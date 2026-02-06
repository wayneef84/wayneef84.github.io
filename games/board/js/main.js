/**
 * BOARD GAME ARCADE MAIN ENTRY
 * File: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Board Arcade...");

    const engine = new GameEngine('gameCanvas');

    // UI Elements
    const undoBtn = document.getElementById('undoButton');
    const resetBtn = document.getElementById('resetButton');
    const switchBtn = document.getElementById('switchButton');
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const aiColor = document.getElementById('aiColor');
    const aiDifficulty = document.getElementById('aiDifficulty');
    const aiControls = document.getElementById('aiControls');
    const turnDisplay = document.getElementById('turnDisplay');

    // Engine Status Callback
    engine.updateStatus = (msg, color) => {
        if (turnDisplay) {
            turnDisplay.textContent = msg;
            if (color) turnDisplay.style.color = color;
        }
    };

    // Components
    let settings = null;
    if (typeof SettingsMenu !== 'undefined') {
        settings = new SettingsMenu();
    } else {
        console.warn("SettingsMenu not loaded");
    }

    let overlay = null;
    if (typeof GameOverlay !== 'undefined') {
        overlay = new GameOverlay(
            (gameId) => loadGame(gameId),
            () => settings && settings.show()
        );
        console.log("GameOverlay initialized");
    } else {
        console.error("GameOverlay not loaded");
    }

    // Load Game Logic
    function loadGame(gameId) {
        console.log("Loading game:", gameId);

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
            default: console.error("Unknown game:", gameId);
        }

        if (GameClass) {
            engine.loadGame(GameClass);

            // Reset UI state
            const pvpRadio = document.querySelector('input[name="mode"][value="pvp"]');
            if (pvpRadio) {
                pvpRadio.checked = true;
                if (aiControls) aiControls.style.display = 'none';
            }
        }
    }

    // Event Listeners
    if (switchBtn) {
        // Robust listener for both click and touchstart
        const openOverlay = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation(); // Stop propagation to body
            }
            if (overlay) {
                console.log("Opening overlay...");
                overlay.show();
            } else {
                console.error("Cannot open overlay: overlay is null");
                // Attempt re-init? No, safer to just log.
            }
        };

        switchBtn.addEventListener('click', openOverlay);
        switchBtn.addEventListener('touchstart', openOverlay, {passive: false});
        console.log("Switch Button listeners attached");
    } else {
        console.error("Switch Button not found in DOM");
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (engine.currentGame && engine.currentGame.undo) engine.currentGame.undo();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (engine.currentGame && engine.currentGame.reset) engine.currentGame.reset();
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
        console.warn("Overlay missing, defaulting to Xiangqi");
        loadGame('xiangqi');
    }
});
