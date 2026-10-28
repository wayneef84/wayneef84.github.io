# 🎰 Dad's Slots - Project Post-Mortem

**Version:** 1.0 (Gold Master)
**Date:** [Current Date]
**Status:** Complete

---

## 📝 Lesson Learned: The "Invisible Line" Illusion
During the development of the win animation, we encountered a persistent bug where the win line appeared "below" the tiles or invisible.

### The Problem
We initially used a single draw pass for the symbols. When we tried to draw a "glowing" line using `globalCompositeOperation = 'lighter'`, the line blended with the white background of the emoji text and effectively disappeared due to how canvas color math works (White + Light = White).

### The Solution
We moved to a **Layered Rendering Pipeline**:
1.  **Layer 1 (Bottom):** Draw the dark card backgrounds.
2.  **Layer 2 (Middle):** Draw the symbol text/emoji.
3.  **Layer 3 (Top):** Draw the Win Line *strictly after* the symbols.

This ensures the line physically sits on top of the graphics, solving the visibility issue without complex blend modes.

---

## 🚀 Items for Next Version (v1.1)

### 1. Sound Effects
* **Current State:** Silent.
* **Goal:** Add satisfying "click", "spin", and "win" sounds using the Web Audio API.

### 2. Free Spins Feature
* **Current State:** Placeholder logic exists for Scatters.
* **Goal:** Implement a Free Spins bonus round where the background color changes and wins are multiplied.

### 3. Mobile Touch Improvements
* **Current State:** Basic responsive layout.
* **Goal:** Add swipe-to-spin gestures on the canvas area.

### 4. Persistence
* **Current State:** Balance resets on refresh.
* **Goal:** Save player balance to `localStorage` so they don't lose their winnings.