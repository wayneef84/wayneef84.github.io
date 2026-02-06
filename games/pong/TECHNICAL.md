# Pong - Technical Documentation

## Architecture
*   **Engine**: NEGEN Core.
*   **Scene**: `PongScene.js`.

## AI Logic
*   The CPU paddle tracks the ball's Y position with a lerp (Linear Interpolation) factor to simulate reaction time and movement speed limits.

## Physics
*   **Reflection**: Ball angle changes based on where it hits the paddle (center vs edge).
*   **Speed**: Ball speeds up slightly on every paddle hit.
