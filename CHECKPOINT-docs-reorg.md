# CHECKPOINT docs-reorg (delete before merge)

Branch: claude/docs-reorg (base dev). Draft PR into dev.

## Done
- (a) docs/DOCS_AUDIT_2026.md
- (b) CLAUDE.md (105 lines), AGENTS.md, AGENT.md, GEMINI.md, JULES.md, ONBOARDING.md as pointers, README.md, GROUND_RULES.md trimmed (743 to 68 lines), docs/INDEX.md
- (c) 31 git mv moves to docs/archive/{incidents,handoffs,assessments,plans,agents,misc} and docs/reference. Links fixed. Banners on pinned files.

## Next
- (d) git fetch origin && git rebase origin/dev, rerun link check, update PR body, final push
- Pinned files (AI_FEEDBACK, ROADMAP, TODO, INFO, PROJECTS, QUESTIONS, WIKI-PLAN, CLAUDE_ASSESSMENT, docs/MASTER_MANUAL) stay at root until projects/md-reader/app.js (js, off limits here) is updated, then git mv them to docs/archive/.

## Resume
Read docs/DOCS_AUDIT_2026.md. Link check: python3 linkcheck.py style script (every relative md link resolves). Baseline had 140 broken links (templates, per-game READMEs), none new.
