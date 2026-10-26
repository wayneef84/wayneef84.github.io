# Byte Runner Quest: TODO

## Ideas
- [ ] World 5 with a boss: a big glitch bug that has to be stomped three times between waves of sparks.
- [ ] Par times per level and a gold time medal, shown on the select screen.
- [ ] Level editor page: paint segments on a grid, test in place, export the recipe for `levels.js`.
- [ ] Short chiptune music loop per world (Web Audio sequencer), off by default.
- [ ] Ghost replay of your best run (record inputs per frame; physics is deterministic so replay is exact).
- [ ] Landscape hint on phones, and an optional full screen button.
- [ ] Gamepad support (Gamepad API, polled in `step()`).
- [ ] Share code: encode best times and disks into a short string to compare with friends.

## Known issues
- On a phone held upright the game view is small; landscape is much better.
- A moving platform carrying the hero into a wall can push the hero a pixel into it (no current level does this).
- Spikes deal damage when touched from the side, not only from above. Intended, but worth stating in the help.

## When adding or changing levels
- Keep every segment 11 rows, equal width rows, ground on rows 9-10 at both ends.
- Keep exactly 3 starred disk segments per level.
- Run `tests/solver.js` for every changed level (goal and each disk). Jump reach for reference: 3 tiles up from flat ground, 4 tiles across at full speed, 7 tiles up off a spring.
