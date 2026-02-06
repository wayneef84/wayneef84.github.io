/**
 * BOARD GAME ARCADE MAIN ENTRY
 * File: js/main.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const engine = new GameEngine('gameCanvas');

    // UI Elements
    const gameSelector = document.getElementById('gameSelector');
    const undoBtn = document.getElementById('undoButton');
    const resetBtn = document.getElementById('resetButton');
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

    // Load Game Logic
    function loadGame(gameId) {
        console.log("Loading game:", gameId);

        let GameClass = null;
        switch(gameId) {
            case 'xiangqi':
                if (typeof XiangqiGame !== 'undefined') GameClass = XiangqiGame;
                break;
            case 'chess':
                if (typeof ChessGame !== 'undefined') GameClass = ChessGame;
                break;
            case 'checkers':
                if (typeof CheckersGame !== 'undefined') GameClass = CheckersGame;
                break;
            default:
                console.error("Unknown game:", gameId);
        }

        if (GameClass) {
            engine.loadGame(GameClass);

            // Reset UI state for new game
            // Default to PvP usually
            const pvpRadio = document.querySelector('input[name="mode"][value="pvp"]');
            if (pvpRadio) pvpRadio.checked = true;
            if (aiControls) aiControls.style.display = 'none';
        }
    }

    // Event Listeners
    if (gameSelector) {
        gameSelector.addEventListener('change', (e) => loadGame(e.target.value));
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
    // Wait for scripts to load? They should be blocking in head/body.
    // Check if selector has a value
    if (gameSelector) {
        loadGame(gameSelector.value || 'xiangqi');
    } else {
        loadGame('xiangqi');
    }
});
