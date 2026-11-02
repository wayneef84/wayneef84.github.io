# 13 Card Poker - Notes for LLMs

Start at the repo root `CLAUDE.md`. Strict ES5, classic scripts, no CDNs, relative paths.
- Rules and money live in `ffa.js`. Change them there, add a test in `tests/13card.test.js`.
- Do not paint with innerHTML. Text goes in with textContent.
- Animations go through `CardAnim` only, and must call done at once when `CardAnim.reduced()`.
- Set hidden state before DOM insertion. Keep card ids unique.
- Wayne decisions: front has no straights or flushes, no royalties, ante 1/2/5 (not 10), bankroll 100, balances may go negative, settlement splits proportionally when whole.
