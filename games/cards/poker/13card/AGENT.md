# 13 Card Poker - Agent Notes

Current build: free-for-all Chinese Poker (v2.0.0). See README.md for rules, ARCHITECTURE.md for scoring and settlement, TECHNICAL.md for files.

Do:
- Keep rules and money in `ffa.js` (pure) and cover changes in `tests/13card.test.js`.
- Use `CardAnim` for movement, and honor `CardAnim.reduced()`.
- Run `node tests/13card.test.js`, `node tests/card-anim.test.js`, `node scripts/check-site.mjs` before committing.

Do not:
- Add modules, CDNs or absolute paths.
- Change the save key shape without bumping `v` in `ffa.js`.
- Use innerHTML for any saved or generated text.
