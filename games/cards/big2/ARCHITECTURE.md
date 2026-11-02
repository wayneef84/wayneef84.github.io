# Big 2 Architecture

Three files, no build step, classic scripts and window globals (ES5).

- `ruleset.js` defines `Big2Rulesets` (plain objects) and `Big2HandType`. Deal related fields: `startingHandSize` (4 players only), `firstTurnRule` (`'diamond3'` or `'lowest'`), optional `startingCard` `{ rank, suit }`, `firstPlayMustIncludeStartCard`, `suitOrder` (`'standard'` or `'reversed'`).
- `big2.js` holds, in order: `Big2Evaluator` (hand evaluation), `Big2AI`, `Big2Deal` (pure dealing and start rules), `Big2Options` (saved options), `Big2Game` (state machine: deal, turns, pass, win, penalties).
- `index.html` holds the UI (`UI` module): setup screen, options, deal panel, hand and pile rendering.

Flow: setup (ruleset, Players, Who starts) -> `new Big2Game(ruleset, players, { whoStarts, lastWinnerId })` -> `game.deal()` calls `Big2Deal.deal` and stores `game.dealInfo` and `game.mustIncludeCard` -> UI calls `showDeal(game.dealInfo)` -> turns run through callbacks (`onTurnStart`, `onPlayMade`, `onPassMade`, `onPileCleared`, `onGameOver`). On game over the UI stores the winner id in `fong.big2.opts`.

The deal logic is pure so it can be tested in Node without a browser (`tests/big2-deal.test.js` loads the files in a vm context).
