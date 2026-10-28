# Byte Runner: Changelog

## v1.0.0 (2026-10-25)
First arcade release.

### Game
- Self playing pixel platformer: courier robot, data crates, floating platforms, glitch bugs, data chips, gates.
- Look ahead autopilot (gaps, walls, steps, stomp timing); keyboard and touch takeover; returns to autoplay after 8 s idle.
- Four stage themes (Dusk, Glacier, Ember, Jade) plus a victory world with fireworks.
- Fixed 60 Hz timestep, 320x176 canvas, 3x5 bitmap font for the in game HUD.

### Monitor
- `byte-runner.ps1`: any number of stages, labels, robocopy logs, measured speed over 5 minutes, ETA and finish time.
- `-Source` to measure the total once when the size is unknown.
- Finished stages stop being scanned so the next stage is not slowed down.
- Uses `index.html` from next to the script, otherwise downloads it from the arcade and caches it.

### Page
- Live mode on `file://` (polls `status.js` with a cache buster), demo mode on the site, automatic switch from demo to live when data appears.
- Status pill: LIVE, STALE, DONE, HALTED, DEMO. Accepts the earlier single purpose v1 status format.

### Origin
- Grew out of a one off progress screen for a two stage drive backup (external to PC to game drive), rebuilt as an original game and generalized.

## Unreleased
- `byte-runner.ps1` is no longer published. It is git-ignored and kept as a private local utility. The "Watch your own copy" section on the page was reduced to a short note.
