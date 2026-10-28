# Handoff for Jules (Creative Director / Design Lead)

**Time Budget**: 1-2 hours
**Goal**: Design & plan UX improvements for the hub and platform layer
**Current State**: Split hands feature complete, comprehensive platform plan ready for design input

---

## Your Role

You're the **Creative Director (Gemini/G)** for the F.O.N.G. Arcade family site. Your hour or two should focus on:

1. **Visual & UX Design** for the platform features
2. **Interaction patterns** that feel cohesive across the site
3. **Layout decisions** for new pages (stats dashboard, game modals)
4. **Accessibility & Polish** (dark mode, responsive, touch-friendly)
5. **Brand consistency** (colors, spacing, typography)

---

## What to Review First

### 1. Current Hub State (5 min read)
- **File**: `index.html` (144 lines, minimal but functional)
- **Current features**:
  - Header with logo + global play counter
  - Featured game section (rotates daily)
  - Category filters (All, Arcade, Card, Puzzle, Educational)
  - Game grid (19 games with cards)

- **Current CSS**:
  - `css/components/global.css` — Header, buttons, navigation
  - `css/components/card.css` — Game card grid and styling
  - Uses CSS variables for theming (dark mode ready)

### 2. Platform Improvement Plan (10 min read)
- **File**: `HUB_PLATFORM_PLAN.md` (257 lines, comprehensive)
- **Key sections**:
  - Phase 1: Game Discovery (detail modals, search, filters)
  - Phase 2: User Progression (stats dashboard, high scores)
  - Phase 3: Hub UX (card badges, recommendations, theme toggle)
  - Phase 4: Analytics (play tracking, trends)
  - Phase 5: Social & SEO

---

## Design Tasks for Your Hour

### Task 1: Game Detail Modal Design (20 min)

**What**: Design how the game detail modal should look/feel

**Requirements to consider**:
- Click a game card → modal pops up
- Show: full description, mechanics, difficulty, playtime, play count
- Include: "Play Now" button and close button
- Mobile-responsive (full viewport on small screens)
- Should feel premium but lightweight

**Design questions to answer**:
- [ ] Modal width/height on desktop? (fixed, max-width?)
- [ ] Overlay darkness/blur? (dark, semi-transparent, or subtle?)
- [ ] Button layout? (stacked on mobile, side-by-side on desktop?)
- [ ] Typography sizes for title vs description?
- [ ] Color accents? (use existing accent colors or new palette?)
- [ ] Animation in/out? (fade, slide, scale?)
- [ ] Close button position? (top-right, bottom, overlay close?)

**Deliverable**: Sketch/wireframe or detailed CSS specs

### Task 2: Stats Dashboard Layout (20 min)

**What**: Design `/stats.html` — a new page showing user progression

**Should display**:
- Total lifetime plays across all games
- Most played games (top 5 chart/cards)
- Recent games (last 10 games list)
- Win rates by category
- Play time trends (line graph or sparklines)

**Design questions to answer**:
- [ ] Main layout? (single column, two-column, dashboard cards?)
- [ ] Header style? (same as hub header, or distinctive?)
- [ ] How to show stats? (cards, charts, tables, mixed?)
- [ ] Sort/filter options on this page?
- [ ] Mobile layout (stack all cards?)
- [ ] Link in main nav or hidden menu?
- [ ] Color scheme? (same as hub, or themed per category?)

**Deliverable**: Page layout wireframe + component specs

### Task 3: Game Card Enhancement Design (15 min)

**What**: Enhance game cards with stat badges and quick info

**Current card shows**:
- Game title
- Version
- Category tag

**Add to card**:
- Play count badge (e.g., "1.2K plays")
- Personal stat (e.g., "Your best: 2100")
- Last played info (e.g., "Played 2 days ago")
- Favorite/star toggle

**Design questions**:
- [ ] Where do badges go? (top-left? bottom-right? overlay?)
- [ ] Badge design? (small circles, pills, minimal text?)
- [ ] Star/favorite appearance? (outline, filled, animation?)
- [ ] Do stats hide until played, or show placeholder?
- [ ] How visible should play count be? (prominent or subtle?)

