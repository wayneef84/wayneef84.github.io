# Slots - Asset Log

## Art
- All symbols are standard Unicode emoji drawn by the player's device. No images are shipped.
- Theme names, flavour lines, wild and scatter names and palettes were written for this game.
- Mode and screen layouts are original CSS.

## Fonts
- Nunito Regular and Bold, `assets/fonts/` (SIL Open Font License, `Nunito-OFL.txt` is in that folder). Loaded with relative `@font-face`. No network.

## Sound
- All sound effects are synthesized in the browser (`js/sfx.js`). No files.
- `audio/*.mp3|wav` (9 files) come from v3 and have no recorded source. They are not referenced by v4. Recommendation: delete them or replace them with files whose license is recorded. Left in place because this change did not touch them.

## Name checks (quick searches, not legal clearance)
Done 2026-10-29 by one helper doing 1 or 2 web searches per name. It looked for existing slot titles, kids brands and characters. It did not search trademark registries.

| Name | Finding | What was done |
|---|---|---|
| Candy Shop | A slot and two match-3 games use it | Renamed to **Sugar Counter** |
| Ocean Reef | An existing slot uses it | Renamed to **Coral Cove** |
| Volcano Island | An existing slot uses it | Renamed to **Lava Lagoon** |
| Lantern Festival | Several slots use it | Renamed to **Paper Lantern Night** |
| Sky Pirates | A slot (unverified provider) and several games | Renamed to **Sky Buccaneers** |
| Dino Park | Not a slot, but a 2024 idle game and a board game | Renamed to **Dino Dig Park** |
| Treehouse Club | A kids toy-making app | Not used |
| Wishing Well (wild) | An existing slot | Not used (wild names are Rainbow Swirl, Honey Jar, etc.) |
| Sprinkle Star (wild) | Close to a cartoon element | Not used |
| Glow Bug, Cloud Chariot, Pocket Sun | Generic | Not used |
| Bakery Morning, Ice-Cream Truck, Pizza Night, Garden Bugs, Jungle Drums, Rainy-Day Puddles, Moon Garden, Fairy-Tale Castle, Music Box Melody, Circus Night, Robot Workshop, Space Picnic, Ice Rink, Pet Parade, Pajama Party, Farmyard Fun | Generic phrases. Similar themes exist elsewhere but no matching title was found. Pet Parade, Pajama Party, Robot Workshop and Garden Bugs had low-overlap hits only | Kept |

Also changed after review: the old theme "Jurassic Jungle" is now "Dino Jungle" (Jurassic is a film franchise name). Old theme names that stayed (Mystical Unicorn, Classic Fruits, Ocean Adventure, Space Explorer, Wild Animals, Delicious Treats, Precious Gems, Card Royale, Chess Masters, Monster Mayhem, Wolf Pack, Ancient Egypt, Music Beats, Sports Arena, Tech Gadgets, Wilderness Camp, Astrology Signs, Weather Forecast, Solar System, Emoji Faces, Pirate's Gold, Samurai Spirit, Viking Legends, Steampunk Rev, Wild West, Fairy Tale, Dragon's Lair, Robot Factory, Ninja Shadows) were NOT searched. They are generic but unchecked.

## K's Picks (v4.1.0)
Searched 2026-10-29. Quick searches, not legal clearance. Several short rounds of 1 or 2 web searches per name (existing slot titles, kids brands, toys, apps, cartoon and game characters, plus a look for overlap with Sprunki, My Singing Monsters, Moshi Monsters, K-pop Demon Hunters, Lily Lovebraids and Toy Story). Searches were thin and some search tools returned little. No trademark registry or app store was searched. Symbols are Unicode emoji or the original inline SVG round pals drawn in `js/themes.js` (function `pal`, a circle, a face and one small extra).

