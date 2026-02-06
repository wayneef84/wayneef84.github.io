# NEGEN Technical Reference

**Attributor:** Jules
**Last Updated:** 2024-02-04 12:00 UTC (Estimated)

## Overview

The **NEGEN (New Engine)** is a modular, lightweight JavaScript game engine designed for the Founding & Forging platform. It provides a structured way to handle the game loop, rendering, input, and audio, while remaining agnostic enough to support both retro-style arcade games (Canvas) and modern UI-heavy games (DOM).

## Core Modules

### 1. Engine (`negen/core/Engine.js`)

The heart of the framework. It manages the main game loop using `requestAnimationFrame` with a fixed timestep update for consistent logic processing.

#### Configuration
```javascript
const engine = new Engine({
    canvas: document.getElementById('gameCanvas'),
    width: 800,
    height: 600
});
```

#### Lifecycle Methods
*   **`start()`**: Begins the game loop.
*   **`stop()`**: Cancels the animation frame and halts the loop.
*   **`update(dt)`**: Updates the active scene and input systems. `dt` is fixed (default 60 FPS).
*   **`draw()`**: Clears the renderer and calls the active scene's draw method.

#### System Registration
The Engine acts as a hub for other systems.
```javascript
engine.registerSystem('input', new InputManager());
engine.registerSystem('audio', new AudioManager());
engine.registerSystem('renderer', new CanvasRenderer(canvas, width, height));
```

---

### 2. Scene (`negen/core/Scene.js`)

The base class for all game states (e.g., `MainMenu`, `Gameplay`, `GameOver`).

#### Lifecycle Hooks
*   **`init()`**: Called once when the scene is created.
*   **`enter(engine)`**: Called when the scene becomes active.
*   **`exit()`**: Called when the scene is replaced.
*   **`update(dt)`**: Logic updates (physics, AI).
*   **`draw(renderer)`**: Rendering commands.

---

### 3. InputManager (`negen/input/InputManager.js`)

Normalizes input across Keyboard, Mouse, and Touch devices.

#### Features
*   **Unified Pointer**: Maps Mouse clicks and Touch taps to a single `pointer` object (`x`, `y`, `isDown`, `isPressed`, `isReleased`).
*   **Keyboard Tracking**: `isKeyDown(code)` and `isKeyPressed(code)`.
*   **Auto-Cleanup**: Resets single-frame states (`isPressed`, `isReleased`) automatically at the start of each frame.

---

### 4. AudioManager (`negen/audio/AudioManager.js`)

A wrapper around the Web Audio API.

#### Features
*   **Context Management**: Handles `AudioContext` creation and resumption (required by browsers).
*   **Synthesis**: `playTone(frequency, type, duration)` for retro sound effects without external assets.
*   **Volume Control**: Global `setVolume(0.0-1.0)` and `toggleMute()`.

---

### 5. CanvasRenderer (`negen/graphics/CanvasRenderer.js`)

A wrapper around the HTML5 Canvas 2D Context, handling High DPI scaling automatically.

#### Methods
*   **`clear(color)`**: Fills the screen with a color.
*   **`drawRect(x, y, w, h, color)`**: Draws a filled rectangle.
*   **`drawCircle(x, y, radius, color)`**: Draws a filled circle.
*   **`drawText(text, x, y, size, color, align)`**: Draws text.
*   **`drawImage(img, ...)`**: Passthrough to standard context `drawImage`.
*   **Effects**: `drawRectEffect` and `drawCircleEffect` support shadow/glow rendering.

---

### 6. AssetLoader (`negen/assets/AssetLoader.js`)

A Promise-based utility for loading external resources.

#### Methods
*   **`loadImage(key, src)`**: Loads an image and caches it. Returns a Promise.
*   **`loadJSON(key, src)`**: Fetches and parses a JSON file. Returns a Promise.
*   **`getImage(key)`**: distinct synchronous getter for cached images.
