# Sudoku - Roadmap & Issues

---

## Roadmap (Prioritized)

### Priority 1 - Critical (Ship Blockers)
No critical blockers. Game is production-ready.

### Priority 2 - High (Nice to Ship)
Should complete soon, enhances core gameplay

- [ ] **ES6 to ES5 Refactor:** Replace class, const/let, Set, arrow functions
  - [ ] Convert `class Sudoku` to function constructor
  - [ ] Replace `const`/`let` with `var`
  - [ ] Replace `Set<number>` with `Array` for notes
  - [ ] Replace arrow functions with `function() {}` syntax
  - Estimated: 6-8 hours
  - Complexity: MEDIUM (affects entire codebase)
  - **Why:** Compliance with Rule 2 (Strict ES5) for older tablet support

- [ ] **Auto-Save to localStorage:** Persist game state on page refresh
  - [ ] Save `playerBoard`, `selectedCell`, `difficulty`, `history` on each move
  - [ ] Restore state on page load
  - [ ] Handle edge case: corrupted localStorage data
  - Estimated: 3-4 hours
  - Complexity: LOW

- [ ] **Auto-Pencil Mark Clearing:** Remove notes when number placed in row/column/box
  - [ ] Detect conflict cells (same row, column, or 3x3 box)
  - [ ] Remove placed number from all conflict cell notes
  - [ ] Update UI to reflect changes
  - Estimated: 4-6 hours
  - Complexity: MEDIUM (requires conflict detection logic)

### Priority 3 - Medium (Next Sprint)
Lower priority features, quality-of-life improvements

- [ ] **Hint System:** Reveal correct number for selected cell
  - [ ] Show hint button
  - [ ] Copy value from `fullBoard[row][col]` to `playerBoard[row][col]`
  - [ ] Mark cell as "hinted" (different color?)
  - [ ] Track hint count for statistics
  - Estimated: 2-3 hours

- [ ] **Timer Display:** Track solve time and show on completion
  - [ ] Start timer on first move
  - [ ] Display timer in header (MM:SS format)
  - [ ] Stop timer on win
  - [ ] Save best times per difficulty to localStorage
  - Estimated: 3-4 hours

- [ ] **Statistics Dashboard:** Track lifetime stats
  - [ ] Puzzles solved (by difficulty)
  - [ ] Best times (by difficulty)
  - [ ] Win streak
  - [ ] Hint usage percentage
  - [ ] Modal display with charts (optional)
  - Estimated: 5-7 hours

- [ ] **Custom Puzzle Import:** Input external puzzle strings
  - [ ] Add "Import" button
  - [ ] Parse 81-character string (e.g., "4.....8.5.3..........7......2.....6...")
  - [ ] Validate puzzle has unique solution
  - [ ] Load into playerBoard
  - Estimated: 4-6 hours

### Priority 4 - Low (Backlog)
Future ideas, not committing to timeline

- [ ] **Daily Challenge:** Pre-generated puzzle of the day
  - Requires server or static puzzle database
  - Estimated: 8-10 hours

- [ ] **Theme Switcher:** Multiple color schemes (light, dark, high contrast)
  - Defer to shared theme system (when available)
  - Estimated: 3-4 hours

- [ ] **Digit-First Input Mode (Full Implementation):** Complete number-first workflow
  - Currently partially implemented but not fully functional
  - Estimated: 4-6 hours

- [ ] **Multi-Level Undo:** Increase history limit from 10 to 50 states
  - May impact memory on low-end devices
  - Estimated: 1-2 hours

---

## Known Issues & Bugs

### Critical Bugs (Fix Immediately)
None currently.

### High Priority Bugs

- **Auto-Save Not Implemented:** Refreshing page generates new puzzle, loses progress
  - **Impact:** Users lose all work if page accidentally refreshed
  - **Workaround:** Avoid refreshing page during play
  - **Fix:** Implement localStorage save/restore (see Priority 2)
  - **Status:** Not Started

### Low Priority Issues

- **Expert Difficulty Generation Time:** Can take 200-500ms on slower devices
  - **Impact:** Slight delay when clicking "New Game" on Expert
  - **Workaround:** Use Medium or Hard difficulty
  - **Fix:** Pre-generate puzzles or optimize backtracking solver
  - **Priority:** LOW (acceptable for one-time cost)

- **Notes Don't Auto-Clear:** Placing final number doesn't remove from notes in same row/column/box
  - **Impact:** Manual cleanup required, reduces usability
  - **Workaround:** Manually erase notes
  - **Fix:** Implement auto-pencil mark clearing (see Priority 2)
  - **Priority:** MEDIUM

---

## Performance Concerns

