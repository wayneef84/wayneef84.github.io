# Nightlite Choir+: Design

Status: milestones 1 (Night Garden), 2a (Toy Attic), 2b (Star Observatory) and 3 (sparks, eggs, Mixing pot, 6 blends) built. Written 2026-10-28, updated 2026-10-29.

## Concept
A cozy collect-and-arrange music game for a young child. Little creatures hatch from eggs. Each one sings a short loop. Put them on a stage and the loops layer into a song. Standalone web game, no accounts, no network, no ads, no purchases.

It is one game with three worlds you reach from a bedroom at night:

| World | Door | Feel | Tempo | Creatures |
|---|---|---|---|---|
| The Night Garden | The window | Sleepy glowing garden beds (moss, pond, hedge, path) | 90 BPM | Mossle (low hum), Glimmow (glow chime), Puddlet (drip beat), Shrublet (rustle shaker) |
| The Toy Attic | The hatch | Forgotten toys in a warm attic: wood planks, cardboard, a sunbeam with dust motes | 100 BPM | Clopsy (clip-clop beat), Skeinie (yarn pluck), Cogwick (tin tick), Fluffhorn (music-box chime) |
| The Star Observatory | The skylight | Cosmic creatures hatch from meteor eggs, constellations are the stage | 80 BPM | Dozemoon (low pad), Glintwand (high bell), Twirltail (whoosh sweep), Ringhum (soft drum) |

The title is decided: **Nightlite Choir+** (the plus means more). The creature names are working names. Every name goes through the check in IP-GUARDRAILS.md before it ships.

## Toy Attic creatures (built in milestone 2a)
The placeholder names Clankin, Spoolie, Buttonbug and Tinglet were replaced. Only generic toy ideas are used. No real character, outfit or name.

| Creature | Idea | Role | Sound | Look |
|---|---|---|---|---|
| Clopsy | Hobby horse | Beat | `clop` drum voice: hollow wooden clip-clop on G4 C4 E4 C4, gallop pattern | Tan horse head on a stick, pink yarn mane, star on the cheek |
| Skeinie | Rag doll with yarn braids | Pluck | Triangle-wave pluck, C D E G A in octave 4 | Cloth face, button eyes, stitched smile, mustard-gold yarn braids, dusty pink dress with a mint patch |
| Cogwick | Tin wind-up toy | Tick | `click` drum voice: tick-tock pair, last step is a four-click ratchet | Blue-grey tin box robot, rivets, dial, wind-up key, two bulb antennae |
| Fluffhorn | Plush unicorn | Chime | Music-box sine chime, octave 6, C D E G A | Cream plush, soft gold horn, rose and mint mane, hooves |

## Star Observatory creatures (built in milestone 2b)
The placeholder names Orbi, Twinklit, Cometail and Moonmo were not cleared and were replaced. Only generic ideas are used. No real character or name.

| Creature | Idea | Role | Sound | Look |
|---|---|---|---|---|
| Dozemoon | Sleepy moon | Pad | Triangle-wave chord pad (C or G with fifth and octave), slow swell, 900 Hz low-pass, gentle vibrato | Cream-lilac moon face, craters, pink nightcap with a gold star |
| Glintwand | Little star with a lightstick | Bell | Sine bell with a bright overtone, octave 6 and 7, rising run then a gentle fall (C D E G A) | Pink rounded star, sparkle eyes, lilac wand with a glowing star tip |
| Twirltail | Comet | Sweep | `whoosh` voice: airy noise band that opens and fades plus a thin glide that ends on G5 then E5 | Violet comet head, big pink swirl tail |
| Ringhum | Humming planet | Soft drum | `thrum` voice: warm felt-mallet drum, pitch cycles C3 G3 E3 G3 | Periwinkle planet, pink ring, small pink cowgirl hat, humming note |

Worlds share one stage. The first creature placed sets the tempo (Garden 90, Attic 100, Observatory 80), so mixed stages work. A three-chip world switcher in the tray shows one world's four friends at a time.

## Version 1 scope
1. One stage per world with 6 slots. Tap a creature to place it. Its loop starts in time with the others.
2. 12 original base creatures, 4 per world. They are free and always available. Art from the generator, sound from the synth.
3. Sparks, eggs, the Mixing pot and the Discovery book add 6 NEW things to collect (blends). Nothing that already works is locked or hidden. See "Sparks, eggs and the pot" below.
4. Local save in localStorage (keys start with `nightlite.`). Everything works with storage blocked.
5. Phone and tablet first: 52 px touch targets, drag or tap, undo, mute, volume.

Later: more worlds, seasons, a spooky night mode (reuse the S4K rules: off by default, no gore, no jump scares, big exit button).

## Sparks, eggs and the pot (built in milestone 3)
All numbers are ours and live as constants at the top of `js/app.js`.

