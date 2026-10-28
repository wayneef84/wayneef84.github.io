# Byte Runner Quest: Architecture

## File structure
```
games/byte_runner_quest/
  index.html        Page shell: stage, header buttons, canvas, touch buttons, settings panel and Out of lives overlay.
  js/controls.js    BRQ_UI: settings, layout (fit, fill, rotate), fullscreen, pointer buttons. Loaded before game.js.
  js/levels.js      BRQ_LEVELS: segment library, 4 worlds, 12 level recipes, build(index).
  js/game.js        Engine, screens, rendering, audio, saves, input. Exposes window.__brq for tests.
  tests/solver.js   Dev tool: search bot that proves goals and disks are reachable.
  README.md  ARCHITECTURE.md  INFO.md  TODO.md  CHANGELOG.md  CLAUDE.md  AGENT.md
```
All scripts are strict ES5 with no dependencies. Shares its look (palettes, sprites, 3x5 font) with `games/byte_runner/` by copy, not by import, so either game can change without breaking the other.

## Levels
A level is a list of segment names. Every segment is 11 rows tall and starts and ends with ground on rows 9-10, so segments join in any order. `build(index)` concatenates them into `rows[11][width]` plus a marker list, and throws if a segment is malformed or the level does not have exactly 3 disks.

| Tile | Meaning | Marker | Becomes |
|---|---|---|---|
| `#` | ground | `P` | player start |
| `X` | crate (solid) | `K` | checkpoint flag |
| `=` | one-way platform | `G` | goal gate |
| `^` | spikes (1 damage) | `c` / `D` | chip / golden disk (`NAME*` keeps the disk) |
| `~` | liquid (instant out) | `b` / `f` / `F` | bug / spark / drone |
| | | `M` / `V` / `S` | horizontal mover / vertical lift / spring |

The Endless Run and the title demo use a procedural level (`makeProc`) that generates columns on demand with the same tile codes, so the engine never needs to know which kind it is running.

## Engine
- **Fixed timestep:** 60 Hz `step()`, `render()` once per animation frame. Internal canvas 320x176 (20x11 tiles), scaled with `image-rendering: pixelated`.
- **States:** `title` (autopilot demo behind the logo) > `select` > `play` > `pause` / `clear` / `over`.
- **Physics:** axis separated AABB vs tiles. Gravity 0.22, max fall 4.6, run 2.0, jump -4.8 cut to -2.2 on release, spring -7.2. Coyote time 6 frames, jump buffer 7 frames (about 100 ms and 117 ms). Ice (world 2 ground) changes acceleration 0.3 > 0.05 and friction 0.3 > 0.025.
- **One-way platforms and movers** only catch a body whose bottom was at or above their top on the previous frame. Riding a mover adds its per-frame delta to the hero.
- **Deterministic:** movers, sparks and drones are pure functions of the level frame counter `lf`; nothing in physics uses randomness. That is what lets `snapshot()` / `restore()` and the solver work.
- **Damage:** 3 batteries, 70 frames of invulnerability after a hit, knockback away from the source. Pits and liquid skip the batteries.

## Controls and layout (`js/controls.js`)
- `#stage` holds all the UI. On touch devices, in fullscreen, in the fill-screen fallback or when rotated it is `position: fixed` with an explicit pixel size, so the page never scrolls. `layout()` runs on resize, orientation and fullscreen changes and sizes the canvas to fit.
- **Rotate view:** the stage gets width = viewport height, height = viewport width and `transform: translate(vw,0) rotate(90deg)` (origin top left). It only applies while the viewport is portrait. DOM buttons need no maths. `canvasPoint()` maps a screen point to the 320x176 canvas: canvas x = screen y minus the canvas top, canvas y = canvas right edge minus screen x.
- **Layout classes on the stage:** `fill`, `rot`, `land` (wide, buttons overlay the sides), `narrow`, `immersive` (fullscreen or fill, compact header), `auto`, `lefty`.
- **Fullscreen:** request on `documentElement`, webkit prefix, fallback `cfg.fill` mode when unsupported or rejected. `screen.orientation.lock('landscape')` is tried on entering fullscreen and failures are ignored.
- **Buttons:** `bindHold()` uses pointer events with pointer capture, one held key per button, so several fingers work at once. Old browsers fall back to touch and mouse events. Jump fires on pointerdown. Taps on the canvas feed the canvas menus.
- **Settings** in their own key, always in try/catch. Defaults: rotate off, fill off, auto-run off (right), left-handed off, vibrate off, lives 3. `lives` 0 means unlimited.
- game.js gives it hooks: `press`, `release`, `tap`, `turn`, `getState`, `pause`, `resume`, `changed`, `continueStage`, `levels`.

## Lives
`run.lives` counts down on each death in a static level (-1 = unlimited). At 0, after the death animation, state `out` shows the DOM overlay (buttons locked for half a second). Continue stage calls `startLevel(index, carry)` so deaths and continues carry over, lives refill and the stage starts again from its beginning. Nothing outside that stage resets. Endless Run keeps one life. `save.deaths`, `save.continues` and `save.lv[id].deaths` are written only outside solver runs (`forcedInput` null).

## Saves
`localStorage['fong.byteRunnerQuest.v1']`:
```json
{ "v": 1, "unlocked": 2, "endless": 412, "muted": false, "deaths": 7, "continues": 1,
  "lv": { "1-1": { "done": true, "best": 1057, "disks": [true, true, false], "deaths": 3 } } }
```
`best` is in frames (60 per second). Disks are a union across clears; a disk only counts if you finish the level in that run. All storage calls are wrapped in try/catch so private mode still plays.

## Audio
Web Audio oscillators with short pitch sweeps, created on the first key, tap or click (browsers block audio before a gesture). No audio files.

## Verification
`tests/solver.js` runs a best-first search over 6-frame input macros (run, jump, short hop, wait, back) using `__brq.snapshot()`, `restore()` and `stepWith()`, so it uses the exact game physics. v1.0.0 result: all 12 goals and all 36 disks reachable without taking damage.
