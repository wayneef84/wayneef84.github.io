# F.O.N.G. Repository Revamp: Master LLM Strategy
**Date Created:** 2026-02-15
**Status:** Draft for Multi-Agent Alignment
**Audience:** Claude (C), Gemini (G), Jules (J)

---

## EXECUTIVE SUMMARY

The F.O.N.G. repository is **mature and well-structured** but needs **strategic direction** to maximize impact. This document outlines a unified vision across all three LLM agents to:

1. **Consolidate** the existing 28+ games and 15+ utility projects into a cohesive platform
2. **Modernize** the user experience and navigation
3. **Establish** clear priorities for new feature development
4. **Optimize** the development workflow to reduce handoff friction
5. **Plan** a phased rollout strategy (3-6 months)

---

## ⚠️ GROUND RULES CONSTRAINT ALIGNMENT

**Foundational Context:** This strategy must operate **within** the 9 immutable ground rules defined in [`GROUND_RULES.md`](GROUND_RULES.md). Every pillar, initiative, and deliverable must respect these constraints.

### How Each Pillar Aligns With Ground Rules

| Pillar | Ground Rule | Constraint |
|--------|-------------|-----------|
| **Platform Coherence** | Rule 4 (Relative Paths), Rule 9 (Mobile-First) | All navigation links must use relative paths; CSS must be mobile-first, 44px touch targets |
| **Portfolio Rationalization** | Rule 2 (ES5 Syntax), Rule 7 (Docs-First) | All new code must be ES5 only; ARCHITECTURE.md must be updated for each game status change |
| **Engagement Layer** | Rule 1 (Local Assets), Rule 9 (F.O.N.G. Branding) | Play counters must use localStorage (local), not external APIs; display "F.O.N.G." consistently |
| **Dev Velocity** | Rule 5 (Dev Branch), Rule 7 (Docs-First) | All work on `dev`, never `main`; handoff templates must reference GROUND_RULES.md |
| **Strategic Roadmap** | Rule 6 (Federated Deps), Rule 8 (License Compliance) | No auto-upgrades of libraries; all new dependencies logged in LICENSE_AUDIT.md |

### Translation: What This Means for Each Pillar

**Pillar 1 (Platform Coherence) Examples:**
- ✅ Global nav component uses relative paths: `<a href="../../games/cards/war/">War</a>`
- ❌ NOT: `<a href="/games/cards/war/">War</a>`
- ✅ Mobile-first CSS: Start with 1-column grid, expand with `@min-width` media queries
- ✅ All buttons/links: min 44px touch targets

**Pillar 2 (Portfolio Rationalization) Examples:**
- ✅ When reclassifying games, update each game's ARCHITECTURE.md section
- ✅ New code rewrite (if needed) must be ES5 only
- ❌ NOT: `const gameStatus = "production"`
- ✅ Instead: `var gameStatus = "production"`

**Pillar 3 (Engagement Layer) Examples:**
- ✅ Play counter uses localStorage: `localStorage.setItem('f_play_count', count)`
- ❌ NOT: External API call to leaderboard service
- ✅ Display text: "F.O.N.G. Most Played" not "Fong Zone Top Games"

**Pillar 4 (Dev Velocity) Examples:**
- ✅ Feature branch: `feature/game-card-component` → PR to `dev`
- ✅ Handoff template references: "Ensure GROUND_RULES.md compliance per CHECKLIST.md"
- ❌ NOT: Direct push to `main`

**Pillar 5 (Strategic Roadmap) Examples:**
- ✅ Phase 2 deliverable: "Update `/INFO.md` and LICENSE_AUDIT.md for any new libraries"
- ❌ NOT: "Auto-upgrade shared library to latest version"

---

## PART 1: CURRENT STATE ASSESSMENT

### Strengths
✅ **Solid Technical Foundation**
- ES5-compatible, mobile-first codebase
- Federated architecture with versioned shared libraries
- Production-ready utilities (Shipment Tracker v1.2.0)
- Comprehensive documentation and AI collaboration protocols

✅ **Rich Content**
- 28+ games across 6 categories (educational, arcade, card, puzzle, theme, experimental)
- 15+ utility projects covering diverse use cases
- Multiple variants and difficulty levels

✅ **Professional Infrastructure**
- GitHub Pages deployment with dev/main branch workflow
- Version control with INFO.md registry
- License audit trail
- AI collaboration system with clear agent roles

### Gaps & Opportunities
⚠️ **Navigation & Discovery**
- Homepage (`index.html`) exists but may not effectively showcase all games
- Unclear how users discover new games or understand available projects
- No unified "hub" experience

⚠️ **User Experience**
- Mix of old (Flash legacy) and new games
- Inconsistent visual design language across projects
- Mobile optimization varies by game
- No clear progression or engagement system (except play counter in recent update)

