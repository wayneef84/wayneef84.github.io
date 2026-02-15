# F.O.N.G. Ground Rules Compliance Checklist

**Purpose:** Agent self-verification tool to catch violations before committing
**Owner:** All agents (Claude, Gemini, Jules)
**Usage:** Run checks locally before `git push` to ensure no violations introduced

---

## QUICK CHECK (Before Every Commit)

```bash
# 1. ES6+ Syntax Check
grep -r "const \|let \|\?\.\|??\|=>" /games/ /projects/ --include="*.js" | grep -v node_modules | grep -v test

# 2. Absolute Path Check
grep -r "href=\"/" /games/ /projects/ --include="*.html" \
grep -r "src=\"/" /games/ /projects/ --include="*.html" \
grep -r "url('/" /games/ /projects/ --include="*.css"

# 3. CDN URL Check
grep -r "cdn\|googleapis\|unpkg\|jsdelivr\|cdnjs\|bootstrap.com" /games/ /projects/ --include="*.html" --include="*.js" --include="*.css"

# 4. Documentation Check
# Did you update ARCHITECTURE.md, TODO.md, AI_FEEDBACK.md, CHANGELOG.md?
```

---

## DETAILED CHECKS BY RULE

### Rule 1: Local-Only Asset Law

#### What to Check
- No external fonts (Google Fonts, typekit.com, fonts.adobe.com)
- No Bootstrap/Tailwind CDNs
- No Font Awesome or Material Icons from CDN
- No jQuery/React/Vue/Angular CDNs
- No image hosting services (Imgur, Unsplash, Pexels, etc.)

#### Grep Patterns

**Find CDN imports:**
```bash
# Google Fonts
grep -r "fonts.googleapis.com\|fonts.gstatic.com" . --include="*.html" --include="*.css"

# Bootstrap/Tailwind CDN
grep -r "bootstrap.*cdn\|tailwind.*cdn\|getbootstrap.com" . --include="*.html"

# JavaScript CDNs
grep -r "unpkg.com\|jsdelivr.net\|cdnjs.cloudflare.com" . --include="*.html"

# Any CDN pattern
grep -r "https://.*cdn\|https://.*cloudflare" . --include="*.html" --include="*.js" --include="*.css"
```

**Check for external image URLs:**
```bash
# Image hosting services
grep -r "imgur\|unsplash\|pexels\|pixabay\|cloudinary" . --include="*.html" --include="*.js"
```

#### Corrections

**Before:**
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css" rel="stylesheet">
<img src="https://imgur.com/abc123.png" alt="Logo">
```

**After:**
```html
<!-- Download fonts locally first: wget https://fonts.googleapis.com/.../roboto.woff2 -->
<link href="fonts/roboto.css" rel="stylesheet">
<!-- Copy bootstrap.css locally -->
<link href="css/bootstrap-local.css" rel="stylesheet">
<!-- Host image locally -->
<img src="images/logo.png" alt="Logo">
```

---

### Rule 2: Syntax Law (Strict ES5)

#### What to Check
No modern JavaScript syntax in:
- Game logic files (`game.js`, `ruleset.js`, `engine.js`)
- Utility files (`utils.js`, `manager.js`)
- Component files (`player.js`, `card.js`)

#### Grep Patterns

**Find const/let (forbidden):**
```bash
grep -rn "^\s*const \|^\s*let " /games/ /projects/ --include="*.js" | grep -v "//.*const\|//.*let"
```

**Find arrow functions (forbidden):**
```bash
grep -rn " => " /games/ /projects/ --include="*.js" | grep -v "//.*=>"
```

**Find nullish coalescing (forbidden):**
```bash
grep -rn "??" /games/ /projects/ --include="*.js" | grep -v "//.*??"
```

**Find optional chaining (forbidden):**
```bash
grep -rn "\?\." /games/ /projects/ --include="*.js" | grep -v "//.*?\."
```

**Find class keyword (forbidden):**
```bash
grep -rn "^\s*class " /games/ /projects/ --include="*.js" | grep -v "//.*class"
```

**Find async/await (forbidden):**
```bash
grep -rn "async \|await " /games/ /projects/ --include="*.js" | grep -v "//.*async\|//.*await"
```

**Find template literals (forbidden):**
```bash
grep -rn '`.*\${' /games/ /projects/ --include="*.js"
```

**Find spread operator (forbidden):**
```bash
grep -rn "\.\.\." /games/ /projects/ --include="*.js" | grep -v "//.*\.\.\."
```

#### Corrections

**Before:**
```javascript
const config = { speed: 10, lives: 3 };
const { speed, lives } = config;
const updateSpeed = (newSpeed) => config.speed = newSpeed;
const size = config.size ?? 5;
const health = config?.player?.health;

