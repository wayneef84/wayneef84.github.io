# Big 2 Info

- Name: Big 2 (大老二)
- Category: card game, hub `cards`
- Players: you plus 1 to 3 AI (setup option, 2 to 4 seats)
- Rulesets: Hong Kong Standard, Taiwanese, Singapore, Poker Hands
- Dealing: 4 players 13 each. 3 players 17 each plus 1 turned-up card for the start card holder. 2 players 17 each, 18 spare, 1 turned up.
- Who starts: Lowest card (default) or Last winner
- Storage: `fong.big2.opts` (versioned JSON: v, players, whoStarts, lastWinner). In the `js/gamesaves.js` manifest as `big2`.
- Shared files used: `../shared/enums.js`, `../shared/card-nav.js`, `../../../js/prefs.js` (calm mode)
- Docs: README, MANUAL, ARCHITECTURE, TECHNICAL, TODO, CHANGELOG, CLAUDE, AGENT
- Test: `node tests/big2-deal.test.js`
