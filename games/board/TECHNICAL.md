# Board Game Arcade - Technical Documentation

## Architecture
*   **Engine**: Shared `GameEngine` (`engine.js`). Handles the game loop, input normalization, and state management.
*   **Pattern**: Strategy Pattern. `main.js` loads a specific `Game` class (e.g., `ChessGame`, `Connect4Game`) into the engine.

## Key Components
*   `GameEngine`: Manages the canvas and input events.
*   `GameOverlay`: UI for game selection.
*   `SettingsMenu`: UI for AI difficulty and colors.
*   `Overlay`: Generic UI overlay class.

## AI Implementation
*   Most games use Minimax with Alpha-Beta pruning for AI opponents.
*   `xiangqi-ai.js`: Specialized AI for Chinese Chess.
