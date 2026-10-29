# Asset log

| Date | Item | Type | How it was made | Name check |
|---|---|---|---|---|
| 2026-10-28 | Title: Nightlite Choir+ | Name | Chosen by Wayne | Web search (2 queries): no game, app or music project with this name. Unrelated: itch.io NIGHTLIGHT (escape game), Unison (choir puzzle), Choir (GamePix). Quick search only, not legal clearance. |
| 2026-10-27 | Name: Mossle | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no game character or trademark named Mossle. Nearby but different: Mosslings (Minecraft mod creatures), Mosslax (Pokemon Pokopia). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Glimmow | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no result for Glimmow. Nearby but different: Glimmer (Donkey Kong Country 2 anglerfish), Glimmet and Glimmora (Pokemon). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Puddlet | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no result for Puddlet. Nearby but different: Puddles (Animal Crossing frog), Puddle Puzzles, Puddies (Steam game). Kept. Quick search only, not legal clearance. |
| 2026-10-27 | Name: Shrublet | Name | Chosen in DESIGN.md | Web search (1 query, 2026-10-27): no character or trademark named Shrublet. The name sounds like "hedgehog" (SEGA owns hedgehog marks for Sonic), but our creature is a leafy hedge bush with a firefly, not a hedgehog. Kept. Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-27 | Code: js/synth.js | Code | Copied from games/sprunki_v2/js/synth.js (our own code), renamed to NightliteSynth, added the `drip` and `rustle` drum voices | n/a |
| 2026-10-27 | Code: js/art.js | Code | Copied from games/sprunki_v2/js/art.js (our own code), renamed to NightliteArt, added the `bush` body and `firefly` accessory | n/a |
| 2026-10-27 | Code: js/app.js, css/style.css | Code | Tray, drag, undo, save, volume, keyboard and audio-context code adapted from games/sprunki_v2. No Classic pack code or assets | n/a |
| 2026-10-27 | Art: Mossle, Glimmow, Puddlet, Shrublet | Image | Generated at runtime by js/art.js from the specs in js/worlds/garden.js (round / ghost / drop / bush bodies). No image files | n/a |
| 2026-10-27 | Sound: Mossle low hum | Sound | js/synth.js tone spec in js/worlds/garden.js: sine with a soft 2nd harmonic, 420 Hz low-pass, C2 G2 A2 notes | n/a |
| 2026-10-27 | Sound: Glimmow glow chime | Sound | Same file: sine bell with decay, C pentatonic melody E5 G5 A5 D5 | n/a |
| 2026-10-27 | Sound: Puddlet drip beat | Sound | New `drip` voice: short rising sine plips cycling G4 C5 E5 D5 G5 A4 | n/a |
| 2026-10-27 | Sound: Shrublet rustle shaker | Sound | New `rustle` voice: soft filtered noise with a swell and quick fade | n/a |
| 2026-10-27 | Door icons (window, hatch, skylight) | Image | Small inline SVGs written by hand in js/app.js | n/a |
| 2026-10-28 | Name: Clopsy | Name | Invented for the hobby-horse creature (replaces placeholder Clankin) | Web search (1 query, 2026-10-28, run by a research helper): no game, toy, character or brand named Clopsy. Nearby but different: Dive-Clops (Skylanders), Carnies (Kidrobot). Kept. Quick search only, not legal clearance. |
| 2026-10-28 | Name: Skeinie | Name | Invented for the rag-doll creature (replaces placeholder Spoolie). A skein is a loop of yarn | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Skein (Marvel villain), Skel-Knight (Mattel). Kept. Quick search only, not legal clearance. |
| 2026-10-28 | Name: Cogwick | Name | Invented for the tin wind-up creature (replaces placeholder Buttonbug). From tick-tock | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Tickety Toc (Just Play preschool line, clock theme, has a "Tock" accessory). Not the same name. Kept, Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-28 | Name: Fluffhorn | Name | Invented for the plush unicorn creature (replaces placeholder Tinglet) | Web search (1 query, 2026-10-28): no exact match. Nearby but different: Mallowolf (Viva Pinata), Mallow (screen-free voice gaming platform for kids), Mallows (collectible figure). The "Mallow-" prefix is crowded. Kept, Wayne may prefer a rename (see TODO). Quick search only, not legal clearance. |
| 2026-10-28 | Code: js/art.js additions | Code | Our own generator extended by hand: bodies doll, pony, tin, plush, eyes button, mouths stitch and grille, accessories braids, mane, horn, tuft, windkey, plus patch and star mark. Generic toy shapes (rag doll, hobby horse, tin wind-up toy, plush unicorn), no reference art, no named character | n/a |
| 2026-10-28 | Art: Clopsy, Skeinie, Cogwick, Fluffhorn | Image | Generated at runtime by js/art.js from the specs in js/worlds/attic.js (pony / doll / tin / plush bodies). Colors chosen to avoid any known character or outfit: no yellow-green-purple space suit with wings, no red-haired cowgirl in yellow and white, no purple braids, no cow-print hat. No image files | n/a |
| 2026-10-28 | Code: js/synth.js additions | Code | New `clop` and `click` drum voices written by hand in our synth | n/a |
| 2026-10-28 | Sound: Clopsy clip-clop beat | Sound | `clop` voice: pitch-dropping sine thunk plus a tiny knock, pitch cycles G4 C4 E4 C4, gallop pattern x.x.xx..x.x.xx.. | n/a |
| 2026-10-28 | Sound: Skeinie yarn pluck | Sound | Tone spec in js/worlds/attic.js: triangle wave with a 2nd harmonic, fast decay, 2600 Hz low-pass, C D E G A in octave 4 | n/a |
| 2026-10-28 | Sound: Cogwick tin tick | Sound | `click` voice: short sine plus noise tick-tock (1750 and 1250 Hz), a capital X is a ratchet of four clicks | n/a |
| 2026-10-28 | Sound: Fluffhorn music-box chime | Sound | Tone spec: decaying sine with an octave partial, octave 6, C D E G A | n/a |
| 2026-10-28 | Look: attic theme | Image | CSS only: plank stripes, cardboard stage, sunbeam and dust motes in css/style.css, theme colors in js/worlds/attic.js | n/a |
| 2026-10-29 | Name: Dozemoon | Name | Invented for the sleepy moon creature (replaces placeholder Moonmo, which was not cleared). Doze + moon | Web search (1 query, 2026-10-29, run by a research helper): no exact match. Nearby but different: Doraemon (anime), Dozaemon (GeGeGe no Kitarou character), Dreamy Dozing Sands (Mario and Luigi location). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Glintwand | Name | Invented for the star-with-lightstick creature (replaces placeholder Twinklit). Glint + wand | Web search (2 queries, 2026-10-29): no exact match. Nearby but different: Glinda Wand (Oz prop), generic glitter wand toys, Glitter Burst (collectible line), Lightwand (Mario Wiki item), Gloom Wand (WoW item). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Twirltail | Name | Invented for the comet creature (replaces placeholder Cometail). Twirl + tail. The first pick, Swooshlet, was dropped: it reads as a diminutive of the Nike swoosh | Web search (1 query, 2026-10-29): no game, toy or brand named Twirltail. Nearby but different: "Twirl Tail" (two words, a generic fishing-lure term). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Ringhum | Name | Invented for the humming ringed planet (replaces placeholder Orbi). Ring + hum | Web search (1 query, 2026-10-29): no exact match. Nearby but different: Ringhim (village in Sikkim), Ringebu (village in Norway). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name check note | Name | Backups searched but unused: Napmoon, Lumiwand (near the Firetoys Lumi wand toy), Streamlet (generic word), Hummaring | Web search, no exact matches. |
| 2026-10-29 | Code: js/art.js additions | Code | Our own generator extended by hand: bodies moon, star, comet, planet, eyes twinkle, mouth hum, accessories nightcap, wand, sparkles, cowhat, swirl. Generic shapes (moon, star, comet, ringed planet), no reference art, no named character | n/a |
| 2026-10-29 | Art: Dozemoon, Glintwand, Twirltail, Ringhum | Image | Generated at runtime by js/art.js from the specs in js/worlds/observatory.js. Pink, lilac and cream palette chosen by hand. A pink cowgirl hat on Ringhum is a generic hat with a lilac band and a small gold star, no known character or outfit. No image files | n/a |
| 2026-10-29 | Code: js/synth.js additions | Code | New `whoosh` and `thrum` drum voices written by hand in our synth | n/a |
| 2026-10-29 | Sound: Dozemoon pad | Sound | Tone spec in js/worlds/observatory.js: triangle wave, chord [0, 7, 12], 0.9 s attack, 900 Hz low-pass, slight vibrato, C3 then G3 | n/a |
| 2026-10-29 | Sound: Glintwand bell | Sound | Tone spec: decaying sine with a strong 2nd harmonic, chord [0, 12], notes C6 E6 G6 C7 A6 G6 E6 D6 (C pentatonic) | n/a |
| 2026-10-29 | Sound: Twirltail sweep | Sound | `whoosh` voice: band-passed noise with a rising cutoff and a swell, plus a soft sine glide from G3 to G5 (second hit to E5) | n/a |
| 2026-10-29 | Sound: Ringhum soft drum | Sound | `thrum` voice: low sine with a small pitch dip and a gentle 2nd harmonic, notes C3 G3 E3 G3 | n/a |
| 2026-10-29 | Look: observatory theme | Image | CSS plus a small hand-written inline SVG (skylight frame and telescope silhouette) in js/app.js, stars and shooting stars as CSS, star-map lines drawn by js/app.js. No image files | n/a |
| 2026-10-29 | Name: Mossweave | Name | Invented for the Mossle + Skeinie blend. Moss + weave | Web search (2 queries, 2026-10-29, run by a research helper): no game, character, toy or brand named Mossweave. Nearby but different: Moss Man (Masters of the Universe), Moonweave (Veloren crafting item), Moss-Weaver (Elder Scrolls NPC title). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Halohum | Name | Invented for the Glimmow + Ringhum blend. Halo + hum | Web search (2 queries, 2026-10-29): no exact match. Nearby but different: Halo (Xbox franchise, toys by Youtooz), Halohasta (a microbe genus). The "Halo" prefix is crowded, so a name that is only the word Halo was avoided. Kept, Wayne may prefer a rename. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Dewglint | Name | Invented for the Puddlet + Glintwand blend. Dew + glint | Web search (2 queries, 2026-10-29): no match. Nearby but different: Dewy (Wii game Dewy's Adventure water drop), Glint (a Pikmi Pops dog), Dew Glow Tint (a lip product). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Trotleaf | Name | Invented for the Shrublet + Clopsy blend. Trot + leaf | Web search (2 queries, 2026-10-29): no match, only generic trot and trotter pages. Nearby but different: Umberleaf (a cube game creature). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Tockmoon | Name | Invented for the Cogwick + Dozemoon blend. Tock + moon | Web search (2 queries, 2026-10-29): nothing relevant (moon calendars, unrelated merchandise). Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Name: Twirlwisp | Name | Invented for the Fluffhorn + Twirltail blend. Twirl + wisp | Web search (2 queries, 2026-10-29): no match. Nearby but different: Twip Wips (Fly Free mobile game creatures), Twirlywoos (CBeebies toy line). Wisp is a generic fantasy word. Kept. Quick search only, not legal clearance. |
| 2026-10-29 | Recipe table (6 pairs) | Design | Invented in DESIGN.md. Chosen only for our own look-and-sound ideas (moss and yarn, ghost and ring, drop and star, hedge and horse, tin and moon, plush and comet). No other game's chart, wiki or combination was opened or used. Every pair crosses two worlds | n/a |
| 2026-10-29 | Code: js/art.js addition | Code | New accessory `ringband` written by hand (front and back arc of a thin ring) | n/a |
| 2026-10-29 | Art: Mossweave, Halohum, Dewglint, Trotleaf, Tockmoon, Twirlwisp | Image | Generated at runtime by js/art.js from the specs in js/worlds/blends.js, mixing visual traits of each blend's two parents (bodies, accessories and eyes of the parents, new color mixes). No image files, no references | n/a |
| 2026-10-29 | Sound: Mossweave wobble bass | Sound | Tone spec in js/worlds/blends.js: triangle wave, 700 Hz low-pass, vibrato, C3 E3 G3 A3 | n/a |
| 2026-10-29 | Sound: Halohum glow arpeggio | Sound | Tone spec: sine doubled an octave up (chord 0 and 12), slow attack, vibrato, C5 E5 G5 A5 D5 | n/a |
| 2026-10-29 | Sound: Dewglint droplet marimba | Sound | Tone spec: decaying sine, strong 2nd harmonic, 0.22 s decay, G5 A5 C6 E5 | n/a |
| 2026-10-29 | Sound: Trotleaf hop pluck | Sound | Tone spec: square wave, 2000 Hz low-pass, 0.1 s decay, G4 C5 E5 A4 | n/a |
| 2026-10-29 | Sound: Tockmoon chord stabs | Sound | Tone spec: saw wave, 1500 Hz low-pass, chord 0, 7 and 12, off-beat stabs on C4 G4 A4 (each root, fifth and octave stays in C pentatonic) | n/a |
| 2026-10-29 | Sound: Twirlwisp ooh voice | Sound | Existing `voice` synth kind (formant vowel "o"), C5 E5 G5 A5 | n/a |
| 2026-10-29 | Sound: wish, egg, hatch, pot chimes | Sound | `chime()` in js/app.js: a few soft sine notes on C pentatonic pitches (C5 to C7 range), played with the Web Audio API. No sound files | n/a |
| 2026-10-29 | Art: egg and nest | Image | Small inline SVG written by hand in js/app.js (`eggSvg`): cream egg with pastel spots, twig nest, glow and cracks as it warms | n/a |
| 2026-10-29 | UI: spark counter, Wish, Collection, Mixing pot, Discovery book | Design | Own words and layout (free sparks, tap-to-warm egg, instant recipe pot, discovery book). No My Singing Monsters structure, names, timers or tier labels used | n/a |

Add one row per creature, sound, image and the game title. Name check: search done, result, date.

## Rename log (2026-10-28)
Wayne asked for safer coined names. Each replacement got one web search (standard mode, quick search, not legal clearance): no exact match for any.

| Old name | New name | Notes |
|---|---|---|
| Hedgey | Shrublet | Old name sounded like "hedgehog". Shrublet: no exact match found. |
| Tocklet | Cogwick | Old name was near "Tickety Toc". Cogwick: no exact match (nearest were Cogsworth and generic gear toys, not close). |
| Mallowhorn | Fluffhorn | The "Mallow-" prefix is crowded. Fluffhorn: no exact match (nearest was the Fluffie Stuffiez unicorn plush line, a different name). |

Internal ids (`hedgey`, `tocklet`, `mallowhorn`) are unchanged so saved mixes keep working. Only display names changed.
