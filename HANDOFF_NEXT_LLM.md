# HANDOFF: Next LLM Development Priorities

**Date:** 2026-02-17
**From:** Claude (C) - Senior Developer
**To:** [Next LLM Assistant]
**Status:** Ready for handoff
**Project:** F.O.N.G. Arcade Family Site

---

## 📋 SESSION SUMMARY (What Was Just Done)

### Completed Tasks
1. ✅ **Sudoku ES6→ES5 Refactor** (6-8 hours equivalent work)
   - Converted class to function constructor
   - Replaced const/let with var throughout
   - Replaced Set with Array for notes
   - Replaced arrow functions with function() {} syntax
   - Game now works on Safari 9, Android 4.x (older tablets)
   - Committed: `b778f2c`

2. ✅ **Hub Global Play Counter** (2-3 hours)
   - Wrote `js/hub-data.js` (strict ES5)
   - Tracks plays across all 19 games via localStorage
   - Displays in header with smart formatting (K+, 99+, etc.)
   - Committed: `b778f2c`

3. ✅ **Sudoku Auto-Save** (3-4 hours)
   - Save game state every 2 seconds during play
   - Restore previous game on page load
   - Handle corrupted data gracefully
   - Auto-clear save when puzzle completed
   - Committed: `af2e23e`

4. ✅ **Hub UX Features** (4-5 hours)
   - Category filter buttons: All | Arcade | Card | Puzzle | Edu
   - Filter game cards dynamically
   - Persist filter preference to localStorage
   - Rotate featured game daily (changes based on day of month)
   - Added `js/hub-filters.js` (strict ES5)
   - Committed: `af2e23e`

5. ✅ **Comprehensive Documentation**
   - Blackjack: CLAUDE.md, ARCHITECTURE.md, TODO.md, CHANGELOG.md
   - Sudoku: CLAUDE.md, ARCHITECTURE.md, TODO.md, CHANGELOG.md, INFO.md
   - Root hub: ARCHITECTURE.md, CLAUDE.md
   - All follow established patterns and ground rules
   - Committed: `d43927a`

### Uncommitted Work
- Blackjack split hands planning: **COMPREHENSIVE PLAN WRITTEN** (saved to `/Users/wayneef/.claude/plans/cuddly-brewing-lobster.md`)

---

## 🎯 NEXT PRIORITY TASKS (In Order)

### **PRIORITY 1: Blackjack Split Hands Feature** ⭐⭐⭐⭐⭐
**Effort:** 8-12 hours (2-3 sessions)
**Impact:** HIGH (signature feature, player-requested)
**Complexity:** MEDIUM-HIGH
**Status:** PLAN READY - See `/Users/wayneef/.claude/plans/cuddly-brewing-lobster.md`

**What needs to be done:**
1. Phase 1: Refactor `player.hand` → `player.hands[]` (affects 10+ locations)
2. Phase 2: Extend turn system to track hand index (`'player1:hand0'` vs `'player1:hand1'`)
3. Phase 3: Add split action mechanics to ruleset
4. Phase 4: Create dual hand UI containers and split button
5. Phase 5: Route card animations to correct containers
6. Phase 6: Calculate outcomes for both hands independently
7. Phase 7: Display values for both hands
8. Phase 8: Integration testing and edge cases

**Files to modify:**
- `games/cards/shared/player.js` (line 9)
- `games/cards/blackjack/ruleset.js` (multiple locations)
- `games/cards/blackjack/index.html` (UI, animation, display logic)

**Key documentation:**
- Full technical plan in: `/Users/wayneef/.claude/plans/cuddly-brewing-lobster.md`
- Critical gotchas in: `games/cards/blackjack/CLAUDE.md`
- Architecture details in: `games/cards/blackjack/ARCHITECTURE.md`

**Critical reminders:**
- ⚠️ **DO NOT change `visibility: hidden` to `opacity` in animation** - causes flash bug
- ⚠️ **Pair detection already exists** - just need to show split button
- ⚠️ **ES5 syntax only** - no const/let, no arrows, no classes
- ⚠️ **Relative paths only** - no `/games/...`

