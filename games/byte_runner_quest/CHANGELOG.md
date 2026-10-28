# Byte Runner Quest: Changelog

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
