# War Game Issues to Fix

**Date:** January 16, 2026
**Status:** Identified from console logs

---

## Issue 1: Endless Mode Not Defaulting Correctly

**Current Behavior:**
- Console shows `Endless: false`
- Graveyard shows 0 cards
- Deck stays at 52 cards (cards go back to winner's hand)

**Expected Behavior:**
- Should default to `Endless: true` (neverending mode)
- Cards should go to graveyard when won
- Deck count should fluctuate as cards move to graveyard and back

**Root Cause:**
`WarRuleset.neverending` is defaulting to `false` instead of `true`

**Fix Location:**
- `games/cards/war/ruleset.js` line 40: `neverending: true` (verify this is set)
- `games/cards/war/index.html` - Check `_loadSettings()` method
- Verify `isEndlessMode` is being set correctly from `WarRuleset.neverending`

**Console Evidence:**
```
[DEBUG] After round win - P1 points: 1 P2 points: 1 Endless: false
[DECK UPDATE] P1: 26 P2: 26 Total: 52 Graveyard: 0 WarPot: 0
```

---

## Issue 2: History Not Displaying Matches

**Current Behavior:**
- History modal doesn't show individual match entries
- Total wins/losses may be calculating but table is empty

**Expected Behavior:**
- Table with columns: Date | Winner | Your Points | Opp Points
- Shows last 50 matches
- Each win should create a new row

**Partially Fixed:**
- ✅ History entry now called BEFORE points reset (was getting 0 points)
- ✅ Console logging added: `[HISTORY] Adding entry:` and `[HISTORY] Total matches:`

**Still Need to Verify:**
1. Check console for `[HISTORY]` logs when match ends
2. Verify localStorage has `war_history` data
3. Check if `_updateHistoryDisplay()` is being called
4. Verify history modal is showing the table HTML

**Debug Steps:**
1. Play in non-endless mode until deck depletes
2. Check console for history logs
3. Open History modal and check if table appears
4. Check browser console: `localStorage.getItem('war_history')`

---

## Issue 3: Total Stats Not Tracking Correctly

**Current Issue:**
User mentioned "total rounds won" not tracking

**Need Clarification:**
What should be tracked in total stats?
- Total wins across all games? (Currently tracked)
- Total points scored across all games? (Not currently tracked)
- Total individual rounds won? (Currently "points" per game)

**Current Stats Tracked:**
- Left indicator: Total Wins (games won)
- Right indicator: Points (rounds won in current game)

**Possible Enhancement:**
Add a third stat: "Total Points Earned" (cumulative across all games)?

---

## Quick Fixes Needed (Priority Order)

### 1. Fix Endless Mode Default (HIGH)
```javascript
// In war/index.html _loadSettings():
WarRuleset.neverending = saved.neverending !== undefined ? saved.neverending : true;
```

Currently it's correctly set, but might be getting overridden. Check:
- Is settings modal checkbox checked by default?
- Is localStorage saving false on first load?

### 2. Verify History is Working (MEDIUM)
- Add `_updateHistoryDisplay()` call after `_addHistoryEntry()`
- Check if history modal opens correctly
- Verify table HTML is being generated

### 3. Clarify Stats Requirements (LOW)
- Need user input on what "total rounds won" means
- Implement if different from current "points" tracking

---

## Testing Checklist

### Endless Mode:
- [ ] Open War game fresh (clear localStorage first)
- [ ] Check Settings modal - is "Endless Mode" checked?
- [ ] Play a few rounds
- [ ] Console should show `Endless: true`
- [ ] Graveyard count should increase as rounds are won
- [ ] Deck count should decrease, then jump back up when graveyard shuffles

### Non-Endless Mode:
- [ ] Uncheck "Endless Mode" in settings
- [ ] Play until deck depletes
- [ ] Should see `[HISTORY] Adding entry:` in console
- [ ] Should see match end message with point totals
- [ ] Open History modal - should show the match in table
- [ ] Wins counter should increment

### History Modal:
- [ ] Click History button (📊)
- [ ] Should see table with headers: Date | Winner | Your Points | Opp Points
- [ ] Recent matches should appear in table
- [ ] Win rate should update

---

## Console Commands for Debugging

```javascript
// Check endless mode status
console.log('Endless mode:', WarRuleset.neverending);

// Check history
console.log('History:', localStorage.getItem('war_history'));

// Force endless mode on
WarRuleset.neverending = true;

// Clear history
localStorage.removeItem('war_history');

// Clear all settings
localStorage.clear();
```

---

## Next Steps

1. Fix endless mode default
2. Test with console logs
3. Verify history entries are being created
4. Check history modal display
5. Get user clarification on "total rounds won" requirement
