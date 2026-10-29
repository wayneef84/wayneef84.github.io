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
| 2026-10-28 | Name: Clopsy | Name | Invented for the hobby-horse creature (replaces placeholder Clankin) | Web search (1 query, 2026-10-28, run by a research helper): no game, toy, character or brand named Clopsy. Nearby but different: Dive-Clops (Skylanders), Carnies (Kidrobot). Kept. Quick search only, not legal clearance. |
| 2026-10-28 | Name: Skeinie | Name | Invented for the rag-doll creature (replaces placeholder Spoolie). A skein is a loop of yarn | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Skein (Marvel villain), Skel-Knight (Mattel). Kept. Quick search only, not legal clearance. |
| 2026-10-28 | Name: Tocklet | Name | Invented for the tin wind-up creature (replaces placeholder Buttonbug). From tick-tock | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Tickety Toc (Just Play preschool line, clock theme, has a "Tock" accessory). Not the same name. Kept, Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-28 | Name: Mallowhorn | Name | Invented for the plush unicorn creature (replaces placeholder Tinglet) | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Mallowolf (Viva Pinata), Mallow (screen-free voice gaming platform for kids), Mallows (collectible figure). The "Mallow-" prefix is crowded. Kept, Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-28 | Code: js/art.js additions | Code | Our own generator extended by hand: bodies doll, pony, tin, plush, eyes button, mouths stitch and grille, accessories braids, mane, horn, tuft, windkey, plus patch and star mark. Generic toy shapes (rag doll, hobby horse, tin wind-up toy, plush unicorn), no reference art, no named character | n/a |
| 2026-10-28 | Art: Clopsy, Skeinie, Tocklet, Mallowhorn | Image | Generated at runtime by js/art.js from the specs in js/worlds/attic.js (pony / doll / tin / plush bodies). Colors chosen to avoid any known character or outfit: no yellow-green-purple space suit with wings, no red-haired cowgirl in yellow and white, no purple braids, no cow-print hat. No image files | n/a |
| 2026-10-28 | Code: js/synth.js additions | Code | New `clop` and `click` drum voices written by hand in our synth | n/a |
| 2026-10-28 | Sound: Clopsy clip-clop beat | Sound | `clop` voice: pitch-dropping sine thunk plus a tiny knock, pitch cycles G4 C4 E4 C4, gallop pattern x.x.xx..x.x.xx.. | n/a |
| 2026-10-28 | Sound: Skeinie yarn pluck | Sound | Tone spec in js/worlds/attic.js: triangle wave with a 2nd harmonic, fast decay, 2600 Hz low-pass, C D E G A in octave 4 | n/a |
| 2026-10-28 | Sound: Tocklet tin tick | Sound | `click` voice: short sine plus noise tick-tock (1750 and 1250 Hz), a capital X is a ratchet of four clicks | n/a |
| 2026-10-28 | Sound: Mallowhorn music-box chime | Sound | Tone spec: decaying sine with an octave partial, octave 6, C D E G A | n/a |
| 2026-10-28 | Look: attic theme | Image | CSS only: plank stripes, cardboard stage, sunbeam and dust motes in css/style.css, theme colors in js/worlds/attic.js | n/a |

Add one row per creature, sound, image and the game title. Name check: search done, result, date.
