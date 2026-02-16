# F.O.N.G. Animal Stack

## What is this?
F.O.N.G. Animal Stack is a physics-based, gravity-defying puzzle game where players carefully drop various animal blocks to build the highest tower possible without it tipping over.

**Who should play:** Casual gamers, kids, and anyone who enjoys balancing physics puzzles like Jenga.
**Why it exists:** To integrate a lightweight 2D physics engine (handling gravity, friction, and torque) into a touch-friendly mobile layout, providing a quick, highly replayable arcade experience.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. An animal block will appear suspended at the top of the screen, moving back and forth.
3. Tap the screen to release the animal block.
4. It will fall and land on the platform (or on the previous animals).
5. Build the tower as high as you can. If three animals fall off the platform, it's Game Over!

**Pro Tip:** Pay attention to the shape of the animals! A wide Hippo makes a great foundation, while a tall Giraffe is risky unless you place it perfectly in the center of mass.

---

## Features
- ✨ **2D Physics Simulation** - The game calculates real-time center-of-mass, friction, and momentum, making the tower sway and tilt realistically.
- 🎮 **Varied Shapes** - Different animals have drastically different hitboxes and weights, forcing you to adapt your strategy on the fly.
- 📱 **One-Touch Controls** - Plays perfectly with a single thumb, making it the ideal portrait-mode mobile game.
- ⚡ **Offline High Scores** - Automatically tracks and saves your best stacking heights to `localStorage`.

---

## How to Play

**Objective:**
Stack as many animals as possible to achieve the highest score without letting the tower collapse.

**Rules:**
- You receive 1 point for every animal successfully placed on the tower.
- If an animal falls off the screen, you lose a life (heart).
- You have 3 lives. The game ends when all lives are lost.

**Controls:**
- **Drop Animal:** Tap anywhere on the screen to release the current suspended animal block.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (One-Touch Portrait)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The animals are sliding off each other even when I drop them perfectly straight.
- **Solution:** This is intentional physics! If your tower is leaning slightly to the left, gravity and the angled surface of the block below will cause new blocks to slide. You have to counterbalance the weight!

### Known Limitations
- **Landscape Mode:** The game mechanics require vertical height. Playing in landscape orientation will severely limit how high you can stack before hitting the ceiling. Please lock your device in portrait mode.

---

## Performance & Compatibility
- **Load Time:** Instantaneous.
- **Mobile Support:** 100% native touch support.
- **Offline:** Fully functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the 2D physics engine integration functions
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & physics configurations
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
