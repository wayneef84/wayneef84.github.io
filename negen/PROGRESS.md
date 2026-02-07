# NEGEN Progress Tracker

**Last Updated:** 2024-02-04
**Active Agent:** Jules

This document tracks the ongoing development of the NEGEN game engine. It serves as a working log for all agents (Claude, Gemini, Jules) to coordinate efforts.

## 🚀 Status Overview
**Current Phase:** Phase 1: Foundation (Core Skeleton)
**Next Milestone:** Port **Magic XTC Ball** to NEGEN.

---

## ✅ Completed (Done)

### Core
- [x] **Project Structure**: Created `negen/` directory with `core/`, `input/`, `audio/`, `graphics/`, `utils/`.
- [x] **Engine Loop (`Engine.js`)**:
    - Implemented `requestAnimationFrame` loop with delta time (`dt`).
    - Added `start()`, `stop()`, `update()`, and `draw()` lifecycle methods.
    - Basic scene management placeholders (`loadScene`).
- [x] **Module Export**: created `negen/index.js` to bundle the engine.
- [x] **Utilities**: Added `MathUtils`, `Physics` (AABB), and `Timer` in `negen/utils/`.

### Graphics
- [x] **Canvas Renderer (`CanvasRenderer.js`)**:
    - Implemented basic shape drawing (Rect, Circle, Text).
    - Added support for shadows/glow effects.
    - Added DPI-aware resizing.
    - Added `drawImage` support.

### Input
- [x] **Input Manager (`InputManager.js`)**:
    - Unified event listeners for Keyboard (`keydown`, `keyup`).
    - Unified pointer tracking for Mouse (`mousedown`, `mousemove`, `mouseup`) and Touch (`touchstart`, `touchmove`, `touchend`).
    - Input normalization (mapping touch coordinates to canvas space).
    - cleanup logic for single-frame "pressed" states.

### Audio
- [x] **Audio Manager (`AudioManager.js`)**:
    - `AudioContext` initialization and resumption handling.
    - Global volume control and mute toggle.
    - Basic `playTone()` synthesizer (Oscillator-based) for retro sound effects (Snake-style).

### Assets
- [x] **Asset Loader**: Created `negen/assets/AssetLoader.js` for loading Images and JSON.

### Games
- [x] **Snake Port**: `games/snake/negen_version/` is implemented.
- [x] **Breakout**: Created new game `games/breakout/` to test Physics and Engine robustness.
- [x] **Pong**: Created `games/pong/` (1972) with local multiplayer vs AI.
- [x] **Space Invaders**: Created `games/space_invaders/` (1978) with grid movement and shooting.

### Documentation
- [x] **Architecture Plan**: `NEGEN_PLAN.md` created.
- [x] **Project Docs**: Analyzed and documented existing games in `docs/projects/`.
- [x] **Working Doc**: Established `negen/PROGRESS.md` as the source of truth.
- [x] **License**: Created `negen/LICENSE`.

---

## 🚧 In Progress (Doing)

- [ ] **XTC Ball Port**: Begin analysis and refactoring of `games/xtc_ball` to use NEGEN.

---

## 📅 Planned (Backlog)

### Phase 2: Pilot & Retrofit
- [ ] **Snake "Battle Royale" Mode**: Future feature idea - multiplayer/CPU snake combat with exploding mechanics. (Do not implement yet).
- [ ] **Magic XTC Ball**: Refactor to use `negen/audio/AudioManager` (synth) and `negen/graphics`.
- [ ] **Asset Loader**: Expand with progress tracking and Audio decoding.

### Phase 3: Expansion
- [ ] **Poker**: Create a new card game suite using the engine.
- [ ] **Flow**: Investigate grid rendering performance.

---

## 📚 Lessons Learned
*   **Architecture**: Separating Input/Audio/Graphics early allows parallel development.
*   **Browser quirks**: `AudioContext` requires user interaction to start. We implemented a "Tap to Start" overlay in the Snake port to handle this gracefully.
*   **Canvas**: High DPI screens need explicit scaling logic (implemented in `CanvasRenderer`).

## 🐛 Known Issues / Notes
- **Audio Context**: Browsers require user interaction to resume `AudioContext`.
