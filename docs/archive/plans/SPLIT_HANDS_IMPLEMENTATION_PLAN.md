# IMPLEMENTATION PLAN: Blackjack Split Hands Feature

**Status:** Ready for approval
**Complexity:** MEDIUM-HIGH
**Estimated Duration:** 8-12 hours (2-3 development sessions)
**Priority:** HIGH (signature feature)

---

## CONTEXT

Blackjack currently supports single-hand play only. Split hands is a standard casino feature that:
- Increases player engagement and strategy depth
- Demonstrates the shared card engine's flexibility
- Is frequently requested by players

Split allows players to divide a pair (two cards of equal value) into two separate hands with independent betting and action sequences.

---

## IMPLEMENTATION APPROACH

### Phase 1: Data Structure Refactoring (Task 1)
Convert `player.hand` (single Pile) to `player.hands` (array of Piles)

**Files Modified:**
- `games/cards/shared/player.js` (line 9) - Change `this.hand = new Pile()` to `this.hands = [new Pile(), new Pile()]`
- `games/cards/blackjack/ruleset.js` - Replace all `player.hand` references with `player.hands[handIndex]`
- `games/cards/blackjack/index.html` - Update all methods accessing `player.hand`

**Strategy:**
- Use systematic find-and-replace (with validation)
- Update `evaluateHand()` to accept hand array index
- Update `_canPlayerAct()` to accept `(player, handIndex)` params
- Backward compatibility: Add migration for localStorage persistence

---

### Phase 2: Actor ID & Turn Management (Task 5)
Extend turn system to track hand index

**Key Changes:**
- Actor ID format: `'player1'` → `'player1:hand0'` or `'player1:hand1'`
- `getNextActor()` returns `'playerId:handIndex'` format
- `resolveAction()` parses `actorId.split(':')` to extract playerId and handIndex
- Helper function `_parseActorId(actorId)` returns `{playerId, handIndex}`

**Files Modified:**
- `games/cards/blackjack/ruleset.js` (lines 190-251)
- `games/cards/blackjack/index.html` (all UI updates)

---

### Phase 3: Split Action Mechanics (Task 2)
Add split as new action type in ruleset

**Location:** `ruleset.js` lines 122-184 (resolveAction method)

**Split Action Logic:**
```javascript
if (action === 'split') {
    // 1. Deduct duplicate bet
    result.actions.push({
        type: ActionType.DEDUCT,
        playerId: actorId.split(':')[0],
        amount: actor.currentBet
    });

    // 2. Move one card to hand[1]
    // (handled via card transfer in engine)

    // 3. Deal new card to hand[0]
    result.actions.push({
        type: ActionType.DEAL,
        from: 'shoe',
        to: actorId + ':hand0',  // Specify which hand
        toPlayer: true,
        faceUp: true
    });

    // 4. Deal new card to hand[1]
    result.actions.push({
        type: ActionType.DEAL,
        from: 'shoe',
        to: actorId + ':hand1',
        toPlayer: true,
        faceUp: true
    });

    // 5. Move to first hand for play
    result.nextActor = actorId + ':hand0';
}
```

---

### Phase 4: UI Refactoring (Tasks 3-4)
Create dual hand containers and split button

**HTML Changes** (lines 745-751):
```html
<!-- BEFORE -->
<div class="cards-container" id="playerCards"></div>
<div class="hand-value" id="playerValue">-</div>

<!-- AFTER -->
<div style="display: flex; gap: 20px; justify-content: center;">
    <div class="hand-container">
        <div class="cards-container" id="playerCardsLeft"></div>
        <div class="hand-value" id="playerValueLeft">-</div>
    </div>
    <div class="hand-container">
        <div class="cards-container" id="playerCardsRight"></div>
        <div class="hand-value" id="playerValueRight">-</div>
    </div>
</div>
```

**Button Changes** (lines 770-774):
```html
<!-- ADD -->
<button id="btnSplit" class="action-btn">SPLIT</button>
```

**CSS Updates:**
- Add `.hand-container` styling for side-by-side layout
- Adjust `.cards-container` width for narrower hand display
- Add visual divider between hands

---

### Phase 5: Animation & Deal Event Routing (Task 6)
Route cards to correct hand containers

