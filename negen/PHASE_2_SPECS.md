# Phase 2 Specifications: The Hybrid Pilot

**Objective:** Build the core `negen` classes required to render a standard deck of cards using CSS (for style) and Particle Effects using Canvas (for flair) in the same scene.

## Priority 1: The Core Loop (`core/Engine.js`)
* **Constraint:** Vanilla ES5. No bundlers.
* **Loop Type:** Fixed-step update, variable-step render.
* **State:** Must support `pause`, `resume`, and `focus` (tab switching).

## Priority 2: The Hybrid Renderer (`graphics/Renderer.js`)
* **Requirement:** The Renderer must initialize both a `<canvas>` and a `div#game-ui`.
* **API:**
    * `renderer.drawSprite(texture, x, y)` -> Draws to Canvas.
    * `renderer.drawDOM(elementId, cssClass, x, y)` -> Updates DOM position.

## Priority 3: The Asset Loader (`assets/AssetLoader.js`)
* **Requirement:** A Promise-based loader.
* **Support:** Must load Images (`.svg`, `.png`) and Audio (`.mp3`, `.wav`) into a centralized cache.
* **Syntax:** `AssetLoader.loadBundle(['cards.svg', 'deal.wav']).then(...)`

## Priority 4: The Card Entity (`entities/Card.js`)
* **Logic:** Standard suit/rank data.
* **Visual:** Must be a DOM element (Layer 1) to utilize 3D CSS transforms for flipping.
