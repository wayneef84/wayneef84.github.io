# Project: Snake (Neon Serpent)

**Directory**: `games/snake/`
**Entry Point**: `index.html`

## Overview
Neon Serpent is a modern take on the classic Snake game, featuring neon aesthetics, synthesized sound effects, and responsive mobile controls. It is entirely self-contained within a single HTML file.

## Architecture
The game logic is procedural, residing in a `<script>` block within `index.html`.

### Key Components
1.  **Game Loop**: Uses a recursive `setTimeout` pattern (`gameTick`) to allow for dynamic speed adjustments based on the score/difficulty.
2.  **Rendering**: HTML5 Canvas (`<canvas id="gameCanvas">`) drawn via `requestAnimationFrame` context.
3.  **Input**:
    *   **Desktop**: Arrow keys.
    *   **Mobile**:
        *   **Buttons Mode**: Virtual DOM buttons (`#btnLeft`, `#btnRight`) for relative turning.
        *   **Swipe Mode**: Touch gesture detection for absolute direction changes.
4.  **Audio (SoundManager)**:
    *   Uses the Web Audio API directly.
    *   No external assets; sounds (eat, crash) are synthesized using `OscillatorNode`.
5.  **State**:
    *   `isAttractMode`: Runs a bot simulation when the game is idle.
    *   `currentMode`: Handles theming (Neon, Retro, Chameleon).

## Key Files
*   `index.html`: Contains HTML, CSS, and JS.
