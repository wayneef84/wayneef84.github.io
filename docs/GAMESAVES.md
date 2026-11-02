# Game saves (FongGameSaves)

`js/gamesaves.js`, `window.FongGameSaves`. Strict ES5, no network, every storage call in try/catch. Loaded by `index.html` (before `js/settings.js`) and by Nightlite Choir+.

## What it covers

Saved progress and user-made content that games keep in localStorage. Not covered because they have their own home: high scores (`FongScores`), theme, cheers, play options. Settings-only keys (mute, volume of games without progress, themes, zoom and so on) are left out on purpose.

Registered in the manifest: nightlite-choir, j-quiz (J Quiz), s4k-mixer-v2, s4k-mixer (custom characters), slots, jigsaw (progress only, not pictures), sudoku (game in progress), xtc-ball (custom balls), card-games (balance, War history), tracing-words, tracing-chinese, tracing-sentences. Skipped: Jigsaw pictures (large image data), minesweeper, snake, byte runner, memory match, falldown, sky breakers (scores or settings only).

## API

- `register(id, {name, keys, prefixes, json})` idempotent, merges keys. `prefixes` lists key prefixes for games that make one key per item (see below). `json` lists exact keys or prefixes whose values must parse as JSON.
- `list()` returns `[{id, name, keys, prefixes, hasData}]`. `keys` is the exact keys only, `prefixes` the registered prefixes.
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

Size caps (600,000 file, 200,000 per value), valid JSON, format and version check, forbidden keys at any depth (also inside stored JSON values), only manifest keys written, text values only, JSON keys must parse. Merge cannot overwrite existing keys. At most 200 prefix-matched keys per game are imported (the rest are skipped with a note). A key found by prefix is accepted only if it is longer than the prefix and matches `/^[A-Za-z0-9_.:-]{1,120}$/`.

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

`games/j` and `games/j_v1` share localStorage keys, so one entry `j-quiz` ("J Quiz") covers both. Exact keys: `j_muted`, `j_category_order`. Prefixes: `j_history_`, `j_score_`, `j_best_` (one key per question pack). `j_history_`, `j_score_` and `j_best_` values must parse as JSON (a plain number such as `42` is valid JSON), `j_category_order` must parse too, `j_muted` is plain text. Export walks localStorage and collects keys that start with a registered prefix. A key that starts with a prefix but has odd characters or is over 120 characters, and more than 200 prefixed keys, produce an export warning instead of vanishing quietly (a Drive save point is then refused). Import writes a key only if it is an exact registered key, or starts with a registered prefix and matches the safe shape above. Everything else in the file is dropped. Replace still only touches keys that are in the file. J Quiz keeps its own Export and Import buttons for its quiz data. They are unchanged and still work. `j_history` (no trailing underscore) appears only in a commented-out line in `games/j_v1/js/engine.js` and is not registered.

## Google Drive backup (optional)

Files: `js/gdrive-backup.js` (`window.FongGDrive`, sign-in and manual save points), `js/gdrive-auto.js` (`window.FongGDriveAuto`, autosave), public Client ID in `js/gdrive-config.js` (blank in the repo). One-time setup for the owner: `docs/GDRIVE_SETUP.md`. Manual file export and import are unchanged and stay the core of the feature. Drive is a second option. If autosave ever gets in the way of a manual path, the manual path wins.

Rules:
- Off until the Client ID is set. While blank every Drive button is disabled and says "Not set up yet. See docs/GDRIVE_SETUP.md". Nothing is loaded from Google.
- Google's script (`https://accounts.google.com/gsi/client`) is injected from JS only after the user taps Connect, never as a script tag in HTML. Exception: a device that connected before (`fong.gdrive.was` is `1`) with autosave on tries one quiet reconnect when a page opens, which loads the script then. That quiet try never opens a pop-up. If the browser or Google refuses, a "Tap to reconnect" chip shows. A device that never connected makes no request at all.
- Google Identity Services token model only (`initTokenClient`, scope `drive.appdata`). No backend, no secret, no refresh token. The access token is held in a variable, never written to storage and never sent between tabs.
- A sign-in that never answers is given up after two minutes and a new Connect tap replaces a pending one. The script tag is injected once. Disconnect always finishes within about 3 seconds even if Google does not answer the revoke.
- Closing Settings (or the Nightlite panel) locks the Drive controls again and forgets any loaded backup. If autosave is off it also drops the sign-in. If autosave is on the sign-in stays in memory so autosave keeps working, but Restore, Delete, Back up and Load stay behind the grown-ups question for every visit to the panel. Without the answer, Replace is not offered (merge only) and Apply does nothing.

