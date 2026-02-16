# F.O.N.G. Fall Down

## What is this?

F.O.N.G. Fall Down is an endless-survival arcade prototype where you guide a ball through gaps in continuously rising platforms.

**Who should play:** Players looking for a fast, reflex-intensive challenge during short breaks.

**Why it exists:** To test continuous vertical background translation and high-frequency collision detection on a mobile-first HTML5 Canvas.

---

## Quick Start (30 seconds)

1. Launch the game from the Development tier of the Master Hub.

2. The ball will begin at the top of the screen, and platforms will immediately start rising from the bottom.

3. Tilt your device (or use the on-screen arrows) to roll the ball left and right.

4. Fall through the gaps in the platforms to avoid being crushed at the top of the screen!

5. Survive as long as possible to increase your score multiplier.

**Pro Tip:** Don't linger too close to the top edge! The game speed increases over time, and a sudden lack of gaps will crush you instantly if you have no time to react.

---

## Features

- ✨ **DeviceMotion Control** - Utilizes mobile accelerometers so you can steer the ball entirely by tilting your tablet.

- 🎮 **Infinite Generation** - Platforms and gaps are procedurally generated in real-time, meaning no two runs are ever the same.

- 📱 **Smooth Canvas Rendering** - Employs `requestAnimationFrame` for buttery-smooth vertical scrolling without DOM jank.

- ⚡ **Zero Loading Screens** - Instant restarts upon death to keep the arcade loop addictive.

---

## How to Play

**Objective:**

Keep the ball on the screen as long as possible without getting pushed into the ceiling by the rising platforms.

**Rules:**

- If the ball touches the very top edge of the screen, the game is over.

- You earn points for every floor you successfully drop through.

- The platforms accelerate the longer you survive.

**Controls:**

- **Mobile/Tablet:** Tilt your device left and right to roll the ball via gravity.

- **Desktop:** Use the Left and Right Arrow keys.

---

## Status

- **Version:** 0.8.0

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Yes (Accelerometer focused)

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** Tilting my device does nothing.

- **Solution:** Modern mobile browsers require you to manually grant permission for the page to read the accelerometer. Tap the screen once when the page loads to trigger the permission prompt.

### Known Limitations

- **Audio:** There are currently no sound effects or background music implemented in this prototype.

- **Power-Ups:** The game only features standard platforms; modifiers like "bouncy floors" or "speed boosts" are not yet present.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Excellent. Fully reliant on native device sensors.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the infinite platform generator manages memory

- 🛣️ [TODO.md](TODO.md) - Upcoming features (Audio integration)

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & DeviceMotion API

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
