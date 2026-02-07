# Project: Magic XTC Ball

**Directory**: `games/xtc_ball/`

## Overview
A mystical fortune-telling application.

## Architecture
Modular logic with a focus on audio synthesis and SVG graphics.

### Components (`games/xtc_ball/js/`)
*   **`game.js`**: Main application logic.
*   **`sound.js`**: `SoundManager` class using Web Audio API for synthesized sound effects (similar to Snake but more complex).
*   **`config.js`**: Configuration settings.

### Key Features
*   **SVG Icons**: UI icons are inline SVGs or managed as string constants.
*   **Haptics**: Uses `navigator.vibrate` for tactile feedback.
*   **Persistence**: Saves preferences (`oracle_muted`, `oracle_vibration`) to `localStorage`.
