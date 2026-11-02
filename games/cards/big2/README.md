# Big 2 (大老二)

Shedding card game for 2, 3 or 4 players: you against 1 to 3 AI opponents. Four rulesets (Hong Kong, Taiwanese, Singapore, Poker Hands). Part of F.O.N.G. Arcade.

Play: open `index.html` (any static server). No build step, no network, ES5 only.

## Setup options

- Ruleset: Hong Kong Standard, Taiwanese, Singapore, Poker Hands.
- Players: 2, 3 or 4. AI players fill the other seats.
- Who starts: Lowest card (default) or Last winner.

Options are saved on the device in `localStorage` key `fong.big2.opts` and are in the game saves manifest (`js/gamesaves.js`, id `big2`).

## Files

| File | Purpose |
|---|---|
| `index.html` | UI, setup screen, deal panel |
| `big2.js` | Evaluator, AI, `Big2Deal` (dealing rules), `Big2Options` (saved options), `Big2Game` (turn flow) |
| `ruleset.js` | Ruleset definitions |

See MANUAL.md for the rules, TECHNICAL.md for the deal algorithm. Test: `node tests/big2-deal.test.js`.