class GameEngine {
    async init() {
        const data = await fetch('data.json').then(r => r.json());
        return `Game initialized with ${data.name}`;
    }
}

const items = [...array1, ...array2];
```

**After:**
```javascript
var config = { speed: 10, lives: 3 };
var speed = config.speed;
var lives = config.lives;
var updateSpeed = function(newSpeed) { config.speed = newSpeed; };
var size = config.size !== undefined ? config.size : 5;
var health = config && config.player && config.player.health ? config.player.health : null;

var GameEngine = function() {
    this.init = function() {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'data.json');
        xhr.onload = function() {
            var data = JSON.parse(xhr.responseText);
            self.initData = data;
        };
        xhr.send();
    };
};

var items = array1.concat(array2);
```

---

### Rule 3: Build Law (Zero Build Tools)

#### What to Check
- No Webpack config files (`webpack.config.js`, `webpack.prod.js`, `webpack.dev.js`)
- No Babel config files (`.babelrc`, `babel.config.js`)
- No build scripts in `package.json` (except optional dev tools)
- No TypeScript files (`.ts`, `.tsx`)
- No Sass/SCSS compilation (but `.scss` files are OK if output CSS is committed)

#### Grep Patterns

**Find build tool configs:**
```bash
find . -name "webpack.config.js" -o -name "webpack.*.js" -o -name ".babelrc*" -o -name "babel.config.js" -o -name "tsconfig.json" -o -name "rollup.config.js"
```

**Check package.json for build scripts:**
```bash
grep -A 20 '"scripts"' package.json | grep "build\|webpack\|babel\|tsc\|sass"
```

**Find TypeScript files:**
```bash
find /games /projects -name "*.ts" -o -name "*.tsx"
```

---

### Rule 4: Pathing Law (Relative Links Only)

#### What to Check
All HTML, CSS, and navigation links use relative paths (no leading `/`)

#### Grep Patterns

**Find absolute href paths in HTML:**
```bash
grep -rn 'href="/' /games/ /projects/ --include="*.html"
```

**Find absolute src paths in HTML:**
```bash
grep -rn 'src="/' /games/ /projects/ --include="*.html"
```

**Find absolute paths in CSS:**
```bash
grep -rn "url('/" /games/ /projects/ --include="*.css"
grep -rn 'url("/\|url(/' /games/ /projects/ --include="*.css"
```

**Find absolute paths in JavaScript (if used for linking):**
```bash
grep -rn 'location.href = "/' /games/ /projects/ --include="*.js"
grep -rn 'window.location = "/' /games/ /projects/ --include="*.js"
```

#### Corrections

**Before:**
```html
<!-- In /games/slots/index.html -->
<link rel="stylesheet" href="/css/style.css">
<script src="/js/app.js"></script>
<img src="/images/logo.png" alt="Logo">
<a href="/index.html">Home</a>
<a href="/games/cards/blackjack/index.html">Blackjack</a>
```

**After:**
```html
<!-- In /games/slots/index.html -->
<!-- Up 2 levels to root, then into css/ -->
<link rel="stylesheet" href="../../css/style.css">
<script src="../../js/app.js"></script>
<img src="../../images/logo.png" alt="Logo">
<!-- Up 2 levels to root, then into index.html -->
<a href="../../index.html">Home</a>
<!-- Up 2 levels to /games/, then into cards/blackjack/ -->
<a href="../cards/blackjack/index.html">Blackjack</a>
```

**Before (CSS):**
```css
body { background-image: url('/images/bg.png'); }
@font-face {
    font-family: 'RobotoFont';
    src: url('/fonts/roboto.woff2');
}
```

**After (CSS):**
```css
/* In /css/style.css, images are at /images/, which is up one level then into images/ */
body { background-image: url('../images/bg.png'); }
@font-face {
    font-family: 'RobotoFont';
    /* In /css/style.css, fonts are at /fonts/, up one level then into fonts/ */
    src: url('../fonts/roboto.woff2');
}
```

---

### Rule 5: Deployment Law (Dev Branch Sovereignty)

#### What to Check
- Are you working on `dev` branch?
- Have you made commits to `main` directly?
- Have you used `--force-push`?

#### Commands to Verify

**Check current branch:**
```bash
git branch --show-current
# Should output: dev (or develop)
```

**Check if main has unpushed commits:**
```bash
git log main --not dev --oneline
# Should output: (nothing)
```

**Check for force push history:**
```bash
git reflog | grep -i "force\|reset"
# Should output: (nothing) or only approved force-pushes
```

#### Corrections

**Before:**
```bash
git checkout main
git commit -m "New feature"
git push origin main
```

**After:**
```bash
git checkout dev
git commit -m "New feature"
git push origin dev
# Wait for user approval before merging to main
```

---

### Rule 6: Architecture Law (Federated Dependencies)

#### What to Check
- Did you check the game's `INFO.md` before using its declared dependency?
- Did you upgrade any dependencies without approval?
- Did you modify another game's `INFO.md`?

#### Verification

**Before coding, check target game's dependencies:**
```bash
cat /games/cards/blackjack/INFO.md | grep -A 10 "Dependencies"
# Check what versions it declares
```

**If you need to upgrade a dependency:**
```bash
# 1. Document the request in AI_FEEDBACK.md
# 2. Get user approval
# 3. Update only your game's INFO.md
# 4. Test thoroughly
# 5. Commit info + code together
```

#### Corrections

**Before (automatic upgrade):**
```javascript
// Blackjack is on shared v1.0.0
// New feature in v1.0.1 exists
// Agent uses it without permission
var hand = this.sharedEngine.splitCards(hand);  // Doesn't exist in v1.0.0
```

**After (request approval first):**
```javascript
// In AI_FEEDBACK.md, document:
// "Blackjack would benefit from shared v1.0.1 (adds splitCards).
//  Current version: v1.0.0. Request user approval."

