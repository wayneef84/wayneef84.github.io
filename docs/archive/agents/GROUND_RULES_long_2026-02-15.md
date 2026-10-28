# F.O.N.G. Ground Rules (C-G-J Alliance)

**Status:** IMMUTABLE FOUNDATION DOCUMENT
**Established:** 2026-02-15
**Owner:** Wayne (User) - Authority to modify only
**Enforcement:** Required reading for all agents (Claude, Gemini, Jules) at session start

---

## MANDATE

This document supersedes all other architectural decisions, design preferences, and technical recommendations from AI agents. When an agent's suggestion conflicts with these ground rules, **the ground rules always win**. These laws exist to prevent architectural drift, context hallucination, merge conflicts, and platform fragmentation across the C-G-J collaboration model.

**Acknowledgment Protocol:** Every agent must confirm they have read and understood these rules by including this statement in their first `AI_FEEDBACK.md` entry of each session:
> "I have reviewed F.O.N.G. GROUND_RULES.md and confirm understanding of all 9 laws."

---

## RULE 1: The Local-Only Asset Law (Strict Localization)

### The Law
Every single file, asset, font, script, and stylesheet required to run the F.O.N.G. platform **must be hosted locally** within the repository itself. **Zero external Content Delivery Networks (CDNs) are permitted.**

### Scope
This includes but is not limited to:
- ❌ Google Fonts (use system fonts or local font files)
- ❌ Bootstrap CDN, Tailwind CDN, or any CSS library CDN
- ❌ jQuery CDN, React CDN, or other JS library CDNs (unpkg, jsDelivr, cdnjs)
- ❌ External icon libraries (Font Awesome, Material Icons from CDN)
- ❌ Image hosting services (Imgur, CloudFlare Images, etc.)
- ✅ Local `/fonts/` directory with .woff/.ttf files
- ✅ Local `/css/` directory with all stylesheets
- ✅ Local `/js/` directory with all scripts
- ✅ Local `/assets/` directory with images/icons

### Exception
The **only** permissible external calls are for:
1. **Cloud-based state management** (e.g., cloud save syncing, cross-device profile)
2. **Global high scores** (e.g., leaderboard backend)

These must be **strictly quarantined** to their specific functions with explicit user opt-in.

### Why This Rule Exists
- **Offline-first philosophy:** The arcade should work without internet after first load
- **Performance:** No CDN latency, no DNS lookups, predictable load times
- **Privacy:** No third-party tracking, no data leakage to external servers
- **Control:** We own all code and can audit it completely

### Examples of Violations & Corrections

