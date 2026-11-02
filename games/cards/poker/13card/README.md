# 13 Card Poker (Chinese Poker, free-for-all)

You against 1 to 3 NPCs. Everyone gets 13 cards and sets them into a front of 3, a middle of 5 and a back of 5. Back must beat middle and middle must beat front, or the hand is a foul. Every pair of players is compared row by row and the points turn into coins.

Open `index.html` (works from file:// and GitHub Pages, no network).

## Quick rules

- Rows: front 3 (trips > pair > high card, no straights or flushes), middle 5, back 5 (normal poker ranks).
- Each pair of players: each row won +1, lost -1, tied 0. Win all three rows and get +3 more (a scoop, 6 total).
- Foul: you pay 6 points to every clean opponent and collect nothing. Two fouls in one pair score 0.
- One point is worth the ante in coins (1, 2 or 5). Everyone starts with 100 coins. Balances carry over and can go below zero.
- After each round a panel shows who owes whom, each net result and the fewest-payments settlement.

## Controls

NPCs (1 to 3), Ante, Skip animations, Reset bankrolls (asks first). Drag a card onto another to swap, or tap two cards. Auto-arrange suggests a legal setup (the balanced style). NPCs: Dana cautious (closest hand types across rows), Rafi greedy (strongest back first), Mina balanced (weighted total). Lock reveals the hands. Tap an opponent to see their hand large.

## Files

`index.html`, `ffa.css`, `ffa.js` (pure rules, scoring, settlement, save, NPC search), `faces.js` (SVG faces), `ffa-ui.js` (page), shared `games/cards/shared/card-anim.js`. Save key `fong.13card.save`. Tests: `node tests/13card.test.js`, `node tests/card-anim.test.js`.

More: MANUAL.md (how to play), ARCHITECTURE.md (scoring and settlement), TECHNICAL.md, TODO.md, CHANGELOG.md.
