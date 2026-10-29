# Slots - Architecture

## Overview
Static page, classic scripts, no build step. Load order is fixed in `index.html`:

```
js/engine.js        pure maths, registry (Slots.engine, Slots.registerMode)
js/themes.js        theme data (Slots.themes)
js/store.js         save/load, never throws
js/sfx.js           synthesized sound, never throws
js/view.js          DOM helpers, ReelSet (3D drums), Board (tile grid)
js/modes/classic.js five.js cascade.js match3.js pick.js wheel.js
js/ui.js            controller, starts the game on DOMContentLoaded
```
Everything hangs off one global, `window.Slots`.

## File Structure
```
games/slots/
  index.html  css/slots.css
  js/engine.js themes.js store.js sfx.js view.js ui.js
  js/modes/classic.js five.js cascade.js match3.js pick.js wheel.js
  tests/sim.js            headless RTP + invariants (node)
  audio/                  old v3 files, unused (see ASSET_LOG.md)
  README AGENT ARCHITECTURE CHANGELOG CLAUDE INFO TODO DESIGN ASSET_LOG (.md)
```

## Key Concepts

### Coins and units
All money is whole play coins. A pay value is in *units*, one unit is `bet / 10`. `engine.coins(units, bet) = round(units * bet / 10)`. Bets are 10, 20, 50, 100, 250 so a unit is always a whole number of coins.

### Symbols
Index 0..5 are paying tiers (low to high), 6 is wild, 7 is scatter. A theme only supplies 8 glyphs (`sym[6]`, `wild`, `scat`). Weights and pay tables belong to the mode, so themes cannot change odds.

### Mode contract
```js
Slots.registerMode({
  id, name, short, icon, cta, lever, howTo, rtp,
  roll(bet, rng)        // pure, returns { win, ... } used by tests/sim.js
  paytable(bet)         // rows for the help sheet
  create(host, api)     // returns { setTheme, resize, play(bet, done), skip, destroy, setBet? }
});
```
`api` is `{ theme(), calm(), credit(coins, tag), celebrate(win, bet), bonus(type, bet, cb) }`.

### Round lifecycle (js/ui.js `onSpin`)
1. If busy, the tap is a skip. Otherwise check coins, lower the bet if needed.
2. Deduct the bet, set `busy`, create `round = { paid: {}, win: 0 }`.
3. `view.play(bet, done)`. The mode rolls once, calls `api.credit(win, 'spin')` (credited up front and saved), then animates.
4. The coin display lags the win (`pendingWin`) until `done()`. `finishRound()` clears busy.
5. A mode may call `api.bonus('pick'|'wheel', bet, cb)` which runs the same bonus screen as the stand-alone modes, with `free: true` prizes and tag `'bonus'`.

### Drum reels (CSS 3D)
Each reel is `.reel-win` (perspective, overflow hidden) containing `.drum` (`preserve-3d`) with 12 `.face` elements. Face i is `rotateX(-i*30deg) translateZ(R)` where `R = cell / 2 / tan(15deg)`. The drum is `translateZ(-R) rotateX(angle)`. Rows 0..2 are faces `front-1, front, front+1`.
A spin picks a destination `front' = front - d` (d in 4..8), paints the result on those faces while they are behind the drum, then transitions the angle down by `turns*360 + d*30` degrees. The end is an exact multiple of 30 so nothing snaps. Completion uses timers, not `transitionend`, so a hidden tab cannot strand a round.

### Board (Cascade, Match)
CSS grid of `.tile`. Entry uses a `drop` keyframe with per-tile delay, wins get `.win`, others `.dim`, vanishing tiles `.vanish`.

### Cheers and Sparkle Party (js/ui.js)
`cheer(kind)` is a guarded call to `window.FongCheer` (`../../js/cheer.js`, loaded before `ui.js`). It never changes coins. Sparkle Party (`openParty`) is the only other place that adds coins outside a round. It does so once per page visit (`partyPaid`, in memory, never saved) and is ignored while a round is running.

### Saves
Key `fong.slots.v4`: `{ v, coins, bet, theme, mode, muted, calm, seen }`. `store.sanitize` clamps every field and drops unknown themes or modes. Old key `dadsSlotsSave` is migrated once (dollars x 10, cap 5000).

## Dependencies
- No libraries. No network. Font: Nunito from `assets/fonts/` (SIL OFL).
- Browser APIs: CSS 3D transforms, Web Audio (optional), localStorage (optional), matchMedia.

## Performance Characteristics
Largest screen is 5x3 drums: 60 faces plus a few SVG lines. Spins are CSS transitions, no per-frame JavaScript. Blur on moving symbols is dropped in calm mode.

## Browser Compatibility
Needs `backface-visibility` and 3D transforms (all current browsers). `dvh` units fall back to `vh`. Tested in Chromium only.

## Known Limitations
- Cascade and Match boards are flat.
- Free bonus inside Cascade and 5-Reel is decided when the round is rolled (the scatter count), the prize inside is decided on the bonus screen.
- Pick-a-Prize credits when the third box opens. Reloading in the middle loses that one round's bet (nothing else).
