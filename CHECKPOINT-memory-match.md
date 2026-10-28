# CHECKPOINT: memory-match (delete before merge)

Branch: claude/memory-match. Work only in games/memory_match/, plus js/catalog.js (one entry, last commit) and GAME_INVENTORY.md (one row).

## Done
- Step 1: board, flip logic, settings panel, win screen, confetti (index.html, css/style.css, js/app.js), emoji set

## In progress
- Step 2: animal SVG set (js/cards.js)

## Next
- Step 3: sound (js/sound.js), mute persistence
- Step 4: 7 docs + ASSET_LOG.md
- Step 5: catalog entry + GAME_INVENTORY row (last commit)
- Tests (Playwright in scratchpad/pw), rebase on origin/dev, final push

## Resume
cd the clone, `git checkout claude/memory-match`, serve with python3 -m http.server <port>, open games/memory_match/index.html.
