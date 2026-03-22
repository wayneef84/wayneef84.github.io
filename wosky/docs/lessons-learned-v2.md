# Lessons Learned — Calc v2 Build

**Date:** 2026-03-22
**Session:** calc-v2-vanilla-js-v9SGg
**Context:** WOSKY_3169 personal upgrade planner for Whiteout Survival

---

## What Went Right

### 1. Config-first approach worked
Putting all tunable game data (tiers, max levels, costs, piece assignments) into a single `config.js` file meant the engine and UI stayed separate. When game data changes after a patch, only one file needs editing.

### 2. Single localStorage key kept things simple
One `wosky_v2_player` key shared across all calcs avoided synchronization issues. Every page reads and writes to the same place — no message passing, no shared state complexity.

### 3. Strict ES5 constraint prevented over-engineering
Forcing ES5 (no fetch, no const/let, no arrow functions) kept the code simple and readable. No build step, no transpiler, loads instantly.

### 4. Placeholder cards in the hub were the right call
Showing "Coming Soon" cards gave the hub visual completeness without overpromising. Users understand the scope immediately.

---

## What Was Hard

### 1. Variable name mismatch between wosky.css and inline calc styles
The first calc drafts used variables like `--w-bg2`, `--w-accent`, `--w-border` that didn't exist in `wosky.css` (which uses `--w-surface2`, `--w-red`, `--w-border`). Fixed in v2.1 by aligning all calc pages to the design system.

### 2. ES5 string-building for complex tables is verbose
Building tables via `html += '<tr>...'` gets unwieldy for nested structures. The trade-off (no template engine) is accepted — keep each calc simple enough that the verbosity is manageable.

### 3. Global sync requires re-render discipline
When a global "Set All" fires, calling `render()` + `calc()` ensures DOM and state stay in sync. Temptation was to patch individual inputs directly, but that caused state drift when multiple controls affected the same pieces.

---

## Rules Confirmed from INCIDENT-2026-03-22

1. **Write first, read never** — only read files that the output literally depends on
2. **No agents for write tasks** — all 7 calc-v2 files written directly with Write tool
3. **Config file eliminates future read needs** — game data lives in config.js, not scattered across engine files
4. **Docs belong in /docs** — not in CLAUDE.md (which should stay concise)

---

## Recommendations for v3 / Future Sessions

1. **Don't split config per-calc** — one `config.js` was the right call. Splitting per calc adds maintenance burden for no benefit.
2. **Add a "needs" vs "have" comparison to Plan page** — currently Plan shows materials but doesn't compute shortfalls against calc targets. This is the highest-value next feature.
3. **Consider a `w-badge-live` CSS class** — the Live/Soon badge styling is duplicated between `wosky-tool-grid` and the calc-v2 hub cards. Extract to wosky.css.
4. **SvS pts per day budget** — the SvS day guide content in config is useful but static. A future version should let users input their pts target and back-calculate how many upgrades they need.
5. **Engine data confidence** — charm cost data in `charms-data.js` is player-verified. Gear costs for higher tiers (Pink T2+) are estimated. Mark unverified rows in the Reference page.

---

## Timeline

| Phase | Work |
|-------|------|
| v1 (prev sessions) | Individual charms, gear, hero-gear calcs (separate apps) |
| v2.0 (2026-03-22) | Unified hub, shared state, config-driven, all 5 pages |
| v2.1 | Global controls sync, CSS alignment, spacing fixes |
| v3 | Jules' rebuild (see `wosky/v3/`) |
