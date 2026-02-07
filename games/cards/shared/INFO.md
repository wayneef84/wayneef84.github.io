# Shared Card Engine - Library Info

**Type:** Library
**Version:** v1.0.0
**Directory:** `games/cards/shared/`
**Parent Project:** F.O.N.G.
**Created:** 2026-01-15
**Last Updated:** 2026-01-17

---

## Versioning Policy

This library follows [Semantic Versioning](https://semver.org/):

- **Patch (1.0.x)**: Bug fixes only. No API changes. Games can upgrade anytime.
- **Minor (1.x.0)**: New features, backwards compatible. Games upgrade when convenient.
- **Major (x.0.0)**: Breaking API changes. Games require migration plan.

---

## Current Version: v1.0.1

**Released:** 2026-01-17
**Status:** ✅ Stable

Minor documentation update.

---

## Changelog

### v1.0.1 (2026-01-17)
**Type:** Patch - Documentation Update

**Fixed:**
- Added version annotation to pile.js header comment
- Minor whitespace normalization in documentation

**Breaking Changes:** None

---

### v1.0.0 (2026-01-15)
**Type:** Major - Initial Release

**Modules Included:**
- `enums.js` - Suit and Rank enumerations
- `card.js` - Card data structure with UUID support
- `deck.js` - Deck templates and factory methods
- `pile.js` - Universal card container (stacks, hands, graveyards)
- `player.js` - Base player structure
- `engine.js` - State machine and game orchestration

**Core Features:**
- Safari-compatible ES5 code (no arrow functions, uses `var`)
- Card UUID tracking for animations
- Flexible Pile system (top/bottom card operations)
- Deck shuffling and reset capabilities
- State machine with GameState enum
- Terminal check gate (checkWinCondition)

---

## API Stability

| Module/API | Status | Notes |
|------------|--------|-------|
| `enums.js` | ✅ Stable | Suit, Rank, GameState enums locked |
| `card.js` | ✅ Stable | Card structure stable |
| `deck.js` | ✅ Stable | Deck templates and createFrom() stable |
| `pile.js` | ✅ Stable | All pile methods stable |
| `player.js` | ✅ Stable | Player/PlayerWithCurrency structures stable |
| `engine.js` | ⚠️ Experimental | May add features in minor versions |

**Legend:**
- ✅ **Stable**: API is locked, will not break in minor versions
- ⚠️ **Experimental**: API may gain features, but existing methods won't break

---

## Breaking Changes History

None yet (v1.0.0 is first stable release)

---

## Deprecations

None yet

---

## Scope

**What This Library Provides:**
- **Card Primitives**: Card, Deck, Pile data structures
- **Player Management**: Player objects with optional currency tracking
- **Game Engine**: State machine orchestration for turn-based card games
- **Safari Compatibility**: ES5-compatible code for older browsers

**What This Library Does NOT Provide:**
- Game-specific UI components (each game implements its own)
- Game-specific rules (handled by ruleset modules)
- Animation/rendering (games handle their own visuals)
- Network/multiplayer logic (out of scope for v1.x)

---

## Dependencies

| Library | Version | Notes |
|---------|---------|-------|
| None | - | This is a leaf library with no external dependencies |

---

## Module Details

### enums.js
**Purpose:** Constants for suits, ranks, and game states

**Exports:**
```javascript
Suit = { HEARTS, DIAMONDS, CLUBS, SPADES }
Rank = { ACE, KING, QUEEN, JACK, ... }
GameState = { IDLE, BETTING, DEALING, PLAYER_TURN, ... }
```

### card.js
**Purpose:** Card data structure

**Structure:**
```javascript
{
    suit: 'HEARTS',
    rank: 'KING',
    id: 'KH',
    deckId: 'standard',
    uuid: 'card_42'  // Unique per instance
}
```

### pile.js
**Purpose:** Container for cards (hands, decks, graveyards)

**Key Methods:**
- `createFrom(deck, copies)` - Factory from deck template
- `receive(card, position)` - Add card (0=top, -1=bottom)
- `give(position)` - Remove and return card
- `shuffle()` - Randomize order
- `reset()` - Restore from template
- `count` - Number of cards

### deck.js
**Purpose:** Pre-defined deck templates

**Templates:**
- `standardDeck` - 52 cards, French suits
- (Future: `pinochle`, `tarot`, etc.)

**Factory:**
- `Deck.createFrom(template, copies)` - Create N decks

### player.js
**Purpose:** Player objects

**Types:**
- `Player` - Basic (id, type, seat, hand)
- `PlayerWithCurrency` - Adds balance, currentBet

### engine.js
**Purpose:** State machine for turn-based card games

**Key Methods:**
- `initialize(ruleset, gameState)` - Set up game
- `transitionTo(newState)` - Change game state
- `checkWinCondition()` - Terminal check gate
- `getNextActor()` - Determine next player
- `resolveAction(actorId, action)` - Execute player action

---

## Known Issues

### Issue 1: Animation Preview Bug
**Severity:** Low (cosmetic only)
**Description:** Card briefly appears at destination before flying animation starts
**Status:** Documented in CLAUDE.md, fix deferred
**Workaround:** Hide landing pad before adding card to DOM

### Issue 2: Multi-Hand Support
**Severity:** None (future feature)
**Description:** Player has single `hand`, not `hands[]` array
**Status:** Planned for v2.0, requires breaking changes
**Workaround:** Current architecture works for single-hand games

---

## Future Enhancements (Roadmap)

### v1.1.0 (Minor - Hypothetical)
- Add `Pile.peek(position)` - Look at card without removing
- Add `Deck.stats()` - Get card count statistics
- Add `Player.clone()` - Deep copy for state management

### v2.0.0 (Major - Hypothetical)
- Change `Player.hand` → `Player.hands[]` (multi-hand support)
- Rename `Pile.give()` → `Pile.take()` (clearer API)
- Require `deckId` parameter in `Deck.createFrom()` (prevent mixing)

---

## For Library Maintainers

### Adding Features (Minor Version)
1. Add new methods without changing existing APIs
2. Update this file's Changelog
3. Bump version: v1.0.0 → v1.1.0
4. Update root `INFO.md` library registry
5. Games remain on v1.0.0 until manually upgraded

### Fixing Bugs (Patch Version)
1. Fix bug without changing public API
2. Update this file's Changelog
3. Bump version: v1.0.0 → v1.0.1
4. Update root `INFO.md` library registry
5. Games can upgrade immediately (no risk)

### Breaking Changes (Major Version)
1. Document ALL breaking changes
2. Create migration guide in `admin/migrations/`
3. Update this file's Changelog
4. Bump version: v1.x → v2.0.0
5. Update root `INFO.md` library registry
6. **DO NOT** update game dependencies automatically
7. Each game migrates individually with testing

---

## Activity Log

- **[2026-01-17]** docs: Created INFO.md, registered in federated architecture
- **[2026-01-16]** feat: Added Terminal Check Gate to engine.js
- **[2026-01-15]** feat: Initial v1.0.0 release - Core modules stable

---

## Games Using This Library

| Game | Version Used | Status | Notes |
|------|--------------|--------|-------|
| War | v1.0.0 | ✅ Working | Battle history feature complete |
| Blackjack | v1.0.0 | ✅ Working | Reset deck feature complete |

---

## Related Documentation

- **Module Reference**: `games/cards/shared/CARD_ENGINE_GUIDE.md`
- **Root Registry**: `/INFO.md`
- **Upgrade Checklist**: `admin/UPGRADE_CHECKLIST.md`

---

**INFO Version:** v1.0
**Last Updated By:** Claude Sonnet 4.5
**Last Updated:** 2026-01-17 (v1.0.1 release)
