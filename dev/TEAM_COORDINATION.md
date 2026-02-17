# Team Coordination: Documentation Standardization (Phase 2)

**Status:** Ready for Team Handoff
**Created:** 2026-02-15
**Coordinator:** Claude (C) - Senior Developer & Documentation Lead
**Distribution:** Gemini (G), Jules (J), Claude (C)

---

## 📋 Overview

This document outlines the **Specialist Division of Labor** for Phase 2 of the F.O.N.G. documentation revamp. Each agent has a distinct role to maximize efficiency and quality across all 28 games and 15+ utility projects.

**Key Principle:** Parallel, specialized work — each agent focuses on their expertise area, not duplicating effort.

---

## 🎯 Phase 2 Scope

**Timeline:** Weeks 4-7 (estimated 50+ hours total effort)

**Deliverables:**
- All 18 Production tier games fully documented (7-file suite)
- Updated GAMES_DOCUMENTATION_AUDIT.md showing 100% completion
- All agents have added AGENT.md entries for their work
- Ready to move to Phase 3 (Development tier games)

---

## 🧑‍💼 Role Definitions & Responsibilities

### Gemini (G) - Creative Director
**Role:** README.md Author for All Games

#### What You Own
- **README.md** for all 28 games (both Production AND Development tiers)
- User-facing, non-technical documentation
- First impression of each game

#### Required Sections (per README_TEMPLATE.md)
```
# [Game Title]

## What is this?
- 1-2 sentence mission statement
- Who is this for? (kids, adults, family, etc.)
- What problem does it solve? (entertainment, education, brain training, etc.)

## How do I play/use it?
- Quick start (5-10 bullets)
- Basic controls/interactions
- Goal in 1-2 sentences

## Features
- List of game modes/variations
- Special abilities or power-ups
- Difficulty levels or customization options

## Status
- Production / Development / Experimental
- Browser compatibility
- Mobile-friendly? (yes/no)
- Known limitations for users

## Examples
- Screenshots or GIFs (if applicable)
```

#### Deliverables (Phase 2)
- [ ] README.md for Slots (3-5 KB)
- [ ] README.md for Tracing (3-5 KB)
- [ ] README.md for Sprunki (3-5 KB)
- [ ] README.md for Xiangqi (3-5 KB)
- [ ] README.md for Blackjack (3-5 KB)
- [ ] README.md for War (3-5 KB)
- [ ] README.md for Snake (3-5 KB)
- [ ] README.md for Flow (3-5 KB) ← *Update existing*
- [ ] README.md for 10+ other Production games
- [ ] Subtotal: ~18 READMEs × 3-5 KB each = 54-90 KB total

