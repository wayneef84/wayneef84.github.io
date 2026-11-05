# F.O.N.G. Arcade - Architecture

**Last reviewed:** 2026-11-04

Static site on GitHub Pages, served from the `dev` branch. Plain HTML, CSS and ES5 JavaScript. No build step, no CDNs, no server of its own. Every game and tool is a folder with its own `index.html` and docs. Shared code is loaded with plain `<script>` tags and exposes one global per module.

## Layout

```
/
├── index.html            Homepage (hub)
├── arcade/ puzzle/       Category hubs
├── js/
│   ├── catalog.js        FONG_CATALOG: every game and tool. All hubs read it
│   ├── hub-*.js          Homepage data, nav and filters
│   ├── theme/            Theme engine: loader, palettes, validator, apply, Customize panel
│   ├── settings.js       Settings hub (Look, Scores, Cheers, Play, Data)
│   ├── prefs.js          Shared prefs such as Calm mode (fong.prefs.v1)
│   ├── scores.js         FongScores: per-device top 5 scores
│   ├── player-stats.js   FongStats: plays, last played, best
│   ├── gamesaves.js      FongGameSaves: per-game save export and import (manifest of keys)
│   ├── gdrive-*.js       Optional Google Drive backup and autosave (off until a Client ID is set)
│   ├── cheer.js          FongCheer: parent-controlled spoken cheers
│   ├── home-link.js      FongHome: Home pill on pages with no way back
│   └── pwa.js            Install button and update toast
├── css/
│   ├── components/       global.css (tokens, type), card.css (grid and cards)
│   ├── skins/            7 homepage skins
│   └── settings.css, theme-*.css
├── sw.js, manifest.webmanifest, offline.html   Installable app and offline cache
├── games/<slug>/         One folder per game
│   └── cards/shared/     Card engine: enums, card, deck, pile, player, engine, card-assets, card-anim, card-nav
├── projects/<slug>/      Tools (md reader, shipment tracker, regex builder, dev utils, encyclopedia)
├── wosky/                Whiteout Survival calculators (see wosky/TOOLKIT.md)
├── negen/                NEGEN canvas game engine (Pong, Breakout, Space Invaders)
├── shared/, storage/     Shared JS and persistence drivers (FongDB)
├── assets/               Local fonts, icons, images
├── legal/                Privacy, terms, data policy
├── docs/                 All other docs (docs/INDEX.md)
├── scripts/              check-site.mjs (PR check), gen-id-reference.mjs
└── tests/                Node tests (tests/*.test.js) and a Playwright smoke test
```

## Key ideas

- **One catalog.** `js/catalog.js` lists every entry once. Hubs, the theme engine and the ID reference read it. A page that is not in the catalog does not show on any hub.
- **Federated games.** Each game owns its folder and docs. Games pin the shared library version they use in their `INFO.md`. Do not edit another game to fix yours.
- **Card engine in three layers.** Deck/Pile (storage and dealing), State Machine (`engine.js`, turn flow) and a per-game Ruleset (rules, scoring, AI). `card-anim.js` handles deal, flip, sweep and coin animations and respects Calm and reduced motion.
- **Local first.** All saves live in `localStorage` or IndexedDB. Export and import of save files is the core backup. Google Drive is an opt-in add-on behind the grown-ups question.
- **Untrusted input.** Imported saves and themes are validated (key whitelist, size caps, JSON checks) and never reach `innerHTML`.
- **Offline.** `sw.js` caches pages after the first visit: HTML network first, other files stale while revalidate. Bump `CACHE_VERSION` when shared files change. Kill switch `?pwa=off`.
- **Relative paths only** so the site works from any folder, from `file://` for most pages and from a local static server.

## Browser support

ES5 for old family tablets (Safari 9+, Chrome 50+, Firefox 45+). Mobile first, 44px touch targets, `env(safe-area-inset-bottom)` for notched phones.

## Checks

Every PR runs `node scripts/check-site.mjs`: catalog validity, links, ES5, relative paths, no CDNs and the 7 docs per game folder. See docs/INDEX.md.
