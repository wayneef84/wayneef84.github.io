# Docs Audit 2026

Audit of all markdown in the repo before the docs reorg (branch `claude/docs-reorg`). 288 md files at start, 48 at the repo root.

Dispositions: **keep** (current rules or reference), **merge** (content folded into another doc, then archived), **archive** (historical), **pinned** (should be archived but `projects/md-reader/app.js` links it, and js/html are off limits for this job).

## 1. Root files

| File | Disposition | Destination / note |
|---|---|---|
| README.md | keep | Rewritten short |
| CLAUDE.md | keep | Rewritten as the single entry point. Old text saved to `docs/archive/agents/CLAUDE_pre-reorg.md` |
| AGENTS.md | keep | Thin pointer plus agent table (kept because `projects/encyclopedia/scripts/generate_content.py` parses the table) |
| AGENT.md | keep | Thin pointer. Old 2026-02-15 session log to `docs/archive/handoffs/` |
| GEMINI.md | keep | Thin pointer plus Gemini-specific rules |
| CHANGELOG.md | keep | Unchanged |
| ARCHITECTURE.md | keep | Unchanged (short, still accurate for the hub shell) |
| GAME_INVENTORY.md | keep | Unchanged |
| GROUND_RULES.md | keep | Trimmed from 743 to about 150 lines. Rules unchanged, examples and rollout text removed |
| LICENSE, LICENSE_AUDIT.md | keep | LICENSE_AUDIT is referenced by Rule 8 and read by the encyclopedia script |
| URL_PARAMETERS.md | keep | Reference for tracing games. Read by encyclopedia script |
| CLOUDFLARE_WORKER_SETUP.md | keep | Moved to `docs/reference/` |
| VISUAL_IDENTITY.md | keep | Moved to `docs/reference/` |
| DOCUMENTATION_STANDARD.md | keep (needs Wayne) | Moved to `docs/reference/`. Defines Rule 10 7-file suite, see contradiction 5 |
| JULES.md | merge | Jules rules folded into AGENTS.md. File stays as a thin pointer (pinned by md-reader) |
| ONBOARDING.md | merge | Folded into CLAUDE.md. File stays as a thin pointer (pinned). Old text in `docs/archive/agents/` |
| CLAUDE_AGENT.md | merge | Folded into CLAUDE.md and AGENTS.md. Moved to `docs/archive/agents/` |
| AI_FEEDBACK.md | pinned | Feedback log. No longer required each session. Banner added |
| CLAUDE_ASSESSMENT.md | pinned | Assessment of Wayne, Jan 2026. Banner added |
| ROADMAP.md | pinned | Feb 2026 roadmap, stale. Banner added |
| TODO.md | pinned | Feb 2026 hub TODO, stale. Banner added |
| INFO.md | pinned | Root metadata, duplicate of README. Banner added |
| PROJECTS.md | pinned | Superseded by `js/catalog.js`. Banner added |
| QUESTIONS.md | pinned | Early NEGEN questions. Banner added |
| WIKI-PLAN.md | pinned | Old plan. Banner added |
| INCIDENT-2026-03-22.md | archive | `docs/archive/incidents/` |
| CONTINUATION_NOTES.md | archive | `docs/archive/handoffs/` |
| HANDOFF_INDEX.md, HANDOFF_JULES.md, HANDOFF_NEXT_LLM.md | archive | `docs/archive/handoffs/` |
| FOR_GEMINI_WAR_FIXES.md, WAR_ISSUES.md | archive | `docs/archive/handoffs/` (one-off fixes) |
| notes_from_c_to_j_overhaul_phase1.md | archive | `docs/archive/handoffs/` |
| SESSION_SUMMARY.md, SESSION_SUMMARY_2.md | archive | `docs/archive/handoffs/` |
| RETROSPECTIVE_AND_FEEDBACK.md | archive | `docs/archive/assessments/` |
| DOCUMENTATION_AUDIT.md, IMPLEMENTATION_SUMMARY.md | archive | `docs/archive/assessments/` |
| COMPENDIUM.md | archive | `docs/archive/assessments/` (generated listing from 2026-02-14, stale) |
| HUB_PLATFORM_PLAN.md, REVAMP_MASTER_STRATEGY.md | archive | `docs/archive/plans/` |
| SPLIT_HANDS_IMPLEMENTATION_PLAN.md, WAR_BATTLE_HISTORY_PLAN.md | archive | `docs/archive/plans/` (features shipped) |
| IDEAS_020426.md, NEGEN_IDEAS_C.md | archive | `docs/archive/plans/` |
| project_notes_v0101.md | archive | `docs/archive/plans/` (Dad's Slots post-mortem) |
| neverhaveiever.md | archive | `docs/archive/misc/`. Wayne: a "Never Have I Ever" game he had the agents play. Harmless, kept in the archive |
| outputdoc.md | keep | Letter Tracing dev guide, moved to `games/tracing/DEV_GUIDE.md` |

## 2. Other doc folders

| Path | Disposition | Note |
|---|---|---|
| docs/INCIDENT-2026-03-22c.md | archive | `docs/archive/incidents/` |
| docs/REQUIRED_ROOT_FILES.md | archive | Superseded by CLAUDE.md. It said ONBOARDING, AI_FEEDBACK, PROJECTS, TODO, JULES must stay at root |
| docs/DESIGN_SPECS_PHASE_2.md | archive | `docs/archive/plans/` |
| dev/TEAM_COORDINATION.md | archive | `docs/archive/handoffs/` |
| docs/MASTER_MANUAL.md | pinned | Feb 2026 "single source of truth", stale. Banner added |
| docs/README.md, docs/SITEMAP.md, docs/L10N_STRATEGY.md | keep | SITEMAP may be stale, navigation is being rebuilt by another job |
| docs/negen/, docs/projects/ | keep | Per-project reference |
| admin/ (checklists, policies, templates) | keep | Linked from md-reader. GROUND_RULES_CHECKLIST still mentions the old 9 vs 10 laws and the 7-file suite |
| LL/ | keep | Lessons learned by topic. Linked from md-reader |
| legal/ | keep | Linked from about.html |
| negen/*.md | keep | Engine plans, owned by negen |
| games/*, projects/*, wosky/* | keep | Per-game docs, not rewritten |
| archive/ (root, old CLAUDE_OLD*.md, KICKOFF) | keep | Pre-existing, left alone |
| prompts/ | keep | Historical prompt log |

## 3. Contradictions and which rule was kept

| # | Conflict | Kept | Why |
|---|---|---|---|
| 1 | Branch flow. AGENTS.md says "all agents commit to dev". GROUND_RULES Rule 5 says feature branches, PR into dev, only Wayne merges to main. JULES.md says branch then merge to main. | Rule 5 plus Wayne's current practice: `claude/` branches, PR into `dev`, nothing direct to `main` | Rule 5 is the owner-approved text and matches recent PR history |
| 2 | Preview. Docs say `develop` deploys to `/beta/`. Workflows trigger on `develop`. Repo has `dev`. | Live branch is `dev` (per Wayne) | Workflows `deploy-preview.yml` and `verify-beta.yml` target a branch that does not exist. **Wayne (2026-10-27): not sure what they were for, leave as is for now. Open item. |
| 3 | "9 laws" (AGENTS, GROUND_RULES ack text) vs "10 laws" (ONBOARDING, Rule 10 in file) | 10 rules | Rule 10 exists in the file |
| 4 | ES5 is "non-negotiable" (Rule 2) but about 73 of 117 JS files under games/ and 24 of 56 under projects/ use const/let/arrow. wosky/ has none. New games (byte_runner) follow ES5. | Rule 2 for all new and touched code | Needs Wayne: whether legacy files get migrated |
| 5 | Rule 10 demands 7 doc files per game, blocking PRs. Of about 28 games and 20 projects, ARCHITECTURE.md exists in 10 folders, INFO.md in 10, TODO.md in 9, CHANGELOG.md in 7. Many game READMEs link to sibling files that do not exist. Task for this reorg says do not rewrite per-game docs. | Wayne decided (2026-10-27): the 7-file suite is the standard for new and touched games. Existing games are backfilled when touched |  Decided |
| 6 | Rule 1 "no CDNs" vs external URLs still present in projects/md-reader, projects/code, wosky/calc-v2 css, wosky/v3 css, games/tracing/chinese, games/slots css | Rule 1. Listed in `admin/COMPLIANCE_FIXES.md` | Not fixed here (code is off limits) |
| 7 | Rule 9: user-facing name is "F.O.N.G." never "Fong Family Arcade". CLAUDE_AGENT.md and encyclopedia use "Fong Family Arcade". | Rule 9 | Owner-approved |
| 8 | Ownership. AGENTS.md: Gemini owns html/css, Claude owns js/md, Jules owns root. GEMINI.md: Gemini owns css/. JULES.md: "do not edit another agent's identity file". Wayne now drives Claude, Gemini and Jules (Gemini-powered) from one workflow. | Role table kept in AGENTS.md as guidance only, not a hard file lock | Needs Wayne: confirm the roles still apply |
| 9 | AI_FEEDBACK.md "update every session" and the acknowledgment text (Rules 7, ONBOARDING, AGENTS) | Dropped. Log is frozen | Task says archive feedback logs. Two sessions of cost were lost to ceremony before work (see CLAUDE.md lessons) |
| 10 | docs/REQUIRED_ROOT_FILES.md says ten files must stay at root | Superseded by the root list in CLAUDE.md | Reorg is the goal |
| 11 | CLAUDE.md "Last session notes" claim 26 games; README says 28+ games, GAME_INVENTORY says 18 production. `js/catalog.js` has 36 entries. | `js/catalog.js` is the source of truth | It drives the hub |
| 12 | Commit prefixes `feat(CX):` use a "Y-Level" session code (C5 etc.) that is undefined now | Plain `feat:`/`fix:`/`docs:` | Needs Wayne if the CX codes should return |

## 4. Needs Wayne

1. Workflows trigger on `develop`, not `dev` (contradiction 2).
2. Legacy ES5 violations: migrate or leave (4).
3. Rule 10 7-file suite: keep or drop (5).
4. Agent role table still valid (8).
5. `neverhaveiever.md` purpose (archived to misc).
6. Pinned root files: move after `projects/md-reader/app.js` is updated (see CHECKPOINT or the PR description).
