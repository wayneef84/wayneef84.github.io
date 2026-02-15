# F.O.N.G. Root Hub - Developer Notes

## Purpose & Philosophy
The root hub is the front door. It must load instantly and never break. Therefore, we rely on minimal CSS and strictly native HTML to route users to the complex applications inside the `/games/` folder.

## Architecture Summary
It's a static HTML shell styled by CSS variables. See `ARCHITECTURE.md` for the folder structure.

## Critical Fixes / Gotchas
- ⚠️ **Relative Paths:** Do not use `/games/...`. You must use `./games/...` or navigation will break when deployed to GitHub Pages `develop` branch (`/beta` folder).
- ⚠️ **ES5 JS:** When we add the `hub-data.js` script to handle the play counter, it must be strict ES5. Do not use `fetch()`, `const`, or arrow functions here.

## Last Session Notes
**Session 2026-02-15 (Gemini)**
- Built Phase 2 UI integration.
- Delivered HTML, CSS component files, and this 7-file documentation suite.
- Next step: Claude needs to write the `hub-data.js` to hydrate the global play counter in the header.
