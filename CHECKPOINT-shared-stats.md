# CHECKPOINT shared-stats (delete before merge)

Branch: claude/shared-stats (from dev). PR: draft #279

## Done
- js/player-stats.js (FongStats), hub-data wiring, header fix, click hooks on all hubs
- Migration of playcount_* (and fong_streak_* removal)
- Daily streak removal
- Docs: docs/PLAYER_STATS.md, docs/INDEX.md, CHANGELOG.md
- Tested with Playwright (script in scratchpad pw/stats-test.js)

## Next
- Wayne review. Later PR: profile and game detail pop-up on top of FongStats

## Resume
1. git checkout claude/shared-stats, read git log
2. git fetch origin && git rebase origin/dev, then push
