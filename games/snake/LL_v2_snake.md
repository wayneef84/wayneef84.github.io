# Project Post-Mortem: Neon Serpent (Snake)

**Date:** January 12, 2026
**Project:** Neon Serpent (Mobile Snake)
**Tech Stack:** HTML5 Canvas, Vanilla JS, CSS Variables

---

## 1. Project Overview
A modern, mobile-first adaptation of the classic Snake game. The primary goal was to solve the "Touch Control" problem for Snake on mobile without using an ugly on-screen D-Pad.

**Key Features:**
- **Relative Turning:** Instead of 4 directional buttons, we use 2 buttons (Left/Right) relative to the snake's current heading.
- **Dynamic Themes:** CSS classes on the `<body>` drive the visual style, while JS logic handles render-specific differences (like gradients vs. flat colors).
- **Attract Mode:** An autonomous greedy bot plays the game in the background while the user is on the start screen.

---

## 2. Version History

### v1.5 - Responsive & Safe Area
- **Fix:** Switched to `100dvh` to handle mobile browser address bars resizing the viewport.
- **Fix:** Added `env(safe-area-inset-bottom)` to prevent the Home Bar from covering controls.
- **Desktop:** Added media query `min-width: 800px` to hide touch controls and expand the canvas on PC.

### v1.4 - Autoplay (Attract Mode)
- **Feature:** Implemented a simple greedy algorithm that auto-plays the game when idle.

### v1.3 - Modes & Mechanics
- **Feature:** Added "Color Eater" (Chameleon) and "Retro" (B&W) modes.

### v1.6 - Polish Update
- **Feature:** Added Sound Effects using Web Audio API (Eat, Crash) with a Mute toggle.
- **Feature:** Added Swipe Controls option for better mobile experience.
- **Mechanic:** implemented Speed Ramp (game gets faster as score increases).

---

## 3. Key Technical Insights

### A. The "100vh" vs "100dvh" Trap
On mobile browsers (Safari/Chrome), `100vh` often includes the area *behind* the URL bar. This caused our bottom controls to be cut off.
- **Solution:** Use `height: 100dvh` (Dynamic Viewport Height) which updates as the browser chrome expands/contracts.

### B. Safe Area Insets
Newer iPhones have a "Home Bar" at the bottom that interferes with touch buttons.
- **Solution:** `padding-bottom: env(safe-area-inset-bottom, 20px);`. The `20px` is a fallback for devices that don't support `env()`.

### C. Responsive Canvas Sizing
In `resize()`, we calculate available height dynamically:
```javascript
const controlsHidden = getComputedStyle(controlsArea).display === 'none';
const controlsHeight = controlsHidden ? 0 : 120;
// use controlsHeight to calculate canvas size
```
This ensures the game uses the empty space on Desktop when buttons are hidden.

---

## 4. Todo / Future Improvements
- [x] **Sound:** Add retro blips for eating and crashing.
- [x] **Swipe Support:** Add an option to toggle between Buttons and Swipe.
- [x] **Speed Ramp:** Increase game speed slightly every 50 points.
- [ ] **High Score:** Persist high score to local storage.