| Thing | Rule |
|---|---|
| Sparks | A free counter. +1 spark for every 15 seconds that two or more creatures stand on the stage and the page is visible. Cap 99. Nothing accrues while the tab is hidden or closed. No daily bonus, no login streak, no countdown, nothing to miss or lose. |
| Wish on a star | A free button (door screen, every world, Collection): +3 sparks at any time, no timer. So a child can never get stuck. At 99 it says the jar is full. |
| Egg | 5 sparks puts one egg in the nest (one egg at a time). It hatches by itself after about 20 seconds that the game is open and visible. Tapping the egg warms it: each tap takes 2 seconds off. Waiting is optional. It hatches one blend the child does not own yet. With all 6 owned the egg gives a happy twinkle and the sparks come back. |
| Mixing pot | Pick any two of the 12 base creatures (any worlds), tap Mix. A pair in the recipe table makes the blend at once with a short sparkle. The parents are NOT used up. The recipe is saved in the Discovery book. Other pairs say "Not this time. Nothing was lost." Eggs and the pot make the same 6 blends. The pot is the guaranteed path. |
| Discovery book | One card per recipe: the two parents plus the blend, or "?" cards while it is not found. Eggs do not fill the book, only the pot does. |
| Collection screen | Sparks, the nest, the Discovery book and the blends owned. Button on the door screen and in every world. |

## Blends (built in milestone 3)
Each blend has parents from two DIFFERENT worlds, its own art (two parents' visual traits mixed), its own sound role and its own name. The recipe table is invented here. The tempo of a blend is the tempo of its first parent's world, and the "first creature placed sets the tempo" rule still applies.

| Blend | Parents | World mix | Role and sound | Look |
|---|---|---|---|---|
| Mossweave | Mossle + Skeinie | Garden + Attic | Wobble bass: triangle wave, 700 Hz low-pass, vibrato, C3 E3 G3 A3 | Moss-green round body, yarn braids, button eyes, stitched smile, patch, sprout |
| Halohum | Glimmow + Ringhum | Garden + Observatory | Glow arpeggio: soft sine doubled an octave up, slow attack, C5 E5 G5 A5 D5 | Pale blue ghost, antennae, pink ring around the body, humming note |
| Dewglint | Puddlet + Glintwand | Garden + Observatory | Droplet marimba: short decaying sine with a strong 2nd harmonic, G5 A5 C6 E5 | Light blue drop, star eyes, lightstick wand and sparkles |
| Trotleaf | Shrublet + Clopsy | Garden + Attic | Hop pluck: short square-wave plucks, 2000 Hz low-pass, G4 C5 E5 A4 | Green hobby-horse head, leafy mane, a leaf, star on the cheek |
| Tockmoon | Cogwick + Dozemoon | Attic + Observatory | Chord stabs: saw wave, 1500 Hz low-pass, stabs on C4 G4 A4, each with a fifth and an octave (C G C, G D G, A E A), off the beat | Tin-grey moon with craters, grille mouth, gold cap, wind-up key |
| Twirlwisp | Fluffhorn + Twirltail | Attic + Observatory | Ooh voice: formant "o" vowel song, C5 E5 G5 A5 | Lilac plush body, pink swirl tail, small gold horn, singing mouth |

## Sound rules
- All loops are in C major pentatonic, so any mix of creatures from any world sounds fine together.
- Stage tempo comes from the first creature placed (same rule as S4K v2): synthesized loops re-render at that tempo.
- Each creature has one job (bass, chime, beat, texture, pad, sweep) so layers do not fight.
- Peak volume is capped. Nothing sudden or loud.

## Reuse from S4K Mixer v2 (code only)
Copy and adapt these files into this folder. Do not import from `games/sprunki_v2/`:
- `js/synth.js` (synth), `js/art.js` (art generator), the tray, drag and drop, undo, save and load, volume and keyboard code in `js/app.js`, and the pack data format.
- Do NOT reuse the Classic pack, its images or its loops. Those come from the community Sprunki game. See IP-GUARDRAILS.md.

## Creature data format
```
{ id: 'mossweave', name: 'Mossweave', role: 'wobble bass', blend: ['mossle', 'skeinie'],
  art: { /* art generator spec */ }, synth: { /* synth spec, C pentatonic */ } }
```
Base creatures are in `js/worlds/*.js` (no `blend` field). Blends are in `js/worlds/blends.js`. The `blend` pair is the recipe: order does not matter. Parent ids are the internal ids (some differ from the display names: `hedgey` is Shrublet, `tocklet` is Cogwick, `mallowhorn` is Fluffhorn).

## Milestones
1. Fork the S4K engine into this folder, rename, one world, 4 creatures, runs from file:// and Pages.
2. Add the other two worlds and all 12 creatures (done: 2a Attic, 2b Observatory).
3. Eggs, sparks and combine, with 6 blends (done, v0.4.0).
4. Polish, save and load, tests, docs, catalog entry, PR.

Each milestone ends with a commit and a push. Test with Playwright (play the game, check the console, phone width).

## Open decisions for Wayne
- Final creature and blend names (the title is decided).
- The spark numbers: 1 per 15 s, Wish +3, egg 5, hatch 20 s, 2 s per warm tap. Easy to change at the top of app.js.
- Whether a creature may be named after, or look like, anything from the family. Default: no real names in the public repo.
