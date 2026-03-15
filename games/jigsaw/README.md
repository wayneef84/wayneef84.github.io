# F.O.N.G. Jigsaw

## What is this?
F.O.N.G. Jigsaw is a highly customizable, browser-based jigsaw puzzle game engine. Instead of relying on a static set of pre-loaded images, it empowers users to generate puzzles dynamically from their own photos or directly from their device's camera.

**Who should play:** Puzzle lovers of all ages, families wanting to turn their own photos into interactive games, and young kids developing spatial awareness.
**Why it exists:** To provide a robust, completely private, and offline-capable tool for creating variable-difficulty spatial puzzles without uploading personal family photos to a third-party server.

---

## Quick Start (30 seconds)
1. Launch the game from the F.O.N.G. Master Hub.
2. Tap the **Upload Image** button to select a photo from your device, or tap **Use Camera** to snap a fresh picture.
3. Select your desired difficulty by choosing a grid size (e.g., 4x4 for kids, 10x10 for a challenge).
4. Tap **Generate Puzzle**.
5. Drag and drop the scrambled puzzle pieces until they lock into their correct positions!

**Pro Tip:** Start by finding all the corner and edge pieces! Pieces that are placed correctly near each other will "snap" together, allowing you to move entire completed sections of the puzzle at once.

---

## Features
- ✨ **Custom Image Upload** - Play with your own photos. All image processing happens locally in your browser; nothing is sent to the cloud.
- 📸 **Camera Integration** - Directly access your device's webcam or phone camera to take a picture and instantly scramble it into a puzzle.
- 🎮 **Variable Difficulty** - Choose from Very Easy (12 pieces) to Expert (192), or set a fully custom grid size.
- 🧩 **Rounded Jigsaw Shapes** - Redesigned bezier tab: proper neck constriction → bulbous round head for a classic interlocking silhouette.
- 🔊 **Snap Sound** - Satisfying audio click (Web Audio API) every time a piece locks into place.
- 🖐️ **Lift Effect** - Dragged pieces scale up 5% with a deep drop shadow, giving a physical "held" feel.
- 📊 **Piece Counter** - Live "12 / 48" progress tracker in the toolbar.
- 💾 **Save & Resume** - Saves puzzle state to localStorage so you can pick up where you left off.
- 📱 **Mobile-First Touch Controls** - Fluid drag-and-drop optimized for touchscreens.

---

## How to Play

**Objective:**
Reassemble the scrambled image by connecting all the interlocking puzzle pieces.

**Rules:**
- Pieces can be placed anywhere on the canvas workspace.
- When two matching pieces are brought close together, they will automatically snap and lock into a single, movable cluster.
- The game is won when all pieces merge into a single, complete image.

**Controls:**
- **Select & Move:** Tap/Click and hold a piece, then drag it to position.
- **Snap:** Release near the correct position — piece snaps with a click sound.
- **Hint:** Hold the "Hint (Hold)" button in the toolbar to see the completed image at 30% opacity.
- **Save / Load:** Use the toolbar buttons to save progress to localStorage and resume later.

---

## Status
- **Version:** 1.1.0
- **Status:** Production
- **Last Updated:** 2026-03-07
- **Mobile Optimized:** Yes
- **Tested On:** iOS Safari 12+, Chrome 50+, Firefox 45+

---

## Troubleshooting

### Common Issues
**Issue:** The "Use Camera" button doesn't work.
- **Solution:** Your browser requires explicit permission to access the camera. Ensure you have granted camera access when prompted. Additionally, camera access usually requires a secure context (HTTPS), which is provided via the F.O.N.G. `/beta` GitHub Pages deployment.

**Issue:** The game lags when I upload a massive 4K photo.
- **Solution:** While the engine handles local files, slicing a 10MB photo into 400 SVG/Canvas pieces is CPU-intensive for older tablets. Try resizing the photo or picking a smaller grid size for older devices.

### Known Limitations
- **Piece Rotation:** Currently, all pieces remain upright. There is no mechanic to rotate pieces 90/180/270 degrees.
- **Save State:** If you close the browser mid-puzzle, your progress on the custom image is not saved.

---

## Performance & Compatibility
- **Load Time:** Instantaneous UI load. Puzzle generation time depends on image file size and grid dimensions.
- **Mobile Support:** Fully functional, though larger grids (10x10+) are best played on a tablet or desktop screen.
- **Offline:** 100% functional without internet connectivity once loaded.

---

## Documentation Links
- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the Canvas piece-slicing and snapping math works
- 🛣️ [TODO.md](TODO.md) - Upcoming features
- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history
- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & ES5 Canvas rendering
- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)
**License:** Standard MIT / Non-Commercial Family Use
