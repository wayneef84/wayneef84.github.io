# Card Games Mechanics Checkpoint (`games/cards/`)

**Last Updated:** 2026-10-28
**Branch:** `agy/cards-mechanics`
**Workspace:** `/Users/wayneef/Documents/Dev/wayneef84.github.io-agy`

---

## Done
- **Step 0 — Setup:**
  - Created isolated repo clone at `~/Documents/Dev/wayneef84.github.io-agy`.
  - Checked out `dev` (`ea61ff7`), pulled latest, and created branch `agy/cards-mechanics`.
- **Step 1 — Audit:**
  - Audited all 6 card games (`blackjack`, `war`, `big2`, `solitaire`, `poker`, `euchre`) and all `games/cards/shared/` modules.
  - Wrote full prioritized findings and orchestrator requests to `games/cards/AUDIT.md`.
- **Step 2 — Mechanics Fixes, AI Improvements & Tests:**
  - **Shared Engine & Utilities (`shared/engine.js`, `shared/card-utils.js`, `shared/deck-editor.js`):**
    - Supported both `getAiAction` and `getAIAction` in `GameEngine._handleAITurn`.
    - Normalized `getNextActor` object return values (`{ actorId }` -> `actorId`).
    - Fixed `GameEngine._checkForImmediateWin` and `ValidTransitions` so single-player games without a dealer (Solitaire) transition to `RESOLUTION` / `GAME_OVER` on win.
    - Fixed `CardUtils.renderCardText` to map `Rank` enum values (`TWO`..`TEN`) to `2`..`10`.
    - Fixed `Pile.prototype.restore` in `DeckEditor` to accept the array returned by `Pile.prototype.toJSON()`.
  - **Blackjack (`blackjack/ruleset.js`, `blackjack/index.html`):**
    - Fixed Double Down double-deduction bug in `resolveAction`.
    - Restricted `double` in `getAvailableActions` and UI to when the player can afford `currentBet`.
    - Fixed Split Hand Double Down payout calculation (`hand0Bet` and `splitBet` tracked separately and paid at 2x doubled wager on win).
    - Fixed Settings `_resetDeck()` and `_reshuffle()` crashing on `this.engine.shoe` (now uses `this.engine.piles.shoe` and `_initCardCounts()`).
    - Replaced ES6 `.find()`, `.findIndex()`, and `.includes()` in `blackjack/ruleset.js` with strict ES5 loops.
  - **War (`war/ruleset.js`, `war/index.html`):**
    - Fixed `_giveWarPotToPlayer` so in Endless/Classic mode the round winner collects all cards from `_warPot` (shuffled) at the bottom of their hand, and in Quick Match mode tracks per-player won piles.
    - Fixed War tie with 1–3 cards remaining to retain 1 card in hand to flip face-up (`Math.min(3, Math.max(0, hand.count - 1))`).
    - Fixed Match History "Current Match" round log by recording `currentPlayer1Card` and `currentPlayer2Card` in `_flip()`.
  - **Solitaire (`solitaire/rules/klondike.js`, `solitaire/js/game.js`):**
    - Added `skipPlayerTurns: true` to `checkWinCondition` and updated `resolveAction` `nextActor` so completing all 4 foundations triggers `RESOLUTION` and `ROUND_WIN`.
    - Added double-click (`ondblclick`) auto-move to foundation on top face-up cards of waste and tableau piles.
  - **Big 2 (`big2/big2.js`):**
    - Fixed straight evaluation so `2` cannot be part of a non-wrapping straight (`J-Q-K-A-2` rejected in HK/SG rules).
    - Fixed `aceWrapsLow` straights (`A-2-3-4-5`, `2-3-4-5-6`, `A-2-3`, `2-3-4`) so their controlling `primaryCard` is the sequence high card (`5` or `6`) rather than `2` (so `A-2-3-4-5` no longer beats `10-J-Q-K-A`).
    - Updated `Big2AI.findValidPlays` to search 5-card hands when `fiveCardBeatsLower` is enabled in Taiwanese rules.
    - Implemented `powerWinDoubles` penalty multiplier in `Big2Game.prototype._handleWin` for Singapore rules.
    - Updated `Big2Game.prototype.validatePlay` to enforce `allowedHandTypes` and first-turn `3♦` (`mustIncludeCard`).
  - **Poker — 5-Card Draw (`poker/5card/five_card_draw.js`, `poker/5card/index.html`, `poker/5card/ruleset.js`):**
    - Fixed one-sided ante bug so the AI dealer matches the player's ante into `this.pot` (wins now pay 2x ante for +1x net profit; pushes return 1x ante).
    - Improved Dealer AI in `_dealerTurn()` to keep matched pairs/trips/quads and discard unmatched kickers.
    - Wired up `btnAnteMinus` (`-`) and `btnAntePlus` (`+`) buttons in `poker/5card/index.html`.
    - Unified duplicate `resolveAction` in `poker/5card/ruleset.js`.
  - **Euchre (`euchre/ruleset.js`):**
    - Added `_ensureCallingPhase`, string `getNextActor` return, `getAiAction` alias, Left Bower effective trump suit handling (`_getEffectiveSuit`), follow-suit validation (`_getPlayableCardIndices`), and 4-card trick winner resolution (`playCard` / `playCard_<idx>`).
  - **Tests (`test-suite.html`, `test_ruleset.html`):**
    - Added 10 new unit tests in `test-suite.html` (total **36 / 36 passing**) covering Blackjack, War, Solitaire, Big 2, Euchre, and Shared Utilities.
    - Updated legacy `BJ-03` expectation in `test_ruleset.html` (**7 / 7 passing**).

## In Progress
- All recommended Step 2 priorities complete. Ready for Wayne's review.

## Next
- Optional follow-ups if requested by Wayne:
  - Build `games/cards/euchre/index.html` UI if you want Euchre playable and listed in the catalog.
  - Build full UIs for Texas Hold'em (`poker/holdem/`) and 13-Card Poker (`poker/13card/`).

## Exact Steps to Resume
```bash
cd ~/Documents/Dev/wayneef84.github.io-agy
git checkout agy/cards-mechanics
git status
```
