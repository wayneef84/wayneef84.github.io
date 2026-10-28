# Card Games Mechanics Checkpoint (`games/cards/`)

**Last Updated:** 2026-10-27
**Branch:** `agy/cards-mechanics`
**Workspace:** `/Users/wayneef/Documents/Dev/wayneef84.github.io-agy`

---

## Done
- **Step 0 — Setup:**
  - Created isolated repo clone at `~/Documents/Dev/wayneef84.github.io-agy`.
  - Checked out `dev` (`ea61ff7`), pulled latest, and created branch `agy/cards-mechanics`.
  - Read `CLAUDE.md` and `games/cards/changelog.md`.
- **Step 1 — Audit:**
  - Audited all 6 card games (`blackjack`, `war`, `big2`, `solitaire`, `poker` [5-Card Draw, Hold'em, 13-Card], `euchre`) and all `games/cards/shared/` modules (`engine.js`, `poker-evaluator.js`, `deck-editor.js`, `card-utils.js`, `pile.js`, `deck.js`, `player.js`, `card.js`, `enums.js`).
  - Executed existing test suites (`test-suite.html`: 26/26 pass; `test_ruleset.html`: 5/6 pass, 1 outdated test `BJ-03`; `test.html`: 4/4 sections pass).
  - Wrote full prioritized findings and orchestrator requests to `games/cards/AUDIT.md`.

## In Progress
- Waiting for Wayne's priority selection (Step 2) before starting major mechanics changes.

## Next
- Once Wayne confirms priorities (or using default priorities):
  1. Fix Priority 1 critical bugs in Blackjack (double-down double deduction, affordability check, split double payout, settings deck reset/reshuffle crash), War (winner pot collection & endless mode graveyard logic, 1–3 card war tie edge case, round history), Solitaire (victory state transition & `ROUND_WIN` emission), Poker 5-Card Draw (dealer ante matching & tie payout, AI kicker discard, ante buttons), and `shared/` (`DeckEditor` restore, `CardUtils.renderCardText`, engine `getAiAction`/`getAIAction` normalization).
  2. Fix Big 2 straight ranking (`2` in straights, `A-2-3-4-5` low wrap scoring, Taiwanese 5-card-beats-3-card AI, Singapore `powerWinDoubles`, `validatePlay` hand checks).
  3. Complete Euchre trick-play mechanics + UI (if prioritized by Wayne).
  4. Expand `games/cards/test-suite.html` with automated tests for all fixed mechanics.

## Exact Steps to Resume
```bash
cd ~/Documents/Dev/wayneef84.github.io-agy
git checkout agy/cards-mechanics
git status
```
1. Review `games/cards/AUDIT.md` and Wayne's reply on priorities.
2. Edit only files inside `games/cards/`.
3. Run tests via `games/cards/test-suite.html` and update `games/cards/CHECKPOINT-cards.md` on each commit.
