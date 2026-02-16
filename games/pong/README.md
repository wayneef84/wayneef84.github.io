# F.O.N.G. Pong

## What is this?
F.O.N.G. Pong is a localized, 1v1 tennis-style arcade game designed to showcase the precise collision detection of the NEGEN physics engine.

**Who should play:** Two players sharing a single tablet, or anyone wanting a rapid, competitive retro experience.
**Why it exists:** To demonstrate dual-input multi-touch support on mobile devices while serving as a baseline proof-of-concept for the NEGEN engine's high-performance 2D physics capabilities.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Grab a friend! This game is best played with two players on opposite ends of a tablet.
3. The ball will automatically serve after a short countdown.
4. Drag your paddle up and down (or left and right, depending on orientation) to intercept the ball.
5. Score 10 points to win the match!

**Pro Tip:** Hitting the ball with the very edge of your paddle applies "English" (spin), drastically altering the deflection angle and increasing the speed of the ball to catch your opponent off guard!

---

## Features
- ✨ **NEGEN Physics** - Crisp, mathematical collision detection ensures the ball never clips through paddles, even at maximum velocity.
- 🎮 **True 2-Player Local** - Handles simultaneous multi-touch inputs flawlessly, allowing two players to drag their paddles on the same screen without canceling each other's touch events.
- 📱 **Mobile-First Layout** - Paddles feature extended invisible touch boundaries (exceeding the 44px minimum) so your finger doesn't block your view of the paddle itself.
- ⚡ **Zero Latency** - Runs entirely locally in the browser with no network overhead.

---

## How to Play

**Objective:**
Get the ball past your opponent's paddle to score a point.

**Rules:**
- The ball accelerates slightly with every successful volley.
- If the ball passes the paddle and hits the scoring zone, the round resets.
- First player to the target score wins.

**Controls:**
- **Touch/Mobile:** Drag your finger along your defensive zone to move the paddle.
- **Desktop (Player 1):** W and S keys.
- **Desktop (Player 2):** Up and Down Arrow keys.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (Multi-touch enabled)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The screen scrolls or zooms when we both touch the tablet.
- **Solution:** Modern browsers sometimes interpret two-finger taps as zoom or scroll gestures. The game attempts to block these defaults, but ensure you are playing in Fullscreen mode or via a saved Home Screen bookmark to disable browser UI gestures.

**Issue:** One paddle gets "stuck" when moving.
- **Solution:** Ensure your screen is clean. Ghost touches or dragging your finger out of the browser's viewport can cause the touch event listener to drop the connection to the paddle.

### Known Limitations
- **No CPU Opponent:** This version requires two human players. A single-player AI mode is not currently implemented.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Fully optimized for multi-touch tablets.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the NEGEN physics and multi-touch events work
- 🛣️ [TODO.md](TODO.md) - Upcoming features (CPU AI)
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 event listeners
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
