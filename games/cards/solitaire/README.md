# F.O.N.G. Solitaire (Klondike)

## What is this?

F.O.N.G. Solitaire is a digital implementation of classic Klondike Solitaire, powered by the robust F.O.N.G. Shared Card Engine.

**Who should play:** Anyone looking for a quiet, methodical, and purely classic single-player card game.

**Why it exists:** To push the limits of the F.O.N.G. Drag-and-Drop component library, testing the engine's ability to handle nested stacks of cards and multi-drop zone validation.

---

## Quick Start (30 seconds)

1. Launch the game from the Development hub.

2. The deck will automatically deal 7 cascading columns (the Tableau).

3. Tap the deck in the top left to draw 3 cards (or 1 card, depending on settings).

4. Drag cards of alternating colors (Red/Black) in descending order to build columns.

5. Move Aces to the 4 Foundation piles in the top right, and build them up to Kings!

**Pro Tip:** Always prioritize exposing face-down cards in the Tableau over drawing from the deck. The more hidden cards you reveal early, the higher your chances of winning!

---

## Features

- ✨ **Shared Engine Architecture** - Built on the exact same high-performance ES5 card mechanics as Blackjack and War.

- 🎮 **Smart Drag-and-Drop** - Grab an entire stack of cards by grabbing the highest visible card; the engine automatically moves the whole stack.

- 📱 **Double-Tap Auto-Play** - Double-tap any eligible card in the Tableau to instantly fly it to the Foundation piles.

- ⚡ **Infinite Undo** - Made a mistake? Step backward through your entire move history without penalty.

---

## How to Play

**Objective:**

Move all 52 cards to the four Foundation piles in the top right, separated by suit, in ascending order from Ace to King.

**Rules:**

- **Tableau (Main Board):** Build downward in alternating colors (e.g., a Black 7 can be placed on a Red 8).

- **Foundations:** Build upward by matching suits (e.g., Hearts only, starting with Ace, then 2, 3, etc.).

- **Empty Columns:** Only a King (or a stack starting with a King) can be placed in an empty Tableau column.

**Controls:**

- **Drag:** Tap and hold a card (or stack) and drag it to a valid drop zone.

- **Tap:** Tap the deck to draw new cards.

- **Double-Tap:** Quickly tap a card to auto-move it to a Foundation pile if valid.

---

## Status

- **Version:** 0.7.0

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Yes (Smart Drag logic)

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** I can't drop a stack of cards into an empty space.

- **Solution:** Standard Klondike rules strictly dictate that only a King can be placed into a completely empty Tableau column.

### Known Limitations

- **Winning Animation:** The classic "cascading bouncy cards" win animation is currently in development and may cause stuttering on older devices.

- **Scoring:** Vegas-style scoring and timed modes are not yet implemented.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Highly optimized touch-and-drag handling.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the multi-zone Drop API validates card stacks

- 🛣️ [TODO.md](TODO.md) - Upcoming features (Win animations, Vegas scoring)

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 event delegation

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
