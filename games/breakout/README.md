# F.O.N.G. Breakout

## What is this?
F.O.N.G. Breakout is a hyper-fluid brick-breaking game built to showcase the NEGEN Particle System.

**Who should play:** Arcade lovers who enjoy physics-based reflection puzzles and visually satisfying block destruction.
**Why it exists:** To test the rendering capabilities of HTML5 Canvas by pushing hundreds of physics-based particles (sparks, brick fragments) to the screen simultaneously without dropping frame rates.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Tap the screen to release the ball from your paddle.
3. Drag your finger horizontally across the bottom of the screen to move the paddle.
4. Deflect the ball upward to smash the colorful bricks.
5. Clear all bricks on the screen to advance to the next, more difficult level!

**Pro Tip:** Catching the ball on the extreme left or right edge of your paddle will dramatically sharpen the angle of reflection, allowing you to sneak the ball behind enemy brick lines!

---

## Features
- ✨ **NEGEN Particle System** - Every shattered brick bursts into a shower of physics-enabled particles that bounce and fade, creating a highly satisfying visual loop.
- 🎮 **Level Progression** - Features multiple handcrafted brick layouts that increase in density and difficulty as you survive.
- 📱 **1:1 Touch Tracking** - The paddle is locked perfectly to the X-axis of your finger, providing absolute, zero-lag precision required for high-speed deflections.
- ⚡ **Combo Scoring** - Destroying multiple bricks without the ball touching your paddle builds a massive score multiplier.

---

## How to Play

**Objective:**
Shatter every destructible brick on the screen to beat the level without letting the ball fall past your paddle.

**Rules:**
- You have 3 lives. Letting the ball fall out of bounds at the bottom of the screen costs a life.
- Silver and Gold bricks may require multiple hits to destroy.
- The ball's speed gradually increases the longer it stays in play.

**Controls:**
- **Touch/Mobile:** Tap to launch. Drag anywhere on the lower half of the screen to move the paddle (your finger does not need to be exactly on the paddle).
- **Desktop:** Click to launch. Move the mouse horizontally to steer the paddle.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (1:1 Drag Tracking)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The game stutters right when a lot of bricks break at once.
- **Solution:** The NEGEN Particle System can be demanding on very old devices. If you experience lag, open the Settings menu and disable "Particle Effects" to play the game in a high-performance, minimalist mode.

**Issue:** My finger covers the paddle so I can't see the ball.
- **Solution:** The touch-zone for the paddle extends across the entire bottom quadrant of the screen. Try resting your thumb an inch *below* the paddle so your view remains unobstructed!

### Known Limitations
- **Power-Ups:** Currently, there are no falling power-ups (like Multi-Ball or Extended Paddle). This is strictly a classic, skill-based mechanics test.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Exceptionally fluid touch tracking via optimized requestAnimationFrame loops.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the NEGEN Particle System rendering works
- 🛣️ [TODO.md](TODO.md) - Upcoming features (Power-Ups)
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & Canvas context optimization
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
