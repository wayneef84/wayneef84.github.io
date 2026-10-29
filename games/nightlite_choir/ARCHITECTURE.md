# Nightlite Choir+: Architecture

Standalone static game. Strict ES5, no libraries, no network, relative paths, works from file:// and GitHub Pages. The engine is forked (copied and adapted) from S4K Mixer v2. Nothing is imported from another game folder.

## Files
```
games/nightlite_choir/
  index.html          two screens: door screen and one world screen (filled in for the Garden, the Attic or the Observatory)
  css/style.css       layout, doors, stage, tray, glow dots (theme colors are CSS variables)
  js/synth.js         NightliteSynth.render(spec, bpm, seed): spec to a looping Float32Array
  js/art.js           NightliteArt.make(spec) and dataUri(): creature art as SVG
  js/worlds/garden.js world data: theme, 90 BPM, 4 creatures (art spec + synth spec)
  js/worlds/attic.js  world data: theme, 100 BPM, 4 creatures, dust-mote glow
  js/worlds/observatory.js  world data: theme, 80 BPM, 4 creatures, star-sky look
  js/app.js           doors, screens, stage, tray, drag, undo, save/load, audio context, keys
  *.md                README, ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE, AGENT, DESIGN, IP-GUARDRAILS, ASSET_LOG
```

## How it works
- A world file registers itself in `window.NightliteWorlds`. A new world is one new file plus a script tag, a door entry and a name in `WORLD_ORDER` in app.js.
- One shared stage (6 slots) for all worlds. Each creature gets its world id and tempo at init. The stage tempo is set when the first creature goes on an empty stage (`setBpm`), so a Garden creature placed first makes an Attic creature play at 90 BPM, and the reverse at 100 BPM. Loops are step based, so they re-render at the stage tempo (cached per creature and tempo). Entering a world keeps a non-empty stage and its tempo.
- The tray has a world switcher (three chips from `WORLD_ORDER`, the shown world highlighted) above the 4 creatures of the shown world. A chip tap calls `setWorldView`: it changes theme, title and tray only. The stage, its sound, tempo and undo history are untouched. Entering from the door screen calls `enterWorld`, which also clears undo and restarts the voices. Keys 1 to 4 place the shown friends.
- On tap, app.js renders the creature loop with the synth at the world BPM (cached), then starts it as a looping buffer on the next bar line with a soft fade-in. Master gain is capped at 0.6 and a compressor sits before the output.
- Audio context is created on the first tap (browser autoplay rules).
- Leaving a world stops the sound and keeps the stage. Coming back restarts it.
- Storage keys: `nightlite.vol`, `nightlite.mix`. The one saved mix stores the slots and the tempo, and may hold creatures from both worlds. Older v0.1.0 saves have no tempo and load at the tempo of their first creature.
- Art generator additions for the Attic: bodies `doll`, `pony`, `tin`, `plush`, eyes `button`, mouths `stitch` and `grille`, accessories `braids`, `mane`, `horn`, `tuft`, `windkey` (a second one via `acc2`), plus `patch` and `mark: 'star'`. Synth additions: drum voices `clop` and `click`.
- Observatory additions: bodies `moon`, `star`, `comet`, `planet` (spec `ring` sets the ring color), eyes `twinkle`, mouth `hum`, accessories `nightcap`, `wand`, `sparkles`, `cowhat`, `swirl` (comet tail, drawn behind). Synth drum voices `whoosh` (airy sweep, 2.6 s per hit) and `thrum` (soft felt drum). Pad and bell are plain tone specs (chord pad, octave 6 and 7 bell).
- Observatory look: `glow.kind: 'stars'` builds a skylight and telescope silhouette (inline SVG), twinkling stars and three slow shooting stars (`buildSky`). Panels are translucent so the sky shows. `drawConstellation` puts an SVG of dashed pastel pink and lilac lines between the filled slots inside the stage. It has `pointer-events: none` and is redrawn on every stage change and resize.
- Theme per world: CSS variables set by `applyTheme`. The Attic adds a plank background, a cardboard stage and a sunbeam with dust motes (`glow.kind: 'dust'`). All access is wrapped in try/catch, so storage can be blocked.
- Debug hook: `window.Nightlite` (state, voices, addChar). Not used by the UI.
