# F.O.N.G. Compliance Fixes Backlog

**Purpose:** Track games and projects that violate ground rules, prioritize remediation
**Owner:** Claude (C) - Audit, prioritization
**Status:** Phase 1a Audit Complete
**Last Scanned:** 2026-02-15

---

## PRIORITY LEVELS

| Level | Impact | Timeline | Example |
|-------|--------|----------|---------|
| 🔴 **Critical** | Blocks deployment or violates strict laws | ASAP (this week) | Game uses CDN fonts, absolute paths prevent `/beta` deploy |
| 🟠 **High** | Violates ground rule, affects multiple games | 1-2 weeks | ES6+ syntax prevents older tablet compatibility |
| 🟡 **Medium** | Technical debt, affects maintainability | 3-4 weeks | Missing ARCHITECTURE.md, incomplete documentation |
| 🟢 **Low** | Nice-to-have, cosmetic improvements | Sprint 3+ | Brand name inconsistency ("Fong" vs "F.O.N.G.") |

---

## COMPLIANCE VIOLATIONS MATRIX

### Rule 1: Local-Only Assets (No CDNs)

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| `games/sprunki/` | Possibly local, verify CORS handling | Need to check if `local-server` requirement is documented | 🟡 Medium | Pending Audit |
| TBD | External image service? | Need to scan for imgur/unsplash/etc URLs | 🟡 Medium | Pending Audit |

**Remediation Plan (if needed):**
1. Download external assets locally to `/assets/` or `/images/`
2. Update all URLs to relative paths
3. Test offline-first functionality
4. Commit with message: `fix: Localize [asset-type] for Rule 1 compliance`

---

### Rule 2: Strict ES5 Syntax

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| `games/sprunki/` | ✅ FIXED (C5) | Was entirely ES6+ (`class`, `async/await`, `const/let`), rewritten to ES5 | ✅ Resolved | Done |
| All new games | Risk of ES6+ creep | Need pre-commit grep checks | 🔴 Critical | Checklist Created |

**Remediation Plan:**
1. Use `/admin/GROUND_RULES_CHECKLIST.md` grep patterns before every commit
2. Set up pre-commit hooks (optional, template provided)
3. During code review, verify no `const`, `let`, `=>`, `??`, `?.`
4. If violation found: Rewrite to ES5, reference this document

---

### Rule 3: Zero Build Tools

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| None currently | N/A | No webpack/babel configs found | ✅ OK | Clear |

**Monitoring:**
- Never commit `webpack.config.js`, `.babelrc`, `tsconfig.json`
- Never add npm build scripts (except optional dev tools)
- If someone proposes introducing a build tool, escalate to user immediately

---

### Rule 4: Relative Paths Only (No Absolute `/`)

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| Need full scan | Absolute paths may exist in old games | Requires grep: `href="/"` and `src="/"` | 🟠 High | Pending Full Audit |

**Remediation Process:**
1. Run grep patterns from CHECKLIST.md
2. For each violation:
   - From file at `/games/X/index.html`, use `../../` to navigate up
   - From file at `/projects/X/index.html`, use `../` or `../../` accordingly
3. Test in `/beta` subfolder (dev preview) to verify working
4. Commit with message: `fix: Use relative paths for Rule 4 compliance`

**Critical:** Without this fix, the app breaks when running at `https://user.github.io/repo/beta/`

---

### Rule 5: Dev Branch Sovereignty

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| None currently | N/A | Using dev→main workflow established C5 | ✅ OK | Clear |

**Enforcement:**
- All agents: NEVER push directly to `main`
- All agents: Always commit to `dev` first
- User: Reviews `dev` and merges to `main` when ready

---

### Rule 6: Federated Dependencies

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| `games/cards/blackjack/` | ✅ Compliant | INFO.md pinned to shared v1.0.0 | ✅ OK | Clear |
| `games/cards/war/` | ✅ Compliant | INFO.md pinned to shared v1.0.1 | ✅ OK | Clear |
| Poker variants | ⚠️ Check | Need to verify poker-evaluator version pinning | 🟡 Medium | Pending |

**Monitoring:**
- Before coding on any game, check its `INFO.md`
- Never auto-upgrade dependencies
- Document upgrade requests in `AI_FEEDBACK.md`
- Wait for user approval before modifying `INFO.md`

---

### Rule 7: Docs Precede Code

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| `games/flow/` | ✅ Has ARCHITECTURE.md | Documents engine, variants, todo items | ✅ OK | Clear |
| `games/cards/war/` | ✅ Has CLAUDE.md | Tracks bug fixes, design decisions | ✅ OK | Clear |
| Many games | ⚠️ Missing README | Need to audit which games lack basic documentation | 🟡 Medium | Pending Audit |

**Remediation Process:**
1. For major features: Write ARCHITECTURE.md BEFORE coding
2. For new games: Ensure README.md exists (user-facing) + ARCHITECTURE.md (technical)
3. For bug fixes: Update CHANGELOG.md and project-specific CLAUDE.md
4. Every session: Update AI_FEEDBACK.md with session log

---

### Rule 8: License Compliance

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| Root `/LICENSE_AUDIT.md` | ✅ Exists | Master record of third-party code | ✅ OK | Clear |
| New dependencies | ⚠️ Risk | Any new library MUST be added to AUDIT immediately | 🟠 High | Ongoing |

**Enforcement:**
- Before importing any code: Check LICENSE_AUDIT.md
- If not found: Read license terms
- Add to AUDIT immediately
- Commit with: `license: Add [library] [version] [type]`

---

### Rule 9: F.O.N.G. Branding & Mobile-First Design

