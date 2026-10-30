# Byte Runner Quest: Changelog

## Unreleased
- Saves the furthest level cleared (`byte-runner-quest:level`) and the Endless Run distance (`byte-runner-quest:endless`) through `FongScores`. Rules unchanged.
- The AUTO ON/OFF button moved from the thumb area to the top bar (first tool button), so it is hard to hit by accident. While auto-run is ON its border is a moving rainbow (static when the device asks for reduced motion). On devices without touch it still sits under the screen (press R).

## v1.1.0 (2026-10-27)
Mobile controls, for phones stuck in portrait and for young players.

### Added
- Settings panel (gear button): Fullscreen, Rotate view, Auto-run and direction, Left-handed, Vibrate on death, Max lives. Saved in `localStorage['fong.byteRunnerQuest.settings.v1']`.
- Fullscreen button using the Fullscreen API (webkit prefix too). Where it is missing (iPhone Safari) a fixed fill-screen mode with a small note. Same button exits, Esc exits. Landscape lock is tried in fullscreen and any failure is ignored.
- Rotate view: CSS-rotates the whole game 90 degrees and fits it to a portrait screen, with touch points mapped back. Works with no device rotation at all.
- Auto-run (right by default, or left): the hero runs by itself, big JUMP button, tap anywhere to jump, TURN button, arrow keys also turn.
- Lives: max 1, 3 (default), 5 or Unlimited (practice), hearts in the HUD, deaths counted per stage and in total, continues counted. Out of lives overlay with Continue stage (same stage, lives refilled, earlier progress kept) and Level select.
- Vibrate on death (off by default, disabled with a note where `navigator.vibrate` is missing).
- Left-handed layout.

### Changed
- Touch input uses pointer events with `touch-action: none`: jump on pointerdown, multi-touch (hold a direction and jump), pressed state, 64 px minimum buttons, no scrolling, zooming, text selection or long-press menu.
- Touch devices get a fixed full-viewport layout, landscape puts the buttons over the sides of the screen.
- New script `js/controls.js` (layout, pointer buttons, settings). Level physics, keyboard play and the solver are unchanged.
- Save file gains `deaths`, `continues` and per-level `deaths` (additive, no migration).

## v1.0.0 (2026-10-25)
First release. Branched off Byte Runner (the self playing backup monitor) into a standalone game.

### Added
- Title screen with the autopilot demo running behind the logo.
- Level select: 4 worlds x 3 levels plus Endless Run, locks, best times, disk icons, keyboard and tap navigation.
- 12 levels built from a segment library: Dusk Circuit, Glacier Grid, Ember Core, Jade Garden.
- New mechanics: one-way platforms, horizontal movers, vertical lifts, springs, spikes, liquid pools, ice floors, checkpoints.
- New enemies: sparks (bobbing, untouchable) and drones (patrolling, stompable), alongside bugs.
- 3 golden disks per level, 3 battery health, variable jump, coyote time, jump buffer.
- Pause menu (resume, restart, levels, sound), clear screen with time, chips, deaths and disks, Endless Run results.
- Saves in localStorage, `?unlock` parameter.
- Web Audio sound effects, M to mute.
- Touch buttons and canvas tap menus for phones and tablets.
- `tests/solver.js` search bot; every goal and disk verified reachable without damage.
