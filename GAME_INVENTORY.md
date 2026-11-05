# F.O.N.G. Game Inventory
**Last reviewed:** 2026-11-04
**Source of truth for what the hubs show:** `js/catalog.js`. This file tracks status and quality per game. Update the row when you change a game.

---

## PRODUCTION TIER - Stable & Playable

**Count:** 24 games | **Quality:** 75-95% complete | **Status:** Ready for public play

| Game Name | Path | Category | Status | Completeness | Mobile Ready | Last Updated | Notes |
|-----------|------|----------|--------|--------------|--------------|--------------|-------|
| Blackjack | `/games/cards/blackjack/` | Card | Production | 95% | ✅ Yes | 2026-01-31 | v1.0.5-C: Core engine complete, insurance/double-down working, Safari tested |
| War | `/games/cards/war/` | Card | Production | 90% | ✅ Yes | 2026-01-17 | v1.1.0: Battle history, endless/non-endless modes, nested ties handled |
| 13 Card Poker | `/games/cards/poker/13card/` | Card | Production | 85% | ✅ Yes | 2026-11-01 | v2.0.1: Chinese Poker free-for-all (you plus 1 to 3 NPCs with faces), 3-5-5 rows, scoop and foul scoring, ante 1/2/5 coins, carried-over bankrolls, settlement panel. Uses shared `card-anim.js`. Polish (v2.1.0) in progress |
| Big 2 | `/games/cards/big2/` | Card | Production | 85% | ✅ Yes | 2026-11-01 | 2, 3 or 4 players, Who starts option (Lowest card or Last winner), 3- and 2-player deal rules, options saved in game saves |
| Slots | `/games/slots/` | Arcade | Production | 90% | ✅ Yes | 2026-10-29 | v4.1.1: 16 theme display names changed (ids and saves unchanged, picker search still finds old names). v4.1.0: 60 themes (6 new K's Picks), Sparkle Party Easter egg, parent-set cheers (`js/cheer.js`). v4.0.0: rebuild, play-money coins, 6 modes (3-reel, 5-reel lines, cascade, match groups, pick-a-prize, prize wheel), 54 themes, CSS 3D drums, free refill, calm mode, works from file:// Best scores saved per device (FongScores). |
| Letter Tracing | `/games/tracing/` | Educational | Production | 90% | ✅ Yes | 2026-02-10 | v5.1: A-B-C audio, voice speed control, 4 variants (letters/words/sentences/chinese) |
| Sprunki Mixer | `/games/sprunki/` | Arcade | Production | 85% | ✅ Yes | 2026-02-10 | Music mixer: 20+ characters, 2 packs, drag-and-drop, requires local server |
| S4K Mixer v2 | `/games/sprunki_v2/` | Arcade | Production | 80% | ✅ Yes | 2026-10-27 | v2.2.0: standalone rebuild, All tab, 11 packs (Classic, 4 seasons, Halloween, Aqua, Toxic, Robo, Candy, Bubblegum Pop), Shift+number tab shortcuts, Mr. Black spooky mode, touch UI, works from file:// |
| Memory Match | `/games/memory_match/` | Puzzle | Production | 95% | ✅ Yes | 2026-10-27 | v1.0.0 pairs game for young children: Easy 3x4, Normal 4x4, Big 4x5, Emoji and 14 original SVG animal sets, synthesized sound, remembered best, keyboard play, works from file:// Best scores saved per device (FongScores). |
| J Quiz | `/games/j/` | Educational | Production | 85% | ✅ Yes | 2026-02-15 | v4.x: 1000+ questions, 17+ packs, advanced settings, revamp mode |
| Sudoku | `/games/sudoku/` | Puzzle | Production | 90% | ✅ Yes | 2026-02-13 | Dual input, notes, undo/redo, customizable zoom, mobile-optimized |
| Minesweeper | `/games/minesweeper/` | Puzzle | Production | 85% | ✅ Yes | 2026-02-13 | Mini zoom, hold-to-flag, custom settings, F.O.N.G. integrated Best scores saved per device (FongScores). |
| Snake | `/games/snake/` | Arcade | Production | 90% | ✅ Yes | 2026-02-13 | Neon Serpent v1: Web Audio, negen_version variant exists Best scores saved per device (FongScores). |
| Mahjong | `/games/mahjong/` | Puzzle | Production | 85% | ✅ Yes | 2026-02-10 | 3D tiles, custom symbols, mobile touch controls |
| Jigsaw | `/games/jigsaw/` | Puzzle | Production | 90% | ✅ Yes | 2026-10-29 | v2.0.0: any picture, snapping groups, 6-300 pieces, little hands, zoom/pan, save/resume, puzzle files Best scores saved per device (FongScores). |
| Sky Breakers | `/games/sky_breakers/` | Arcade | Production | 80% | ✅ Yes | 2026-02-13 | Canvas-based shooter with smooth controls, difficulty levels Best scores saved per device (FongScores). |
| Pong | `/games/pong/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Pong: Classic two-player mechanics, responsive Best scores saved per device (FongScores). |
| Space Invaders | `/games/space_invaders/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Space Invaders: Grid-based shooter, score system Best scores saved per device (FongScores). |
| Breakout | `/games/breakout/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Breakout: Brick-breaker mechanics, level progression Best scores saved per device (FongScores). |
| Byte Runner | `/games/byte_runner/` | Arcade | Production | 85% | ✅ Yes | 2026-10-25 | v1.0.0: Self-playing platformer + live copy monitor (byte-runner.ps1), demo mode on the site |
| Byte Runner Quest | `/games/byte_runner_quest/` | Arcade | Production | 90% | ✅ Yes | 2026-10-25 | v1.0.0: 12 levels in 4 worlds, level select, 36 disks, Endless Run, saves; levels solver-verified Best scores saved per device (FongScores). |
| Board Games | `/games/board/` | Arcade | Production | 75% | ✅ Yes | 2026-02-10 | Board Games Arcade collection (Chess, Checkers) |
| Animal Stack | `/games/animal_stack/` | Arcade | Production | 75% | ✅ Yes | 2026-02-10 | Stacking gameplay, mobile touch controls |
| XTC Ball | `/games/xtc_ball/` | Puzzle | Production | 75% | ✅ Yes | 2026-02-10 | Magic 8-ball inspired, DOM/SVG rendering, synthesized sound |

---

## DEVELOPMENT TIER - In Progress/Playable but Incomplete

**Count:** 8 games | **Quality:** 50-75% complete | **Status:** Beta testing, ready for feature completion

| Game Name | Path | Category | Status | Completeness | Mobile Ready | Last Updated | Notes |
|-----------|------|----------|--------|--------------|--------------|--------------|-------|
| Poker (5-Card Draw) | `/games/cards/poker/5card/` | Card | Development | 60% | ✅ Yes | 2026-02-09 | Hand evaluation (poker-evaluator.js) implemented, game flow in progress |
| Poker (Texas Hold'em) | `/games/cards/poker/holdem/` | Card | Development | 20% | ⚠️ Unknown | 2026-02-08 | Stub only ("Coming Soon"), needs full implementation |
| Solitaire (Klondike) | `/games/cards/solitaire/` | Card | Development | 50% | ✅ Yes | 2026-02-15 | Uses shared card engine, basic structure in place, rules incomplete |
| Nightlite Choir+ | `/games/nightlite_choir/` | Arcade | Development | 60% | ✅ Yes | 2026-11-01 | v0.5.0: mixing pot takes 2 to 5 friends, rare shimmer friends, Discovery book with clues, saves in game saves. v0.4.0 Milestone 3: door screen (3 open doors), Night Garden, Toy Attic and Star Observatory with 4 original creatures each, free sparks, eggs and nest, Mixing pot, Discovery book, 6 blend creatures, world switcher, shared stage, C pentatonic synth loops, tap/drag, undo, save/load, works from file:// |
| Flow Games | `/games/flow/` | Puzzle | Development | 70% | ✅ Yes | 2026-02-10 | Multiple variants (Free/Bridge/Hex/Warp), engine architecture complete, UI polish needed |
| Fall Down | `/games/falldown/` | Arcade | Development | 75% | ✅ Yes | 2026-02-15 | Recently enhanced: boxed layout, levels, lives, powerups Best scores saved per device (FongScores). |
| PuzzLLer | `/games/puzzller/` | Puzzle | Development | 70% | ✅ Yes | 2026-02-13 | Mobile touch controls added, UI/controls improved, gameplay stable |
| Flash Classics | `/games/flash_classics/` | Arcade | Development | 50% | ✅ Yes | 2026-02-13 | Menu-only collection (Chopper, Defender, Runner stubs) - needs implementation |

---

## EXPERIMENTAL TIER - Test Versions/Variants/Legacy

**Count:** 2 games | **Quality:** <50% complete | **Status:** Legacy/research only, not for public release

| Game Name | Path | Category | Status | Completeness | Mobile Ready | Last Updated | Notes |
|-----------|------|----------|--------|--------------|--------------|--------------|-------|
| J Quiz v1 | `/games/j_v1/` | Educational | Experimental | 50% | ✅ Yes | 2026-02-13 | Legacy version of J Quiz pre-revamp - kept for reference |
| Snake (negen_version) | `/games/snake/negen_version/` | Arcade | Experimental | 70% | ✅ Yes | 2026-02-13 | Alternate variant of main Snake game - NEGEN engine prototype |

---

## CARDS INFRASTRUCTURE

**Shared Card Game Engine & Hubs**

| Component | Path | Status | Version | Notes |
|-----------|------|--------|---------|-------|
| Card Games Hub | `/games/cards/index.html` | Production | 1.0 | Central hub for all card games, URL routing, category browsing |
| Shared Engine | `/games/cards/shared/` | Production | 1.0.1 | `engine.js`, `card.js`, `pile.js`, `deck.js`, `player.js`, `card-assets.js`, `poker-evaluator.js`, `card-anim.js` (animations), `card-nav.js` (nav strip) |
| Euchre (Ruleset) | `/games/cards/euchre/` | Experimental | 0.1 | Ruleset definition exists but not playable (no UI) |
| Main Games Hub | `/index.html` | Production | 3.0 | Homepage with Settings, 7 skins, themes, installable app (PWA) |

---

## CLASSIFICATION CRITERIA

### Production Tier
**Requirements:**
- ✅ Fully playable (`index.html` exists, game loads)
- ✅ Core mechanics implemented & working
- ✅ Mobile-responsive tested
- ✅ Consistent with ES5 standards
- ✅ Info.md metadata exists (or well-documented)
- ✅ Updated within last 30 days OR stable for 90+ days

**Characteristics:**
- 75-95% feature complete
- No critical bugs reported
- Ready for public play
- Suitable for homepage showcase

### Development Tier
**Requirements:**
- ⚠️ Partially playable (core loops work)
- ⚠️ Major features in progress
- ⚠️ Mobile-responsive (mostly)
- ⚠️ Needs polish or feature completion
- ✅ Clear roadmap for completion
- ✅ Updated within last 60 days

**Characteristics:**
- 50-75% feature complete
- Known issues documented
- Suitable for beta/advanced user section
- Estimated 2-4 weeks to Production

### Experimental Tier
**Requirements:**
- ❌ Stub/prototype/legacy status
- ❌ <50% feature complete
- ❌ Not intended for public release
- ✅ Kept for reference or research
- ✅ Clearly marked as experimental

**Characteristics:**
- Archive of older versions or variants
- Research/prototype code
- Should be hidden from main homepage
- Consider archiving or deleting after 6 months
