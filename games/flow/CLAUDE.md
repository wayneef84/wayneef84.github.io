# Flow Games - Development Plan & Architecture

This document outlines the development plan and architecture for the Flow Games project, starting with a shared engine and expanding to multiple game variants.

## 🎯 Project Goals

Create a suite of "Flow" style puzzle games where players connect matching colors with pipes to create a flow. The games to be implemented are:

1.  **Flow Free** (Standard Grid)
2.  **Flow Bridge** (Bridges allowing pipes to cross)
3.  **Flow Hex** (Hexagonal Grid)
4.  **Flow Warp** (Wrap-around Grid)

## 🗺️ Roadmap

The games will be built in the following order:

### Phase 1: Core Engine & Flow Free
- [ ] Design and implement the core Game Engine (`games/flow/engine/`).
    - Grid management (Cell states, colors, paths).
    - Input handling (Touch/Mouse dragging).
    - Path validation logic (No overlaps, continuous paths).
    - Level parsing/loading system.
- [ ] Implement **Flow Free** (Standard 2D Grid) using the engine.
- [ ] Create basic UI for level selection and gameplay.
- [ ] Implement verification tests.

### Phase 2: Flow Bridge
- [ ] Extend engine to support "Bridges".
    - Allow two paths to cross at specific bridge cells.
- [ ] Implement **Flow Bridge** variant.
- [ ] Verify functionality with tests.

### Phase 3: Flow Hex
- [ ] Extend engine to support Hexagonal Grids.
    - Coordinate system adaptation (Axial/Cubic coordinates).
    - Neighbor logic updates (6 neighbors instead of 4).
- [ ] Implement **Flow Hex** variant.
- [ ] Verify functionality with tests.

### Phase 4: Flow Warp
- [ ] Extend engine to support Warp/Wrap-around grids.
    - Neighbor logic updates to wrap edges (toroidal topology).
- [ ] Implement **Flow Warp** variant.
- [ ] Verify functionality with tests.

## 🏗️ Architecture

The project will use a modular architecture to maximize code reuse across variants.

### Directory Structure

```text
games/flow/
├── CLAUDE.md          # This file
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
    ├── free/
    │   └── levels.js
    ├── bridge/
    │   └── levels.js
    ├── hex/
    │   └── levels.js
    └── warp/
        └── levels.js
```

### Core Concepts

1.  **Grid**: The central data structure. It will be abstract enough to handle different topologies (Square, Hex, Wrap-around).
2.  **Cell**: Represents a unit on the grid. Contains info about:
    - Color (if it's an endpoint or part of a path).
    - Type (Empty, Source, Pipe, Bridge).
    - Connections (North, South, East, West, or Hex directions).
3.  **Level**: Defines the grid size, topology, and initial color sources.
4.  **Engine**: Handles the game loop, input processing, and state updates. It should be decoupled from the specific grid topology where possible.

### Tech Stack

- **HTML5 Canvas**: For rendering the grid and pipes. High performance for path drawing.
- **Vanilla JavaScript**: No frameworks, to keep it lightweight and consistent with the repository standards.
- **CSS Flexbox/Grid**: For UI layout (menus, level select).

## 📝 Guidelines

- **Mobile First**: All controls must work seamlessly on touch devices. Large touch targets.
- **Performance**: Optimize rendering. Only redraw what is necessary.
- **Code Style**: Follow the repository's existing coding conventions.
- **Testing**: Every phase must include verification steps (manual or automated) before moving to the next.
