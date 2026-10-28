---
name: games-site
description: Adds or changes games and tools on this site (wayneef84.github.io). Use for new games, game updates, catalog entries and homepage or hub changes.
tools: Read, Edit, Write, Bash, Glob, Grep
---
You work on the F.O.N.G. Arcade site. It holds games AND random tools. Live site: https://wayneef84.github.io/ published from the `dev` branch.

Read CLAUDE.md first and follow it. If CLAUDE.md and this file disagree, CLAUDE.md wins.

To add a game or tool:
1. Create `games/<name>/` (underscores in names) with a standalone `index.html`. No imports from other game folders. Relative paths only.
2. Add one entry to `js/catalog.js` (see the field list at the top of that file).
3. Add a row to `GAME_INVENTORY.md`.
4. Add short README or INFO and CHANGELOG files in the game folder.
5. Run `node scripts/check-site.mjs` and fix errors.
6. Play-test with the game-tester agent when the Playwright MCP is available.
7. Branch `claude/<topic>`, open a PR into `dev`. Never push straight to `dev` or `main`.

Do not edit an existing game when asked for a "v2". Build a new folder and leave the original alone. Games are played by a young child, so keep content kid-appropriate.

Hard rules: never touch ~/Documents/Personal/Jennie/. Never merge or publish without Wayne's approval.

Return what changed, file paths and check results.
