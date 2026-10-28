# Card Games Mechanics & Architecture Audit (`games/cards/`)

**Date:** 2026-10-27
**Branch:** `agy/cards-mechanics` (branched off `dev` @ `ea61ff7`)
**Scope:** `games/cards/` (`blackjack`, `war`, `big2`, `solitaire`, `poker`, `euchre`, and `shared/`)

---

## 1. Existing Test Suite Results

| Test File | Total Tests | Passed | Failed | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `games/cards/test-suite.html` | 26 | **26** | **0** | Covers Blackjack ruleset (`BJ-01` through `BJ-26`): hand evaluation, soft/hard aces, dealer S17, insurance payout, split action generation, and balance management. No automated tests exist yet for War, Big 2, Solitaire, Poker, or Euchre. |
| `games/cards/test_ruleset.html` | 6 | **5** | **1** | Legacy Blackjack ruleset runner. **`BJ-03: Dealer Blackjack` fails** because the test asserts `checkWinCondition()` returns `{ immediate: true, skipPlayerTurns: true }` on dealer Ace-up blackjack, whereas `changelog.md` (v1.0.5-C) intentionally removed immediate dealer blackjack resolution from `checkWinCondition()` so the UI can offer Insurance first. |
| `games/cards/test.html` | 4 sections | **4** | **0** | Interactive component test page for `Card`, `Pile`, `Deck`, `Player`, SVG rendering (`CardAssets`), and deck editor filtering. |

---

## 2. Prioritized Findings (Ranked by Importance)

### Priority 1 — Critical Game-Breaking Bugs & Payout/Rule Errors

1. **[War] Winner Never Receives Won Cards (`war/ruleset.js:234-264`)**
   - **Standard Rule:** The winner of each battle or war collects all cards in the pot and places them at the bottom of their deck (or won-cards pile). The game continues until one player collects all 52 cards (or a set point target).
   - **Actual Behavior:** `WarRuleset._giveWarPotToPlayer(player, gameState)` **completely ignores the `player` parameter** (`// Unused parameter, kept for interface compatibility`) and moves `this._warPot` into a single shared `this._graveyard`.
   - **Impact:**
     - In standard mode (`neverending = false`), neither player ever gets won cards back; both hands deplete simultaneously in 26 flips (fewer if a War occurs), and the UI decides the winner solely by counting rounds won (`player1Points` vs. `player2Points`).
     - In endless mode (`neverending = true`), whichever player hits `0` cards first gets the **entire shared `_graveyard`** dumped into their hand (`war/ruleset.js:247-261`) — rewarding the player who ran out of cards first with all previously played cards.

2. **[Blackjack] Double Down Double-Deducts Player Balance (`blackjack/ruleset.js:154-166` & `shared/engine.js:395`)**
   - **Actual Behavior:** When resolving `'double'`, `BlackjackRuleset.resolveAction` pushes `{ type: ActionType.DEDUCT, playerId: actorId, amount: bet }` (line 159) **and** immediately calls `actor.placeBet(bet)` (line 165), which calls `this.deduct(bet)` internally. When `GameEngine._executeAction` processes the `DEDUCT` action (`shared/engine.js:395`), it calls `player.deduct(action.amount)` a **second time**.
   - **Impact:** Doubling down on a $25 wager deducts an extra $50 ($75 total deducted instead of $50), and fails mid-action if the player only had 1x their bet remaining in balance.

3. **[Blackjack] Double Down Offered When Player Cannot Afford It (`blackjack/ruleset.js:114-117`)**
   - **Actual Behavior:** `getAvailableActions` offers `'double'` whenever `actor.hand.count === 2` without checking `actor.canAfford(actor.currentBet)`.
   - **Impact:** A player who goes all-in (e.g., $500 bet with $0 remaining balance) is still shown an active **DOUBLE** button.

4. **[Blackjack] Split Hand Double Down Payout Uses Undoubled Wager (`blackjack/index.html:1939-1953, 1975-1989, 2069-2074`)**
   - **Actual Behavior:** In `_handleSplitAction`, doubling down on split Hand 0 or Hand 1 deducts `player.balance -= this.wager`, but never tracks that the specific split hand's bet was doubled. At `_resolveSplit()`, `_evaluateSplitOutcome(h0v, dv, this.wager)` evaluates both hands using the original undoubled `this.wager`.
   - **Impact:** Winning a doubled split hand only returns `2 * this.wager` instead of `4 * this.wager` (the player loses their extra double-down wager on a win, or loses half of it on a push).

