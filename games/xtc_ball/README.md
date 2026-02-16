# F.O.N.G. XTC Ball

## What is this?
F.O.N.G. XTC Ball is a digital, physics-inspired recreation of the classic "Magic 8-Ball" fortune-telling toy.

**Who should play:** Anyone who needs a quick, randomized answer to a yes/no question, or kids who enjoy interactive, tactile toys on a tablet.
**Why it exists:** To demonstrate high-fidelity DOM and SVG rendering combined with synthesized Web Audio without relying on external image files, serving as a lightweight interactive novelty in the arcade.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Ask a "Yes" or "No" question aloud (e.g., "Will I win the next game of F.O.N.G. War?").
3. Tap the massive 8-Ball on your screen, OR physically shake your mobile device!
4. Watch the fluid swirl as the magical icosahedron floats to the window to reveal your fortune.
5. Listen for the synthesized, mystical chime confirming your fate!

**Pro Tip:** On mobile devices with accelerometer access enabled, physically shaking the phone triggers a more aggressive swirl animation and sound effect!

---

## Features
- ✨ **DOM/SVG Rendering** - The entire 8-Ball, including the floating blue fluid and the multi-sided icosahedron text window, is rendered via code (CSS/SVG), ensuring it stays perfectly crisp on any retina screen.
- 🎮 **Accelerometer Support** - Utilizes the DeviceMotion API to allow real-world shaking to trigger the randomization logic.
- 📱 **Synthesized Sound** - Uses the Web Audio API to procedurally generate a mystical, deep hum and chime, requiring zero external MP3 downloads.
- ⚡ **True Randomness** - Pulls from the classic 20 standardized fortune responses (10 positive, 5 non-committal, 5 negative).

---

## How to Play

**Objective:**
Ask a question and receive a randomized answer.

**Rules:**
- The universe provides the answer. The F.O.N.G. platform assumes no liability for fortunes told.

**Controls:**
- **Desktop:** Click the 8-Ball graphic.
- **Mobile/Tablet:** Tap the 8-Ball graphic OR physically shake the device.

---

## Status
- **Version:** 1.0.0
- **Status:** Production
- **Last Updated:** 2026-02-10
- **Mobile Optimized:** Yes (Accelerometer enabled)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The "Shake" to roll feature isn't working on my iPhone.
- **Solution:** Modern iOS devices (iOS 13+) require explicit user permission to access the device's accelerometer. When you first load the page, you must tap the "Enable Motion" prompt. If you dismissed it, you will need to refresh the page.

**Issue:** I can't hear the mystical sound effect.
- **Solution:** Browsers strictly block audio from playing until the user interacts with the page. You must tap the screen at least once before the synthesized audio context is allowed to play.

### Known Limitations
- **Custom Responses:** Currently, you cannot add your own custom text responses. The app is locked to the classic 20 fortunes.

---

## Performance & Compatibility
- **Load Time:** Instantaneous. Entirely code-driven visuals.
- **Mobile Support:** Fully optimized for touch and motion controls.
- **Offline:** 100% functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the DeviceMotion API and SVG rendering works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & Web Audio context constraints
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
