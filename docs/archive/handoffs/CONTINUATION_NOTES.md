# Continuation Notes for Next Session

**Date:** January 14, 2026
**Status:** Partially complete - hit token limit
**Branch:** main (push pending)

---

## What Was Completed

### ✅ Blackjack: Split Reshuffle Buttons (Settings Modal)
- **Changed:** Single "Force Reshuffle Shoe" button → Two buttons side-by-side
- **Left Button:** "🔄 Reset Deck" - Creates new deck from template, resets card counts
- **Right Button:** "🔀 Re-shuffle" - Shuffles current remaining cards, preserves card counts
- **CSS:** Added `.button-row` and `.half-btn` classes for 50/50 layout
- **Methods:**
  - `_resetDeck()` - New method that resets shoe and card counts
  - `_reshuffle()` - New method that only shuffles current cards
  - Removed old `_debugForceReshuffle()` method
  - Debug menu now uses `_resetDeck()`

**File Modified:** `games/cards/blackjack/index.html`

---

## What Still Needs To Be Done

### 🔲 Blackjack: Add Reset Deck to Game Mode
**Requirement:** User wants "Reset Deck" button available during gameplay, not just in Settings
**Implementation Ideas:**
1. Add button to betting area (next to chip selector?)
2. Add to game-over screen (alongside Play Again / Change Bet)
3. Add as menu item in header (3-dot menu?)

**Question for Wayne:** Where should this button live? Recommend adding to game-over screen for now.

---

### 🔲 War: Fix Infinity Toggle Logic
**Current Behavior:** Infinity symbol toggles between endless/non-endless modes
**Problem:** It's applied to both win AND rounds displays

**Correct Behavior:**
- **Wins Display:** Should show ∞ in endless mode, number in non-endless
- **Rounds Display:** Should ALWAYS show number (rounds count each draw)

**Files to Edit:**
- `games/cards/war/index.html`
  - Line 599-607: Toggle handlers for `yourWinDisplay` and `oppWinDisplay`
  - Line 848-856: `_updateWins()` method
  - Remove infinity logic from rounds display

---

### 🔲 War: Implement Endless Mode Logic
**Current:** Game stays in endless mode, but doesn't properly track wins/rounds

**Required Changes:**
1. **Rounds Counter:** Increments on every draw (not just wins)
2. **Wins Counter:**  Shows ∞, doesn't increment
3. **Reset Deck:** Rounds persist, wins stay at ∞
4. **No Game End:** Game never goes to GAME_OVER state in endless mode

**Definition Clarification:**
- **Round:** Each single card draw/flip
- **Win:** When one player actually wins the entire game (not in endless mode)

**Files to Edit:**
- `games/cards/war/ruleset.js`
  - Track rounds in `resolveAction` (increment every flip)
  - Only award win points in non-endless when game ends
- `games/cards/war/index.html`
  - Update `_handleRoundWin` to track differently
  - Add rounds increment on each flip

---

### 🔲 War: Implement Non-Endless End Game
**Trigger:** When draw pile will be empty on next draw AND not in endless mode

**Required Logic:**
1. Check remaining cards before each flip
2. If next flip would empty both hands (no cards to reshuffle):
   - Award 1 win point to player who won last round
   - Reset rounds to 0
   - Reset deck (create new 52-card deck)
   - Continue game

**Files to Edit:**
- `games/cards/war/ruleset.js`
  - Add check in `getAvailableActions` or `resolveAction`
  - Detect when `player1.hand.count + player2.hand.count === 2` (last 2 cards)
  - Award win point, reset rounds, trigger deck reset

---

### 🔲 War: Add Reset Deck Button
**Requirement:** Same as Blackjack - allow manual deck reset during game

**Implementation:**
- Add button to game UI (recommend near "Draw!" button or in settings)
- Call similar logic to Blackjack's `_resetDeck()`
- In endless mode: Keep rounds/wins, just reset deck
- In non-endless: Ask if user wants to reset the game entirely?

**Files to Edit:**
- `games/cards/war/index.html`
  - Add button to HTML
  - Add click handler
  - Create `_resetDeck()` method
- `games/cards/war/ruleset.js`
  - May need to expose deck reset method

---

## Key Definitions (From Wayne)

**Reset Deck:**
> Create and use a new deck as it was in the original (draw) pile before the game started. (E.g. if a standard deck had wilds added, then the wilds will still show up in the re-deal). Card Count will reset since it's a new deck to count cards.

**Re-shuffle:**
> Shuffle the current cards in the (draw) pile.

**Rounds (War):**
> Each draw/flip of cards

**Wins (War):**
> Awarded when player wins entire game (only in non-endless mode)

**Endless Mode (War):**
> No winner ever declared, rounds accumulate indefinitely, wins show ∞

**Non-Endless Mode (War):**
> When deck would be empty, award win point, reset rounds to 0, reset deck

---

## Testing Checklist (For Next Session)

### Blackjack
- [ ] Settings modal shows two buttons side-by-side
- [ ] Reset Deck creates new deck and resets card counts
- [ ] Re-shuffle only shuffles, preserves card counts
- [ ] Debug menu still works with Reset Deck
- [ ] Add Reset Deck to game mode UI

### War
- [ ] Infinity toggle only affects Wins display (not Rounds)
- [ ] Rounds increment on every flip (not just wins)
- [ ] Endless mode: Wins show ∞, rounds keep counting
- [ ] Non-endless mode: Game ends when deck empty, award win, reset rounds
- [ ] Reset Deck button works in both endless/non-endless
- [ ] Switching between endless/non-endless preserves state correctly

---

## Git Status

**Uncommitted Changes:**
- `games/cards/blackjack/index.html` - Blackjack reshuffle split

**Ready to Push:** No (should complete War fixes first for cleaner commit)

**Suggested Commit Message (when ready):**
```
feat(cards): Add Reset Deck and Re-shuffle separation

Blackjack:
- Split Force Reshuffle into Reset Deck (new deck) and Re-shuffle (current cards)
- Two buttons side-by-side in Settings modal
- Reset Deck: Creates new deck from template, resets card counts
- Re-shuffle: Shuffles remaining cards, preserves counts

War:
- Fix infinity toggle to only affect wins display
- Implement proper endless mode (∞ wins, counting rounds)
- Implement non-endless end game (award wins, reset rounds)
- Add Reset Deck button to game UI
- Clarify rounds (each flip) vs wins (game victories)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Notes for Next Claude Session

Wayne is using both Claude and Gemini interchangeably. Check CHANGELOG.md at start of session to see what changed.

Wayne's feedback is direct and precise - if he says something isn't working, trust that assessment and debug accordingly.

Token limit hit at ~97k/200k. Plenty of context remaining but running out of time.

**Next Steps:**
1. Complete War fixes (infinity toggle, endless/non-endless logic)
2. Add Reset Deck to game mode UIs (both Blackjack and War)
3. Test thoroughly
4. Push as single commit

Good luck! 🎮
