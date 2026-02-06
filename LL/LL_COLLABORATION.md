# Lessons Learned: Multi-AI Collaboration

**Timeline:** February 2026 - Present
**Participants:** Claude (C), Gemini (G), Jules (J)

---

## The Challenge

Three AI agents with different:
- **Context windows** (Gemini loses track of deep file structures)
- **Usage limits** (Claude has weekly caps)
- **Strengths** (J: git ops, G: visuals, C: docs/planning)
- **Knowledge cutoffs** (different training data)

---

## 1. Handoff Protocol

### What Works

**Explicit handoff documents:**
```
FOR_GEMINI_WAR_FIXES.md
FOR_JULES_MERGE_REQUEST.md
FOR_CLAUDE_CODE_REVIEW.md
```

**Format:**
```markdown
# Handoff: [Task Name]
**From:** [Agent]
**To:** [Agent]
**Date:** [YYYY-MM-DD]

## Context
[What was done, what's left]

## Files Changed
- path/to/file.js - [what changed]

## Next Steps
1. [Specific action]
2. [Specific action]

## Gotchas
- [Known issue to watch for]
```

### What Doesn't Work
- Assuming the next agent has context
- Vague instructions ("fix the bug")
- Leaving uncommitted changes

---

## 2. AI_FEEDBACK.md Protocol

### Purpose
Persistent memory across session resets.

### Rules
1. **Timestamp everything** - UTC format
2. **Never modify previous entries** - Only add new ones
3. **Read before writing** - Check recent entries first
4. **Be specific** - Include file names, line numbers, error messages

### Entry Template
```markdown
## [Agent] - [YYYY-MM-DD HH:MM UTC]
**Subject:** [Brief description]

**Reflections:**
- What went right
- What went wrong
- Obstacles encountered

**Lessons Learned:**
- Technical insights
- Process improvements

**Alignment Check:**
- Confirmation of project goals
```

---

## 3. Context Preservation

### For Claude (C)
- Read `AGENTS.md` first every session
- Check `AI_FEEDBACK.md` for recent context
- Write detailed retrospectives before session ends
- Use remaining usage to document, not code

### For Gemini (G)
- Break tasks into smaller chunks
- Rely on C for file structure guidance
- Focus on single-file changes
- Document visual decisions

### For Jules (J)
- Own the git history
- Validate repo state before/after changes
- Handle complex merges
- Maintain branch hygiene

---

## 4. Conflict Resolution

| Conflict Type | Resolution |
|---------------|------------|
| Code style | C's guidelines prevail |
| Architecture | J has final say |
| Visual design | G has final say |
| Documentation | C has final say |

---

## 5. Common Pitfalls

### 1. Model Version Confusion
**Problem:** Docs said "Opus 3" when actual was "Opus 4.5"
**Solution:** Always update model identities when starting session

### 2. Merge Conflicts from Concurrent Work
**Problem:** Index.html had 10 duplicate Flow entries
**Solution:** Only one agent touches a file at a time. Use handoffs.

### 3. Context Loss Mid-Task
**Problem:** Agent forgot earlier decisions in same session
**Solution:** Write decisions to files immediately. Don't rely on memory.

### 4. Usage Exhaustion Before Commit
**Problem:** Good work lost because session ended
**Solution:** Commit early, commit often. Small atomic commits.

---

## 6. Communication Patterns

### Starting a Session
```
1. git pull origin main
2. Read AGENTS.md
3. Read AI_FEEDBACK.md (newest entries)
4. Read your agent file (CLAUDE.md, etc.)
5. Announce yourself to user
```

### Ending a Session
```
1. Commit all changes
2. Push to remote
3. Add entry to AI_FEEDBACK.md
4. Note any unfinished work for next agent
```

### Requesting Help from Another Agent
```markdown
## Request for [Agent]
**From:** [Your agent]
**Priority:** [High/Medium/Low]
**Task:** [What you need]
**Files:** [Relevant paths]
**Deadline:** [If any]
```

---

## Quick Reference

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| AGENTS.md | Roles, protocols | Rarely |
| AI_FEEDBACK.md | Session journal | Every session |
| IDEAS_020426.md | Brainstorming | As ideas emerge |
| CHANGELOG.md | Release notes | Major releases only |
| LL/*.md | Deep technical lessons | When bugs found |

---

*Last Updated: 2026-02-05 by Claude (C)*
