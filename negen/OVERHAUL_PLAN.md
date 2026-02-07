# NEGEN Overhaul Plan: The "Fong-a-long" Convergence

**Version:** 0.1.0
**Architect:** Jules

## 1. Objective
To unify the fragmented game engines (Flow, Cards, Snake) into the central NEGEN framework, reducing code duplication and enabling cross-game features like persistent profiles and shared assets.

## 2. Card Engine Migration (`negen/cards/`)
The current `games/cards/shared/` engine is robust but isolated.
*   **Action:** Migrate `Deck`, `Pile`, `Card`, `Engine` to `negen/cards/`.
*   **Refactor:** Ensure they inherit from or utilize `negen/core/Entity` or `negen/core/System` where appropriate.
*   **Goal:** Allow creating a card game with `import { CardGame } from 'negen/cards';`.

## 3. Storage Standardization (`negen/data/`)
We currently have `utils/Storage.js` (simple wrapper) and a proposed `StorageDriver` (IndexedDB).
*   **Action:** promote the Card Engine's `StorageDriver` to `negen/data/StorageManager.js`.
*   **Features:**
    *   **Tier 1 (Preferences):** Sync `localStorage` for settings (Volume, Theme).
    *   **Tier 2 (Heavy Data):** Async `IndexedDB` for custom decks, saved games, replays.
    *   **Tier 3 (Cloud):** (Future) Sync to backend.

## 4. Input Unification (`negen/input/`)
*   **Snake** uses Touch Swipes / Keydown.
*   **Flow** uses Mouse Drag / Touch Drag.
*   **Cards** uses Click / Tap.
*   **Action:** Enhance `InputManager` to support "Input Profiles":
    *   `InputManager.useProfile('arcade')` (Stick + Buttons)
    *   `InputManager.useProfile('pointer')` (Mouse/Touch interactions)
    *   `InputManager.useProfile('gesture')` (Swipes)

## 5. Roadmap
1.  **Phase A (Immediate):** Implement `StorageManager` in NEGEN (via Card Tracking task).
2.  **Phase B:** Port `games/cards/shared` to `negen/cards`.
3.  **Phase C:** Refactor Blackjack to use `negen/cards`.
4.  **Phase D:** Update Flow to use `negen/input`.
