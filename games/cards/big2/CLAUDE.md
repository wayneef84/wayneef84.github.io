# Big 2 - Notes for the next Claude

Read the repo root CLAUDE.md first. This folder is ES5, no CDNs, relative paths.

- Dealing and start rules live in `Big2Deal` (`big2.js`). Do not hardcode diamonds or clubs: use `suitOrder`, `startCard`, `fallbackCard`.
- Run `node tests/big2-deal.test.js` after any change to deal, ruleset or `Big2Game`.
- Options key is `fong.big2.opts`. Keep it one versioned JSON object and in the `js/gamesaves.js` manifest.
- Animations: CSS only here. Hide (opacity 0) before DOM insertion, respect reduced motion and `data-calm`. Do not depend on `card-anim.js` until it exists.
- Card ids: `uuid` is unique, `id` is not (THREE and TEN both start with T). Never render two elements with the same `data-uuid`.
- Update the docs in this folder in the same commit as code changes.
