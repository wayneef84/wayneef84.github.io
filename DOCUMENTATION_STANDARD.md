# F.O.N.G. Documentation Standard

**Status:** FORMALIZED - All games/projects must comply
**Established:** 2026-02-15
**Owner:** Claude (C) - Senior Developer
**Enforcement:** Rule 10 in GROUND_RULES.md

---

## MANDATE

Every game, project, and utility in the F.O.N.G. repository **MUST** maintain **7 required documentation files**. These files form the contract between developers and the codebase. When code changes, corresponding documentation **MUST** be updated in the **SAME COMMIT**.

This standard ensures:
- ✅ Future developers (human or AI) can understand intent without reading code
- ✅ Architectural decisions are documented, not assumed
- ✅ Progress is tracked across sessions
- ✅ Critical fixes aren't lost to context churn
- ✅ New features are planned before implemented

---

## THE 7-FILE SUITE

Every game/project MUST have these files:

```
[game|project]/
├── README.md           (Required - 3-5 KB)
├── ARCHITECTURE.md     (Required - 3-5 KB)
├── INFO.md            (Required - 1 KB)
├── TODO.md            (Required - 2-3 KB)
├── CHANGELOG.md       (Required - 2-3 KB)
├── CLAUDE.md          (Required - 2-3 KB)
├── AGENT.md           (Required - 1-2 KB)
└── [Optional Specialized]
    ├── CONFIG.md      (Optional - for configurable games)
    ├── API.md         (Optional - if exposes APIs)
    ├── TESTING.md     (Optional - if complex testing)
    └── DEPLOYMENT.md  (Optional - if special deployment)
```

---

## FILE SPECIFICATIONS

### 1. README.md (User-Facing Overview)
**Purpose:** First thing users see. Answers: "What is this?"
**Size Target:** 3-5 KB
**Owner:** Primarily Gemini (G)

**Required Sections:**
```markdown
# [Game/Project Name]

## What is this?
- One-sentence hook
- Who should play/use this?
- Why does it exist?

## Quick Start
- How to play/use in 30 seconds
- Key controls/features
- Example (screenshot or description)

## Features
- Feature 1
- Feature 2
- Feature 3
(Bullet list)

## Status
- Production / Development / Experimental
- Version number
- Last updated date

## How to Play (Games Only)
- Objective
- Rules
- Controls/Touch targets
- Scoring system (if applicable)

## Getting Started (Utilities Only)
- Installation/setup
- Configuration
- First use walkthrough

## Troubleshooting
- Common issues
- Known limitations
- FAQ

## Links
- [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
- [TODO.md](TODO.md) - What's next
- [CHANGELOG.md](CHANGELOG.md) - History
```

---

### 2. ARCHITECTURE.md (Technical Design)
**Purpose:** How the system works internally
**Size Target:** 3-5 KB
**Owner:** Primarily Claude (C)

**Required Sections:**
```markdown
# [Game/Project Name] - Architecture

## Overview
- High-level design philosophy
- Core systems/patterns used
- Why designed this way

## File Structure
- What each file does
- Organization rationale
- Directory layout

```
[game]/
├── index.html       - UI shell, game container
├── js/
│   ├── game.js      - Main game logic
│   ├── ruleset.js   - Game rules/mechanics
│   └── utils.js     - Shared utilities
├── css/
│   ├── style.css    - UI styles, mobile-first
│   └── animations.css - Game animations
└── assets/
    ├── images/      - Game graphics
    └── audio/       - Sounds/music
```

## Key Concepts
- State machine / flow (if applicable)
- Main objects/entities
- Core algorithms
- Rendering approach (Canvas/DOM/Hybrid)

## Dependencies
- Shared libraries (with versions from INFO.md)
- External APIs (if any)
- Browser APIs used

## Performance Characteristics
- Typical load time
- Memory usage
- CPU usage under load
- Mobile optimization notes

## Browser Compatibility
- Minimum versions supported
- Known incompatibilities
- Fallbacks used

## Known Limitations
- What doesn't work
- Why it's limited
- Future improvements needed

## Testing Strategy
- How to verify it works
- Edge cases to test
- Performance testing (if applicable)
```

