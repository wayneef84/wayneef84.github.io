# S4K Mixer v2: Changelog

## v2.2.0 (2026-10-28)
### Added
- Bubblegum Pop pack (12th tab, after Candy): 8 original friends in pink with lilac, mint and butter-yellow accents. A pop trio with glow lightsticks (Starlie, Dazzi, Honeyoo), a unicorn (Lilacorn), a bubblegum-machine robot (Gumzy), a heart drummer (Lubby), a glitter cat (Glittens) and a bubble sweep (Swooshie). 104 BPM, C major pentatonic. Floating hearts.
- Art generator: `heart` body and `lightstick`, `horn`, `gumball`, `sparkle` accessories (no change to existing looks).
- ASSET_LOG.md with name checks and how each asset was made.

### Changed
- All tab pack label shrinks a little when the pack name is long (so "Bubblegum Pop" fits).
- Help dialog: Shift+arrows reach all 12 pack tabs.

## v2.1.0 (2026-10-27)
### Added
- All tab (first tab): every friend from every pack in the tray, each in a box labelled with its pack name and edged in the pack color. Neutral look. Tap, drag, undo, save and load work as elsewhere, and Mr. Black still works from it.
- Mixed stages: the stage tempo comes from the first friend placed, synthesized friends re-render at that tempo, fixed Classic loops are stretched by a few percent to stay in time (rule in INFO.md).
- Shortcuts: Shift+1 to 9 and Shift+0 (also numpad) jump to pack tab 1 to 10, Shift+Left and Shift+Right step through tabs and wrap. Badges on the tabs (mouse devices) and help dialog rows.
- Four new packs of 8 original friends each: Aqua (ocean), Toxic (silly slime), Robo (friendly robots), Candy (sweets). Pack research is in INFO.md.
- Docs: ARCHITECTURE, TODO (including a "singing monster game" idea), CLAUDE, AGENT.

### Changed
- Pack tabs scroll sideways when they do not fit. The list tabs under the stage do too.
- Packs carry a `color` field (tab edge and All tab label).

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

## Unreleased
- Display name changed from "Sprunki v2" to "S4K Mixer v2" (the original game's name). Folder, URL, code names and save keys (`sprunkiV2.*`) are unchanged.
