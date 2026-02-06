# NEGEN (New Engine) - Architectural Plan

**Version:** 0.1.0
**Architect:** Jules

## 1. Vision
NEGEN is a homegrown, modular game engine designed to power the Founding & Forging. It abstracts common game development tasks (rendering, input, audio, state management) into a unified API, facilitating rapid development of future games (e.g., Poker) and eventual retrofitting of existing titles.

## 2. Core Principles
*   **Modularity**: Components (Input, Audio) can be used independently.
*   **Agnosticism**: The engine supports multiple rendering targets (Canvas, DOM) and input methods (Touch, Mouse, Keyboard).
*   **Lightweight**: No heavy dependencies. Built on modern web standards (ES6, Web Audio API).

## 3. Architecture

### 3.1 Directory Structure
```
negen/
├── core/
│   ├── Engine.js       # Main Loop, Time management
│   ├── Scene.js        # Base class for game states (Menu, Play, Pause)
│   └── SceneManager.js # Stack-based scene navigation
├── input/
│   ├── InputManager.js # Unified event listener
│   └── InputMap.js     # Key/Action bindings
├── audio/
│   ├── AudioManager.js # AudioContext wrapper
│   ├── Synthesizer.js  # Oscillator-based sound (Snake/XTC style)
│   └── AssetPlayer.js  # Buffer-based playback (Slots/Sprunki style)
├── graphics/
│   ├── Renderer.js     # Abstract base class
│   ├── CanvasRenderer.js
│   └── DOMRenderer.js  # For CSS/Div based games
├── assets/
│   └── AssetLoader.js  # Promise-based loading for images/json/audio
└── utils/
    ├── Math.js         # Random, Clamp, Lerp
    └── Storage.js      # LocalStorage wrapper with namespacing
```

### 3.2 Key Systems

#### Core Loop (`Engine.js`)
Uses `requestAnimationFrame` to drive the game.
*   **`update(dt)`**: Logic updates with delta time.
*   **`draw(renderer)`**: Rendering calls.
*   **Features**: Pause/Resume, Focus handling (auto-pause on blur).

#### Input (`InputManager.js`)
Normalizes input across devices.
*   **Virtual Buttons**: Map keys (WASD) and touch zones to logical actions ("UP", "FIRE").
*   **Gestures**: Detect swipes (Snake style) and pinches.

#### Audio (`AudioManager.js`)
A hybrid approach supporting the "Synthesis" needs of *Snake/XTC* and the "Sample" needs of *Sprunki/Slots*.
*   Master Volume control.
*   Mute toggle (persisted).

#### Rendering
*   **CanvasRenderer**: Optimized for pixel manipulation and high-frequency drawing (Flow, Snake).
*   **DOMRenderer**: Efficient for UI-heavy or static games (Cards, Sprunki).

## 4. Integration Strategy

### Phase 1: Foundation (Current)
*   Build the skeleton code.
*   Establish patterns.

### Phase 2: Pilot
*   Build a simple "Hello World" or the "Poker" prototype using NEGEN.

### Phase 3: Retrofit (Future)
*   **Snake**: Replace `SoundManager` and `Input` with NEGEN equivalents.
*   **Flow**: Refactor `games/flow/engine` to extend NEGEN classes.

## 5. Development Guidelines
*   Use ES6 Classes.
*   Document all public methods with JSDoc.
*   Keep files focused (Single Responsibility Principle).
