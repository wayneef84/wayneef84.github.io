# Blackjack - Project Info

**Type:** Application (Card Game)
**Version:** v1.0.0
**Directory:** `games/cards/blackjack/`
**Parent Project:** F.O.N.G.
**Created:** 2026-01-10
**Last Updated:** 2026-01-17

---

## Dependencies

| Library | Version | Status | Notes |
|---------|---------|--------|-------|
| `games/cards/shared` | **v1.0.0** | ✅ Up-to-date | Card engine (stable) |

---

## Upgrade Notes

**Last Checked:** 2026-01-17
**Available Upgrades:** None
**Current Version Rationale:** Shared v1.0.0 is stable and meets all current needs.

### Upgrade History
- **2026-01-17:** Initial registration - Blackjack on Shared v1.0.0
- (No upgrades yet)

---

## Scope

Classic casino Blackjack (21) with betting, currency management, and dealer AI.

**Key Features:**
- **Currency System**: Start with $1000, place bets ($1-$100 chips)
- **Standard Rules**: Hit, Stand, Double Down
- **Dealer AI**: Hits on 16 or less, stands on 17+
- **Bust Suppression**: Dealer doesn't play if player busts
- **Terminal Check Gate**: Game ends immediately on player bust/blackjack
- **Payout**: Win (1:1), Blackjack (3:2), Push (return bet)
- **6-Deck Shoe**: Reshuffles when depleted

**Player Actions:**
- **Hit**: Draw one card
- **Stand**: End turn, dealer plays
- **Double Down**: Double bet, draw exactly 1 card, force stand (first move only)

**UI Features:**
- Chip selector ($1, $5, $25, $50, $100, Clear)
- Deal/New Hand buttons (full-width)
- Value bubbles (hand totals)
- Bet display
- Balance display
- Settings modal (reset deck, re-shuffle)
- Reset Deck button (in betting area and settings)

---

## Activity Log

**Recent Changes:**

- **[2026-01-31]** fix: Double Down only available on first move (2 cards)
  - Fixed getAvailableActions in ruleset
  - Fixed insurance code paths that bypassed the check
  - Added explicit disable in _updateValues when player.hand.count > 2

- **[2026-01-31]** fix: Card animation preview bug
  - Changed visibility:hidden instead of opacity:0 for tempSlot
  - Converted arrow functions to regular functions for Safari compatibility

- **[2026-01-31]** fix: Dealer blackjack check removed from checkWinCondition
  - Prevents game from ending before insurance is offered
  - Insurance flow now handles dealer blackjack detection

- **[2026-01-15]** feat: Add Reset Deck button to betting area
  - Quick access during betting phase
  - Indigo gradient styling
  - Works alongside settings modal button

- **[2026-01-14]** feat: Split Blackjack reshuffle into Reset Deck and Re-shuffle
  - Reset Deck: Create new deck, reset counts
  - Re-shuffle: Shuffle existing deck

- **[2026-01-13]** fix: Terminal Check Gate implementation
  - Game ends immediately on bust/blackjack
  - Dealer skips turn if player busted

- **[2026-01-12]** feat: Add bust suppression logic
  - `getNextActor()` returns null if player busted
  - Prevents dealer from drawing unnecessarily

- **[2026-01-10]** feat: Initial Blackjack implementation
  - Basic hit/stand mechanics
  - Dealer AI
  - Betting system

---

## Context Boundaries

**What Blackjack Owns:**
- Game UI (cards, chips, buttons, modals)
- Blackjack-specific rules (hit/stand/double down, dealer behavior)
- Betting system and currency management
- Hand evaluation (blackjack detection, value calculation)
- Settings (deck management, reshuffle)

**What Blackjack Uses (Shared):**
- Card engine (Deck, Pile, Player, Engine)
- Card data structures
- State machine (GameState transitions)