---

### 3. INFO.md (Metadata & Dependencies)
**Purpose:** Quick facts about the game/project
**Size Target:** 1 KB
**Owner:** Claude (C)

**Required Content:**
```markdown
# [Game/Project Name] - Info

## Metadata
- **Version:** 1.0.0 (semver format)
- **Status:** Production / Development / Experimental
- **Created:** 2026-02-15
- **Last Updated:** 2026-02-15
- **Author(s):** Wayne (User), Claude (C), Gemini (G), Jules (J)

## Description
One-line summary of what this is

## Features
- Feature 1
- Feature 2
- Feature 3

## Dependencies
- Shared Card Engine: v1.0.1
- Web Audio API: Native browser
- localStorage: Native browser
- (No external CDNs - local-only per Rule 1)

## Configuration
- Runtime options (if any)
- Default settings
- Customization points

## Compatibility
- Minimum browser: Safari 9, Chrome 50, Firefox 45
- Tested on: iOS, Android, Windows, Mac
- Known issues: None currently

## Related Files
- [README.md](README.md) - User guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical design
- [TODO.md](TODO.md) - Roadmap
- [CHANGELOG.md](CHANGELOG.md) - History
```

---

### 4. TODO.md (Roadmap & Issues)
**Purpose:** What's next, what's broken
**Size Target:** 2-3 KB
**Owner:** All agents (discovered during work)

**Required Sections:**
```markdown
# [Game/Project Name] - Roadmap & Issues

## Roadmap (Prioritized)
### Priority 1 (Critical)
- [ ] Feature/fix description
- [ ] Another critical item

### Priority 2 (High)
- [ ] Feature description
- [ ] Another high-priority item

### Priority 3 (Medium)
- [ ] Nice-to-have feature

### Priority 4 (Low)
- [ ] Future idea

## Known Issues & Bugs
- **Issue 1:** Description, workaround (if any)
- **Issue 2:** Description, impact, potential fix

## Performance Concerns
- Loading time (if slow)
- Memory usage (if high)
- Mobile optimization needs

## Technical Debt
- Code that needs refactoring
- Optimization opportunities
- Accessibility improvements needed

## Future Ideas
- Potential new modes
- Multiplayer possibilities
- Cross-game features
- Integration opportunities

## Testing Gaps
- What needs testing
- Platforms not tested
- Edge cases not covered
```

---

### 5. CHANGELOG.md (Version History)
**Purpose:** What changed and when
**Size Target:** 2-3 KB
**Owner:** Claude (C)

**Required Format (Reverse Chronological):**
```markdown
# [Game/Project Name] - Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-15
### Added
- New feature description
- Another new capability

### Fixed
- Bug that was fixed
- Performance improvement

### Changed
- Breaking change (if any) - HIGHLIGHT
- Behavior modification

### Removed
- Deprecated feature

## [1.0.0] - 2026-02-01
### Added
- Initial release
- Core features
- Documentation

---

## Format Notes
- Follow semver (MAJOR.MINOR.PATCH)
- Use ISO date format (YYYY-MM-DD)
- Highlight breaking changes with ⚠️
- Keep entries brief but descriptive
- One version per section
```

---

### 6. CLAUDE.md (Developer Guidance)
**Purpose:** Notes for the next developer (AI or human)
**Size Target:** 2-3 KB
**Owner:** All agents (collective knowledge)

**Required Sections:**
```markdown
# [Game/Project Name] - Developer Notes

## Purpose & Philosophy
- Why this game/project exists
- Design philosophy
- Core value to the family

## Architecture Summary
- Main components (link to ARCHITECTURE.md for details)
- Key design patterns
- Critical systems

## Critical Fixes / Gotchas
- ⚠️ Bugs that must not regress
- ⚠️ Common mistakes
- ⚠️ Performance traps
- ⚠️ Mobile-specific issues

Example:
- ⚠️ **Animation Flash:** Cards appear at destination before flying. Fix: Set `visibility: hidden` BEFORE DOM insertion.
- ⚠️ **Terminal Check:** Always check win condition AFTER each card dealt, not just end-of-turn.

## Last Session Notes
- What was worked on most recently
- Current blockers (if any)
- Next logical step to take
- Context for the next developer

Example:
```
**Session 2026-02-15 (Claude)**
- Fixed animation timing bug in card dealing
- Updated ruleset for insurance handling
- Next: Implement split hand support (requires multi-hand refactor)
- Blocker: Need to clarify UI layout for multiple hands
```

## Key Resources
- Link to shared library (if used)
- Link to design system
- Link to testing procedures
- External references (if applicable)

## Testing Checklist
- What to test before committing
- Edge cases to verify
- Mobile devices to test on
- Performance baselines to check
```

