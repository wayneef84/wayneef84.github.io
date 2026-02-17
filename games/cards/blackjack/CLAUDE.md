# Blackjack - Developer Notes

**For the next Claude (or any developer) working on this project**

---

## Purpose & Philosophy

**Why This Exists:**
Classic casino Blackjack game for the Fong Family Arcade. Designed for entertainment, to teach probability and basic strategy, and to showcase the Shared Card Engine architecture.

**Design Philosophy:**
Authenticity over complexity. Implements core casino rules (hit, stand, double down) with clean separation between game logic (ruleset) and presentation (UI). Prioritizes mobile-first responsive design.

**Core Value:**
Demonstrates how the Shared Card Engine can power different card games with minimal custom code. Blackjack ruleset is ~500 lines; everything else is reused from the engine.

---

## Architecture Summary

Blackjack uses the Shared Card Engine (v1.0.0) for state management and card handling. The `BlackjackRuleset` object implements the game-specific logic (dealing, scoring, win conditions, dealer AI), while `BlackjackUI` handles rendering and user interaction.

**Main Components:**
1. **Shared Card Engine** - Manages game state, deck, players, and turn flow
2. **BlackjackRuleset** - Implements blackjack-specific rules and logic
3. **BlackjackUI** - Handles DOM rendering, animations, and user input

**Key Systems:**
- State Machine: BETTING → DEALING → PLAYER_TURN → DEALER_TURN → RESOLUTION → PAYOUT → BETTING
- Rendering: Hybrid (DOM elements for cards, CSS transforms for animation)
- Input: Touch-optimized chip selector and action buttons

See [ARCHITECTURE.md](ARCHITECTURE.md) for full technical details.

---

## ⚠️ Critical Fixes / Gotchas

### DO NOT REGRESS THESE

**Gotcha 1: Card Animation Flash Bug**
- ❌ What breaks if you forget: Cards appear at destination before flying animation starts
- ✅ How to prevent it: Use `visibility: hidden` instead of `opacity: 0` for tempSlot positioning
- 📍 Location: index.html, flyCard function (lines ~1200-1350)
- Example:
  ```javascript
  // WRONG - causes animation flash:
  tempSlot.style.opacity = '0';
  container.appendChild(tempSlot);
  tempSlot.style.left = startX + 'px';  // DOM draws BEFORE opacity changes

  // RIGHT - prevents flash:
  tempSlot.style.visibility = 'hidden';
  container.appendChild(tempSlot);
  tempSlot.style.left = startX + 'px';
  tempSlot.style.visibility = 'visible';  // Show after position set
  ```

**Gotcha 2: Double Down Availability**
- ❌ What breaks if you forget: Players can double down after hitting (exploit)
- ✅ How to prevent it: Check `player.hand.count === 2` in `getAvailableActions`
- 📍 Location: ruleset.js, getAvailableActions function (lines ~250-280)
- Example:
  ```javascript
  // WRONG - allows double down anytime:
  if (player.balance >= player.bet) {
    actions.push('doubleDown');
  }

  // RIGHT - only on first move (2 cards):
  if (player.hand.count === 2 && player.balance >= player.bet) {
    actions.push('doubleDown');
  }
  ```

**Gotcha 3: Terminal Check Gate**
- ❌ What breaks if you forget: Dealer plays even when player busted (wastes time) or game ends before insurance offered
- ✅ How to prevent it: Exit `checkWinCondition` early on player bust/blackjack; don't check dealer blackjack during initial deal if insurance enabled
- 📍 Location: ruleset.js, checkWinCondition function (lines ~380-420)
- Example:
  ```javascript
  // WRONG - dealer plays when player busted:
  // (no early return)
  var dealerValue = this.getHandValue(dealer.hand);
  // ... dealer logic runs even if player busted

  // RIGHT - skip dealer if player busted:
  var playerValue = this.getHandValue(player.hand);
  if (playerValue > 21) {
    return { winner: 'dealer', payout: -player.bet };  // Early exit
  }
  ```

**Gotcha 4: Safari ES5 Compatibility**
- ❌ What breaks if you forget: Arrow functions crash on Safari 9, const/let not supported on older tablets
- ✅ How to prevent it: Use `var` and `function()` syntax exclusively
- 📍 Location: Everywhere (ruleset.js, index.html)
- Example:
  ```javascript
  // WRONG - breaks Safari 9:
  const players = gameState.players.filter(p => !p.isDealer);

  // RIGHT - works everywhere:
  var players = gameState.players.filter(function(p) {
    return !p.isDealer;
  });
  ```

---

## Last Session Notes

### Most Recent Work (Top Entry)

**Date:** 2026-02-15
**Agent:** Claude (C)

**What Was Done:**
- Created comprehensive documentation suite (ARCHITECTURE, TODO, CHANGELOG, CLAUDE)
- Documented all critical fixes and gotchas from previous sessions
- Established baseline for future development

**Context for Next Session:**
- Current state: Game is production-ready (v1.0.6), all critical bugs fixed
- Next logical step: Implement split hands (Priority 2 in TODO.md)
- Blockers: None. Split requires significant refactoring but no external dependencies

**Code Changes:**
- No code changes this session (documentation only)

**Testing Performed:**
- No testing required (documentation session)

---

### Previous Session

**Date:** 2026-01-31
**Agent:** Claude (C)
**Work:** Fixed Double Down exploit, animation flash bug, and terminal check gate issue

---

## Common Mistakes (Learn from Experience)

1. **Mistake: Checking dealer blackjack during initial deal**
   - Impact: Game ends before insurance is offered, breaks insurance flow
   - Prevention: Only check dealer blackjack in insurance handler, not in `checkWinCondition`

