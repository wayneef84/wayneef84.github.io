# Byte Runner: Agent Notes

## Session 2026-10-25 (Claude)
**Done**
- Built v1.0.0: `index.html` (game + progress page, ES5) and `byte-runner.ps1` (generic monitor).
- Added the catalog entry in `js/catalog.js` (arcade, isNew), a row in `GAME_INVENTORY.md`, and the name in `games/README.md`.

**Verified**
- `index.html` script parses as ES5 (acorn, ecmaVersion 5).
- Headless Chromium: demo mode on http, 60k frame autopilot soak (0 falls, 0 hits, 98 stomps), both gates and the victory world, demo loop restart, `file://` fallback to demo then switch to live when `status.js` appears, 3 stage live data, 390 px phone width with touch buttons and no horizontal scroll.

**Not verified**
- `byte-runner.ps1` has not been executed yet (no PowerShell in the build container). First real run on Windows should check: list parameters, robocopy log parsing, `ConvertTo-Json` output shape with a single stage.

**Next**
- See `TODO.md`. Most useful next step: a `-Run` mode that starts the robocopy stages itself.
