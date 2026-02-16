# F.O.N.G. Board Games

## What is this?
The F.O.N.G. Board Games Hub is a collection of classic tabletop games—like Chess and Checkers—recreated digitally for local, pass-and-play matches.

**Who should play:** Two players sitting together who want to play a classic board game but don't have the physical pieces.
**Why it exists:** To provide a pristine, ad-free digital board that enforces strict movement rules, serving as a reliable utility for family game nights.

---

## Quick Start (30 seconds)
1. Launch the hub from the F.O.N.G. Master Hub.
2. Select your desired game (e.g., Chess or Checkers).
3. The board will initialize with the pieces in their starting positions.
4. Player 1 (White/Red) goes first. Tap your piece to select it, then tap a highlighted valid square to move.
5. Pass the device to Player 2 (Black) to take their turn!

**Pro Tip:** If you make a catastrophic mistake, you can tap the "Undo" button to rewind the last turn—but only if your opponent agrees!

---

## Features
- ✨ **Rule Enforcement Engine** - The game logic strictly calculates and highlights only valid moves for the selected piece, preventing illegal plays.
- 🎮 **Pass-and-Play Multiplayer** - Designed specifically for two humans sharing a single device.
- 📱 **Massive Touch Targets** - Grid squares are sized perfectly for mobile tablets, ensuring you never accidentally move a piece to the wrong square.
- ⚡ **Offline First** - Zero dependencies, zero network calls. Plays flawlessly in airplane mode.

---

## How to Play

**Objective:**
Follow the traditional rules of the selected board game to defeat your opponent (e.g., Checkmate the King in Chess, or capture all pieces in Checkers).

**Controls:**
- **Select Piece:** Tap the piece you wish to move. Valid destination squares will highlight.
- **Move Piece:** Tap the highlighted destination square to confirm the move.
- **Deselect:** Tap anywhere else on the board to cancel your piece selection.
- **Reset Board:** Tap the "Restart" icon to clear the board and begin a new match.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (Scalable SVG pieces)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** I can't move my King into a specific square.
- **Solution:** The engine strictly enforces rules, including preventing you from moving a King into a square that is currently under attack by an enemy piece (moving into check).

### Known Limitations
- **No CPU Opponent:** Currently, these are strictly pass-and-play games for two humans. There is no AI implementation.
- **No Online Multiplayer:** Games cannot be played across different devices over the network.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Fully optimized. Board scales to fit screen dimensions.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the 2D grid array translates to DOM elements
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 logic
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
