# CHECKPOINT: quest-mobile (delete before merge)

Branch: claude/quest-mobile. Game: games/byte_runner_quest/. New file js/controls.js (layout, pointer buttons, settings).

## Done
- (a) Touch response: pointer events, multi-touch, 64px+ buttons, pressed state, no scroll/zoom/select/menu, fixed full-viewport layout on touch devices.

- (b) Fullscreen (API + fill-screen fallback, Esc exits, landscape lock tried) and Rotate view (CSS rotate, touch maths mapped). Header buttons only for now; settings panel comes in (e).
- (c) Auto-run (cfg.auto and cfg.autoDir, TURN button, tap anywhere jumps, arrow keys turn). No UI toggle until the panel in (e); set it in localStorage key fong.byteRunnerQuest.settings.v1.

## In progress
- (d) Lives, Out of lives overlay, Continue stage, vibration

## Next
- (e) Settings panel + docs (CHANGELOG v1.1.0, README, INFO, TODO, ARCHITECTURE, CLAUDE, AGENT)
- (f) Optional: Fullscreen + Rotate on games/byte_runner/index.html (separate last commit)

## Resume
1. cd into the clone, git checkout claude/quest-mobile
2. Serve: python3 -m http.server <port> from the repo root
3. Test scripts live in the scratchpad pw/ folder (q_*.js)
4. Before final push: git fetch origin && git rebase origin/dev; run node scripts/check-site.mjs
