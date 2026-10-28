# Homepage theming: spec (draft for Wayne's approval)

Status: design only, no code. Written 2026-10-28. Scope: the HOMEPAGE (`index.html`) only. Games keep their own looks. Hubs (browse, arcade, puzzle, projects) come later.

## 1. Goal
The same homepage content can look completely different. Visitors switch skins and palettes, and can build their own theme, rename boxes, make their own groups by game id, and export or import it all as a JSON file. Power users may add custom CSS and, as an opt-in, custom JavaScript, without putting the site or a child's saved data at risk.

## 2. The model: Skin x Palette x Your overrides
| Layer | What it is | Where it lives |
|---|---|---|
| Skin | Layout, type, shapes, ornament, motion personality | `css/skins/<id>.css`, scoped under `[data-skin="<id>"]` |
| Palette | Named set of hex colors | `js/theme/palettes.js` (data) |
| Your overrides | Per-field hex, names, groups, hidden, pinned, behaviors | one JSON saved in `localStorage` key `fong_theme_v1` |
| Safe CSS (opt-in) | Extra CSS, filtered | inside the JSON, `css` |
| Script (opt-in) | Sandboxed JS | inside the JSON, `js` |

Apply order: skin, palette, overrides, safe CSS, script. A tiny `js/theme/loader.js` in `<head>` sets `data-skin` and CSS variables before first paint, so there is no flash. Everything is ES5, relative paths, no CDN, no network.

## 3. Tokens
`bg`, `surface`, `text`, `dim`, `accent`, `accent2`, `border`, plus group colors `games`, `tools`, `wos`, `more`. Derived automatically: `onAccent` (black or white, whichever has the better contrast on the accent), hover and shadow tints. The panel warns when text contrast is below 4.5:1 and offers "fix for me".

## 4. Built-in palettes (all checked: body text 8.6:1 or better, dim text 5.0:1 or better)
| Name | bg | surface | text | dim | accent | accent2 |
|---|---|---|---|---|---|---|
| Tomato Soup | #FBEFDC | #FFF8EC | #2B1B14 | #6B5547 | #D8432B | #2F6F68 |
| Pond Light | #0E2A2A | #153838 | #E6F2E4 | #9DB8AE | #F2C14E | #7FD1B9 |
| Laundromat | #EAF3F5 | #FFFFFF | #12303A | #4F6B75 | #1B7F9E | #C23B73 |
| Sunday Paper | #F1EDE4 | #FAF8F2 | #1D1D1B | #5C5A54 | #B3261E | #1F4E8C |
| Night Shift | #14110F | #201B18 | #F0E6D8 | #A3968A | #FF8A3D | #8FD694 |
| Bus Seat | #1F2F7A | #2B3E96 | #FFF4D6 | #C9D0F0 | #FFC20E | #FF8A8A |
| Mint Chip | #E7F5EC | #F7FFF9 | #17352A | #4A6B5A | #1F8A5B | #8A4B2A |
| Chalkboard | #22302A | #2C3D35 | #F2F0E6 | #A9B8AE | #F7D56E | #F28F8F |
"Classic" keeps today's navy and cyan so nothing is lost. Accent colors are used for large text, borders and button fills (with `onAccent` text), never for small body text.

## 5. Skins (each must have its own layout idea, type pairing, ornament and motion)
Not allowed anywhere: purple-blue gradients, glassmorphism, neon on navy, or the generic "rounded card grid with an emoji" look. Every skin is reviewed by screenshots at phone and desktop width before it ships.

| Skin | Concept | Layout | Type (candidates, open-licensed, bundled) | Ornament and motion |
|---|---|---|---|---|
| Classic | Today's look, kept | Current grid | Inter, Space Mono (already bundled) | Current |
| Print Shop | Zine and risograph | Cards as slightly tilted stickers on paper | Bold grotesk display + mono labels | Halftone dots, hard offset shadows, cards "stick" on hover |
| Cabinet of Drawers | Index-card cabinet | Groups are drawers with tabs, items are labelled cards | Serif + typewriter | Felt and wood tones, drawer slides open |
| Control Panel | Synth or hardware panel | Groups are modules, items are buttons with LED dots | Condensed sans + mono | Panel screws, LED blink on play, knob-style toggles |
| Metro Map | Transit map | Each group is a colored line, each game a station on it | Rounded sans | Route lines drawn in SVG, stops pulse on hover |
| Handheld | Retro handheld LCD | One LCD-style screen with a D-pad style group switcher | Pixel font | Pixel-green tones, scanline hint, blip on tap |
| Scrapbook | Corkboard | Taped cards, notes and doodles | Handwriting font | Tape, pins, paper shadows, cards wobble in |
Only generic shapes are used, never real transit-map or console artwork. Font licenses are checked when bundled and logged in `LICENSE_AUDIT.md`.

## 6. Customization (what the panel edits)
- **Look:** skin and palette pickers with live preview.
- **Colors:** one hex picker per token (and a hex text field).
- **Shape and type:** radius 0 to 24, border 0 to 4, shadow (none, soft, hard), density (compact, cozy, roomy), fonts from the bundled list, background pattern (none, dots, grid, paper, stripes; CSS gradients only).
- **Names:** rename the site title, any group or any card. Original names are kept, so "reset name" always works.
- **Groups:** reorder built-in groups, hide items, pin favorites, and make custom groups by catalog id (an ID browser lists every game and tool with its id, plus a copy button).
- **Behaviors:** sort most played first, show play counts, show NEW badges, show the Just added cards.
- **Motion:** full, reduced or off (also follows `prefers-reduced-motion`).
- **Advanced:** custom CSS and the script opt-in (section 8).
- **Share:** export JSON, import JSON (file or paste), copy to clipboard, reset to default.