// After user approves:
// 1. Update /games/cards/blackjack/INFO.md:
//    Dependencies:
//    - Shared Card Engine: v1.0.1  (was v1.0.0)
// 2. Use the new feature:
var hand = this.sharedEngine.splitCards(hand);
// 3. Test and commit
```

---

### Rule 7: Documentation Law (Docs Precede Code)

#### What to Check
- Is there a matching ARCHITECTURE.md for major changes?
- Have you updated CHANGELOG.md, TODO.md, README.md as needed?
- Did you update AI_FEEDBACK.md at the end of your session?

#### File Checklist

**Before committing, verify:**
```bash
# 1. If adding new feature, does ARCHITECTURE.md exist/updated?
ls -la /games/[game]/ARCHITECTURE.md
ls -la /projects/[project]/ARCHITECTURE.md

# 2. If completing a task, is TODO.md updated?
grep "✅" /games/[game]/TODO.md

# 3. If releasing, is CHANGELOG.md updated?
head -20 /games/[game]/CHANGELOG.md

# 4. Did I update AI_FEEDBACK.md?
tail -50 /Users/wayneef/Documents/GitHub/wayneef84.github.io/AI_FEEDBACK.md
```

#### Corrections

**Before:**
```bash
git add games/cards/euchre/game.js
git commit -m "Implement Euchre game logic"
# Missing: ARCHITECTURE.md, TODO.md updates
```

**After:**
```bash
# 1. Update ARCHITECTURE.md (or create it) BEFORE coding
# 2. After coding, update:
git add games/cards/euchre/ARCHITECTURE.md
git add games/cards/euchre/TODO.md
git add games/cards/euchre/game.js
git add /Users/wayneef/Documents/GitHub/wayneef84.github.io/AI_FEEDBACK.md
git commit -m "feat: Implement Euchre core game logic

