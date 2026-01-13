# CHANGELOG.md

## Maintenance Rules
1. **Additive Only:** All updates must add to the file; never remove history.
2. **Attribution:** Indicate who (C, G, or W) made the update and the Date/Time (UTC).
3. **Versioning:**
    * Start at **1.0.0**.
    * **W (Wayne):** Controls Major/Minor increments (e.g., 1.1.0).
    * **C/G (AI):** Increment patch versions (e.g., 1.0.1) and append ID (e.g., **1.0.1-G**).
4. **Precision:** List filenames changed and the reasoning.
5. **Categorization:** Start items with **[ADDED]**, **[CHANGED]**, **[FIXED]**, or **[REMOVED]**.

---

## Version History

### v1.0.4-G (Gemini) - 2026-01-13 19:10 UTC
**Reasoning:** Critical fix for Blackjack engine crash and adding rules persistence.
* **[FIXED] games/cards/blackjack/ruleset.js:** Added missing `getDealSequence` method. The Engine requires this to know how to distribute cards (User -> Dealer -> User -> Dealer Hole).
* **[ADDED] games/cards/blackjack/index.html:** Added logic to save/load Game Rules (Deck count, Target score) from `localStorage` (`blackjack_config`).
* **[ADDED] games/cards/blackjack/index.html:** Added "Restore Default Rules" button to the Settings menu.
* **Lesson Learned:** When defining a "Ruleset" interface, every required method (like `getDealSequence`) must be implemented, even if it seems standard. The Engine is dumb and needs explicit instructions for every phase.

### v1.0.3-G (Gemini) - 2026-01-13 18:45 UTC
**Reasoning:** Polishing Card Engine visuals and organizing the game library.
* **[ADDED] games/cards/index.html:** Created a dedicated "Card Game Hub" to manage Blackjack, War, and future games. Handles URL routing (e.g. ?game=war) and persists user's last played game.
* **[CHANGED] index.html:** Updated main menu to link to the Card Game Hub instead of directly to Blackjack.
* **[FIXED] games/cards/shared/card-assets.js:** Fixed "Inside Out" bug where the bottom-right suit was drawn incorrectly. Tightened spacing on top-left rank/suit for better readability. Fixed Club symbol rendering to prevent stray lines.
* **[FIXED] games/cards/blackjack/index.html:** Fixed Safari crash by correcting relative script paths (../shared/) and ensuring audio context handles correctly. Added "Card Fly" animation system.
* **Lesson Learned:** Safari's security sandbox is stricter than Chrome's; relative paths (`../`) fail when viewing via `file://`. Always test via localhost. Also, HTML5 Canvas paths must be explicitly "lifted" (`ctx.moveTo`) between shapes, or they connect with invisible lines.

### v1.0.2-C (Claude) - 2026-01-13 16:30 UTC
**Reasoning:** Implementation of the Card Engine logic and specific game rulesets.
* **[ADDED] games/cards/shared/engine.js:** Implemented the core State Machine (IDLE, BETTING, DEALING) to manage game flow safely.
* **[ADDED] games/cards/blackjack/ruleset.js:** Added specific Blackjack logic (Hit, Stand, Bust calculations).
* **[ADDED] games/cards/war/ruleset.js:** Added War logic (High card wins, War state).
* **[ADDED] games/cards/euchre/ruleset.js:** Added preliminary logic for Euchre (Trump suits, tricks).
* **[CHANGED] games/cards/shared/player.js:** Updated Player class to handle "seats" and betting logic.
* **Lesson Learned:** Separating the "Engine" (State Machine) from the "Ruleset" (Logic) allows us to add new games like War in minutes rather than hours. The Engine handles *whose turn it is*, the Ruleset handles *who won*.

### v1.0.1-G (Gemini) - 2026-01-13 14:15 UTC
**Reasoning:** Establishing the visual layer and currency system before logic implementation.
* **[ADDED] games/cards/shared/card-assets.js:** Created a procedural canvas generator for card graphics (removes need for image downloads).
* **[ADDED] games/cards/blackjack/index.html:** Created the primary UI container for the Blackjack game.
* **[ADDED] games/cards/shared/currency.js:** (Integrated into index) Created the "Shared Bank" system using localStorage key **family_arcade_balance** so Slots and Cards share money.
* **Lesson Learned:** Procedural generation (Canvas) is superior to image sprites for card games. It reduces load time to zero and ensures crisp graphics on high-DPI (Retina) mobile screens without needing massive asset files.

### v1.0.0-C (Claude) - 2026-01-13 12:00 UTC
**Reasoning:** Architectural design of the reusable Card Engine.
* **[ADDED] CLAUDE.md:** Documented the System Architecture, defining the separation between "Engine" (Generic) and "Ruleset" (Specific).
* **[ADDED] games/cards/shared/card.js:** Defined the Card class with UUID requirements for animation tracking.
* **[ADDED] games/cards/shared/deck.js:** Defined standard 52-card and Euchre deck templates.
* **[ADDED] games/cards/shared/pile.js:** Created the universal container for Hands, Decks, and Discards.
* **Lesson Learned:** In physical card games, "Identity" is not enough. A 6-deck shoe has six "King of Hearts". We need a unique **UUID** for every single card instance to track which specific card flies from the shoe to the player's hand.