| Name | Finding | What was done |
|---|---|---|
| Unicorn Sparkle | No exact match. Other unicorn slots and a kids board game (Unicorn Glitterluck) exist | Kept (CAUTION, generic) |
| Bubblegum Band | No title found | Kept |
| Rainbow Cloud Stage | Nothing found | Kept |
| Pink Pony Ranch | No match (an old Linux racing game is called Pink Pony) | Kept |
| Glitter Garden | No exact title. A My Little Pony nursery playset is called Giggle Garden (loose echo) | Kept (CAUTION, generic phrase) |
| Dream Carousel | No exact title. A funfair slot called Carousel exists | Kept (CAUTION, generic) |
| Tinkle | A kids' comic of that name (unverified) | Not used |
| Boomba | Close to "Boom Buddies", a kids' music series | Not used |
| Plinky | A Moshi Monsters Tunies Moshling and close to My Singing Monsters' Plinkajou | Not used |
| Chimey | "Chimey Chums" kids music channel | Not used |
| Rumbly, Keysie | Generic, but near monster-name and kids music app neighbours (Keezy) | Not used |
| Boppo | A kids' music handheld tablet | Not used |
| Zizzy | A character in Roblox Piggy | Not used |
| Buzzle | An existing toddler puzzle app | Not used |
| Pink Gumball, Bubblegum Drop | A World of Warcraft item, and a gum-drop slot feature | Not used. Scatter is "Wrapped Sweet" |
| Strumble, Whoopa, Thrumby, Jinglet, Tavvy | Nothing found | Kept as pal names |
| Hummsy | Nothing found (thin search) | Kept (CAUTION, thin search) |
| Wrapped Sweet, Glitter Burst, Big Chorus, Daisy Chain, Ranch Ribbon, Stage Ticket | Nothing found or generic phrases | Kept |
| Pink Ribbon, Shooting Sparkle, Glitter Dew, Rainbow Arch, Dream Star, Surprise Gift | Generic phrases, not searched | Kept |

Symbol notes: the pal shapes are plain circles with eyes, a smile and one accessory. They were drawn for this game and do not copy any character. Pink Pony Ranch uses only generic ranch items (hay, carrot, boot, hat). A final visual and roster check of the six pals against Sprunki and My Singing Monsters is worth doing before wider promotion.

## Open questions
- Card Royale: "Royale" is common but was not checked against card-game brands.
- The 9 old audio files: who made them?

## v4.1.1 renames
Searched 2026-10-29. Quick searches, not legal clearance. One or two web searches per name (exact phrase plus game or slot). No trademark registry or app store was searched. Only display names changed. The `aka` field keeps the old name for search.

| Old name | New name | Finding | Result |
|---|---|---|---|
| Dragon's Lair | Cosy Dragon Cave | No exact match. Similar "Dragon Cave" adoptables site | Used |
| Robot Factory | Gizmo Garage | No exact match. Nearby: "Robo Buck's Garage" slot, "Gizmo" board game | Used |
| Pirate's Gold | Buried Treasure Bay | No exact match. Nearby: Merkur "Treasure Bay" slot | Used |
| Samurai Spirit | Blossom Blade (first pick) | CONFLICT: "Touhou: Blossom Blade" (2026 Switch and PC game) | Dropped |
| Samurai Spirit | Petal Dojo Days | No exact match. Only unrelated "Petal ..." titles. Checked Cherry Blossom Dojo (real aikido club) and Sakura Sword Dojo (close to Sakura Samurai: Art of the Sword) too | Used |
| Wolf Pack | Moonlit Howl | "A Moonlit Howl" is a tabletop adventure. Generic | Used |
| Wild Animals | Safari Day Out | No exact match | Used |
| Monster Mayhem | Goofy Ghost Gang | No exact match. Loose echo of Goof Troop | Used |
| Solar System | Planet Parade | Generic use: a science-centre event, an iOS app "Parade of the Planets", a board game "Planetary Parade" | Used |
| Classic Fruits | Cherry Bell Corner | "Cherry Bell" is a generic classic slot name (Mills, Bigpot Gaming). Exact phrase not found | Used |
| Music Beats | Loud Little Speaker | No game or brand hit | Used |
| Card Royale | Card Court | No exact match. A card game called "Court" exists | Used |
| Chess Masters | Checkmate Corner | No exact match | Used |
| Mystical Unicorn | Sparkle Meadow | No exact match. "Sparkle" marble-shooter series only | Used |
| Ancient Egypt | Sandy Scarab Tomb | No exact match | Used |
| Wilderness Camp | Campfire Trail | No exact match | Used |
| Viking Legends | Longship Tales | No exact match | Used |

The list above in "Old theme names that stayed" is now out of date for these 16 names.
