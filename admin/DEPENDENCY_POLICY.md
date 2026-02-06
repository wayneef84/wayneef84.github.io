# Dependency Management Policy

**Version:** 1.0
**Created:** 2026-01-17
**Last Updated:** 2026-01-17

---

## Overview

This document defines how shared libraries and game dependencies are managed in the Founding & Forging project using a **federated architecture** with **opt-in upgrades**.

---

## Core Principles

1. **Safety First**: No automatic updates that could break working games
2. **Explicit Versioning**: Every game declares exact library versions
3. **Opt-In Upgrades**: Games upgrade only when explicitly tested
4. **Clear Visibility**: Root registry shows version landscape at a glance
5. **Manual Testing Gate**: User tests before committing upgrades

---

## Version Control Strategy

### Semantic Versioning (Semver)

All libraries follow [Semantic Versioning](https://semver.org/):

| Version Type | Format | Meaning | Upgrade Policy |
|--------------|--------|---------|----------------|
| **Patch** | x.y.Z | Bug fixes only, no API changes | Can upgrade anytime (low risk) |
| **Minor** | x.Y.0 | New features, backwards compatible | Upgrade when convenient |
| **Major** | X.0.0 | Breaking API changes | Requires migration plan |

---

## File Structure

### Root `INFO.md` (Master Registry)
- **Location:** `/INFO.md`
- **Purpose:** Single source of truth for all library versions and project dependencies
- **Contents:**
  - Library Registry (current versions of all shared libraries)
  - Project Dependencies (what version each game uses)
  - Update Policy reference
  - Status indicators (✅ up-to-date, ⚠️ upgrade available, 🔴 migration needed)

### Library `INFO.md`
- **Location:** `[library-path]/INFO.md`
- **Purpose:** Document library version, changelog, API stability
- **Contents:**
  - Current version and release date
  - Changelog (all versions)
  - API stability indicators
  - Breaking changes history
  - Deprecations list

### Game `INFO.md`
- **Location:** `[game-path]/INFO.md`
- **Purpose:** Declare game's dependency versions (lock file)
- **Contents:**
  - Game version and metadata
  - Dependencies table (exact versions)
  - Upgrade notes (why on this version)
  - Activity log

---

## Workflow: Library Updates

### When a Library is Updated

**Step 1: Library Maintainer Updates Library**
1. Make code changes to the library
2. Update `[library]/INFO.md`:
   - Bump version (following Semver)
   - Add changelog entry
   - Document breaking changes (if major version)
   - Update API stability table

**Step 2: Update Root Registry**
1. Update `/INFO.md` library registry with new version
2. Add status indicators to affected games:
   - ⚠️ if minor/patch update available
   - 🔴 if major update (breaking changes)

**Step 3: Games Remain on Old Version**
- Game `INFO.md` files are **NOT automatically updated**
- Games continue using their pinned versions
- No risk of breakage

---

## Workflow: Game Upgrades

### When Working on a Game

**Step 1: Root Claude Checks Versions**
When user starts work on a game, Root Claude:
1. Reads game's `INFO.md` to see current dependency versions
2. Reads root `INFO.md` to see latest library versions
3. Compares versions

**Step 2: Alert User if Upgrade Available**
If newer library version exists, Root Claude presents:

```
🔔 Dependency Update Available

Game: War
Current: Shared v1.0.0
Latest: Shared v1.1.0

Changes in v1.1.0:
- Added Pile.peek() method for looking at top card
- Fixed bug in Deck.shuffle()

Breaking Changes: None
Type: Minor (backwards compatible)

Actions:
[1] Upgrade now (recommended)
[2] Show full changelog
[3] Defer (stay on v1.0.0)
[4] Cancel
```

**Step 3: User Decides**
- **Upgrade now**: Root Claude updates game's `INFO.md`, user tests game
- **Defer**: Game stays on old version, note added to upgrade notes
- **Show details**: Display full changelog from library `INFO.md`

**Step 4: If Upgrading**
1. Root Claude updates game's `INFO.md` dependency table
2. Root Claude updates upgrade notes (date, reason)
3. User tests game thoroughly
4. If tests pass: Commit changes
5. If tests fail: Revert `INFO.md`, report issue

---

## Workflow: Major Version (Breaking Changes)

### When Library Has Breaking Changes

**Step 1: Create Migration Plan**
When library bumps major version (v1.x → v2.0), Root Claude:
1. Creates `admin/migrations/[library]-v2-migration.md`
2. Uses MIGRATION_PLAN_TEMPLATE.md as base
3. Documents:
   - All breaking changes
   - Per-game migration checklists
   - Testing requirements
   - Rollback procedures

**Step 2: Flag Affected Games**
Root `INFO.md` shows:
```
## Project Dependencies
| Project | Shared Version | Status | Notes |
|---------|----------------|--------|-------|
| War | v1.5.0 | 🔴 v2.0 available | Migration required |
```

**Step 3: Games Migrate Individually**
Each game migrates on its own timeline:
1. User reviews migration plan
2. Creates git branch for migration
3. Updates code per checklist
4. Updates game's `INFO.md` to v2.0.0
5. Tests thoroughly
6. Commits if successful, reverts if not

**Step 4: No Forced Upgrades**
- Games can stay on v1.x indefinitely (if stable)
- Only upgrade when user has time to test
- Migration plans provide clear guidance

---

## Status Indicators

| Indicator | Meaning | Action Required |
|-----------|---------|-----------------|
| ✅ **Up-to-date** | Game is on latest library version | None |
| ⚠️ **Update available** | Newer minor/patch version exists | Upgrade when convenient |
| 🔴 **Migration needed** | Major version with breaking changes | Follow migration plan |
| 📌 **Pinned** | Game deliberately staying on old version | None (documented in upgrade notes) |

---

## For Root Claude

### On Session Start
1. Read `/INFO.md` to understand version landscape
2. Note any version mismatches or available upgrades

### When User Works on a Game
1. Read game's `INFO.md` to see its dependencies
2. Compare with root `INFO.md` library registry
3. If mismatch exists:
   - Alert user with upgrade prompt
   - Show changelog summary
   - Offer options: Upgrade / Defer / Details

### When User Upgrades a Game
1. Update game's `INFO.md` dependency table
2. Add entry to upgrade notes
3. Instruct user to test thoroughly
4. After successful test, commit changes

### When Library Has Breaking Changes
1. Create migration plan in `admin/migrations/`
2. Update root `INFO.md` with 🔴 indicator
3. Do NOT auto-update any games
4. Wait for user to migrate each game individually

---

## For Sub-Project Claude

### On Session Start
1. Read your game's `INFO.md` to know dependency versions
2. Use only APIs available in your declared versions
3. Do NOT use newer library APIs unless version is upgraded

### If User Asks to Use New Library Feature
1. Check if feature exists in your current library version
2. If not, alert user: "That feature requires [Library] vX.Y.Z. You're on vX.Y.0. Upgrade?"
3. If user approves, update `INFO.md` and proceed
4. If user declines, find alternative solution with current version

---

## Compatibility Matrix

### Shared Library Compatibility

| Shared Version | War | Blackjack | Compatible? |
|----------------|-----|-----------|-------------|
| v1.0.0 | ✅ | ✅ | Yes |
| v1.1.0 | ⚠️ | ⚠️ | Yes (minor upgrade) |
| v2.0.0 | 🔴 | 🔴 | Migration required |

---

## Testing Requirements

### After Patch Update (x.y.Z)
- **Smoke test**: Quick 5-minute playthrough
- **Verify**: No console errors
- **Commit**: If all looks good

### After Minor Update (x.Y.0)
- **Functional test**: Test all major features
- **New features**: Try new library features (if applicable)
- **Regression test**: Ensure old features still work
- **Commit**: After thorough testing

### After Major Update (X.0.0)
- **Full test**: Complete game playthrough
- **Breaking changes**: Verify all migrations applied correctly
- **Edge cases**: Test unusual scenarios
- **Regression test**: All features work as before
- **Commit**: Only after extensive testing

---

## Rollback Procedure

If upgrade causes issues:

1. **Revert Code Changes:**
   ```bash
   git checkout HEAD~1 [game-path]/
   ```

2. **Revert INFO.md:**
   ```bash
   git checkout HEAD~1 [game-path]/INFO.md
   ```

3. **Test:**
   - Verify game works on old version

4. **Report Issue:**
   - Document what broke
   - File issue with library maintainer
   - Add note to game's `INFO.md` upgrade notes

---

## Edge Cases

### What if a game needs TWO libraries?

**Example:** War uses both `shared/` and `animations/`

Game's `INFO.md` dependencies table:
```markdown
| Library | Version | Status | Notes |
|---------|---------|--------|-------|
| games/cards/shared | v1.0.0 | ✅ | Core engine |
| games/shared/animations | v2.1.0 | ✅ | Card animations |
```

Each library upgrades independently.

### What if library A depends on library B?

**Example:** `animations/` depends on `shared/`

Library A's `INFO.md`:
```markdown
## Dependencies
| Library | Version | Notes |
|---------|---------|-------|
| games/cards/shared | v1.0.0+ | Requires v1.0.0 or higher |
```

When upgrading library A, check its dependencies.

---

## Future Enhancements

### Potential Improvements (Not Yet Implemented)

1. **Version Check Script:**
   - Bash script to verify all games' declared versions match actual imports
   - Run as git pre-commit hook

2. **Compatibility Matrix:**
   - Document which game versions work with which library versions
   - Helps with rollbacks

3. **Deprecation Warnings:**
   - Add console.warn() in libraries when deprecated APIs are called
   - Helps identify code that needs updating

4. **Automated Testing:**
   - If test suite exists, run tests after upgrades
   - Only commit if tests pass

---

## Questions & Answers

**Q: Can games use different library versions?**
A: Yes! War can be on Shared v1.0, Blackjack on v1.2. This is by design.

**Q: What if I forget to update a game's INFO.md after upgrading?**
A: Root Claude should catch this on next session. Also, consider version check script.

**Q: Can I downgrade a game to an older library version?**
A: Yes, but verify the old version still exists in the repo. Update INFO.md to reflect downgrade.

**Q: What if a library update breaks multiple games?**
A: Revert the library update, or fix the library. Don't push breaking changes without migration plans.

---

**Policy Version:** 1.0
**Effective Date:** 2026-01-17
**Next Review:** When first major version upgrade occurs
