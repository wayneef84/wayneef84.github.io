# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fong Family Arcade** (formerly Dad's Casino) is a browser-based game collection for the whole family:
- **Letter Tracing** (v5.1): Educational app with A-B-C audio architecture, voice speed control, and rigorous stroke validation.
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system.
- **Xiangqi** (v0.3.1): Fully playable Chinese Chess with AI opponent.
- **Card Games** (In Progress): Blackjack, War, Euchre, Big 2 — built on shared Card Engine.

---

## 🚧 CURRENT PRIORITY: Card Engine Bug Fixes

**Status:** Core engine built, needs Terminal Check Gate implementation and Safari fixes.

### Critical Fixes Required

#### 1. Safari Compatibility (COMPLETED)
All shared JS files must avoid:
- `??` (nullish coalescing) - use ternary operators instead
- `?.` (optional chaining) - use explicit null checks
- Arrow functions in prototype methods - use regular functions
- `const`/`let` in older contexts - prefer `var` for maximum compatibility

#### 2. Terminal Check Gate (TODO)
**Problem:** Dealer takes turn even when player busts.
**Solution:** After EVERY card dealt or action, engine must call `ruleset.checkWinCondition(gameState)`.

```javascript
// In engine.js, after any card is dealt:
var terminalCheck = this.ruleset.checkWinCondition(this.getGameState());
if (terminalCheck && terminalCheck.immediate) {
    // Skip ALL remaining turns, go directly to RESOLUTION
    this.transitionTo(GameState.RESOLUTION, true);
    return;
}
```

#### 3. Bust Suppression (TODO)
**Rule:** If human player busts, `getNextActor()` MUST return `null` to prevent Dealer from drawing.

```javascript
// In blackjack/ruleset.js getNextActor():
var playerValue = this.evaluateHand(player.hand.contents);
if (playerValue.best > 21) {
    return null; // Player busted - skip to resolution
}
```

#### 4. Double Down Fix (TODO)
**Rule:** Double Down only available on player's FIRST move (2 cards in hand).
**Action:** Deduct 1x bet, deal exactly 1 card, force Stand immediately.

#### 5. Multi-Hand Architecture (MAJOR - Future Priority)
**Goal:** Support multiple hands per player (split, multi-player, future multiplayer via SQL).
**Status:** Defer until post-v1.0, but design decisions should consider this.

**Current Limitation:**
- Player has single `hand: Pile` property
- Engine assumes 1 hand per player
- UI renders 1 hand per player

**Proposed Multi-Hand System:**

```javascript
// Player structure (future)
{
    id: 'player1',
    type: 'human',
    hands: [
        { id: 'hand1', pile: Pile, bet: 25, status: 'active' },
        { id: 'hand2', pile: Pile, bet: 25, status: 'active' } // After split
    ],
    activeHandIndex: 0,
    balance: 1000
}
```

**Actor ID Convention:**
- Current: `'player1'` refers to the player
- Future: `'player1:hand1'` refers to specific hand
- Engine tracks `activeActorId = 'player1:hand2'`

**Engine Changes Needed:**
1. **getNextActor()**: Return `'player1:hand2'` after `'player1:hand1'` finishes
2. **resolveAction()**: Accept hand-specific actor IDs
3. **Deal sequencing**: Support dealing to specific hands
4. **Resolution**: Evaluate each hand independently against dealer

**UI Changes Needed:**
1. Render N hands per player (side-by-side or stacked)
2. Highlight active hand during play
3. Show bet amount per hand
4. Separate value bubbles per hand

**Split Implementation (when ready):**
- Player action: `'split'` creates 2nd hand
- Original hand → `hands[0]`, new hand → `hands[1]`
- Copy bet from original hand, deduct from balance
- Move 1 card to new hand, deal 1 card to each
- Play hand 0 → completion, then hand 1 → completion

**Multiplayer Considerations (SQL future):**
- Each hand becomes a row in `game_hands` table
- `player_id`, `hand_id`, `bet`, `cards_json`, `status`
- Server-side validation of actions per hand
- Real-time sync via WebSocket when hand state changes

**Games That Benefit:**
- Blackjack: Split pairs
- Poker: Side pots (each pot = virtual "hand")
- Big 2: No multi-hand, but multi-player critical
- Euchre: Partnerships (2v2), 4 players but 2 logical "teams"

**Animation Note (Current Bug):**
- Card appears at final position before flying animation
- Need to spawn card at shoe position (invisible or face-down) BEFORE animation
- See "Animation Issues" section below

---

## Card Engine Architecture

### Philosophy
Create a game-agnostic State Machine Engine that delegates logic to interchangeable Ruleset modules. All UI must be mobile-first and optimized for touch.

