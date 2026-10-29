# Site Navigation Map

Sections 1 is the inventory before the remap. Sections 2 to 4 describe the structure after the remap.

Click depth = pages the visitor must click through starting at `index.html` (the card or link on the homepage is click 1).

## 1. Inventory (before remap, branch `dev`)

Catalog (`js/catalog.js`): 36 entries, 0 dead hrefs.

### Reachable from the homepage

| Item | Path | Depth | Via |
|---|---|---|---|
| Card Games hub (Blackjack, War, Solitaire, Poker, Big 2) | games/cards/ | 1 | Featured / Explore card |
| MD Reader | projects/md-reader/ | 1 | Featured |
| Letter Tracing | games/tracing/ | 1 | Explore card |
| WOSKY_3169 hub | wosky/ | 1 | Explore card |
| Developer Profile | profile/ | 1 | Footer |
| Arcade hub | arcade/ | 1 | Explore card |
| Puzzle hub | puzzle/ | 1 | Explore card |
| Projects hub | projects/ | 1 | Explore card |
| Arcade games: slots, snake, pong, space_invaders, breakout, byte_runner, byte_runner_quest, sky_breakers, animal_stack, sprunki, j, flash_classics | games/... | 2 | Arcade hub |
| Puzzle games: flow, sudoku, minesweeper, mahjong, jigsaw, xtc_ball, board | games/... | 2 | Puzzle hub |
| Projects: shipment-tracker, encyclopedia, dev-utils, input-a11y, name-that-tune, code, regex_builder, web-archive, project-ti-tanium | projects/... | 2 | Projects hub |
| Card games (blackjack, war, solitaire, big2) | games/cards/... | 2 | Cards hub (iframe launcher) |
| WOSKY tools: charms, gear, hero-gear, war-academy, svs, troops, pets, experts, building, calc-v2, v3 | wosky/... | 2 | WOSKY hub |
| Poker variants: holdem, 5card, 13card | games/cards/poker/... | 3 | Cards hub, Poker |
| Tracing modes: letters, words, chinese, sentences | games/tracing/... | 2 | Tracing page |
| Snake NEGEN edition | games/snake/negen_version/ | 3 | Arcade hub, Snake, "Play Remastered" |
| calc-v2 pages: charms, gear, hero-gear, plan, reference, combined | wosky/calc-v2/... | 3 | WOSKY hub, calc-v2 |

### Orphans (no link from the homepage or any hub)

| Item | Path | Note |
|---|---|---|
| Fall Down | games/falldown/ | Game, not in catalog |
| PuzzLLer | games/puzzller/ | Game, not in catalog |
| J Quiz v1 | games/j_v1/ | Legacy of games/j, kept for reference |
| Daily Command Center | daily/ | Tool, not in catalog |
| About / Project Chronicles | about.html | Info page |
| Sprunki Survival Handbook | projects/sprunki-survival/ | Guide, not in catalog |
| Survival Manual | projects/survival-doc/ | Docs page, not in catalog |
| Test Portal (Internal QA) | projects/internal-tests/ | Dev tool, not in catalog |
| Input A11y v1 | projects/input-a11y_v1/ | Deprecated |
| Input A11y v2 | projects/input-a11y_v2/ | Older build of input-a11y |

Orphan count: 10 (plus archive/index_v1.4.html and archive/test-mobile.html, which are intentionally archived and not linked).

### Dead links

- js/catalog.js: 0.
- Fixed: `wosky/index.html` had a card for `./calc-v2/combined.html`, which was never built. The card was removed. The live Calc v2 Unified Planner (`wosky/calc-v2/index.html`) covers charms, chief gear, hero gear, plan and reference.
- Fixed: `js/projects.js` (unused legacy list with a dead `games/solitaire/` path) was deleted. It stays in git history.

### Duplicates and overlaps

| Pair | Verdict |
|---|---|
| games/j and games/j_v1 | Same title, v1 is legacy. Keep both, v1 goes to Archive |
| projects/input-a11y, _v1, _v2 | Three builds of one tool. Current one is projects/input-a11y. v1 and v2 go to Archive |
| games/sprunki (mixer game) and projects/sprunki-survival (guide) | Different things, same theme. Keep both, cross-listed |
| games/snake and games/snake/negen_version | Remaster, linked from Snake only. Listed separately |
| wosky/charms, gear, hero-gear and wosky/calc-v2/charms, gear, hero-gear | Parallel calculator generations. Both stay listed |
| games/cards poker-hall catalog entry and games/cards hub | Same href. Poker Hall entry opens the whole card hub |
| js/catalog.js | The only catalog. The old unused `js/projects.js` was deleted |

## 2. Structure after the remap

Homepage (`index.html`) shows Featured, a search box, a New strip, then four groups. Each group has a "See all" link to `browse/index.html?group=<id>`, which lists every catalog item in that group by sub-heading with a filter box and tabs to the other groups.

| Group (`group` id) | Homepage cards | Contains | Depth |
|---|---|---|---|
| Games (`games`) | Arcade, Card Games, Puzzle, Educational, All games | card, arcade, puzzle, edu entries, plus Name That Tune and C.o.D.E. | sub-hub item 2, browse item 2, poker variants and tracing modes 2 via browse (3 via sub-hubs) |
| Tools (`tools`) | Projects & Tools, All tools | project entries, Daily Command Center, Test Portal | 2 |
| Whiteout Survival (`wos`) | WOSKY_3169, All WOS tools | WOSKY hub, 11 tools, 5 calc-v2 pages | 2 (calc v2 pages 3 via WOSKY hub) |
| More (`more`) | Guides, Labs and Archive, Developer Profile | Profile, About, Survival guides, Archive (J v1, Input A11y v1 and v2) | 2 (Profile 1) |

