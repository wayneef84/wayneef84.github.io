# Byte Runner: Developer Notes

## Purpose
An original self playing platformer that also visualizes a long file copy. The site build runs a demo; the Windows monitor (`byte-runner.ps1`) turns it into a live progress screen.

## Architecture summary
Single `index.html` (inline CSS and ES5 JS) plus `byte-runner.ps1`. The monitor writes `status.js` (`window.hudData = {...}`) beside a copy of the page in `%TEMP%\byte_runner\<title>\` and opens it over `file://`. See `ARCHITECTURE.md` for the schema and engine.

## Critical rules and gotchas
- **ES5 only** (repo Rule 2): no `let`, `const`, arrows, template literals, `for...of`, `Map`, `Math.imul`, `Array.prototype.includes`, `URLSearchParams`. Check with acorn: `acorn.parse(src, { ecmaVersion: 5 })`.
- **Polling on file://:** keep the `<script src="status.js?t=...">` injection. `fetch` and XHR fail on `file://`, and dropping the `?t=` cache buster freezes the page on old data. A hidden iframe that loads once also freezes it.
- **The monitor finds the local page by the text `Byte Runner v`** in the script comment at the top of the page script. Keep that marker when editing.
- **byte-runner.ps1 must stay plain ASCII.** Windows PowerShell 5.1 reads BOM less files as ANSI, so a stray curly quote or dash breaks parsing.
- **List parameters are split on commas inside the script** because `powershell.exe -File` passes `a,b` as one string.
- **Keep it original.** No characters, sprites, sounds, HUD layouts or names from existing commercial games.
- **Status schema changes:** bump `v`, keep `normalize()` able to read older shapes, update `ARCHITECTURE.md`.
- **Autopilot tuning:** jump arcs, run speed range (1.4 to 1.9) and gap widths (max 3 tiles) are tuned together. Changing one can make gaps unclearable; rerun the soak test (60k `__br.step()` calls, expect `falls: 0`).

## Test hooks
`window.__br` exposes `step`, `render`, `stats`, `hero`, `world()`, `data()`, `source()`, `applyData`, `simData`, `setSimT(seconds)`.
