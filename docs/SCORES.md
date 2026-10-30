# Scores (FongScores)

`js/scores.js` keeps each game's best scores on this device. One global: `window.FongScores`. Strict ES5. It follows the same conventions as [PLAYER_STATS.md](PLAYER_STATS.md) (`FongStats`) and does not replace it.

## Privacy

Nothing leaves the device. No accounts, no network calls, no tracking, no public leaderboards. Scores live in `localStorage` under `fong.scores.v1`. If storage is blocked they live in memory until the page closes, and `FongScores.isPersistent()` returns false so the Settings Scores tab can say so. Clearing browser data erases them. No name is stored, so score exports carry no personal data.

## Rules for games

- Show only good news. A lower score never shows a "you did not beat it" message. `celebrate()` does nothing unless it is a personal best.
- No streaks, daily bonuses, countdown shame or dates next to scores (the timestamp is only used to order ties).
- Wire one guarded call. The game must work if `js/scores.js` fails to load.

## Load and use

```html
<script src="../../js/scores.js"></script>
```

```js
if (window.FongScores) {
  FongScores.celebrate(FongScores.submit('snake', score, { title: 'Snake', unit: 'points' }));
}
```

## API

| Call | Returns |
|---|---|
| `register(gameId, {title, unit, higherIsBetter, max})` | `true` if saved. `unit`: `points`, `seconds`, `moves`, `coins` or `level`. `max` is how many to keep (default 5, up to 10) |
| `submit(gameId, value, {label, extra, title, unit, higherIsBetter, max})` | `{isBest, rank, previousBest}`. `rank` is 1-based or `null` if it did not make the top list. The optional `title`, `unit`, `higherIsBetter` and `max` register the board in the same call. Values must be finite and above 0 |
| `best(gameId)` | Best value or `null` |
| `list(gameId)` | `[{rank, value, label, time, extra}]`, best first |
| `listAll()` | `[{id, title, unit, higherIsBetter, max, scores}]` sorted by title |
| `reset(gameId)`, `resetAll()` | Clears scores, keeps titles |
| `exportJSON()`, `exportObject()` | The export as text or as an object |
| `importJSON(text, {mode, dryRun})` | `{ok, added, skipped, errors, games}`. `mode` is `merge` (default) or `replace`. `dryRun: true` checks only |
| `celebrate(result, text)` | Calls `FongCheer.cheer('big')` (guarded) and shows a gentle toast. Toast has no animation under `prefers-reduced-motion` or Calm mode |
| `format(value, unit)` | `1,240`, `1:05`, `12 moves`, `Level 4` |
| `isPersistent()` | `false` when storage is blocked |

`isBest` is true for the first score of a board. Ties keep the older score on top. The timestamp is monotonic: it never goes backwards or repeats.

## Game ids and boards

Ids are catalog ids (`js/catalog.js`). A game with several boards adds `:board`: `memory-match:easy`, `minesweeper:hard`, `jigsaw:24`, `slots:win`. An id is 1 to 64 letters, digits, `_ . : -`. `__proto__`, `constructor` and `prototype` are refused.

## Games wired

| Game | Board id | Value | Saved when |
|---|---|---|---|
| Snake | `snake` | points | a run ends (not demo mode) |
| Pong | `pong` | points | you leave the page (Pong has no end of match) |
| Breakout | `breakout` | points | last life lost |
| Space Invaders | `space-invaders` | points | run ends |
| Sky Breakers | `sky-breakers` | pipes passed | run ends |
| Falldown | `falldown` | points | run ends |
| Memory Match | `memory-match:easy`, `:normal`, `:big` | fewest moves | board finished |
| Slots | `slots:coins`, `slots:win` | coins | page left (most coins), a win (biggest, only when beaten) |
| Byte Runner Quest | `byte-runner-quest:level`, `:endless` | level number, distance | level cleared, endless run ends |
| Minesweeper | `minesweeper:<difficulty>` | fastest seconds | a win (custom boards skipped) |
| Jigsaw | `jigsaw:<pieces>` | seconds | puzzle finished, only with "Show time played" on (off by default) |

Not wired: Flow (no score, only finishing a board), Byte Runner (a progress screen for file copies, no score), Sudoku (no timer), card games, tracing, mixers and the tools.

## Storage format

`fong.scores.v1`:

```json
{ "v": 1, "clock": 1760000000000,
  "games": { "snake": { "title": "Snake", "unit": "points", "hib": true, "max": 5,
    "entries": [ { "v": 90, "label": "", "t": 1760000000000 } ] } } }
```

## Export file (version 1)

```json
{
  "format": "fong-scores",
  "version": 1,
  "games": {
    "memory-match:easy": {
      "title": "Memory Match (Easy)", "unit": "moves", "higherIsBetter": false, "max": 5,
      "entries": [ { "v": 12, "label": "emoji", "t": 1760000000000, "extra": { "size": "easy" } } ]
    }
  }
}
```

## Import rules

- Up to about 256 KB of text and 200 games, 50 entries per game. Bigger is refused.
- `format` must be `fong-scores` and `version` must be `1`. A file with `__proto__`, `constructor` or `prototype` anywhere is refused.
- Each score must be a number above 0 and up to 1e12. Bad scores are skipped and counted.
- Titles are cut to 60 characters, labels to 40, `extra` to 6 small values. Control characters become spaces. Unknown units become `points`.
- Unknown games are kept after cleaning. Merge adds scores that are not already there and trims each game to its top list. Replace swaps everything.
- HTML is never run. Every title, label and message is written with `textContent`.

## Tests

`node tests/scores.test.js` runs the pure logic (sort order, trimming, ties, personal best, reset, round trip, merge and replace, hostile files, blocked storage). Playwright checks of the Settings hub and each wired game are described in the PR.
