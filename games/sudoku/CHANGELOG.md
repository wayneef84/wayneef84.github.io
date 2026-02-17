# Sudoku - Changelog

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)

---

## [2.0.0] - 2026-02-13

### Added
- **Notes System:** Comprehensive pencil marks for candidate tracking
  - Toggle notes mode with "N" key or Notes button
  - Place multiple candidate numbers in single cell
  - Notes displayed as small grid (9 mini-cells)
- **Undo/Redo:** Full state history (up to 10 moves)
  - Ctrl+Z or Undo button to revert moves
  - State saved as deep copy of playerBoard
- **Keyboard Shortcuts:**
  - Number keys (1-9) to place numbers
  - Arrow keys to navigate grid
  - Backspace/Delete to erase cell
  - N to toggle notes mode
  - Ctrl+Z to undo
- **Error Highlighting:** Invalid placements highlighted in red
  - Real-time validation on number placement
  - Checks row, column, and 3x3 box conflicts

### Changed
- ⚠️ **BREAKING:** Refactored cell data structure from simple numbers to Cell objects
  - Old: `playerBoard[r][c] = number`
  - New: `playerBoard[r][c] = { value, isGiven, notes, isError }`
- Improved grid rendering (thicker 3x3 box borders)
- Enhanced mobile touch targets (44x44px minimum)

### Fixed
- Fixed cell selection not clearing on new game
- Fixed undo button staying active when history empty
- Fixed error highlighting not clearing when cell erased

---

## [1.0.0] - 2026-01-20

### Added
- Initial production release of Sudoku
- Core gameplay: 9x9 grid number-placement puzzle
- Four difficulty levels: Easy (40 clues), Medium (30 clues), Hard (20 clues), Expert (10 clues)
- Backtracking algorithm for puzzle generation
- Puzzle validation (check solution)
- Reset board functionality
- New game generation
- Mobile responsive design (portrait and landscape)
- ES6 implementation (class-based architecture) - **NOTE:** Violates Rule 2 (Strict ES5)
- Touch-optimized UI (44x44px cell targets)
- Safe area support for notch devices
- Comprehensive documentation suite

### Fixed
- N/A (initial release)

### Changed
- N/A (initial release)

### Removed
- N/A (initial release)

### Known Issues
- No auto-save to localStorage (progress lost on refresh)
- Notes don't auto-clear when number placed in row/column/box
- ES6 syntax not compatible with older tablets (Safari 9, Android 4.x)
- Expert difficulty generation may take 200-500ms on slow devices

---

## [0.9.0] - 2026-01-15 (Beta)

### Added
- Beta version for internal testing
- Basic grid rendering (9x9 cells)
- Puzzle generation with backtracking solver
- Number input via numpad
- Difficulty selector (Easy, Medium, Hard)

### Fixed
- Fixed grid layout breaking on small screens (<350px)
- Fixed puzzle validation allowing invalid solutions
- Fixed backtracking solver infinite loop on certain patterns

### Changed
- Modified difficulty levels (removed 35 clues, added Expert with 10 clues)
- Improved cell selection visual feedback (blue border)

---

## Format Guide

### Version Numbering (Semver)
- **MAJOR** (X.0.0): Breaking changes, API changes
- **MINOR** (0.X.0): New features (backwards compatible)
- **PATCH** (0.0.X): Bug fixes (backwards compatible)

### Date Format
ISO 8601: YYYY-MM-DD

### Sections (Use Headings)
- **Added:** New features
- **Changed:** Changes to existing functionality
- **Deprecated:** Features to be removed soon
- **Removed:** Removed features or files
- **Fixed:** Bug fixes
- **Security:** Security improvements

### Important Markers
- ⚠️ **BREAKING CHANGE:** Highlight incompatibilities
- 🔒 **SECURITY:** Highlight security fixes
- 📱 **MOBILE:** Mobile-specific changes

### Example Entry Format
```markdown
## [2.1.0] - 2026-03-01

### Added
- Timer display showing solve time (MM:SS format)
- Statistics dashboard tracking lifetime puzzles solved
- Auto-save to localStorage (progress preserved on refresh)

### Changed
- ⚠️ **BREAKING:** Refactored to ES5 syntax for older tablet support
  - Replaced `class` with function constructor
  - Replaced `const`/`let` with `var`
  - Replaced `Set` with `Array` for notes

### Fixed
- 📱 Fixed grid not fitting on screens <320px width
- Fixed undo history exceeding memory limit on long sessions

### Security
- 🔒 Sanitized localStorage input to prevent XSS via corrupted save data
```

---

**Last Updated:** 2026-02-15
**Maintained By:** Claude (C)
