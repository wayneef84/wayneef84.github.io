# Game saves (FongGameSaves)

`js/gamesaves.js`, `window.FongGameSaves`. Strict ES5, no network, every storage call in try/catch. Loaded by `index.html` (before `js/settings.js`) and by Nightlite Choir+.

## What it covers

Saved progress and user-made content that games keep in localStorage. Not covered because they have their own home: high scores (`FongScores`), theme, cheers, play options. Settings-only keys (mute, volume of games without progress, themes, zoom and so on) are left out on purpose.

Registered in the manifest: nightlite-choir, j-quiz (J Quiz), s4k-mixer-v2, s4k-mixer (custom characters), slots, jigsaw (progress only, not pictures), sudoku (game in progress), xtc-ball (custom balls), card-games (balance, War history), tracing-words, tracing-chinese, tracing-sentences. Skipped: Jigsaw pictures (large image data), minesweeper, snake, byte runner, memory match, falldown, sky breakers (scores or settings only).

## API

- `register(id, {name, keys, prefixes, json})` idempotent, merges keys. `prefixes` lists key prefixes for games that make one key per item (see below). `json` lists exact keys or prefixes whose values must parse as JSON.
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

Size caps (600,000 file, 200,000 per value), valid JSON, format and version check, forbidden keys at any depth (also inside stored JSON values), only manifest keys written, text values only, JSON keys must parse. Merge cannot overwrite existing keys. A key found by prefix is accepted only if it is longer than the prefix and matches `/^[A-Za-z0-9_.:-]{1,120}$/`.

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

## J Quiz and key prefixes

`games/j` and `games/j_v1` share localStorage keys, so one entry `j-quiz` ("J Quiz") covers both. Exact keys: `j_muted`, `j_category_order`. Prefixes: `j_history_`, `j_score_`, `j_best_` (one key per question pack). `j_history_`, `j_score_` and `j_best_` values must parse as JSON (a plain number such as `42` is valid JSON), `j_category_order` must parse too, `j_muted` is plain text. Export walks localStorage and collects keys that start with a registered prefix. Import writes a key only if it is an exact registered key, or starts with a registered prefix and matches the safe shape above. Everything else in the file is dropped. Replace still only touches keys that are in the file. J Quiz keeps its own Export and Import buttons for its quiz data. They are unchanged and still work. `j_history` (no trailing underscore) appears only in a commented-out line in `games/j_v1/js/engine.js` and is not registered.

## Google Drive backup (optional)

`js/gdrive-backup.js`, `window.FongGDrive`, with the public Client ID in `js/gdrive-config.js` (blank in the repo). One-time setup for the owner: `docs/GDRIVE_SETUP.md`. Manual file export and import are unchanged. Drive is a second option, not a replacement.

- Off until the Client ID is set. While blank every Drive button is disabled and says "Not set up yet. See docs/GDRIVE_SETUP.md". Nothing is loaded from Google.
- Google's script (`https://accounts.google.com/gsi/client`) is injected from JS only after the user taps Connect. It is never a script tag in HTML. On the first tap the script has to load first, so some browsers block the sign-in window then and the message says to tap Connect again.
- Google Identity Services token model only (`initTokenClient`, scope `https://www.googleapis.com/auth/drive.appdata`). No backend, no client secret, no refresh token. The access token is held in a variable and never written to storage, so every new page visit needs a tap on Connect (the UI says so). Connect sits behind the same grown-ups question as imports.
- Files go to the hidden `appDataFolder`, named `fong-<scope>-<ISO time>.json`, scope `all` or a game id. After each backup the newest 10 files of that scope are kept and older ones deleted.
- A backup is refused if the export has warnings (a value too big to restore) or if there is nothing saved yet.
- Restore downloads the file as text and hands it to `FongGameSaves.importJSON` through the normal preview and Apply flow. A Drive file is untrusted input: only manifest keys, size limits, rollback, and Replace stays behind the gate. In Nightlite Choir+ the text goes into the paste box, and Add missing or Replace run the existing checks, confirm and `nightlite.undo` stash.
- Errors in plain language: popup blocked, popup closed, access denied, offline, 401 (sign-in ran out, tap Connect), 403 (Drive API not on or permission not given), 429 and 5xx (one retry), Drive full.

API, callbacks are `cb(err, result)` with `err` null or `{code, message}`:

- `isConfigured()`, `isConnected()`, `NOT_SET_UP`, `KEEP`
- `connect(cb)` (call from a tap), `disconnect(cb)` (revokes the token)
- `backupNow(scope, cb)` gives `{id, name, scope, pruned}`
- `list(cb)` gives `[{id, name, scope, time, size}]`, newest first. Files not named like ours are ignored.
- `restore(fileId, cb)` gives the file text
- `remove(fileId, cb)`

Check-site: `scripts/check-site.mjs` only inspects script and link tags in HTML, so injecting the Google script from JS needs no exception and no rule was weakened. The rule `external-cdn` still fails any HTML tag that loads an outside script. If check-site ever starts scanning JS for URLs, allow only `js/gdrive-backup.js` and the single URL `https://accounts.google.com/gsi/client`.

Tests: `node tests/gdrive.test.js` (fake localStorage, fetch and google.accounts).
