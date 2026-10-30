# Handoff spec: Neon Snake landscape layout

For: Antigravity (agy) or any other agent. Status: queued, not started.
Owner decision: Wayne chose to queue this as a separate job (2026-10-29).

## Problem
`games/snake/index.html` sizes the square canvas in `resize()` (around line 436). In landscape on a phone (844x390) the board shrinks to about 140 px, because the header, controls bar and padding take most of the height. It is playable but cramped. PR #302 only stopped the crash (negative arc radius) and the sideways scroll.

## Goal
In landscape on phones, make the board as large as the height allows and move the controls beside it, so the board is at least 250 px on a 390 px tall screen. Portrait must not change.

## Suggested layout (landscape, height under 500 px)
- Two columns: board on the left, a slim column on the right with score, theme chips and pause or restart.
- Collapse the header to a single thin row or fold the Home link into the right column.
- Touch controls (if any) go in the right column, thumb reachable, 44 px minimum tap targets.
- Board size = min(available height, available width minus the side column), snapped down to a whole number of cells so nothing blurs.

## Rules
- Strict ES5 (`var`, `function`, no arrows, no `let`, `const` or template strings). Relative paths only. No CDN, no network.
- Keep the 7-file doc set exact-case. Add a CHANGELOG entry and bump the catalog version.
- Keep `FongScores` and `FongHome` calls if they exist on the page when you start.
- Do not run `--update-baseline` and do not edit `scripts/`.

## Acceptance tests (Playwright, touch on)
1. 844x390 and 667x375 landscape: no horizontal scroll, no console errors, board at least 250 px tall, game playable by swipe or buttons for 30 seconds.
2. 390x844 and 360x640 portrait: unchanged layout, no new overflow.
3. Rotate from portrait to landscape mid-game: no crash, board resizes, snake state kept.
4. `node scripts/check-site.mjs` shows 0 errors.

## Out of scope
New game modes, new themes and score changes.
