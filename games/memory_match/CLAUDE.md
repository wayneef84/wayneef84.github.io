# Memory Match: Developer Notes

For the next Claude or other developer.

## Purpose
A calm pairs game for a young child. Never add pressure: no countdown, no streaks, no losing, no scores that shame. The timer exists only as an opt-in toggle and is off by default.

## Gotchas (do not regress)
- **Never block a tap.** `flip()` calls `resolvePending()` first so tapping during the 0.9 s wait flips the mismatched pair back and flips the new card. Location: js/app.js.
- **No scrolling.** Card size comes from `doLayout()`, not CSS. Check 360x640 portrait and a landscape phone. Cards must stay at least 64 px.
- **Flip uses `pointerdown`.** The `click` handler only handles assistive tech (detail 0 and no recent pointer), otherwise one tap would flip twice.
- **Settings and win panels sit below the header** (`top` is set in `doLayout()`), so Home stays reachable on every screen.
- **ES5 only.** No const, let, arrows, classes or template literals. Faces are set with `innerHTML` from our own strings only.
- **Art is original.** Do not paste art from the web. Log every new asset in ASSET_LOG.md.
- **Audio** starts only after the first pointer or key event (`MMSound.unlock()`).

## Testing
Serve the folder, then check: each size and set at 390x844 and 360x640, flip, match, mismatch flip-back, tap during wait, win, Play again, mute persists, keyboard play, no console errors, and file:// too. `window.MemoryMatch.getState()` returns the deck (including pair ids) for scripted tests.

## Last session
2026-10-27, Claude: built v1.0.0, tested in Playwright (Chromium, emulated phones).
