# Control Panel skin

File: `css/skins/control-panel.css`. Skin id `control-panel`. Default palette: Night Shift. CSS only, no JS or markup changes.

## Look
- Page is a rack: fine brushed grain, plus mounting rails with holes at both edges from 900 px up.
- Each group is a module: bevelled inset border, four screws (radial gradients with slot lines), a silkscreen header (uppercase Barlow Condensed, a boxed module number such as 01 and a tick scale in the group color).
- On desktop the first module and a last odd module run full width, the others sit two across.
- Cards are flat panel keys with a lens bezel for the icon. Each key has a small LED dot at the top right. It glows (flicks on) on hover, focus and press. NEW cards and Just added cards breathe softly. LED color follows the group color.
- Controls: Customize is a knurled knob with a pointer notch on phones and a flat switch from 560 px. Fun Mode and See all are flat switches (Fun Mode has a slot and thumb). Plays is a recessed readout. Search is an input window.
- Wood-free: every surface comes from `--bg-base` and `--bg-surface`, edges from translucent white and black.

## Motion
LED flick on hover, quick press-in (3 px, 60 ms) on active. NEW LEDs breathe. With reduced motion (setting or system) or motion off, the flick and breathing stop and the lit state remains.

## Respects
Palette variables, per-color overrides, radius, border width, shadow (none, soft, hard), density, motion, background pattern. `?mode=fun` only changes wording. The Customize button, Home link, title and search stay visible. Tap targets are 44 px or more.

## Fonts (bundled, latin subset woff2, in `assets/fonts/`)
| Font | Files | License | Version | Source |
|---|---|---|---|---|
| Barlow Condensed | `BarlowCondensed-Regular.woff2`, `BarlowCondensed-Bold.woff2`, `BarlowCondensed-OFL.txt` | SIL OFL 1.1 | 5.3.0 (fontsource) | https://github.com/jpt/barlow via `@fontsource/barlow-condensed` |
| IBM Plex Mono | `IBMPlexMono-Regular.woff2`, `IBMPlexMono-Bold.woff2`, `IBMPlexMono-OFL.txt` | SIL OFL 1.1 | 5.3.0 (fontsource) | https://github.com/IBM/plex via `@fontsource/ibm-plex-mono` |
All eight woff2 files for both skins total 147,392 bytes.

## Contrast, lowest of all measured text per palette (pixel sampled under the text)
Default 5.92, Tomato Soup 4.76 (Customize button), Pond Light 5.98, Laundromat 4.59 (Customize button), Sunday Paper 5.85 (Customize button), Night Shift 5.92, Bus Seat 6.17, Mint Chip 4.84 (Customize button), Chalkboard 5.56. Card body text is 5.56 or better everywhere.
