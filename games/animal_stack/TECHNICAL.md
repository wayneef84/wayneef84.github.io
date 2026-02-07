# Animal Stack - Technical Documentation

## Architecture
*   **Engine**: NEGEN Core.
*   **Scene**: `AnimalStackScene.js`.

## Physics Implementation
*   **Custom Physics**: Simplified gravity and collision system implemented directly in the scene (no external physics engine like Matter.js).
*   **Collision**: AABB checks for "landing" on the stack.
*   **Stability**: Basic center-of-mass approximation (animals topple if not supported).

## Assets
*   Uses emoji rendering to canvas for lightweight assets.
