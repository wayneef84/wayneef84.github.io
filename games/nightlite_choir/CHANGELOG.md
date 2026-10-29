# Nightlite Choir+: Changelog

## v0.4.0 - Milestone 3 (2026-10-29)
- Sparks: a free counter. +1 spark per 15 seconds while two or more friends sing on the stage and the page is visible, cap 99. Nothing accrues in the background. A "Wish" button gives 3 free sparks at any time. No timers, streaks, daily bonus or anything that can be missed.
- Eggs: 5 sparks puts an egg in the nest. It hatches in about 20 seconds, tap it to warm it (2 seconds sooner per tap). It hatches a blend you do not have. With all 6 owned the egg twinkles and refunds its sparks.
- Mixing pot: pick any two of the 12 friends, tap Mix. Six invented pairs make a blend at once (nothing is used up) and are saved in the Discovery book. Other pairs say "Not this time".
- 6 original blends: Mossweave, Halohum, Dewglint, Trotleaf, Tockmoon, Twirlwisp. Own art (generator additions: `ringband`) and own sounds. Tray gets a fourth chip, Blends.
- Collection screen (button on the door screen and in every world): sparks, nest, Discovery book, blends you own. Mixing pot screen. Home stays on every screen.
- New save key `nightlite.save` (version 4: sparks, blends, found recipes, nest). v0.1.0, v0.2.0 and v0.3.0 saves still load. Works with storage blocked.

## v0.3.0 - Milestone 2b (2026-10-29)
- The Star Observatory door opens ("Through the skylight"). 80 BPM, 6 slots, 4 new creatures: Dozemoon (pad), Glintwand (bell), Twirltail (sweep), Ringhum (soft drum), all C major pentatonic.
- Deep night sky look: skylight, telescope silhouette, twinkling stars, slow shooting stars. Soft pink and lilac star-map lines join the friends on the stage (decoration only, taps pass through).
- New world switcher: three chips (Garden, Attic, Observatory) above the tray replace the stacked rows. One tap shows another world's four friends. The stage, sound and undo history stay. Keys 1 to 4 place the shown friends.
- All three doors are open. The "Coming soon" state is gone. Home stays on every screen.
- Art generator: bodies moon, star, comet, planet, eyes twinkle, mouth hum, accessories nightcap, wand, sparkles, cowhat, swirl. Synth: `whoosh` and `thrum` drum voices.
- Tempo rule across worlds: first creature placed sets it (Garden 90, Attic 100, Observatory 80). v0.1.0 and v0.2.0 saves still load.

## v0.2.0 - Milestone 2a (2026-10-28)
- The Toy Attic door opens ("Through the hatch"). 100 BPM, 6 slots, 4 new creatures: Clopsy (beat), Skeinie (pluck), Cogwick (tick), Fluffhorn (chime), all C major pentatonic.
- Warm attic look: planks, cardboard stage, faded pink and cream, sunbeam with dust motes.
- Art generator: new bodies, eyes, mouths and accessories. Synth: new `clop` and `click` drum voices.
- Both worlds share one stage. The first creature placed sets the tempo. Save stores the tempo and works across worlds. Keys 5 to 8 place the other world's friends.
- The Star Observatory still says "Coming soon". Home button stays on every screen.
- Renamed three creatures to stay clear of existing names: Hedgey is now Shrublet, Tocklet is now Cogwick, Mallowhorn is now Fluffhorn. Ids are unchanged, so saved mixes still load.

## v0.1.0 - Milestone 1 (2026-10-27)
- Engine forked from S4K Mixer v2 (synth, art generator, tray, drag, undo, save, volume, keyboard). Classic pack not used.
- Door screen with three doors. Only the Night Garden opens. The Toy Attic and Star Observatory say "Coming soon".
- Night Garden: 90 BPM, 6 stage slots, 4 creatures (Mossle, Glimmow, Puddlet, Shrublet), all in C major pentatonic.
- Tap to place and remove, drag, undo, reset, mute, volume, save and load one mix, keys 1 to 4.
- Home button on every screen. Name checks logged in ASSET_LOG.md.
- Added to js/catalog.js and the homepage Just added row.
