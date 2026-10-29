# Skin: Metro Map

Skin id `metro-map`. File: `css/skins/metro-map.css`. Default palette: Laundromat.

## Look
A transit map. Each homepage group is a thick rounded LINE in its group color (`--grp-games`, `--grp-tools`, `--grp-wos`, `--grp-more`, custom groups use the secondary accent). Each card is a STATION: a round stop marker sits on the line, the "All ..." cards end the line with a square terminus marker. The group heading is a line badge, a pill with a thick border in the line color and a terminus disc. Featured and Just added cards are flat "interchange boards" with a line-colored bar along the bottom. The header is a signage bar with the four lines running under it and the site name on a dark name plate. The footer is a dashed track.

Phones and tablets: vertical lines, stations stacked. From 1000 px: lines run left to right with stations hanging below.

Card emoji icons are hidden in the group stations (the marker replaces them). They stay in the Featured and Just added boards.

## Motion
The station marker pulses once (`mm-pulse`, 0.7 s) on hover or keyboard focus. Nothing else animates. `prefers-reduced-motion` and the engine motion setting (reduced, off) turn the pulse off.

## Variables used
`--bg-base --bg-surface --text-primary --text-secondary --accent-primary --accent-secondary --on-accent --on-accent2 --btn-bg --btn-color --grp-*`, plus `--radius-lg` (pill radius, slider makes the pills squarer), `--t-bw` (border width), `--t-density` (spacing), `data-shadow` (none, soft, hard). Text is always `--text-primary` or `--text-secondary` on `--bg-base` or `--bg-surface`. Group colors are only used for lines, rings and underlines, never for text.

## Fonts (for LICENSE_AUDIT.md)
| Font | Files | License | Version | Source |
|---|---|---|---|---|
| Nunito (Regular 400, Bold 700, latin) | `assets/fonts/Nunito-Regular.woff2`, `Nunito-Bold.woff2` | SIL OFL 1.1, text in `assets/fonts/Nunito-OFL.txt`. Copyright 2014 The Nunito Project Authors | `@fontsource/nunito` 5.3.0 | https://github.com/googlefonts/nunito via https://www.npmjs.com/package/@fontsource/nunito |
