# Scrapbook skin

Skin id `scrapbook`, file `css/skins/scrapbook.css`. A corkboard: cork speckle and a wooden frame around the screen, cards as paper notes and snapshots held by tape or push pins, each with its own tilt and paper tone. Group headings are handwriting on torn masking tape with a hand-drawn star. Titles use Caveat. Long text uses `system-ui, sans-serif` so it stays easy to read.

## How it works
- Everything is scoped under `html[data-skin="scrapbook"]`, so `?mode=fun` only changes wording.
- Colors come from the palette variables. Paper tones are mixed from `--bg-surface` (never fixed white), tape from the accent colors, so all 8 palettes and per-color overrides work. Browsers without `color-mix()` fall back to plain surface-colored paper.
- Six repeating paper types by `nth-child`: ruled note, plain with a pin, graph paper, index card with a pin, kraft with tape, sticky note with a folded corner.
- Ornaments (tape, pins, stars, squiggles) are pseudo-elements, gradients and inline `data:image/svg+xml` masks colored by variables. Nothing blocks clicks.
- Motion: cards wobble in and settle, and lift on hover or focus. Off under the engine motion setting `reduced` or `off` and under `prefers-reduced-motion`.
- Shape variables are honored: border width, shadow (none, soft, hard), density, radius, and the font choices.
- Body text uses the primary text color on paper for contrast. Dimmer text is not used on paper.

## Font and license (for LICENSE_AUDIT.md)
| Item | Value |
|---|---|
| Font | Caveat (regular 400 and bold 700, latin subset) |
| Files | `assets/fonts/Caveat-Regular.woff2` (48,836 bytes), `assets/fonts/Caveat-Bold.woff2` (51,020 bytes), `assets/fonts/Caveat-OFL.txt` |
| License | SIL Open Font License 1.1, Copyright 2014 The Caveat Project Authors |
| Version | `@fontsource/caveat` 5.3.0 |
| Source | https://github.com/googlefonts/caveat, packaged by https://fontsource.org (npm `@fontsource/caveat`, downloaded at build time, files copied in) |
| Declared | `@font-face` at the top of `css/skins/scrapbook.css`, family `Caveat`, `font-display: swap` |

## Notes for the orchestrator
- No JS or markup hook was needed. The skin uses existing class names only.
- The skin default colors are Tomato Soup values. `palettes.js` registers the skin default palette separately.
