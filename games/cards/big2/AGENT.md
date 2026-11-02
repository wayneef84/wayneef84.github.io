# Big 2 - Agent Guide

Quick facts for any agent. Full rules: CLAUDE.md at the repo root, then this folder's CLAUDE.md.

- Entry: `index.html`. Engine: `big2.js`. Rules data: `ruleset.js`.
- Players 2 to 4, Who starts Lowest card or Last winner, saved in `fong.big2.opts`.
- Start card = 3 of the ruleset's lowest suit (3 of spades in Singapore). Fallback = 3 of the second-lowest suit.
- Test: `node tests/big2-deal.test.js`, then `node scripts/check-site.mjs`.
- Do not push to `dev` or `main`. Branch `claude/<topic>`, PR into `dev`.