**Violation:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css">
```

**Correction:**
```html
<!-- Download fonts locally to /fonts/ -->
<link rel="stylesheet" href="fonts/roboto.css">
<!-- Use local CSS, not Bootstrap CDN -->
<link rel="stylesheet" href="css/bootstrap-local.css">
```

---

## RULE 2: The Syntax Law (Strict ES5)

### The Law
ES5 compatibility is **non-negotiable**. All JavaScript must be written in ES5 (ECMAScript 5, 2009 standard) to ensure maximum compatibility on older tablets.

### Forbidden Syntax
- ❌ `const` and `let` (use `var` instead)
- ❌ Arrow functions (use `function() {}` instead)
- ❌ Template literals (use string concatenation instead)
- ❌ Destructuring (`const { x, y } = obj`)
- ❌ Spread operator (`...array`)
- ❌ Nullish coalescing (`??`)
- ❌ Optional chaining (`?.`)
- ❌ `class` keyword (use IIFE or prototype pattern)
- ❌ `async/await` (use callbacks or promises)
- ❌ `Set`, `Map`, `Symbol`, `Proxy`
- ❌ Arrow functions in methods
- ❌ Default parameters

### Allowed ES5+ Features (Safe)
- ✅ `var` declarations
- ✅ Regular `function() {}` declarations
- ✅ String concatenation with `+`
- ✅ `for`, `while`, `if/else`, `switch`
- ✅ Arrays with `.push()`, `.pop()`, `.map()`, `.filter()`, `.reduce()`
- ✅ Objects with properties and methods
- ✅ `JSON.parse()` and `JSON.stringify()`
- ✅ `setTimeout()`, `setInterval()`
- ✅ Regular expressions
- ✅ `new Date()` and date methods
- ✅ Promises (but not `async/await`)

### Why This Rule Exists
- **Device compatibility:** Many family members use tablets from 2012-2016
- **Predictability:** No transpiler means no hidden behavior changes
- **Browser support:** iOS Safari 9+, Android 4.4+ (worst case)
- **Auditability:** We can understand every line without build tools

### Examples of Violations & Corrections

**Violation:**
```javascript
const gameState = { score: 0, lives: 3 };
const { score, lives } = gameState;
const updateScore = (points) => score += points;
gameState.combo ??= 1;
```

**Correction:**
```javascript
var gameState = { score: 0, lives: 3 };
var score = gameState.score;
var lives = gameState.lives;
var updateScore = function(points) { gameState.score += points; };
gameState.combo = gameState.combo || 1;
```

---

## RULE 3: The Build Law (Zero Build Tools)

### The Law
The project **runs directly in the browser.** No build tools, transpilers, bundlers, or preprocessors are permitted.

### Forbidden Tools
- ❌ Webpack, Parcel, Rollup, esbuild
- ❌ Babel, TypeScript compiler
- ❌ Sass/SCSS compiler
- ❌ PostCSS
- ❌ Minifiers (unless for release only, after user approval)
- ❌ npm scripts that preprocess code before deployment

### Allowed Tools
- ✅ Plain HTML, CSS, JavaScript
- ✅ CSS preprocessors **only if** output CSS is committed to repo (not compiled on-the-fly)
- ✅ Version control (Git)
- ✅ Development servers (for testing only, not deployment)
- ✅ Testing frameworks (Playwright, but tests don't affect deployed code)

### Why This Rule Exists
- **Speed:** Files load instantly, no build step before deployment
- **Simplicity:** New developers (or future LLMs) can understand code without toolchain knowledge
- **Debugging:** Browser DevTools can see and debug source code directly
- **Portability:** Can run the codebase on any machine without npm dependencies

### Examples of Violations & Corrections

**Violation:**
```bash
# In package.json
"build": "webpack --config webpack.config.js"
"deploy": "npm run build && git push"
```

**Correction:**
```bash
# No build step
# Just commit code directly and push to dev branch
git add .
git commit -m "Update game UI"
git push origin dev
```

---

## RULE 4: The Pathing Law (Relative Links Only)

### The Law
**Absolute paths are strictly forbidden.** All links, including CSS, JavaScript, images, and navigation `href` attributes, must be formatted as **relative paths**.

### Why Relative Paths Matter
When the app runs in the `/beta` subfolder (preview deployment), absolute paths break:
- `<link rel="stylesheet" href="/css/style.css">` → Looks for `/css/` at domain root ❌
- `<link rel="stylesheet" href="css/style.css">` → Looks for `css/` relative to current file ✅

### Forbidden Pathing
- ❌ `/css/style.css` (absolute from root)
- ❌ `/js/app.js` (absolute from root)
- ❌ `/images/logo.png` (absolute from root)
- ❌ `https://example.com/assets/file` (external URL unless whitelisted)

### Allowed Pathing
- ✅ `css/style.css` (relative, same directory level)
- ✅ `./css/style.css` (relative, explicit current directory)
- ✅ `../css/style.css` (relative, up one level)
- ✅ `../../assets/img.png` (relative, up multiple levels)

### Scope
This applies to:
- All `<link>` tags (stylesheets)
- All `<script>` tags (JavaScript files)
- All `<img>` tags (images)
- All `<a>` tags (navigation, except external links)
- All `href` attributes in navigation menus
- All `src` attributes loading content

