# WOSKY_3169 — Toolkit Developer Guide

> **Read this before building a new tool.**
> Everything here is intentional. Follow these patterns so the toolkit stays consistent.

---

## 📁 Folder Structure

```
wosky/
├── index.html          ← Landing hub (tool card grid)
├── TOOLKIT.md          ← This file
├── css/
│   └── wosky.css       ← Shared stylesheet + design tokens + themes
├── js/
│   ├── character.js    ← Character data store (localStorage, ES5)
│   ├── char-bar.js     ← Character selector + theme switcher UI (rendered on all pages)
│   └── data/
│       ├── charms-data.js  ← Charm cost table (v2 — see pattern below)
│       └── [tool]-data.js  ← Add your data file here, same pattern
└── [tool-name]/
    └── index.html      ← One folder per tool, one page per tool
```

---

## 🧱 Adding a New Tool — Step-by-Step

### 1. Create the folder & page

```
wosky/[tool-name]/index.html
```

Copy the charms page as your starting template. It has all the boilerplate:
- Top nav with breadcrumb
- `#wosky-char-bar` div (character selector + theme switcher, rendered by JS)
- `<main class="wosky-main">` wrapper
- Script load order (character.js → char-bar.js → data file → inline logic)

### 2. Create a data file

```
wosky/js/data/[tool]-data.js
```

Follow this structure (see `charms-data.js` for a full example):

```js
var WOSKY_[TOOL]_DATA = {

    meta: {
        version:  '1.0',
        /* Any configurable numbers go here — not hardcoded in the HTML */
    },

    /* Your data arrays / objects */

    /* API methods the page JS calls — keep them pure functions */
    calcSomething: function (input) { ... }
};
```

**Rules:**
- Strict ES5 — no `const`, `let`, arrow functions `=>`, `fetch()`, template literals
- All configurable numbers live in `meta` — never hardcode them in HTML
- Mark any unverified data with `verified: false` and document it at the top
- Expose on `window` (e.g. `window.WOSKY_[TOOL]_DATA = ...;`)

### 3. Wire the tool card on the landing page

In `wosky/index.html`, update the `<a href="./[tool-name]/" ...>` card:
- Change `wtc-badge-soon` → `wtc-badge` once it's live
- Update the description text

---

## 🎨 CSS Design Tokens

All tokens are in `wosky/css/wosky.css` under `:root`. Use them — never hardcode colours.

| Token | Use |
|---|---|
| `var(--w-bg)` | Page background |
| `var(--w-surface)` | Card / panel background |
| `var(--w-surface2)` | Input backgrounds, nested panels |
| `var(--w-border)` | Standard borders |
| `var(--w-border-accent)` | Accent borders (red-tinted in dark-red theme) |
| `var(--w-red)` | **Primary accent colour** — changes with theme |
| `var(--w-red-dim)` | Dimmed accent (hover states) |
| `var(--w-red-glow)` | Glow shadow on accent elements |
| `var(--w-red-subtle)` | Tinted background on accent areas |
| `var(--w-text)` | Primary text |
| `var(--w-text-secondary)` | Labels, subtitles |
| `var(--w-text-muted)` | Placeholders, footnotes |
| `var(--w-success)` | Green — positive values |
| `var(--w-warn)` | Amber — warnings, costs |
| `var(--w-info)` | Blue — informational |
| `var(--w-mono)` | Monospace font stack |
| `var(--w-ui)` | UI sans-serif font stack |

### Troop Type Colours (stable across all themes)

| Token | Colour |
|---|---|
| `var(--w-infantry)` | Red `#e11d48` |
| `var(--w-infantry-subtle)` | Translucent infantry red (background tint) |
| `var(--w-lancer)` | Blue `#38bdf8` |
| `var(--w-lancer-subtle)` | Translucent lancer blue |
| `var(--w-marksman)` | Gold `#f59e0b` |
| `var(--w-marksman-subtle)` | Translucent marksman gold |

Use these wherever content is associated with a troop type (borders, labels, badges).

---

## 🌙 Theme System

Themes are implemented as CSS variable overrides on `:root[data-theme="X"]`.

