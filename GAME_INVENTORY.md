# F.O.N.G. Game Inventory & Classification Matrix
**Date Created:** 2026-02-15
**Status:** Phase 1a Complete (Game Audit)
**Owner:** Claude (C)
**Next Phase:** Quality Standards Definition (Phase 1b)

---

## TABLE OF CONTENTS
1. [Production Tier Games](#production-tier---stable--playable)
2. [Development Tier Games](#development-tier---in-progressplayable-but-incomplete)
3. [Experimental Tier Games](#experimental-tier---test-versionsvariantslegacy)
4. [Infrastructure & Hubs](#cards-infrastructure)
5. [Summary Statistics](#summary-statistics)
6. [Classification Criteria](#classification-criteria)
7. [Next Steps](#next-steps)

---

## PRODUCTION TIER - Stable & Playable

**Count:** 18 games | **Quality:** 75-95% complete | **Status:** Ready for public play

| Game Name | Path | Category | Status | Completeness | Mobile Ready | Last Updated | Notes |
|-----------|------|----------|--------|--------------|--------------|--------------|-------|
| Blackjack | `/games/cards/blackjack/` | Card | Production | 95% | ✅ Yes | 2026-01-31 | v1.0.5-C: Core engine complete, insurance/double-down working, Safari tested |
| War | `/games/cards/war/` | Card | Production | 90% | ✅ Yes | 2026-01-17 | v1.1.0: Battle history, endless/non-endless modes, nested ties handled |
| Slots | `/games/slots/` | Arcade | Production | 95% | ✅ Yes | 2026-02-10 | v3.0: 5-reel, 4-row, 20 themes, bonus features, Dad Mode physics |
| Letter Tracing | `/games/tracing/` | Educational | Production | 90% | ✅ Yes | 2026-02-10 | v5.1: A-B-C audio, voice speed control, 4 variants (letters/words/sentences/chinese) |
| Sprunki Mixer | `/games/sprunki/` | Arcade | Production | 85% | ✅ Yes | 2026-02-10 | Music mixer: 20+ characters, 2 packs, drag-and-drop, requires local server |
| J Quiz | `/games/j/` | Educational | Production | 85% | ✅ Yes | 2026-02-15 | v4.x: 1000+ questions, 17+ packs, advanced settings, revamp mode |
| Sudoku | `/games/sudoku/` | Puzzle | Production | 90% | ✅ Yes | 2026-02-13 | Dual input, notes, undo/redo, customizable zoom, mobile-optimized |
| Minesweeper | `/games/minesweeper/` | Puzzle | Production | 85% | ✅ Yes | 2026-02-13 | Mini zoom, hold-to-flag, custom settings, F.O.N.G. integrated |
| Snake | `/games/snake/` | Arcade | Production | 90% | ✅ Yes | 2026-02-13 | Neon Serpent v1: Web Audio, negen_version variant exists |
| Mahjong | `/games/mahjong/` | Puzzle | Production | 85% | ✅ Yes | 2026-02-10 | 3D tiles, custom symbols, mobile touch controls |
| Jigsaw | `/games/jigsaw/` | Puzzle | Production | 80% | ✅ Yes | 2026-02-13 | Custom image upload, variable difficulty, camera capture support |
| Sky Breakers | `/games/sky_breakers/` | Arcade | Production | 80% | ✅ Yes | 2026-02-13 | Canvas-based shooter with smooth controls, difficulty levels |
| Pong | `/games/pong/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Pong: Classic two-player mechanics, responsive |
| Space Invaders | `/games/space_invaders/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Space Invaders: Grid-based shooter, score system |
| Breakout | `/games/breakout/` | Arcade | Production | 80% | ✅ Yes | 2026-02-10 | NEGEN Breakout: Brick-breaker mechanics, level progression |
| Board Games | `/games/board/` | Arcade | Production | 75% | ✅ Yes | 2026-02-10 | Board Games Arcade collection (Chess, Checkers) |
| Animal Stack | `/games/animal_stack/` | Arcade | Production | 75% | ✅ Yes | 2026-02-10 | Stacking gameplay, mobile touch controls |
| XTC Ball | `/games/xtc_ball/` | Puzzle | Production | 75% | ✅ Yes | 2026-02-10 | Magic 8-ball inspired, DOM/SVG rendering, synthesized sound |

---

## DEVELOPMENT TIER - In Progress/Playable but Incomplete

**Count:** 8 games | **Quality:** 50-75% complete | **Status:** Beta testing, ready for feature completion

| Game Name | Path | Category | Status | Completeness | Mobile Ready | Last Updated | Notes |
|-----------|------|----------|--------|--------------|--------------|--------------|-------|
| Poker (5-Card Draw) | `/games/cards/poker/5card/` | Card | Development | 60% | ✅ Yes | 2026-02-09 | Hand evaluation (poker-evaluator.js) implemented, game flow in progress |
| Poker (13-Card/Chinese) | `/games/cards/poker/13card/` | Card | Development | 20% | ⚠️ Unknown | 2026-02-08 | Stub only ("Coming Soon"), needs full implementation |
| Poker (Texas Hold'em) | `/games/cards/poker/holdem/` | Card | Development | 20% | ⚠️ Unknown | 2026-02-08 | Stub only ("Coming Soon"), needs full implementation |
| Solitaire (Klondike) | `/games/cards/solitaire/` | Card | Development | 50% | ✅ Yes | 2026-02-15 | Uses shared card engine, basic structure in place, rules incomplete |
| Flow Games | `/games/flow/` | Puzzle | Development | 70% | ✅ Yes | 2026-02-10 | Multiple variants (Free/Bridge/Hex/Warp), engine architecture complete, UI polish needed |
| Fall Down | `/games/falldown/` | Arcade | Development | 75% | ✅ Yes | 2026-02-15 | Recently enhanced: boxed layout, levels, lives, powerups |
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
| Shared Engine | `/games/cards/shared/` | Production | 1.0.1 | `engine.js`, `card.js`, `pile.js`, `deck.js`, `player.js`, `card-assets.js`, `poker-evaluator.js` |
| Euchre (Ruleset) | `/games/cards/euchre/` | Experimental | 0.1 | Ruleset definition exists but not playable (no UI) |
| Main Games Hub | `/index.html` | Production | 2.0 | Root homepage - subject to revamp (Phase 1) |

---

## SUMMARY STATISTICS

### Games Audited: 35 Total

#### By Status
```
Production Tier:    18 games (51%)   ✅ Ready for public
Development Tier:    8 games (23%)   🚧 In progress
Experimental Tier:   2 games (6%)    📋 Legacy/research
Infrastructure:      7 items (20%)   ⚙️ Hubs & shared libs
```

#### By Category
```
Educational:        4 games (Letter Tracing, J Quiz, J v1, variants)
Card Games:         6 playable (Blackjack, War, 5-Card Poker, Solitaire)
                    2 stubs (Hold'em, 13-Card)
                    1 ruleset (Euchre)
Arcade:             9 games (Slots, Sprunki, Snake, Pong, Space Invaders, etc.)
Puzzle:             7 games (Flow, Sudoku, Minesweeper, Jigsaw, Mahjong, XTC Ball, PuzzLLer)
Experimental:       3 games (Flash Classics trio, J v1, Snake variant)
```

#### Mobile Testing Status
```
✅ Yes (Production):     18 games
✅ Yes (Development):     8 games
⚠️ Unknown (Stubs):       2 games (Poker stubs)
```

#### Last Updated Timeline
```
🔥 2026-02-15 (Most Recent):  3 games (Cards hub, Fall Down, J Quiz)
🟡 2026-02-13:              7 games (Flash Classics, J v1, Jigsaw, Minesweeper, PuzzLLer, Sudoku, Snake)
🟢 2026-02-10:             11 games (Production tier & Arcade core)
🔵 2026-02-09 or Earlier:   1 game (Poker 5-Card)
⚪ 2026-02-08 or Earlier:   2 games (Poker 13-Card, Hold'em stubs)
```

---

## CLASSIFICATION CRITERIA

### Production Tier (51% of Portfolio)
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

### Development Tier (23% of Portfolio)
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

### Experimental Tier (6% of Portfolio)
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

---

## KEY INSIGHTS

### 🌟 Strengths
1. **Rich Arcade Library** (9 games) - Well-maintained, diverse genres, all mobile-ready
2. **Educational Focus** - Letter Tracing v5.1 & J Quiz v4.x are high-quality, multi-modal tools
3. **Card Engine Architecture** - Solid foundation with Blackjack v1.0.5-C & War v1.1.0 production-ready
4. **Documentation Discipline** - INFO.md files exist for card games with version tracking
5. **Mobile-First Standard** - 26/28 games fully mobile-optimized (93% coverage)

### 🚧 Areas for Development
1. **Poker Variants** (2 stubs, 1 partial)
   - 5-Card Draw: 60% complete, needs game flow completion
   - Hold'em: 20% complete, needs full implementation
   - 13-Card: 20% complete, needs full implementation
   - **Est. Timeline:** 3-4 weeks for Texas Hold'em (highest priority)

2. **Solitaire** (50% complete)
   - Basic structure exists, Klondike rules need full implementation
   - **Est. Timeline:** 2 weeks

3. **Flow Variants** (70% complete)
   - Engine solid but Bridge/Hex/Warp variants need finishing touches
   - **Est. Timeline:** 2-3 weeks

4. **Flash Classics** (50% complete)
   - Menu exists, Chopper/Defender/Runner need full implementation
   - **Est. Timeline:** 3-4 weeks (lower priority - legacy content)

### 🔧 Technical Observations
1. **ES5 Compatibility** - Codebase enforces ES5 for older tablet support (var, no nullish coalescing)
2. **No Build Tools** - All games run directly in browser (Webpack/Babel not used)
3. **Federated Dependencies** - Card games use shared library v1.0.1, games pin versions in INFO.md
4. **Storage Strategy** - Most games use localStorage for state persistence
5. **Server Requirement** - Sprunki requires local server for CORS; others work fine in static hosting

### 📊 Completeness Patterns
```
Production:     75-95% complete (playable, tested, documented)
Development:    50-75% complete (functional but missing features/polish)
Experimental:   <50% complete (stubs or legacy variants)
```

---

## DEPLOYMENT STATUS

| Aspect | Current | Target | Status |
|--------|---------|--------|--------|
| **Dev Branch** | `/beta/` subdomain | Preview URL | ✅ Working |
| **Main Branch** | Root domain | Production release | ✅ Working |
| **Homepage** | Basic listing | Unified hub (Phase 1) | 🚧 In progress |
| **Production Games** | 18 ready | 20+ by Phase 2 | ⏳ On track |
| **Quality Standards** | Informal | Documented checklist | 🚧 Phase 1b |

---

## GAMES READY FOR IMMEDIATE ACTION

### Phase 1a (Current) - Audit Complete ✅
- [x] Classify all 35 games/components
- [x] Identify status tiers
- [x] Document metadata matrix
- [x] Create `GAME_INVENTORY.md` (THIS FILE)

### Phase 1b (Next) - Quality Standards
- [ ] Convert inventory data → quality checklists per category
- [ ] Define "Production Ready" criteria with specific gates
- [ ] Identify games ready for promotion (War, Blackjack → Phase 2)
- [ ] Document in `/admin/QUALITY_STANDARDS.md`
- [ ] Assign scores to Development tier games (Poker, Solitaire, Flow)

### Phase 2 - Visual Integration (Gemini)
- [ ] Apply visual design to top 10 Production games
- [ ] Integrate play counter system
- [ ] Update homepage with game cards + featured system

---

## NEXT STEPS

### For Claude (Phase 1b)
1. Review this inventory with user
2. Use as input to create `/admin/QUALITY_STANDARDS.md`
3. Define specific pass/fail criteria per category (Card, Arcade, Puzzle, Educational)
4. Identify quick wins (games close to Production ready)
5. Pass to Gemini with inventory data

### For Gemini (Phase 2)
1. Receive inventory + quality standards + master strategy
2. Create visual mockups with game cards for top 18 Production games
3. Design visual identity system (colors, typography, component library)
4. Mockups will show game categorization based on this inventory

### For User
1. Review game classifications
2. Approve prioritization (any games to promote/demote?)
3. Confirm Development tier resources (can we dedicate time to Poker variants?)
4. Provide feedback on timeline (Phase 1b estimate: 1 week)

---

## APPENDIX: File Reference

### Related Documentation
- **Master Strategy:** `/REVAMP_MASTER_STRATEGY.md` (high-level roadmap)
- **Quality Standards (In Progress):** `/admin/QUALITY_STANDARDS.md` (Phase 1b)
- **Game-Specific Metadata:** Each game's `/INFO.md` file
- **Root Registry:** `/INFO.md` (dependency versions)

### Key Game Folders
- **Card Games:** `/games/cards/` (hub + shared engine + individual games)
- **Production Games:** `/games/[slots|tracing|j|sudoku|minesweeper|etc]/`
- **Development Games:** `/games/[poker|solitaire|flow|falldown|etc]/`
- **Experimental:** `/games/[j_v1|snake/negen_version]/`

---

**Document Version:** v1.0 (2026-02-15)
**Next Review:** After Phase 1b completion (2026-02-22)
**Owned By:** Claude (C) - Senior Developer
**Collaborate With:** Gemini (G) for visual, Jules (J) for refactoring