### Why This Rule Exists
- **Beta deployment:** The preview URL is `https://username.github.io/repo-name/beta/`
- **Subdirectory support:** App must work in any subdirectory
- **Portability:** Can move project to different domain without breaking links

### Examples of Violations & Corrections

**Violation:**
```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="/css/style.css">
    <script src="/js/app.js"></script>
</head>
<body>
    <img src="/images/logo.png" alt="Logo">
    <a href="/index.html">Home</a>
    <a href="/games/slots/index.html">Slots Game</a>
</body>
</html>
```

**Correction:**
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Same directory level -->
    <link rel="stylesheet" href="css/style.css">
    <script src="js/app.js"></script>
</head>
<body>
    <img src="images/logo.png" alt="Logo">
    <!-- Relative to current file -->
    <a href="./index.html">Home</a>
    <!-- Navigate to sibling directory -->
    <a href="../games/slots/index.html">Slots Game</a>
</body>
</html>
```

---

## RULE 5: The Deployment Law (Dev Branch Sovereignty)

### The Law
- ✅ **All active development** must occur on the `dev` (or `develop`) branch
- ❌ **Never push or force-push directly** to the `main` branch
- The `dev` branch is automatically deployed to the preview URL: `https://username.github.io/repo-name/beta/`
- **Only the user** may merge from `dev` to `main` (production) after review and approval

### Branch Workflow

```
dev branch (preview @ /beta/)
    ↓ user approves
main branch (production @ root domain)
```

### Forbidden Actions
- ❌ `git push origin main` directly (must go through `dev` first)
- ❌ `git push --force-with-lease` to any branch without explicit approval
- ❌ Merging into `main` without user review
- ❌ Committing directly to `main` in a session

### Allowed Actions
- ✅ Work on feature branches (`feature/game-name`, `fix/bug-id`, etc.)
- ✅ Push feature branches to GitHub
- ✅ Create pull requests from feature → `dev`
- ✅ Merge into `dev` after agent review (C-G-J consensus)
- ✅ Wait for user approval before `dev` → `main`

### Why This Rule Exists
- **Safety:** Live production is never accidentally broken by in-progress work
- **Testing:** The `/beta` preview lets users (and agents) test before going live
- **Audit trail:** `main` branch always contains stable, approved code
- **Collaboration:** Clear separation between "experimental" and "production"

### Examples of Violations & Corrections

**Violation:**
```bash
# Agent pushes directly to production
git checkout main
git commit -m "Add new feature"
git push origin main
```

**Correction:**
```bash
# Agent works on dev
git checkout dev
git commit -m "Add new feature"
git push origin dev

# User reviews and approves
# User merges dev → main manually or via GitHub UI
```

---

## RULE 6: The Architecture Law (Federated Dependencies)

### The Law
- ✅ Agents **must not auto-upgrade** dependencies without explicit user approval
- ✅ Agents **only use APIs** available in the declared version in a game's `INFO.md` file
- ✅ Agents **must not modify** the `INFO.md` files of other games

### How It Works

Each game declares its dependencies in `[game]/INFO.md`:

```markdown
## Dependencies
- Shared Card Engine: v1.0.1
- Web Audio API: Native browser
```

Agents must:
1. Read the game's `INFO.md` before coding
2. Use only APIs available in that version
3. If a new version of shared library exists, **alert the user**, don't auto-upgrade

### Example Scenario

**Game:** `games/cards/blackjack/`
**Current:** Shared v1.0.0
**Available:** Shared v1.0.1 (new feature: `splitCards()`)

**Wrong:**
```javascript
// Agent uses v1.0.1 feature without checking version
var hand = this.sharedEngine.splitCards(hand);  // ERROR: method doesn't exist in v1.0.0
```

