# Slots - Design

## Rules of the house
Play money only (coins). No purchases, ads, timers, streaks, daily bonuses or "almost won" messages. Free refill any time. Calm mode. Original names and art only.

## Modes
| id | Name | Grid | How a round works | Target return |
|---|---|---|---|---|
| `classic` | Classic 3-Reel | 3 reels x 3 rows, middle line | 3 matching pay big, first 2 matching pay a little. Wild fills in. | 94% |
| `five` | 5-Reel Lines | 5 x 3, 10 lines | Match 3, 4 or 5 from the left. 3+ scatters = free Pick-a-Prize (3 picks, prizes 2 to 20 x bet). | 95% (about 78 lines, 17 bonus) |
| `cascade` | Cascade | 5 x 3, same 10 lines | Wins vanish, symbols fall, new win pays x2, x3 ... up to 8 steps. 3+ scatters on the first drop = free Prize Wheel. | 95% |
| `match3` | Match Groups | 5 x 4, no lines | Groups of 4+ touching matching symbols (up, down, left, right) pay. Wild joins any group. Higher tiers claim cells first. | 95% |
| `pick` | Pick-a-Prize | 12 boxes | Open 3. Shuffled prizes from 1 to 8 tenths of the bet. | 95% exact |
| `wheel` | Prize Wheel | 12 slices | One spin. Slices from 3 to 32 tenths of the bet. | 95% exact |

Not built: Lucky Ladder. A push-your-luck ladder is too close to loss-chasing for this site.

Each mode is one file in `js/modes/`. The how-to line is the `howTo` field.

## Maths
- Symbol weights (per cell, independent): tiers `26,22,18,14,10,6`, wild 5 (6 in Classic), scatter 3 (0 in Classic and Match).
- Pay values are integers in units of `bet / 10`. Pay tables were tuned with exact enumeration (Classic, 5-Reel) or seeded simulation (Cascade, Match) and are checked again by `tests/sim.js`.
- Because themes only choose glyphs, every theme has the same return.
- A "win" always pays at least 1 unit. Pick and Wheel never pay 0.

## Add a theme
Open `js/themes.js` and add ONE object to the `DATA` array:

```js
{ key: 'bubbles', name: 'Bubble Bath', group: 'Fun', kids: true,
  flavour: 'Suds up to the ceiling.',
  pal: ['#12305a', '#2a63a8', '#9be7ff', '#f1faff', '#12305a'],  // bg, bg2, accent, reel face, ink
  sym: ['🧼', '🛁', '🦆', '🫧', '🧽', '👑'],                      // 6 symbols, low to high
  wild: '🚿', scat: '🎁', wildName: 'Shower', scatName: 'Gift' }
```
Rules: unique `key` (never rename a shipped one), `group` is one of Sweet, Nature, Fantasy, Fun, Adventure, Space & Tech, Classic, 6 `sym` plus `wild` and `scat`, original names, no brands or characters. Accent colours that are too dark are lightened automatically. A symbol may be an inline `<svg>` string instead of emoji. Then add the name to ASSET_LOG.md and run the check script. Emoji old enough to render everywhere are safer (Unicode 12 or older).

## Add a mode
1. Create `js/modes/yourmode.js` that ends with `Slots.registerMode({...})` (see ARCHITECTURE.md for the contract).
2. Make `roll(bet, rng)` pure and put the maths in it. Add the mode to `tests/sim.js` load list. Tune until the sim is inside 3 points of `rtp`.
3. Call `api.credit(win, tag)` once, `done()` once, and make `skip()` finish the round.
4. Add the script tag to `index.html` after the other modes and before `ui.js`.

## Accessibility and motion
Buttons are real buttons, targets 44px or more, a live region announces wins, focus is returned when sheets close. Calm mode and `prefers-reduced-motion`: short reel moves, no blur, no pulsing, no confetti. Infinite animations are 1.2s long (under 1 per second).