**Changes to `_handleDealEvent()`** (line 1393):
```javascript
_handleDealEvent(event) {
    var actor = event.to;  // e.g., 'player1:hand0'
    var parts = actor.split(':');
    var playerId = parts[0];
    var handIndex = parts[1] ? parseInt(parts[1].replace('hand', '')) : 0;

    // Route to correct container
    var container;
    if (playerId === 'dealer') {
        container = this.el.dealerCards;
    } else {
        container = (handIndex === 0) ?
            this.el.playerCardsLeft : this.el.playerCardsRight;
    }

    var placeholder = container.querySelector('.placeholder');
    if(placeholder) placeholder.remove();
    this._flyCard(event.card, container, event.faceUp);
}
```

**Changes to `_updateValues()`** (line 1609):
```javascript
_updateValues() {
    var player = this.engine.players[0];
    var dealer = this.engine.dealer;

    // Evaluate BOTH hands
    if (player && player.hands) {
        player.hands.forEach(function(hand, handIndex) {
            if (hand.count > 0) {
                var pv = BlackjackRuleset.evaluateHand(hand.contents);
                var element = (handIndex === 0) ?
                    this.el.playerValueLeft : this.el.playerValueRight;
                element.textContent = pv.best;
                // Apply CSS classes (bust, blackjack, etc.)
            }
        }, this);
    }

    // Dealer value (unchanged)
    if (dealer && dealer.hand.count > 0) {
        var dv = BlackjackRuleset.evaluateHand(dealer.hand.contents);
        this.el.dealerValue.textContent = dv.best;
    }
}
```

---

### Phase 6: Payout Calculation (Task 7)
Calculate outcomes for each hand independently

**Changes to `resolveRound()`** (line 425):
```javascript
resolveRound: function(gameState) {
    var dealer = gameState.dealer;
    var dealerValue = this.evaluateHand(dealer.hand.contents);

    var results = [];

    gameState.players.forEach(function(player) {
        player.hands.forEach(function(hand, handIndex) {
            var playerValue = this.evaluateHand(hand.contents);
            var outcome = this._evaluateOutcome(playerValue, dealerValue);
            var multiplier = this._getMultiplier(outcome);

            results.push({
                playerId: player.id,
                handIndex: handIndex,
                playerValue: playerValue.best,
                dealerValue: dealerValue.best,
                outcome: outcome,
                multiplier: multiplier,
                bet: player.bets[handIndex]
            });
        }, this);
    }, this);

    return { dealerValue: dealerValue.best, dealerBust: dealerBust, playerResults: results };
}
```

**Changes to `calculatePayouts()`**:
```javascript
calculatePayouts: function(resolution, gameState) {
    return resolution.playerResults.map(function(result) {
        return {
            type: ActionType.PAYOUT,
            playerId: result.playerId,
            handIndex: result.handIndex,
            amount: Math.floor(result.bet * result.multiplier),
            outcome: result.outcome
        };
    });
}
```

---

### Phase 7: Enable Split Button Logic (Task 2 Continuation)
Show split button when pair detected

**Location:** `getAvailableActions()` (line 105)

```javascript
getAvailableActions: function(player, handIndex) {
    var hand = player.hands[handIndex];
    var value = this.evaluateHand(hand.contents);
    var actions = [];

    // Only offer split on initial 2-card hand
    if (hand.count === 2) {
        // Check for pair
        if (value.canSplit) {
            // Check sufficient balance
            if (player.balance >= hand.bet) {
                actions.push('split');
            }
        }

        // Double down (unchanged)
        if (player.balance >= hand.bet) {
            actions.push('doubleDown');
        }
    }

    // Hit/Stand always available
    actions.push('hit');
    actions.push('stand');

    return actions;
}
```

---

## CRITICAL IMPLEMENTATION NOTES

### ✅ What Works As-Is
- Pair detection already calculated in `evaluateHand()` (line 332)
- Animation system position-agnostic via `getBoundingClientRect()`
- Insurance logic compatible (applies to both hands)
- Terminal check gate adapts to multiple hands

