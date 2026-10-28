# CLAUDE.md - Start here (all LLMs)

Single entry point for Claude (browser and CLI), Gemini, Jules, Codex and any other LLM. `AGENTS.md`, `AGENT.md`, `GEMINI.md`, `JULES.md` and `ONBOARDING.md` point here. Index of every doc: [docs/INDEX.md](docs/INDEX.md).

## What this site is

F.O.N.G. Arcade, Wayne Fong's public site at https://wayneef84.github.io. Static HTML/CSS/JS on GitHub Pages, served from the **`dev`** branch. It is not only games. It holds:
- Games (cards, arcade, puzzle, educational) in `games/`
- Tools and utilities in `projects/` (markdown reader, shipment tracker, regex builder, dev utils, encyclopedia, and more)
- Whiteout Survival (WOS) calculators and planners in `wosky/`
- Hub, profile, admin and about pages

No build step. Open `index.html` or run any static server (`python3 -m http.server`).

## Repo map

| Path | Purpose |
|---|---|
| `index.html`, `arcade/`, `puzzle/`, `games/cards/index.html`, `projects/index.html` | Hub pages |
| `js/catalog.js` | `FONG_CATALOG`: single source of truth for every game and tool entry. Hubs read it |
| `games/<name>/` | One folder per game |
| `projects/<name>/` | One folder per tool or utility |
| `wosky/` | WOS calculators. Read `wosky/TOOLKIT.md` before adding a tool |
| `negen/`, `shared/`, `storage/` | Homegrown engine, shared JS, persistence drivers |
| `css/`, `assets/` | Shared styles, local fonts and images |
| `profile/`, `daily/`, `about.html` | Profile, daily feed, about |
| `admin/` | Checklists, policies, doc templates |
| `docs/` | All other docs. See `docs/INDEX.md`. Old material in `docs/archive/` |
| `tests/` | Playwright smoke test |
| `LL/` | Lessons learned by topic (card engine, ES5/Safari, collaboration) |

## Branch and PR workflow

1. Branch from `dev`: `claude/<topic>` (Claude), `feat/...` or `fix/...` (others). Jules or Gemini working from a GitHub comment: use the branch they open.
2. Commit small. Messages: `feat:`, `fix:`, `docs:`, `refactor:`, `license:`.
3. Push the branch. Open a PR into `dev`. Never push or force-push to `dev` or `main`.
4. Wayne reviews and merges. Only Wayne merges `dev` to `main`.
5. Delete the branch after merge.

## Add a game or tool

1. Create `games/<slug>/` (or `projects/<slug>/`, or `wosky/<slug>/` for WOS tools). Lowercase, underscores or hyphens like its neighbors.
2. Add `index.html`. Relative paths only, mobile-first, title uses "F.O.N.G.", link back to the hub.
3. Put code in the folder (`js/`, `css/`). ES5, no CDNs. Reuse `negen/` or `shared/js/` when it fits.
4. Register it in `js/catalog.js` (fields documented at the top of that file). Wrong or missing entries mean the hub will not show it.
5. Add a row to `GAME_INVENTORY.md` (games) and a line to `CHANGELOG.md` if it is a release.
6. Add a short `README.md` in the folder. See `admin/DOC_TEMPLATES/` for the full set.
7. Test: load the page, play it on a narrow viewport, check the console for errors. Run `tests/verification.spec.js` with Playwright if you touched the hub.
8. If you add a third-party asset, log it in `LICENSE_AUDIT.md`.

## Coding conventions

- ES5 only: `var`, `function`, IIFEs or prototypes. No `const`, `let`, arrows, template literals, `class`, `async/await`.
- No CDNs. No build tools. Relative paths only.
- Mobile-first CSS. 44px touch targets. `env(safe-area-inset-bottom)`.
- Save state with `localStorage` or the `storage/` drivers.
- Match the surrounding style. Keep files small. Prefer inline SVG over image files.
- WOS tools: all character bonuses are additive.
- Do not edit another game's files to fix your own.

## Hard rules (short form of [GROUND_RULES.md](GROUND_RULES.md))

1. Local-only assets, no CDNs.
2. Strict ES5 for new and touched code.
3. Zero build tools.
4. Relative paths only (never `/css/...`).
5. Never push to `main` or `dev`. PR into `dev`.
6. Do not upgrade shared library versions without asking.
7. Every game or tool needs all 7 docs in its folder (README, ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE, AGENT; templates in `admin/DOC_TEMPLATES/`). Update them in the same commit as the code. If you touch a game that lacks some, add them.
8. Log third-party code in `LICENSE_AUDIT.md`.
9. Name is "F.O.N.G.". Mobile-first.
10. Wayne owns `GROUND_RULES.md`. Do not edit it.

## Tooling

In the repo (merged from `chore/tooling`):
- `games-site` agent (`.claude/agents/games-site.md`): adding or changing games and tools.
- `game-tester` agent (`.claude/agents/game-tester.md`): play-tests pages through the Playwright MCP (`.mcp.json`).
- PR check Action (`.github/workflows/check.yml`, `scripts/check-site.mjs`): validates the catalog, links, ES5, relative paths, no CDNs and the 7 docs on every PR. How it works and how to fix a failure: docs/INDEX.md.
- Homepage theme engine (`js/theme/`, `css/skins/`): after catalog changes run `node scripts/gen-id-reference.mjs` to refresh `docs/CUSTOMIZE_IDS.md`. Guide: docs/CUSTOMIZE.md.

## Tool-specific notes

| Tool | Note |
|---|---|
| Claude (browser or CLI) | Reads this file. Subagents only for broad research, never to write one file |
| Gemini | Visual design, CSS, flavor text, SVG assets. See `GEMINI.md` |
| Jules | Runs from GitHub comments. Git ops, refactors, structure. See `AGENTS.md` |
| Codex and others | Follow this file. Same rules |

## Lessons for future LLMs

From the 2026-03-22 incidents (details in [docs/archive/incidents/](docs/archive/incidents)). Three sessions produced zero code and used most of a weekly budget.

- If the prompt already has the spec, write the file now. Do not read source "to be safe".
- Never start an agent to write one file. Agents are for searching many unknown files.
- "Writing now" is not writing. Make the Write call.
- Hit a blocker? Ask one sentence immediately. Do not plan silently for an hour.
- When Wayne says "stop", stop. No tool calls, one short sentence. Commit uncommitted work first.
- Pick one of two reasonable approaches in 30 seconds and say which.
- Push work in small checkpoints so a usage limit does not lose it.
- Do not read ceremony docs (acknowledgments, feedback logs). They are retired.

## More docs

[docs/INDEX.md](docs/INDEX.md) | [GROUND_RULES.md](GROUND_RULES.md) | [ARCHITECTURE.md](ARCHITECTURE.md) | [GAME_INVENTORY.md](GAME_INVENTORY.md) | [CHANGELOG.md](CHANGELOG.md) | [LL/README.md](LL/README.md) | [wosky/TOOLKIT.md](wosky/TOOLKIT.md) | [admin/GROUND_RULES_CHECKLIST.md](admin/GROUND_RULES_CHECKLIST.md)
