# Asset log

| Date | Item | Type | How it was made | Name check |
|---|---|---|---|---|
| 2026-10-28 | Title: Nightlite Choir+ | Name | Chosen by Wayne | Web search (2 queries): no game, app or music project with this name. Unrelated: itch.io NIGHTLIGHT (escape game), Unison (choir puzzle), Choir (GamePix). Quick search only, not legal clearance. |
| 2026-10-27 | Name: Mossle | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no game character or trademark named Mossle. Nearby but different: Mosslings (Minecraft mod creatures), Mosslax (Pokemon Pokopia). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Glimmow | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no result for Glimmow. Nearby but different: Glimmer (Donkey Kong Country 2 anglerfish), Glimmet and Glimmora (Pokemon). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Puddlet | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no result for Puddlet. Nearby but different: Puddles (Animal Crossing frog), Puddle Puzzles, Puddies (Steam game). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Hedgey | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no character or trademark named Hedgey. The name sounds like "hedgehog" (SEGA owns hedgehog marks for Sonic), but our creature is a leafy hedge bush with a firefly, not a hedgehog. Kept. Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-27 | Code: js/synth.js | Code | Copied from games/sprunki_v2/js/synth.js (our own code), renamed to NightliteSynth, added the `drip` and `rustle` drum voices | n/a |
| 2026-10-27 | Code: js/art.js | Code | Copied from games/sprunki_v2/js/art.js (our own code), renamed to NightliteArt, added the `bush` body and `firefly` accessory | n/a |
| 2026-10-27 | Code: js/app.js, css/style.css | Code | Tray, drag, undo, save, volume, keyboard and audio-context code adapted from games/sprunki_v2. No Classic pack code or assets | n/a |
| 2026-10-27 | Art: Mossle, Glimmow, Puddlet, Hedgey | Image | Generated at runtime by js/art.js from the specs in js/worlds/garden.js (round / ghost / drop / bush bodies). No image files | n/a |
| 2026-10-27 | Sound: Mossle low hum | Sound | js/synth.js tone spec in js/worlds/garden.js: sine with a soft 2nd harmonic, 420 Hz low-pass, C2 G2 A2 notes | n/a |
| 2026-10-27 | Sound: Glimmow glow chime | Sound | Same file: sine bell with decay, C pentatonic melody E5 G5 A5 D5 | n/a |
| 2026-10-27 | Sound: Puddlet drip beat | Sound | New `drip` voice: short rising sine plips cycling G4 C5 E5 D5 G5 A4 | n/a |
| 2026-10-27 | Sound: Hedgey rustle shaker | Sound | New `rustle` voice: soft filtered noise with a swell and quick fade | n/a |
| 2026-10-27 | Door icons (window, hatch, skylight) | Image | Small inline SVGs written by hand in js/app.js | n/a |

Add one row per creature, sound, image and the game title. Name check: search done, result, date.
