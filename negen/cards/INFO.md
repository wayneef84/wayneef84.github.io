# NEGEN Card System - Library Info

**Type:** Core Module
**Version:** v1.0.0
**Directory:** `negen/cards/`
**Parent Project:** F.O.N.G. (NEGEN Engine)
**Created:** 2026-01-24
**Last Updated:** 2026-01-24

---

## Overview

The `negen/cards` module is the modern, ES6-based implementation of card game logic for the NEGEN Engine. It replaces the legacy `games/cards/shared/` system for future games.

**Status:**
- **Card Logic:** ✅ Stable (Card, Deck, Pile)
- **Evaluator:** ✅ Stable (Ported from shared/poker-evaluator.js)
- **Game Engine:** ✅ Stable (CardGame.js extends Scene)
- **Storage/Network:** 🚧 Planned (Not yet implemented)

---

## Versioning Policy

This library follows [Semantic Versioning](https://semver.org/).

## Current Version: v1.0.0

**Released:** 2026-01-24
**Status:** ✅ Initial Release

---

## Module Details

### Card.js
**Purpose:** Base Card entity.
- Supports UUID for frontend tracking.
- Extends `Entity` (optionally) for visual rendering.

### Deck.js
**Purpose:** Deck Factory.
- `Deck.create(n)`: Creates N decks of 52 cards.
- `Deck.shuffle(array)`: Static Fisher-Yates shuffle.

### Pile.js
**Purpose:** Universal Card Container.
- Manages collections (Draw Pile, Discard, Hand).
- Supports `give/receive` mechanics.

### Evaluator.js
**Purpose:** Hand Evaluation.
- Ported from `poker-evaluator.js`.
- Supports standard 5-card Poker rankings.

### CardGame.js
**Purpose:** Base Scene for Card Games.
- Extends `negen/core/Scene.js`.
- Manages standard game loop, state, and event emission (`DEAL`, `SHUFFLE`, `SHOWDOWN`).

---

## Migration Guide

To migrate a game from `games/cards/shared/` to `negen/cards/`:
1. Import `Card`, `Deck`, `Pile` from `negen/cards/`.
2. Extend `CardGame` instead of using the legacy `engine.js` state machine.
3. Use `negen/core/Engine` for the main loop.
4. Legacy `CardAssets` can still be used for rendering until `negen/assets` is fully capable.

---

## Roadmap

- [ ] **Storage Manager**: Persist deck state and player balances (In Progress).
- [ ] **Network Manager**: Multiplayer support (In Progress).
- [ ] **Asset Manager**: Dynamic SVG loading for card faces.

---

**Author:** Jules
**Last Updated:** 2026-01-24
