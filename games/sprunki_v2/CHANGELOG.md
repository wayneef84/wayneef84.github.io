# Sprunki v2: Changelog

## v2.0.0 (2026-10-27)
First release. A standalone rebuild of Sprunki Mixer (`games/sprunki`, unchanged).

### Added
- Six packs: Classic (the 20 original characters), Spring, Summer, Autumn, Winter, Halloween. Seasons have 8 original characters each, drawn and played by generated art and Web Audio style synthesis (no files). A season is one config file.
- Spooky mode started by Mr. Black (all spots full, then a yes/no check). One big exit button, Esc, or Reset leaves it. Volume is capped and there are no loud or sudden sounds, no blood or gore.
- Loops start on a shared bar line so everything stays in time.
- Big touch targets, tabbed character tray, tap to add and remove, optional drag and drop, undo (40 steps), reset, save and load (8 mixes, localStorage), volume, pause, mute, 3 to 12 spots, keyboard keys, help dialog.

### Changed
- Config is plain JS packs instead of `config.json` plus XHR, so it works from a local file.
- Classic audio is 20 small AAC loops (about 0.7 MB) embedded as base64 instead of 15 MB of WAV.
- Only 20 SVGs and 20 loops are copied. The 600 unassigned files and the phase 2 to 4 packs were left out (the phase 4 monsters and the rebuilt Italian-brainrot characters are replaced by the new Halloween pack).

### Dropped
- The character editor and QR share/scan. They need the camera and extra libraries and add clutter for a child. Save and load replace sharing.
- The old trigger (Black Hat dropped on Wenda).

### Not changed
- Original Black (v05) is kept as the ordinary Classic character "Dusk"; Mr. Black is a new shared character.
