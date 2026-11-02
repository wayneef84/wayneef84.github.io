# Game saves (FongGameSaves)

`js/gamesaves.js`, `window.FongGameSaves`. Strict ES5, no network, every storage call in try/catch. Loaded by `index.html` (before `js/settings.js`) and by Nightlite Choir+.

## What it covers

Saved progress and user-made content that games keep in localStorage. Not covered because they have their own home: high scores (`FongScores`), theme, cheers, play options. Settings-only keys (mute, volume of games without progress, themes, zoom and so on) are left out on purpose.

Registered in the manifest: nightlite-choir, s4k-mixer-v2, s4k-mixer (custom characters), slots, jigsaw (progress only, not pictures), sudoku (game in progress), xtc-ball (custom balls), card-games (balance, War history), tracing-words, tracing-chinese, tracing-sentences. Skipped: Jigsaw pictures (large image data), J / J v1 (per-pack dynamic keys, J has its own export), minesweeper, snake, byte runner, memory match, falldown, sky breakers (scores or settings only).

## API

- `register(id, {name, keys, json})` idempotent, merges keys. `json` lists keys whose value must parse as JSON.
- `list()` returns `[{id, name, keys, hasData}]`.
- `exportGame(id)` returns the single-game file text. `exportAll()` returns the all-games file text. `exportObject()` returns the `games` object for the everything file (only games that have data).
- `importJSON(text, {mode: 'merge'|'replace', dryRun, only})` returns `{ok, errors, games:[{id,name,keys}], applied, skipped, notes}`. Accepts either file type. Merge writes only absent keys. Replace overwrites. Dry run writes nothing.

## Formats

```json
{ "format": "fong-game-save", "version": 1, "game": "nightlite-choir", "name": "Nightlite Choir+", "saved": "2026-11-01T00:00:00.000Z", "data": { "nightlite.save": "{...}" } }
{ "format": "fong-game-saves", "version": 1, "games": { "nightlite-choir": { "name": "Nightlite Choir+", "data": { } } } }
```

Values are the raw localStorage strings.

## Safety

Size caps (600,000 file, 200,000 per value), valid JSON, format and version check, forbidden keys at any depth (also inside stored JSON values), only manifest keys written, text values only, JSON keys must parse. Merge cannot overwrite existing keys.

## Adding a game

Add a `register(...)` line to the manifest in `js/gamesaves.js` (or call it from the game). Only list keys that hold progress. Add a test line if the keys have unusual shape. Run `node tests/gamesaves.test.js`.
