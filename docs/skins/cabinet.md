# Cabinet of Drawers skin

File: `css/skins/cabinet.css`. Skin id `cabinet`. Default palette: Sunday Paper. CSS only, no JS or markup changes.

## Look
- Top rail is a wood bar with a brass name plate for the site title.
- Each group is a drawer front: wood with grain lines, bevel line, a brass label plate (two screws) and a brass pull handle on the lower lip.
- The cards sit in a felt-lined tray as index cards: a red header rule under the title, faint ruled lines under the description, a lettered divider tab on top (A, B, C, staggered left, middle, right) whose cap shows the group color, and a dashed rubber-stamp icon.
- Featured and Just added cards carry a paper clip. Search is a typed "request slip".
- The first two cards of every drawer run wide on desktop.
- Wood, felt and speck colors are mixed from the palette variables with `color-mix`, so every palette recolors the cabinet. Brass is fixed (it carries its own dark ink, so plate text is always readable). Browsers without `color-mix` get the Sunday Paper fallbacks.

## Motion
Hover, focus and press pull the card up 12 px out of the drawer and show the stack edge behind it. With reduced motion (setting or system) or motion off, the slide is dropped and only the border and tab color change.

## Respects
Palette variables, per-color overrides, radius, border width, shadow (none, soft, hard), density, motion, background pattern. `?mode=fun` only changes wording. The Customize button, Home link, title and search stay visible. Tap targets are 44 px or more.

## Fonts (bundled, latin subset woff2, in `assets/fonts/`)
| Font | Files | License | Version | Source |
|---|---|---|---|---|
| Fraunces | `Fraunces-Regular.woff2`, `Fraunces-Bold.woff2`, `Fraunces-OFL.txt` | SIL OFL 1.1 | 5.3.0 (fontsource) | https://github.com/undercasetype/Fraunces via `@fontsource/fraunces` |
| Courier Prime | `CourierPrime-Regular.woff2`, `CourierPrime-Bold.woff2`, `CourierPrime-OFL.txt` | SIL OFL 1.1 | 5.3.0 (fontsource) | https://github.com/quoteunquoteapps/CourierPrime via `@fontsource/courier-prime` |
Both skins together use 147 KB of fonts (see control-panel.md for the other two).

## Checked
Text contrast (pixel sampled under the text) is at least 4.5 to 1 on all 8 palettes and the default. See the PR for numbers.

## Contrast, lowest of all measured text per palette
Default 6.49, Tomato Soup 4.76 (Customize button), Pond Light 5.98, Laundromat 4.59 (Customize button), Sunday Paper 6.49, Night Shift 5.92, Bus Seat 6.17, Mint Chip 4.84 (Customize button), Chalkboard 5.56. Card body text is 5.56 or better everywhere.