#### Sub-Rule 9a: Branding (F.O.N.G. vs Fong)

| Location | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| User-visible text | ⚠️ Need scan | Check all `<h1>`, `<title>`, headers for "Fong" vs "F.O.N.G." | 🟢 Low | Pending Brand Audit |
| Old comments | ✅ OK | Keep "Fong Family Arcade" in historical comments for context | ✅ OK | Acknowledged |

**Remediation:**
- All new user-facing text: "F.O.N.G." (not "Fong", "Fong Zone", "Fong Family Arcade")
- Meta tags: `<title>F.O.N.G. - [Game Name]</title>`
- Headers: "Welcome to F.O.N.G." (not "Fong")
- Legacy code: Leave alone (don't refactor just for branding)

#### Sub-Rule 9b: Mobile-First CSS

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| All games | ⚠️ Need audit | Check if CSS uses mobile-first pattern (1-column → expand) | 🟡 Medium | Pending CSS Audit |

**Remediation Pattern:**
```css
/* WRONG - Desktop-first */
.game-grid {
    grid-template-columns: repeat(4, 1fr);  /* Default: 4 columns */
}
@media (max-width: 768px) {
    /* Shrink for tablets */
}

/* RIGHT - Mobile-first */
.game-grid {
    grid-template-columns: 1fr;  /* Start with 1 column (mobile) */
}
@media (min-width: 480px) {
    /* Expand for tablet */
    grid-template-columns: repeat(2, 1fr);
}
@media (min-width: 768px) {
    /* Expand for desktop */
    grid-template-columns: repeat(4, 1fr);
}
```

#### Sub-Rule 9c: Touch Targets (44px minimum)

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| All interactive elements | ⚠️ Need audit | Verify buttons, links, clickable areas are min 44x44px | 🟡 Medium | Pending Touch Audit |

**Remediation:**
```css
/* WRONG */
button { padding: 4px 8px; }  /* Only ~24px tall */

/* RIGHT */
button {
    padding: 12px 16px;  /* Achieves 44px minimum */
    min-height: 44px;
    min-width: 44px;
}
```

#### Sub-Rule 9d: Safe Areas (iPhone X+ notch)

| Game/Project | Violation | Evidence | Priority | Status |
|---|---|---|---|---|
| Games with bottom nav | ⚠️ Need audit | Check if footer/nav uses `env(safe-area-inset-bottom)` | 🟡 Medium | Pending Safe Area Audit |

**Remediation:**
```css
/* WRONG */
footer { padding: 16px; }  /* Covered by home button on iPhone X+ */

/* RIGHT */
footer {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

---

## REMEDIATION SCHEDULE

### Phase 1b (Current - Weeks 2-3)
- [ ] Complete full compliance audit (use CHECKLIST.md patterns)
- [ ] Flag all violations in this document
- [ ] Create remediation tickets for High/Critical priority
- [ ] Deliver updated GAME_INVENTORY.md with compliance column

### Phase 2 (Weeks 4-7)
- [ ] Fix Critical violations (Rule 4: Relative paths, Rule 2: ES5 syntax)
- [ ] Update Rule 7 documentation for key games
- [ ] Test in `/beta` preview URL

### Phase 3+ (Weeks 8+)
- [ ] Address Medium/Low priority issues
- [ ] Refactor CSS for mobile-first consistency
- [ ] Brand consistency cleanup (F.O.N.G. naming)

---

## SCANNING COMMANDS (For Auditors)

Run these to find violations:

```bash
# Rule 1: CDN URLs
grep -r "cdn\|googleapis\|unpkg\|jsdelivr" /games /projects --include="*.html" --include="*.css" 2>/dev/null

# Rule 2: ES6+ Syntax
grep -r "const \|let \|=>\|??\|?\." /games /projects --include="*.js" 2>/dev/null | grep -v "//.*"

# Rule 4: Absolute Paths
grep -r "href=\"/" /games /projects --include="*.html" 2>/dev/null
grep -r "src=\"/" /games /projects --include="*.html" 2>/dev/null

# Rule 9a: Brand Name (find "Fong" not in comments)
grep -r "Fong Family Arcade\|Fong Zone" /games /projects --include="*.html" 2>/dev/null

# Rule 9b: Desktop-First CSS (find grid-template-columns before @media)
grep -B 5 "@media" /games /projects --include="*.css" 2>/dev/null | grep "grid-template-columns: repeat(4"
```

---

## FAQ: Common Questions

**Q: Can I ignore a violation if it's "just legacy"?**
A: No. If a game is in Production or Development tier, it must be compliant. Legacy games in Experimental tier can be deferred.

**Q: What if fixing a violation introduces a new bug?**
A: Document the issue in this file and escalate to user. Don't ship bugs to work around compliance.

**Q: Who's responsible for compliance?**
A: All agents (C, G, J). But Claude (C) owns the audit and prioritization. Compliance is checked before every commit.

**Q: Can I make an exception to a ground rule?**
A: No. The rules are immutable. If you believe a rule should change, document in `AI_FEEDBACK.md` and wait for user approval.

---

## TRACKING PROGRESS

This document is a **living audit**. Update it as:
1. New violations are discovered
2. Fixes are completed
3. Priorities change (escalate to user)

**Who Updates This:**
- Claude (C): Add new findings, mark fixes as complete
- All agents: Report violations found during coding
- User: Approve prioritization, decide which fixes are urgent

---

**Created:** 2026-02-15 (Phase 1a Complete)
**Next Review:** 2026-02-22 (End of Phase 1b)
**Owned By:** Claude (C)
**Visibility:** All agents, User
