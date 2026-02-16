# F.O.N.G. Blackjack

## What is this?
F.O.N.G. Blackjack is a premium, offline-first browser simulation of the classic casino card game, built entirely on the proprietary F.O.N.G. Shared Card Engine.

**Who should play:** Arcade enthusiasts, card game fans, and family members looking to practice their 21 strategy without risking real money.
**Why it exists:** To serve as the flagship proof-of-concept for the F.O.N.G. shared state-machine engine, demonstrating complex UI animations, turn-based logic, and mobile-first responsiveness within a strict ES5 environment.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub or open `index.html` directly.
2. Tap the **Chips** at the bottom of the screen to place your initial bet.
3. Tap **DEAL** to begin the round. You and the dealer will each receive two cards.
4. Try to get closer to 21 than the dealer without going over (Busting).

**Pro Tip:** Always assume the dealer's face-down card has a value of 10. If the dealer is showing a 4, 5, or 6, they have a high chance of busting—play conservatively!

---

## Features
- ✨ **Shared Engine Architecture** - Powered by a robust, reusable ES5 card mechanics engine.
- 🎮 **Authentic Casino Rules** - Includes advanced mechanics like Insurance and Double Down.
- 📱 **Mobile-First UI** - Designed specifically for older tablets and modern phones with massive, 44px minimum touch targets.
- ⚡ **Zero Latency** - 100% local assets mean instantaneous card dealing and zero offline interruptions.
- 🎨 **Procedural Rendering** - Cards are rendered via the `card-assets.js` DOM/SVG system, ensuring crisp scaling on any retina display.

---

## How to Play

**Objective:**
Beat the dealer's hand by scoring higher than them, up to a maximum of 21. If you go over 21, you "Bust" and instantly lose your bet.

**Rules (House Rules):**
- **Card Values:** Number cards are worth their face value. Jacks, Queens, and Kings are worth 10. Aces are worth 1 or 11 (whichever benefits the hand most).
- **Blackjack:** An Ace and a 10-value card on the initial deal is a "Blackjack" and pays out 3:2 immediately (unless the dealer also has Blackjack, resulting in a Push).
- **Dealer Behavior:** The dealer MUST hit on 16 or lower. The dealer MUST stand on 17 or higher.
- **Push:** If you and the dealer have the exact same total, the hand is a "Push" (tie), and your bet is returned.

**Controls:**
- **HIT:** Draw an additional card to increase your total.
- **STAND:** End your turn and force the dealer to reveal their hand.
- **DOUBLE:** Double your initial bet, draw exactly *one* more card, and immediately stand. (Only available on your first move).
- **INSURANCE:** If the dealer's face-up card is an Ace, you may pay half your bet to insure against a dealer Blackjack.

---

## Status
- **Version:** 1.0.5-C
- **Status:** Production
- **Last Updated:** 2026-02-15
- **Mobile Optimized:** Yes (Fully Responsive + Safe Area Insets)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The dealer takes a turn even after I busted over 21.
- **Solution:** This is a known legacy issue referred to as the "Terminal Check Gate" bug. Ensure you are running v1.0.5-C or higher, where `getNextActor` correctly returns `null` if the player busts, suppressing the dealer's turn.

**Issue:** Cards flash briefly at their destination before flying across the screen.
- **Solution:** This animation glitch occurs if CSS visibility isn't toggled correctly. It has been patched in the latest CSS updates. Ensure your cache is cleared.

### Known Limitations
- **Splitting:** The ability to "Split" pairs (e.g., two 8s) into two separate hands is not currently supported in this version. The Multi-Hand architecture is mapped out for a future v2.0 update.
- **Shoe Size:** The game currently operates on a single, continuously shuffled 52-card deck rather than a multi-deck shoe.

---

## Performance & Compatibility
- **Load Time:** < 0.5 seconds (Offline Cache)
- **Mobile Support:** iOS 9+, Android 4.4+
- **Offline:** 100% functional without internet connectivity.
- **Dependencies:** Strictly local. Zero external CDNs.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the state machine works (Claude's Domain)
- 🛣️ [TODO.md](TODO.md) - Upcoming features like Splitting
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 gotchas
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