2. **Mistake: Using arrow functions for Safari compatibility**
   - Impact: Crashes on Safari 9 and older tablets
   - Prevention: Strict ES5 syntax only (var, function(), no =>)

3. **Mistake: Allowing double down after first move**
   - Impact: Players can exploit by hitting, then doubling when favorable
   - Prevention: Check `hand.count === 2` in `getAvailableActions`

4. **Mistake: Using opacity instead of visibility for animation**
   - Impact: Card appears at destination before animation starts (visual glitch)
   - Prevention: Use `visibility: hidden` for off-screen positioning

---

## Key Code Locations

**Critical Code Paths:**

| Function | File | Lines | Purpose | Why Critical |
|----------|------|-------|---------|--------------|
| flyCard | index.html | 1200-1350 | Animate card movement | Animation flash bug lives here |
| getAvailableActions | ruleset.js | 250-280 | Determine valid player actions | Double down logic must check hand count |
| checkWinCondition | ruleset.js | 380-420 | End round, calculate payout | Terminal check gate must exit early on bust/blackjack |
| getHandValue | ruleset.js | 150-200 | Calculate hand total | Soft/hard hand logic, ace counting |
| getNextActor | ruleset.js | 350-380 | Determine whose turn | Dealer skips if player busted |

---

## Testing Before Commit

**Checklist:**
- [ ] Basic gameplay works (place bet, deal, hit, stand, win/lose)
- [ ] Mobile touch controls respond (chips, buttons)
- [ ] Animation timing correct (no flash, smooth 200ms transition)
- [ ] Performance acceptable (<2s load, 60 FPS animation)
- [ ] Documentation updated (CHANGELOG, TODO if adding features)
- [ ] No ES6+ syntax (var, not const/let; function, not =>)
- [ ] Relative paths only (no /games/..., use ../shared/)
- [ ] No external CDNs (all assets local)
- [ ] Double down only available on first move (2 cards)
- [ ] Player bust stops dealer from playing
- [ ] Blackjack pays 3:2 (not 1:1)

**Manual Test Script:**
1. Load game → Balance shows $1000, chips clickable
2. Click $25 chip 4 times → Bet shows $100, Deal button enabled
3. Click Deal → 2 cards to player, 2 to dealer (1 face down), smooth animation
4. Click Hit → Card added, value updates, no animation flash
5. Click Stand → Dealer reveals hole card, plays to 17+, outcome shown
6. Verify payout → Balance updates correctly
7. Click New Hand → Reset to betting phase
8. **Edge case:** Bust on purpose → Dealer doesn't play
9. **Edge case:** Get blackjack → Instant win, 1.5x payout
10. **Edge case:** Double down → Bet doubles, 1 card dealt, forced stand

---

## Performance Baselines

Keep these in mind when optimizing:

- **Load Time Target:** <2 seconds
- **Memory Target:** <10 MB
- **Idle CPU:** <1%
- **Active CPU:** <30%
- **FPS (if animated):** Consistent 60

Current baselines (see [INFO.md](INFO.md)):
- Load: ~0.8s (inline CSS/JS)
- Memory: ~5 MB (6-deck shoe = 312 cards)
- CPU: ~15% during card animation, <1% idle

If performance degrades significantly, investigate:
- Card animation duration (currently 200ms)
- DOM node cleanup (possible leak after 100+ hands)
- Reshuffle pause (currently ~100ms for 312 cards)

---

## Related Resources

- [README.md](README.md) - User guide & game rules
- [ARCHITECTURE.md](ARCHITECTURE.md) - Full technical design
- [TODO.md](TODO.md) - What needs doing
- [INFO.md](INFO.md) - Quick facts & dependencies
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [Shared Engine GUIDE](../shared/CARD_ENGINE_GUIDE.md) - Card Engine documentation
- [Shared Engine INFO](../shared/INFO.md) - Shared library version info

---

## Questions I'd Ask Next Developer

1. **When adding split hands:** "How will you handle two hand arrays? Render side-by-side or left/right with swipe?"
2. **Before refactoring:** "Will this improve performance or just code cleanliness? If cleanliness, is it worth the regression risk?"
3. **On mobile issues:** "Have you tested on actual devices or just Chrome DevTools? Real devices often behave differently."
4. **On performance:** "Where's the bottleneck? Profile first, optimize second. Don't guess."
5. **On Shared Engine upgrade:** "Did you check INFO.md for breaking changes? Read the CHANGELOG before upgrading."

---

## The Next Step

[For next developer working on this]

If you're here, the game is production-ready. Here's what you probably should do next:

1. **Quick refresh:** Re-read this CLAUDE.md and [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Understand:** Run the game locally, play a few hands, understand the current state
3. **Check:** Read [TODO.md](TODO.md) - Priority 2 suggests split hands next
4. **Plan:** Before coding split hands, document your approach in TODO.md
   - How will you store two hands? (array? separate hand1/hand2 properties?)
   - How will you render them? (side-by-side? stacked?)
   - How will you manage two bets? (same amount? separate UI?)
5. **Build:** Code your change incrementally
   - Step 1: Detect pairs, show "Split" button
   - Step 2: Duplicate hand and bet
   - Step 3: Render two hands side-by-side
   - Step 4: Handle actions for each hand independently
6. **Document:** Update TODO/CHANGELOG/AGENT.md as you go
7. **Test:** Verify on mobile devices (iPhone, Android), not just desktop
8. **Commit:** With message like `feat: Add split hands functionality`

Good luck! Feel free to update this file with lessons you learn about split hand implementation.

---

**Last Updated:** 2026-02-15
**Updated By:** Claude (C)
**Status:** Ready for next developer
