# [Game/Project Name] - Developer Notes

**For the next Claude (or any developer) working on this project**

---

## Purpose & Philosophy

**Why This Exists:**
[Statement of intent - entertainment? education? utility? for family?]

**Design Philosophy:**
[How this game/project approaches its problem]

**Core Value:**
[What makes this special or important]

---

## Architecture Summary

[2-3 sentence summary of how it works]

**Main Components:**
1. **[Component 1]** - [What it does]
2. **[Component 2]** - [What it does]
3. **[Component 3]** - [What it does]

**Key Systems:**
- State Machine: [How state flows]
- Rendering: [How visuals update]
- Input: [How player actions handled]

See [ARCHITECTURE.md](ARCHITECTURE.md) for full technical details.

---

## ⚠️ Critical Fixes / Gotchas

### DO NOT REGRESS THESE

**Gotcha 1: [Critical Issue Name]**
- ❌ What breaks if you forget
- ✅ How to prevent it
- 📍 Location: [Filename, line range]
- Example:
  ```javascript
  // WRONG - causes animation flash:
  element.style.left = '100px';  // DOM draws BEFORE opacity set

  // RIGHT - prevent flash:
  element.style.visibility = 'hidden';
  element.style.left = '100px';
  ```

**Gotcha 2: [Another Critical Issue]**
- ❌ Problem
- ✅ Solution
- 📍 Location: [File]

---

## Last Session Notes

### Most Recent Work (Top Entry)

**Date:** 2026-02-15
**Agent:** Claude (C)

**What Was Done:**
- [Feature/fix completed]
- [Documentation updated]
- [Test verified]

**Context for Next Session:**
- Current state: [What's done, what's not]
- Next logical step: [What to work on next]
- Blockers: [Anything preventing progress]

**Code Changes:**
- File 1: [What changed and why]
- File 2: [What changed and why]

**Testing Performed:**
- [Test 1 passed]
- [Test 2 passed]

---

### Previous Session (For Reference)

**Date:** 2026-02-14
**Agent:** Gemini (G)
**Work:** Updated CSS for mobile layout

---

## Common Mistakes (Learn from Experience)

1. **Mistake 1:** [What I did wrong]
   - Impact: [What went wrong]
   - Prevention: [How to avoid]

2. **Mistake 2:** [Common error to watch for]
   - Prevention: [Best practice]

---

## Key Code Locations

**Critical Code Paths:**

| Function | File | Lines | Purpose | Why Critical |
|----------|------|-------|---------|--------------|
| [Function] | js/file.js | 100-150 | [Purpose] | [Why important] |
| [Function] | js/file.js | 200-250 | [Purpose] | [Why important] |

---

## Testing Before Commit

**Checklist:**
- [ ] Basic gameplay works (no crashes)
- [ ] Mobile touch controls respond
- [ ] Animation timing correct (no flash)
- [ ] Performance acceptable (<2s load)
- [ ] Documentation updated
- [ ] No ES6+ syntax (var, not const/let, no =>)
- [ ] Relative paths only (no /css/, no absolute URLs)
- [ ] No external CDNs

---

## Performance Baselines

Keep these in mind when optimizing:

- **Load Time Target:** <2 seconds
- **Memory Target:** <10 MB
- **Idle CPU:** <1%
- **Active CPU:** <30%
- **FPS (if animated):** Consistent 60

Current baselines (see [INFO.md](INFO.md)):
- Load: ~1.2s
- Memory: ~5 MB
- CPU: ~15% during play

If performance degrades significantly, investigate [areas].

---

## Related Resources

- [README.md](README.md) - User guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Full technical design
- [TODO.md](TODO.md) - What needs doing
- [INFO.md](INFO.md) - Quick facts
- [Shared Library](../cards/shared/ARCHITECTURE.md) - If used

---

## Questions I'd Ask Next Developer

1. **When adding new features:** "Is this backwards compatible, or does it need a major version bump?"
2. **Before refactoring:** "Will this improve performance or just code cleanliness? How will we measure?"
3. **On mobile issues:** "Have you tested on actual devices or just simulators?"
4. **On performance:** "Where's the bottleneck? Measure before optimizing."

---

## The Next Step

[For next developer working on this]

If you're here, the game is mostly working. Here's what you probably should do next:

1. **Quick refresh:** Re-read this CLAUDE.md and [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Understand:** Run the game locally, understand the current state
3. **Check:** Read [TODO.md](TODO.md) - what's the next priority?
4. **Plan:** Before coding, document your plan in this file
5. **Build:** Code your change
6. **Document:** Update TODO/CHANGELOG/AGENT.md
7. **Test:** Verify on multiple devices
8. **Commit:** With message referencing what changed

Good luck! Feel free to update this file with lessons you learn.

---

**Last Updated:** 2026-02-15
**Updated By:** Claude (C)
**Status:** Ready for next developer
