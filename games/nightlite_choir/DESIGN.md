# Nightlite Choir+: Design

Status: milestones 1 (Night Garden), 2a (Toy Attic) and 2b (Star Observatory) built. Written 2026-10-28, updated 2026-10-29.

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
2. 12 original creatures, 4 per world. Art from the S4K art generator, sound from the S4K synth.
3. Eggs: spend free "sparks" to hatch a new creature. Sparks trickle in while you play. Hatch time is short (about 30 seconds). No streaks, no daily login pressure, no timers that punish.
4. Combine: pick two creatures to make a blend creature. The recipe table is invented here (see below). Start with 6 blends.
5. Local save in localStorage (keys start with `nightlite.`). Everything works with storage blocked.
6. Phone and tablet first: 52 px touch targets, drag or tap, undo, mute, volume.

Later: more worlds, seasons, a spooky night mode (reuse the S4K rules: off by default, no gore, no jump scares, big exit button).

## Sound rules
- All loops are in C major pentatonic, so any mix of creatures from any world sounds fine together.
- Stage tempo comes from the first creature placed (same rule as S4K v2): synthesized loops re-render at that tempo.
- Each creature has one job (bass, chime, beat, texture, pad, sweep) so layers do not fight.
- Peak volume is capped. Nothing sudden or loud.

## Reuse from S4K Mixer v2 (code only)
Copy and adapt these files into this folder. Do not import from `games/sprunki_v2/`:
- `js/synth.js` (synth), `js/art.js` (art generator), the tray, drag and drop, undo, save and load, volume and keyboard code in `js/app.js`, and the pack data format.
- Do NOT reuse the Classic pack, its images or its loops. Those come from the community Sprunki game. See IP-GUARDRAILS.md.

## Creature data format (target)
```
{ id: 'mossle', name: 'Mossle', world: 'garden', role: 'bass',
  art: { /* art generator spec */ }, synth: { /* synth spec, C pentatonic */ },
  hatch: { cost: 5 }, blend: null }
{ id: 'rustlebolt', name: 'Rustlebolt', world: 'attic', role: 'beat',
  blend: ['mossle', 'clopsy'] }   // invented recipe
```

## Invented blend recipes (samples, ours only)
| Parents | Blend | Role |
|---|---|---|
| Mossle + Clopsy | Rustlebolt | Beat |
| Glimmow + Twinklit | Starbloom | Chime |
| Puddlet + Fluffhorn | Dewdrop | Chime |

## Milestones
1. Fork the S4K engine into this folder, rename, one world, 4 creatures, runs from file:// and Pages.
2. Add the other two worlds and all 12 creatures (done: 2a Attic, 2b Observatory).
3. Eggs, sparks and combine, with 6 blends.
4. Polish, save and load, tests, docs, catalog entry, PR.

Each milestone ends with a commit and a push. Test with Playwright (play the game, check the console, phone width).

## Open decisions for Wayne
- Final creature names (the title is decided).
- Whether a creature may be named after, or look like, anything from the family. Default: no real names in the public repo.
