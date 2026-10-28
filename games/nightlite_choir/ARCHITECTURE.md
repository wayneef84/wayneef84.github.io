# Nightlite Choir+: Architecture

Standalone static game. Strict ES5, no libraries, no network, relative paths, works from file:// and GitHub Pages. The engine is forked (copied and adapted) from S4K Mixer v2. Nothing is imported from another game folder.

## Files
```
games/nightlite_choir/
  index.html          two screens: door screen and the world screen (Night Garden)
  css/style.css       layout, doors, stage, tray, glow dots (theme colors are CSS variables)
  js/synth.js         NightliteSynth.render(spec, bpm, seed): spec to a looping Float32Array
  js/art.js           NightliteArt.make(spec) and dataUri(): creature art as SVG
  js/worlds/garden.js world data: theme, 90 BPM, 4 creatures (art spec + synth spec)
  js/app.js           doors, screens, stage, tray, drag, undo, save/load, audio context, keys
  *.md                README, ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE, AGENT, DESIGN, IP-GUARDRAILS, ASSET_LOG
```

## How it works
- A world file registers itself in `window.NightliteWorlds`. A new world is one new file plus a script tag and a door entry in app.js.
- On tap, app.js renders the creature loop with the synth at the world BPM (cached), then starts it as a looping buffer on the next bar line with a soft fade-in. Master gain is capped at 0.6 and a compressor sits before the output.
- Audio context is created on the first tap (browser autoplay rules).
- Leaving a world stops the sound and keeps the stage. Coming back restarts it.
- Storage keys: `nightlite.vol`, `nightlite.mix`. All access is wrapped in try/catch, so storage can be blocked.
- Debug hook: `window.Nightlite` (state, voices, addChar). Not used by the UI.
