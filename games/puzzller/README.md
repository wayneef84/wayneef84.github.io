# Project PuzzLLer

A grid-based logic puzzle game where you control a Blue Dot navigating through rooms to rescue a Pink Dot.

## How to Play

1.  Open `index.html` in a web browser.
2.  Press **ENTER** or **SPACE** to start.
3.  In Level Select:
    *   Use **Left/Right Arrows** to select a level.
    *   Press **C** to toggle player skin (Dot, Square, Emoji).
    *   Press **ENTER** to play the selected level.
4.  In Game:
    *   Use **Arrow Keys** or **WASD** to move.
    *   Avoid walls and obstacles.
    *   Reach the **Pink Dot** (Target) to complete the level.
    *   Press **R** to restart the level.
    *   Press **ESC** to return to Level Select.

## Features

*   **Grid Engine:** Deterministic tile-based movement.
*   **Level System:** Data-driven levels defined in `js/levels.js`.
*   **Level Selector:** Unlock and replay levels (currently all unlocked for testing).
*   **Customization:** Change your player avatar.

## Development

This project was built using a modular ES5/ES6 architecture:
*   `game.js`: Main state machine.
*   `levelLoader.js`: Parses level data.
*   `renderer.js`: Handles canvas drawing.
*   `input.js`: Manages keyboard input.
*   `levels.js`: Stores level configurations.