Deepest catalog item: 2 clicks. Deepest page found by a crawl of all app folders: 3 clicks.

Fun Mode (`?mode=fun`) is carried to the browse pages and sub-hubs. Browse and search list every item in both modes, including entries marked `theme: 'pro'`.

## 3. Adding a new item so it is reachable

1. Add an entry to `js/catalog.js` with the existing fields (id, category, icon, title, funTitle, description, funDescription, version, href, hub, featured, theme).
2. The group comes from `category` (card, arcade, puzzle, edu to Games, project to Tools, wosky to WOS, anything else to More). Set `group: 'tools'` and so on to override. Optional `sub` sets the heading, `parent` marks a child page, `archive: true` files it under More > Archive.
3. The entry then appears on its browse page (2 clicks), in search, and in the matching sub-hub if the category has one. No other file needs editing.
4. Use `./` relative paths. Do not move or rename folders.
5. To showcase a brand-new game on the homepage, set `isNew: true` and `spotlight: true`. Spotlight entries get big "Just added" cards at the very top. Keep it to the 2 or 3 newest and remove `spotlight` when they are no longer new (`isNew` alone only adds a small chip).

## 4. Decisions and leftovers

- Fixed: the dead `combined.html` card on `wosky/index.html` was removed.
- Fixed: `js/projects.js` was deleted (it is in git history if needed).
- Untouched, intentionally not linked: `archive/*.html`, `games/cards/test*.html`. (`games/cards/euchre/` now has a page and is in the hub.)

## 5. Getting back to the homepage (every page)

Every page has a visible way to the homepage. Two shared helpers do most of the work. Both are ES5, classic scripts, relative paths only, and work from `file://` and GitHub Pages.

### Card games: `games/cards/shared/card-nav.js` (`CardNav`)

One 44 px strip at the top of each card page: `Home` (site homepage), `Cards` (card hub, opens that game inside the hub), then the other games (Blackjack, War, Solitaire, Big 2, Poker 5-Card, Hold'em, 13-Card, Euchre) with the current one marked. Under 900 px wide the games fold into a `Games` menu button so the strip stays on one line. Links use `target="_top"`.

When the hub loads a page in its frame (`games/cards/index.html?game=<id>`) the strip draws nothing, because the hub already has Home, Cards and the game list. So there are never two Home buttons.

| Page | Home | Cards | Other games |
|---|---|---|---|
| blackjack, war, solitaire, big2, euchre | strip | strip | strip |
| poker/5card, poker/holdem, poker/13card | strip | strip | strip (the old back arrow still goes to the Poker menu) |
| poker menu (`poker/index.html`) | strip | strip | strip, plus its three game cards |
| hub (`games/cards/index.html`) | Back to Arcade / Exit | itself | all nine entries (Poker Menu, 5-Card, Hold'em, 13-Card, Euchre included) |

Add it to a new card game: put these two lines right after `<body>` (path to `shared/` relative to the page), add the game to the `GAMES` array in `card-nav.js` and in the hub's `GAMES` array:

    <script src="../shared/card-nav.js"></script>
    <script>CardNav.mount();</script>

`CardNav.mount({ current: 'id', title: 'Name' })` overrides the detected game. The strip is `position: relative` and 45 px tall (CSS variable `--cardnav-h`, class `has-cardnav` on `<html>`). A page with a fixed 100vh layout should subtract it, as solitaire, euchre and Big 2 do.

### Everything else: `js/home-link.js` (`FongHome`)

A small fixed `Home` pill (at least 44x44 px, safe-area aware, 85 percent opaque, hidden when printing). It mounts itself, does nothing when the page already links to the homepage, and takes no layout space.

    <script src="../../js/home-link.js" data-corner="br"></script>

Put it just before `</body>`. Attributes: `data-corner` (`tl`, `tr`, `bl`, `br`, default `tl`), `data-root` (relative path to the site root, default read from the script's own `src`, then from the URL), `data-label`. Pick the corner by checking a 390x844 and a 1280x900 viewport so it does not sit on a button, a HUD or a tap area. Prefer a real Home link inside an existing header when the page has one.

### Pages changed

| Page | Before | After | How |
|---|---|---|---|
| games/animal_stack, falldown | none | Home | pill, top-right (HUD is top-left) |
| games/snake/negen_version, mahjong | none | Home | pill, bottom-right |
| games/flow | none | Home | pill, top-left |
| games/tracing/letters | house button to a missing page | Home | house button now points to the homepage |
| games/tracing/words, chinese, sentences | hub link only | Home | pill, bottom-right |
| projects/shipment-tracker | none | Home | house button in the header controls |
| projects/dev-utils | none | Home | nav item at the top of the sidebar |
| projects/code | Projects hub only | Home | link next to "Projects" |
| projects/md-reader, input-a11y, input-a11y_v1, input-a11y_v2 | none | Home | pill, bottom-right |
| projects/regex_builder, web-archive, project-ti-tanium | none | Home | pill, top-left |
| projects/internal-tests, sprunki-survival, survival-doc | none | Home | pill, bottom-right |
| daily | none | Home | pill, bottom-right |
| about.html | none | Home | pill, top-left |
| wosky/v3 | none | Home | house button in the header |

Left alone on purpose: `games/sprunki_v2`, `nightlite_choir`, `memory_match`, `byte_runner`, `byte_runner_quest` (own Home buttons, other work in progress).
