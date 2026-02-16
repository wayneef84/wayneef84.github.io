# F.O.N.G. Letter Tracing

## What is this?
F.O.N.G. Letter Tracing is a multi-modal educational application designed to help early learners master writing mechanics. It features an advanced A-B-C audio architecture, voice speed control, and rigorous stroke validation.

**Who should play:** Young children learning to write, bilingual learners practicing Chinese characters, and anyone working on fine motor control.
**Why it exists:** To provide a calm, ad-free, and 100% offline educational environment for the family. It utilizes local HTML5 Canvas rendering to provide immediate, satisfying feedback for correct strokes.

---

## Quick Start (30 seconds)
1. Open the game via the F.O.N.G. Master Hub.
2. Select your desired learning mode from the main menu (Letters, Words, Sentences, or Chinese).
3. A character or word will appear on the screen with guided stroke paths.
4. Use your finger (on touch devices) or mouse to trace the shape, following the directional arrows.
5. Listen to the local audio pronunciation upon successful completion!

**Pro Tip:** If the tracing feels too strict, you can adjust the "Stroke Tolerance" in the settings menu to make it easier for younger learners.

---

## Features
- ✨ **Four Distinct Modes** - Dedicated modules for single Letters, full Words, complete Sentences, and Chinese characters.
- 🎮 **Rigorous Stroke Validation** - The engine ensures strokes are drawn in the correct direction and order, building proper muscle memory.
- 📱 **Tablet-First UI** - Designed with massive, 44px minimum touch targets perfect for imprecise, tiny fingers.
- 🔊 **A-B-C Audio Architecture** - Features offline voice guidance with adjustable speed controls.
- ⚡ **100% Local Assets** - Zero external dependencies. All audio files and canvas scripts run locally for instant loading and offline play.

---

## How to Play

**Objective:**
Successfully trace the displayed characters by staying within the guided lines and following the correct stroke order.

**Rules:**
- You must start at the indicated beginning point of each stroke.
- You must draw in the direction of the guiding arrows.
- If you veer too far off the path, the stroke will flash red and reset, prompting you to try again.

**Controls:**
- **Trace:** Click and drag (desktop) or touch and drag (mobile/tablet) along the guided path.
- **Next/Previous:** Tap the massive navigation arrows on the sides of the screen to change characters.
- **Audio Replay:** Tap the speaker icon (min 44px touch target) to hear the character's pronunciation again.
- **Voice Speed:** Toggle the turtle/rabbit icon to slow down or speed up the audio dictation.

---

## Status
- **Version:** 5.1
- **Status:** Production
- **Last Updated:** 2026-02-15
- **Mobile Optimized:** Yes (Tablet-First Design)
- **Tested On:** iOS Safari (iPad), Android Chrome (Tablets)

---

## Troubleshooting

### Common Issues
**Issue:** I trace the letter perfectly, but it resets and turns red.
- **Solution:** You might be tracing the letter in the wrong order. The app enforces standard writing conventions (e.g., drawing the vertical line of a 't' before crossing it). Follow the numbered arrows carefully.

**Issue:** There is no sound playing when I complete a letter.
- **Solution:** Ensure your device is not on silent mode and the media volume is turned up. On some iOS devices, you must interact with the screen (tap anywhere) before the browser allows audio to play.

### Known Limitations
- **Custom Words:** Currently, you cannot type in your own custom spelling words. The word and sentence lists are pre-compiled in the local database.
- **Audio Localization:** Voice dictation is currently limited to English and basic Chinese character pronunciations.

---

## Performance & Compatibility
- **Load Time:** < 1.0 second
- **Mobile Support:** iOS 12+, Android 7+ (Requires modern Canvas API support)
- **Offline:** Fully functional without internet connectivity.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the stroke validation engine works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & Canvas gotchas
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
