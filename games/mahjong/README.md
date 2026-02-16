# F.O.N.G. Mahjong

## What is this?
F.O.N.G. Mahjong is a soothing, single-player Mahjong Solitaire tile-matching game.

**Who should play:** Puzzle fans, adults looking to unwind, and anyone who enjoys slow-paced, methodical pattern recognition games.
**Why it exists:** To provide a pristine, ad-free classic game experience for the family. It utilizes pseudo-3D CSS rendering to create a tactile sense of depth without relying on heavy WebGL frameworks, ensuring it runs beautifully on older tablets.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Select your desired tile layout (e.g., The Classic Turtle, Fortress, or Arena).
3. Scan the board for two matching tiles that are "open" (free to move).
4. Tap the first tile to highlight it, then tap the matching tile to remove both from the board.
5. Clear all 144 tiles from the board to win!

**Pro Tip:** Always prioritize removing tiles from the highest layers and the longest rows first to unlock the maximum number of hidden tiles beneath them!

---

## Features
- ✨ **3D Tile Rendering** - Tiles feature a thick, pseudo-3D edge achieved through layered CSS shadows, giving the board a physical, tactile feel.
- 🎮 **Custom F.O.N.G. Symbols** - In addition to classic Chinese characters and bamboo, the game features custom, high-contrast symbols designed specifically for readability on smaller screens.
- 📱 **Mobile Touch Controls** - Generous touch hitboxes ensure that tapping a tile on a crowded 3D board accurately selects the intended piece.
- 🔄 **Solvable Board Generation** - The internal engine validates the tile distribution to ensure the board is actually solvable before you start.
- ⚡ **Undo & Shuffle** - Get stuck? Use the Undo button to reverse your last move, or Shuffle to randomly redistribute the remaining tiles.

---

## How to Play

**Objective:**
Remove all 144 tiles from the board by matching identical pairs.

**Rules:**
- You can only match tiles that are **"Open."**
- A tile is "Open" if it satisfies TWO conditions:
  1. There is no other tile sitting directly on top of it.
  2. It is free to slide out either exactly to the left OR exactly to the right (it cannot be blocked on both horizontal sides).
- **Exceptions:** Any two "Season" tiles can be matched together, and any two "Flower" tiles can be matched together, even if their specific artwork differs.

**Controls:**
- **Select:** Tap/Click an open tile. It will highlight to indicate it is selected.
- **Match:** Tap/Click a second matching open tile to clear the pair.
- **Deselect:** Tap a highlighted tile again to unselect it.
- **Hint:** Tap the lightbulb icon to highlight a valid pair (adds a time penalty).

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (3D hitboxes mapped for touch)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** I tap a matching tile, but nothing happens.
- **Solution:** Ensure both tiles are genuinely "Open." If a tile has another tile bordering it on both the immediate left and the immediate right, it is locked. Similarly, even if it looks free on the sides, make sure there isn't a tile resting on top of it.

**Issue:** The game says "No More Moves."
- **Solution:** You have reached a dead end where no more open pairs exist. You can either use the "Undo" button to backtrack and try a different path, or use the "Shuffle" button to mix up the remaining tiles on the board to force new matches.

### Known Limitations
- **Tile Sets:** The game currently does not support uploading your own custom tile artwork.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Fully functional. The board scales dynamically to fit the viewport width.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the 3D grid layering array works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 array manipulation
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
