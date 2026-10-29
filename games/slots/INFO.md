# Slots - Info

## Metadata
- **Name:** Slots
- **Path:** `games/slots/`
- **Catalog id:** `slots`
- **Version:** 4.1.1
- **Category:** Arcade
- **Last updated:** 2026-10-29
- **Status:** Draft (PR into dev)

## Description
Play-money slot machine toy with 60 themes and 6 modes (Classic 3-Reel, 5-Reel Lines, Cascade, Match Groups, Pick-a-Prize, Prize Wheel). Coins only, free refill, calm mode, runs offline.

## Features
- 6 modes sharing coins, bet and theme
- 60 data-driven themes with search and group chips (including a K's Picks chip for 6 pink, purple and rainbow themes)
- Optional parent-controlled spoken cheers (`../../js/cheer.js`, see docs/CHEER.md). Off by default.
- CSS 3D drum reels
- Bonus screens: Pick-a-Prize and Prize Wheel (stand-alone and as free bonuses)
- Calm mode and `prefers-reduced-motion`
- Save with migration from v3

## Dependencies
None. Font Nunito (local, `assets/fonts/`).

## Configuration
### Available Settings
| Setting | Where | Notes |
|---|---|---|
| Theme | theme bar | saved |
| Mode | mode chips | saved |
| Bet | + / - | 10, 20, 50, 100, 250 |
| Sound | speaker button or help sheet | saved |
| Calm mode | help sheet, or `?calm=1` | saved (the URL flag is not saved) |

Storage key: `fong.slots.v4`.

## Return to player (measured, tests/sim.js, 1,000,000 rounds per mode)
| Mode | Target | Measured |
|---|---|---|
| Classic | 94% | 94.3% |
| 5-Reel | 95% | 94.9% |
| Cascade | 95% | 95.7% |
| Match | 95% | 95.0% |
| Pick | 95% | 95.0% (exact) |
| Wheel | 95% | 95.0% (exact) |

## Compatibility
Tested: Chromium 390x844 and 360x640, http and file://. Not tested: Safari, Firefox, real devices, screen readers.

## Technical Stack
HTML, CSS (3D transforms), ES5 JavaScript, Web Audio.

## Related Files
DESIGN.md, ARCHITECTURE.md, ASSET_LOG.md, `js/catalog.js` (entry `slots`), `GAME_INVENTORY.md`.