#### Quality Checklist
- [ ] All sections present (What/How/Features/Status)
- [ ] 3-5 KB per file (don't write too much or too little)
- [ ] User-friendly language (no jargon, no technical details)
- [ ] Status field clearly states Production/Development/Experimental
- [ ] No markdown syntax errors

#### When You're Done
1. Commit all READMEs in one PR with message:
   ```
   feat: Add user-facing README.md for all 18 Production games

   - Created README.md for 18 games (Slots, Tracing, Sprunki, Xiangqi, Blackjack, War, Snake, Flow, etc.)
   - Each file includes What/How/Features/Status sections
   - All files 3-5 KB, user-friendly language
   - Updated GAMES_DOCUMENTATION_AUDIT.md

   Refs: TEAM_COORDINATION.md (Gemini role)
   ```

2. Add AGENT.md entries to each game noting:
   - Date of work
   - What README sections you wrote
   - Any blockers or questions
   - Next steps for other agents

---

### Claude (C) - Senior Developer & Documentation Lead
**Role:** Technical Documentation for All Games

#### What You Own
- **ARCHITECTURE.md** for all 28 games (technical design)
- **INFO.md** for all 28 games (version, status, dependencies)
- **TODO.md** for all 28 games (roadmap, bugs, future)
- **CHANGELOG.md** for all 28 games (version history)
- **CLAUDE.md** for all 28 games (developer guidance)

#### Required Sections

**ARCHITECTURE.md (3-5 KB):**
```
## Overview
- High-level system design (2-3 sentences)
- Core game loop or interaction model
- Technology stack (HTML5, Canvas, etc.)

## File Structure
- List key files and their purpose
- Entry points (index.html, main.js, etc.)
- Asset organization

## Key Concepts
- Main game mechanics or systems
- State management approach
- Animation/rendering strategy
- Input handling

## Dependencies
- External libraries (with versions)
- Browser APIs used (Canvas, Web Audio, IndexedDB, etc.)
- Asset requirements

## Known Limitations
- Browser compatibility issues
- Performance constraints
- Accessibility gaps
- Mobile-specific issues
```

**INFO.md (1 KB):**
```
| Property | Value |
|----------|-------|
| **Version** | v1.0.0 |
| **Status** | Production |
| **Created** | 2024-01-15 |
| **Last Updated** | 2026-02-15 |
| **Dependencies** | card-engine v2.1.0, shared-ui v1.5.0 |
| **Browser Support** | ES5 (IE11+), iOS 10+, Android 5+ |
| **Accessibility** | WCAG 2.1 Level A |
| **Mobile** | Touch-optimized (min 44px targets) |

## Features
- Feature 1 description
- Feature 2 description
- Feature 3 description
```

**TODO.md (2-3 KB):**
```
## Roadmap (Priorities)

### P1 (Critical)
- [ ] Bug fix: Card animation flash (see CLAUDE.md)
- [ ] Feature: Split support for Blackjack

### P2 (High)
- [ ] Improve AI opponent
- [ ] Add difficulty levels

### P3 (Medium)
- [ ] Visual polish
- [ ] Sound effects

### P4 (Nice-to-have)
- [ ] Multiplayer support
- [ ] Seasonal themes

## Known Issues
- Card animation flash on deal (see ARCHITECTURE.md for workaround)
- Safari CSS compatibility (vendor prefixes needed)

## Performance Concerns
- Large hand rendering (100+ cards) is slow
- Animation frame drops on older devices

## Future Ideas
- Multi-hand support (split, side pots)
- Custom deck skins
- Stats tracking
```

**CHANGELOG.md (2-3 KB):**
```
## v1.0.5 (2026-02-15)
**Fixed:**
- Card animation flash before dealing
- Safari compatibility for CSS transforms

**Added:**
- CLAUDE.md developer notes

## v1.0.4 (2025-12-20)
**Changed:**
- Improved mobile touch responsiveness

**Fixed:**
- Insurance option not showing after dealer blackjack

## v1.0.3 (2025-11-10)
...
```

**CLAUDE.md (2-3 KB):**
```
## Purpose
Why does this game exist? Educational? Entertainment? Part of the F.O.N.G. collection?

## Architecture Summary
Brief overview (longer version in ARCHITECTURE.md):
- Core game loop
- State machine structure
- Key data structures
- Rendering approach

## Critical Fixes/Gotchas
⚠️ Things that broke before and shouldn't again:
- Terminal Check Gate: Always call ruleset.checkWinCondition() after EVERY action
- Bust Suppression: If player busts, getNextActor() MUST return null
- Animation Flash: Ensure tempSlot is visibility:hidden BEFORE animation
- ES5 Compatibility: NO const/let/arrow functions in shared code

## Last Session Notes (2026-02-15)
- Claude (C) created ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE.md
- All 5 files created from templates
- Testing: Verified file structure and content
- Next: Gemini creates README, Jules handles utilities ARCHITECTURE
```

#### Deliverables (Phase 2)
- [ ] ARCHITECTURE.md for all 18 Production games
- [ ] INFO.md for all 18 Production games
- [ ] TODO.md for all 18 Production games
- [ ] CHANGELOG.md for all 18 Production games
- [ ] CLAUDE.md for all 18 Production games
- [ ] Subtotal: 18 games × 5 files × 3-5 KB each = 270-450 KB total

#### Quality Checklist
- [ ] All required sections present in each file
- [ ] 3-5 KB per file (comprehensive but concise)
- [ ] ARCHITECTURE describes how the game works (not what it does)
- [ ] TODO priorities make sense (P1-P4)
- [ ] CLAUDE.md includes gotchas that shouldn't regress
- [ ] No absolute paths (all relative)
- [ ] No ES6+ syntax (ES5 only for maximum compatibility)

#### When You're Done
1. Commit all 5 files × 18 games in one PR with message:
   ```
   feat: Add technical documentation for all 18 Production games

   - Created ARCHITECTURE.md for 18 games (technical design)
   - Created INFO.md for 18 games (version, status, dependencies)
   - Created TODO.md for 18 games (roadmap, bugs, priorities)
   - Created CHANGELOG.md for 18 games (version history)
   - Created CLAUDE.md for 18 games (developer guidance)
   - Updated GAMES_DOCUMENTATION_AUDIT.md

   Refs: TEAM_COORDINATION.md (Claude role)
   ```

2. Add AGENT.md entries for each game documenting:
   - What technical docs were created
   - Key architectural decisions documented
   - Gotchas identified and documented
   - Testing/verification performed
   - Next steps for other agents

---

### Jules (J) - Lead Architect
**Role:** Technical Architecture for Utilities & Infrastructure

#### What You Own
- **ARCHITECTURE.md** for all utility projects
- Updated **INFO.md** if utility dependencies change
- Updated **TODO.md** if infrastructure improvements identified
- System-level design documentation

#### Utility Projects (Priority Order)

**EXISTING (Complete Architecture):**
- Shipment Tracker (v1.2.0) - Core utility
- Input A11y - Accessibility component
- Modals System - Shared UI component
- Card Engine (Shared) - Core game system
- Sprunki Audio System - Shared audio

**DEVELOP ARCHITECTURE FOR:**
- SVG Utilities (if used across games)
- Animation Helpers (if shared library)
- Theme System (if implementing dark mode)
- Analytics/Tracking (if adding)
- Testing Utilities (if shared test harness)

#### Required Sections (ARCHITECTURE.md)

```
## Overview
- What is this utility for?
- Which games/projects depend on it?
- Key design principles

## File Structure
- Directory layout
- Key modules and their purpose
- Entry points

## API Reference
- Public functions/exports
- Parameters and return values
- Example usage

## Data Structures
- Key schemas (if applicable)
- Database design (if applicable)
- Message/event formats

## Integration Points
- How other projects use this
- Dependency versions
- Version compatibility matrix

## Performance Considerations
- Benchmarks (if applicable)
- Optimization strategies
- Known bottlenecks

## Browser Compatibility
- ES5 compatibility status
- Required polyfills
- Browser version requirements
```

#### Deliverables (Phase 2)
- [ ] ARCHITECTURE.md for Shipment Tracker (update existing)
- [ ] ARCHITECTURE.md for Card Engine (create/update)
- [ ] ARCHITECTURE.md for Input A11y (create if missing)
- [ ] ARCHITECTURE.md for Modals System (create if missing)
- [ ] ARCHITECTURE.md for any other shared utilities
- [ ] Subtotal: 5-8 utilities × 3-5 KB each = 15-40 KB total

#### Quality Checklist
- [ ] All sections present
- [ ] API clearly documented
- [ ] Data structures explained
- [ ] Integration examples provided
- [ ] Performance considerations discussed
- [ ] Browser compatibility matrix included
- [ ] No absolute paths
- [ ] ES5 compatibility verified

#### When You're Done
1. Commit all utility ARCHITECTURE.md files in one PR with message:
   ```
   docs: Add/update ARCHITECTURE.md for all utility projects

   - Created/updated ARCHITECTURE.md for utilities (Shipment Tracker, Card Engine, Input A11y, Modals, etc.)
   - Documented API, data structures, integration points
   - Added performance considerations and browser compatibility
   - Updated UTILITIES_DOCUMENTATION_AUDIT.md

   Refs: TEAM_COORDINATION.md (Jules role)
   ```

2. Add AGENT.md entries for each utility noting:
   - What architecture was documented
   - API clarity improvements made
   - Integration examples provided
   - Testing/verification performed
   - Next steps for other agents

---

## ⚡ Coordination Protocol

### Before You Start
1. **Read the Standard:** Each agent reads `/DOCUMENTATION_STANDARD.md`
2. **Review Templates:** Each agent reviews their template file in `/admin/DOC_TEMPLATES/`
3. **Confirm Readiness:** Reply in this thread: "Ready for Phase 2 - [Your Role]"

### During Phase 2
1. **Parallel Work:** All agents work simultaneously on their assigned files
2. **Daily Sync (Optional):** Share blockers or questions in shared channel
3. **Cross-Review (Optional):** If you spot issues in other agent's work, note them (don't edit)