**Correct:**
1. Agent checks `INFO.md` → sees v1.0.0
2. Agent finds v1.0.1 available in `/INFO.md` (root registry)
3. Agent alerts user: "Blackjack is on v1.0.0. v1.0.1 available with `splitCards()` feature. Upgrade?"
4. If user approves: Update `INFO.md` in blackjack folder, test thoroughly, commit
5. If user declines: Find workaround using v1.0.0 APIs

### Why This Rule Exists
- **Stability:** Games don't break due to surprise dependency updates
- **Control:** User approves version bumps (especially major versions)
- **Isolation:** Each game can be on different library versions temporarily
- **Testing:** Upgrades are intentional, tested, documented

---

## RULE 7: The Documentation Law (Docs Precede Code)

### The Law
- ✅ **Agents must write `ARCHITECTURE.md` BEFORE coding** (for major features)
- ✅ **Agents must update project documentation** when making changes
- ✅ **Agents must update `AI_FEEDBACK.md` every session** (inter-agent log)

### Documentation Files to Maintain

| File | When to Update | Who | Example |
|------|---|---|---|
| `[project]/ARCHITECTURE.md` | Before implementing major features | Claude (C) | "Adding multi-hand support to Blackjack" |
| `[project]/CHANGELOG.md` | After releasing new version | Claude (C) | "v1.1.0: Added split hand support" |
| `[project]/TODO.md` | After completing or creating tasks | Claude (C) | Mark tasks ✅ when done |
| `[project]/README.md` | When changing user-facing features | Gemini (G) | "New button layout for mobile" |
| `[project]/INFO.md` | When updating versions or metadata | Claude (C) | Version bumps, dependency changes |
| `/AI_FEEDBACK.md` | End of every session | All agents | Session summary, lessons learned |
| `/CLAUDE.md`, `/GEMINI.md`, `/JULES.md` | When role changes or new protocols emerge | Relevant agent | Agent-specific guidelines |

### Why This Rule Exists
- **Knowledge transfer:** Future LLMs can understand decisions without re-reading code
- **Continuity:** Sessions don't regress due to lost context
- **Accountability:** Decisions are documented, not assumed
- **Collaboration:** C-G-J can coordinate by reading docs, not messaging

### Example Workflow

```
User: "Add split hand support to Blackjack"

1. Claude reads current ARCHITECTURE.md
2. Claude writes NEW ARCHITECTURE.md section: "Multi-Hand System"
3. Claude shares with Gemini & Jules: "Here's the plan..."
4. All agents approve the architecture
5. ONLY THEN: Implement code
6. After: Update CHANGELOG.md, TODO.md, AI_FEEDBACK.md
7. Commit all docs + code together
```

---

## RULE 8: The Compliance Law (License & Legal)

### The Law
- ✅ `/LICENSE_AUDIT.md` is the **single source of truth** for all third-party code and libraries
- ✅ **Agents must read** `LICENSE_AUDIT.md` **before importing** any new code
- ✅ **Agents must update immediately** if adding a library
- ✅ **Agents must adhere** to data and legal policies for each project

### Enforcement

**Before importing anything:**
```
1. Check: Is it in LICENSE_AUDIT.md already?
2. If YES: Verify license is compatible
3. If NO: Read the license terms
4. If compatible: Add to LICENSE_AUDIT.md immediately
5. Commit with message: "license: Add [library] [version] [license-type]"
```

### Why This Rule Exists
- **Legal safety:** Avoid GPL/proprietary license violations
- **Transparency:** Users know what third-party code is in the project
- **Maintenance:** Know which libraries are used and when to update them
- **Attribution:** Proper credit to open-source authors

---

## RULE 9: The UI/UX Law (Naming and Mobile-First)

### The Law
- ✅ **All user-facing text** must use "**F.O.N.G.**" (never "Fong Family Arcade" or abbreviations)
- ✅ **CSS must be "Mobile First"** - design for small screens first, then expand
- ✅ **Touch targets minimum 44px** (Apple HIG standard)
- ✅ **Use `env(safe-area-inset-bottom)`** for iPhone X+ notch/home button area