5. **[Blackjack] Settings "Reset Deck" and "Re-shuffle" Crash (`blackjack/index.html:2499, 2519`)**
   - **Actual Behavior:** `_resetDeck()` and `_reshuffle()` call `this.engine.shoe.reset()` and `this.engine.shoe.shuffle()`, but the shoe is stored at `this.engine.piles.shoe` (not `this.engine.shoe`). Additionally, `_resetDeck()` resets `this.cardCounts` with `Rank` enum keys (`'ACE'`) instead of `RankToAsset` keys (`'A'`) and calls a nonexistent `this._updateCardCountDisplay()`.
   - **Impact:** Clicking **🔄 Reset Deck** or **🔀 Re-shuffle** in the Blackjack settings panel throws an uncaught `TypeError: Cannot read properties of undefined (reading 'reset' / 'shuffle')`.

6. **[Solitaire] Winning the Game Never Fires `ROUND_WIN` / Victory State (`solitaire/rules/klondike.js:158, 289-302` & `shared/engine.js:372-377`)**
   - **Actual Behavior:** When all 4 foundations reach 13 cards, `KlondikeRuleset.checkWinCondition` returns `{ immediate: true, reason: 'All Foundations Full', winner: 'player1' }`. However:
     - `GameEngine._checkForImmediateWin` (`shared/engine.js:373`) only transitions to `RESOLUTION` if `winResult.skipDealerTurn || winResult.skipPlayerTurns` is truthy.
     - `KlondikeRuleset.resolveAction` always sets `nextActor: 'player1'`, bypassing `getNextActor()` (which would return `null` on win).
   - **Impact:** Completing all 4 foundations in Solitaire never transitions the engine to `RESOLUTION` / `GAME_OVER` and never emits the `ROUND_WIN` event that `solitaire/js/game.js:95` listens for.

7. **[Poker — 5 Card Draw] One-Sided Ante / Zero-Profit Win Bug (`poker/5card/five_card_draw.js:27-31, 118-122`)**
   - **Actual Behavior:** In `startRound()`, `p1.balance -= this.ante; this.pot += this.ante;` ($10 pot). The AI dealer contributes $0 to the pot. At `_showdown()`, winning awards `p1.balance += this.pot` (+$10, for **$0 net profit**), and a tie (`push`) awards `p1.balance += this.pot / 2` (causing the player to **lose half their ante on a tie**).
   - **Impact:** A player can never increase their balance above the starting $1,000 in 5-Card Draw; wins break even, ties lose $5, and losses lose $10.

8. **[Shared Utilities] `DeckEditor` Saved Deck Restore Crashes (`shared/deck-editor.js:270-278` vs. `shared/pile.js:235`)**
   - **Actual Behavior:** `Pile.prototype.toJSON()` returns an `Array` of serialized cards, but `DeckEditor`'s `Pile.prototype.restore(json)` expects an object with `json.template` and `json.contents.length`.
   - **Impact:** Loading a saved custom deck from `localStorage` throws `TypeError: Cannot read properties of undefined (reading 'length')`.

---

### Priority 2 — Wrong Rules, AI Blind Spots & Edge Cases

9. **[Shared Engine] AI Method Name & `getNextActor` Contract Mismatch (`shared/engine.js:247, 316`)**
   - `GameEngine.prototype._handleAITurn` invokes `this.ruleset.getAiAction(this.getGameState(), actor)` (camelCase `Ai`).
   - `BlackjackRuleset` and `FiveCardDrawRuleset` implement `getAiAction`, whereas `WarRuleset` (`war/ruleset.js:275`) and `EuchreRuleset` (`euchre/ruleset.js:315`) implement `getAIAction` (uppercase `AI`).
   - `EuchreRuleset.getNextActor` (`euchre/ruleset.js:122-143`) returns `{ actorId, type }` instead of a string `actorId`, breaking `this._getActor(this.activeActorId)` in `shared/engine.js`.