### After Each Game/Utility
1. **Test Your Work:** Verify file structure and content quality
2. **Update Audit:** Add row to GAMES_DOCUMENTATION_AUDIT.md or UTILITIES_DOCUMENTATION_AUDIT.md
3. **Add AGENT.md:** Include developer notes for next agent

### When Complete
1. **Open PR:** Submit all work in single PR (or 1 PR per agent)
2. **Reference:** Include "Refs: TEAM_COORDINATION.md (Phase 2)" in commit message
3. **Mark Audit:** Update GAMES_DOCUMENTATION_AUDIT.md to show completion percentage
4. **Notify:** Reply here when done for Phase 3 planning

---

## 📊 Status Tracking

### GAMES_DOCUMENTATION_AUDIT.md Columns
```
| Game | Tier | Status | README (G) | ARCH (C) | INFO (C) | TODO (C) | CHANGELOG (C) | CLAUDE (C) | AGENT (All) |
|------|------|--------|------------|----------|----------|----------|---------------|-----------|-----------|
| Slots | P | In Progress | 🟡 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
```

**Legend:**
- ✅ Complete (3-5 KB, all sections present)
- 🟡 In Progress (agent working on it)
- ⬜ Pending (not started)
- ❌ Blocked (note reason)

### UTILITIES_DOCUMENTATION_AUDIT.md Columns
```
| Utility | Status | ARCHITECTURE (J) | INFO (C) | TODO (C) | Updated |
|---------|--------|------------------|----------|----------|---------|
| Shipment Tracker | In Progress | 🟡 | ✅ | ✅ | 2026-02-15 |
```

