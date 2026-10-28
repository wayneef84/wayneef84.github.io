# AGENTS.md

Read **[CLAUDE.md](CLAUDE.md)** first. It has the rules for every LLM (Claude, Gemini, Jules, Codex, others). This file only keeps what is specific to one tool.

## Agents

| Agent | ID | Role | Key strengths | Usual scope |
| :--- | :--- | :--- | :--- | :--- |
| **Claude** | `C` | Senior Developer / Docs | Reasoning, planning, QA | JS logic, docs |
| **Gemini** | `G` | Creative Director | Content, assets, rapid prototyping | HTML, CSS, visuals |
| **Jules** | `J` | Lead Architect | Git ops, refactoring, integration | Structure, root files |

Scope is guidance, not a lock. Wayne drives all three (Jules and Gemini from GitHub comments, Claude from browser or CLI). Whoever is assigned the task edits whatever files it needs.

## Per-tool rules

- **Claude:** owns doc upkeep. For shipment-tracker changes update `projects/shipment-tracker/ARCHITECTURE.md` and `TODO.md`. If a style disagreement comes up, CLAUDE.md wins.
- **Gemini:** reuse CSS variables (`css/`, `games/shared/css/` if present). Prefer inline SVG over image files. If a script passes about 300 lines, split it or ask for a refactor. Visual design and game concepts are Gemini's call. Put new ideas in the PR description.
- **Jules:** before new work, make sure the branch is stable (`git status`, merge `dev` in). Use `ls -R` and `grep` to check the real state, do not trust docs. Directory structure and git workflow are Jules's call. Branch and PR into `dev` only, never `main`.
- **All:** Wayne has final say.

## Legal and data policy

Check [LICENSE_AUDIT.md](LICENSE_AUDIT.md) before importing code. Policies live in [legal/](legal/). If a project is missing from this table, add it.

| Project | Data Policy | Legal / Liability | Status |
| :--- | :--- | :--- | :--- |
| **Fong Arcade** | Personal / Non-Commercial | Standard MIT / GPL | Updated |
| **16 TB Archive** | High Privacy / Cold Storage | Internal Only | Pending |
| **SkyLantern Logistics** | Enterprise / NDA | Amazon Corporate | Active |
| **Regex Builder** | Local Storage Only | Standard MIT | Active |

## Technical gotchas

1. Verify new code is ES5. Past rewrites (Sprunki) found `class`, `async/await`, `Set` and arrow functions in "ES5" code.
2. Blackjack: check the win condition after every card dealt. Dealer does not play after a player bust.
3. Animations: set `visibility: hidden` or `opacity: 0` before DOM insertion, not after.
4. Test on a real iOS Safari device when you can. Simulators miss cases.
5. Cards need unique IDs for animation tracking. Never reuse card objects.
6. Per-project changelogs beat the root `CHANGELOG.md` (it causes merge conflicts).

More: [LL/README.md](LL/README.md). Old versions of this file: [docs/archive/agents/](docs/archive/agents/).
