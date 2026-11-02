# 13 Card Poker - Architecture

## Layers

`ffa.js` (pure, no DOM) holds rules, scoring, settlement, save and NPC search. `ffa-ui.js` is the page: seats, human rows, drag and tap, round flow. `faces.js` builds SVG faces. `card-anim.js` is the shared animation helper.

## Scoring (scoreRound)

1. Each row of each player gets a score (category then kickers). Front uses trips > pair > high card.
2. A player is fouled when middle < front, back < middle, or the shape is invalid.
3. Every pair (A, B) is scored once, from A's side:
   - both clean: each row +1, 0 or -1, plus a scoop of +3 (or -3) when one side wins all three. Max 6.
   - one fouled: the fouled player pays 6 to the clean one. The clean player's rows are not compared.
   - both fouled: 0.
4. Player points are the sum over all their pairs. They always add to 0. Coins = points x ante.
5. `owes` lists each non-zero pair as loser to winner. `rowTotals` (sum of row results against opponents) drive the per-row flashes and sweeps.
Royalties are not paid. `OPTIONS.royalties` is a hook only.

## Settlement (settle)

Input is each player's net coins. Output is a list of payments that conserves totals and reproduces the nets.
Tie rule: if every payer's debt can be split in whole coins in proportion to what each receiver is owed, every payer pays every receiver that share. Example: A owes B 2, A owes C 2, D owes A 2 gives nets A -2, B +2, C +2, D -2, and the result is A pays B 1, A pays C 1, D pays B 1, D pays C 1. Otherwise it uses the fewest transfers: equal debt and credit are matched first, then the largest payer pays the largest receiver. With up to 4 players this is the minimum.

## NPCs

`arrange(cards, personality)` enumerates every legal partition and keeps the best by personality: cautious maximizes the weakest row then the total, greedy maximizes back then middle then front, balanced maximizes a weighted total. A legal partition always exists (best back, then best middle of the rest), so NPCs never foul.

## Flow

idle, dealing, arrange, reveal (back, middle, front: flips, flash, sweep), settle (coins fly, balances saved), done. A round token drops stale timers when a new round starts.
