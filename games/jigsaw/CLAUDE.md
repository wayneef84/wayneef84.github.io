# Jigsaw - Developer Notes

Read ARCHITECTURE.md first. Rules that must not regress:

1. Pure modules (geometry, groups, model) never touch the DOM and must run under node. Run `node games/jigsaw/tests/run.js` after any change to them.
2. Strict ES5: no const, let, arrows, template literals, classes, async/await.
3. Shared edges are built once and walked both ways. Never generate each piece's edges on its own, or neighbours stop matching.
4. Edge randomness comes only from `makeRng(hash4(seed, kind, r, c))`. Never `Math.random()` in geometry (v1 did, which broke resume).
5. Snapping is group offset comparison. Lock is derived (`anchored && settings.lock`), do not store it.
6. Photos never leave the device: no fetch, XHR, beacon, CDN or upload. Do not commit photos.
7. Every storage call is wrapped in try/catch and failure is never fatal.
8. Listeners on the canvas are added once (v1 added them on every start). `touch-action: none` only on `#board`.
9. FongCheer calls are guarded and sparse (`good` at most every 8 s, `big` at 10/25/50/100, `done` once).
10. No pressure mechanics. Do not add timers, scores, streaks or leaderboards.
11. Refer to the child as "K" only.

Gotchas: `scatter(st, rng, true)` is needed at game start (everything starts anchored and locked). Playwright tests need the toast to stay `pointer-events: none`. Headless draw times only measure command recording.
