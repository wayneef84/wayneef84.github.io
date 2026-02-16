# F.O.N.G. Poker: 13-Card (Chinese Poker)

## What is this?

F.O.N.G. 13-Card Poker is a digital adaptation of the point-based arrangement game, heavily reliant on complex UI sorting.

**Who should play:** Fans of deep puzzle-solving and poker logic who enjoy taking their time to build the perfect hands.

**Why it exists:** To test the Drag-and-Drop (DnD) capabilities of the F.O.N.G. UI component library, allowing players to sort massive hands across multiple drop-zones.

---

## Quick Start (30 seconds)

1. Launch the game from the Development section.

2. You will be dealt 13 cards.

3. Drag and drop your cards into three separate rows: a 3-card front hand, a 5-card middle hand, and a 5-card back hand.

4. Ensure your back hand beats your middle hand, and your middle hand beats your front hand!

5. Tap "Lock Hand" to reveal the CPU's arrangement and calculate points.

**Pro Tip:** Mis-setting your hand (making the front hand stronger than the back hand) is called "Fouling" and will cost you massive penalty points! Always double-check your rows.

---

## Features

- ✨ **Drag-and-Drop UI** - Seamlessly move cards between the 3 designated zones using native touch interactions.

- 🎮 **Point Calculation Engine** - Automatically tallies royalties and standard points based on traditional scoring rules.

- 📱 **Mobile-First Layout** - The 13 cards are fanned responsively so they are legible even on smaller mobile screens.

- ⚡ **No Timers** - Purely strategic gameplay. Take as much time as you need to arrange your hand.

---

## How to Play

**Objective:**

Arrange your 13 cards into three separate poker hands that are stronger than the corresponding hands of your opponents, maximizing your points.

**Rules:**

- **Front Hand:** 3 cards (straights and flushes do not count).

- **Middle Hand:** 5 cards.

- **Back Hand:** 5 cards.

- The Back hand MUST be stronger than or equal to the Middle hand, and the Middle hand MUST be stronger than or equal to the Front hand.

**Controls:**

- **Move:** Tap and drag a card to a valid empty slot in one of the three rows.

- **Swap:** Drag a card directly on top of another card to instantly swap their positions.

---

## Status

- **Version:** 0.3.0 (Alpha)

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Partial (Drag events need refinement on Android)

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** Cards get stuck hovering when I lift my finger.

- **Solution:** Native HTML5 Drag and Drop can behave erratically on some mobile browsers. If a card is stuck, tap the empty space on the board to clear the active drag-state.

### Known Limitations

- **Fantasyland:** The advanced "Fantasyland" bonus rule is not currently implemented in this version.

- **Scoring Nuances:** Certain regional scoring rules (like 1-6 point variations) cannot currently be toggled in settings.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Playable, but tablet/desktop is highly recommended for dragging 13 tiny cards.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the DnD API handles multi-zone sorting

- 🛣️ [TODO.md](TODO.md) - Upcoming features (Fantasyland)

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & touch event listeners

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