⚠️ **Development Velocity**
- Many games in "experimental" or "planned" state
- Poker, Euchre, Big 2 incomplete in card game family
- NEGEN engine (phase 5) needs execution roadmap
- Handoff friction between agents on cross-cutting concerns

⚠️ **Monetization & Engagement**
- No clear monetization strategy
- No social features or leaderboards
- Single-player focus only
- No progression or achievement system

---

## PART 2: STRATEGIC PILLARS (LLM-ALIGNED)

### Pillar 1: Platform Coherence (Claude + Jules)
**Goal:** Make the site feel like one unified platform, not a collection of disparate apps.

**Initiatives:**
1. **Master Home Hub** (Gemini + Claude)
   - Redesign homepage to showcase:
     - Featured game(s) of the week
     - Category browsing (Games, Tools, Experiments)
     - Play counter and "Most Popular" stats
     - User progress/unlocks (if implementing progression)
   - Implement responsive card-based layout (Gemini)
   - Global navigation consistent across all projects

2. **Visual Identity System** (Gemini)
   - Define color palette, typography, button styles, icons
   - Apply to all games and utilities
   - Create CSS component library (`/css/components/`)
   - Document in `VISUAL_IDENTITY.md`

3. **Shared Navigation & Footer** (Gemini + Claude)
   - Global header with home link, category menu, settings
   - Global footer with links to all projects
   - Mobile-optimized hamburger menu
   - Breadcrumb navigation for deep linking

4. **Settings & User Preferences** (Claude + Jules)
   - Centralized user settings (audio, difficulty, theme, language)
   - Store in localStorage with sync framework
   - Document in project-specific CONFIG.md files

**Owner:** Claude (infrastructure) + Gemini (design) + Jules (git/refactor)
**Timeline:** Phase 1 (Weeks 1-3)
**Success Metrics:**
- Consistent navigation across 100% of games/projects
- <2 seconds load time from homepage to any game
- Mobile breakpoint tests pass for all games

---

### Pillar 2: Game Portfolio Rationalization (Claude + Jules)
**Goal:** Move all games into one of four clear states: **Production**, **Development**, **Archived**, or **Retired**.

**Current Inventory:**
- **Production (Tier 1):** War, Blackjack, Letter Tracing, Slots, XTC Ball, Jigsaw, Snake, Flow, etc. (14 games)
- **Development (Tier 2):** Poker family (5card, holdem, 13card), Euchre, Sprunki Mixer (8 games)
- **Experimental:** J, J_v1, Legacy variants (6 games)
- **Archive/Unknown State:** 15+ unclear

**Initiative:**
1. **Audit & Classify** (Claude + Jules)
   - Go through each game folder
   - Determine: Complete? Working? Playable? Tested on mobile?
   - Create `GAME_INVENTORY.md` with state matrix
   - Tag each in `INFO.md` with status indicator

2. **Set Completion Criteria** (Claude)
   - Define "Production Ready" checklist per category:
     - **Card Games:** Ruleset complete, Terminal Check Gate passed, Safari tested
     - **Arcade Games:** 30 seconds to playable, mobile touch optimized, score system
     - **Puzzle Games:** Solvable in <5 minutes, multiple difficulty levels
     - **Utilities:** Core feature complete, offline-capable, tested on 3+ devices
   - Document in `/admin/QUALITY_STANDARDS.md`

3. **Graduation Path** (Jules)
   - Identify games closest to production (e.g., Poker, Euchre)
   - Create focused task list for completion
   - Example: "Euchre Graduation Checklist" → Done when merged to main

**Owner:** Claude (standards) + Jules (auditing/refactoring)
**Timeline:** Phase 1 (Weeks 2-4)
**Success Metrics:**
- 100% of games classified with clear status
- 90%+ of "Production" tier games have passing quality checklist
- Reduced confusion about what's playable

---

### Pillar 3: Content & Engagement Layer (Gemini + Claude)
**Goal:** Make the platform feel alive with frequent updates and reasons to return.

**Initiatives:**
1. **Play Counter System** (Already started! ✅)
   - Extend existing play counter to track:
     - Total plays across all games
     - Leaderboard (most-played games, most-played variants)
     - Unlock achievements ("Play 5 different games", "100 total plays")
   - Store in localStorage + IndexedDB for persistence
   - Display on homepage and game cards

2. **Featured Game Rotation** (Gemini + Claude)
   - Weekly featured game highlighting
   - "Game of the Week" banner on homepage
   - Manually curated or rotate algorithmically
   - Update `FEATURED.md` with schedule

3. **Game Variants & Difficulty Levels** (Claude + Gemini)
   - Audit existing variants (e.g., Slots themes, Letter Tracing modes)
   - Ensure each game has 2+ difficulty or theme options
   - Document in each game's `INFO.md`

