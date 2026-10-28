# CHECKPOINT: quest-mobile (delete before merge)

Branch: claude/quest-mobile. Game: games/byte_runner_quest/. New file js/controls.js (layout, pointer buttons, settings).

## Done
- (a) Touch response: pointer events, multi-touch, 64px+ buttons, pressed state, no scroll/zoom/select/menu, fixed full-viewport layout on touch devices.

- (b) Fullscreen (API + fill-screen fallback, Esc exits, landscape lock tried) and Rotate view (CSS rotate, touch maths mapped). Header buttons only for now; settings panel comes in (e).
- (c) Auto-run (cfg.auto and cfg.autoDir, TURN button, tap anywhere jumps, arrow keys turn). No UI toggle until the panel in (e); set it in localStorage key fong.byteRunnerQuest.settings.v1.
- (d) Lives (cfg.lives 1/3/5/0=unlimited, HUD hearts, per-stage and total deaths in save, continues stat), Out of lives overlay with Continue stage and Level select, vibrate on death (cfg.vibrate). Still no UI toggles for these until (e).
- (e) Settings panel (gear) with all options, docs updated for v1.1.0.
- (f) byte_runner Fullscreen and Rotate buttons (separate last commit).
- Final tests run: node --check, ES6 grep, solver 48/48, check-site 0 errors.

## In progress
- Rebase on origin/dev and final push

## Next

## Resume
1. cd into the clone, git checkout claude/quest-mobile
2. Serve: python3 -m http.server <port> from the repo root
3. Test scripts live in the scratchpad pw/ folder (q_*.js)
4. Before final push: git fetch origin && git rebase origin/dev; run node scripts/check-site.mjs
