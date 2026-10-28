# Byte Runner Quest: Architecture

## File structure
```
games/byte_runner_quest/
  index.html        Page shell: canvas, touch buttons, exit and pause buttons. Loads the two scripts.
  js/levels.js      BRQ_LEVELS: segment library, 4 worlds, 12 level recipes, build(index).
  js/game.js        Engine, screens, rendering, audio, saves, input. Exposes window.__brq for tests.
  tests/solver.js   Dev tool: search bot that proves goals and disks are reachable.
  README.md  ARCHITECTURE.md  INFO.md  TODO.md  CHANGELOG.md  CLAUDE.md  AGENT.md
```
Both scripts are strict ES5 with no dependencies. Shares its look (palettes, sprites, 3x5 font) with `games/byte_runner/` by copy, not by import, so either game can change without breaking the other.

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
- **Physics:** axis separated AABB vs tiles. Gravity 0.22, max fall 4.6, run 2.0, jump -4.8 cut to -2.2 on release, spring -7.2. Coyote time 6 frames, jump buffer 7 frames. Ice (world 2 ground) changes acceleration 0.3 > 0.05 and friction 0.3 > 0.025.
- **One-way platforms and movers** only catch a body whose bottom was at or above their top on the previous frame. Riding a mover adds its per-frame delta to the hero.
- **Deterministic:** movers, sparks and drones are pure functions of the level frame counter `lf`; nothing in physics uses randomness. That is what lets `snapshot()` / `restore()` and the solver work.
- **Damage:** 3 batteries, 70 frames of invulnerability after a hit, knockback away from the source. Pits and liquid skip the batteries.

## Saves
`localStorage['fong.byteRunnerQuest.v1']`:
```json
{ "v": 1, "unlocked": 2, "endless": 412, "muted": false,
  "lv": { "1-1": { "done": true, "best": 1057, "disks": [true, true, false] } } }
```
`best` is in frames (60 per second). Disks are a union across clears; a disk only counts if you finish the level in that run. All storage calls are wrapped in try/catch so private mode still plays.

## Audio
Web Audio oscillators with short pitch sweeps, created on the first key, tap or click (browsers block audio before a gesture). No audio files.

## Verification
`tests/solver.js` runs a best-first search over 6-frame input macros (run, jump, short hop, wait, back) using `__brq.snapshot()`, `restore()` and `stepWith()`, so it uses the exact game physics. v1.0.0 result: all 12 goals and all 36 disks reachable without taking damage.