10. **[Big 2] Straight Ranking & `2`-in-Straight Rule Bugs (`big2/big2.js:68-102, 208-212, 256-263`)**
    - Because `Big2RankValues` maps `3 -> 1 ... A -> 12, 2 -> 13`, the default consecutive check treats `J-Q-K-A-2` (`[9,10,11,12,13]`) as a valid normal straight even in Hong Kong / Singapore rules where `2` cannot be used in a non-wrapping straight (`10-J-Q-K-A` should be the highest normal straight).
    - When `aceWrapsLow` is enabled (`A-2-3-4-5`), `evaluate()` sets `primaryCard = sorted[0]`, which is the `2` (value 13). Consequently, `A-2-3-4-5` is scored as a `2`-high straight that beats `10-J-Q-K-A`, instead of ranking as a `5`-high (or second-highest) straight per ruleset.
    - In `getStraightValues`, 3-card wrap straights (`A-2-3`, `Q-K-A`) check `vals[3]` and `vals[4]`, which are `undefined` when `vals.length === 3`.

11. **[Big 2] Taiwanese `fiveCardBeatsLower` Ignored by AI (`big2/big2.js:410-411`)**
    - Taiwanese ruleset sets `fiveCardBeatsLower: true` (allowing 5-card bombs/hands to beat 3-card hands), and `canBeat()` supports it, but `Big2AI.findValidPlays` restricts candidate generation to `[currentPileHand.cards.length]`, so the AI never plays a 5-card hand over a 3-card pile.

12. **[Big 2] Singapore `powerWinDoubles` & `flushCompareBy` Unimplemented (`big2/ruleset.js:257, 266` & `big2/big2.js:246-253, 839-856`)**
    - `singapore` ruleset defines `powerWinDoubles: true` (double penalty when winning on Four of a Kind or Straight Flush), and all rulesets define `flushCompareBy`, but neither property is checked in `big2.js`.

13. **[Big 2] `validatePlay` Ignores `allowedHandTypes` and `mustIncludeCard` (`big2/big2.js:894-900`)**
    - `Big2Game.prototype.validatePlay` only checks `evaluate()` and `canBeat()`, omitting `allowedHandTypes` and first-turn `3♦` enforcement. The UI tells the player `"Beats current pile!"` and enables the **Play** button for illegal hands until clicked.

14. **[War] Tie (WAR!) With 1–3 Cards Remaining Immediately Forfeits (`war/ruleset.js:199-225`)**
    - When a War starts, each player places `Math.min(3, player.hand.count)` face-down cards into `_warPot`. If a player has 1, 2, or 3 cards remaining, all of their cards go into the pot face-down, leaving 0 cards to flip face-up and causing an instant forfeit. Standard/kid-friendly War keeps 1 card to flip face-up (`Math.min(3, Math.max(0, player.hand.count - 1))`), only forfeiting if a player enters a War with 0 cards left.

15. **[War] Match History "Current Match" Tab Never Records Rounds & Displays Raw Enum Ranks (`war/index.html:1216, 1290` & `shared/card-utils.js:11-25`)**
    - `this.currentPlayer1Card` and `this.currentPlayer2Card` are initialized to `null` in `war/index.html` and never assigned during `_flip()`, so `_addRoundEntry()` is never called and the "Current Match" tab always says `"No rounds played yet"`.
    - `CardUtils.renderCardText` (`shared/card-utils.js:11-25`) maps `'10'`, `'9'`, ..., `'2'` instead of the `Rank` enum values `'TEN'`, `'NINE'`, ..., `'TWO'`, causing number cards in history to render as `"SEVEN♥"` or `"TWO♠"`.

16. **[Solitaire] Draw-3 Waste Recycle Order & Missing UX Helpers (`solitaire/rules/klondike.js:161-193`)**
    - `recycle_waste` moves cards from `waste[0]` to `stock[-1]`. While harmless in Draw-1 mode, in Draw-3 mode (`drawCount: 3`) it fails to reverse the waste stack correctly.
    - No double-click/tap auto-move to foundation or undo support in `solitaire/js/game.js`.

