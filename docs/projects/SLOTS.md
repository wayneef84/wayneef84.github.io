# Project: Slots

**Directory**: `games/slots/`

## Overview
A visually rich slot machine simulation featuring 3D reel effects, particle systems, and multiple themes.

## Architecture
The game separates the core slot mechanics from the thematic presentation.

### Engine (`games/slots/js/`)
*   **`slots.js`**: The massive core file handling:
    *   **State Machine**: Idle, Spinning, Win, Bonus.
    *   **Rendering**: 3D cylinder projection for reels (likely Custom Canvas/WebGL hybrid or advanced CSS 3D).
    *   **Particles**: System for coin showers and magic effects.
*   **`themes.js`**: Configuration file defining symbols, paylines, and assets for different themes (Pirates, Dinosaurs, etc.).
*   **`slots_audio.js`**: Manages sound assets.

### Key Features
*   **Magic Spin**: Special mechanic triggered by specific conditions.
*   **Performance**: Adapts `maxParticles` and geometry quality based on mobile vs desktop detection.
*   **Cache Busting**: Requires manual query string updates (e.g., `?v=3.1`) for asset updates.
