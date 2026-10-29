# Slots - Agent Session Log

## Most Recent Session

**Date:** 2026-10-29
**Agent:** Claude (Sonnet 5.5)
**Task:** Review and repair Slots, add themes and modes.

### What Was Done
- Reviewed v3.1 (canvas slot machine) and found it unreliable. Full list with line numbers is in CHANGELOG.md under 4.0.0 "Fixed".
- Rebuilt as small ES5 files: `engine.js` (pure maths), `themes.js` (data), `store.js`, `sfx.js`, `view.js` (drum reels and board), `modes/*.js` (one per mode), `ui.js` (controller).
- 60 themes (v4.1.0 added 6 K's Picks), 6 modes, free refill, calm mode, save migration from the old `dadsSlotsSave` key.
- Added `tests/sim.js` (headless RTP and invariants). Playwright runs were done from outside the repo.

### How It Works (For Next Agent)
- Read DESIGN.md first (modes, how to add a theme or a mode) then ARCHITECTURE.md.
- Coins change in exactly one place: `credit()` and the bet deduction in `onSpin()` in `js/ui.js`. A round has a `paid` map, so one tag pays once.
- Pay tables are tuned numbers. Do not edit them by hand. Re-run `node games/slots/tests/sim.js` after any change.

### Blockers / Questions
- Old audio files in `audio/` have unknown origin and are not used. See ASSET_LOG.md.
- Safari and Firefox untested.

### Success Criteria Met
- [x] 7 required docs plus DESIGN.md and ASSET_LOG.md
- [x] `node scripts/check-site.mjs` ends with 0 errors
- [x] Simulation inside 3 points of target for every mode

### Next Steps (For Next Agent)
1. Real-device pass on iOS Safari and Android Chrome.
2. Decide whether to delete the unused `audio/` folder.
