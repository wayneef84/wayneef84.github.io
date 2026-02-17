# Sudoku - Developer Notes

**For the next Claude (or any developer) working on this project**

---

## Purpose & Philosophy

**Why This Exists:**
Classic Sudoku puzzle game for the Fong Family Arcade. Designed for mental exercise, logic training, and relaxation. Showcases how complex grid-based logic games can run entirely offline with zero dependencies.

**Design Philosophy:**
Simplicity over features. Implements core Sudoku mechanics (number placement, validation, notes) without unnecessary complexity. Prioritizes mobile-first responsive design and keyboard accessibility.

**Core Value:**
Demonstrates a clean, self-contained puzzle implementation using backtracking algorithms. No external libraries needed—everything from board generation to validation is custom-built.

---

## Architecture Summary

Sudoku uses a single `Sudoku` class to encapsulate all game logic. The backtracking algorithm generates valid puzzles, and the masking function creates varying difficulty levels by removing cells. The UI is pure DOM-based (81 div elements for cells, CSS Grid for layout).

**Main Components:**
1. **Puzzle Generator** - Backtracking solver fills 9x9 grid with valid solution
2. **Puzzle Masker** - Removes cells based on difficulty (40 for easy, 10 for expert)
3. **Validation Engine** - Checks row, column, and 3x3 box conflicts
4. **UI Renderer** - DOM-based grid with click handlers and keyboard navigation

**Key Systems:**
- State Machine: IDLE → CELL_SELECTED → NUMBER_PLACED → VALIDATION → IDLE
- Rendering: DOM (9x9 grid of divs, CSS Grid layout)
- Input: Click (cell selection) + Click (number selection) or Keyboard (arrow keys + number keys)

See [ARCHITECTURE.md](ARCHITECTURE.md) for full technical details.

---

## ⚠️ Critical Fixes / Gotchas

### DO NOT REGRESS THESE

**Gotcha 1: ES6 Syntax Violates Rule 2**
- ❌ What breaks if you forget: Game crashes on Safari 9, Android 4.x, older tablets
- ✅ How to prevent it: Refactor to ES5 (var, function constructors, no class/const/let/Set/arrows)
- 📍 Location: script.js (entire file)
- Example:
  ```javascript
  // WRONG - breaks Safari 9:
  class Sudoku {
    constructor() {
      this.notes = new Set();
    }
  }

  // RIGHT - works everywhere:
  function Sudoku() {
    this.notes = [];  // Use Array instead of Set
  }
  ```

**Gotcha 2: Backtracking Solver Performance**
- ❌ What breaks if you forget: Expert puzzles may take 500ms+ to generate, feels like freeze
- ✅ How to prevent it: Optimize solver with constraint propagation or pre-generate puzzles
- 📍 Location: script.js, solveBoard function (lines ~150-200)
- Example:
  ```javascript
  // CURRENT - brute force backtracking:
  function solveBoard(board) {
    for (var row = 0; row < 9; row++) {
      for (var col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (var num = 1; num <= 9; num++) {  // Try all 9 numbers
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveBoard(board)) return true;
              board[row][col] = 0;  // Backtrack
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  // OPTIMIZED - use constraint propagation (future):
  // Maintain list of candidates per cell, prune on each placement
  // Reduces search space from 9^m to ~9^(m/3)
  ```

**Gotcha 3: Deep Copy for Undo History**
- ❌ What breaks if you forget: Undo modifies wrong state, corrupts history
- ✅ How to prevent it: Always deep copy playerBoard before saving to history
- 📍 Location: script.js, saveState function
- Example:
  ```javascript
  // WRONG - shallow copy (shares references):
  this.history.push(this.playerBoard);

  // RIGHT - deep copy (independent state):
  this.history.push(JSON.parse(JSON.stringify(this.playerBoard)));

  // BETTER - manual deep copy (avoids JSON overhead):
  var copy = [];
  for (var r = 0; r < 9; r++) {
    copy[r] = [];
    for (var c = 0; c < 9; c++) {
      copy[r][c] = {
        value: this.playerBoard[r][c].value,
        isGiven: this.playerBoard[r][c].isGiven,
        notes: this.playerBoard[r][c].notes.slice(),  // Copy array
        isError: this.playerBoard[r][c].isError
      };
    }
  }
  this.history.push(copy);
  ```

**Gotcha 4: Grid Selection Doesn't Clear**
- ❌ What breaks if you forget: Selected cell persists across new games, confusing UI
- ✅ How to prevent it: Set `this.selectedCell = null` in newGame()
- 📍 Location: script.js, newGame function
- Example:
  ```javascript
  // WRONG - selection persists:
  function newGame() {
    this.generateBoard();
    this.maskBoard();
    this.render();  // Old selectedCell still highlighted
  }

  // RIGHT - clear selection:
  function newGame() {
    this.generateBoard();
    this.maskBoard();
    this.selectedCell = null;  // Clear selection
    this.render();
  }
  ```

---

## Last Session Notes

### Most Recent Work (Top Entry)

**Date:** 2026-02-15
**Agent:** Claude (C)

**What Was Done:**
- Created comprehensive documentation suite (ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE)
- Identified ES6 compliance issue (violates Rule 2)
- Documented backtracking solver performance concern

**Context for Next Session:**
- Current state: Game is production-ready (v2.0.0), all core features implemented
- Next logical step: Refactor to ES5 for older tablet support (Priority 2 in TODO.md)
- Blockers: None. ES5 refactor is mechanical but time-consuming (6-8 hours)

**Code Changes:**
- No code changes this session (documentation only)

**Testing Performed:**
- No testing required (documentation session)

---

### Previous Session

**Date:** 2026-02-13
**Agent:** Claude (C)
**Work:** Added notes system, undo/redo, keyboard shortcuts, error highlighting

