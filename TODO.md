# F.O.N.G. Root Hub - Roadmap & Issues

## Roadmap (Prioritized)

### Priority 1 (Critical)
- [ ] Create `/js/hub-data.js` to parse `localStorage` and display the global play counter. (Claude task)

### Priority 2 (High)
- [ ] Implement algorithmic "Featured Game" rotation to replace the hardcoded Blackjack feature.
- [ ] Add category filter buttons (All | Arcade | Card | Puzzle | Edu) to the navigation bar.

### Priority 3 (Medium)
- [ ] Add an "Experimental / Development" toggle for advanced users to view Tier 2 games from the `GAME_INVENTORY.md`.

## Known Issues & Bugs
- **Missing Fonts:** If local `.woff2` files are not placed in `/assets/fonts/`, the hub will fall back to system sans-serif.

## Technical Debt
- Need to audit all 18 production game index files to ensure they share the same global navigation header to allow users to return to this hub easily.
