# Project: Sprunki (S4K Mixer)

**Directory**: `games/sprunki/`

## Overview
An interactive music mixing game where users drag characters onto a stage to create loop-based music compositions.

## Architecture
Driven by a JSON configuration and heavy DOM manipulation.

### Components
*   **`index.html`**: Contains the entire client logic (Drag & Drop, Audio, UI).
*   **`config.json`**: Central database defining:
    *   **Packs**: Theme sets (e.g., Phase 1, Phase 2).
    *   **Characters**: Assets (Image, Audio) and types (Beats, Effects, Melodies, Vocals).
*   **Audio Engine**:
    *   Uses Web Audio API (`AudioBufferSourceNode`) for precise looping.
    *   Manages synchronization of multiple loops.

### Key Features
*   **Drag and Drop**: Custom touch/mouse implementation with "Ghost" elements.
*   **Asset Management**: Dynamically loads assets based on the selected "Pack" in `config.json`.
*   **Naming Convention**: Character IDs follow a schema (e.g., `b01` for Beat 1, `hb01` for Horror Beat 1).
