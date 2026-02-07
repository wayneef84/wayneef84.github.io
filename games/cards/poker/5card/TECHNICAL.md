# 5 Card Draw - Technical Documentation

## Architecture
*   **Engine**: NEGEN Card Engine (`negen/cards/`).
*   **Logic**: `negen_poker.js`.
*   **Evaluator**: Uses `negen/cards/Evaluator.js` for hand ranking.

## Implementation
*   **Hybrid Renderer**: Uses DOM for layout and Canvas for card rendering (via `CardAssets`).
