# Nightlite Choir+: notes for LLMs

Read [IP-GUARDRAILS.md](IP-GUARDRAILS.md) first and follow it. Then [DESIGN.md](DESIGN.md). Do not open the My Singing Monsters wiki. Do not reuse the S4K Classic pack. Code in `js/synth.js` and `js/art.js` was copied from `games/sprunki_v2` and is ours. Standalone folder, strict ES5, relative paths, all 7 docs kept current. PR into `dev`, never push to `dev` or `main`.

State (v0.1.0, Milestone 1): door screen plus the Night Garden. File layout is in [ARCHITECTURE.md](ARCHITECTURE.md). To add a creature: add an entry to `js/worlds/garden.js` (C pentatonic only, one job each), run the name check, log it in [ASSET_LOG.md](ASSET_LOG.md). Storage keys start with `nightlite.`. Keep peak volume gentle (master cap in app.js).