---

### 7. AGENT.md (Handoff Notes)
**Purpose:** Development journal for the next agent
**Size Target:** 1-2 KB
**Owner:** All agents (collective, updated every session)

**Required Content:**
```markdown
# [Game/Project Name] - Agent Session Log

## Most Recent Session (Top Entry)

**Date:** 2026-02-15
**Agent:** Claude (C) - Senior Developer
**Duration:** 2 hours
**Commits:** 3

### What Was Done
- Completed [feature/fix description]
- Fixed [bug description]
- Updated [documentation files]

### How It Works (For Next Agent)
- System now does X because of code change Y
- Side effects: Z might be affected
- Related code: See [filename] at line [#]

### Blockers / Questions
- Issue that needs resolution
- Question for user clarification
- Design decision pending

### Success Criteria Met
- [ ] Feature complete and tested
- [ ] Code follows ES5 + GROUND_RULES.md
- [ ] Documentation updated
- [ ] No regressions in related systems

### Next Steps (For Next Agent)
1. Continue with [next logical task]
2. Consider [future improvement]
3. Check [specific area] for related work

---

## Session History (Keep Last 5-10)

**Date:** 2026-02-14
**Agent:** Gemini (G) - Creative Director
**What:** Updated UI styling for mobile

**Date:** 2026-02-13
**Agent:** Jules (J) - Lead Architect
**What:** Refactored folder structure

(Continue with previous sessions...)
```

---

## OPTIONAL SPECIALIZED FILES

### CONFIG.md (For Configurable Games)
**When to use:** Games with settings, themes, difficulty levels
**Content:**
- Configuration options available
- How to change settings
- Default values
- Range/valid values for each option

### API.md (For Projects with APIs)
**When to use:** Projects that expose functions/APIs for other games
**Content:**
- Available functions/methods
- Parameters and return values
- Usage examples
- Authentication (if needed)

### TESTING.md (For Complex Games)
**When to use:** Games with many mechanics or complex logic
**Content:**
- Test procedures
- Edge cases to test
- Device testing checklist
- Performance testing baselines

### DEPLOYMENT.md (For Utilities)
**When to use:** Projects requiring special deployment steps
**Content:**
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Rollback procedure (if applicable)

---

## ENFORCEMENT & COMPLIANCE

### Before Every Commit
1. ✅ Check: Do all 7 files exist? (Use `ls [game]/*.md`)
2. ✅ Check: Has each file been updated if code changed?
3. ✅ Check: Does each file have required sections?
4. ✅ Use `/admin/GROUND_RULES_CHECKLIST.md` Rule 10 section

### During Code Review
- Verify docs are accurate and up-to-date
- Check that code changes are reflected in docs
- Ensure no outdated information

### Violations
- Missing files: **BLOCKING** - PR rejected
- Missing sections: **BLOCKING** - PR rejected
- Outdated content: **Warning** - ask for update before merge
- WIP content: **OK** - as long as structure present

---

## FILE SIZE GUIDELINES

**Why sizes matter:**
- 1-2 KB: Quick reference info
- 2-3 KB: Substantive content, good balance
- 3-5 KB: Comprehensive documentation
- 5+ KB: Consider breaking into sections

**Target Breakdown:**
```
Total recommended: ~20-25 KB per game

README.md (3-5 KB)      - User-focused
ARCHITECTURE.md (3-5 KB) - Technical deep-dive
TODO.md (2-3 KB)        - Roadmap/issues
CHANGELOG.md (2-3 KB)   - Version history
CLAUDE.md (2-3 KB)      - Developer notes
AGENT.md (1-2 KB)       - Session log
INFO.md (1 KB)          - Quick facts

Total: ~17-23 KB per game
```

