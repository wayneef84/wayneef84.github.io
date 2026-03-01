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