### Naming Convention

| Context | Correct | Incorrect |
|---------|---------|-----------|
| Page title | F.O.N.G. Arcade | Fong Family Arcade |
| Header text | Welcome to F.O.N.G. | Welcome to Fong |
| Meta tags | F.O.N.G. - Game Collection | Fong Arcade Games |
| Error messages | F.O.N.G. requires JavaScript | This site requires JS |
| Brand | F.O.N.G. Protocol | Fong Protocol |

### Mobile-First CSS Example

**Wrong (Desktop-First):**
```css
.game-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);  /* 4 columns always */
    gap: 16px;
}

@media (max-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(2, 1fr);  /* Shrink to 2 */
    }
}

@media (max-width: 480px) {
    .game-grid {
        grid-template-columns: 1fr;  /* Shrink to 1 */
    }
}
```

**Correct (Mobile-First):**
```css
.game-grid {
    display: grid;
    grid-template-columns: 1fr;  /* Start with 1 column (mobile) */
    gap: 16px;
}

@media (min-width: 480px) {
    .game-grid {
        grid-template-columns: repeat(2, 1fr);  /* Expand to 2 (tablet) */
    }
}

@media (min-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(4, 1fr);  /* Expand to 4 (desktop) */
    }
}
```

### Touch Target Sizing

**Wrong:**
```css
button { padding: 4px 8px; }  /* Too small, hard to tap */
```

**Correct:**
```css
button {
    padding: 12px 16px;  /* Minimum 44px height/width */
    min-height: 44px;
    min-width: 44px;
}
```

### Safe Area Support (iPhone X+)

**Wrong:**
```css
footer { padding: 16px; }  /* Covered by home indicator on iPhone X+ */
```

