# Byte Runner: Architecture

## File structure
```
games/byte_runner/
  index.html        Game + progress page. All CSS and JS inline, strict ES5, no external requests.
  byte-runner.ps1   Windows PowerShell monitor. Writes status.js, opens the page.
  README.md  ARCHITECTURE.md  INFO.md  TODO.md  CHANGELOG.md  CLAUDE.md  AGENT.md
```

## Data flow
```
copy job (robocopy, Explorer, anything)
        |  fills destination folder(s)
        v
byte-runner.ps1  -- every 10 s -->  %TEMP%\byte_runner\<title>\status.js   (window.hudData = {...})
        |                                              ^
        | copies or downloads index.html into the same |  index.html injects
        | folder once, then opens it (file://)         |  <script src="status.js?t=now"> every 3 s
```
`fetch()` and XHR are blocked on `file://` pages, but classic `<script src>` tags are allowed, so the page polls by injecting a script tag with a cache buster query (`?t=`). Without the cache buster the browser serves a stale copy.

## Page modes
| Mode | When | Data |
|---|---|---|
| live | opened from `file://` (or `?live`) and `status.js` loads | `status.js` |
| demo | served over http(s), `?demo`, or no `status.js` after 6 s on `file://` | `simData()`, two pretend stages, loops 30 s after finishing |

A page that fell back to demo keeps polling and switches to live as soon as `status.js` appears.

## status.js schema (v2)
```js
window.hudData = {
  v: 2, title: "Photo backup", te: 1792981234000 /* ms epoch */, ts: "7:20:34 PM",
  phase: "run" | "done" | "halted", left: 127 /* min */, fin: "9:27 PM", cur: "IMG_2034.JPG",
  stages: [ { label: "E: > D:", gb: 102.84, total: 271, pct: 37.9, mbs: 31.6, est: false,
              eta: 89, started: true, done: false, failed: -1 /* -1 = unknown */ } ]
};
```
`normalize()` also accepts the older flat v1 shape (`d`, `n`, `p1`, `p2`, ...).

## Game engine
- **Fixed timestep:** 60 Hz `step()` with an accumulator, `render()` once per animation frame. Internal canvas 320x176, scaled with `image-rendering: pixelated`.
- **Level:** 16 px tile columns stored in `level.cols[c] = { g: groundTopRow, b: { row: 1 crate | 2 platform } }`. `genChunk()` appends columns on demand (gap, crates, platform, bug, step, chip row) and old columns are dropped behind the camera. Seeded LCG keeps it deterministic.
- **Physics:** AABB vs tiles, X then Y resolution. Gravity 0.22, full jump -4.8, mid -4.1, hop -3.5 (px per frame).
- **Autopilot (`think`)**: probes ahead for a missing ground column, wall height over the next two columns, bugs (hop timed with the closing speed so it lands on them) and chips at hop height.
- **Worlds:** world = first unfinished stage + 1. When data says a stage is done, `pendingGate` makes the generator place a gate just off screen; passing it advances the world, shows a banner and fireworks. World count above the stage count is the victory world.
- **Speed link:** autopilot speed = 1.4 + MB/s / 250, clamped to 1.4..1.9 px per frame.

## Monitor (byte-runner.ps1)
- Folder size by plain .NET directory enumeration (much faster than `Get-ChildItem | Measure-Object`), skipping reparse points, `$RECYCLE.BIN` and `System Volume Information`.
- Rate: sliding 5 minute window of (time, bytes) samples per stage; guessed speed until 25 s of history.
- Stage end: robocopy log `Ended :` line, else the next stage starting, else (last stage) size at total and flat for 3 checks.
- Finished stages are not rescanned, so the monitor does not compete with the next stage reading the same drive.

## Dependencies
None. Fonts fall back to the system monospace when `../../assets/fonts/SpaceMono-Regular.woff2` is not reachable (the local copy in %TEMP%).
