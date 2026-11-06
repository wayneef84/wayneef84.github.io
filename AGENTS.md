# AGENTS.md

Read **[CLAUDE.md](CLAUDE.md)** first. It has the rules for every LLM (Claude, AGY, Gemini, Jules, Codex, others). This file only keeps what is specific to one tool.

## Agents

| Agent | ID | Role | Key strengths | Usual scope |
| :--- | :--- | :--- | :--- | :--- |
| **Claude** | `C` | Senior Developer / Docs | Reasoning, planning, QA | JS logic, docs |
| **Gemini** | `G` | Creative Director | Content, assets, rapid prototyping | HTML, CSS, visuals |
| **AGY** | `A` | Builder (Google Antigravity) | Volume work, UI polish, content | New games, polish, recipes |
| **Jules** | `J` | Lead Architect | Git ops, refactoring, integration | Structure, root files |

Scope is guidance, not a lock. Wayne drives all of them (Jules and Gemini from GitHub comments, Claude and AGY locally). Whoever is assigned the task edits whatever files it needs.

## Per-tool rules

- **Claude:** owns doc upkeep. For shipment-tracker changes update `projects/shipment-tracker/ARCHITECTURE.md` and `TODO.md`. If a style disagreement comes up, CLAUDE.md wins.
- **Gemini:** reuse CSS variables (`css/`, `games/shared/css/` if present). Prefer inline SVG over image files. If a script passes about 300 lines, split it or ask for a refactor. Visual design and game concepts are Gemini's call. Put new ideas in the PR description.
- **Jules:** before new work, make sure the branch is stable (`git status`, merge `dev` in). Use `ls -R` and `grep` to check the real state, do not trust docs. Directory structure and git workflow are Jules's call. Branch and PR into `dev` only, never `main`.
- **AGY:** branch prefix `agy/`. Ship your own PRs into `dev` with the workflow in CLAUDE.md (merge once the check passes; shared code needs Claude's review first). Escalate to Claude when you fail twice on a bug or need to change shared code (`games/cards/shared/`, `js/gamesaves.js` structure, `negen/`, `shared/`, `storage/`). Send one brief: goal, diff, failing log.
- **All:** Wayne has final say.

## Claude and AGY on the same Mac

Both work in the local checkout `~/Documents/Dev/wayneef84.github.io-agy`, so they can step on each other. Rules:

1. Do feature work in a git worktree under `~/Documents/Dev/wt/<topic>`, not in the main checkout. Create it with `git worktree add -b <branch> ~/Documents/Dev/wt/<topic> origin/dev`.
2. A branch can be checked out in one place only. Run `git worktree list` before you start. If the branch you need is checked out in a worktree, work in that folder.
3. Never switch the branch of a worktree you did not create, and never delete another agent's untracked files. Ask Wayne.
4. Handoffs between the two go in `~/Documents/Dev/agy-handoff/` (outside the repo): a self-contained note with repo path, branch, worktree path, what is half-finished and what to verify.
5. Shared registries cause most conflicts (`js/catalog.js`, `js/gamesaves.js` manifest, root `CHANGELOG.md`, `docs/GAMESAVES.md`). One entry per line. Rebase on `dev` before you push.
6. Before any push: `node scripts/check-site.mjs` and every `tests/*.test.js` with node.

## Legal and data policy

Check [LICENSE_AUDIT.md](LICENSE_AUDIT.md) before importing code. Policies live in [legal/](legal/). If a project is missing from this table, add it.

| Project | Data Policy | Legal / Liability | Status |
| :--- | :--- | :--- | :--- |
| **Fong Arcade** | Personal / Non-Commercial | Standard MIT / GPL | Updated |
| **Regex Builder** | Local Storage Only | Standard MIT | Active |

## Technical gotchas

1. Verify new code is ES5. Past rewrites (Sprunki) found `class`, `async/await`, `Set` and arrow functions in "ES5" code.
2. Blackjack: check the win condition after every card dealt. Dealer does not play after a player bust.
3. Animations: set `visibility: hidden` or `opacity: 0` before DOM insertion, not after.
4. Test on a real iOS Safari device when you can. Simulators miss cases.
5. Cards need unique IDs for animation tracking. Never reuse card objects.
6. Changelogs: details go in the game's own `CHANGELOG.md`. The root `CHANGELOG.md` gets one short line per release-worthy change (one line per entry keeps merge conflicts small).

More: [LL/README.md](LL/README.md). Old versions of this file: [docs/archive/agents/](docs/archive/agents/).
