# War - Project Info

**Type:** Application (Card Game)
**Version:** v1.1.0
**Directory:** `games/cards/war/`
**Parent Project:** Fong Family Arcade
**Created:** 2026-01-12
**Last Updated:** 2026-01-17

---

## Dependencies

| Library | Version | Status | Notes |
|---------|---------|--------|-------|
| `games/cards/shared` | **v1.0.1** | ✅ Up-to-date | Card engine (stable) |

---

## Upgrade Notes

**Last Checked:** 2026-01-17
**Available Upgrades:** None
**Current Version Rationale:** Upgraded to v1.0.1 for documentation improvements.

### Upgrade History
- **2026-01-17:** Upgraded Shared v1.0.0 → v1.0.1 (patch - documentation update)
- **2026-01-17:** Initial registration - War on Shared v1.0.0

---

## Scope

Classic card game War where players flip cards simultaneously, highest card wins the round.

**Key Features:**
- **Endless Mode**: Cards recycle through graveyard (default)
- **Non-Endless Mode**: Game ends when one player wins all cards
- **Auto-Shuffle Toggle**: Click Win label to toggle shuffle mode on/off
- **Flash Messages**: Visual feedback for mode changes and reshuffles
- **Battle History**: Track every card flip in current and previous matches
- **Priority-Based Storage**: Current match always preserved, oldest matches pruned
- **Round Tracking**: Every flip increments round counter
- **Match History**: Saved match records with win/loss stats

**Game Modes:**
- Endless: Infinite play, cards recycle (default)
- Non-Endless: Match ends when deck depletes, winner gets +1 win

**UI Features:**
- Simplified score display: "You: X" / "Opp: Y"
- Infinity symbol (∞) for endless mode wins
- Tab-based history: "Current Match" | "Previous Matches"
- Settings modal with game configuration
- Reset deck button (preserves stats)

---

## Activity Log

**Recent Changes:**

- **[2026-01-17]** feat: Implemented battle history with priority-based round tracking
  - Tab UI for current/previous matches
  - 250 round threshold with automatic pruning
  - Shared card-utils.js for card rendering
  - localStorage persistence

- **[2026-01-17]** feat: Auto-Shuffle toggle and flash messages
  - Click Win label to toggle mode on/off
  - Flash modal for mode changes (250ms)
  - Flash modal for auto-shuffle firing (250ms)
  - Simplified score display

- **[2026-01-16]** fix: Auto-Shuffle mode fixes by Gemini
  - Default endless mode to true
  - Fix history display updates
  - Graveyard reshuffle logic working

- **[2026-01-15]** feat: Improve UI and enhance match history
  - Reset Game button moved to header (icon-only)
  - Match history with detailed data
  - Backward compatible with old format

- **[2026-01-12]** feat: Initial War game implementation
  - Basic flip mechanics
  - War scenarios (ties)
  - Shared deck tracking

---

## Context Boundaries

**What War Owns:**
- Game UI (cards, buttons, modals)
- War-specific rules (tie handling, war sequences)
- Battle history data structure and display
- Settings (endless mode, auto-shuffle)
- localStorage (`war_config`, `war_match_history`)

**What War Uses (Shared):**
- Card engine (Deck, Pile, Player)
- Card data structures
- CardUtils for rendering

**What War Does NOT Handle:**
- Card engine internals (delegates to shared)
- Generic animations (each game implements own)
- Multiplayer logic (future: may use shared engine)

---

## Known Issues

- [ ] War sequence tracking: Cards shown during war not yet tracked in battle history (Medium priority)
- [ ] Animation timing: Cards appear briefly at destination before flying (Low priority, cosmetic)

---

## Future Enhancements

- [ ] Track War sequences: Show 3 hidden + 1 flipped per player in history
- [ ] Nested war support: Handle triple/quadruple wars
- [ ] Animation improvements: Sequential card flips, click to fast-forward
- [ ] Auto-battle mode: 1s delay between flips
- [ ] Collapsible match entries: Expand/collapse individual matches in history
- [ ] Theme system: Multiple color schemes (deferred to shared theme system)

---

## For Sub-Project Claude

**Role:** Lead Developer for War card game
**Scope:** Work only within `games/cards/war/` directory

**On Startup:**
1. Read this INFO.md to understand current dependencies (Shared v1.0.0)
2. Check root `INFO.md` to see if Shared has newer version
3. If upgrade available, alert user before proceeding

**Dependency Protocol:**
- You are pinned to Shared v1.0.0
- Use only Shared APIs available in v1.0.0
- Do NOT use newer Shared features unless user upgrades this file
- If user wants newer feature: "That requires Shared vX.Y. Upgrade?"

**Testing Checklist After Changes:**
- [ ] Endless mode: Play 10 rounds, verify graveyard reshuffles
- [ ] Non-endless mode: Play full match until end
- [ ] Auto-Shuffle toggle: Click Win label, verify flash appears
- [ ] Battle history: Verify rounds appear in Current Match tab
- [ ] Settings modal: Verify options save to localStorage
- [ ] Reset deck: Verify stats preserved, new deck dealt

---

## File Structure

```
games/cards/war/
├── index.html          (Main UI + WarUI class)
├── ruleset.js          (WarRuleset - game logic)
└── INFO.md            (This file)
```

**Note:** War uses shared card-utils.js (`games/cards/shared/card-utils.js`) for card rendering.

---

## localStorage Keys

- `war_config` - Game settings (endless mode, deck count, twos high)
- `war_match_history` - Battle history (matches + rounds)

---

## Performance Notes

- Battle history pruning: Auto-prunes oldest matches when > 250 rounds
- Current match never pruned (even if > 250 rounds)
- Rendering optimized: Newest rounds first, lazy load previous matches

---

**INFO Version:** v1.0
**Last Updated By:** Claude Sonnet 4.5
**Last Updated:** 2026-01-17