- Added state machine (IDLE → BETTING → DEALING → PLAY → RESOLUTION)
- Implemented basic turn flow
- Added hand evaluation ruleset
- TODO: AI opponent, sound effects

Docs updated: ARCHITECTURE.md, TODO.md, AI_FEEDBACK.md"
```

---

### Rule 8: Compliance Law (License & Legal)

#### What to Check
- Is the library/code in LICENSE_AUDIT.md?
- Did you update LICENSE_AUDIT.md immediately after adding something?

#### Verification

**Before importing, check:**
```bash
grep "libraryname" /Users/wayneef/Documents/GitHub/wayneef84.github.io/LICENSE_AUDIT.md
```

**If not found:**
1. Read the library's license file
2. Add to LICENSE_AUDIT.md
3. Commit with message: `license: Add [library] [version] [type]`

#### Corrections

**Before:**
```javascript
// Adding a new library (poker hand evaluator)
import handevaluator from 'poker-evaluator';  // Not in LICENSE_AUDIT.md!
```

**After:**
```javascript
// 1. Check LICENSE_AUDIT.md
grep "poker-evaluator" /LICENSE_AUDIT.md
# Not found

// 2. Download and review license
# Visit: https://github.com/[author]/poker-evaluator
# License: MIT

// 3. Add to LICENSE_AUDIT.md:
// | poker-evaluator | v1.0.0 | Local | MIT | Hand evaluation for poker |

// 4. Download to repo
wget https://[url]/poker-evaluator.js -O games/lib/poker-evaluator.js

// 5. Commit
git add games/lib/poker-evaluator.js LICENSE_AUDIT.md
git commit -m "license: Add poker-evaluator v1.0.0 (MIT)"

// 6. Use in code (no external import)
var handEval = PokerEvaluator;  // Loaded from local file
```

---

### Rule 9: UI/UX Law (Naming and Mobile-First)

#### What to Check
- Does visible text say "F.O.N.G." (not "Fong" or "Fong Family")?
- Is CSS mobile-first (1-column → 2-column → 4-column)?
- Are touch targets at least 44px?
- Do bottom elements use `env(safe-area-inset-bottom)`?

#### Grep Patterns

**Find non-F.O.N.G. brand names:**
```bash
grep -rn "Fong Family Arcade\|Fong Zone\|Fong Games" /games/ /projects/ --include="*.html" --include="*.js"
# Should return: (nothing)
```

**Check for desktop-first CSS:**
```bash
grep -n "grid-template-columns: repeat(4" /games/ /projects/ --include="*.css" | head -1
# Check: Is this BEFORE any @media query, or AFTER?
# If BEFORE first @media, it's desktop-first (WRONG)
```

#### Corrections

**Before (Brand):**
```html
<h1>Fong Family Arcade</h1>
<meta name="description" content="Fong Zone - Play Classic Games">
```

**After (Brand):**
```html
<h1>F.O.N.G. Arcade</h1>
<meta name="description" content="F.O.N.G. - Play Classic Games">
```

**Before (Desktop-First CSS):**
```css
.game-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);  /* 4 columns (desktop) */
    gap: 16px;
}

@media (max-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(2, 1fr);  /* 2 columns (tablet) */
    }
}

@media (max-width: 480px) {
    .game-grid {
        grid-template-columns: 1fr;  /* 1 column (mobile) */
    }
}
```

**After (Mobile-First CSS):**
```css
.game-grid {
    display: grid;
    grid-template-columns: 1fr;  /* 1 column (mobile) */
    gap: 16px;
}