Kinds of files, all in the hidden `appDataFolder`:
- Save points (manual): `fong-<scope>-<ISO time>.json`, scope `all` or a game id. Optional label (max 30 characters, letters, digits, spaces and basic punctuation) kept in the file's `appProperties.label`, never in the name. The newest 10 per scope are kept (`KEEP`).
- Auto: `fong-auto-<game>.json`, one rolling file per game, updated in place (PATCH, multipart so `appProperties` `{game, hash, device}` go in the same request).
- Daily: `fong-daily-<game>-<YYYY-MM-DD>.json`, written on the first autosave of the day for that game. The newest 7 per game are kept (`KEEP_DAILY`). Pruning only touches its own kind and game.
- A save point is refused if the export has warnings (a value too big to restore, a prefixed key with an odd name, more than 200 prefixed keys) or if nothing is saved yet. The warning text is in the error.
- Creating a file is never repeated after a 5xx (the first try may have worked). 429 and rate limits retry once. Reads and updates retry once on 5xx.

Autosave (on after the first connect, with an off switch in Settings and in the Nightlite panel):
- Change detection: a hash of the game's export data (not the timestamp). Device keys in localStorage, not in the saves manifest and never exported: `fong.gdrive.sync` (per game `{hash, version, time, fileId, day}`), `fong.gdrive.auto` (`on` or `off`), `fong.gdrive.was` (`1` once connected), `fong.gdrive.lease`, `fong.gdrive.status`, `fong.gdrive.device`.
- Every 30 seconds while the page is visible. At most `MAX_GAMES_PER_RUN` (1, a constant in `js/gdrive-backup.js`) changed game per run, least recently backed up first, so games take turns. A game is uploaded at most once every 5 minutes. Errors back off 1, 2, 4 minutes and so on up to 30. A 401 stops autosave and shows "Tap to reconnect".
- The device wins: when its data changed and the Drive file has the version this device last wrote (or the same content), it overwrites without asking. If Drive was changed by another device since this device last synced, it does not overwrite. It shows a "newer backup found" card instead.
- When the page is hidden it makes a best-effort update with fetch `keepalive` for small files whose Drive copy was checked in the last 10 minutes.
- Only one tab uploads. A lease in `fong.gdrive.lease` (renewed every 10 seconds, 30 second life) is held by the tab that has a token. Other tabs say "Another window is backing up". The last backup time is shared with BroadcastChannel `fong-gdrive` and a storage event. If the leader tab closes, another tab needs one Connect tap (or its own quiet reconnect).
- "Newer backup found": after connecting it lists the auto files. A game gets a card when its Drive copy has a different hash than the device and Drive's modified time is later than this device's last sync of it. Load goes through the normal preview and Apply (Replace behind the gate, and the `nightlite.undo` stash in Nightlite Choir+). Not now is remembered for that game and version for the session. Equal copies are just marked synced.
- Status: a line (Connecting..., Connected, Backed up <time>) fades after about 4 seconds, with no animation if reduced motion is on. The dot stays. Errors stay until dismissed.

Restore of any file is only text handed back: the UI runs it through `FongGameSaves.importJSON` (preview, manifest-only keys, size limits, rollback). `restore()` checks Content-Length before reading the body and the length after.

FongGDrive API (callbacks `cb(err, result)`, `err` null or `{code, message}`):
- `isConfigured()`, `isConnected()`, `onChange(fn)`, `NOT_SET_UP`, `KEEP`, `KEEP_DAILY`, `MAX_GAMES_PER_RUN`, `cleanLabel(text)`
- `connect(cb, {silent})` (from a tap unless silent), `disconnect(cb)`
- `backupNow(scope, cb, {label})` gives `{id, name, scope, label, pruned}`
- `list(cb)` gives `[{id, name, scope, type, label, day, time, modified, version, hash, size}]`, newest first. `type` is `manual`, `auto` or `daily`. Files not named like ours are ignored.
- `restore(fileId, cb)`, `remove(fileId, cb)`, `getMeta`, `createFile`, `updateFile`, `prune` (used by autosave)

FongGDriveAuto: `getStatus()`, `onStatus(fn)`, `isAuto()`, `setAuto(bool)`, `lastTimes()`, `runNow(cb)`, `prompts()`, `checkNewer(cb)`, `load(game, cb)`, `markLoaded(game, meta)`, `dismiss(game)`, `dismissError()`, `reconnect(cb)`, `disconnect(cb)`, `flush()`.

Check-site: `scripts/check-site.mjs` only inspects script and link tags in HTML, so injecting the Google script from JS needs no exception and no rule was weakened. If check-site ever starts scanning JS for URLs, allow only `js/gdrive-backup.js` and the single URL `https://accounts.google.com/gsi/client`.

Tests: `node tests/gdrive.test.js`, `node tests/gdrive-review.test.js`, `node tests/gdrive-auto.test.js` (fakes in `tests/gdrive-fake.js`).
