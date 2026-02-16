# F.O.N.G. War

## What is this?
F.O.N.G. War is a fast-paced, digital recreation of the classic high-card-wins card game, built entirely on the F.O.N.G. Shared Card Engine.

**Who should play:** Kids learning number values, or anyone looking for a mindless, fast-tapping, luck-based card battle.
**Why it exists:** To rigorously stress-test the F.O.N.G. Shared Card Engine's state machine, specifically handling simultaneous multi-actor turns and recursive "Nested War" game states.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub or open `index.html` directly.
2. The 52-card deck is automatically split evenly between you and the CPU opponent.
3. Tap the **FLIP** button (or anywhere in the designated touch zone) to reveal your top card simultaneously with the CPU.
4. The highest card wins both cards! If there's a tie, a "War" is declared!

**Pro Tip:** Tap rapidly! The game engine is optimized to handle rapid inputs without animation blocking, so you can burn through a deck as fast as your fingers allow.

---

## Features
- ✨ **Shared Engine Architecture** - Built on the exact same ES5 robust framework as F.O.N.G. Blackjack.
- 🎮 **Nested War Logic** - Perfectly handles ties during a War (Double War, Triple War, etc.), accurately stacking the pot.
- 📱 **Mobile-First UI** - Features a massive central tap-zone (far exceeding the 44px minimum) for effortless, rapid one-handed play.
- 📜 **Battle History** - An ongoing scrollable log of previous flips and pot captures.
- 🔄 **Game Modes** - Play traditional "Endless" mode (captured cards go to the bottom of your deck) or "Sudden Death" (play exactly 26 hands, highest stack wins).

---

## How to Play

**Objective:**
Capture all 52 cards in the deck, bankrupting your opponent.

**Rules:**
- **Standard Play:** Both players flip their top card. The higher card value wins the pot (Aces are high).
- **War:** If the flipped cards match in rank, a "War" begins.
  - Each player deals three cards face down into the pot.
  - Each player flips one final card face up.
  - The higher of the new face-up cards wins the *entire* massive pot.
  - If it's *another* tie, the War repeats recursively!

**Controls:**
- **FLIP:** Tap the massive button at the bottom of the screen.
- **AUTO-PLAY:** (If enabled in settings) Hold the button to continuously flip cards automatically.

---

## Status
- **Version:** 1.1.0
- **Status:** Production
- **Last Updated:** 2026-01-17
- **Mobile Optimized:** Yes (Responsive + Safe Area Insets)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The game seems to get stuck on a tie when one player doesn't have enough cards to finish a War.
- **Solution:** This is a classic edge case in physical War. In F.O.N.G. War, if a player doesn't have enough cards to deal the three face-down cards during a War, they simply deal whatever they have left, with their final card acting as their "War" card.

**Issue:** I want to restart, but my deck size was saved.
- **Solution:** The game utilizes `localStorage` to save your state. To start a fresh game, tap the "Forfeit / New Game" button in the top menu.

### Known Limitations
- **Multiplayer:** Currently strictly 1v1 against a CPU. Human vs. Human is not supported.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Fully functional on any screen size.
- **Offline:** 100% offline capable. Zero CDNs or external dependencies.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the state machine handles simultaneous dealing
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 gotchas
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
