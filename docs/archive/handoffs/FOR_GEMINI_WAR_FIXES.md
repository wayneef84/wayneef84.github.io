# Punchlist for Gemini (G): War Game Fixes

**Date:** January 16, 2026
**Handoff from:** Claude Sonnet 4.5
**Priority:** HIGH - Game functionality broken

---

## 🎯 GOAL

Fix War game so it works correctly in endless mode by default, with proper history tracking.

---

## 🔍 PROBLEM SUMMARY

**Console Evidence:**
```
[DEBUG] After round win - P1 points: 1 P2 points: 1 Endless: false
[DECK UPDATE] P1: 26 P2: 26 Total: 52 Graveyard: 0 WarPot: 0
```

**Issues:**
1. ✅ Game is in **non-endless mode** (should default to endless mode)
2. ✅ Deck always shows **52 cards** (should fluctuate as cards go to graveyard)
3. ✅ Graveyard shows **0 cards** (should accumulate won cards)
4. ⚠️ History not displaying match entries (partially fixed, needs verification)

---

## 📝 PUNCHLIST

### Task 1: Fix Endless Mode Default ⭐ CRITICAL

**File:** `/games/cards/war/index.html`

**Location:** Line ~1010 in `_loadSettings()` method

**Current Code:**
```javascript
WarRuleset.neverending = saved.neverending !== undefined ? saved.neverending : true;
```

**Problem:** Despite setting default to `true`, game loads as `false`

**What to Check:**
1. Is `saved.neverending` in localStorage set to `false`?
2. Is the checkbox in settings modal unchecked by default?
3. Is `isEndlessMode` being set correctly from `WarRuleset.neverending`?

**Fix Steps:**
```javascript
// Step 1: In _loadSettings(), force neverending to true if no saved value
if (savedJson) {
    try {
        var saved = JSON.parse(savedJson);
        WarRuleset.deckCount = saved.deckCount || 1;
        WarRuleset.twosHigh = saved.twosHigh || false;
        // FIX: Default to true if undefined
        WarRuleset.neverending = saved.neverending !== false; // Change this line
    } catch(e) {}
} else {
    // FIX: Set defaults if no saved settings
    WarRuleset.neverending = true;
}

// Step 2: Update UI checkboxes
this.el.cfgNeverending.checked = WarRuleset.neverending;

// Step 3: Sync UI flag
this.isEndlessMode = WarRuleset.neverending;
```

**Verify Fix:**
1. Clear localStorage: `localStorage.clear()`
2. Reload game
3. Check console: Should show `Endless: true`
4. Play a few rounds
5. Console should show: `Graveyard: X` (where X > 0)

---

### Task 2: Verify Settings Modal Checkbox Default

**File:** `/games/cards/war/index.html`

**Location:** Line ~528 in HTML (Settings modal)

**Current Code:**
```html
<input type="checkbox" id="cfgNeverending">
```

**Fix:** Add `checked` attribute
```html
<input type="checkbox" id="cfgNeverending" checked>
```

**Why:** HTML checkbox should be checked by default to match JavaScript default

---

### Task 3: Fix Ruleset Default Value

**File:** `/games/cards/war/ruleset.js`

**Location:** Line 40

**Current Code:**
```javascript
neverending: true,
```

**Verify:** This line should already say `true`. If it says `false`, change to `true`.

---

### Task 4: Verify History Display

**File:** `/games/cards/war/index.html`

**What to Check:**

1. **History Entry Creation** (Line ~1063)
   - Console should show: `[HISTORY] Adding entry: {...}`
   - Console should show: `[HISTORY] Total matches: X`

2. **History Display Update** (Line ~1081)
   - Add call to `_updateHistoryDisplay()` after `_addHistoryEntry()`

**Fix Needed:**
```javascript
// In _handleDeckDepletion() around line 790
if (winner) {
    this._addHistoryEntry(winner === 'player1' ? 'win' : 'lose');
    this._updateHistoryDisplay(); // ADD THIS LINE
}

// In _handleGameOver() around line 839
this._addHistoryEntry(winner === 'player1' ? 'win' : 'lose');
this._updateHistoryDisplay(); // ADD THIS LINE
```

**Test:**
1. Play in non-endless mode until deck depletes
2. Check console for `[HISTORY]` logs
3. Open History modal (📊 button)
4. Should see table with match entries

---

### Task 5: Clean Up Debug Logging (Optional)

**File:** `/games/cards/war/index.html`

**After fixes work**, remove or comment out debug logs:
- Line 1072: `console.log('[HISTORY] Adding entry:', entry);`
- Line 1078: `console.log('[HISTORY] Total matches:', this.gameHistory.length);`
- Line 943: `console.log('[DECK UPDATE] ...');`
- Line 765: `console.log('[DEBUG] After round win ...');`

**Or keep them** if Wayne wants them for debugging.

---

## ✅ TESTING CHECKLIST

### Endless Mode (Default):
- [ ] Clear localStorage first: `localStorage.clear()`
- [ ] Reload game
- [ ] Settings modal shows "Endless Mode" **checked**
- [ ] Console shows: `Endless: true`
- [ ] Play 10 rounds
- [ ] Deck count should decrease: 52 → 50 → 48 → ...
- [ ] When player runs out of cards, graveyard shuffles back
- [ ] Deck count jumps back up
- [ ] Wins show: `∞ wins` (infinity symbol)
- [ ] Points show actual numbers

