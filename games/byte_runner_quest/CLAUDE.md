# Byte Runner Quest: Developer Notes

## Purpose
Standalone platformer spun off from `games/byte_runner/` (the backup monitor). Hand built levels, level select, collectibles, saves. No connection to the monitor script.

## Architecture summary
`js/controls.js` (`BRQ_UI`) owns the page around the canvas: settings, fit and rotate layout, fullscreen, pointer buttons. `js/levels.js` holds data only (segments, worlds, level recipes, `build()`). `js/game.js` is the whole engine in one IIFE: level objects (static from `build()`, procedural from `makeProc()`), physics, a small state machine for screens, canvas rendering, Web Audio, localStorage. See `ARCHITECTURE.md`.

## Critical rules and gotchas
- **ES5 only** (repo Rule 2): no `let`, `const`, arrows, template literals, `for...of`, `Map`, `Set`, `Math.imul`, `Array.prototype.includes`. Check: `acorn.parse(src, { ecmaVersion: 5 })`.
- **Keep physics deterministic.** Movers, sparks and drones are functions of `lf`. Do not add `Math.random()` to anything that affects collisions; the solver and any future replay feature depend on it. Effects (particles, fireworks) may use `Math.random()`.
- **Segment rules:** 11 rows, all rows the same width, ground on rows 9-10 at the first and last column. `build()` throws otherwise, which stops the whole game from loading, so test after every edit.
- **Exactly 3 starred disks per level.** `build()` throws on any other count.
- **Reach limits** (with current constants): up 3 tiles from flat ground (52 px apex, a disk at 4 tiles is out of reach by 1 px), across 4 tiles at full run, up 7 tiles from a spring. Changing GRAV, JUMP or MAXV changes every level; rerun the solver on all 12.
- **Verify levels:** paste `tests/solver.js` into the console on the game page, then `__solve(i, 'goal')` and `__solve(i, 0..2)` for each changed level. Expect `ok: true`.
- **Touch and layout:** use pointer events and `touch-action: none`, jump on pointerdown, never `click` for gameplay buttons. Any new pointer maths on the canvas must go through `BRQ_UI.canvasPoint()` or it breaks in Rotate view.
- **Solver safety:** anything that writes saves or vibrates on death must check `forcedInput` is null, or the solver will pollute saves.
- **Keyboard feel:** do not change coyote, buffer, gravity or jump values for touch. Touch rides on the same physics.
- **Save format:** bump `SAVE_KEY` only with a migration; players lose progress otherwise.
- **Words:** stage = world X, level = X-Y (the HUD label). Use them in UI text, docs and comments.
- **Out of lives and auto-run:** choices are `level` and `stage` (`cfg.outPick`). Do not add mid-level checkpoint continues. The AUTO button and the settings row share `cfg.auto`; route changes through `doAct('auto')`. R is the auto-run key.
- **Keep it original.** No characters, sprites, sounds, HUD layouts or names from commercial games.

## Test hooks
`window.__brq`: `state()`, `hero`, `level()`, `run()`, `startLevel(i)`, `startEndless()`, `toSelect()`, `toTitle()`, `snapshot()`, `restore(s)`, `stepWith({left, right, jumpPressed, jumpHeld})`, `save()`, `setSel(row, col)`, `down`, `livesMax()`.
UI: `BRQ_UI.cfg` (live settings object), `BRQ_UI.layout()`.
