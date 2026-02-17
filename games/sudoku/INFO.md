# Sudoku - Info

---

## Metadata

| Property | Value |
|----------|-------|
| **Version** | 2.0.0 |
| **Status** | Production |
| **Created** | 2026-01-20 |
| **Last Updated** | 2026-02-13 |
| **Author** | Wayne (User) |
| **Contributors** | Claude (C), Gemini (G), Jules (J) |

---

## Description

One-line summary: Classic 9x9 number-placement puzzle with dual input modes, notes system, and offline-first gameplay.

Longer description: F.O.N.G. Sudoku is a polished, mobile-optimized implementation of the classic logic puzzle. Features include dual input methods (cell-first or number-first), comprehensive pencil marks for candidate tracking, undo/redo history, and four difficulty levels. Built with zero external dependencies for instant offline play.

---

## Features

- **Four Difficulty Levels:** Easy, Medium, Hard, Expert (varies cells removed)
- **Dual Input Modes:** Cell-first (traditional) or Number-first (power user)
- **Notes System:** Pencil marks for tracking candidate numbers
- **Undo/Redo:** Full state history (up to 10 moves)
- **Keyboard Support:** Number keys (1-9), arrow keys (navigation), Backspace (erase), N (toggle notes), Ctrl+Z (undo)
- **Error Highlighting:** Invalid placements highlighted in red
- **Auto-Save:** Progress saved to localStorage (planned, not yet implemented)
- **Mobile Optimized:** 44px touch targets, responsive grid, safe area support

---

## Dependencies

| Library/API | Version | Source | Purpose |
|---|---|---|---|
| N/A | - | - | Zero external dependencies |
| localStorage | Native | Browser | Persist game state (planned) |
| CSS Grid | Native | Browser | 9x9 grid layout |
| DOM API | Native | Browser | Grid rendering & event handling |

**Note:** Zero external CDNs. All assets are local (Rule 1).

---

## Configuration

### Available Settings
- **Difficulty:** Easy (40 clues), Medium (30 clues), Hard (20 clues), Expert (10 clues)
- **Input Mode:** Cell-first (default) or Number-first (planned, not fully implemented)
- **Note Mode:** Toggle pencil marks on/off (N key or button)

---

## Compatibility

| Feature | Status | Notes |
|---------|--------|-------|
| **Browsers** | ✅ Safari 12+, Chrome 50+, Firefox 45+ | ES6 required (class, const/let, Set) |
| **Mobile** | ✅ iOS 12+, Android 6+ | Touch optimized, 44px targets |
| **Offline** | ✅ Yes | Works completely offline |
| **Desktop** | ✅ Yes | Responsive to any width |
| **Landscape** | ✅ Yes | Supports all orientations |
| **Tablets** | ✅ Yes | Optimized for iPad, Android tablets |

**⚠️ ES5 Compatibility Note:**
Current implementation uses ES6 features. For older tablets (Android 4.x, Safari 9), refactor to ES5 is needed.

---

## Performance Baselines

- **Load Time:** ~0.5 seconds
- **Memory (Idle):** ~1 MB
- **Memory (Active):** ~3 MB (with undo history)
- **CPU (Idle):** <1%
- **CPU (Puzzle Generation):** ~30% for 50-200ms (expert difficulty)
- **FPS:** N/A (static grid, no animation)

---

## Technical Stack

- **Language:** JavaScript (ES6) - **NOTE:** Should be ES5 for Rule 2 compliance
- **Rendering:** DOM-based (9x9 grid of divs)
- **State Management:** Object-oriented (Sudoku class)
- **Styling:** CSS Grid, Mobile-first responsive design
- **Architecture:** Backtracking algorithm for generation, validation logic

---

## Related Files

- [README.md](README.md) - User guide & quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical design
- [TODO.md](TODO.md) - Roadmap & issues
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [CLAUDE.md](CLAUDE.md) - Developer notes
- [AGENT.md](AGENT.md) - Session log

---

**Last Updated:** 2026-02-15
**Maintained By:** Claude (C)
