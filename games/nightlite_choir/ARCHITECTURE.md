# Nightlite Choir+: Architecture

Standalone static game. Strict ES5, no libraries, no network, relative paths, works from file:// and GitHub Pages. The engine is forked (copied and adapted) from S4K Mixer v2. Nothing is imported from another game folder.

## Files
```
games/nightlite_choir/
  index.html          four screens: doors, one world screen (filled in per world), Collection, Mixing pot
  css/style.css       layout, doors, stage, tray, glow dots (theme colors are CSS variables)
  js/synth.js         NightliteSynth.render(spec, bpm, seed): spec to a looping Float32Array
  js/art.js           NightliteArt.make(spec) and dataUri(): creature art as SVG
  js/worlds/garden.js world data: theme, 90 BPM, 4 creatures (art spec + synth spec)
  js/worlds/attic.js  world data: theme, 100 BPM, 4 creatures, dust-mote glow
  js/worlds/observatory.js  world data: theme, 80 BPM, 4 creatures, star-sky look
  js/worlds/blends.js 6 blend creatures: art spec, synth spec, `blend: [2 to 5 ids]` (the recipe table), `clue`
  js/worlds/blends_claude.js  15 more blends (global NightliteBlendsExtra_CLAUDE). Any NightliteBlendsExtra_* global is merged
  js/recipes.js       NightliteRecipes: collectBlends, build (match, hint, suggest, fromStage, tempo), roll, rareSynth. No DOM
  tests/nightlite.test.js  (repo root tests/) node test with a fake window
  ../../js/gamesaves.js  shared FongGameSaves (export and import of the keys below)
  ../../js/gdrive-config.js, ../../js/gdrive-backup.js  optional FongGDrive
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

## Settings overlay
`#cfgOv` in index.html, logic in `js/app.js` (`openConfig`, `closeConfig`, `cfgExport`, `cfgImport`). Any `.gearBtn` opens it. `setVolume` and `setMuted` are shared with the world controls and call `syncCfg`. Import is a dry run first, then a real write through `FongGameSaves.importJSON(text, {mode, only: ['nightlite-choir']})`, then a reload. The `loadingSave` flag stops `saveProgress` so the old in-memory state cannot overwrite the import. The document key handler (`onKey`) closes the overlay on Escape and ignores other keys while it is open. Everything else in the body is marked `inert` and `aria-hidden` and restored on close. `nightlite.undo` holds the one-step undo and is not in the manifest.

## Milestone 3: sparks, eggs, pot (v0.4.0)
- Screens: `doors`, `world`, `collect`, `pot` (`S.screen`). `openScreen(name)` pushes the current screen on `S.back` and pauses sound if it came from a world (the stage is kept). `goBack()` pops it and restarts the voices via `resumeWorld()`. `leaveWorld` and `enterWorld` clear the stack. Collection and pot use the calm door theme.
- Blends are creatures in `charById` with `isBlend: true`, `world: 'blends'` and a tempo taken from the first parent's world, so the tempo rule (first creature placed sets it) is unchanged. They are placeable only when owned (`S.owned[id]`). The tray view `S.view` is a world id or `'blends'` (the fourth chip). Blends do not change the theme.
- Recipes: `recipeByKey['a+b']` (parent ids sorted, joined with `+`) gives the blend id. The pot (`mix2`) and the egg both end in `S.owned[id] = true`. Only the pot sets `S.found[key]` (the Discovery book). Parents are never touched.
- Sparks: `S.sparks`, cap 99. One interval (1 s) calls `tick(dt)`. It skips when `document.hidden`, ignores gaps over 2 s and only counts play time when `S.screen === 'world'` and two or more friends are on the stage. `SPARK_EVERY` 15, `WISH_GIVES` 3, `EGG_COST` 5, `HATCH_SECS` 20, `WARM_SHAVE` 2 are constants at the top of app.js.
- Nest: `S.nest = { left: seconds }` or null, one egg at a time. `nestTick` counts down visible time (not wall-clock time, so closing the page never costs or rewards anything). The blend is picked when the egg hatches from the ones not owned yet. If none are left, the sparks are refunded (`hatch`, and `getEgg` straight away when all 6 are owned).
- Save: `nightlite.save` = `{ v: 4, sparks, blends: [ids], found: ['a+b', ...], nest: { left } | null }`, written on every change and on page hide. `loadProgress` validates every field and ignores unknown ones. `nightlite.mix` snapshots get a `v` field; older snapshots without it still load. Blends not owned are dropped from a loaded mix.
- UI sounds (wish, hatch, pot): `chime(notes)` plays a few soft sine notes (C pentatonic) through the same master gain, so Mute and Volume apply.
- Art additions for the blends: accessory `ringband`. The egg and nest are a small inline SVG written in js/app.js (`eggSvg`).