---

### **PRIORITY 2: Sudoku Auto-Pencil Mark Clearing** ⭐⭐⭐⭐
**Effort:** 4-6 hours
**Impact:** MEDIUM (UX polish)
**Complexity:** MEDIUM
**Status:** READY

**What needs to be done:**
When a player places a number in a cell, automatically remove that number from notes in:
- Same row
- Same column
- Same 3x3 box

**Where to add:**
- `games/sudoku/script.js` - Extend `handleInput()` method to call auto-clear on number placement
- Create `autoClearPencilMarks(row, col, value)` function
- Should trigger ONLY when placing value (not notes), not when clearing

**Existing foundation:**
- `updatePeers()` function already exists (lines 372-391) - similar logic
- Can be adapted and extended

---

### **PRIORITY 3: Blackjack Insurance Bet** ⭐⭐⭐
**Effort:** 4-6 hours
**Impact:** MEDIUM (standard casino rule)
**Complexity:** MEDIUM
**Status:** PARTIALLY IMPLEMENTED

**Current state:**
- Logic partially implemented in ruleset
- Insurance detection works (when dealer shows Ace)
- UI NOT implemented

**What needs to be done:**
- Add Insurance button when dealer shows Ace (after initial deal)
- Side bet UI (up to half original bet)
- Calculate 2:1 payout if dealer blackjack
- Integrate with existing payout logic

---

### **PRIORITY 4: Blackjack Sound Effects** ⭐⭐
**Effort:** 3-4 hours
**Impact:** MEDIUM (polish)
**Complexity:** LOW
**Status:** NOT STARTED

**What needs to be done:**
- Add Web Audio API sounds for:
  - Chip placement
  - Card deal
  - Win/lose outcomes
  - Blackjack celebration
- All sounds must be generated (Web Audio API, no CDN)
- Follow existing pattern in codebase (if any)

---

### **PRIORITY 5: Sudoku Timer Display** ⭐⭐
**Effort:** 3-4 hours
**Impact:** MEDIUM (engagement)
**Complexity:** LOW
**Status:** NOT STARTED

**What needs to be done:**
- Add MM:SS timer display in header
- Start on first move (not on puzzle load)
- Stop on win
- Save best times per difficulty to localStorage
- Display on completion modal

---

## 📁 Project Structure (Quick Reference)

```
/Users/wayneef/Documents/GitHub/wayneef84.github.io/
├── index.html                        (root hub)
├── games/
│   ├── cards/
│   │   ├── blackjack/
│   │   │   ├── index.html           (game + UI)
│   │   │   ├── ruleset.js           (game logic)
│   │   │   ├── CLAUDE.md            (critical gotchas)
│   │   │   ├── ARCHITECTURE.md
│   │   │   ├── TODO.md
│   │   │   └── CHANGELOG.md
│   │   └── shared/
│   │       ├── engine.js
│   │       ├── player.js            (where player.hand is defined)
│   │       └── ... (other shared files)
│   └── sudoku/
│       ├── index.html               (game structure)
│       ├── script.js                (game logic - NOW ES5 COMPATIBLE)
│       ├── style.css
│       ├── CLAUDE.md                (gotchas)
│       ├── ARCHITECTURE.md
│       ├── TODO.md
│       └── CHANGELOG.md
├── js/
│   ├── hub-data.js                  (play counter - JUST WRITTEN)
│   └── hub-filters.js               (category filters - JUST WRITTEN)
├── css/
│   └── components/
│       ├── global.css
│       └── card.css                 (has filter button styles now)
└── .claude/
    └── plans/
        └── cuddly-brewing-lobster.md (split hands full plan)
```

---

## 🏗️ Architecture Overview

### Root Hub (index.html)
- Static HTML with CSS component system
- Two new JS modules added:
  - `hub-data.js` - Global play counter hydration
  - `hub-filters.js` - Category filtering + featured game rotation
- Card-based game grid with category tags
- **Critical:** Use relative paths (`./games/...`), not absolute (`/games/...`)

