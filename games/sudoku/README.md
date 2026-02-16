# F.O.N.G. Sudoku

## What is this?
F.O.N.G. Sudoku is a highly polished, offline-first implementation of the classic number-placement puzzle. Designed for absolute focus, it features dual input methods, a robust notes system, and deep customization.

**Who should play:** Puzzle enthusiasts looking for a clean, distraction-free environment without ads or microtransactions.
**Why it exists:** To showcase how complex, grid-based logic games can be perfectly adapted to mobile-first web interfaces without sacrificing advanced power-user features like undo/redo states and note-taking.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Select your desired difficulty level (Easy, Medium, Hard, or Expert).
3. Tap an empty cell on the 9x9 grid to select it.
4. Tap a number on the bottom keypad to fill the cell.
5. Fill the entire 9x9 grid so that every row, column, and 3x3 box contains the numbers 1 through 9 without repeating.

**Pro Tip:** Tap the "Pencil" icon to toggle Notes Mode. This allows you to input multiple small numbers into a single cell to keep track of possible candidates!

---

## Features
- ✨ **Dual Input System** - Choose between "Cell-First" (select a cell, then a number) or "Number-First" (select a number, then tap multiple cells) input methods.
- 🎮 **Advanced Notes Mode** - Comprehensive pencil marks that automatically clear when a definitive number is placed in the same row, column, or block.
- 📱 **Customizable Zoom & UI** - Mobile-optimized layout featuring custom zoom levels to prevent misclicks on smaller devices.
- 🔄 **State Management** - Full Undo/Redo history and automatic local saving so you never lose your progress if you close the browser.
- ⚡ **Zero Dependencies** - 100% local ES5 code. Plays instantly, completely offline.

---

## How to Play

**Objective:**
Complete the 9x9 grid so that each column, each row, and each of the nine 3x3 sub-grids contain all of the digits from 1 to 9.

**Controls & UI (Min 44px Touch Targets):**
- **Number Pad:** Located at the bottom of the screen. Tap to input numbers.
- **Pencil Toggle:** Switches the number pad between placing final answers (large text) and placing candidate notes (small text).
- **Undo/Redo:** Revert your last move or re-apply it.
- **Erase:** Clears the currently selected cell of all answers and notes.
- **Hint:** (If enabled) Reveals the correct number for the currently selected cell.

**Scoring & Timing:**
- The game tracks your time for each puzzle.
- Mistakes (placing a number that directly conflicts with the board) will be highlighted in red (using the F.O.N.G. `accent-secondary` color).

---

## Status
- **Version:** 2.0.0
- **Status:** Production
- **Last Updated:** 2026-02-13
- **Mobile Optimized:** Yes (Responsive Grid + Safe Area Insets)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** I can't place a number; it keeps adding tiny numbers instead.
- **Solution:** You are currently in "Notes Mode." Tap the Pencil icon located above the number pad to toggle back to standard input mode.

**Issue:** I refreshed the page and my puzzle changed.
- **Solution:** Unless you have placed a move on the board, refreshing the page will generate a brand new puzzle. Once you make a move, your progress is automatically saved to local storage.

### Known Limitations
- **Auto-Solve:** There is no "Solve Entire Board" button implemented at this time.
- **Custom Puzzles:** You cannot currently input a custom Sudoku string from a newspaper to solve it in the app.

---

## Performance & Compatibility
- **Load Time:** Instantaneous. Puzzle generation happens locally in milliseconds.
- **Mobile Support:** Fully responsive. The grid dynamically resizes to fit viewport width while maintaining aspect ratio.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the puzzle generation algorithm works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 state management
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
