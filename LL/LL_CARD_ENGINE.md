# Lessons Learned: Card Engine

**Timeline:** December 2025 - January 2026
**Games Affected:** Blackjack, War, Euchre, Big 2 (future)

---

## 1. Terminal Check Gate (CRITICAL)

**Date Discovered:** ~January 2026
**Severity:** Game-breaking

### The Bug
Dealer continued taking turns even after player busted (went over 21).

### Root Cause
Win condition was only checked at end of round, not after each card dealt.

### The Fix
```javascript
// WRONG - only checks at end
function dealerTurn() {
    while (dealerHand.value < 17) {
        dealCard(dealer);
    }
    resolveRound(); // Too late!
}

// CORRECT - check after EVERY card
function dealCard(player) {
    // ... deal logic ...
    if (checkTerminalCondition()) {
        return; // Stop immediately
    }
}
```

### Rule for Future Development
**Always check win/loss conditions after EVERY state change, not just at phase boundaries.**

---

## 2. Animation Flash Bug

**Date Discovered:** ~January 2026
**Severity:** Visual glitch

### The Bug
Cards appeared at their destination position for a split second before the fly animation started.

### Root Cause
DOM element was inserted with final position styles, THEN opacity was set to 0.

### The Fix
```javascript
// WRONG
container.appendChild(cardElement);
cardElement.style.opacity = '0';
// Card briefly visible at destination!

// CORRECT
cardElement.style.opacity = '0';
cardElement.style.visibility = 'hidden';
container.appendChild(cardElement);
// Force reflow
void cardElement.offsetWidth;
// Now animate
cardElement.style.opacity = '1';
cardElement.style.visibility = 'visible';
```

### Rule for Future Development
**Set visibility/opacity BEFORE DOM insertion. Force reflow before animating.**

---

## 3. Card UUID Tracking

**Date Discovered:** ~December 2025
**Severity:** Animation chaos

### The Bug
Multiple cards animating simultaneously would sometimes swap positions or animations would apply to wrong cards.

### Root Cause
Cards were identified by array index, which shifted as cards moved between piles.

### The Fix
```javascript
// WRONG
var card = deck[0]; // Index changes!

// CORRECT
function createCard(suit, rank) {
    return {
        id: 'card_' + (++cardIdCounter), // Unique forever
        suit: suit,
        rank: rank
    };
}
```

### Rule for Future Development
**Every card needs a UUID assigned at creation. Never reuse card objects - create new ones.**

---

## 4. State Machine Architecture

**Date Discovered:** ~December 2025
**Severity:** Architecture decision

### The Problem
Race conditions when multiple events fired (e.g., double-click on Hit button).

### The Solution
Strict state machine with guarded transitions:

```javascript
var GameState = {
    IDLE: 'idle',
    BETTING: 'betting',
    DEALING: 'dealing',
    PLAYER_TURN: 'player_turn',
    DEALER_TURN: 'dealer_turn',
    RESOLUTION: 'resolution',
    PAYOUT: 'payout'
};

function canHit() {
    return currentState === GameState.PLAYER_TURN &&
           !isAnimating &&
           playerHand.value < 21;
}

function onHitButton() {
    if (!canHit()) return; // Guard!
    // ... proceed
}
```

### Rule for Future Development
**Always use explicit state machines for turn-based games. Guard ALL actions with state checks.**

---

## 5. Shared Engine File Structure

**Final Architecture:**
```
games/cards/shared/
├── card.js        # Card entity (id, suit, rank, faceUp)
├── deck.js        # Deck management (create, shuffle, draw)
├── pile.js        # Pile/hand management (add, remove, calculate)
├── player.js      # Player entity (hand, balance, actions)
├── engine.js      # State machine, game loop
├── card-assets.js # Procedural card rendering
└── INFO.md        # Version lock file
```

### Rule for Future Development
**New card games import from shared/. Do not duplicate these files into game directories.**

---

## Quick Reference Checklist

Before shipping a card game feature:

- [ ] Terminal conditions checked after EVERY card dealt?
- [ ] Animations use visibility:hidden BEFORE DOM insert?
- [ ] All cards have unique IDs?
- [ ] State machine guards on all player actions?
- [ ] Tested on Safari/iOS?
- [ ] No `const`, `let`, `??`, `?.` operators?

---

*Last Updated: 2026-02-05 by Claude (C)*