| Theme key | Label | Accent |
|---|---|---|
| `""` (empty) | 🔴 Dark Red | `#e11d48` |
| `"ice"` | 🔵 Dark Ice | `#38bdf8` |
| `"fire"` | 🟡 Dark Fire | `#f59e0b` |
| `"sky"` | 💧 Sky | `#0284c7` (light bg) |
| `"light"` | ⚪ Light | `#e11d48` (light bg) |

- `char-bar.js` handles theme switching and persistence (`localStorage` key: `wosky_theme`)
- `data-theme` is set on `<html>` (`document.documentElement`)
- No action needed in page code — themes are purely CSS

**Adding a new theme:** Add a `:root[data-theme="X"]` block in `wosky.css`, then add an entry to the `THEMES` array in `char-bar.js`.

---

## 👤 Character System

`window.WOSKY_CHARS` is the character store. All pages use it.

```js
CHARS.getActive()                  // → character object (or null)
CHARS.getAll()                     // → array of all characters
CHARS.setActive(id)                // switches active + fires event
CHARS.save(charObj)                // upsert
CHARS.saveCharms(charId, charmsObj)// save charms section only
CHARS.savePlan(charId, key, data)  // save a plan sub-key
CHARS.create(name, playerId)       // → new char object
CHARS.remove(id)
CHARS.exportAll()                  // → JSON string
CHARS.importAll(jsonString)        // → bool
```

**Listening for character changes:**

```js
document.addEventListener('wosky:character-changed', function () {
    loadFromChar();
});
/* Also expose for char-bar import hook: */
window.woskyOnCharacterChanged = function () { loadFromChar(); };
```

---

## 🗂️ Standard Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- meta, title, favicon, wosky.css link -->
</head>
<body>
    <!-- 1. Top nav with breadcrumb -->
    <nav class="wosky-nav">
        <a href="../../index.html" class="wosky-nav-home">← Hub</a>
        <span class="wosky-nav-sep">/</span>
        <a href="../index.html" class="wosky-nav-home">WOSKY_3169</a>
        <span class="wosky-nav-sep">/</span>
        <span class="wosky-nav-brand">🔧 Tool Name</span>
    </nav>

    <!-- 2. Character bar (also holds theme switcher) -->
    <div id="wosky-char-bar"></div>

    <!-- 3. Main content -->
    <main class="wosky-main">
        <div class="wosky-page-title">🔧 Tool Name</div>
        <div class="wosky-page-sub">Short description.</div>
        <!-- tool content -->
    </main>

    <!-- 4. Scripts — order matters -->
    <script src="../js/character.js"></script>
    <script src="../js/char-bar.js"></script>
    <script src="../js/data/[tool]-data.js"></script>
    <script>
    (function () {
        'use strict';
        /* tool logic */
    })();
    </script>
</body>
</html>
```

---

## ✅ Checklist for a New Tool

- [ ] Data file in `js/data/[tool]-data.js` with `meta`, `verified` flags, `window.WOSKY_*`
- [ ] Strict ES5 throughout (no `const`/`let`/arrows/`fetch`)
- [ ] Uses CSS design tokens — no hardcoded colours
- [ ] Loads character data on init + re-loads on `wosky:character-changed`
- [ ] Saves back to character via `CHARS.save*` or `CHARS.savePlan`
- [ ] Tool card on `wosky/index.html` updated from "Coming Soon" to "Live"
- [ ] Emojis on section headers and page title for quick visual scanning
- [ ] Troop-type grouped sections use `.charm-troop-group.group-infantry/lancer/marksman` (or equivalent tokens)

---

## ⚠️ Critical Rules (from CLAUDE.md)

1. **Relative paths only** — use `./games/...` not `/games/...` (GitHub Pages `/beta` folder issue)
2. **ES5 strict** — especially in `character.js`, `char-bar.js`, and data files
3. **No external CDN** — everything is self-contained
4. **`verified: false`** — any game data you can't confirm must be flagged; show a warning in the UI when affected

---

*Last updated: 2026-03-16 (Claude — wosky toolkit v2 refactor)*
