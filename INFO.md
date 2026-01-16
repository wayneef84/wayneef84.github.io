# Fong Family Arcade - Project Registry

**Last Updated:** 2026-01-17
**Registry Version:** 1.0

---

## Library Registry

Current versions of all shared libraries:

| Library | Current Version | Released | Type | Breaking Changes |
|---------|-----------------|----------|------|------------------|
| `games/cards/shared` | **v1.0.0** | 2026-01-15 | Stable | None |

---

## Project Dependencies

What version each game/application is currently using:

| Project | Type | Shared Library | Status | Last Updated | Notes |
|---------|------|----------------|--------|--------------|-------|
| `games/cards/war` | Game | v1.0.0 | ✅ Up-to-date | 2026-01-17 | Battle history complete |
| `games/cards/blackjack` | Game | v1.0.0 | ✅ Up-to-date | 2026-01-17 | Reset deck feature |

---

## Update Policy

This project uses **Semantic Versioning** with **opt-in upgrades**:

### Version Types

| Type | Format | Meaning | Upgrade Policy |
|------|--------|---------|----------------|
| **Patch** | x.y.Z | Bug fixes, no API changes | Can upgrade anytime (low risk) |
| **Minor** | x.Y.0 | New features, backwards compatible | Upgrade when convenient |
| **Major** | X.0.0 | Breaking API changes | Requires migration plan |

### Status Indicators

| Indicator | Meaning | Action |
|-----------|---------|--------|
| ✅ **Up-to-date** | Game is on latest library version | None needed |
| ⚠️ **Update available** | Newer minor/patch version exists | Upgrade when working on game |
| 🔴 **Migration needed** | Major version with breaking changes | Follow migration plan |
| 📌 **Pinned** | Game deliberately on old version | Documented in game's INFO.md |

---

## For Root Claude (Architecture Agent)

### On Every Session Start

1. **Read this file** to understand the version landscape
2. **Check for mismatches**:
   - Compare Library Registry versions with Project Dependencies
   - Note any ⚠️ or 🔴 indicators

### When User Works on a Specific Game

1. **Read game's INFO.md** to see its declared dependencies
2. **Compare with Library Registry** above
3. **If mismatch exists**:
   - Alert user with upgrade prompt
   - Show changelog summary from library's INFO.md
   - Offer options: Upgrade now / Defer / Show details
   - Wait for user decision

### Upgrade Prompt Format

```
🔔 Dependency Update Available

Game: [Game Name]
Current: [Library] v[Old]
Latest: [Library] v[New]

Changes:
- [Key changes from changelog]

Breaking Changes: Yes/No
Type: Patch / Minor / Major

Actions:
[1] Upgrade now
[2] Show full changelog
[3] Defer (stay on current version)
```

### When User Approves Upgrade

1. **Update game's INFO.md**:
   - Change dependency version
   - Add entry to upgrade history
   - Update "Last Updated" date

2. **Instruct user to test**:
   - Refer to `admin/UPGRADE_CHECKLIST.md`
   - Don't commit until tests pass

3. **If all games upgraded**:
   - Update this file's Project Dependencies table
   - Change status to ✅ Up-to-date

### When Library Has Breaking Changes

1. **Do NOT auto-update any games**
2. **Create migration plan**:
   - Use `admin/templates/MIGRATION_PLAN_TEMPLATE.md`
   - Save to `admin/migrations/[library]-v[X]-migration.md`
3. **Update this file**:
   - Add 🔴 indicator to affected games
   - Add note: "Migration plan available"
4. **Wait for user** to migrate each game individually

---

## For Sub-Project Claude (Game Developer)

### On Session Start in a Game Directory

1. **Read your game's INFO.md** to know your dependency versions
2. **Use only APIs** available in your declared versions
3. **If unsure**, check library's INFO.md for API availability

### If User Asks to Use New Library Feature

1. **Check** if feature exists in your current library version
2. **If feature is newer**:
   - Alert: "That feature requires [Library] v[X.Y]. You're on v[A.B]. Upgrade?"
   - If user approves: Update INFO.md, proceed with feature
   - If user declines: Find alternative with current version

### Never

- ❌ Use library APIs newer than your declared version
- ❌ Auto-upgrade dependencies without user approval
- ❌ Modify other games' INFO.md files (stay in your scope)

---

## Dependency Graph

```
games/cards/war/
  └─ depends on → games/cards/shared (v1.0.0)

games/cards/blackjack/
  └─ depends on → games/cards/shared (v1.0.0)
```

---

## Version History

### 2026-01-17: Initial Registry
- Added Shared v1.0.0 to library registry
- Registered War v1.1.0 (depends on Shared v1.0.0)
- Registered Blackjack v1.0.0 (depends on Shared v1.0.0)
- Established federated architecture

---

## Related Documentation

- **Dependency Policy**: `admin/DEPENDENCY_POLICY.md`
- **Upgrade Checklist**: `admin/UPGRADE_CHECKLIST.md`
- **Templates**: `admin/templates/`
- **Migration Plans**: `admin/migrations/`

---

## Future Projects

As new games are added:

1. Create game's INFO.md using template
2. Register in this file's Project Dependencies table
3. Declare library dependencies in game's INFO.md
4. Maintain version alignment through opt-in upgrades

---

**Registry Version:** 1.0
**Maintained By:** Root Claude (Architecture)
**Last Updated:** 2026-01-17