17. **[Poker — 5 Card Draw] Unwired Header/Footer Controls & Weak AI Draw Logic (`poker/5card/index.html:181-183` & `poker/5card/five_card_draw.js:88-96`)**
    - The Ante `-` (`btnAnteMinus`), Ante `+` (`btnAntePlus`), and Deck Editor (`btnDeck`) buttons in `poker/5card/index.html` have no event listeners attached.
    - In `_dealerTurn()`, if the AI dealer holds a Pair, Two Pair, or Three of a Kind (`ev.rank >= 2`), it stands pat on all 5 cards instead of discarding unmatched kickers.

---

### Priority 3 — Half-Finished / Unlisted Games

18. **[Euchre] Hidden & ~40% Implemented (`games/cards/euchre/`)**
    - **Missing UI:** `games/cards/euchre/index.html` does not exist. In `games/cards/index.html:235`, Euchre is marked `disabled: true` (`Coming Soon`), and it is not listed in `js/catalog.js`.
    - **Incomplete Ruleset (`euchre/ruleset.js`):**
      - `_phase` starts as `'dealing'` and never transitions to `'calling'`; `_turnUpCard` is never populated from `gameState.piles.kitty`.
      - `resolveAction` handles `'orderUp'`, `'pass'`, and `'call_*'`, **but has no implementation for `'playCard'`** (trick play, following suit with Left Bower as trump suit, trick winner evaluation, and 5-trick round scoring are not wired into `resolveAction`).

19. **[Poker — Texas Hold'em & 13-Card Poker] Placeholder UIs & Partial Logic (`games/cards/poker/holdem/` & `games/cards/poker/13card/`)**
    - Both `poker/holdem/index.html` and `poker/13card/index.html` are static `"Coming Soon - March 2026 update"` placeholder pages.
    - `TexasHoldem.js` deals hole and community cards and evaluates 7-card hands, but lacks betting rounds, AI actions, and split-pot handling on ties (`results[0]` takes the entire pot).
    - `ThirteenCard.js` validates front/middle/back foul ordering (`Back >= Mid >= Front`), but lacks an AI 13-card hand-arrangement solver and row-by-row scoring in `submitArrangement()`.

---

### Priority 4 — Duplicated Logic & Tech Debt in `games/cards/`

20. **Dual Engine / Evaluator Split in Poker (`games/cards/poker/` vs. `games/cards/shared/`)**
    - `games/cards/poker/5card/ruleset.js` was written for `games/cards/shared/engine.js` (`FiveCardDrawRuleset`), has a duplicate `resolveAction` key (lines 44 and 193), and is **completely unused**.
    - Instead, `poker/5card/five_card_draw.js`, `TexasHoldem.js`, and `ThirteenCard.js` import from `../../../../negen/cards/CardGame.js` and `games/cards/poker/shared/evaluator.js`, duplicating `games/cards/shared/poker-evaluator.js`.
21. **Duplicate `card-assets.js` Files**
    - `games/cards/card-assets.js` and `games/cards/shared/card-assets.js` are near-identical copies (462 lines each).
22. **ES5 Compatibility Drift**
    - `blackjack/ruleset.js` uses `.find()`, `.findIndex()`, and `.includes()` despite file header comments stating strict ES5 compatibility.

---

## 3. Requests for the Orchestrator (Outside `games/cards/`)

Per hard lane rules, no files outside `games/cards/` were touched. The following items require orchestrator / catalog agent action when ready:

1. **List Euchre in Site Catalog (`js/catalog.js`) — *Hold until Euchre UI & trick-play mechanics are completed*:**
   - Currently `games/cards/euchre/` has only `ruleset.js` and `CLAUDE.md` (no `index.html`, and trick-taking `playCard` resolution is unfinished). Once we finish `euchre/ruleset.js` and `euchre/index.html` in `games/cards/`, `js/catalog.js` can add an entry for Euchre (or keep it pointed at `games/cards/index.html`).
2. **Broken Links Mentioned by User (Outside `games/cards/`):**
   - Breakout QR path and `xtc_ball` icon live outside `games/cards/` and should be handled in a separate PR by the orchestrator/other agent if desired.