@media (min-width: 480px) {
    .game-grid {
        grid-template-columns: repeat(2, 1fr);  /* 2 columns (tablet) */
    }
}

@media (min-width: 768px) {
    .game-grid {
        grid-template-columns: repeat(4, 1fr);  /* 4 columns (desktop) */
    }
}
```

**Before (Small touch targets):**
```css
button { padding: 4px 8px; height: 24px; }
```

**After (44px touch targets):**
```css
button {
    padding: 12px 16px;
    min-height: 44px;
    min-width: 44px;
}
```

**Before (No safe area):**
```css
footer { padding: 16px; }
```

**After (Safe area for iPhone X+):**
```css
footer {
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

---

## AUTOMATED SCRIPT (Optional)

Save this as `check_ground_rules.sh` in `/admin/`:

```bash
#!/bin/bash

echo "=== F.O.N.G. Ground Rules Compliance Check ==="
echo ""

VIOLATIONS=0

# Rule 2: ES5 Syntax
echo "Checking Rule 2: ES5 Syntax..."
ES6_COUNT=$(grep -r "const \|let \|=>\|??\|?\.\|class " /games /projects --include="*.js" 2>/dev/null | wc -l)
if [ $ES6_COUNT -gt 0 ]; then
    echo "❌ Found $ES6_COUNT ES6+ violations"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No ES6+ syntax found"
fi

# Rule 1: CDN
echo "Checking Rule 1: CDN URLs..."
CDN_COUNT=$(grep -r "cdn\|googleapis\|unpkg\|jsdelivr" /games /projects --include="*.html" --include="*.css" 2>/dev/null | wc -l)
if [ $CDN_COUNT -gt 0 ]; then
    echo "❌ Found $CDN_COUNT CDN references"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No CDN URLs found"
fi

# Rule 4: Absolute Paths
echo "Checking Rule 4: Absolute Paths..."
ABS_PATHS=$(grep -r "href=\"/" /games /projects --include="*.html" 2>/dev/null | wc -l)
ABS_PATHS=$((ABS_PATHS + $(grep -r "src=\"/" /games /projects --include="*.html" 2>/dev/null | wc -l)))
if [ $ABS_PATHS -gt 0 ]; then
    echo "❌ Found $ABS_PATHS absolute paths"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ No absolute paths found"
fi

echo ""
echo "Total violations: $VIOLATIONS"
if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ All checks passed!"
    exit 0
else
    echo "❌ Fix violations before committing"
    exit 1
fi
```

**Usage:**
```bash
chmod +x admin/check_ground_rules.sh
./admin/check_ground_rules.sh
```

---

## BEFORE COMMITTING: FINAL CHECKLIST

- [ ] Ran ground rules check script (or manual grep checks)
- [ ] No ES5 syntax violations (const, let, arrow functions, ??, ?.)
- [ ] No external CDNs (Google Fonts, Bootstrap CDN, etc.)
- [ ] All paths are relative (no leading `/`)
- [ ] On `dev` branch (not `main`)
- [ ] Updated ARCHITECTURE.md (if major feature)
- [ ] Updated CHANGELOG.md or TODO.md
- [ ] Updated AI_FEEDBACK.md with session summary
- [ ] Commit message references game/project and is descriptive
- [ ] Used "F.O.N.G." in any user-visible text
- [ ] CSS is mobile-first (1 column → expand)
- [ ] Touch targets are 44px minimum
- [ ] Safe areas handled (`env(safe-area-inset-bottom)`)

---

## QUESTIONS / CLARIFICATIONS

If you encounter a check that doesn't make sense, or a violation you're unsure about:

1. **Document in AI_FEEDBACK.md** with the question and context
2. **Don't assume.** Wait for user clarification.
3. **Example:** "Question: Does adding IndexedDB for offline caching violate Local-Only Asset Law?"

---

**Last Updated:** 2026-02-15
**Version:** v1.0
**Status:** Active
