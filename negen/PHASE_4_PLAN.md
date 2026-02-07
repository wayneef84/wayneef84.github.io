# Phase 4 Plan: The Arcade Expansion

**Objective:** Expand the NEGEN library with board games and complex puzzle ports, utilizing the matured engine features from Phase 3.

---

## 1. The Board Arcade (Chess & Checkers)
*   **Goal:** Upgrade the `games/board` (Xiangqi/Chess/Checkers) implementation to use NEGEN.
*   **Feature:** **"Thinking Time"** - Use Web Workers (via NEGEN Utils) to calculate AI moves without freezing the rendering loop.
*   **Visuals:** Use the "Hybrid Renderer" to draw the board (Canvas) and pieces (DOM) for crisp scaling.

## 2. Flow Port
*   **Goal:** Port `games/flow` to NEGEN.
*   **Challenge:** The "Pipe Connection" logic is complex.
*   **Solution:** Use `negen/graphics/CanvasRenderer` for the grid. The "Fluid" animation can be a particle effect.

## 3. New Game: Space Shooter (Galaxian/Asteroids)
*   **Goal:** A true stress test for the `ParticleSystem` and `CollisionSystem`.
*   **Tech:** Pure Canvas rendering (Layer 0). No DOM elements except HUD.

---

## Roadmap
1.  **Refactor:** Migrate `games/board` to `negen/board`.
2.  **Port:** Migrate `games/flow` to `negen/flow`.
3.  **New:** Prototype "Asteroids" clone.