4. **Progressive Disclosure** (Gemini)
   - First-time user experience: Show 5 featured games
   - Returning user: Show all categories and progress stats
   - Allow "advanced user" mode to show all games at once

**Owner:** Gemini (design) + Claude (data persistence)
**Timeline:** Phase 2 (Weeks 4-7)
**Success Metrics:**
- Play counter tracking 100% of games
- 2+ achievements unlocked by typical player
- Featured game changed weekly

---

### Pillar 4: Development Velocity & Workflow (Jules + Claude)
**Goal:** Reduce friction between agents and accelerate feature delivery.

**Initiatives:**
1. **Clear Handoff Protocol** (Jules)
   - Update `AGENTS.md` with specific handoff patterns:
     - Jules → Gemini: "Branch created, ready for HTML/CSS markup"
     - Gemini → Claude: "Visual complete, needs JS integration"
     - Claude → Jules: "Code complete, ready for testing/commit"
   - Reduce back-and-forth by clarifying "ready state" at each stage
   - Example template: `HANDOFF_TEMPLATE.md`

2. **Shared Component Library** (Gemini + Claude)
   - Create `/games/lib/components/` for reusable UI:
     - Button, card, modal, menu, score display, timer
     - Each component has `.css` + `.js` with documentation
     - Games import and customize, don't reinvent
   - Reduces design handoff friction

3. **Git Workflow Clarity** (Jules)
   - Document branch naming: `feature/[game]-[feature]`, `fix/[bug-id]`, etc.
   - Define commit message template (reference game, feature, priority)
   - Automated checks for code quality (pre-commit hooks for `eslint` on JS)
   - Example: `admin/GIT_WORKFLOW.md`

4. **Documentation-First for Major Features** (Claude)
   - ARCHITECTURE.md written BEFORE implementation
   - Get multi-agent buy-in on design before building
   - Reduce rework caused by misaligned visions
   - Example: `PLAN-[feature].md` approved before work starts

5. **Dependency Update Automation** (Jules)
   - Implement auto-check for `INFO.md` mismatches
   - Warn if a game declares a version that doesn't exist in registry
   - Script to bulk-upgrade all games to latest Shared library (with testing gates)

**Owner:** Jules (workflow) + Claude (documentation)
**Timeline:** Phase 1-2 (Ongoing)
**Success Metrics:**
- Zero handoff rework (first submission accepted)
- Feature branch merged within 2 weeks of creation
- All new features documented in ARCHITECTURE.md before implementation

---

### Pillar 5: Strategic Roadmap & Scope (Claude + Gemini)
**Goal:** Align all work on high-impact, high-visibility features.

**Next 3-6 Months:**

**Phase 1: Foundation (Weeks 1-4) - CURRENT**
- [ ] Audit & classify all games
- [ ] Design master homepage
- [ ] Establish visual identity system
- [ ] Clarify workflow & handoffs

