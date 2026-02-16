# F.O.N.G. Slots

## What is this?
F.O.N.G. Slots is a highly visual, casino-style 5-reel slot machine running purely on HTML, CSS3 3D transforms, and Vanilla JavaScript.

**Who should play:** Arcade fans who enjoy flashing lights, big numbers, and purely luck-based entertainment.
**Why it exists:** To push the boundaries of what is possible with native DOM manipulation and CSS animations without relying on heavy WebGL or Canvas rendering libraries, while maintaining 100% offline functionality.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Tap the **Settings** gear to select one of the 20 distinct visual themes.
3. Adjust your **Bet** amount using the massive +/- buttons at the bottom of the screen.
4. Tap the **SPIN** button (or click the physical lever on desktop) to set the 5 reels in motion.
5. Match 3 or more symbols on any of the active paylines to win!

**Pro Tip:** Keep an eye out for the "Dad Mode" physics toggle in the settings. Enabling this changes the deceleration curve of the reels for a heavier, more mechanical feel!

---

## Features
- ✨ **3D CSS Engine** - The reels are actually 3D cylinders built entirely out of CSS transforms, creating an authentic rotating effect without external rendering libraries.
- 🎨 **20 Custom Themes** - Features a massive library of 20 distinct asset themes (Classic Fruit, Neon, Egyptian, etc.), all loaded locally.
- 📱 **Mobile-First Layout** - The UI shifts dynamically. On desktop, a physical lever is clickable; on mobile, a massive, thumb-friendly Spin button anchors the screen.
- 🔊 **Web Audio API** - Synchronized mechanical stopping sounds and win-chimes that run entirely offline.
- ⚙️ **"Dad Mode" Physics** - A custom physics profile tweaking the spin duration, bounce-back, and deceleration.

---

## How to Play

**Objective:**
Spin the reels and line up matching symbols across predefined horizontal and zigzag paylines to increase your virtual bankroll.

**Rules:**
- Payouts are based on the rarity of the symbols aligned.
- You must match at least 3 contiguous symbols starting from the leftmost reel to trigger a win on a payline.
- **Wilds:** Special symbols that substitute for any other standard symbol to complete a winning line.

**Controls:**
- **SPIN / STOP:** Tap the massive primary button to start. Tap it again while spinning to "slam stop" the reels early.
- **BET +/-:** Adjust your wager per spin.
- **MAX BET:** Instantly sets your wager to the highest allowable amount and spins immediately.
- **AUTO-SPIN:** Hold the spin button to enable continuous spinning.

---

## Status
- **Version:** 3.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (Adaptive Layout)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The reels look flat or the 3D effect is broken.
- **Solution:** This game requires a browser that supports CSS `preserve-3d`. Ensure you are not using an extremely outdated browser or operating in a strict low-power mode that disables hardware acceleration.

**Issue:** I ran out of credits. How do I keep playing?
- **Solution:** Refreshing the page or tapping the "Bankrupt" prompt will grant you a fresh daily allowance of virtual credits.

### Known Limitations
- **No Real Money:** This is strictly an amusement simulator. No real money can be wagered or won.
- **Performance on Old Devices:** Older tablets may experience dropped frames during the spinning animation due to the heavy DOM manipulation required for the 3D cylinders.

---

## Performance & Compatibility
- **Load Time:** ~1.5 seconds (Due to caching the 20 theme image sprites).
- **Mobile Support:** iOS 12+, Android 6+.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the CSS 3D cylinder math works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 gotchas
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