**What Blackjack Does NOT Handle:**
- Card engine internals (delegates to shared)
- Generic animations (implements own card flying)
- Multiplayer logic (future: may use shared engine)

---

## Known Issues

- [x] **Double Down**: Fixed - Only available on first move (2 cards) ✅
- [x] **Animation Preview Bug**: Fixed - Using visibility:hidden instead of opacity:0 ✅

---

## Future Enhancements

- [x] ~~**Fix Double Down**: Only available on first move (2 cards in hand)~~ (DONE)
- [ ] **Split**: Allow splitting pairs into two hands
- [ ] **Insurance**: Offer insurance bet when dealer shows Ace
- [ ] **Surrender**: Allow early fold for half bet
- [ ] **Multi-hand**: Play multiple hands simultaneously
- [ ] **Side Bets**: Perfect Pairs, 21+3
- [ ] **Statistics**: Track win rate, biggest win/loss
- [ ] **Theme System**: Multiple color schemes (deferred to shared theme system)

---

## For Sub-Project Claude

**Role:** Lead Developer for Blackjack card game
**Scope:** Work only within `games/cards/blackjack/` directory

**On Startup:**
1. Read this INFO.md to understand current dependencies (Shared v1.0.0)
2. Check root `INFO.md` to see if Shared has newer version
3. If upgrade available, alert user before proceeding

**Dependency Protocol:**
- You are pinned to Shared v1.0.0
- Use only Shared APIs available in v1.0.0
- Do NOT use newer Shared features unless user upgrades this file
- If user wants newer feature: "That requires Shared vX.Y. Upgrade?"

**Testing Checklist After Changes:**
- [ ] Place bet: Chips work, bet updates, Deal enabled
- [ ] Deal hand: 2 cards to player, 2 to dealer (1 hidden)
- [ ] Hit: Card added, value updates, bust detected
- [ ] Stand: Dealer plays, outcome resolved
- [ ] Double Down: Bet doubled, 1 card dealt, forced stand
- [ ] Player bust: Dealer doesn't play, bet lost
- [ ] Player blackjack: Instant win, 3:2 payout
- [ ] Push: Tie, bet returned
- [ ] Reshuffle: Shoe reshuffles when low
- [ ] Reset deck: New deck created, counts reset
- [ ] Balance: Updates correctly on win/loss/push

---

## File Structure

```
games/cards/blackjack/
├── index.html          (Main UI + BlackjackUI class)
├── ruleset.js          (BlackjackRuleset - game logic)
└── INFO.md            (This file)
```

---

## Game Rules

### Hand Evaluation
- **Blackjack**: Ace + 10-value card (21 on first two cards)
- **Bust**: Hand value > 21
- **Push**: Player and dealer have same value
- **Soft Hand**: Hand with Ace counted as 11
- **Hard Hand**: Hand with Ace counted as 1, or no Ace

### Dealer Behavior
- Hits on 16 or less
- Stands on 17 or higher (soft 17 = stand)
- Dealer doesn't play if player busted

### Payouts
- **Win**: 1:1 (bet × 1)
- **Blackjack**: 3:2 (bet × 1.5)
- **Push**: Return bet (bet × 0)
- **Lose**: Lose bet (bet × -1)

---

## Configuration

### Deck Setup
- **Shoe Size**: 6 decks (312 cards)
- **Reshuffle Trigger**: When < 52 cards remain
- **Card Dealing**: Face up for player, 1 face down for dealer

### Starting Balance
- **Default**: $1000
- **Chips**: $1, $5, $25, $50, $100

---

## localStorage Keys

- `blackjack_balance` - Current balance
- (Future: `blackjack_stats` for win rate, hand history)

---

## Performance Notes

- 6-deck shoe provides realistic casino experience
- Reshuffle only when necessary (< 52 cards)
- Card animations use CSS transitions (hardware accelerated)

---

**INFO Version:** v1.0
**Last Updated By:** Claude Sonnet 4.5
**Last Updated:** 2026-01-17
