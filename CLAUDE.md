# F.O.N.G. Root Hub - Developer Notes

## Purpose & Philosophy
The root hub is the front door. It must load instantly and never break. Therefore, we rely on minimal CSS and strictly native HTML to route users to the complex applications inside the `/games/` folder.

## Architecture Summary
It's a static HTML shell styled by CSS variables. See `ARCHITECTURE.md` for the folder structure.

## Critical Fixes / Gotchas
- ⚠️ **Relative Paths:** Do not use `/games/...`. You must use `./games/...` or navigation will break when deployed to GitHub Pages `develop` branch (`/beta` folder).
- ⚠️ **ES5 JS:** When we add the `hub-data.js` script to handle the play counter, it must be strict ES5. Do not use `fetch()`, `const`, or arrow functions here.

## Last Session Notes
**Session 2026-02-28 (Claude)**
- Committed Big 2 game (`games/cards/big2/`) + hub wiring — was sitting uncommitted.
- Homepage polish pass: featured hero two-column on desktop (glowing visual panel), filter counts on pills, `minmax(200px)` grid (3–5 cols), NEW badges on Big 2 + Space Invaders, "26 games" count in library header.
- Added Quick Play horizontal scroll carousel between hero and library (all 26 games, arrow buttons).
- Mobile filter: replaced scrolling pills with a single "All (26) ▼" button that opens a bottom-sheet popup.
- Commits: `7a3cab7` (polish), `ddf2a5b` (carousel + popup).

**Known minor bug:** `.filter-popup-overlay.open .filter-mobile-arrow` selector doesn't rotate the arrow — the arrow element is inside `.filter-mobile-btn`, not inside the overlay. Fix: move the arrow rotation selector or toggle a class on the button directly.

**Next up:** TBD — user moving to another project.

---

## Lessons Learned — For All LLMs Reading This

### Incident 2026-03-22: Agent Resource Waste (see `INCIDENT-2026-03-22.md`)

**What happened:** A request to write one HTML file consumed ~80% of the user's weekly API budget and produced zero deliverables. A background agent ran for 60 minutes reading files, then timed out.

**Rules to follow — no exceptions:**

1. **Write first, read never (unless truly necessary).** If the task prompt contains API signatures, defaults, and structure — that is enough. Do NOT read source files "just to be safe."
2. **Never launch an agent to write a single file.** Use the `Write` tool directly.
3. **Act on "stop" immediately.** When the user says "stop", "pause", or any variant — drop everything, make zero tool calls, and say only one short sentence confirming you've stopped. Do not narrate what you were doing. Do not explain. Do not promise future actions. Just stop.
4. **No agents for write tasks.** Agents are for exploration and research across many unknown files — not for code generation tasks with a clear spec.
5. **If you catch yourself about to read a file before writing — stop. Ask: does the output depend on something in that file that isn't already in the prompt? If no, skip the read.**

**Root cause:** LLMs default to a "research first" pattern. This is wasteful when the task is already fully specified. Treat a detailed task prompt as sufficient context and act immediately.