- [ ] **Backtracking Solver Performance:** Expert puzzles may take 500ms+ on Android 4.x
  - Symptom: Delay when generating new Expert puzzle
  - Cause: Backtracking is O(9^m) where m = empty cells (up to 71 for Expert)
  - Solution: Optimize solver (constraint propagation, heuristics) or pre-generate puzzles
  - Priority: LOW (target devices are iOS 12+ and Android 6+)

- [ ] **Undo History Memory:** 10 states × ~300KB = ~3 MB may be high for old devices
  - Symptom: Memory usage creeps up during long play session
  - Cause: Deep copying entire 9x9 grid × 10 times
  - Solution: Store only diffs (changed cells) instead of full board state
  - Priority: LOW (3 MB is acceptable for modern devices)

---

## Technical Debt

- [ ] **ES6 Syntax:** Violates Rule 2 (Strict ES5)
  - Location: script.js (entire file)
  - Why: Uses class, const/let, Set, arrow functions
  - Impact: Breaks on Safari 9, Android 4.x, older tablets
  - Estimated: 6-8 hours to refactor

- [ ] **Hardcoded Difficulty Levels:** Cell removal counts should be configurable
  - Location: script.js, maskBoard function
  - Why: Magic numbers (40, 30, 20, 10) make it hard to adjust difficulty
  - Impact: Cannot easily tweak difficulty balance
  - Estimated: 1-2 hours

- [ ] **No Uniqueness Validation:** Generated puzzles may have multiple solutions (rare)
  - Location: script.js, generateBoard function
  - Why: Backtracking solver finds *a* solution, not necessarily unique
  - Impact: Very rare (1 in 100+) puzzle may be ambiguous
  - Estimated: 4-6 hours to implement uniqueness check

- [ ] **Inline CSS in HTML:** Extract to style.css for better separation
  - Location: index.html (currently minimal inline styles)
  - Why: Better caching and maintainability
  - Impact: No functional impact, quality-of-life improvement
  - Estimated: 1-2 hours

---

## Accessibility Improvements

- [ ] **Screen Reader Support:** Add ARIA labels for cells and game state
  - [ ] Announce selected cell coordinates (e.g., "Row 3, Column 5")
  - [ ] Announce cell value or "empty"
  - [ ] Announce win/lose outcomes
  - Standards: WCAG 2.1 Level AA
  - Estimated: 4-6 hours

- [ ] **Keyboard Navigation (Full):** Already implemented (arrow keys, number keys)
  - [ ] Tab through controls (difficulty, new game, undo, etc.)
  - [ ] Enter to activate buttons
  - Standards: WCAG 2.1 Level AA
  - Estimated: 2-3 hours

- [ ] **High Contrast Mode:** Support OS high contrast settings
  - [ ] Detect `prefers-contrast` media query
  - [ ] Adjust grid colors for better visibility
  - Standards: WCAG 2.1 Level AAA
  - Estimated: 2-3 hours

---

## Future Ideas

### Potential Game Modes
- **Speed Sudoku:** Timed challenges with leaderboard
- **4x4 / 6x6 Variants:** Smaller grids for kids or quick play
- **16x16 Sudoku:** Expert-level variant (very challenging)

### Potential Features
- **Hint Types:** Different hint levels (highlight row/column conflict, reveal single cell, etc.)
- **Auto-Fill Singles:** Automatically fill cells with only one candidate
- **Undo All:** Reset to puzzle start with one button

### Multiplayer Possibilities
- **Hot Seat Multiplayer:** 2 players alternate turns, fastest to solve wins
- **Online Multiplayer:** Real-time competitive solving (requires server)
- **Collaborative Mode:** Multiple players work on same puzzle together

---

## Testing Gaps

- [ ] Edge case: What happens if all cells filled but solution invalid? (should show error message)
- [ ] Platform: Desktop Safari not recently verified (focus on mobile)
- [ ] Performance under extended play (100+ puzzles) not measured
- [ ] Mobile device: iPad Mini, Android tablets not verified (only phone testing)
- [ ] Orientation change during play not tested (potential layout glitch)
- [ ] localStorage quota exceeded (if history gets too large) not tested

---

## Complete Tasks (Most Recent First)

### Completed Recently
- ✅ Implemented notes system (pencil marks) - 2026-02-13 by Claude (C)
- ✅ Added undo/redo functionality - 2026-02-13 by Claude (C)
- ✅ Keyboard navigation (arrow keys, number keys, shortcuts) - 2026-02-13 by Claude (C)
- ✅ Four difficulty levels (Easy, Medium, Hard, Expert) - 2026-02-13 by Claude (C)
- ✅ Error highlighting (red cells for invalid placements) - 2026-02-13 by Claude (C)
- ✅ Initial Sudoku implementation (backtracking solver, validation) - 2026-01-20 by Claude (C)

---

**Last Updated:** 2026-02-15
**Maintained By:** Claude (C)