### Blackjack Architecture
- **Shared Engine:** Located in `games/cards/shared/`
- **Player Object:** `player.hand` is a Pile (contains cards)
- **Ruleset:** Implements BlackjackRuleset for game logic
- **UI:** BlackjackUI class handles rendering and animations
- **State Machine:** BETTING → DEALING → PLAYER_TURN → DEALER_TURN → RESOLUTION → PAYOUT → BETTING

### Sudoku Architecture
- **Single Class:** `Sudoku` function constructor (ES5 pattern)
- **Game State:** fullBoard (solution), playerBoard (user input)
- **Validation:** Checks row/col/box conflicts on placement
- **Undo/Redo:** History array with deep copies
- **Auto-Save:** NEW - saves to localStorage every move + every 2 seconds
- **Input Modes:** Cell-first (default) and digit-first (brush mode)

---

## 📚 Key Documentation

### Critical Files to Read Before Starting
1. **CLAUDE.md files** - Each game's CLAUDE.md contains:
   - Critical gotchas (things that broke before)
   - ES5 compatibility requirements
   - Architecture decisions
   - Previous developer notes

2. **GROUND_RULES.md** (root) - Project rules:
   - Rule 1: Local assets only (no CDN)
   - Rule 2: ES5 syntax only (max compatibility)
   - Rule 3: No build tools
   - Rule 4: Relative paths only
   - etc.

3. **Root CLAUDE.md** - Hub-specific:
   - Why relative paths matter
   - ES5 requirement for hub-data.js
   - Featured game rotation approach

### Reference Documentation
- **Blackjack ARCHITECTURE.md** - Full system design, state machine, player object structure
- **Sudoku ARCHITECTURE.md** - Puzzle generation, backtracking solver, validation logic
- **Blackjack TODO.md** - Complete roadmap (split hands at Priority 2)
- **Sudoku TODO.md** - Roadmap including auto-save, auto-clear, hints, timer

---

## 🔐 Critical "DO NOT" List

### Blackjack Specific
❌ **DO NOT** change `visibility: hidden` to `opacity: 0` in card animation
- This causes animation flash bug (cards appear at destination before flying)
- See `games/cards/blackjack/CLAUDE.md` line 42-58

❌ **DO NOT** check dealer blackjack during initial deal
- This prevents insurance from being offered
- Insurance flow handles dealer blackjack detection separately

❌ **DO NOT** allow double down after first move
- Game logic must check `hand.count === 2`
- If player has hit, double down button must be disabled

### Sudoku Specific
❌ **DO NOT** use ES6 syntax in refactored code
- No `class`, `const`, `let`, `=>` arrow functions, `Set`, template literals
- ALL code must be strict ES5 function-based

❌ **DO NOT** use shallow copy for undo history
- Must use `JSON.parse(JSON.stringify())` or manual deep iteration
- Shallow copy corrupts undo/redo

### Hub/General
❌ **DO NOT** use absolute paths like `/games/blackjack/...`
- Must use relative paths: `./games/blackjack/...`
- This is critical for GitHub Pages `/beta` subdirectory deployment

❌ **DO NOT** use fetch() in hub-data.js
- localStorage only - no async operations
- If it ever needs to fetch, must use XMLHttpRequest (ES5 compatible)

---

## 🧪 Testing Checklist Template

Before committing any feature:

**Blackjack (if modifying):**
- [ ] Basic gameplay: place bet → deal → hit/stand → payout
- [ ] Animation: no flash, smooth 60 FPS
- [ ] Mobile: touch controls responsive (44px min)
- [ ] Double down: only available on 2-card hand
- [ ] Bust: dealer doesn't play when player busts
- [ ] Blackjack: instant win, 3:2 payout
- [ ] No ES6 syntax in any modified file

**Sudoku (if modifying):**
- [ ] New game: generates valid puzzle
- [ ] Cell selection: arrow keys work
- [ ] Number input: keyboard and numpad both work
- [ ] Notes mode: toggle with N key
- [ ] Undo: restores previous state correctly
- [ ] Auto-save: persists on page refresh
- [ ] Solution check: marks errors correctly
- [ ] No ES6 syntax in any modified file