### Folder Structure

```
/games
  /cards
    /shared
      - enums.js         # Suit, Rank enums
      - card.js          # Card data structure (includes UUID)
      - deck.js          # Deck template definitions
      - pile.js          # Universal card container
      - player.js        # Base player structure
      - engine.js        # State machine + orchestration
      - card-assets.js   # Procedural card renderer (G)
    /blackjack
      - ruleset.js
      - index.html
    /war
      - ruleset.js
      - index.html
    /euchre
      - ruleset.js
      - index.html (TODO)
    /big2
      - ruleset.js (TODO)
      - index.html (TODO)
```

### State Machine Flow

```
IDLE
  ↓
BETTING (if game uses currency)
  ↓
DEALING
  ↓
[TERMINAL CHECK GATE] ← After EVERY card/action
  ↓
  ├── If immediate=true → RESOLUTION (skip dealer)
  └── If false → continue
  ↓
PLAYER_TURN
  ↓
[TERMINAL CHECK GATE]
  ↓
  ├── If bust/blackjack → RESOLUTION
  └── If getNextActor=null → RESOLUTION
  └── If still playing → OPPONENT_TURN
  ↓
OPPONENT_TURN (Dealer)
  ↓
RESOLUTION
  ↓
PAYOUT
  ↓
GAME_OVER
```

### Key Engine Methods

| Method | Purpose |
|--------|---------|
| `checkWinCondition(gameState)` | Called after every card. Returns `{immediate: true}` to skip to resolution |
| `getNextActor(gameState)` | Returns next player or `null` to end round |
| `resolveAction(gameState, actorId, action)` | Executes action, returns result |

---

## Game-Specific Rules

### Blackjack Ruleset

**Dealer Behavior:**
- Hit on 16 or less
- Stand on 17 or higher
- Dealer turn is SKIPPED if player busts

**Player Actions:**
- `hit` - Draw one card
- `stand` - End turn
- `double` - Double bet, draw one card, force stand (first move only)

**Bust Suppression Logic:**
```javascript
getNextActor: function(gameState) {
    // Check if player busted
    var player = gameState.players[0];
    var value = this.evaluateHand(player.hand.contents);
    if (value.best > 21) {
        return null; // CRITICAL: Prevents dealer turn
    }
    // ... rest of logic
}
```

### War Ruleset

**States:**
- `DEALING` → Both flip simultaneously
- `WAR_DEALING` → Tie occurred, deal war cards
- Nested wars allowed (Double/Triple War)

**Recursive War Logic:**
```javascript
// If tie during war, stay in WAR_DEALING state
if (value1 === value2) {
    return { nextState: 'WAR_DEALING' }; // Don't resolve yet
}
```

### Big 2 Ruleset (TODO)

**Config Object for House Rules:**
```javascript
{
    firstMoveCriteria: '3_OF_DIAMONDS', // or '3_OF_SPADES', 'LOWEST_CARD'
    tieBreak: 'CLOCKWISE_FROM_DEALER',  // or 'NEXT_LOWEST_CARD'
    suitOrder: ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'],
    twosHigh: true,
    scoringType: 'DOUBLE_OVER_TEN' // or 'TRIPLE_OVER_THIRTEEN'
}
```

---

## Mobile UI Architecture

### Fixed Footer Controls
```css
.controls {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
}
```

### Scrollable Card Area
```css
.game-table {
    overflow-y: auto;
    flex: 1;
}
```

### Layout Order
- **Dealer (top):** Label → Cards → Value Bubble
- **Player (bottom):** Cards → Value Bubble → Label

### Value Bubble Logic
- Hide if value is 0 or no cards present
- Show "BUST" styling if > 21
- Show "BLACKJACK" animation if natural 21

### Chip Set (Blackjack)
- $1, $5, $25, $50, $100
- Clear Bet: Red X chip
- Full-width Deal/New Hand buttons (~400px max)

---

## Test Suite (test.html)

### Purpose
Headless runner to verify ruleset logic without full UI.

### Test Case Structure
```javascript
{
    name: 'BJ-01 Bust Bypass',
    setup: { playerHand: [10, 5], dealerHand: [10] },
    action: 'hit', // Player hits, gets 10
    cardToDeal: 10,
    expected: {
        getNextActor: null,  // Should return null
        resolveRound: 'lose' // Player loses
    }
}
```

### Blackjack Test Cases
- **BJ-01:** Bust Bypass - Player busts, dealer doesn't draw
- **BJ-02:** Double Down - Pot doubles, one card dealt, forced stand
- **BJ-03:** Blackjack Payout - Natural 21 pays 3:2
- **BJ-04:** Push - Equal values return bet

