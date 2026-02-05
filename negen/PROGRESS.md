# NEGEN Progress Tracker

**Last Updated:** 2024-02-04
**Active Agent:** Jules

This document tracks the ongoing development of the NEGEN game engine. It serves as a working log for all agents (Claude, Gemini, Jules) to coordinate efforts.

## 🚀 Status Overview
**Current Phase:** Phase 1: Foundation (Core Skeleton)
**Next Milestone:** Implement `CanvasRenderer` and a basic "Hello World" demo.

---

## ✅ Completed (Done)

### Core
- [x] **Project Structure**: Created `negen/` directory with `core/`, `input/`, `audio/`, `graphics/`, `utils/`.
- [x] **Engine Loop (`Engine.js`)**:
    - Implemented `requestAnimationFrame` loop with delta time (`dt`).
    - Added `start()`, `stop()`, `update()`, and `draw()` lifecycle methods.
    - Basic scene management placeholders (`loadScene`).
- [x] **Module Export**: created `negen/index.js` to bundle the engine.

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

### Documentation
- [x] **Architecture Plan**: `NEGEN_PLAN.md` created.
- [x] **Project Docs**: Analyzed and documented existing games in `docs/projects/`.

---

## 🚧 In Progress (Doing)

- [ ] **Renderer Implementation**: Flesh out `negen/graphics/CanvasRenderer.js` to actually draw shapes/images.
- [ ] **Scene Management**: Implement a proper `Scene` base class and stack system in `negen/core/SceneManager.js`.

---

## 📅 Planned (Backlog)

### Phase 1: Core Features
- [ ] **Asset Loader**: Create `negen/assets/AssetLoader.js` to handle async loading of Images and JSON.
- [ ] **Entities**: Define a lightweight Entity-Component system (or simple Object pool).
- [ ] **Utils**: Add math helpers (Vector2, Random, Clamp) to `negen/utils/Math.js`.

### Phase 2: Pilot Project (Poker)
- [ ] **Prototype**: Create a simple test scene using NEGEN to verify the loop and rendering.
- [ ] **Card Logic**: Port `games/cards/shared/` logic to be NEGEN-compatible (or wrap it).

### Phase 3: Retrofit Candidates
- [ ] **Snake**: Refactor `games/snake` to use `negen/input` and `negen/audio`.
- [ ] **Flow**: Investigate performance of `negen/graphics/CanvasRenderer` for grid drawing.

---

## 📚 Lessons Learned
*   (To be populated as development progresses)
    *   **Architecture**: Separating Input/Audio/Graphics early allows parallel development (e.g., one agent on Audio, one on Graphics).
    *   **Browser quirks**: `AudioContext` requires user interaction to start. We need a "Click to Start" overlay strategy in all games using NEGEN.

## 🐛 Known Issues / Notes
- **Audio Context**: Browsers require user interaction to resume `AudioContext`. The engine currently has a `resume()` method but needs to be hooked into the first input event automatically.
- **Render Loop**: The `Renderer.clear()` method is currently a stub and does nothing.
