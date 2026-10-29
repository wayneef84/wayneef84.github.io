# CHECKPOINT-nav2 (delete before merge)

Branch: claude/site-navigation (from dev). Clone: scratchpad/work-nav2. Tests: scratchpad/pw (probe.js, cards.js, pages.js, baseline.json).

## Done
- Stage 1: games/cards/shared/card-nav.js, wired into 8 card pages, hub lists all 9 entries.

## In progress / next
- Stage 2: js/home-link.js (FongHome) + projects pages
- Stage 3: games, tracing, misc pages (daily, about, wosky/v3)
- Stage 4: docs/NAVIGATION.md, changelogs (games/flow, projects/shipment-tracker), final report

## Resume
1. cd work-nav2; git status; python3 -m http.server 8741 &
2. node ../pw/probe.js 8741 after.json ; node ../pw/cards.js 8741
3. node scripts/check-site.mjs (never --update-baseline; no changes under scripts/)
4. Before final push: git fetch origin && git rebase origin/dev
