# Jigsaw - Design

## Who it is for
K (young) and a parent next to her. Big targets, forgiving snapping, no way to lose or fail.

## Principles
- No pressure: no timers, scores, streaks, leaderboards or shaming. Time played is optional and hidden by default.
- Forgiving: snapping is generous (25% of a piece, 45% in Little hands), pieces can never be lost off screen, Hint costs nothing.
- Quiet feedback: a soft generated click, a short glow, optional gentle vibration, confetti only when the puzzle is done (not with reduced motion).
- Private: photos stay on the device.
- Phone first: 44px targets, works at 360x640, 390x844 and landscape.

## Look
Soft purple table, bright yellow primary buttons, rounded shapes. Colours come from site variables (`--bg`, `--surface`, `--text`, `--dim`, `--accent`, `--accent2`, `--border`) with fallbacks, so a homepage theme can reach it.

## Flow
Picker (pick a picture) -> cut options -> game. Back returns to the picker and keeps the puzzle. A reload resumes straight into the puzzle.