### Non-Endless Mode:
- [ ] Open Settings modal
- [ ] **Uncheck** "Endless Mode"
- [ ] Save settings
- [ ] Console shows: `Endless: false`
- [ ] Play until deck depletes (all cards to one player)
- [ ] Console shows: `[HISTORY] Adding entry: {...}`
- [ ] Message appears: "🎉 You Win! (X points vs Y)" or "Opponent Wins!"
- [ ] Wins counter increments (+1)
- [ ] Points reset to 0
- [ ] New deck dealt (52 cards)
- [ ] Open History modal
- [ ] Table shows the match with point totals

### History Modal:
- [ ] Click History button (📊)
- [ ] Modal opens
- [ ] See table headers: Date | Winner | Your Points | Opp Points
- [ ] See match entries in table rows
- [ ] Stats show: Total Wins, Total Losses, Win Rate

---

## 📊 STATUS REPORT TEMPLATE

**Copy this and fill out when done:**

```markdown
## Gemini Status Report - War Game Fixes

**Date:** [Fill in]
**Time Spent:** [Estimate]
**Completion:** [X/5 tasks]

### ✅ Completed:
- [ ] Task 1: Endless mode default fixed
- [ ] Task 2: Settings checkbox updated
- [ ] Task 3: Ruleset default verified
- [ ] Task 4: History display fixed
- [ ] Task 5: Debug logging cleaned up

### 🐛 Issues Found:
[Describe any problems encountered]

### 🧪 Test Results:
**Endless Mode:**
- Console shows: `Endless: true` ✅/❌
- Graveyard accumulates cards: ✅/❌
- Deck count fluctuates: ✅/❌
- Wins show ∞: ✅/❌

**Non-Endless Mode:**
- Match ends correctly: ✅/❌
- History entry created: ✅/❌
- History displays in modal: ✅/❌
- Stats update: ✅/❌

### 📝 Console Logs (Sample):
```
[Paste relevant console output here]
```

### 🔄 Files Modified:
- `/games/cards/war/index.html` - [What changed]
- `/games/cards/war/ruleset.js` - [What changed]

### ⏭️ Next Steps for Claude:
[What still needs attention, if anything]

### 💬 Questions for Wayne:
[Any clarifications needed]
```

---

## 🎮 FILES TO EDIT

### Primary Files:
1. **`/games/cards/war/index.html`** (Main file)
   - Line ~528: Add `checked` to checkbox
   - Line ~1010: Fix `_loadSettings()` default
   - Line ~790: Add `_updateHistoryDisplay()` call
   - Line ~839: Add `_updateHistoryDisplay()` call

2. **`/games/cards/war/ruleset.js`** (Verify only)
   - Line 40: Confirm `neverending: true`

### Supporting Files (Reference Only):
- `/games/cards/shared/engine.js` - No changes needed
- `WAR_ISSUES.md` - Full problem documentation
- `FOR_GEMINI_WAR_FIXES.md` - This file

---

## 🚀 COMMIT STRATEGY

**When all fixes work:**

```bash
git add games/cards/war/index.html games/cards/war/ruleset.js
git commit -m "fix(war): Set endless mode as default and fix history display

- Default endless mode to true in _loadSettings()
- Check 'Endless Mode' checkbox by default in settings modal
- Add _updateHistoryDisplay() calls after match ends
- Verify ruleset neverending defaults to true

Fixes:
- Deck now decreases as cards go to graveyard
- Graveyard recycles cards in endless mode
- History modal displays match entries
- Wins show ∞ in endless mode

Console now shows:
- Endless: true (default)
- Graveyard: [accumulating count]
- History entries logged

Tested in both endless and non-endless modes

Co-Authored-By: Gemini [model version]"
```

**Then push:**
```bash
git push
```

---

## 🆘 IF YOU GET STUCK

### Debug Commands (Browser Console):

```javascript
// Check current state
console.log('Endless mode:', WarRuleset.neverending);
console.log('UI endless flag:', document.querySelector('#cfgNeverending').checked);

// Check localStorage
console.log('Saved settings:', localStorage.getItem('war_config'));
console.log('Saved history:', localStorage.getItem('war_history'));

// Force endless mode on
WarRuleset.neverending = true;

// Clear settings and reload
localStorage.clear();
location.reload();
```

### Common Issues:

**Problem:** Changes don't take effect
**Solution:** Hard reload (Cmd+Shift+R / Ctrl+Shift+R)

**Problem:** Still shows `Endless: false`
**Solution:** Clear localStorage and reload

**Problem:** History modal is blank
**Solution:** Check if `_updateHistoryDisplay()` is being called

---

## 📖 BACKGROUND CONTEXT

### Why Endless Mode is Important:
- War games typically go on forever
- Cards should recycle, not accumulate in one hand
- Prevents the "waiting for deck to deplete" problem

### How Endless Mode Works:
1. When player wins round → cards go to **graveyard** (not player's hand)
2. When player runs out of cards → **shuffle graveyard** → give all cards back to that player
3. Deck count decreases as cards move to graveyard
4. Deck count increases when graveyard is shuffled back

### History Tracking:
- Each **match** (game ending) creates one history entry
- Match = when deck depletes in non-endless mode
- Entry stores: date, winner, both players' point totals
- Displayed in table format in History modal

---

## 📞 HANDOFF BACK TO CLAUDE

When you're done, create the status report above and commit/push your changes.

Claude will review on next session and continue with:
- Theme system implementation
- Double Down fix (Blackjack)
- Any remaining polish

**Good luck, G! 🚀**

---

**Last Updated:** January 16, 2026 by Claude Sonnet 4.5
**Status:** Ready for Gemini handoff
