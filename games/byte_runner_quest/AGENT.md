# Byte Runner Quest: Agent Notes

## Session 2026-10-27 (Claude, branch claude/quest-continue-autorun)
**Done**
- v1.2.0: Out of lives choice (Continue level or Restart stage = X-1, 3 s countdown to the saved default, "Always use this choice", setting in the panel) and a quick AUTO ON/OFF button plus R key. Wayne first said "checkpoint"; the final meaning is replay the level or go back to level 1 of the stage, so no checkpoints were added.

**Verified**
- Emulated phone 390x844, normal and Rotate view, left-handed: overlay with countdown, countdown starts the default, tap picks at once, hint tap stops the countdown, checkbox saves the default and survives reload and shows in settings, Restart stage returns to X-1, first level handled, Endless unchanged, auto toggle runs and stops the hero, agrees with settings, TURN only when on, R key, desktop layout. All 12 goals by the solver. `node scripts/check-site.mjs` 0 errors.

**Not verified**
- Real phones. The 36 disk searches were not rerun (physics untouched).


## Session 2026-10-27 (Claude, branch claude/quest-mobile)
**Done**
- v1.1.0 mobile controls: pointer events, fullscreen with fill-screen fallback, Rotate view, auto-run, left-handed, lives with Out of lives overlay and Continue stage, vibrate on death, settings panel. New file `js/controls.js`.

**Verified**
- Emulated phone (390x844, touch): settings open and persist, Rotate view fills the screen and tapping the rotated JUMP button jumps, canvas taps map in rotated mode, multi-touch (hold right plus jump), auto-run and TURN, tap anywhere jump, jump buffering, lives to Out of lives to Continue stage (lives refilled, earlier progress kept), vibrate stub called, vibrate disabled when missing. Solver and site check pass.

**Not verified**
- Real phones and tablets, real Fullscreen on iOS or Android, orientation lock, real vibration.

**Next**
- See `TODO.md`.

## Session 2026-10-25 (Claude)
**Done**
- Built v1.0.0 from the Byte Runner art and physics: 12 levels, level select, Endless Run, saves, sound, touch.
- Catalog entry in `js/catalog.js` (arcade, NEW), row in `GAME_INVENTORY.md`, name in `games/README.md`.

**Verified**
- `js/levels.js`, `js/game.js`, `tests/solver.js` parse as ES5.
- All 12 levels build with 3 disks; solver reaches every goal and all 36 disks with no damage taken.
- Three disks were 1 px out of reach on the first pass (3-1 drone run, both spike beds); moved down one tile and re-verified.
- Headless Chromium: title > select > play by keyboard, locked level refused, clear screen > NEXT, save survives reload, phone width 390 px with touch buttons and tap menus, no page errors.

**Not verified**
- Real phones and tablets (only emulated touch).
- Audio by ear (code paths run without errors).

**Next**
- See `TODO.md`. Strongest next additions: par times, a boss world, a level editor.
