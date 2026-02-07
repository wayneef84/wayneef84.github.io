# Project: Flow Games

**Directory**: `games/flow/`

## Overview
A collection of puzzle games based on connecting colored dots or filling grids. It emphasizes a modular architecture to support different grid topologies (Square, Hex, Warp).

## Architecture
The project is split into a shared core engine and game-specific implementations.

### Core Engine (`games/flow/engine/`)
*   **`grid.js`**: Manages the board state, cell neighbors, and topology logic.
*   **`path.js`**: Handles path validation, flow checking, and connectivity logic.
*   **`level_generator.js`**: Procedurally generates levels using random walks and DFS.
*   **`input.js`**: Abstracts mouse and touch interaction with the grid.
*   **`game.js`**: The main controller binding the grid, input, and rendering.

### Rendering
*   Uses HTML5 Canvas for high-performance rendering of paths and grids.

### Key Files
*   `games/flow/engine/game.js`: Core game loop and initialization.
*   `games/flow/engine/level_generator.js`: Algorithms for creating puzzles.
