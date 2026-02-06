# SKYbreakers - Technical Documentation

## Architecture
*   **Engine**: NEGEN Core.
*   **Scene**: `SkyScene.js`.
*   **Audio**: Uses `Synthesizer.js` for procedural audio generation.

## Implementation Details
*   **Player**: `Entity` subclass with simple gravity physics (`vy += gravity * dt`).
*   **Obstacles**: Pooled array of pipe entities.
*   **Input**: Uses `ControlOverlay` for mobile-friendly virtual controls.

## Key Files
*   `SkyScene.js`: Main logic.
*   `index.html`: Entry point.