**Correct:**
```css
footer {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

### Why This Rule Exists
- **Brand consistency:** Users recognize "F.O.N.G." across the platform
- **Device support:** Older tablets (4:3 ratio) dominate the arcade's user base
- **Accessibility:** 44px targets are WCAG standard for motor accessibility
- **Notch support:** Tablets and phones with notches need safe area compensation

---

## FAQ: Edge Cases & Clarifications

### Q1: Can I use fetch() if I handle network errors gracefully?
**A:** Yes. `fetch()` is fine (it's ES6 Fetch API but browsers handle it). But make sure errors don't break the game. Offline-first design: assume no network by default.

### Q2: What if a game NEEDS an external service (e.g., multiplayer backend)?
**A:** Design it as **opt-in cloud feature**, quarantined from core gameplay. Main game works 100% offline. Cloud features trigger explicit user dialog: "Save to cloud? (Requires internet)".

### Q3: Can I use localStorage to persist data across sessions?
**A:** Yes. `localStorage` is ES5-safe and perfect for persistence. Just remember it's per-origin, so clear on logout if needed.

### Q4: Do I have to rewrite games that currently use Google Fonts?
**A:** Not immediately. But when you touch that game, migrate to local fonts or system fonts. Flag in `/admin/COMPLIANCE_FIXES.md` for future remediation.

### Q5: What about third-party card images or game assets?
**A:** All assets must be local. If using third-party images, download them and commit to repo. Ensure license compatibility (add to `LICENSE_AUDIT.md`).

### Q6: Can I use Promise.all() or Promise-based APIs?
**A:** Yes. Promises are ES6 but widely supported in target browsers. Avoid `async/await` though.

### Q7: The Pathing Law says "relative only," but what about root-level assets?
**A:** Even for root-level assets, use relative paths from the current file:
- From `/index.html`: `<link href="css/style.css">`
- From `/games/slots/index.html`: `<link href="../../css/style.css">`

### Q8: I found a game violating multiple rules. Do I fix it or report it?
**A:** Report it in `AI_FEEDBACK.md` or `/admin/COMPLIANCE_FIXES.md`. Don't fix without understanding if it's intentional. User will prioritize fixes.

### Q9: Can a feature branch violate rules if it's not merged to dev yet?
**A:** No. Every commit, even on feature branches, must respect these rules. Make violations part of PR review.

### Q10: What about automated testing tools that use external CDNs?
**A:** Development-only tools (Playwright, testing libraries) can use external resources since they don't affect the deployed app. But **never import test libraries into production code**.

---

## RULE 10: The Documentation Law (Expansion of Rule 7)

### The Law
Every game and project **MUST maintain 7 required documentation files**. When code changes, the corresponding documentation **MUST** be updated in the **SAME COMMIT**. Documentation rot is a compliance violation.

### Required Files
All 7 files are mandatory:
1. **README.md** (3-5 KB) - User-facing overview, how to play, features, status
2. **ARCHITECTURE.md** (3-5 KB) - Technical design, file structure, key concepts, dependencies
3. **INFO.md** (1 KB) - Version, status, created date, last updated, dependencies list
4. **TODO.md** (2-3 KB) - Roadmap, known bugs, performance concerns, future ideas
5. **CHANGELOG.md** (2-3 KB) - Version history, what changed per release
6. **CLAUDE.md** (2-3 KB) - Purpose, architecture summary, critical fixes, gotchas
7. **AGENT.md** (1-2 KB) - Developer notes for next agent, recent work, blockers

### Enforcement

**Before Every Commit:**
1. ✅ Check: Do all 7 files exist?
2. ✅ Check: Has each file been updated if code changed?
3. ✅ Check: Does each file have required sections?
4. ✅ Use `/admin/GROUND_RULES_CHECKLIST.md` Rule 10 section

**Violations:**
- Missing files: **BLOCKING** - PR rejected
- Missing sections: **BLOCKING** - PR rejected
- Outdated content: **Warning** - ask for update before merge
- WIP content: **OK** - as long as structure present

### Why This Rule Exists
- **Knowledge transfer:** Future developers can understand decisions without re-reading code
- **Continuity:** Sessions don't regress due to lost context
- **Accountability:** Decisions are documented, not assumed
- **Collaboration:** C-G-J can coordinate by reading docs, not messaging
- **Onboarding:** New agents can get up to speed quickly

### File Size Guidelines

Target breakdown per game/project:
```
README.md (3-5 KB)      - User-focused
ARCHITECTURE.md (3-5 KB) - Technical deep-dive
TODO.md (2-3 KB)        - Roadmap/issues
CHANGELOG.md (2-3 KB)   - Version history
CLAUDE.md (2-3 KB)      - Developer notes
AGENT.md (1-2 KB)       - Session log
INFO.md (1 KB)          - Quick facts

Total: ~17-23 KB per game
```

### Documentation Standard

See `/DOCUMENTATION_STANDARD.md` for:
- Detailed specification of what each file contains
- Required sections for each file
- Template packs in `/admin/DOC_TEMPLATES/`
- Quality criteria and compliance checklist

### Rollout Strategy (User-Approved)

**Phase 1 (NOW - Current):**
- ✅ Standard formalized
- ✅ Templates created
- ✅ Rule 10 added
- ✅ Enforcement mechanism in place

**Phase 2 (Weeks 4-7):**
- Apply 7-file suite to 18 Production tier games
- Verify comprehensive content

**Phase 3 (Weeks 8-10):**
- Apply 7-file suite to 8 Development tier games

**Phase 4 (Weeks 11+):**
- All new code must include 7-file doc suite
- Ongoing compliance checks

### Example Violation & Correction

**Violation:**
```bash
# Agent commits code without updating docs
git add js/game.js
git commit -m "Fix animation bug"
git push origin feature/animation-fix
# ❌ REJECTED: Where's the CHANGELOG.md entry? AGENT.md session notes? Updated CLAUDE.md?
```

**Correction:**
```bash
# Agent commits code WITH docs
git add js/game.js CHANGELOG.md CLAUDE.md AGENT.md TODO.md
git commit -m "fix: Fix animation flash on card deal

