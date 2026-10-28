# Notes from Claude (C4) to Jules (J) - Overhaul Phase 1.5 Merge Guide

**Date:** 2026-02-05
**Context:** C4 just committed Phase 1.5 (Visual Polish) on `main`. You (J) are working on Card Engine improvements (poker, deal builder). Another J session is on NEGEN - that's unaffected. This doc is about merging MY changes with YOUR card engine work.

---

## What I Changed in Your Territory

### 1. `games/cards/blackjack/index.html`
**Changes:**
- **Line ~830:** Replaced `<input type="number" id="cfgReshuffle">` with `<input type="range">` (slider). Added `<span id="reshuffleLabel">` for live value display.
- **Line ~918:** Added toast container `<div id="toastContainer">` and `.toast-pill` CSS before the `<script>` tags.
- **Line ~1158:** Added `cfgReshuffle.oninput` handler for slider label.
- **Line ~1256:** Added `reshuffleLabel` update in `_loadSettings()`.
- **Line ~1321:** Changed `_showMessage('🔄 Shuffling shoe...', 'info')` to `this._showToast('🔄 Deck Reshuffled')`.
- **Line ~1700:** Added `_showToast(text)` method after `_showMessage()`.

**Merge Risk: LOW** - These are UI additions, not engine logic. Your deal builder and engine changes shouldn't conflict unless you're also touching the settings modal or the `_checkAndReshuffle` method.

### 2. `games/cards/war/index.html`
**Changes:**
- **Line ~892:** Added toast container and `.toast-pill` CSS before `<script>` tags.
- **Line ~1497-1526:** Replaced `_showAutoShuffleFireFlash()` body. Old behavior was a 250ms full-screen flash. New behavior is a toast pill (slide-in from right, 2.5s auto-dismiss). Added `_showToast()` method on `WarUI.prototype`.

**Merge Risk: LOW** - Unless you're touching War's UI layer.

---

## Phase 2 Folder Restructure - What You Need to Know

G wants games reorganized into taxonomic folders:
```
games/
  arcade/   (Snake, Breakout, Pong, Space Invaders, Animal Stack)
  cards/    (Blackjack, War, Poker, Euchre) ← KEEP AS-IS
  board/    (Xiangqi, Chess, Checkers) ← ALREADY HERE
  puzzle/   (Flow, XTC Ball, Tracing)
```

### Critical: DO NOT move `games/cards/`

The `cards/` directory has deep internal relative references:
- `blackjack/index.html` → `<script src="../shared/enums.js">` (6 shared scripts)
- `war/index.html` → same pattern
- `poker/*/index.html` → same pattern
- `cards/index.html` (lobby) → references to `blackjack/`, `war/`, `poker/`
- `test-suite.html`, `test_ruleset.html`, `test.html` → shared references

**Recommendation:** Cards stays at `games/cards/`. Only the arcade games need moving:
- `games/snake/` → `games/arcade/snake/`
- `games/breakout/` → `games/arcade/breakout/`
- `games/pong/` → `games/arcade/pong/`
- `games/space_invaders/` → `games/arcade/space_invaders/`
- `games/animal_stack/` → `games/arcade/animal_stack/`

And puzzle games:
- `games/flow/` → `games/puzzle/flow/`
- `games/xtc_ball/` → `games/puzzle/xtc_ball/`
- `games/tracing/` → `games/puzzle/tracing/`

Slots and Sprunki could go in either arcade or their own category.

### Files That Need Path Updates After Restructure

1. **Root `index.html`** - Current paths (lines 263-333):
   ```
   games/tracing/index.html
   games/slots/index.html
   games/snake/index.html
   games/xtc_ball/index.html
   games/sprunki/index.html
   ```
   All need updating to new locations.

2. **`projects/md-reader/app.js`** - `FILES[]` array (line 20):
   ```javascript
   { category: "Games", name: "Snake Notes", path: "../../games/snake/LL_v2_snake.md" }
   ```
   Needs to become `../../games/arcade/snake/LL_v2_snake.md`.

3. **Individual game `index.html` files** - Check for any cross-game references (e.g., "Back to Arcade" links).

4. **`INFO.md` files** in each game - File paths in dependency declarations may reference relative locations.

5. **Any `*.md` files** that reference game paths (CLAUDE.md, README.md, etc.).

---

## Your Card Engine Work (No Conflicts Expected)

Your poker additions and deal builder work are **inside** `games/cards/` which I didn't structurally change. My changes were purely:
- UI additions (toast system) in blackjack and war HTML files
- Settings UX improvement (slider) in blackjack

If you're adding new files to `games/cards/shared/` (deal builder), no conflict. If you're modifying `engine.js`, no conflict - I didn't touch shared engine files.

### One Note on Toast Reuse

If you want toasts in Poker or new games, the pattern is simple. Add this HTML before your `<script>` tags:
```html
<div id="toastContainer" style="position:fixed; top:20px; right:20px; z-index:500; display:flex; flex-direction:column; gap:8px; pointer-events:none;"></div>
```

And this JS method on your UI object:
```javascript
_showToast: function(text) {
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var pill = document.createElement('div');
    pill.className = 'toast-pill';
    pill.textContent = text;
    container.appendChild(pill);
    setTimeout(function() { pill.classList.add('show'); }, 10);
    setTimeout(function() {
        pill.classList.remove('show');
        setTimeout(function() {
            if (pill.parentNode) pill.parentNode.removeChild(pill);
        }, 300);
    }, 2500);
}
```

**Future consideration:** This should eventually live in `shared/` as a utility. For now it's copy-pasted per game (matches the current no-build-tools architecture).

---

## NEGEN Session Note

Your other session working on NEGEN is unaffected. The toast system and MD Reader changes don't touch `negen/` at all. When NEGEN eventually provides a shared UI toolkit, the toast pattern can be extracted there.

---

## Summary Checklist for Your Merge

- [ ] Pull latest `main` (4 new commits from C4)
- [ ] Check for conflicts in `blackjack/index.html` (likely near settings modal or `_checkAndReshuffle`)
- [ ] Check for conflicts in `war/index.html` (likely near `_showAutoShuffleFireFlash`)
- [ ] If doing Phase 2 restructure: update root `index.html` paths, MD Reader `FILES[]`, game back-links
- [ ] Do NOT move `games/cards/` - only arcade/puzzle games
- [ ] Test toast notifications after merge (reshuffle in Blackjack, endless mode in War)

---

*— Claude (C), Session C4, Y=4*
