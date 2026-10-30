# Slots - Changelog

All notable changes. Dates are YYYY-MM-DD.

## [4.1.1] - 2026-10-29

### Changed
- Renamed 16 theme display names that matched known products. Theme keys, symbols and saved data are unchanged. Dragon's Lair is Cosy Dragon Cave, Robot Factory is Gizmo Garage, Pirate's Gold is Buried Treasure Bay, Samurai Spirit is Petal Dojo Days, Wolf Pack is Moonlit Howl, Wild Animals is Safari Day Out, Monster Mayhem is Goofy Ghost Gang, Solar System is Planet Parade, Classic Fruits is Cherry Bell Corner, Music Beats is Loud Little Speaker, Card Royale is Card Court, Chess Masters is Checkmate Corner, Mystical Unicorn is Sparkle Meadow, Ancient Egypt is Sandy Scarab Tomb, Wilderness Camp is Campfire Trail, Viking Legends is Longship Tales.
- New optional `aka` field in `js/themes.js` holds the old name. The theme picker search checks it, so typing an old or a new name finds the theme.
- Asset query strings bumped to `?v=4.1.1`.

## [4.1.0] - 2026-10-29

### Added
- 6 original themes under a new **K's Picks** picker chip (60 total): Unicorn Sparkle, Bubblegum Band (inline SVG round music pals: Strumble, Hummsy, Whoopa, Tavvy, Thrumby, Jinglet), Rainbow Cloud Stage, Pink Pony Ranch, Glitter Garden, Dream Carousel. New optional `kpick: true` field in `js/themes.js`. Name checks are in ASSET_LOG.md.
- Cheers: a "Cheers" button in the footer opens the grown-ups gate and the shared settings panel (`js/cheer.js`, docs/CHEER.md). Guarded `FongCheer.cheer()` calls: first spin of a visit = start, a win = good, a big win or bonus win = big, a zero-win spin = a gentle line about once in 6 spins and never twice in a row. Off by default. No game rule or payout changed.
- Easter egg "Sparkle Party": tap the footer title 5 times within 2.5 seconds. A 20-second calm overlay with slow rainbow confetti (none in Calm mode or reduced motion, nothing flashes), a cheer line and 200 free play coins once per page visit (not saved, not daily, no streak).
- Footer row with the Cheers button and the title.

### Changed
- Asset query strings bumped to `?v=4.1.0`.

## [4.0.0] - 2026-10-29

Full rebuild. The v3.1 canvas machine is gone (it was not 3D CSS despite the docs).

### Added
- 6 modes: Classic 3-Reel, 5-Reel Lines (10 lines), Cascade, Match Groups, Pick-a-Prize, Prize Wheel. One-line how-to for each, shown on first visit and under the mode chips.
- Real CSS 3D drum reels (12-sided drums, perspective, depth shading).
- 24 new original themes (54 total): Sugar Counter, Bakery Morning, Ice-Cream Truck, Pizza Night, Coral Cove, Garden Bugs, Toy Parade, Sky Buccaneers, Ice Rink, Jungle Drums, Rainy-Day Puddles, Lava Lagoon, Moon Garden, Fairy-Tale Castle, Music Box Melody, Paper Lantern Night, Circus Night, Robot Workshop, Space Picnic, Dino Dig Park, Pet Parade, Pajama Party, Farmyard Fun, Beach Day.
- Phone-friendly theme picker: search, group chips, Kids chip, last choice saved. Themes are one data object each.
- Free refill (1,000 coins, instant, any time). Footer line "Just for fun. No real money."
- Calm mode and `prefers-reduced-motion` support.
- `js/engine.js` pure maths and `tests/sim.js` headless simulation.
- Keyboard: Space or Enter spins when no button has focus. The lever works by click and by drag. Buttons are real buttons.
- Docs: DESIGN.md, ASSET_LOG.md and the missing ARCHITECTURE, CHANGELOG, CLAUDE, INFO, TODO.

### Fixed (v3.1 problems, file:line are the old code)
- `slots.js:642` called `audio.playBigWin` and `audio.playWin`, which did not exist. Every winning spin threw, so the spin never finished (button stuck on STOP, no balance update on screen, bonus loop dead).
- `slots.js:318-319` and `:488` quick stop and the animation loop both ended the spin, so one win paid twice.
- `slots.js:528-548`, `:582-584`, `:356` Skip Bonus resolved the running spin twice, and 3 scatters inside a bonus restarted it with two timer chains.
- `slots.js:509`, `:767` cascade timers survived a new spin and paid on a spin in progress.
- `slots.js:679-688`, `:605` wild-led lines paid the wild's own value and 20 free lines paid on one bet. Measured return was roughly 8,600% to 13,700% of the bet per spin. A scatter-led line counted as a win worth 0.
- `slots.js:1458-1471`, `:1706` blocked storage showed an alert and killed the game. A corrupt save gave a negative balance.
- `slots.js:340-344` at zero balance the only option was "Not enough cash!". Now a free refill button.
- Dollar amounts everywhere (`slots.js:137,563,636-639,1518-1520`, `index.html:51,83,117`). Now coins.
- `slots.css:1` imported fonts from fonts.googleapis.com. Now local Nunito.
- `index.html:5` pinch zoom was disabled. Removed.
- No keyboard support and a lever with no click handler (hidden under 600px). Fixed.
- `slots_audio.js:77` used a non-existent `exponentialDecayTo`. Audio rewritten, fails silently.
- The 480x850 scaler shrank the game to 73% at 390x844. The layout is now fluid.

### Changed
- Return to player is real and stated per mode (see INFO.md). It is the same in every theme.
- Money is whole coins. Start 1,000. Bets 10, 20, 50, 100, 250.
- Background music removed (autoplayed an mp3 of unknown origin).
- A few legacy theme symbols were swapped for kid-friendliness: money bag to gift (Classic Fruits, Ocean Adventure, Pirate's Gold, Wild West), pistol emoji to a scroll (Wild West), drinks to food (Samurai Spirit, Viking Legends, Wild West), skull to bone (Pirate's Gold). "Jurassic Jungle" is now "Dino Jungle". Theme keys are unchanged so old saves load.
- Storage key is now `fong.slots.v4`. The old `dadsSlotsSave` is migrated once.

### Removed
- `js/slots.js` (canvas, classes, template strings), `js/slots_audio.js`, the debug overlay, the "lines" selector, particle classes.

### Tested
- `node games/slots/tests/sim.js` (1,000,000 seeded rounds per mode): all modes within 1 point of target, no zero-pay win, no negative payout or balance.
- Playwright (Chromium) at 390x844 and 360x640, from http and from file://: every mode, 200 spins each, random bet changes, skip taps, manual and skipped bonuses. No console errors, no request failures, no stuck rounds, one round per tap, HUD always equal to the saved coins.
- Scenario checks: 6 input methods (mouse, Space, Enter, touch, lever click, lever drag), reload keeps coins/bet/theme/mode, zero balance and free refill, corrupt/negative/old saves, blocked storage, blocked audio, reduced-motion emulation, forced 3-scatter bonuses (pick and wheel) paying once, contact sheet of all 54 themes.
- Not tested: Safari, Firefox, real phones or tablets, screen readers, actual sound output, long idle sessions.

### Known Issues
- Safari, Firefox and real devices not tested. See TODO.md.

## [3.1.0] and earlier
Canvas based slot machine, 30 themes in `themes.js`. See git history.
