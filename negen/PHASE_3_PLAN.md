# Phase 3 Plan: The Conjugate Card Suite & Retrofit

**Objective:** Leverage the Phase 2 "Hybrid Engine" to build a scalable Card Game Suite (Track A) while simultaneously proving the engine's versatility by retrofitting an existing arcade game (Track B).

**Primary Deliverable:** A fully playable "5 Card Draw" Poker game and a NEGEN-powered Snake port.

---

## Track A: The Card Suite (Poker & Blackjack 2.0)

### 1. The Core `negen/cards` Module
We will migrate the existing `games/cards/shared` logic into the engine as a first-class citizen.
*   **Location:** `negen/cards/`
*   **Key Classes:**
    *   `CardGame extends Scene`: Base scene handling dealing animation queues and turn management.
    *   `Deck`: Asset-aware deck that manages both logical state (array of IDs) and visual state (DOM elements).
    *   `Hand`: A specialized `Entity` group for player cards.

### 2. Game: 5 Card Draw (Poker)
*   **Why:** Simple rules, clear betting rounds, tests the "Hand Evaluation" logic.
*   **Features:**
    *   **Betting:** Integrated with `negen/data/StorageManager` (FongCoin).
    *   **Physics:** Cards "fly" from Deck to Hand using CSS transitions managed by the Engine loop.
    *   **Evaluation:** Porting `games/cards/shared/poker-evaluator.js` to `negen/cards/evaluator.js`.

### 3. Requirements for Agents
*   **Agent G (Creative):**
    *   Design a "Poker Table" background (SVG/CSS).
    *   Create a "Chip Set" asset pack (SVG).
    *   Ensure the Card CSS classes support a "Selected/Held" state (e.g., glow effect).
*   **Agent C (Logic):**
    *   Implement `negen/cards/CardGame.js`.
    *   Implement the 5 Card Draw ruleset: `Deal -> Bet -> Draw -> Bet -> Showdown`.

---

## Track B: The Retrofit (Snake)

### 1. Goal
Refactor `games/snake` to use `negen/core`, `negen/input`, and `negen/audio`.

### 2. The "Legacy Preservation" Rule
*   **Constraint:** The original `games/snake/index.html` MUST remain playable.
*   **Implementation:**
    *   Create `games/snake/negen.html`.
    *   The Main Menu should offer a toggle: "Play Classic" vs "Play Remastered".

### 3. Requirements for Agents
*   **Agent C (Logic):**
    *   Replace `SoundManager` with `negen/audio/Synthesizer`.
    *   Replace `InputHandler` with `negen/input/InputManager` (Profile: `gesture`).
    *   Replace `requestAnimationFrame` loop with `negen/core/Engine`.

---

## Technical Specifications

### Input Profiles (`negen/input/InputManager.js`)
The engine must support switching control schemes dynamically.
```javascript
// Example Usage
InputManager.useProfile('arcade'); // WASD + Space
InputManager.useProfile('touch');  // Swipes + Tap
```

### Shared Asset Pipeline (`negen/assets/`)
*   **Poker:** Needs "Card Atlas" (Images) + "Shuffle/Chip" (Audio).
*   **Snake:** Needs "Retro Beeps" (Synth) + "Explosion" (Particles).
*   **Spec:** The `AssetLoader` must handle both "File" assets and "Generated" assets (Synth patches).
