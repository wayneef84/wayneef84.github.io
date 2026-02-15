# [Game/Project Name] - Architecture

**Copy this file and fill in sections specific to your implementation**

---

## Overview

[Describe the high-level design philosophy in 2-3 sentences]

**Core Design Pattern:** [State machine / Event-driven / Procedural / etc.]

**Why This Design:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

---

## File Structure

```
[game]/
├── index.html           - HTML shell, DOM container, game viewport
├── js/
│   ├── game.js          - Main game loop and state management
│   ├── ruleset.js       - Game rules and mechanics (if card game, use shared engine)
│   ├── ui.js            - UI updates, button handlers, display logic
│   └── utils.js         - Utility functions, helpers, math
├── css/
│   ├── style.css        - Layout, mobile-first responsive design
│   ├── animations.css   - Game animations, transitions
│   └── theme.css        - Colors, theme variables (optional)
└── assets/
    ├── images/          - Game graphics, sprites, backgrounds
    ├── audio/           - Sound effects, music
    └── fonts/           - Custom fonts (local, no CDN per Rule 1)
```

**File Purposes:**
- **index.html:** Entry point. Contains game div, loads CSS/JS, sets up viewport meta tags for mobile
- **game.js:** [Specific role in your game]
- **ruleset.js:** [Specific role in your game]
- **ui.js:** [Specific role in your game]
- **utils.js:** [Utility functions used throughout]
- **style.css:** Mobile-first layout (1 column → expand), 44px+ touch targets, safe area support
- **animations.css:** Game-specific animations (if any)

---

## Key Concepts

### [Concept 1: State Machine / Game Loop / Physics Engine]
[Explain the primary system]

Example:
```
IDLE → DEALING → PLAYER_TURN → RESOLUTION → PAYOUT → GAME_OVER → IDLE
```

### [Concept 2: Main Objects]
[Explain core data structures]

Example:
```
Game State: { players: [...], deck: [...], current_player: 0 }
Player: { id, hand, score, bet }
Card: { suit, rank, uuid }
```

### [Concept 3: Rendering Strategy]
[How visuals are updated]

- [ ] DOM-based (manipulate HTML elements)
- [ ] Canvas-based (draw pixels)
- [ ] Hybrid (Canvas for game, DOM for UI)
- [ ] SVG (vector graphics)

---

## Dependencies

### Local Libraries
- **Shared Card Engine** (if card game): `v1.0.1` from `/games/cards/shared/`
  - Files used: `engine.js`, `deck.js`, `card.js`
  - Why: [Reason for using shared library]

### Browser APIs
- **Web Audio API:** For sound effects and music
- **Canvas API:** For [specific use case]
- **localStorage:** For persisting [what state]
- **Fetch API:** For [if needed]

### No External Dependencies
- ✅ Zero CDN usage (Rule 1 - Local Only Assets)
- ✅ ES5 syntax only (Rule 2 - Strict ES5)
- ✅ No build tools (Rule 3 - Zero Build Tools)
- ✅ Relative paths only (Rule 4 - Relative Paths)

---

## Performance Characteristics

**Load Time:**
- Initial: ~[X] seconds
- Bottleneck: [What takes longest]
- Optimization: [What was optimized]

**Memory Usage:**
- Baseline: ~[X] MB
- Peak (during gameplay): ~[X] MB
- Worst case: [What causes spike]

**CPU Usage:**
- Idle (menu): ~[X]% CPU
- Active (gameplay): ~[X]% CPU
- Optimization: [Techniques used]

**Mobile Optimization:**
- Touch targets: 44x44px minimum (Rule 9)
- Screen sizes: 320px - 2560px width tested
- Portrait/Landscape: Both supported
- Safe area: `env(safe-area-inset-bottom)` used for notch devices

---

## Browser Compatibility

**Tested & Verified:**
- ✅ Safari 9+ (iOS, macOS)
- ✅ Chrome 50+ (Android, Windows, Mac)
- ✅ Firefox 45+ (Windows, Mac, Linux)
- ✅ Edge 15+ (Windows)

**Fallbacks:**
- [Feature]: Falls back to [alternative]
- [Feature]: Falls back to [alternative]

**Known Incompatibilities:**
- [Incompatibility 1 and reason]
- [Incompatibility 2 and reason]

---

## Known Limitations

### Design Constraints
- [Limitation]: [Why it exists] [Future fix if any]
- [Limitation]: [Why it exists] [Future fix if any]

### Performance Constraints
- [Constraint]: [Reason] [When this matters]

### Feature Constraints
- [Constraint]: [Impact on gameplay] [Workaround if any]

---

## Testing Strategy

**How to Verify It Works:**

1. **Basic Functionality:**
   - [ ] Game loads in <2 seconds
   - [ ] [Primary mechanic] works as expected
   - [ ] [Secondary mechanic] works
   - [ ] Game ends correctly

2. **Mobile Testing:**
   - [ ] Touch controls work (44px+ targets)
   - [ ] Landscape and portrait both work
   - [ ] Safe areas respected (notch devices)
   - [ ] Performance acceptable on mid-range device

3. **Edge Cases:**
   - [ ] [Edge case 1] handled correctly
   - [ ] [Edge case 2] doesn't crash
   - [ ] [Edge case 3] produces expected result

4. **Performance:**
   - [ ] Load time <2 seconds
   - [ ] Maintain 60 FPS during gameplay (if animated)
   - [ ] Memory doesn't spike during extended play

---

## Future Improvements

**Architecture Debt:**
- [Technical debt 1 and why]
- [Technical debt 2 and why]

**Scalability Concerns:**
- [If multiplayer planned: how current design limits it]
- [If needs expansion: where bottlenecks will appear]

---

## Critical Code Paths

### Main Game Loop
Located in: `js/game.js` lines [XX-YY]
Purpose: Update game state every frame
Called by: `requestAnimationFrame` or `setInterval`

### Card Dealing Animation
Located in: `js/ui.js` lines [XX-YY]
Purpose: Animate cards from deck to hand
Notes: ⚠️ Must set `visibility: hidden` BEFORE DOM insert to avoid flash

### Win Condition Check
Located in: `js/ruleset.js` lines [XX-YY]
Purpose: Determine if game has ended
Notes: ⚠️ Must be called AFTER every card dealt, not just end-of-turn

---

## Related Documentation

- [README.md](README.md) - User guide
- [TODO.md](TODO.md) - Roadmap
- [CLAUDE.md](CLAUDE.md) - Developer gotchas
- [INFO.md](INFO.md) - Metadata & dependencies
- [Shared Library ARCHITECTURE](../cards/shared/ARCHITECTURE.md) - If using shared code

---

**Last Updated:** [Date]
**Reviewed By:** [Agent]
**Status:** [Draft / Final / Review Needed]