## v0.5.0: pot upgrade
- Recipes: `blend` is 2 to 5 distinct ids (base or blend). Key = sorted ids joined with `+` (2 ingredient keys are the same as before, so old `found` keys still match). `NightliteRecipes.build` makes `recipeByKey`, `recipes` (each with `ing` and `tier`: 2 when an ingredient is a blend) and an `errors` list (wrong count, unknown id, repeat, same set as another recipe). Matching is an exact set match, order never matters.
- Merge: `collectBlends(window)` takes `NightliteBlends.chars` first, then every `window.NightliteBlendsExtra_*` global in alphabetical order. A repeated id is skipped.
- Tempo: `model.tempo(id)` follows the first listed ingredient down to a base friend and uses that world's tempo (depth capped). Existing 2 ingredient blends are unchanged.
- Pot: `S.pot` has 5 slots. Mix needs 2 or more. `model.hint` gives `{kind:'almost', n}` (smallest number short, recipes not found yet, other ingredients owned) or `{kind:'many'}`. `model.suggest(stage, picks, owned, found)` lists recipes with all ingredients on the stage, or containing the picks, owned ingredients only, not found first. `model.fromStage` picks up to 5 stage friends, preferring the biggest overlap with a recipe not found yet. Tray: 12 base friends plus owned blends.
- Book: page 1 (base friends only) and page 2 (uses a blend), "?" cards show N faces and the clue. The Collection counts found out of total.
- Rares: `S.rares['<id>_rare']`. At init each blend gets a rare twin in `charById` (`rare: true`, art from `NightliteArt.rareSpec` = hue shift plus sparkles, synth from `rareSynth` = octave layer and extra harmonic, or a shimmer layer for noise, all C pentatonic). Roll: `NightliteRecipes.roll(Math.random, S.rareOn)` is true about 1 time in 10. A rare comes IN ADDITION to the normal blend (that is still owned and its recipe found). Rares are not pot ingredients (a rare counts as nothing extra), show a star in the tray, stage, book and Collection ("Rare friends" card), and live in `nightlite.save` as `rares: [...]`. Toggle: `nightlite.rare` = '1' or '0', registered in `js/gamesaves.js` with the other nightlite keys.
- Save v5: adds `rares`. A v1 to v4 save loads as it is (rares start empty). `nightlite.rare` is stashed and restored with the import undo.

## v0.5.0 review fixes
- `build` rejects, in rounds, any blend with a wrong ingredient count, an id that is also a base friend, a repeated or unknown ingredient, the same ingredient set as an earlier blend, an ingredient cycle (also through other blends) or an ingredient that was itself rejected. Rejected blends are in `errors` only: they are not in `byId`, `blendById`, `recipes` or `valid`. `init` builds the model first, sets `NightliteBlends.chars = model.valid` and `console.warn`s every error, so a bad extra set never leaves a friend without a recipe. Tray, pot tray, eggs, book and counts all read `blendList()` (= `model.valid`).
- Vetting a new set: `node tests/nightlite.test.js` builds every `NightliteBlendsExtra_*` set loaded from `js/worlds/blends_*.js` plus the base blends and fails on any error.
- Rare sound: wrappers (`voice`, `noise`) copy the base `amp`, the extra layer has a level `lvl` (new, `js/synth.js` layers only, default full). The test renders every blend and keeps the rare peak within 1.3x of the base. Drum voices drip, clop and thrum go up a whole octave (pitch x 2), whoosh is left alone, unpitched voices get x 1.25.
- `loadProgress`: ids are looked up with `hasOwnProperty`, each list is cut at 200 entries, entries must be strings and a rare needs its blend already owned.
- Restore previous: an undo copy without a `rare` field leaves `nightlite.rare` as it is.

## Drive backup in the overlay

`cfgDriveEnsure(then, who)` in `js/app.js` runs `then` once connected: unconfigured shows the not set up message, not connected asks the grown-up question (first tap) and then calls `FongGDrive.connect` (second tap, it needs a tap). Back up calls `FongGDrive.backupNow('nightlite-choir')`. Restore lists backups with scope `nightlite-choir` or `all` (up to 5 buttons in `#cfgDList`), and picking one puts the text in `cfgText` and the paste box (read only if over 5000 characters, shown cut) after a dry run. The write itself is the unchanged `cfgImport`. The token lives in memory only.