### ⚠️ Must Preserve
- **Animation flash prevention:** Keep `visibility: hidden` (line 1406) - do NOT use opacity
- **ES5 compatibility:** No `const`/`let`, no arrow functions - maintain existing syntax
- **Bet caps:** $1-$100 per hand, ensure split doesn't exceed player balance

### 🔴 High-Risk Areas
1. **Player.hand refactoring:** Affects 10+ code locations - test extensively
2. **Hand index parsing:** Must handle both `'player1:hand0'` and legacy `'player1'` formats
3. **Payout order:** Ensure correct mapping of outcomes to hand indices

---

## VERIFICATION & TESTING

### Manual Test Cases
1. **Basic Split Flow**
   - Deal pair (e.g., 8♠ 8♥)
   - Click Split button
   - Verify second hand created with correct styling
   - Verify both hands show value bubbles

2. **Sequential Play**
   - Hit/stand on hand 0
   - Verify hand 1 becomes active
   - Play hand 1 to completion
   - Verify dealer plays only after both hands done

3. **Dual Outcomes**
   - Split pair, win one hand and lose the other
   - Verify payout shows correct total
   - Check balance updated correctly

4. **Edge Cases**
   - Split 8s into two 21s (both win)
   - Split pair, one hand busts (dealer skips when all bust)
   - Split on last hand with limited balance
   - Attempt split without sufficient funds (button disabled)

5. **Animation Integrity**
   - Verify no animation flash on card deals
   - Confirm card positioning correct in both containers
   - Check overlap/spacing on multiple cards per hand

### Automated Checks
- [ ] All existing Blackjack tests pass
- [ ] No ES6 syntax introduced (regex check for `const`/`let`/`=>`)
- [ ] No undefined references to `player.hand` (should all be `player.hands[x]`)
- [ ] localStorage persistence works with new hand structure

---

## ROLLBACK STRATEGY

If implementation becomes problematic:
1. Revert commits to last known good state (tag v1.0.6)
2. Keep documentation of failed approach in CLAUDE.md
3. Simplify to single-outcome-per-hand-set to reduce complexity

---

## DOCUMENTATION UPDATES REQUIRED

- [ ] Update CLAUDE.md with new gotchas for split implementation
- [ ] Update ARCHITECTURE.md section 2 (Main Objects) with `hands[]` structure
- [ ] Update TODO.md to mark split as complete, add new insights
- [ ] Update CHANGELOG.md with v1.1.0 split feature entry

---

## NEXT STEPS (SEQUENTIAL EXECUTION)

After approval, implement in this order:

1. **Data Structure (Task 1)** - 2-3 hours
   - Refactor `player.hand` to `player.hands[]`
   - Update all 10+ reference locations
   - Test basic dealing still works

2. **Hand Index Management (Task 5)** - 2-3 hours
   - Implement actor ID parsing
   - Update `getNextActor()`, `_canPlayerAct()`
   - Single-hand play should still work

3. **Split Mechanics (Task 2)** - 2 hours
   - Add split action to `resolveAction()`
   - Enable split button in `getAvailableActions()`
   - Test split action fires correctly

4. **UI Containers (Tasks 3-4)** - 1 hour
   - Create dual container HTML
   - Add split button
   - Style for side-by-side display

5. **Animation Routing (Task 6)** - 1 hour
   - Update `_handleDealEvent()` to route by hand index
   - Test cards fly to correct containers

6. **Payout Logic (Task 7)** - 1-2 hours
   - Implement dual outcome evaluation
   - Update `resolveRound()` and `calculatePayouts()`
   - Test multiple outcome scenarios

7. **Value Display (Task 8)** - 1 hour
   - Update `_updateValues()` for two hands
   - Test value bubbles update correctly

8. **Integration Testing** - 1-2 hours
   - Full gameplay split → resolution cycle
   - Edge cases and stress testing

**Total: 8-12 hours over 2-3 sessions**

---

## SUCCESS CRITERIA

✅ Split hands feature fully functional
✅ All existing tests pass (no regression)
✅ No ES6 syntax introduced
✅ Animation smooth and glitch-free
✅ Payout logic correct for all scenarios
✅ Documentation updated
✅ Code follows existing patterns (ES5, architecture)

---

**Plan Author:** Claude (C)
**Date:** 2026-02-17
**Status:** Ready for execution
