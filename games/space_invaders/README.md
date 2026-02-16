# F.O.N.G. Space Invaders

## What is this?
F.O.N.G. Space Invaders is a classic grid-based alien shooter utilizing an advanced "Entity Pooling" architecture to maintain high performance.

**Who should play:** Fans of retro arcade games and anyone looking for a nostalgic, fast-paced shooting challenge.
**Why it exists:** To push the limits of screen-entity rendering on older tablets. By recycling lasers and enemy sprites (entity pooling), the game avoids memory leaks and garbage-collection stutters, ensuring perfectly smooth 60fps gameplay.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. The alien armada will begin descending from the top of the screen immediately.
3. Move your ship left and right to dodge incoming alien bombs.
4. Fire your laser to destroy the aliens before they reach the bottom of the grid.
5. Use the destructible green shields for cover!

**Pro Tip:** Shoot the mysterious Red UFO that occasionally flies across the very top of the screen for massive bonus points!

---

## Features
- ✨ **Entity Pooling** - A behind-the-scenes memory optimization technique that makes this game run flawlessly on devices from 2012.
- 🎮 **Grid-Based Logic** - Authentic retro movement. The alien swarm speeds up as their numbers dwindle, just like the original hardware!
- 📱 **Mobile-First Firing Controls** - Features a dedicated, massive 44px auto-fire toggle on mobile so you can focus entirely on dragging to move.
- 🛡️ **Destructible Terrain** - The protective shields dynamically degrade pixel-by-pixel as they absorb laser fire from both you and the aliens.

---

## How to Play

**Objective:**
Annihilate all alien invaders on the screen to advance to the next, faster level.

**Rules:**
- You have 3 lives. Getting hit by an alien bomb costs a life.
- If an alien physically touches your ship or reaches the bottom of the screen, the game is instantly over, regardless of your remaining lives.
- You can only have a limited number of your own lasers on the screen at one time.

**Controls:**
- **Touch/Mobile:** Drag your thumb along the bottom slider zone to move the ship horizontally. Tap the massive "FIRE" button (or toggle Auto-Fire).
- **Desktop:** Use Left/Right Arrow Keys to move, and the Spacebar to fire.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (Segmented control zones)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** I can't shoot fast enough on mobile.
- **Solution:** Due to touch-delay on some older browsers, mashing the fire button can drop inputs. Enable the "Auto-Fire" toggle on the UI. This will continuously shoot whenever your weapon is off cooldown, allowing you to just focus on dodging!

**Issue:** The game lags when an alien explodes.
- **Solution:** The particle explosion effect can be disabled in the Settings menu to improve performance on legacy tablets.

### Known Limitations
- **Screen Size Adjustments:** Resizing the browser window mid-game may cause the alien grid boundaries to desync. Please keep the device orientation locked during play.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Fully touch-optimized with segregated movement and firing zones.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - Deep dive into the Entity Pooling memory management
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & grid logic
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
