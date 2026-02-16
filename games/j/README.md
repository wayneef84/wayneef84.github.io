# F.O.N.G. J Quiz

## What is this?
F.O.N.G. J Quiz is a high-velocity, highly customizable trivia and quiz engine designed to test rapid recall. It features a massive database of over 1000+ questions spanning 17+ unique category packs.

**Who should play:** Trivia buffs, students studying for exams, and competitive family members looking for a rapid-fire challenge.
**Why it exists:** To provide an ultra-fast, offline-capable testing framework that can be easily expanded with new JSON question packs without requiring code changes to the core engine.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. At the main menu, toggle the specific "Packs" (categories) you want to be quizzed on. You can select one or mix multiple!
3. Tap **START QUIZ**.
4. A question will appear. Tap the correct answer from the multiple-choice grid as fast as possible.
5. The faster you answer correctly, the higher your score multiplier!

**Pro Tip:** Enable "Revamp Mode" in the settings for an extreme challenge where the timer is severely reduced, forcing gut-instinct answers!

---

## Features
- ✨ **Massive Local Database** - Over 1000 questions across 17+ packs (Science, History, F.O.N.G. Lore, etc.) all stored locally. Instant loading.
- 🎮 **High-Velocity Engine** - Zero animation delays between questions. Built for speedrunners.
- 📱 **Mobile-First UI** - Features massive, color-coded answer buttons ensuring you never misclick due to a small touch target.
- ⚙️ **Advanced Settings** - Customize the timer length, question count per round, and penalty mechanics.
- 🔄 **Smart Shuffling** - Utilizes an advanced randomization algorithm to ensure you don't see the same questions repeatedly in mixed-pack modes.

---

## How to Play

**Objective:**
Answer as many questions correctly as possible before the timer runs out, maximizing your score multiplier.

**Rules:**
- You have a limited amount of time per question (customizable in settings).
- **Correct Answer:** Awards points based on how much time was left on the clock.
- **Wrong Answer:** Deducts points and instantly moves you to the next question.
- **Time Out:** Counts as a wrong answer.

**Controls:**
- **Answer Grid:** Tap one of the 4 massive buttons to lock in your answer.
- **Pause:** Tap the top-right menu icon to pause the timer and access settings.

---

## Status
- **Version:** 4.x
- **Status:** Production
- **Last Updated:** 2026-02-15
- **Mobile Optimized:** Yes (Tablet-First Grid Layout)
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The game is stuck on "Loading Packs..."
- **Solution:** The game fetches JSON files locally. If you are running this locally via `file://` instead of a local web server (or the GitHub Pages `/beta` environment), your browser's strict CORS policy may block the JSON fetch. Ensure you are accessing it via an `http` protocol.

**Issue:** I keep getting the same questions.
- **Solution:** Ensure you have multiple packs selected. If you only select a pack with 20 questions and set the game to a 50-question round, they will repeat.

### Known Limitations
- **Multiplayer:** No real-time multiplayer. Competition is strictly high-score based on the local device.
- **Custom Packs:** Currently, creating a new pack requires creating a new `.json` file in the `/packs/` folder and running the `update_manifest.py` script. There is no in-app pack creator yet.

---

## Performance & Compatibility
- **Load Time:** < 0.5 seconds (All 1000+ questions are lightweight JSON).
- **Mobile Support:** Fully optimized. Buttons stack natively on narrow portrait screens.
- **Offline:** 100% functional without internet connectivity once loaded.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the JSON parsing and pack manifest works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 `XMLHttpRequest` gotchas
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