- Set visibility: hidden BEFORE DOM insertion
- Updated CHANGELOG.md with v1.1.0 entry
- Updated CLAUDE.md with gotcha note
- Updated AGENT.md with session notes
- Updated TODO.md with completed item"
git push origin feature/animation-fix
# ✅ ACCEPTED: All 7 files maintained
```

### Prompts for Agents

**When Writing a Feature:**
1. "Before you code, write ARCHITECTURE.md or update it"
2. "After you code, update CHANGELOG.md, AGENT.md, and TODO.md in the same commit"
3. "Use /admin/GROUND_RULES_CHECKLIST.md Rule 10 to verify before pushing"

**When Reviewing:**
1. "Did all 7 files get updated in this PR?"
2. "Are the docs accurate and current?"
3. "Does AGENT.md have clear session notes?"

---

## CHANGE LOG

| Date | Author | Change |
|------|--------|--------|
| 2026-02-15 | Wayne (User) | **v1.1** - Added Rule 10 (Documentation Law): 7-file standard for all games/projects |
| 2026-02-15 | Wayne (User) | **v1.0** - Initial ground rules established: 9 laws, FAQ, enforcement mechanism |

---

## ENFORCEMENT MECHANISM

### How Violations Are Caught

1. **Agent Self-Check:** Before committing, agents use `/admin/GROUND_RULES_CHECKLIST.md` to verify compliance
2. **Peer Review:** When agents hand off work (C→G→J), reviewers check for violations
3. **User Review:** Before `dev` → `main` merge, user spot-checks for obvious violations
4. **Automated Checks (Optional):** Pre-commit hooks can grep for ES6+ syntax and CDN URLs

### How to Escalate Questions

If an agent is unsure whether something violates a rule:
1. **Do NOT guess.** Document the question in `AI_FEEDBACK.md`
2. Example: "Question for user: Does Shapefile library violate Local-Only Asset Law if we need to parse geographic data?"
3. Wait for user clarification before proceeding

### What Happens If a Violation Occurs

1. **Minor violation (typo, one-off absolute path):** Agent fixes immediately, mentions in next `AI_FEEDBACK.md` entry
2. **Systemic violation (e.g., entire game uses Google Fonts):** Goes into `/admin/COMPLIANCE_FIXES.md` for prioritized remediation
3. **Architectural violation (e.g., attempt to introduce Webpack):** Rejected by user, escalated in `AGENTS.md` discussion

---

## ACKNOWLEDGMENT STATEMENT

**To be included in each agent's first `AI_FEEDBACK.md` entry of each session:**

```markdown
## Ground Rules Acknowledgment
I, [Agent Name], have read and understand F.O.N.G. GROUND_RULES.md (v1.0+).
I confirm my understanding of all 10 laws and commit to respecting them in this session.

Signed: [Agent] - [Date] [Time] UTC
```

---

## QUESTIONS FOR USERS

Before you finalize these rules, consider:

1. **Should there be a formal review/update cycle?** (e.g., quarterly review of rules)
2. **Any industry-specific compliance requirements** (e.g., COPPA for youth games)?
3. **Are there performance budgets we should enforce?** (e.g., max 500KB total JS)
4. **Should we add a Rule 10 about testing/QA standards?**

---

**Document Status:** IMMUTABLE FOUNDATION
**Last Updated:** 2026-02-15
**Next Review:** User discretion

---

*These ground rules are the foundation of the F.O.N.G. platform. They exist to protect the integrity of the project, prevent architectural drift, and ensure that all agents (C, G, J) are aligned on what "done right" means.*

*Future LLMs: If you believe a rule should be changed, document your reasoning in `AI_FEEDBACK.md` and wait for user approval. Do not override these rules.*
