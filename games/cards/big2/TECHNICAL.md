# Big 2 Technical Notes

## Suit order drives everything
`Big2Deal.suitOrder(ruleset)` returns the suits lowest first: D C H S (standard) or S H C D (reversed). `cardValue` is rank index * 10 + suit index in that list, so "lowest card" always follows the active ruleset.

- `startCard(ruleset)`: `ruleset.startingCard` if set. Else, `firstTurnRule === 'diamond3'` gives literally the 3 of diamonds. Else the 3 of the lowest suit. All rulesets use the lowest suit except where noted. Singapore uses `'lowest'` so its start card is the 3 of spades. Before this change it used `'diamond3'`, which was the highest 3 in that ruleset.
- `fallbackCard(ruleset)`: the start card's rank in the lowest suit that is not the start card's suit (the second-lowest suit for the usual start card: 3 of clubs, or 3 of hearts when reversed).

## Deal (`Big2Deal.deal(ruleset, playerCount, opts)`)
The deck and the Fisher-Yates shuffle are identical to the old code, so 4 player hands for a given random sequence are unchanged. Hand size is `ruleset.startingHandSize` for 4 players and 17 for 2 and 3 players.

Returns `{ hands, faceUp, extra, startCard, fallbackCard, pickupIdx, pickupCard, starterIdx, mustInclude, viaWinner, scenario }`. Scenarios: `four`, `three`, `three-faceup-start`, `two`, `two-faceup-start`, `two-start-in-pile`, `two-faceup-start-nobody`.

Rules: the face-up card goes to the holder of the start card. If the face-up card is the start card, to the holder of the fallback card, who must include it in the opening play. With 2 players, if the start card is not in a hand (spare pile), or the face-up start card has no fallback holder, nobody picks up, the face-up card stays with the discarded spare pile, and the holder of the lowest dealt card starts and must include it. `extra` excludes a picked-up card.

Who starts = `winner`: `starterIdx` becomes the last winner seat (if seated), `mustInclude` is null, pickup still goes to the start card holder.

## Game state
`Big2Game` stores `dealInfo`, `mustIncludeCard` (a real dealt card object with a uuid) and per-player `dealtCount`. `_getMustIncludeCard` returns it only before the first play and only for the player holding it. The old `_findFirstPlayer` and the hardcoded 3 of diamonds check were removed. The triple penalty compares the hand to `dealtCount` instead of 13.

## Options
`Big2Options.sanitize` accepts anything and returns `{ v: 1, players: 2|3|4, whoStarts: 'lowest'|'winner', lastWinner: 'player0'..'player3'|null }`, using hasOwnProperty and enum checks. Saved under `fong.big2.opts`, registered in `js/gamesaves.js` as `big2`. The page gets storage through `getStorage()` (inside a try, returns null when blocked), and `load` and `save` accept null and catch every error, so a blocked or full store never breaks the game.

## UI notes
Text uses `textContent`. Segmented buttons are 44px tall. Deal panel animation is plain CSS transforms (`dealIn`, `dealPick`), enabled only under `prefers-reduced-motion: no-preference` and when `html[data-calm]` is not set (`js/prefs.js`). The panel card uses the class `panel-in` (the hand deal uses `deal-in`). A last CSS block turns off every card animation and transition (hand deal, pile play and sweep, hint pulse, panel, opponent pulse) under `prefers-reduced-motion: reduce` and `html[data-calm]`, so final states show at once. The deal message sits in an `aria-live="polite"` region that is filled once after the panel is visible and cleared on hide. Focus moves to Got it when the panel opens and back to the hand if it was inside the panel when it closes. Spare pile count shown is face-down cards only (17 in every 2 player deal). The face-up card element drops its `data-uuid` so ids stay unique while the same card is in a hand. Unused opponent slots are hidden for 2 and 3 players.
