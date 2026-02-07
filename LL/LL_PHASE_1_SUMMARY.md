# Phase 1 Summary: Founding & Forging Overhaul

**Date:** 2026-02-05
**Y-Level:** Y=4 (C4)
**Contributors:** Jules (J) - Phase 1 Functional, Gemini (G) - Creative Review, Claude (C) - Phase 1.5 Visual Polish

---

## Phase 1: Functional Foundation (J)

Jules delivered the core functional overhaul:

### MD Reader 2.0
- **File Navigation:** Hardcoded `FILES[]` array (23 entries) with category grouping
- **Search:** Real-time sidebar filtering by file name/category
- **Infinite Scroll:** `marked.lexer()` token chunking (50 blocks at a time)
- **File Upload:** Drag-drop import with sessionStorage persistence
- **View Modes:** Parsed (marked.js rendering) vs Raw (plain text)
- **BBC Markup:** Basic `[b]`, `[i]`, `[url]`, `[code]`, `[quote]` to markdown conversion
- **Recent Files:** localStorage history (top 10)
- **Sidebar Toggle:** Desktop collapse + Mobile drawer with overlay
- **Open in New Tab:** Generates standalone HTML blob

### Project Renaming
- Rebranded from "Fong Family Arcade" to "Founding & Forging"
- Updated `index.html`, navigation, titles across all games

### Card Game Fixes
- Blackjack: Reset Deck vs Re-shuffle button split
- Blackjack: Automatic reshuffle at configurable threshold (default 20%)
- War: Endless mode with graveyard recycling (default on)

---

## Phase 1 Review: G's Creative Critique (G2 -> G3)

Gemini reviewed J's functional output and identified the following gaps:

### MD Reader Gaps
1. **No Format Switcher** - Only Parsed/Raw toggle. No ICQ or BBC-specific rendering. The BBC conversion runs silently with no user control.
2. **No Load Progress** - `fetch()` with no visual feedback. Large files jump from "Loading..." to fully rendered.
3. **No Scroll Tracer** - Zero scroll position awareness. Users don't know where they are in a document.

### Card Game Gaps
1. **Silent Reshuffles** - Blackjack's auto-reshuffle uses centered overlay (`_showMessage`), not a non-blocking notification. War's `_showAutoShuffleFireFlash` is a 250ms full-screen flash - too aggressive and too fast.
2. **Basic Settings Input** - Reshuffle threshold is a bare `<input type="number">` with no visual feedback on what the percentage means.

### G's Design Direction
- MD Reader should feel like a "Digital Archive" tool, not "Web 2.0"
- Card games need "Visibility of Luck" - users must see when RNG events (reshuffles) happen
- Non-blocking toast pills > centered modal overlays for system events

---

## Phase 1.5: Visual Polish (C4)

Claude implemented G's specs:

### MD Reader 3.0 Upgrades
1. **Format Switcher** - Dropdown in toolbar with 4 modes:
   - **MD:** Standard rendered Markdown (default)
   - **RAW:** Monospace unparsed text
   - **ICQ:** Retro styling (Verdana/Tahoma font, Navy Blue `#000080` headers, timestamps in brackets)
   - **BBC:** Forum-style theme (light grey bg, blue accents, styled blockquotes)

2. **Load Bar** - 3px progress line at top of viewport:
   - Uses `ReadableStream` reader for real progress when `content-length` is available
   - Falls back to indeterminate pulse animation when no content-length
   - Gold-to-blue gradient with glow effect
   - Fades out on completion

3. **Scroll Tracer** - Fixed HUD pill in bottom-right corner:
   - Shows `X% READ` based on scroll position
   - Appears on scroll, fades after 2s of inactivity
   - Monospace font, pill shape, backdrop blur

### Card Game Toast System
1. **Toast Pill** - Non-blocking notification:
   - Fixed top-right position
   - Semi-transparent dark bg with gold text and border
   - Slides in from right, auto-dismisses after 2.5s
   - Stacks vertically for multiple toasts

2. **Blackjack Integration:**
   - Auto-reshuffle now shows toast instead of centered overlay
   - Reshuffle threshold changed from `<input type="number">` to `<input type="range">` slider (10-50%, step 5%)
   - Live label updates as slider moves

3. **War Integration:**
   - Replaced `_showAutoShuffleFireFlash` (250ms full-screen flash) with toast pill
   - Same "Deck Reshuffled" message, non-blocking

### AGENTS.md Update
- Added **Y-Level Protocol** section
- Y increments per agent session, never resets
- Format: `[Agent][Y-Level]` (e.g., C1, G2, J3, C4)

---

## Architecture Notes for Phase 2

### Current Game Directory Structure (Pre-Restructure)
```
games/
  animal_stack/
  board/ (Chess, Checkers, Xiangqi)
  breakout/
  cards/ (Blackjack, War, Poker, Euchre)
  flow/
  pong/
  slots/
  snake/
  space_invaders/
  sprunki/
  tracing/
  xtc_ball/
```

### G's Proposed Taxonomy (Phase 2)
```
games/
  arcade/ (Snake, Breakout, Pong, Space Invaders)
  cards/ (Blackjack, War, Euchre - shared engine!)
  board/ (Xiangqi, Chess, Checkers)
  puzzle/ (Flow, etc.)
```

### Critical Phase 2 Considerations
1. **Shared Card Engine** - `games/cards/shared/` is referenced by relative paths from Blackjack, War, Poker, Euchre. Moving card games would break these.
2. **Index.html Navigation** - Root `index.html` has hardcoded paths to each game.
3. **MD Reader paths** - `projects/md-reader/app.js` `FILES[]` array uses relative paths like `../../games/`.
4. **INFO.md dependency locks** - Each game has pinned library versions.

---

## Handoff Notes

### For G (Next Session - G5):
- Review the ICQ and BBC visual modes - do they match your vision?
- The toast pill styling uses the site's gold accent. Want different colors per event type?
- Scroll tracer is minimal (pill shape). Want a full vertical bar on the right edge instead/additionally?

### For J (Next Session - J6):
- Phase 2 folder restructure is your domain (Architecture wins)
- Key risk: `games/cards/shared/` relative paths will break if card games move
- Suggest: Keep `cards/` as-is, only move arcade games into `games/arcade/`
- Update needed: root `index.html`, MD Reader `FILES[]`, any cross-references

### For Future Sessions:
- Y-Level is now at Y=4 (C4)
- Next session should be Y=5
- Read this file + `AI_FEEDBACK.md` for full context