## 7. The JSON file (version 1)
```
{ "format": "fong-theme", "version": 1, "name": "Kenzie's board",
  "skin": "print-shop", "palette": { "bg": "#FBEFDC", "accent": "#D8432B" },
  "fonts": { "display": "grotesk", "ui": "system" },
  "shape": { "radius": 12, "border": 2, "shadow": "hard", "density": "cozy", "background": "dots" },
  "motion": "reduced",
  "labels": { "site-title": "Kenzie Arcade", "memory-match": "Brain Flip", "games": "Play Stuff" },
  "groups": [ { "id": "kenzie", "label": "Kenzie's", "items": ["memory-match", "sprunki-v2"] } ],
  "order": ["kenzie", "games", "tools"], "hidden": [], "pinned": ["memory-match"],
  "behaviors": { "sortMostPlayed": true, "showPlayCounts": true, "showNewBadges": true, "showJustAdded": true },
  "css": "", "js": "" }
```
Limits: file 64 KB, `css` 8 KB, `js` 16 KB, names 40 characters, 12 custom groups, 40 items per group, 200 hidden, 12 pinned. Colors must be `#RGB` or `#RRGGBB` only (no `rgb()`, `url()`, names or variables). Group ids match `[a-z0-9-]{1,24}`. Item ids must exist in `js/catalog.js`, and unknown ones are dropped and listed in the import report. Unknown keys are dropped and reported. Newer versions are refused with a clear message. Docs: `docs/CUSTOMIZE.md` (guide) and `docs/CUSTOMIZE_IDS.md` (id reference generated from the catalog by `scripts/gen-id-reference.mjs`; the PR check warns when it is stale).

## 8. Security model (Wayne: both CSS and JS wanted, security not sacrificed)
Rule zero: imported data is never trusted. Text is only ever written with `textContent`, never `innerHTML`.

| Tier | What | Default | Protection |
|---|---|---|---|
| 1 Data | The JSON fields above | On | Strict validator, caps, hex-only colors, id checks, import preview and report, nothing applied without a click |
| 2 Safe CSS | Extra CSS | Off until the user pastes or imports some and confirms | Parsed and filtered (below) |
| 3 Script | Custom JS | OFF. Needs a global "Allow theme scripts" switch plus a per-theme confirm. Import NEVER turns it on | Sandboxed iframe (below) |

**Safe CSS filter.** Allowed: a whitelist of properties (colors, backgrounds without images, borders, radius, spacing, font size and weight, opacity, transform, transition, animation of those) on a whitelist of our own class and attribute selectors, scoped under the homepage. Blocked: `url()`, `image-set()`, `@import`, `@font-face`, `@namespace`, `expression()`, `behavior`, `-moz-binding`, `attr()` in content, `javascript:`, comments tricks, and anything it cannot parse (dropped, not guessed). Reason: remote `url()` can pull in outside files or ping a tracker. The panel shows what was kept and what was removed.

**Script sandbox.** The script never runs in the page. It runs inside an `<iframe sandbox="allow-scripts">` WITHOUT `allow-same-origin`, so it has an opaque origin: no access to the page, `localStorage`, IndexedDB, cookies or the parent DOM. A CSP inside the iframe (`default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'`) blocks all network. The iframe is a decorative layer (a full-size canvas behind the cards, `pointer-events: none`). The only way out is a tiny `postMessage` API: draw to the canvas, and ask for palette token changes, which pass through the same validator as imported JSON. The page never evals anything it receives.
- **Residual risk (honest):** a runaway loop can still slow or freeze the tab. Mitigations: hosting the script in a Worker inside the sandbox so a loop cannot block the page (to be tested in Phase 3, and dropped if it does not work in Safari), a frame budget, and the recovery links below. A theme can still look ugly or annoying, but it cannot read or change saved data or send anything out.
- A child cannot turn scripts on by accident: the switch sits behind a plain-language warning and an "I understand" step.

**Recovery and kill switches.** `?theme=default` ignores any saved theme for that visit and offers "reset". `?safe=1` also disables scripts and custom CSS. Home, search and the Customize button always stay visible and cannot be hidden by a theme, and CSS cannot target them.

**Tests required before merge (Phase 1 and 3):** a folder of hostile JSON samples (huge, wrong types, script tags in names, `url()` colors, prototype-pollution keys like `__proto__`, 10,000 groups) that must all be rejected or cleaned; CSS filter unit tests with known bypass tricks; for scripts, a test script that tries to read `localStorage`, `indexedDB`, `parent.document`, `fetch` and `new Image().src` and must fail on every one.

## 9. Panel UI (phone first, 44 px or larger targets)
A "Customize" button in the header opens a full-screen sheet with tabs: Look, Colors, Names, Groups, Behavior, Advanced, Share. Live preview behind it. A "Reset to default" button is always visible. It is keyboard and screen-reader usable.

## 10. Build plan
| Phase | What | Agents |
|---|---|---|
| 1 | Engine (loader, validator, tokens, palettes), panel, JSON export and import, ID reference and docs, Classic and Print Shop skins | 1 |
| 2 | Cabinet of Drawers, Control Panel, Metro Map, Handheld, Scrapbook | up to 3 in parallel, after Phase 1 merges |
| 3 | Safe CSS ingester and the script sandbox, then an independent security review | 1 builder, 1 reviewer |
Each phase is its own PRs, checked by Playwright (phone and desktop screenshots, no console errors) and the PR check. Nothing merges without Wayne's OK. Every new folder keeps its 7 docs.

## 11. Open decisions
- Final skin list (the seven above are proposals).
- Which fonts to bundle (licenses are checked at build time).
- Whether Phase 3 (CSS and script) is worth doing after Phases 1 and 2 are live.
