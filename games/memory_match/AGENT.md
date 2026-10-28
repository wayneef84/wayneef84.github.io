# Memory Match: Agent guide

Start with [CLAUDE.md](../../CLAUDE.md) at the repo root, then [CLAUDE.md](CLAUDE.md) here.

- Scope: edit only `games/memory_match/`. The catalog entry lives in `js/catalog.js` (id `memory-match`).
- Style: strict ES5, no libraries, no CDNs, relative paths, localStorage in try/catch.
- Audience: a young child. Keep it gentle. No timers by default, no losing, no streaks.
- To add a card set: add a list in `js/cards.js`, register it in `sets` and `order`. Needs at least 10 distinct faces (Big uses 10 pairs).
- To add a size: add it to `SIZES` and `SIZE_ORDER` in `js/app.js`.
- Update all docs in this folder in the same commit as code changes.
