# F.O.N.G. Poker: 5-Card Draw

## What is this?

F.O.N.G. 5-Card Draw is a digital adaptation of the classic poker variant, currently in active development on the F.O.N.G. Shared Card Engine.

**Who should play:** Poker enthusiasts looking to test the early development builds of the betting and hand-evaluation mechanics.

**Why it exists:** To serve as the foundational testbed for the Poker evaluator logic before expanding into more complex community-card variants like Texas Hold'em.

---

## Quick Start (30 seconds)

1. Launch the game from the F.O.N.G. Master Hub.

2. Place your initial ante using the betting controls at the bottom of the screen.

3. You will be dealt 5 cards face up.

4. Select any cards you wish to discard and replace (up to 3, or 4 if holding an Ace).

5. The engine will evaluate your final hand against the basic CPU opponent!

**Pro Tip:** This is a Development build. If the betting logic gets stuck during a raise, use the "Reset Table" button in the navigation bar to clear the game state.

---

## Features

- ✨ **Shared Engine Architecture** - Utilizes the same robust, ES5-compliant card manipulation engine as Blackjack and War.

- 🎮 **Core Hand Evaluator** - Accurately identifies and ranks everything from High Card to Royal Flush.

- 📱 **Mobile-First Card Selection** - Massive touch targets allow you to easily tap the cards you want to discard without accidentally selecting neighbors.

- ⚡ **Local Processing** - Zero server latency when dealing or evaluating hands.

---

## How to Play

**Objective:**

Form the highest-ranking 5-card poker hand possible to win the pot.

**Rules:**

- Standard Poker hand rankings apply.

- You may discard and draw new cards exactly once per hand.

- The CPU opponent currently follows a randomized action matrix.

**Controls:**

- **Select Cards:** Tap any card in your hand to mark it for discarding (it will slide upward).

- **Draw:** Tap the "Draw" button to replace the marked cards.

- **Betting:** Use the massive +/- chips at the bottom to adjust wagers.

---

## Status

- **Version:** 0.5.0 (Beta)

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Yes

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** The CPU folded, but the pot wasn't awarded to me.

- **Solution:** The resolution phase logic is still being refined for early-folds. Refreshing the page will reset your virtual bankroll.

### Known Limitations

- **AI Complexity:** The CPU does not actively bluff or calculate pot odds yet.

- **Multiplayer:** Human-vs-Human is not supported in this build.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Fully touch-optimized.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the Poker hand evaluator works

- 🛣️ [TODO.md](TODO.md) - Upcoming features (Advanced AI)

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 logic

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
