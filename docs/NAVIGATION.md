# Site Navigation Map

Status: milestone (a). Inventory of the site BEFORE the remap. Sections for the new structure are added in later commits.

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
- js/projects.js (legacy list, not loaded by any page): `games/solitaire/index.html` does not exist (real path is games/cards/solitaire/). Left alone.

### Duplicates and overlaps

| Pair | Verdict |
|---|---|
| games/j and games/j_v1 | Same title, v1 is legacy. Keep both, v1 goes to Archive |
| games/input-a11y, _v1, _v2 | Three builds of one tool. Current one is projects/input-a11y. v1 and v2 go to Archive |
| games/sprunki (mixer game) and projects/sprunki-survival (guide) | Different things, same theme. Keep both, cross-listed |
| games/snake and games/snake/negen_version | Remaster, linked from Snake only. Listed separately |
| wosky/charms, gear, hero-gear and wosky/calc-v2/charms, gear, hero-gear | Parallel calculator generations. Both stay listed |
| games/cards poker-hall catalog entry and games/cards hub | Same href. Poker Hall entry opens the whole card hub |
| js/catalog.js and js/projects.js | Two catalogs. projects.js is unused legacy |
