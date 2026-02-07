# Architecture

## Overview

The Flow Games project uses a shared engine to power multiple game variants. The core philosophy is to decouple the game logic (loop, state, input) from the specific grid topology (Square, Hex, Toroidal).

## Directory Structure

```text
games/flow/
├── CLAUDE.md          # Agent guidelines
├── ARCHITECTURE.md    # This file
├── README.md          # User overview
├── TODO.md            # Roadmap
├── CHANGELOG.md       # Version history
├── index.html         # Main entry point / Game Launcher
├── css/
│   └── style.css      # Shared styles
├── assets/            # Shared images/sounds
├── engine/            # Core Game Engine
│   ├── grid.js        # Grid data structure and logic
│   ├── path.js        # Pathfinding and validation
│   ├── input.js       # Input handling
│   └── game.js        # Main game loop and state management
└── variants/          # Game Specific Implementations
    ├── free/          # Flow Free (Standard)
    ├── bridge/        # Flow Bridge
    ├── hex/           # Flow Hex
    └── warp/          # Flow Warp
```

## Core Components

### 1. Grid System (`engine/grid.js`)

The `Grid` class is the central data structure. It manages a collection of `Cells`.

-   **Abstraction**: The grid should support different coordinate systems.
    -   Standard: `(x, y)`
    -   Hex: `(q, r)` or `(q, r, s)`
-   **Topology**: The grid handles neighbor lookups.
    -   Standard: N, S, E, W
    -   Hex: 6 directions
    -   Warp: Neighbor lookups wrap around grid boundaries.

### 2. Cell Structure

Each cell contains:
-   `type`: `EMPTY`, `SOURCE`, `PIPE`, `BRIDGE`, `WALL`
-   `color`: The color ID associated with the cell (for Sources and Pipes).
-   `connections`: Bitmask or array indicating active connections to neighbors.

### 3. Path Management (`engine/path.js`)

Manages the active paths drawn by the player.
-   Validates moves (can't cross existing paths unless Bridge).
-   Handles backtracking (erasing part of a path).
-   Checks win condition (all colors connected, board filled).

### 4. Input Handling (`engine/input.js`)

-   Unified handler for Mouse and Touch events.
-   Translates screen coordinates to Grid coordinates.
-   Passes "Drag Start", "Drag Move", "Drag End" events to the Game engine.

### 5. Game Loop (`engine/game.js`)

-   Manages Game State (`MENU`, `PLAYING`, `LEVEL_COMPLETE`).
-   Handles rendering via HTML5 Canvas.
-   Orchestrates level loading.

## Tech Stack

-   **Language**: Vanilla JavaScript (ES5/ES6 compatible).
-   **Rendering**: HTML5 Canvas API.
-   **Styling**: CSS Flexbox/Grid.
-   **No Build Tools**: Directly loadable modules or script tags.
