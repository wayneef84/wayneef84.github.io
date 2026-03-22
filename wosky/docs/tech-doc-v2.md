# Technical Documentation — Calc v2 (WOSKY_3169 Upgrade Planner)

**Version:** 2.0
**Date:** 2026-03-22
**Author:** WOSKY_3169 (WarMachine · State 3169 · SKY Breakers)
**Stack:** Vanilla JS (strict ES5), HTML5, CSS custom properties. No build tools, no npm, no framework.

---

## 1. Architecture

```
wosky/
├── calc-v2/
│   ├── index.html          ← Hub: links all calculators
│   ├── charms.html         ← Charm upgrade calculator
│   ├── gear.html           ← Chief gear calculator
│   ├── hero-gear.html      ← Hero gear forge/empower calculator
│   ├── plan.html           ← Materials tracker + SvS day guide
│   ├── reference.html      ← Cost tables and lookup data
│   └── data/
│       └── config.js       ← All tunable game data (tiers, costs, max levels)
├── js/
│   ├── data/
│   │   ├── charms-data.js  ← Charm cost engine (WOSKY_CHARMS_DATA)
│   │   ├── gear-data.js    ← Gear cost engine (WOSKY_GEAR_DATA)
│   │   └── hero-gear-data.js ← Hero gear cost engine (WOSKY_HERO_GEAR_DATA)
│   ├── character.js        ← WOSKY_CHARS character profile store
│   └── char-bar.js         ← Character selector bar renderer
└── css/
    └── wosky.css           ← Design system (CSS vars, components, themes)
```

---

## 2. Data Flow

```
config.js (WOSKY_V2_CONFIG)
    ↓ structural config (tiers, max levels, assignments)
calc page JS
    ↓ reads state from
localStorage (key: wosky_v2_player)
    ↓ passes to
Engine APIs (calcRange / calcForge / etc.)
    ↓ results rendered to
DOM cells
```

---

## 3. localStorage Schema

Key: `wosky_v2_player`

```json
{
  "mats": {
    "charm_designs":  6203,
    "charm_guides":   3992,
    "charm_secrets":  0,
    "alloy":          838847,
    "polish":         8696,
    "plans":          3581,
    "amber":          0,
    "gear_chests":    2061,
    "hero_xp":        447010,
    "mithril":        120,
    "mythic_gear":    36,
    "essence_stones": 812
  },
  "charms": {
    "<piece>": {
      "c1": { "l": 6, "s": 3 },
      "c2": { "l": 6, "s": 3 },
      "c3": { "l": 6, "s": 3 }
    }
  },
  "charmTargets": { "<same structure as charms>" },
  "gear": {
    "<piece>": { "cur": "pink-t1-3", "tgt": "pink-t2" }
  },
  "hero": {
    "<troop>": {
      "<piece>": { "cf": 11, "ce": 12, "tf": 15, "te": 60 }
    }
  }
}
```

---

## 4. Engine APIs

### WOSKY_CHARMS_DATA
```js
WOSKY_CHARMS_DATA.calcRange(fromLevel, fromStep, toLevel, toStep)
// Returns: { d: Number, g: Number, s: Number, svs_pts: Number }
// d = designs, g = guides, s = secrets
```

### WOSKY_GEAR_DATA
```js
WOSKY_GEAR_DATA.getIndexById(tierId)     // returns numeric index
WOSKY_GEAR_DATA.calcRange(fromIdx, toIdx)
// Returns: { a: Number, s: Number, d: Number, m: Number }
// a = alloy, s = polish/shine, d = plans/designs, m = amber
```

### WOSKY_HERO_GEAR_DATA
```js
WOSKY_HERO_GEAR_DATA.calcForge(fromForge, toForge)
// Returns: { xp: Number, mythic_gear: Number }

WOSKY_HERO_GEAR_DATA.calcEmpower(fromEmp, toEmp)
// Returns: { xp: Number, statFlipsCrossed: Array<Number> }

WOSKY_HERO_GEAR_DATA.calcGateCosts(fromEmp, toEmp)
// Returns: { mithril: Number, mythic: Number }

WOSKY_HERO_GEAR_DATA.forgeGateWarning(targetForge, targetEmp)
// Returns: String | null  — warning if forge level is too low for emp target
```

---

## 5. config.js — Tunable Fields

| Field | Description |
|-------|-------------|
| `pieces` | Piece assignments per troop type |
| `heroPieces` | Hero gear piece names |
| `gearTiers[]` | Ordered list of gear tier IDs and labels |
| `charms.maxLevel` | Maximum charm level |
| `charms.maxStep` | Maximum charm step (0–3) |
| `hero.maxForge` | Max forge level |
| `hero.maxEmp` | Max empowerment level |
| `hero.gates[]` | `[empMin, empMax, forgeReq, mithril, mythic]` rows |
| `svsDays[]` | SvS day guide content |
| `defaults.*` | Starting player state loaded if localStorage is empty |

**To update game data after a patch:** edit only `config.js`. No calc page changes needed.

---

## 6. Theme System

Themes are set on `<html data-theme="">`:
- `""` (default) — WarMachine dark red/black
- `"ice"` — dark blue
- `"fire"` — dark amber
- `"sky"` — light sky blue
- `"light"` — light mode

Theme is persisted in `localStorage` key `woskyTheme` via `char-bar.js`.

---

## 7. ES5 Constraints

Per project rules, all JS must be strict ES5:
- No `const`/`let` — use `var`
- No arrow functions `=>` — use `function`
- No `fetch()` — use `XMLHttpRequest` if needed
- No template literals — use string concatenation
- No spread/destructuring

---

## 8. Adding a New Calculator

1. Create `calc-v2/newcalc.html`
2. Add any new engine API to `wosky/js/data/`
3. Add structural config to `config.js`
4. Add a state key to the `wosky_v2_player` schema
5. Add a card to `calc-v2/index.html` (move from placeholder to "Active")
6. Link from `wosky/index.html`