---

## Common Mistakes (Learn from Experience)

1. **Mistake: Using Set for notes (ES6 feature)**
   - Impact: Crashes on Safari 9, Android 4.x
   - Prevention: Use Array instead, check for duplicates manually

2. **Mistake: Shallow copying playerBoard for undo**
   - Impact: Undo modifies wrong state, corrupts history
   - Prevention: Deep copy with JSON.parse(JSON.stringify()) or manual iteration

3. **Mistake: Not clearing selectedCell on new game**
   - Impact: Old selection persists, confusing UI
   - Prevention: Set `selectedCell = null` in newGame()

4. **Mistake: Allowing note placement on given cells**
   - Impact: User can "overwrite" clues with notes, breaks game logic
   - Prevention: Check `cell.isGiven` before allowing note placement

---

## Key Code Locations

**Critical Code Paths:**

| Function | File | Lines | Purpose | Why Critical |
|----------|------|-------|---------|--------------|
| generateBoard | script.js | 122-150 | Create valid 9x9 solution | Puzzle generation foundation |
| solveBoard | script.js | 150-200 | Backtracking solver | Performance bottleneck on Expert |
| maskBoard | script.js | 250-300 | Remove cells for difficulty | Determines puzzle difficulty |
| isValid | script.js | 300-350 | Validate number placement | Core Sudoku rule enforcement |
| checkSolution | script.js | 350-400 | Validate complete board | Win condition detection |

---

## Testing Before Commit

**Checklist:**
- [ ] Basic gameplay works (select cell, place number, validate)
- [ ] Mobile touch controls respond (cells, buttons)
- [ ] Animation timing correct (N/A - static grid)
- [ ] Performance acceptable (<2s load, <500ms generation)
- [ ] Documentation updated (CHANGELOG, TODO if adding features)
- [ ] No ES6+ syntax (var, not const/let; function, not =>; Array, not Set)
- [ ] Relative paths only (no /games/..., use ../../)
- [ ] No external CDNs (all assets local)
- [ ] Notes mode toggles correctly
- [ ] Undo/redo works correctly (state restoration)
- [ ] Keyboard navigation works (arrow keys, number keys)

**Manual Test Script:**
1. Load game → Grid shows 9x9 cells, difficulty selector visible
2. Select difficulty → Click "Medium", click "New Game"
3. Click cell → Cell highlights (blue border)
4. Press number key → Number appears in cell
5. Press "N" → Toggle notes mode (button turns green)
6. Press number key → Small note appears in cell
7. Press arrow keys → Selection moves correctly
8. Press Backspace → Cell clears (value and notes)
9. Press Ctrl+Z → Undo last move (state restored)
10. **Edge case:** Fill board with invalid solution → "Check Solution" shows error
11. **Edge case:** Fill board with valid solution → "Congratulations!" message
12. **Performance:** Generate Expert puzzle → Should complete in <500ms

---

## Performance Baselines

Keep these in mind when optimizing:

- **Load Time Target:** <2 seconds
- **Memory Target:** <10 MB
- **Idle CPU:** <1%
- **Active CPU:** <50% (during generation)
- **FPS:** N/A (static grid)

Current baselines (see [INFO.md](INFO.md)):
- Load: ~0.5s
- Memory: ~3 MB (with undo history)
- CPU: ~30% during generation (50-200ms)

If performance degrades significantly, investigate:
- Backtracking solver (currently O(9^m), can optimize to ~O(9^(m/3)) with constraint propagation)
- Undo history memory (currently ~3 MB for 10 states, can reduce to diffs instead of full copies)
- DOM rendering (currently 81 divs, could optimize with virtual DOM if needed)

---

## Related Resources

- [README.md](README.md) - User guide & game rules
- [ARCHITECTURE.md](ARCHITECTURE.md) - Full technical design
- [TODO.md](TODO.md) - What needs doing
- [INFO.md](INFO.md) - Quick facts
- [CHANGELOG.md](CHANGELOG.md) - Version history

---

## Questions I'd Ask Next Developer

1. **When refactoring to ES5:** "Did you test on actual Safari 9 device or just polyfill? Real devices behave differently."
2. **Before optimizing solver:** "Did you profile first? Is generation actually a bottleneck for users, or just theoretical?"
3. **On auto-save implementation:** "How will you handle corrupted localStorage data? What's the fallback?"
4. **On uniqueness validation:** "Is it worth 4-6 hours to fix a 1-in-100 edge case? What's the user impact?"

---

## The Next Step

[For next developer working on this]

If you're here, the game is production-ready with notes, undo, and keyboard controls. Here's what you probably should do next:

1. **Quick refresh:** Re-read this CLAUDE.md and [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Understand:** Run the game locally, solve a few puzzles, understand the current state
3. **Check:** Read [TODO.md](TODO.md) - Priority 2 suggests ES5 refactor or auto-save next
4. **Plan:** Before coding, document your approach in TODO.md
   - **If ES5 refactor:** Convert class → function constructor, const/let → var, Set → Array, arrows → function
   - **If auto-save:** Define localStorage schema, handle edge cases (corrupted data, quota exceeded)
5. **Build:** Code your change incrementally
   - ES5: Convert one module at a time, test after each conversion
   - Auto-save: Implement save first, then restore, then edge case handling
6. **Document:** Update TODO/CHANGELOG/AGENT.md as you go
7. **Test:** Verify on mobile devices (iPhone, Android), not just desktop
8. **Commit:** With message like `refactor: Convert to ES5 for older tablet support` or `feat: Add auto-save to localStorage`

Good luck! Feel free to update this file with lessons you learn.

---

**Last Updated:** 2026-02-15
**Updated By:** Claude (C)
**Status:** Ready for next developer
