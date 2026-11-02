# Nightlite Choir+: Changelog

## v0.5.0 - Pot upgrade (2026-11-01)
- Mixing pot takes 2 to 5 friends. Blends you own can be ingredients. Recipe key = sorted ids joined with `+`, exact set match, order never matters. The 6 old recipes and old saves work unchanged. Tempo of a blend is the first ingredient's world, through blends.
- Pot screen: 5 spots, Mix needs 2, "Match my stage" and "What can I make?" buttons with big suggestion cards (ingredient faces, "?" and a clue for new recipes), hints "Almost! Add N more friend(s)" and "That is a lot of friends. Try fewer."
- 15 new blends (set CLAUDE, `js/worlds/blends_claude.js`, notes in RECIPES_CLAUDE.md). Any `NightliteBlendsExtra_*` global is merged by the new `js/recipes.js`, so a second set is one file and one script tag. Name checks in ASSET_LOG.md. The 6 old blends got clues.
- Discovery book: page 1 and page 2 (recipes that use a blend), N faces per recipe, clue on unfound cards, "found of total" count.
- Rare friends: 1 in 10 on a mix or an egg, shimmering twin (`<id>_rare`, hue shift, sparkles, brighter C pentatonic sound), star on the tray, stage, book and a Collection card. Toggle "Rare friends: On/Off" in the pot (`nightlite.rare`, added to the saves manifest). Rares are saved in `nightlite.save` (v5, `rares` list). Never required.
- Tests: `node tests/nightlite.test.js`.
- Review fixes: rare voice and noise friends keep the base loudness (wrapper amp, layer level `lvl`). A group with no match and no hint says "Not sure about that group. Try Mix and see." Blends with a duplicate ingredient set, a cycle or a missing ingredient are left out of the game and reported with `console.warn`, and the book count and My blends count use the same list. Rare drums stay pentatonic (octave for drip, clop and thrum). Saves are read safely (own properties only, 200 entries per list, rares need their blend). "Try fewer" wins over "Almost". Hatching with the pot open refreshes the tray. Restore previous leaves `nightlite.rare` alone when the undo copy has none. The pot tray scrolls (capped height) and the pot animations respect reduced motion.

## Unreleased
- Drive pause card in the settings overlay: "Drive has a newer save for Nightlite Choir+" with Saved at times on Drive and on this device and three buttons, Keep this device, Load the Drive save and Decide later, all behind the grown-ups question. Load puts the Drive save in the paste box and Add missing or Replace (with the existing confirm and `nightlite.undo`) finish it. A merge that changes nothing does not release the pause. The Auto backup switch now needs the question too. Backup list buttons show Saved at. Status dots carry a mark, title and spoken label. Texts say that autosave keeps the sign-in until the page is closed. No rule changes.
- Settings overlay Drive section: Auto backup switch and last backup time, a status line with a dot on each gear (hidden while off), a Tap to reconnect button, an optional save point name, and a "newer backup found" card with Load and Not now. Load puts the backup in the paste box and Add missing or Replace do the rest (same gate, confirm and `nightlite.undo`). Back up, Restore and Load always need the grown-ups question for each time the panel opens. A button that becomes disabled hands focus to the message line. Closing the panel signs out when Auto backup is off. Loads `../../js/gdrive-auto.js` too. No rule changes.
- Settings overlay: optional Google Drive section with Back up to Drive and Restore from Drive next to the file export and import. Same grown-ups question, same Replace confirm and `nightlite.undo` stash. Restore loads the chosen backup into the paste box and Add missing or Replace do the rest. Buttons are disabled with "Not set up yet" until a Client ID is set in `js/gdrive-config.js`. Loads `../../js/gdrive-config.js` and `../../js/gdrive-backup.js`. No rule changes.
- Settings overlay: a gear button (aria-label "Settings") beside Home on every screen. Volume and Mute (same state as the world controls), Export this game, Import this game (file or pasted text, Add missing or Replace), and a link to the arcade Settings, Data tab for all-site export and import. Replace and Restore previous ask a grown-up question (times table) and then need a second tap. One-step undo under `nightlite.undo` (not exported). Import is all or nothing. The page is made inert while the overlay is open, Escape is handled at document level, and the paste box always holds the whole file. Escape closes it, focus is trapped and returns to the gear. Uses `js/gamesaves.js` (`FongGameSaves`, id `nightlite-choir`). After an import the page reloads, and saving is paused until then so old memory cannot overwrite the import. Home is icon only below 480px wide. No rule changes.
- Cheers button next to Wish, Collection and Mixing pot. A new hatched blend or a new Mixing pot discovery calls `FongCheer.cheer('big')`, guarded (`js/cheer.js`, docs/CHEER.md). Off until a parent turns it on. No rule changes.

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