---

## 🚀 How to Get Started

1. **Read the plan:** `/Users/wayneef/.claude/plans/cuddly-brewing-lobster.md`
2. **Understand the architecture:**
   - Read `games/cards/blackjack/CLAUDE.md` (gotchas section)
   - Read `games/cards/blackjack/ARCHITECTURE.md` (overview + key concepts)
3. **Explore the code:**
   - `games/cards/shared/player.js` (line 9 - where `hand` is defined)
   - `games/cards/blackjack/ruleset.js` (game logic layer)
   - `games/cards/blackjack/index.html` (UI + animation)
4. **Implement Phase 1:** Data structure refactoring
5. **Test thoroughly:** Use manual test script from CLAUDE.md

---

## 📞 Context & References

### Git Commits to Review
- `b778f2c` - Sudoku ES5 refactor + hub-data.js
- `af2e23e` - Sudoku auto-save + hub filters
- `d43927a` - Documentation suite
- `48dd571` - Previous unified engine docs

### Previous Session Notes
- Last developer: Claude (C)
- Previous work: Sudoku refactor (ES5), hub-data.js, auto-save, category filters
- Game state: Blackjack v1.0.6 (production-ready, split hands next), Sudoku v2.0 (now ES5-compatible)

### Important URLs
- Root hub: `index.html` (19 games, categories, filters, featured rotation)
- Blackjack: `games/cards/blackjack/index.html` (2200 lines, inline JS/CSS)
- Sudoku: `games/sudoku/index.html` (simple structure + script.js)
- Shared engine: `games/cards/shared/` (player.js, engine.js, deck.js, etc.)

---

## 💡 Tips for Success

1. **Start with the plan:** Split hands is complex but well-documented
2. **Test incrementally:** After each phase, verify existing functionality still works
3. **Reference existing code:** Patterns are consistent (ES5, relative paths, event binding)
4. **Document as you go:** Add notes to CLAUDE.md and TODO.md
5. **Commit frequently:** Small commits are easier to review and revert if needed
6. **Check for ES6 syntax:** Use grep to catch `const`, `let`, `=>` before committing

### Common Pitfalls
- ❌ Forgetting to update all 10+ references to `player.hand` → `player.hands[index]`
- ❌ Using `visibility: hidden` vs `opacity` incorrectly in animation
- ❌ Mixing up relative paths (./games vs /games)
- ❌ Writing ES6 in supposedly ES5-compatible code
- ❌ Not testing on actual old browsers/devices

---

## 📊 Project Health

| Component | Status | Notes |
|-----------|--------|-------|
| Root Hub | ✅ Complete | Play counter + filters working, daily featured game rotation |
| Blackjack | 🟡 Ready for split | v1.0.6 solid, split hands plan complete |
| Sudoku | ✅ Complete | Now ES5-compatible, auto-save working |
| Shared Engine | ✅ Stable | v1.0.0, used by Blackjack + War |
| Documentation | ✅ Complete | All games have CLAUDE.md, ARCHITECTURE.md, etc. |

**Next milestone:** Blackjack split hands (8-12 hours) → Sudoku improvements (auto-clear, timer) → Polish tasks

---

## ✅ Handoff Checklist

- [x] Code compiled and tested (all previous commits working)
- [x] Documentation complete (CLAUDE.md, ARCHITECTURE.md for key games)
- [x] Plan written (split hands feature - `cuddly-brewing-lobster.md`)
- [x] No breaking changes in codebase
- [x] Git history clean (all commits have meaningful messages)
- [x] Critical gotchas documented
- [x] Ground rules reviewed (ES5, relative paths, local assets)
- [x] Next developer has clear starting point

---

**Ready for next LLM to begin development!**

Current git branch: `dev`
Latest commit: `af2e23e` (Sudoku auto-save + hub filters)

---

**Created by:** Claude (C)
**Date:** 2026-02-17
**For:** Next Development Session
