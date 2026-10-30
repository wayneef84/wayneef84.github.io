# Slots - Roadmap & Issues

## Roadmap (Prioritized)

### Priority 1 - Critical
- [ ] Real-device pass on iOS Safari and Android Chrome (3D drums, audio unlock, safe areas).

### Priority 2 - High
- [ ] Decide on `audio/` (unused v3 files, unknown origin). Delete or replace with files whose source is known.
- [ ] Screen reader pass (live region exists, drums are decorative).
- [ ] Optional: a "Lucky Ladder" mode. Skipped on purpose, the push-your-luck shape is close to loss-chasing.

### Priority 3 - Medium
- [x] Inline SVG symbols for a few themes (Bubblegum Band, v4.1.0). More are welcome.
- [ ] Real-voice and real-device check of Cheers on iOS Safari and Android Chrome (only tested with a mocked `speechSynthesis`).
- [ ] Long-press on a mode chip to show its prize table.

### Priority 4 - Low
- [ ] Optional sound pack (original, with a logged source).

## Known Issues & Bugs
- Pick-a-Prize: reloading mid-round loses that round's bet. Rare and cheap, left as is.
- Cascade return measures about 0.7 points above target in 1M rounds. Inside the 3 point limit.
- Emoji glyphs depend on the device font.

## Technical Debt
- `tests/sim.js` is the only automated test. The browser checks were run by hand with Playwright and are not in the repo.

## Accessibility Improvements
- Drum faces use real text, so a screen reader can read them, but the order is not meaningful. Round results are announced through the live region.

## Future Ideas
- More themes (add one object in `js/themes.js`).
- Theme "of the day" is deliberately NOT planned (no daily mechanics).
