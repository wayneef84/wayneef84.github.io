# Skin: Handheld

Skin id `handheld`. File: `css/skins/handheld.css`. Default palette: Mint Chip.

## Look
A retro handheld game screen. The page content (`main`) is the LCD: a pixel-stair border made of stepped `box-shadow` layers with notched corners, a faint scanline overlay (`main::after`, `pointer-events: none`, about 4.5 percent opacity) and a plastic-colored page body around it. On screens 1180 px and wider the plastic carries a D-pad and two A/B buttons (`body::after`, fixed, `pointer-events: none`). The footer has a speaker grille.

- Group headings are inverted "screen title" bars with the group color as a pixel square. The "See all" link sits in the bar.
- Cards are menu rows with dotted dividers and a bracketed count, for example `[15 GAMES]`. Hover or keyboard focus inverts the row and shows a blinking 4 x 7 pixel cursor arrow (a stepped `clip-path` polygon). Pressing a row nudges it down one step.
- Featured and Just added cards are cartridge slots with a thin pixel frame. The arrow blinks next to the button text on hover or focus.
- Card emoji are turned monochrome (`grayscale`) to sit on the LCD.
- The header has a power LED that blinks in steps.

## Type
Silkscreen (headings, labels, buttons, counts, chips) and `ui-monospace, Menlo, Consolas, monospace` for descriptions, so long text stays readable.

## Motion
Stepped only: `steps()` for the cursor blink, LED blink, NEW badge blink and a one-time 10-step "boot" reveal of each screen title. `prefers-reduced-motion` and the engine motion setting (reduced, off) turn these off, leaving the final static state.

## Variables used
`--bg-base` (the LCD), `--bg-surface` (inputs and cartridges), `--text-primary` (ink, bezel, selected rows), `--text-secondary`, `--accent-primary`, `--accent-secondary`, `--on-accent`, `--on-accent2`, `--btn-bg`, `--btn-color`, `--grp-*`, `--t-bw` (pixel size of the border steps), `--t-density`, `data-shadow` (none removes the LCD drop shadow). The plastic is `color-mix(in srgb, var(--bg-base) 86%, var(--text-primary))` with a flat fallback color for older browsers. Group colors are only used for pixel squares, never for text.

## Fonts (for LICENSE_AUDIT.md)
| Font | Files | License | Version | Source |
|---|---|---|---|---|
| Silkscreen (Regular 400, Bold 700, latin) | `assets/fonts/Silkscreen-Regular.woff2`, `Silkscreen-Bold.woff2` | SIL OFL 1.1, text in `assets/fonts/Silkscreen-OFL.txt`. Copyright 2001 The Silkscreen Project Authors | `@fontsource/silkscreen` 5.3.0 | https://github.com/googlefonts/silkscreen via https://www.npmjs.com/package/@fontsource/silkscreen |

Metro Map font files total 32 KB and Handheld 16 KB, 48 KB together.
