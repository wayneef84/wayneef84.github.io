# Slots - Developer Notes

**For the next Claude (or any developer) working on this project**

---

## Purpose & Philosophy

**Why This Exists:** A calm play-money slots toy for the family arcade. A young child plays it on a phone.

**Design Philosophy:** Fair, quiet and finishable. Every round ends, every theme plays the same maths, and nothing nags.

**Core Value:** Safe for a child. No real money wording, no pressure, no dead ends.

---

## Architecture Summary

Pure maths lives in `js/engine.js` and each mode file. Modes register with `Slots.registerMode`. `js/ui.js` owns coins, bet, sheets and the round lifecycle. `js/view.js` draws the CSS 3D drum reels and the tile board.

**Main Components:**
1. **engine.js** - symbols, line and cluster evaluation, tumble, coin rounding. No DOM.
2. **modes/*.js** - one mode each: `roll(bet)` is pure, `create(host, api)` is the view.
3. **ui.js** - the only place coins change.
4. **themes.js** - data only.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [DESIGN.md](DESIGN.md).

---

## Hard rules (do not regress)

**Play money only**
- Say "coins". Never a currency sign, never "cash", "bet real", "jackpot" with money meaning. The footer line "Just for fun. No real money." must stay visible.
- No timers on the refill, no streaks, no daily bonus, no countdowns, no "so close" messages.
- 📍 `index.html`, `js/ui.js`

**One payout per tag**
- ❌ Paying in two places or in an animation callback causes double wins (this was the v3.1 bug).
- ✅ Call `api.credit(coins, tag)` once from a mode. `credit()` ignores a tag it already saw in the round.
- 📍 `js/ui.js` `credit()`

**A round must always end**
- Modes call `done()` exactly once. `skip()` must finish the round. A 45 second watchdog in `onSpin()` is the safety net.

**Pay tables are tuned**
- Changing a number changes the return. Run `node games/slots/tests/sim.js` and keep every mode within 3 points of its target.

**ES5 only, relative paths only, no network**
- `var`, `function`, no arrow functions, no template literals, no classes, no `let`/`const`. Local fonts from `../../../assets/fonts/`.
- `node scripts/check-site.mjs` must end with 0 errors. Never run `--update-baseline`.

**Reduced motion**
- `ui.js` adds `.calm` to `#app`. New animations need a `.calm` rule and no flashing above 3 per second.

---

## Testing
- `node games/slots/tests/sim.js [rounds]` headless maths.
- Browser checks were done with Playwright from outside the repo (see CHANGELOG 4.0.0 for what was covered).
- `?calm=1` in the URL forces calm mode, handy for fast automated spins.

## Gotchas
- Reels: the destination faces are painted while they are on the back of the drum (hidden by `backface-visibility`). Change the number of faces (12) and you must re-check `d = 4..8` in `ReelSet.prototype.spin`.
- Reel direction: faces use `rotateX(-i * 30deg)`. The drum angle goes down to scroll symbols downward.
- Old save key `dadsSlotsSave` is only read for migration (dollars x 10, capped at 5000 coins).