**Deliverable**: Enhanced card mockup (sketch or updated HTML/CSS)

### Task 4: Theme Toggle & Accessibility (15 min)

**What**: Design light/dark mode toggle

**Current state**:
- Dark mode is default
- CSS variables ready for theme switching
- Need visual toggle in header

**Design questions**:
- [ ] Toggle style? (switch, button with icon, dropdown?)
- [ ] Where in header? (right side, left side, dedicated section?)
- [ ] Icons? (sun/moon, yin-yang, other?)
- [ ] Label or icon-only?
- [ ] Should animate transition between modes?
- [ ] Keyboard accessible? (should be!)
- [ ] Mobile responsive?

**Deliverable**: Toggle design + implementation notes

---

## Files You Should Look At

**Current Code** (to understand existing patterns):
- `index.html` — Structure and semantic markup
- `css/components/global.css` — Color variables, typography setup
- `css/components/card.css` — Grid and card styling

**Handoff Documentation**:
- `HUB_PLATFORM_PLAN.md` — Full feature list and phases
- `SESSION_SUMMARY_2.md` — Current progress summary

**Game Examples** (for reference):
- `games/cards/blackjack/index.html` — High-quality UI/UX (look at CSS for modal example)
- Blackjack has modals for settings, rules, insurance — good pattern to follow

---

## Output Format

For each design task, provide:

1. **Description** - What you're designing and why
2. **Visual spec** - Sketch, wireframe, or detailed CSS class/layout description
3. **Implementation notes** - How to code it with constraints (ES5, no build tools, mobile-first)
4. **Mobile considerations** - How it adapts to small screens
5. **Accessibility notes** - Keyboard nav, color contrast, touch targets

**Don't need to code it** — just design it clearly so the next Claude can implement.

---

## Technical Constraints (Keep in Mind)

- **ES5 only**: New code must use `var`, `function(){}`, no classes/arrows
- **No dependencies**: No npm packages, no CDN libraries, no frameworks
- **Mobile-first**: min-height 44px touch targets, safe-area support (iPhone X+ notch)
- **CSS variables**: Theming uses CSS custom properties (already set up)
- **Responsive design**: Works on 320px to 4K screens
- **Relative paths**: `./js/...` not `/js/...` (GitHub Pages /beta subdirectory)
- **localStorage only**: Track user data locally, no server sync

---

## Brand Context

**Color Palette** (from CSS):
- Primary accent: `#00E5FF` (cyan) — buttons, links
- Secondary accent: `#FF0055` (pink/magenta) — highlights
- Arcade: `#F59E0B` (amber)
- Card: `#10B981` (green)
- Puzzle: `#8B5CF6` (purple)
- Educational: `#3B82F6` (blue)
- Background: `#121212` (near-black)
- Surface: `#1E1E1E` (dark gray)

**Typography**:
- UI font: `Inter` (clean, modern)
- Mono font: `Space Mono` (for stats, code)

**Feel**: Modern, minimal, dark-mode-first, family-friendly, game-like

---

## Questions to Consider

Before you start designing, think about:

1. **What makes a great game discovery experience?** (What should players see when they land on the hub?)
2. **How should progression feel?** (Stats page as reward/motivation?)
3. **What's the "wow factor"** we want to add to the hub? (Beyond grid of cards)
4. **Mobile vs desktop experience** — any differences in priority?
5. **Seasonal themes?** (Holiday-themed featured games, etc?)

---

## Success Criteria

After 1-2 hours, we want:

✅ Clear design specs for game detail modal
✅ Stats dashboard layout planned
✅ Game card enhancements sketched
✅ Theme toggle design specified
✅ Notes on accessibility/mobile adaptation

**Then Claude #3 can implement** these designs in code.

---

## Next Steps (After You)

Once your designs are ready:
1. Claude #3 will implement Phase 1.2 + 1.1 (games catalog + game modal)
2. Claude #3 will implement Phase 2.2 (stats dashboard)
3. Claude #3 will implement Phase 3.1 + 3.3 (card badges + theme toggle)

Your designs are the foundation for all of it!

---

**Have fun designing. This is where the arcade comes to life!** 🎮✨