### War Test Cases
- **WAR-01:** High Card Win
- **WAR-02:** Tie Initiates War
- **WAR-03:** Nested War (tie during war)
- **WAR-04:** Insufficient Cards Fallback

### Debug Commands
- `FORCE_PLAYER_BJ` - Give player Ace + King
- `FORCE_PLAYER_BUST` - Force next card to 10, hit
- `FORCE_DEALER_BUST` - Dealer draws until > 21
- `FORCE_TIE` - Match dealer score to player
- `RESET_BANK` - Set balance to $1000

---

## Data Structures Reference

### Card
```javascript
{
    suit: 'HEARTS',
    rank: 'KING',
    id: 'KH',
    deckId: 'standard',
    uuid: 'card_42'  // REQUIRED for animation tracking
}
```

### Pile Methods
| Method | Behavior |
|--------|----------|
| `createFrom(deck, copies)` | Factory from template |
| `receive(card, position)` | Add at position (0=top, -1=bottom) |
| `give(position)` | Remove and return |
| `shuffle()` | Randomize |
| `reset()` | Restore from template |

### Player
```javascript
{
    id: 'player1',
    type: 'human',
    seat: 0,
    hand: Pile,
    balance: 1000,      // If PlayerWithCurrency
    currentBet: 25
}
```

---

## CLI Task List

When implementing fixes, follow this order:

1. **Fix engine.js Terminal Check Gate**
   - Add `checkWinCondition()` call after every deal
   - If `immediate: true`, skip to RESOLUTION

2. **Fix blackjack/ruleset.js Bust Suppression**
   - `getNextActor()` returns `null` if player busted
   - `checkWinCondition()` returns `{immediate: true}` on bust

3. **Fix Double Down**
   - Only available when `player.hand.count === 2`
   - Deals exactly 1 card
   - Forces stand after

4. **Create test.html**
   - Import shared modules
   - Run predefined test cases
   - Report PASS/FAIL

5. **Build Big 2 ruleset**
   - Config object for house rules
   - 3♦ starting logic
   - Hand combination validation

---

## Code Style

- **JS:** ES5-compatible for Safari (use `var`, regular functions)
- **CSS:** Flexbox, `dvh` for mobile heights, safe-area-inset
- **Canvas:** `requestAnimationFrame` for loops
- **No build tools:** Vanilla JS, direct script loading

---

## Known Issues & Fixes

### Animation Bug: Card Preview Before Flying (Blackjack)

**Problem:**
When dealing cards, the following sequence occurs incorrectly:
1. Card appears at final destination (player/dealer hand) immediately
2. Card element is created at shoe position (top-right)
3. Animation flies card from shoe → destination
4. User sees card "preview" at destination before animation starts

**User Report:**
> "the card appears where it will be at the end, then is flipped upside down at the shoe and flies to the hand and revealed back at the spot"

**Root Cause:**
In `games/cards/blackjack/index.html` `_handleDealEvent()` method:
1. Card is added to DOM at landing pad (lines 790-795)
2. Landing pad made invisible (`opacity: '0'`)
3. Flying card animates from shoe → landing pad
4. Landing pad becomes visible after animation completes

The issue: The card is briefly visible at the landing pad BEFORE being hidden, creating a "preview" flash.

**Fix Strategy:**
```javascript
// Current (buggy):
landingPad.appendChild(slot);          // Card visible briefly
landingPad.style.opacity = '0';       // Then hidden
const flyer = _createCardElement(...); // Create flying copy
flyer.style.position = 'fixed';
flyer.style.left = startX;            // Start at shoe
// Animate flyer → landingPad

// Proposed fix:
landingPad.style.opacity = '0';       // Hide FIRST
landingPad.appendChild(slot);          // Then add card (invisible)
const flyer = _createCardElement(...); // Create flying copy
flyer.style.position = 'fixed';
flyer.style.left = startX;
// Animate flyer → landingPad
```

**Alternative Fix (Better):**
Don't add card to DOM until AFTER animation completes:
```javascript
// Don't add to landing pad yet
const landingPadRect = landingPad.getBoundingClientRect();
const flyer = _createCardElement(cardData, faceUp);
// ... position at shoe, animate to landingPadRect
setTimeout(() => {
    flyer.remove();
    landingPad.appendChild(slot); // Add AFTER animation
    landingPad.style.opacity = '1';
}, 500);
```

**When to Fix:**
- Low priority (cosmetic issue, game is playable)
- Fix alongside other animation improvements
- Test thoroughly to ensure card always appears in correct final position

---
