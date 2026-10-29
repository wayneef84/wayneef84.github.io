# S4K Mixer v2: Architecture
Static page, strict ES5, no libraries. Script order in `index.html`: `js/synth.js` (renders loops to Float32Array), `js/art.js` (SVG characters from a spec), `js/audio-classic.js` (embedded Classic loops), `js/packs/*.js` (data only, push to `window.SprunkiV2Packs`), `js/app.js` (everything else).
- `app.js` state `S`: pack, tab, slots, slotCount, bpm, horror, volume. The All tab is a virtual pack built from the others. Characters are looked up by id (`charById`).
- Audio: one AudioContext, loops are looping buffer sources started on a shared bar grid. Synth buffers are cached per id and tempo. Fixed loops are stretched with `playbackRate`.
- UI: pack tabs (`#seasons`), list tabs (`#tabs`), tiles, stage slots, modal. Keyboard handler `onKey`.
- Spooky mode (Mr. Black) is a state flag that changes theme, rate, volume and art. See INFO.md for the pack data format and the tempo rule.
- Art bodies and accessories live in `js/art.js` (BODIES table and `acc` switch). Bubblegum Pop added `heart` and `lightstick`, `horn`, `gumball`, `sparkle`; a pack only names them in its `art` spec.
