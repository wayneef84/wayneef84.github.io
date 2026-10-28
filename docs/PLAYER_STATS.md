# Player stats (FongStats)

`js/player-stats.js` gives every page one shared, on-device play record. One global: `FongStats`. Strict ES5.

Privacy: no accounts, no network calls, no tracking. Data stays in this browser under the localStorage key `fong_stats_v1`. If localStorage is blocked, stats live in memory until the page closes and nothing breaks. No streaks or other pressure mechanics.

## Load order

```html
<script src="../js/catalog.js"></script>
<script src="../js/player-stats.js"></script>
```

Ids are the `id` values in `FONG_CATALOG`. A new catalog entry works with no change here.

## API

| Call | Returns |
|---|---|
| `FongStats.count(id)` | Plays for one game (0 if none) |
| `FongStats.totalPlays()` | Plays across everything |
| `FongStats.get(id)` | `{ id, plays, lastPlayed, best, higherIsBetter }`. `lastPlayed` is ms since epoch (0 if never). `best` is `null` if unset |
| `FongStats.all()` | Map of id to the same object, for every id with stats |
| `FongStats.recordPlay(id)` | New play count. Also refreshes the header counter |
| `FongStats.setBest(id, value, higherIsBetter)` | `true` if `value` became the new best. `higherIsBetter` defaults to true. Use false for times |
| `FongStats.reset()` | Clears all stats |
| `FongStats.format(n)` | `950`, `1.2k`, `12k`, `1.2M` |
| `FongStats.idForPath(href)` | Catalog id for a page path, or `''` |
| `FongStats.isPersistent()` | `false` when localStorage is blocked |
| `FongStats.trackClicks()` | Once per hub page: counts a play when a catalog card is clicked |

A game records its own best score like this:

```js
if (window.FongStats) { FongStats.setBest('snake', score, true); }
```

## Where plays are recorded

Clicks on cards in `index.html`, `arcade/`, `puzzle/`, `projects/`, `browse/` (cards carry `data-game-id`, or the href is matched to the catalog) and on the game buttons in `games/cards/index.html`. The Card Games and hub tiles on the homepage are not counted.

## Header counter

`js/hub-data.js` writes `Plays: N` into `#global-play-count` using `FongStats.totalPlays()`. It was stuck at 0 because nothing ever wrote the old `playcount_*` keys (`js/play-counter.js` was never loaded by any page).

## Migration

On first load, old `playcount_<path>` keys are added to the new store (path matched to the catalog id) and then removed. Old `fong_streak_*` keys are removed. This runs once.
