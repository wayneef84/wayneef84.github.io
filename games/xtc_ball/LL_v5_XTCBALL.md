## Magic XTC Ball (Oracle) - Development Guide

### Project Goals
A mobile-first, physics-based "Magic 8 Ball" simulator. Focuses on "Juice" (satisfying animations) and deep customization.

### Architecture
| File | Role |
|------|------|
| `index.html` | Stage, Shadow (separate div), and Split-View Modal structure. |
| `style.css` | **3D Engine.** Uses `rotateX` for the flip, radial gradients for the sphere, and CSS triangles for answers. |
| `game.js` | **Logic.** Handles DeviceMotion (Shake), weighted RNG, localStorage CRUD, and dynamic font sizing. |
| `config.js` | **Data.** Contains the 15 preset balls and standard answers. |

### Key Logic Patterns
1.  **Split Shadow:** The `.shadow` div must remain *outside* the `.ball` div so it stays on the "floor" while the ball rotates.
2.  **Dynamic Fonts:** Labels (10-15) and Answers (long text) resize dynamically in `game.js` to fit their containers.
3.  **Liquid Color:** Custom balls allow `liquidColor` editing, which updates the CSS variable `--liquid-color` on the root.
4.  **Auto-Expand:** Textareas in the editor use `scrollHeight` to grow automatically.


Here is a comprehensive **Post-Mortem / Lesson Learned** document to save in your `games/oracle/` folder. This captures the entire development journey, the technical hurdles we overcame, and the specific logic patterns used, so future AI models (or you) can pick up exactly where we left off.

### `games/oracle/LESSONS_LEARNED.md`

```markdown
# Project Post-Mortem: Magic XTC Ball

**Date:** January 12, 2026
**Project:** Magic XTC Ball (formerly "Animated Oracle")
**Tech Stack:** Vanilla JS, CSS3 (3D Transforms), HTML5 (DeviceMotion)

---

## 1. Project Overview
The goal was to create a mobile-first, high-fidelity simulation of a Magic 8-Ball ("Logic vs. Juice").
- **Juice:** Heavy reliance on CSS 3D transforms (`rotateX`), radial gradients for texturing, and physics-based shaking.
- **Logic:** A highly configurable engine allowing for standard Pool Ball presets (1-15) and user-created custom balls with unique weights and colors.

---

## 2. Version History & Changelog

### v1.6 - "Juice" & Polish (Final)
- **Problem:** `<textarea>` elements looked static and clunky in the editor.
- **Solution:** Added an `autoResize` function attached to the `input` event. It resets height to `auto` then sets it to `scrollHeight` to grow dynamically as the user types.

### v1.5 - Multi-Line Support
- **Problem:** Users could not enter multi-line answers (e.g., "Ask\nAgain") because `<input type="text">` strips newlines.
- **Solution:** Swapped inputs for `<textarea>` elements in the JS generation logic.
- **Fix:** Wired up the `editLiquidColor` input which was added in v1.4 but not connected to the save logic.

### v1.4 - UI Overhaul (Split View)
- **Problem:** The settings modal was a long, blind list. Users couldn't see what the ball looked like until they saved.
- **Solution:** Refactored modal into a Split-View (Flexbox).
    - **Left:** Live Preview (`.ball-mini`) updated via `input` events.
    - **Right:** Control inputs.
- **Fix:** Added a `Select & Play` button for Preset balls (previously, users could only "Save" custom balls, making it impossible to switch back to a preset).

### v1.3 - Logic & Branding
- **Update:** Renamed to "Magic XTC Ball".
- **Logic:** Defined specific behavior for balls 1-5 (Optimist, Binary, Ternary, etc.) instead of generic randoms.
- **Creative:** Added "Arcade Themes" for remaining balls (Traffic Light, Vegas, etc.).

### v1.2 - The Pool Hall Update
- **Problem:** 3-digit labels (e.g., "10", "15") bled out of the white badge circle.
- **Solution:** Implemented **Dynamic Font Sizing** in `game.js`.
    - If `label.length > 2` -> Font Size 50px.
    - If `label.length == 2` -> Font Size 65px.
    - Else -> Font Size 80px.
- **Problem:** Long answers (e.g., "Concentrate and ask again") overflowed the triangle.
- **Solution:** Added similar character-count logic to shrink answer text size (13px -> 9px).

### v1.1 - Customization & Config
- **Architecture:** Switched from `config.json` to `config.js`.
    - *Lesson:* JSON does not support comments. Using a global JS constant (`ORACLE_CONFIG`) allows us to document the weights and logic inline.
- **Feature:** Added CRUD (Create, Read, Update, Delete) using `localStorage`.

### v1.0 - Visual Core
- **Technique:** Used `transform: rotateX(180deg)` to flip the ball.
- **Challenge:** The shadow was initially inside the `.ball` div. When the ball rotated, the shadow rotated to the "ceiling".
- **Fix:** Moved `.shadow` to a separate sibling `div` so it stays on the "floor" regardless of the ball's rotation.

---

## 3. Key Technical Insights (For Future Devs)

### A. The "Shadow Separation" Rule
When doing 3D flips on an object that rests on a surface, **never** put the shadow inside the rotating container.
- **Bad:** `<div class="ball"><div class="shadow"></div></div>` (Shadow flips upside down).
- **Good:** `<div class="shadow"></div> <div class="ball"></div>` (Shadow stays static).

### B. DeviceMotion & iOS Permissions
The Shake API (`DeviceMotionEvent`) requires explicit user permission on iOS 13+.
- **Pattern:** We implemented a hidden button (`#motionPermBtn`) that only reveals itself if `DeviceMotionEvent.requestPermission` exists.
- **Logic:** `(Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z)) > 15` is the sweet spot for a deliberate shake threshold.

### C. CSS Variables for Theming
We used CSS Variables (`--ball-color`, `--liquid-color`) on the `:root` (or specifically `this.dom.root`).
- **Benefit:** This allows JS to update a single value, and the CSS Gradients (which use these variables) update automatically without re-rendering the DOM structure.

```css
/* Example */
background: radial-gradient(circle, var(--ball-shine), var(--ball-color) 40%, #000 85%);

```

### D. CSS Triangles

The blue "answer triangle" is not an image or SVG. It is a CSS border hack:

```css
border-left: 55px solid transparent;
border-right: 55px solid transparent;
border-bottom: 95px solid var(--text-color);

```

*Note:* To center text inside this, we used Flexbox on an absolute span positioned precisely over the "body" of the triangle.

---

## 4. Pending Wishlist (Next Sprint)

* **Sound Effects:** Add a "slosh" sound on shake and a "ding" on reveal.
* **WebGL Upgrade:** If we need "true" lighting or reflections, migrate to Three.js (though current CSS 3D is 90% there with 1% of the file size).

```

### Next Step
Would you like me to create the final commit command for you, or is there anything else you'd like to tweak in the game before we wrap up?

```