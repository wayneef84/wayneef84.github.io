# Game saves (FongGameSaves)

`js/gamesaves.js`, `window.FongGameSaves`. Strict ES5, no network, every storage call in try/catch. Loaded by `index.html` (before `js/settings.js`) and by Nightlite Choir+.

## What it covers

Saved progress and user-made content that games keep in localStorage. Not covered because they have their own home: high scores (`FongScores`), theme, cheers, play options. Settings-only keys (mute, volume of games without progress, themes, zoom and so on) are left out on purpose.

Registered in the manifest: nightlite-choir, s4k-mixer-v2, s4k-mixer (custom characters), slots, jigsaw (progress only, not pictures), sudoku (game in progress), xtc-ball (custom balls), card-games (balance, War history), tracing-words, tracing-chinese, tracing-sentences. Skipped: Jigsaw pictures (large image data), J / J v1 (per-pack dynamic keys, J has its own export), minesweeper, snake, byte runner, memory match, falldown, sky breakers (scores or settings only).

## API

- `register(id, {name, keys, json})` idempotent, merges keys. `json` lists keys whose value must parse as JSON.
- `list()` returns `[{id, name, keys, hasData}]`.
- `exportGame(id)` and `exportAll()` return `{text, warnings}`. `text` is the file. `warnings` lists anything import would refuse: a value over `MAX_VALUE` or a file over `MAX_CHARS`. The UI shows them next to the download or copy. `exportObject()` returns the `games` object for the everything file (only games that have data). `exportWarnings()` gives the value warnings for it.
- `importJSON(text, {mode: 'merge'|'replace', dryRun, only})` returns `{ok, errors, games:[{id,name,keys}], applied, skipped, notes}`. Accepts either file type. Merge writes only absent keys. Replace overwrites the keys in the file. Keys that are not in the file are left as they are. Dry run writes nothing. `alreadyHave: true` is set when merge finds every key already present (message: "You already have saves here. Use Replace to load the file.").

Import is all or nothing. Before writing, the old value of every key is read. If any write fails (storage blocked or full), the earlier writes are put back and the result is `ok: false` with "Nothing was changed". `MAX_CHARS` (600,000) and `MAX_VALUE` (200,000) are exported, and `js/settings.js` uses the same `MAX_CHARS`.

## Formats

```json
{ "format": "fong-game-save", "version": 1, "game": "nightlite-choir", "name": "Nightlite Choir+", "saved": "2026-11-01T00:00:00.000Z", "data": { "nightlite.save": "{...}" } }
{ "format": "fong-game-saves", "version": 1, "games": { "nightlite-choir": { "name": "Nightlite Choir+", "data": { } } } }
```

Values are the raw localStorage strings.

## Safety

Size caps (600,000 file, 200,000 per value), valid JSON, format and version check, forbidden keys at any depth (also inside stored JSON values), only manifest keys written, text values only, JSON keys must parse. Merge cannot overwrite existing keys.

## Stored text is never HTML

An imported save can put any text into the manifest keys, so every game that reads them must treat the values as text. Sinks found in the review and fixed:

| Game | Key | Sink | Fix |
|---|---|---|---|
| XTC Ball | `oracle_custom_balls` | `answerText.innerHTML` | text nodes and real `<br>` nodes |
| Trace Sentences | `sentences-saved` | saved list built as an HTML string | `createElement` and `textContent` |
| Trace Chinese | `chinese-daily` (daily characters) | character grid built as an HTML string | `createElement` and `textContent` |
| War (card games) | `war_history`, `war_match_history` | history tables and rows built as HTML, match id inside an inline `onclick` | `CardUtils.escapeHTML` on every value, match id forced to a number |
| Card utils | shared | `renderCardHTML` used card text unescaped | text escaped |

Also hardened: Trace Words ignores non-string custom words. Checked and left alone: S4K Mixer and custom characters (names via `textContent`, images and audio only set as `src`), Slots (every field validated against a whitelist), Sudoku and Jigsaw (values reach only numbers, `textContent` or aria text), Nightlite Choir (ids looked up in its own tables). Guard rail: `node tests/savesinks.test.js` fails if the unsafe patterns come back. When you add a game to the manifest, grep it for `innerHTML`, `insertAdjacentHTML` and `outerHTML` first.

## Nightlite Choir overlay

Export is always open. Add missing is open. Replace and Restore previous ask the times-table question first, then need a second tap. Before every import the current `nightlite.save`, `nightlite.mix` and `nightlite.vol` are kept under `nightlite.undo` (not in the manifest, so never exported). Restore previous puts them back once. The page reloads after an import or restore, and saving is paused until it does (released after 4 seconds if the reload never happens).

## Adding a game

Add a `register(...)` line to the manifest in `js/gamesaves.js` (or call it from the game). Only list keys that hold progress. Add a test line if the keys have unusual shape. Run `node tests/gamesaves.test.js`.
