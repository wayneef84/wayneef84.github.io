# [Library Name] - Library Info

**Type:** Library
**Version:** vX.Y.Z
**Directory:** `path/to/library/`
**Parent Project:** F.O.N.G.
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

---

## Versioning Policy

This library follows [Semantic Versioning](https://semver.org/):

- **Patch (x.y.Z)**: Bug fixes only. No API changes. Games can upgrade anytime.
- **Minor (x.Y.0)**: New features added, backwards compatible. Games can upgrade when convenient.
- **Major (X.0.0)**: Breaking API changes. Games require migration plan.

---

## Current Version: vX.Y.Z

**Released:** YYYY-MM-DD
**Status:** Stable / Beta / Experimental

---

## Changelog

### vX.Y.Z (YYYY-MM-DD)
**Type:** Major / Minor / Patch

**Added:**
- New feature 1
- New feature 2

**Changed:**
- Modified behavior 1
- Modified behavior 2

**Deprecated:**
- Old API 1 (use new API instead)

**Removed:**
- Old API 2 (removed in vX.0.0)

**Fixed:**
- Bug fix 1
- Bug fix 2

**Breaking Changes:**
- Breaking change 1: [What changed and how to migrate]

---

### v1.0.0 (YYYY-MM-DD)
**Type:** Major

Initial release.

---

## API Stability

| Module/API | Status | Notes |
|------------|--------|-------|
| `ModuleA` | ✅ Stable | Guaranteed backwards compatible |
| `ModuleB` | ⚠️ Experimental | May change in future versions |
| `ModuleC.oldMethod()` | 🔴 Deprecated | Use `ModuleC.newMethod()` instead |

**Legend:**
- ✅ **Stable**: API is locked, will not break in minor versions
- ⚠️ **Experimental**: API may change, use with caution
- 🔴 **Deprecated**: API will be removed in next major version

---

## Breaking Changes History

### vX.0.0 → vY.0.0
**Date:** YYYY-MM-DD

| Old API | New API | Migration Guide |
|---------|---------|-----------------|
| `oldMethod()` | `newMethod()` | [Link to migration doc] |

---

## Deprecations

| API | Deprecated In | Removed In | Replacement |
|-----|---------------|------------|-------------|
| `oldAPI()` | v1.5.0 | v2.0.0 | Use `newAPI()` instead |

---

## Scope

**What This Library Provides:**
- Feature 1
- Feature 2
- Feature 3

**What This Library Does NOT Provide:**
- [Out of scope functionality]

---

## Dependencies

| Library | Version | Notes |
|---------|---------|-------|
| None | - | This is a leaf library |

*OR*

| Library | Version | Notes |
|---------|---------|-------|
| `external-lib` | v1.0.0 | Used for [purpose] |

---

## For Library Maintainers

**When Adding Features (Minor Version Bump):**
1. Add new methods/modules without changing existing APIs
2. Update Changelog with "Added" section
3. Update API Stability table if needed
4. Bump version: v1.0.0 → v1.1.0
5. Update Root `INFO.md` library registry
6. Games remain on old version until manually upgraded

**When Fixing Bugs (Patch Version Bump):**
1. Fix bug without changing public API
2. Update Changelog with "Fixed" section
3. Bump version: v1.0.0 → v1.0.1
4. Update Root `INFO.md` library registry
5. Games can upgrade immediately (no risk)

**When Breaking APIs (Major Version Bump):**
1. Document all breaking changes in Changelog
2. Create migration guide in `admin/migrations/`
3. Update API Stability table
4. Bump version: v1.5.0 → v2.0.0
5. Update Root `INFO.md` library registry
6. **DO NOT update game dependencies automatically**
7. Create per-game migration checklist
8. Games migrate individually after testing

---

## Activity Log

- **[YYYY-MM-DD]** v1.1.0 - Added [feature]
- **[YYYY-MM-DD]** v1.0.1 - Fixed [bug]
- **[YYYY-MM-DD]** v1.0.0 - Initial release

---

**INFO Version:** v1.0
**Last Updated By:** [Claude/Gemini/Human]
**Last Updated:** YYYY-MM-DD