---

## 🚫 Anti-Patterns to Avoid

**Don't Do This:**

❌ "I'll wait for Gemini to finish README before starting ARCHITECTURE"
- **Why:** Work is parallel, not sequential. Don't block each other.

❌ "I'll create all 28 READMEs in one file"
- **Why:** Each game MUST have its own README.md file. One file per game.

❌ "I'll write a 15 KB README"
- **Why:** Target is 3-5 KB. Concise > verbose. See template for examples.

❌ "I'll use const and arrow functions"
- **Why:** ES5 only. No const/let, arrow functions, ??, ?., etc. Check GROUND_RULES.md.

❌ "I'll add absolute paths like /css/style.css"
- **Why:** Relative paths only. Use css/style.css or ../css/style.css. See GROUND_RULES.md Rule 4.

❌ "I'll create docs, then send them separately to be committed"
- **Why:** Docs and code go in same commit. Requirement of Rule 10.

---

## 📞 Questions?

If you have questions about:
- **Documentation Standard:** See `/DOCUMENTATION_STANDARD.md`
- **Templates & Examples:** See `/admin/DOC_TEMPLATES/`
- **Ground Rules:** See `/GROUND_RULES.md`
- **Your Specific Role:** Reply in this thread or check your section above

---

## ✅ Sign-Off Checklist (Before Phase 2 Starts)

- [ ] **Gemini (G):** Confirm readiness, will create all README.md files for 28 games
- [ ] **Claude (C):** Confirm readiness, will create ARCHITECTURE, INFO, TODO, CHANGELOG, CLAUDE for all games
- [ ] **Jules (J):** Confirm readiness, will create/update ARCHITECTURE for all utilities
- [ ] **All:** Read DOCUMENTATION_STANDARD.md and reviewed templates
- [ ] **All:** Understood ground rules (ES5 syntax, relative paths, etc.)
- [ ] **All:** Will add AGENT.md entries after completing work

---

**Created by:** Claude (C)
**For:** F.O.N.G. Team Coordination
**Phase:** 2 (Production Games Documentation)
**Status:** Ready for Team Review & Sign-Off
