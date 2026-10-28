# CHECKPOINT: theme engine (delete before merge)

Branch: claude/theme-engine. Work clone: scratchpad/work-theme. Spec: docs/THEMING_SPEC.md.

## Done
- (a)+(b core) js/theme/loader.js, palettes.js, validate.js, apply.js, css/skins/classic.css, css/theme-overrides.css, index.html wiring, Classic parity (0 pixel diff vs dev at 1280 and 390, Customize button removed for the diff).

- (d) ID reference: scripts/gen-id-reference.mjs, docs/CUSTOMIZE_IDS.md, check-site warns when stale.
- (e) Print Shop skin css/skins/print-shop.css, fonts Space Grotesk 500/700 in assets/fonts (LICENSE_AUDIT.md entry still TODO).
- (c) panel js/theme/panel.js + css/theme-panel.css built, smoke tested at 390.
- (b) hostile samples tests/theme/hostile (22 files), runner is scratchpad/pw/hostile.js (165/165 pass). hub-filters.js and hub-nav.js apply config (d, partial: ID reference still to do).

## In progress / next
- hostile tests (tests/theme/hostile/*.json + Playwright runner), panel (js/theme/panel.js, css/theme-panel.css), hub-filters overrides, ID reference + gen script, Print Shop skin (css/skins/print-shop.css is an empty placeholder), fonts audit in LICENSE_AUDIT.md, docs.

## Resume
1. cd work-theme, git status, read this file.
2. Serve: python3 -m http.server <port>. Screens: scratchpad/pw/shoot.js, diff.js.
3. Run node scripts/check-site.mjs (never --update-baseline).
