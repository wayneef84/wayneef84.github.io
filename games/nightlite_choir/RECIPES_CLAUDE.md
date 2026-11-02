# Nightlite Choir+ recipe set: claude

Data: recipes-claude.js, global `window.NightliteBlendsExtra_CLAUDE`. Validator: validate-recipes.js (PASS, 0 fail, 0 warn).

## The 15

Ingredient ids are internal ids: hedgey = Shrublet, tocklet = Cogwick, mallowhorn = Fluffhorn.

| Name | Ingredients | Tier | Role | Clue | Look |
|---|---|---|---|---|---|
| Lilybop | mossle, puddlet (same world) | 1 | bloop bass | Pond friends make a bubbly low bloop. | Green drop with lily flower and leaf |
| Tintrot | clopsy, tocklet (same world) | 1 | march drum | Wooden and tin toys march together. | Tin-grey hobby horse, gold mane, wind-up key |
| Streakle | glintwand, twirltail (same world) | 1 | comet lead | A sparkly wand chases a comet. | Lilac comet, pink swirl tail, sparkles |
| Glowfluff | glimmow, mallowhorn | 1 | cuddle pad | Warm glow meets a fluffy dreamer. | Yellow-glow plush with antenna |
| Hushbush | hedgey, dozemoon | 1 | breeze texture | Sleepy moon naps in a leafy bush. | Blue-green bush in a nightcap, firefly |
| Yarnkite | skeinie, twirltail | 1 | kite voice | Yarn dolly rides a swirly tail. | Rag doll, blue braids, pink swirl tail |
| Nodlight | mossle, glimmow, dozemoon | 1 | night-light arpeggio | Sleepy things who glow in the dark. | Round green body, nightcap, firefly |
| Tootlepip | clopsy, skeinie, mallowhorn | 1 | toy piano | Toy box friends play a tiny tune. | Cream pony head, bow, gold horn, star cheek |
| Sprizzle | mossweave, puddlet, hedgey | 2 | rain shaker | Rainy puddles, mossy yarn and leafy rattles. | Leafy bush, raindrop sparkles, yarn patch |
| Warblestar | twirlwisp, glintwand, ringhum | 2 | whistle lead | Singing blend, shiny star, humming planet. | Pink star, planet ring, swirl tail |
| Patterpop | puddlet, ringhum, tocklet, hedgey | 1 | bubble beat | Splash, hum, tick and rustle make rain music. | Blue box body, bulb antenna, leaf |
| Bounceboom | trotleaf, tockmoon, dewglint, glimmow | 2 | kick drum | Hop, tick, drip and glow all stomp. | Green-tan wide body, gold cap, leaf |
| Cozynub | mossweave, halohum, dozemoon, mallowhorn | 2 | blanket bass | Cozy blankets, sleepy moon, soft cuddles. | Lilac round body, nightcap, pink scarf |
| Glimmerjig | glimmow, hedgey, skeinie, tocklet, glintwand | 1 | sparkle bells | Five shiny things twinkle and jiggle. | Pale gold star, sparkles, glow antenna |
| Jubilume | mossweave, halohum, dewglint, trotleaf, twirlwisp | 2 | big choir | Every colorful blend sings one big song. | Pink body, golden sun, sparkles |

Mix: 6/4/3/2. Two-ingredient pairs: 3 same-world (Garden, Attic, Observatory one each), 3 cross-world. 5 recipes use a blend (Sprizzle, Warblestar, Bounceboom, Cozynub, Jubilume), all existing blends, none of mine as an ingredient.

## Name checks (WebSearch standard, query form "<Name> character game toy cartoon")

| Name | Result |
|---|---|
| Lilybop | No hit. Nearby only: Babble Bop (Peacock show), Toy Story 5 LilyPad (Mattel). Kept. |
| Tintrot | No hit. Nearby: Trotro (French donkey cartoon), different word. Kept. |
| Streakle | No hit. Nearby: Streak (Transformers), Streaky (DC, My Little Pony). Kept. |
| Glowfluff | No hit. Nearby: Fluffie Stuffiez (MGA), GlowPuff (Gumroad asset). Kept. |
| Hushbush | No hit. Nearby: Hush Puppy (Shari Lewis puppet), Mush-Mush. Kept. |
| Yarnkite | No hit. Nearby: Yarny (Unravel), Yarnimals (PlayMonster). Kept. |
| Nodlight | No hit. Nearby: Noddy, Nood (Kidrobot). Kept. |
| Tootlepip | No hit. Nearby: Toot & Puddle, Tonies Pip. Kept, not close. |
| Sprizzle | No hit. Nearby: Sprunki (the search engine drifted), Sprinkle plush (Critical Role). Kept. |
| Warblestar | No hit. Nearby: Warrior Cats, Crystar. Kept. |
| Pitterpat | REPLACED. Close hit: Pitterpatch (Strawberry Shortcake dog), Pitter Patter Pets (Addo). |
| Patterpop | Replacement. No hit. Nearby: Popples, Patter Peacock (Enchantimals). Kept, different words. |
| Bounceboom | No hit. Nearby: Bounce (Nokia/Rovio ball game), Sonic Boom. Kept. |
| Snugbump | REPLACED. Close hit: SnuggleBumms (Playskool toys), Snug's House (show). |
| Cozynub | Replacement. No hit. Nearby: Cozys (Spin Master), Cozy Monster (Uglydoll). Kept. |
| Glimmerjig | No hit. Nearby: Glimmer (She-Ra), Glimmies, Lil' Gleemerz. Kept. |
| Jubilume | No hit. Nearby: Jubilee (X-Men), a different word. Kept. |

None of the searches touched Sprunki, My Singing Monsters, Pokemon, Disney, Nintendo, Sanrio, Hasbro or Sesame characters under these names. Quick search only, not legal clearance.

## Design reasoning

I optimized for a child being able to guess recipes from a theme (sleepy, rain, toys, shiny, cozy) and for the 15 sounding different when layered. Roles cover bass (three, with different timbres), drums (march wood, pop, kick), shaker, pad, arpeggio, leads (saw, square, whistle), voices (two), texture and bells. Every recipe set is checked so none is a subset of another, including the 6 existing blends, so the pot never has two valid matches. Trade-offs: I used only existing blends as second-level ingredients, which keeps the new set independent of itself but gives no chains of new blends. Bounceboom, Cozynub and Jubilume use many blends, so they are late-game rewards. Several names are compound words, which helps pronunciation but is a common style.

## Unsure about

- Clues for Patterpop and Bounceboom name the parents' traits, which makes them easy but a little close to spoilers of ingredients (not of the name).
- Hushbush uses the noise kind with no notes, so it is pentatonic by having none. It will be an unpitched wash.
- Cozynub bass notes (A1 to G2) are very low and may be inaudible on phone speakers.
- Art only uses existing generator names. The pink scarf and sun accessories are untested visually.
- The voice layers in Jubilume (kind layers with two voices) are untested in the app's renderer beyond reading synth.js.
