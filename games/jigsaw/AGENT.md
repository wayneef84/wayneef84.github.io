# Jigsaw - Agent Session Log

## 2026-10-29 Claude - v2.0.0 rebuild
Rebuilt the game from scratch on branch `claude/jigsaw-maker` (see CHANGELOG.md). Pure modules first with unit tests, then the DOM layer, then a Playwright run (Chromium) covering solve, touch, pinch, resume, blocked storage, EXIF, layouts, performance and file://.

Not done: commit, push and PR (not asked directly by Wayne at the time). Not tested: real phones, real camera photos, FongCheer (module not present).

Next agent: run `node games/jigsaw/tests/run.js`, read CLAUDE.md, then see TODO.md.
