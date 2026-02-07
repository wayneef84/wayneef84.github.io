# [Game Name] - Project Info

**Type:** Application (Game)
**Version:** vX.Y.Z
**Directory:** `games/[category]/[game-name]/`
**Parent Project:** F.O.N.G.
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

---

## Dependencies

| Library | Version | Status | Notes |
|---------|---------|--------|-------|
| `path/to/library` | vX.Y.Z | ✅ Up-to-date | Brief note about this dependency |

---

## Upgrade Notes

**Last Checked:** YYYY-MM-DD
**Available Upgrades:** None / [Library vX.Y.Z available]
**Reason for Current Version:** [Why we're on this version - stability, no need for new features, etc.]

### Upgrade History
- **YYYY-MM-DD:** Upgraded [Library] from vX.Y.Z → vA.B.C - [reason]

---

## Scope

[Brief description of what this game does and its key features]

**Key Features:**
- Feature 1
- Feature 2
- Feature 3

**Game Modes:**
- Mode 1: [description]
- Mode 2: [description]

---

## Activity Log

**Recent Changes (Last 5-10 entries):**

- **[YYYY-MM-DD]** [feat/fix/docs]: Brief description
- **[YYYY-MM-DD]** [feat/fix/docs]: Brief description
- **[YYYY-MM-DD]** [feat/fix/docs]: Brief description

---

## Context Boundaries

**What This Game Owns:**
- Game-specific UI components
- Game-specific rules and logic
- Game-specific state management
- Game settings and localStorage

**What This Game Uses (Shared):**
- [Library name]: [What it provides]

**What This Game Does NOT Handle:**
- [Things outside this game's scope]

---

## Known Issues

- [ ] Issue 1: [Description] - Priority: [High/Medium/Low]
- [ ] Issue 2: [Description] - Priority: [High/Medium/Low]

---

## Future Enhancements

- [ ] Enhancement 1: [Description]
- [ ] Enhancement 2: [Description]

---

## For Sub-Project Claude

**Role:** Lead Developer for this game
**Scope:** Work only within `games/[category]/[game-name]/` directory

**On Startup:**
1. Read this INFO.md to understand current dependency versions
2. Check Root `INFO.md` to see if upgrades are available
3. If newer library version exists, alert user before proceeding

**Dependency Protocol:**
- Your dependencies are pinned in this file
- Never use library APIs newer than your declared version
- If user wants to upgrade, update this file's dependency table
- Always test thoroughly after upgrading

---

**INFO Version:** v1.0
**Last Updated By:** [Claude/Gemini/Human]
**Last Updated:** YYYY-MM-DD