---

## QUALITY CRITERIA

Each file should be:
- ✅ **Current:** Updated when code changes
- ✅ **Accurate:** Reflects actual implementation
- ✅ **Complete:** Has all required sections
- ✅ **Clear:** Written for someone unfamiliar with code
- ✅ **Actionable:** Provides guidance, not just description

---

## TEMPLATES

Use `/admin/DOC_TEMPLATES/` to get started:
- `README_TEMPLATE.md`
- `ARCHITECTURE_TEMPLATE.md`
- `INFO_TEMPLATE.md`
- `TODO_TEMPLATE.md`
- `CHANGELOG_TEMPLATE.md`
- `CLAUDE_TEMPLATE.md`
- `AGENT_TEMPLATE.md`

Copy, fill in, commit.

---

## COMPLIANCE CHECKLIST (For Agents)

Before committing code:

```
Documentation Standard Compliance
================================
Game/Project: [name]
Date: [YYYY-MM-DD]
Agent: [C/G/J]

Files Present:
- [ ] README.md exists
- [ ] ARCHITECTURE.md exists
- [ ] INFO.md exists
- [ ] TODO.md exists
- [ ] CHANGELOG.md exists
- [ ] CLAUDE.md exists
- [ ] AGENT.md exists

Content Quality:
- [ ] All required sections present in each file
- [ ] Content is current (updated with code changes)
- [ ] No outdated information
- [ ] Links between files are correct
- [ ] Examples are accurate

Files Updated (if code changed):
- [ ] CHANGELOG.md updated with version change
- [ ] AGENT.md updated with session notes
- [ ] TODO.md updated with completed tasks
- [ ] CLAUDE.md updated if gotchas changed

Size Check:
- [ ] Each file is within target size (1-5 KB)
- [ ] Total suite is ~20-25 KB
- [ ] Content is substantial (not fluff)
```

---

## PHASED ROLLOUT

### NOW (Phase 1 - Current)
- ✅ Standard formalized
- ✅ Templates created
- ✅ Rule 10 added to GROUND_RULES.md
- ✅ Enforcement mechanism in place

### PHASE 2 (Weeks 4-7)
- Apply 7-file suite to 18 Production tier games
- Verify comprehensive content per game
- Update DOCUMENTATION_AUDIT.md

### PHASE 3 (Weeks 8-10)
- Apply 7-file suite to 8 Development tier games
- Same verification process
- Mark complete in DOCUMENTATION_AUDIT.md

### PHASE 4 (Weeks 11+)
- All new code must include 7-file doc suite
- Ongoing compliance checks
- Experimental tier games (if touched)

---

## RELATED DOCUMENTS

- **GROUND_RULES.md** - Rule 7 (Docs precede code), Rule 10 (Documentation Law)
- **GROUND_RULES_CHECKLIST.md** - Rule 10 verification patterns
- **DOCUMENTATION_AUDIT.md** - Living inventory of which games have docs
- **/admin/DOC_TEMPLATES/** - Ready-to-use templates for all 7 files
- **ONBOARDING.md** - Documentation requirements section

---

## QUESTIONS & CLARIFICATIONS

**Q: Can I use different structure than specified?**
A: No. The 7-file structure is standard across all games. Consistency matters.

**Q: What if a game doesn't fit all sections?**
A: Use OPTIONAL files instead. E.g., games without settings don't need CONFIG.md. But the 7 core files are mandatory.

**Q: Who should own which files?**
A: See "Owner" for each file. But all agents should update AGENT.md with session notes.

**Q: What if documentation is outdated?**
A: This is a compliance violation. Update it in the same commit as code changes. If you find old docs, fix them.

**Q: Can I defer documentation?**
A: No. Docs and code ship together. No exceptions.

---

**Last Updated:** 2026-02-15
**Version:** v1.0
**Status:** ACTIVE & ENFORCED
**Owned By:** Claude (C) - Senior Developer
**Updated Every Session:** ALL agents
