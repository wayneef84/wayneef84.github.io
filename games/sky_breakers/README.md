# F.O.N.G. Sky Breakers

## What is this?
F.O.N.G. Sky Breakers is a vertical-scrolling, canvas-based arcade shooter that tests reflexes and pattern recognition.

**Who should play:** Fans of bullet-hell mechanics and classic top-down airplane shooters.
**Why it exists:** To push the limits of HTML5 Canvas rendering for high-velocity scrolling backgrounds and smooth entity translation without relying on heavy game engine frameworks.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. The level will immediately begin scrolling downward.
3. Touch and drag your ship to move it around the screen. Your weapons will auto-fire continuously!
4. Destroy incoming enemy ships to rack up points while dodging their projectiles.
5. Survive until the end of the stage to face the Boss!

**Pro Tip:** Your ship's hitbox is actually much smaller than the ship graphic itself! Focus entirely on the glowing cockpit in the center of your ship when dodging tight bullet patterns.

---

## Features
- ✨ **High-Performance Canvas Engine** - Renders dozens of enemy ships and hundreds of projectiles simultaneously at a smooth 60fps.
- 🎮 **Adaptive Difficulty Levels** - Choose from multiple difficulty tiers that alter enemy spawn rates and projectile speeds.
- 📱 **1:1 Touch Tracking** - Move your ship with pixel-perfect precision by dragging your thumb anywhere on the screen.
- ⚡ **Auto-Fire Mechanics** - Designed specifically for mobile devices, removing the need to constantly tap a fire button so you can focus 100% on dodging.

---

## How to Play

**Objective:**
Survive the scrolling stages and defeat the boss at the end of each wave to achieve the highest possible score.

**Rules:**
- Taking a hit from an enemy projectile or colliding with an enemy ship destroys your current vessel.
- You have a limited number of lives (displayed in the top corner).
- Collect power-ups dropped by special red enemies to upgrade your weapon spread.

**Controls:**
- **Touch/Mobile:** Drag anywhere on the screen to move. The ship fires automatically.
- **Desktop:** Click and drag the mouse, or use the Arrow Keys to steer.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-13
- **Mobile Optimized:** Yes (Canvas Touch Tracking)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** My finger covers the ship when I drag it.
- **Solution:** The touch-listener captures your finger's position relative to the screen, not the ship itself. Place your thumb an inch *below* your ship and drag; the ship will follow your movements while remaining completely visible!

### Known Limitations
- **Landscape Mode:** The game is hard-coded for vertical (portrait) orientation. Playing on a widescreen desktop monitor will result in large black borders on the sides.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** Exceptionally fluid touch tracking.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the Canvas rendering loop manages bullet arrays
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & Canvas context optimization
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
