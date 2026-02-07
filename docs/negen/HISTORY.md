# NEGEN Version History & Changelog

**Attributor:** Jules
**Last Updated:** 2024-02-04 12:10 UTC (Estimated)

This document tracks the evolution of the NEGEN engine, including major updates, bug fixes, and lessons learned.

## Changelog

### Phase 3: Expansion (Current)
*   **Documentation:** Created comprehensive Technical Reference and User Manual.
*   **Planning:** Defined specs for "The Conjugate Card Suite" (Poker) and Snake Retrofit.

### Phase 2: Pilot & Robustness
*   **Game: Space Invaders:** Implemented grid-based movement, enemy logic, and particle explosions.
*   **Game: Breakout:** Validated Physics engine (AABB collision) and ParticleSystem.
*   **Game: Pong:** Validated multiplayer logic and simple AI.
*   **Input System:** Refined pointer tracking to handle both Mouse and Touch events uniformly.
*   **Graphics:** Added `drawRectEffect` and `drawCircleEffect` for neon glow aesthetics.

### Phase 1: Foundation
*   **Core:** Established `Engine` loop, `Scene` management, and module structure.
*   **Input:** Created `InputManager` for normalizing events.
*   **Audio:** Created `AudioManager` with `AudioContext` wrapper and `Synthesizer`.
*   **Graphics:** Created `CanvasRenderer` with High DPI support.
*   **Assets:** Implemented `AssetLoader` for Promise-based loading.
*   **Port:** Initial port of `Snake` logic to prove concept.

---

## Development Log & Retrospective

### Lessons Learned
*   **Architecture Separation:** separating Input, Audio, and Graphics into distinct systems early on allowed for parallel development and easier debugging.
*   **Browser Audio Policies:** `AudioContext` starts in a `suspended` state. We implemented a "Tap to Start" or "User Interaction" check in our games to resume the context before playing sound.
*   **High DPI Rendering:** Canvas looks blurry on Retina/High DPI screens by default. We solved this in `CanvasRenderer` by scaling the internal canvas size by `window.devicePixelRatio` while keeping the CSS size fixed.
*   **Input Normalization:** Treating Touch events as Mouse events (and vice-versa) in `InputManager` simplified game logic significantly, allowing code to "write once, play anywhere".

### Known Issues / Feedback
*   **Audio Resume:** While handled, the requirement for user interaction can still be tricky for auto-playing attract modes.
*   **Performance:** Complex particle systems in `Breakout` and `Space Invaders` can impact performance on lower-end mobile devices. Optimization of the `ParticleSystem` is a future task.
*   **DOM Renderer:** The `DOMRenderer` (for UI-heavy games like Cards) is specified but not yet fully implemented or documented.

### Future Roadmap
*   **Card Game Suite:** Implementing the "5 Card Draw" Poker game using the engine.
*   **Snake Retrofit:** Fully replacing the legacy Snake code with the NEGEN implementation while preserving the classic feel.