**Phase 2: Coherence (Weeks 5-8)**
- [ ] Deploy new homepage with navigation
- [ ] Implement play counter & achievements
- [ ] Apply visual design to top 10 games
- [ ] Complete Poker core (Texas Hold'em playable)

**Phase 3: Engagement (Weeks 9-12)**
- [ ] Launch featured game system
- [ ] Add difficulty/variant selection UI
- [ ] Complete Euchre ruleset
- [ ] Implement progression/unlocks (optional)

**Phase 4: Polish (Weeks 13-16)**
- [ ] Extend visual design to ALL games
- [ ] Mobile testing across 50+ device types
- [ ] Performance optimization (page load, game boot)
- [ ] Accessibility audit (WCAG 2.1 AA)

**Phase 5: Expansion (Weeks 17+)**
- [ ] Add new game category (e.g., Multiplayer card games)
- [ ] Implement social features if monetization strategy approved
- [ ] Launch NEGEN engine (Phase 5 completion)
- [ ] Consider mobile app packaging (PWA or native)

**Owner:** Claude (strategy) + Gemini (prioritization)
**Timeline:** 6 months (Feb-Aug 2026)
**Success Metrics:**
- Homepage redesigned and deployed
- 90%+ of production games have consistent UI/UX
- Play counter active, tracking engagement
- No phase slips on critical path

---

## PART 3: DECISION MATRIX FOR AGENTS

### When to Handoff (Clarity on "Ready State")

| **Stage** | **Owner** | **Ready State** | **Next Owner** |
|-----------|-----------|-----------------|----------------|
| **Planning** | Claude | ARCHITECTURE.md written, reviewed by G+J | Gemini |
| **Visual Design** | Gemini | Mockups created, CSS scoped, no overlaps | Claude |
| **JS Integration** | Claude | Code written, linted, tested, no JS in HTML | Jules |
| **Testing & Commit** | Jules | Tests passing, commit message written, signed | Team |

### Escalation Path (If Stuck)
1. **Design Question During Code** (Claude) → Ask Gemini in `AI_FEEDBACK.md`
2. **Git Conflict During Merge** (Jules) → Ask Claude about intent in `CONTINUATION_NOTES.md`
3. **Scope Creep** (Anyone) → Escalate to user, update `ROADMAP.md`

---

## PART 4: SUCCESS CRITERIA (Aggregate)

### Quantitative Metrics
- **Engagement:** 3x increase in play counter diversity (players trying new games)
- **Speed:** 50% reduction in handoff rework cycles
- **Quality:** 0 critical bugs in "Production" tier games
- **Completeness:** 16+ games in Production, 8+ in Development, clear roadmap
- **Coverage:** 95%+ mobile breakpoint testing, <1s homepage load time

### Qualitative Metrics
- Site feels like a **unified platform**, not a collection of apps
- **New users** immediately understand what the site is and can pick a game in <10s
- **Returning users** see their progress and new content
- **Developers** can handoff work without explanation or rework
- **Documentation** is always ahead of code, not catching up

---

## PART 5: RESOURCES & DEPENDENCIES

### External Resources Needed
- None (using ES5 + vanilla JS, no new dependencies)

### Documentation to Create/Update
- `/GAME_INVENTORY.md` - Status matrix of all 28+ games
- `/admin/QUALITY_STANDARDS.md` - Production-ready checklist
- `/VISUAL_IDENTITY.md` - Design system (Gemini-owned)
- `/FEATURED.md` - Weekly featured game schedule
- `/admin/GIT_WORKFLOW.md` - Detailed branch/commit conventions
- `/admin/HANDOFF_TEMPLATE.md` - Ready-state checklist per stage
- Update `ONBOARDING.md` to include Phase 1 checklist

### Code to Create/Refactor
- `/css/components/` - Shared component library
- `/js/shared-nav.js` - Global navigation logic
- `/index.html` - Master homepage redesign
- Update all game `index.html` to include shared nav

---

## PART 6: NEXT STEPS (Immediate Actions)

### For Claude (Planning & Standards)
1. [ ] Read this document with Gemini & Jules
2. [ ] Conduct game inventory audit (create `GAME_INVENTORY.md`)
3. [ ] Define quality standards (create `/admin/QUALITY_STANDARDS.md`)
4. [ ] Document current handoff patterns (create `/admin/HANDOFF_TEMPLATE.md`)
5. [ ] Schedule multi-agent alignment meeting (async in `AI_FEEDBACK.md`)

### For Gemini (Visual Direction)
1. [ ] Create visual mockups for:
     - Master homepage (desktop + mobile)
     - Game card component
     - Global navigation bar
2. [ ] Define color palette, typography, icon library
3. [ ] Create `VISUAL_IDENTITY.md` with component examples
4. [ ] Review Shipment Tracker design for visual consistency

### For Jules (Infrastructure)
1. [ ] Review current branch workflow (`dev` → `main`)
2. [ ] Document git conventions in `/admin/GIT_WORKFLOW.md`
3. [ ] Set up pre-commit hooks for linting (optional but recommended)
4. [ ] Plan folder restructuring if needed (consolidate experimental games)

### For User (Strategic Approval)
1. [ ] Review this master strategy document
2. [ ] Approve phasing and timeline
3. [ ] Clarify any "must-have" vs "nice-to-have" priorities
4. [ ] Confirm monetization direction (affects roadmap)

---

## APPENDIX: LLM Agent Alignment Checklist

### Every Session (Mandatory)
- [ ] All agents read this Master Strategy document
- [ ] Claude reads CLAUDE.md
- [ ] Gemini reads GEMINI.md
- [ ] Jules reads JULES.md
- [ ] Each agent updates `AI_FEEDBACK.md` with progress & blockers

### Phase 1 Deliverables (Weeks 1-4)
- [ ] Game Inventory complete + shared
- [ ] Quality Standards documented + approved
- [ ] Visual Identity mockups + approved
- [ ] Handoff Templates documented + tested

### Handoff Gate Before Phase 2
- [ ] All Phase 1 deliverables merged to `dev`
- [ ] Gemini's visual system documented & ready to apply
- [ ] Claude's quality checklist ready for audit
- [ ] Jules' workflow optimizations tested on 1 game

---

## Document Versioning
- **v1.0** - Initial draft (2026-02-15)
- **v1.1** - Multi-agent review pass (TBD)
- **v1.2** - User approval & final strategy (TBD)

---

**Created by:** Claude (C), in collaboration with Gemini & Jules
**For:** F.O.N.G. Repository Revamp Initiative
**Status:** Ready for multi-agent alignment discussion
