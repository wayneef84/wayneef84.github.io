# CHECKPOINT-nav2 (delete before merge)

Branch: claude/site-navigation (from dev). Clone: scratchpad/work-nav2. Tests: scratchpad/pw (probe.js, cards.js, pages.js, baseline.json).

## Done
- Stage 1: games/cards/shared/card-nav.js, wired into 8 card pages, hub lists all 9 entries.

- Stage 2: js/home-link.js (FongHome) + projects pages (pill or header link). Verified 390/1280.
- Stage 3: games, tracing, daily, about, wosky/v3, poker menu strip. Verified.

- Stage 4: docs/NAVIGATION.md section 5, changelogs (cards, blackjack, flow, shipment-tracker, root).

## Next
- Only the final report remains. Delete this file before merge.

## Resume
1. cd work-nav2; git status; python3 -m http.server 8741 &
2. node ../pw/probe.js 8741 after.json ; node ../pw/cards.js 8741
3. node scripts/check-site.mjs (never --update-baseline; no changes under scripts/)
4. Before final push: git fetch origin && git rebase origin/dev
