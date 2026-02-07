# Breakout - Technical Documentation

## Architecture
*   **Engine**: NEGEN Core.
*   **Scene**: `BreakoutScene.js`.

## Physics
*   **Collision**: Custom AABB collision with reflection logic.
*   **Ball Physics**: Simple velocity vector (`dx`, `dy`). Paddle imparts "English" (spin/angle) based on hit position.

## Visuals
*   **ParticleSystem**: Generates explosion effects when bricks are destroyed.
*   **Colors**: HSL color generation based on row index.
