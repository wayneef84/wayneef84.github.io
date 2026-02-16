# F.O.N.G. Poker: Texas Hold'em

## What is this?

F.O.N.G. Texas Hold'em is a work-in-progress implementation of the world's most popular community-card poker game.

**Who should play:** Beta testers helping to refine the multi-round betting logic (Flop, Turn, River).

**Why it exists:** To push the F.O.N.G. Shared Card Engine to handle complex side-pots, community card arrays, and multi-actor betting rounds.

---

## Quick Start (30 seconds)

1. Launch the game from the Development section of the Master Hub.

2. Post your blinds when prompted by the UI.

3. You will receive two hole cards. Tap "Call", "Raise", or "Fold".

4. Watch the Flop, Turn, and River cards be dealt, managing your bets across each phase.

5. Try to form the best 5-card hand using any combination of your hole cards and the community board!

**Pro Tip:** Because the AI is still in development, the CPU opponents act randomly. Use this version to test the UI flow and hand evaluation rather than deep bluffing strategies!

---

## Features

- ✨ **Community Card Engine** - Handles the shared `board` array for communal cards, distinct from player-specific hands.

- 🎮 **Multi-Phase Betting** - UI dynamically shifts between Pre-Flop, Flop, Turn, and River betting states.

- 📱 **Mobile-First Actions** - Massive touch targets for the primary actions (Fold, Call, Raise) to prevent costly misclicks.

- ⚡ **Local Evaluation** - The evaluator instantly determines the winning hand and split pots without server lag.

---

## How to Play

**Objective:**

Win the chips in the pot either by having the highest-ranking 5-card hand at the showdown or by forcing all other players to fold.

**Rules:**

- You are dealt two private hole cards.

- Five community cards are dealt face-up in the center of the table across three phases (Flop, Turn, River).

- You may use one, both, or neither of your hole cards in combination with the board.

**Controls:**

- **Action Buttons:** Tap the massive contextual buttons to Check, Call, Fold, or Raise.

- **Bet Slider:** Drag the slider (min 44px height) to specify your raise amount.

---

## Status

- **Version:** 0.4.0 (Alpha)

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Yes

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** The game freezes when someone goes All-In.

- **Solution:** Side-pot calculation logic is currently unstable. If an all-in occurs with multiple callers, the state machine may pause. Reload the page to reset.

### Known Limitations

- **Split Pots:** Exact chip distribution on tied hands (split pots) is not fully implemented.

- **Multiplayer:** Strictly CPU opponents for now.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Fully touch-optimized.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How community arrays and multi-round betting work

- 🛣️ [TODO.md](TODO.md) - Upcoming features (Side-pots, AI)

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & state machine flow

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
