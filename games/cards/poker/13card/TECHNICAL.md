# 13 Card Poker - Technical

- Classic scripts only, ES5, no modules, no network. Load order in `index.html`: `js/prefs.js`, `card-assets.js`, `card-anim.js`, `ffa.js`, `faces.js`, `ffa-ui.js`.
- The old negen-based `ThirteenCard.js` was removed. It was an ES module (blocked on file://) and ran 1 vs 1 only.
- `ffa.js` has its own ES5 hand evaluator (port of `poker/shared/evaluator.js` ranking: category, then kickers, wheel straight is 5 high). Score = category * 1e10 + kickers in base 100.
- Save: `localStorage['fong.13card.save']` JSON `{v:1, ante, npcs, skip, rounds, bank:{you,n1,n2,n3}}`. Reads use hasOwnProperty, values are typed and capped (+-1e9, ante in 1/2/5, npcs 1..3), bad JSON gives defaults. Registered in `js/gamesaves.js` as id `13card`.
- NPC search: all 1287 backs x 56 middles with precomputed disjoint tables, about 2 ms per deal in node (limit 100 ms).
- Animations: `CardAnim` (see `games/cards/shared/INFO.md`). Hidden-first: containers are `visibility:hidden` before the deal and shown in `onArrive`. A page hide mid-animation cancels and jumps to the next stage with final states.
- Tests: `tests/13card.test.js`, `tests/card-anim.test.js`.
