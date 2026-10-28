# Memory Match: Architecture

Standalone folder, strict ES5, no libraries, no CDNs, relative paths only. Works from file:// and GitHub Pages.

## Files
| File | Role |
|---|---|
| `index.html` | Header (Home, title, mute, settings, restart), status line, board, settings panel, win panel, confetti canvas |
| `css/style.css` | Layout and styles. Card flip is a CSS 3D rotate. Reduced-motion media query turns off flips and bounces |
| `js/cards.js` | `MMCards`: card sets. `emoji` (21 items) and `animals` (14 inline SVG strings built from small helpers) |
| `js/sound.js` | `MMSound`: Web Audio blips (flip, match, win). Context is created on the first tap. Master gain 0.12 |
| `js/app.js` | Game state, input, layout, storage, settings UI, confetti. Exposes `window.MemoryMatch.getState()` (read-only, for tests) |

## State
`game = { cards[], moves, first, pending, matched, pairs, over, started, seconds }`. A card is `{ pair, item, up, matched }`.
- `flip(i)`: if a mismatch is pending, `resolvePending()` runs first (cards turn face down, timer cleared), then the tap flips normally. A child is never blocked.
- Second flip counts one move. Same `pair` means matched. Otherwise `pending = [a, b]` and a 900 ms timeout calls `resolvePending()`.
- All pairs matched: `over = true`, win panel after 800 ms, best updated.

## Layout
`doLayout()` measures `.board-wrap`, tries the size as portrait (cols x rows) and transposed, keeps the one with the larger card, caps at 150 px. No scrolling at 360x640 or in landscape.

## Input
`pointerdown` on the board flips (touch-action: manipulation, preventDefault). `click` is only used when no pointer was seen (assistive tech). `keydown`: arrows move a roving tabindex, Enter or Space flips.

## Storage
One key, `memorymatch.v1`: `{ set, size, mute, timer, best: { "<size>_<set>": moves } }`. All access in try/catch.
