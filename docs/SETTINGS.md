# Settings hub

The homepage **Settings** button (the old Customize button, same place) opens one sheet with five tabs. Everything stays on this device. Clearing browser data erases it.

Code: `js/settings.js` (`window.FongSettings`), `css/settings.css`. It must load before `js/theme/panel.js` because it takes over the button click. The Customize panel itself is unchanged and opens from the Look tab.

## Open it

- Tap **Settings** on the homepage.
- Address `index.html#settings` or `index.html?settings=1` opens the Look tab. `?settings=scores`, `look`, `cheers`, `play` or `data` (also `#settings-scores`) opens that tab. Closing removes it from the address.
- From JavaScript: `FongSettings.open('scores')`, `FongSettings.close()`.

### Linking from a game page

Games do not get a Settings button automatically: `js/home-link.js` only appears on pages that have no way home, so it is not a place for it. A game that wants one adds a plain relative link:

```html
<a href="../../index.html#settings-scores">Scores and settings</a>
```

## Tabs

| Tab | What it does |
|---|---|
| Look | **Open Customize** closes the hub and opens the theme panel (skins, palettes, names, groups, export and import of themes) |
| Scores | Top scores for every game that saves them (wired games show "No scores yet" until played), per-game **Reset**, **Export scores** (downloads `fong-scores.json`, plus a copy button and a copy-box fallback), **Import scores** (file or paste, preview, merge or replace), **Reset all scores** |
| Cheers | **Open Cheer settings** closes the hub and opens the Cheers parent gate (see [CHEER.md](CHEER.md)) |
| Play | **Calm mode** (see below) |
| Data | The privacy sentence, **Export everything** and **Import everything**, **Reset app** |

## Grown-ups gate

Resets, imports and Reset app are locked behind a times-table question (same idea as the Cheers gate). It lasts until the sheet closes. Then:

- Per-game Reset asks "Yes, reset" or "No" first.
- Reset all scores needs the word RESET typed.
- Import always shows a preview first and changes nothing until **Apply**.

Exports are not gated. They only read.

## Calm mode and shared prefs

`js/prefs.js` (`window.FongPrefs`) stores `{"calm": true|false}` under `fong.prefs.v1` (memory fallback if storage is blocked). While calm is on, `<html data-calm="1">`. Games MAY read it:

```js
if (window.FongPrefs && FongPrefs.get('calm')) { /* gentler motion and sound */ }
```

Only Slots reads it today (alongside its own Calm option and the system reduced-motion setting). Other games are not changed. The score toast and the Settings sheet also skip animation in calm mode or when the system asks for reduced motion.

## Export everything

One file, `fong-everything.json`:

```json
{ "format": "fong-everything", "version": 1, "theme": { }, "scores": { }, "cheer": { }, "prefs": { "calm": false }, "games": { } }
```

- `theme` is the theme file from [CUSTOMIZE.md](CUSTOMIZE.md). `scores` is the scores file from [SCORES.md](SCORES.md). `cheer` is the Cheers settings (`fong.cheer.v1`). `prefs` is `fong.prefs.v1`.
- `games` is optional (older files have none and still import). It is the `games` object from [GAMESAVES.md](GAMESAVES.md). Replace mode only overwrites keys named in the file.
- The child's name and spoken spelling are left out unless **Include the name used for cheers** is ticked.
- Import checks every section the same way as its own import. A bad section is left alone and reported. Cheers text is cleaned (names to 24 characters, phrases to 20 per kind and 80 characters). A name already on the device is kept when the file has none. Scores merge or replace as chosen. The page should be reloaded after applying.
- Limit about 600 KB. `__proto__`, `constructor` and `prototype` keys refuse the file.

## Game saves

Data tab, section **Game saves**. One row per game in the manifest (listed even before the game is opened) with **Export** (downloads `fong-save-<id>.json`) and **Copy** (text fallback). **Export all game saves** downloads `fong-game-saves.json`. Exports are always allowed. Importing is under Grown-up tools, behind the same question gate: choose a file or paste, Preview (dry run, nothing written), then Apply. Merge keeps any key already on the device. Replace overwrites the keys in the file. Reload the game afterwards.

Safety rules: only keys in the game's manifest entry are written, anything else is ignored and counted as skipped. Values must be text under 200,000 characters, keys marked JSON must parse, `__proto__`, `constructor` and `prototype` keys refuse the file, 600,000 character file cap. High scores, theme, cheers and play options are not part of game saves. Full details: [GAMESAVES.md](GAMESAVES.md). Nightlite Choir+ has its own gear overlay that uses the same code (no gate there, Replace needs a second tap).

## Reset app

Runs the `?pwa=off` recovery from [PWA.md](PWA.md): unregisters the service worker and clears its saved copies. Scores and settings stay. `?pwa=on` turns offline mode back on. The other recovery links, `?theme=default` and `?safe=1`, still work.

## Card "Best" line

With **Show play counts** on (Customize, Behavior), a card shows `12 plays · Best: 1,240` when the game has exactly one score board. Off by default, so cards stay clean.

## Accessibility

Tabs follow the tab pattern (arrow keys, Home and End). Escape closes and focus returns to the button. Tap targets are 44px or more, the sheet scrolls on 360x640, colors come from the site theme variables, and motion respects `prefers-reduced-motion` and Calm mode.
