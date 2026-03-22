# User Manual — WOSKY_3169 Calc v2

**Player:** WOSKY_3169 · WarMachine · State 3169 · SKY Breakers
**Last updated:** 2026-03-22

---

## Quick Start

1. Open `wosky/calc-v2/index.html` (or navigate from the WOSKY hub)
2. Go to **Plan** first and enter your current materials
3. Pick a calculator and set your current + target levels
4. Use the **Grand Total** row at the bottom to see what you need

---

## Plan Page (Materials Tracker)

Update your current stockpile here. All values are saved automatically and shared across every calculator.

| Field | What it tracks |
|-------|---------------|
| Charm Designs | Used for charm upgrades (low levels) |
| Charm Guides | Used for charm upgrades (mid levels) |
| Charm Secrets | Used for charm upgrades (high levels) |
| Alloy | Chief gear upgrades |
| Polish | Chief gear upgrades |
| Plans | Chief gear upgrades |
| Amber | Chief gear upgrades (rare) |
| Gear Chests | Each chest = 400 Alloy + 4 Polish + 1 Plan |
| Hero XP | Hero gear forge + empowerment |
| Mithril | Hero gear empowerment gates (hard resource) |
| Mythic Gear | Hero gear forge (certain levels) |
| Essence Stones | Advanced upgrades |

**Tip:** Always update materials before SvS so Plan shows accurate shortfalls.

---

## Charms Calculator

**How to use:**
1. For each charm slot (C1/C2/C3 on each piece), enter current Level and Step
2. Set your target Level and Step
3. Cost columns update immediately

**Global Controls (top bar):**
- **Set All Targets** — applies the level/step to every charm slot
- **Set All Current** — sets current values for all charms (useful after a big upgrade session)
- **Infantry / Marksman / Lancer** rows — apply targets to only that troop type's pieces
- **Per-piece setter** — inside each piece block, sets all 3 charm slots for that piece

**Reading the output:**
- `D` = Charm Designs
- `G` = Charm Guides
- `S` = Charm Secrets
- `pts` = SvS points earned for those upgrades

**Steps:** Each level has 4 steps (0, 1, 2, 3). Level 6 Step 3 → Level 7 Step 0 means the next upgrade starts a new level.

---

## Chief Gear Calculator

**How to use:**
1. Select current tier for each piece from the dropdown
2. Select target tier
3. Costs (Alloy, Polish, Plans, Amber) appear per piece

**Global Controls:**
- **Set All Target** — picks a tier and applies to all 6 pieces
- **Set Infantry/Marksman/Lancer Target** — applies to only that troop type's pieces
- **Set All Current** — bulk-sets current tier (useful if you just upgraded multiple pieces)

**Tier order (low → high):**
Green → Blue → Purple → Orange → Pink T1 → Pink T1+1 → Pink T1+2 → Pink T1+3 → Pink T2 → Pink T2+1 → Pink T2+2 → Pink T2+3 → Pink T3

---

## Hero Gear Calculator

**How to use:**
1. For each piece, enter current Forge level (cf) and Empowerment (ce)
2. Set target Forge (tf) and Empowerment (te)
3. XP, Mithril, and Mythic Gear costs appear

**Important — Empowerment Gates:**
Empowerment levels are gated behind forge requirements. If your target empowerment exceeds what your forge level allows, a **warning tag** will appear on that piece.

| Emp Range | Forge Required |
|-----------|---------------|
| 1–10      | F3 |
| 11–20     | F5 |
| 21–30     | F7 |
| 31–40     | F9 |
| 41–50     | F11 |
| 51–60     | F13 |
| 61–70     | F15 |
| 71–80     | F17 |
| 81–90     | F19 |
| 91–100    | F20 |

**Stat Flip tags** show when you cross empowerment milestones (E20, E60, E80, E100+) that flip which stat the piece primarily boosts.

---

## Reference Page

Quick lookup for:
- Full charm cost tables per level
- Chief gear tier cost totals (cumulative from Pink T1)
- Empowerment gate requirements
- Piece assignments per troop type
- SvS scoring reference

---

## Themes

Use the colour dots in the character bar to switch themes:
- 🔴 **Default** — WarMachine dark (red/black)
- 🔵 **Ice** — dark blue
- 🟠 **Fire** — dark amber
- 🩵 **Sky** — SKY Breakers light blue
- ⚪ **Light** — light mode

Theme is saved and persists across all pages.

---

## Data Storage

All data is stored in your browser's `localStorage` under key `wosky_v2_player`. It never leaves your device. Clearing browser data will reset your saved state back to defaults (your starting values from config.js).

---

## Keyboard Shortcut Notes

- Tab through inputs to move between fields quickly
- Enter on a number input triggers recalculation
- All results update live as you type — no submit needed
