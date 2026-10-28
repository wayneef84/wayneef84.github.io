## Letter Tracing - Development Guide

### Project Goals
Educational letter tracing app for a 4-year-old. Help learn uppercase and lowercase letters through guided tracing with positive reinforcement.
**Current Status:** v1.0 (Uppercase Verified, others Beta).

### Architecture: "Engine vs. Content"
To support multiple packs (Numbers, Shapes) without changing code, we separated the game logic from the vector data.

| File | Role | Responsibility |
|------|------|----------------|
| `content.js` | The Data | JSON-like structure defining packs, letters, and vector instructions (lines/arcs). |
| `game.js` | The Engine | Rendering, input interpolation, guidance logic, and win states. |
| `index.html` | The UI | Pack selector, Guidance Mode selector, and Canvas container. |

### File Structure
games/letters/ ├── index.html # Main hub with selectors ├── css/ │ └── style.css # Kid-friendly styling, flexbox header ├── assets/ │ └── content.js # Variable-based data packs (Uppercase, Lowercase, etc.) └── js/ └── game.js # Main game loop and validation logic


### Key Features & Implementation Details

**1. The Data Structure (`content.js`)**
- Uses a "Command Pattern" for shapes: `type: 'line'` or `type: 'arc'`.
- **Complex Shapes:** Letters like 'B' or 'D' use `type: 'complex'` to combine lines and arcs into a single continuous stroke.
- **Geometry Fixes:**
  - **Uppercase S:** "Figure 8" geometry using two counter-clockwise arcs meeting at the center. Top radius 20, Bottom radius 25 (Typographic balance).
  - **Uppercase G:** Distinct "C" shape + Horizontal Inset + Vertical Drop ("T-stem") for clear tracing.

**2. The Guidance System (5 Modes)**
To accommodate different skill levels, `game.js` implements 5 modes:
- 👻 **Guide:** A "ghost" dot travels the path to show direction and speed.
- 🟢 **Help (Default):** Pulses the start point green if the user hesitates.
- **Strict:** Enforces exact stroke order (Stroke 1 -> Stroke 2).
- **Loose:** Allows drawing strokes in any order (coloring book style).
- **Hard:** No hints, just tracing.

**3. Input Interpolation**
- Browser touch events can "skip" pixels during fast swipes.
- **The Fix:** `game.js` calculates intermediate points between `lastPos` and `newPos` (every 5px) to ensure the validation logic never misses a collision, even on fast swipes.

**4. Validation Logic**
- **Density:** The engine generates target dots every 4 virtual units along the vector path.
- **Tolerance:** User must touch within 45px of the target dot.
- **Lookahead:** The engine checks 3 points ahead to allow for slight corner-cutting without breaking the stroke.

### Packs & Status
- **ABC Uppercase:** ✅ Verified. High-quality geometry for S, G, etc.
- **abc Lowercase:** ⚠️ Beta. Path data present but tuning required.
- **Numbers 0-9:** ⚠️ Beta.
- **Shapes:** ⚠️ Beta.

### Version History

**v1.0 - The "Guidance" Update** (2026-01-08)
- **Engine:** Added 5-mode guidance system (Ghost, Help, Strict, Loose, Hard).
- **Geometry:** Rebuilt vector paths for 'S' (balanced loops) and 'G' (T-stem).
- **UI:** Added Pack Selector and Mode Selector to header.
- **Audio:** Added "Great Job!" speech synthesis and particle effects.
- **Architecture:** Refactored to `content.js` for easier content management.
- **Main Hub:** Integrated into `index.html` as "Learn Letters" card.