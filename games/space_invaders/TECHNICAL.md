# Space Invaders - Technical Documentation

## Architecture
Built using the **NEGEN Game Engine**.
*   **Scene**: `InvadersScene.js` handles the gameplay loop.
*   **Rendering**: HTML5 Canvas via `CanvasRenderer`.
*   **Audio**: Synthesized sound effects via `AudioManager` (Square/Sawtooth waves).

## Key Classes
*   `InvadersScene`: Main state container. Manages entities (Player, Enemies, Bullets).
*   `ParticleSystem`: Handles explosion effects.

## Data Structures
*   `enemies`: Array of objects `{x, y, w, h, active, row, col}`.
*   `bullets`: Array of objects `{x, y, dy, type}`.

## Logic
*   **Enemy Movement**: Synchronized step movement. Speed increases by reducing the step interval.
*   **Collision**: Simple AABB (Axis-Aligned Bounding Box) physics provided by `Physics` utility.
