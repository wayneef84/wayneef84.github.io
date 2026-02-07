# Tracing Suite - Technical Documentation

## Architecture
*   **Class**: `LetterGame` (in `game.js`).
*   **Rendering**: HTML5 Canvas path rendering.
*   **Data Format**: JSON packs defining strokes (Lines, Arcs, Bezier curves).

## Stroke Detection
*   **Algorithm**: "Check Point" system. The game tracks progress along the defined stroke path. User input must be within a certain radius of the current target point to advance.
*   **Guidance**: Visual cues (Ghost dot, pulsing target) guide the user.

## Audio
*   **Web Speech API**: Uses `SpeechSynthesis` for dynamic feedback ("Letter A", "Great job!").
