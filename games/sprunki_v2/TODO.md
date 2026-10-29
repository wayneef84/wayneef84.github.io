# S4K Mixer v2: Roadmap

## Next
- [ ] Listen test of the Bubblegum Pop pack on a phone speaker, and let the young player pick the friends' names if she wants to rename them
- [ ] Optional: a Shift+- and Shift+= shortcut for tabs 11 and 12 (today only the arrows and a tap reach them)
- [ ] Listen test of the four new packs on a phone speaker (levels and distinctness)
- [ ] Optional: remember "All" as the start tab
- [ ] Optional: search or pack filter chips inside the All tab (101 friends is a long row)

## Future: singing monster game
Idea from Wayne: a "My Singing Monsters" style game, built later and separately. Collectible monsters, each with its own looping sound, placed on an island or stage.
- Reuse the pack and character data format (`id`, `type`, `art`, `synth`, theme, fx; documented in INFO.md). A monster is a character, an island theme is a pack.
- Reuse `js/synth.js` for looping sounds and `js/art.js` for drawing monsters (add more bodies and accessories).
- Reuse the tray, tap and drag placement, undo, and save and load (snapshot of placed ids and the tempo).
- Reuse the shared bar line and the stage tempo rule so every monster stays in time.
- New: collecting and unlocking (earn eggs or coins, a monster book), per-monster state saved in localStorage.
- New: a free-form island (x and y positions, scenery, several spots per monster type) instead of a fixed row of spots, and perhaps breeding or leveling.
