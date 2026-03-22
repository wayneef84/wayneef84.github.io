# calc-v2 TODO

---

## MILESTONE: Combined Single-Page App

Replace the current multi-file setup (gear.html / charms.html / hero-gear.html) with one combined
file that shares state across all three calculators, plus an Overview page.

### Navigation
Use the existing left-rail side nav (calc-nav.js pattern) extended to 5 tabs:

  [Overview]      <- new (see below)
  [Chief Gear]
  [Chief Charms]
  [Hero Gear]
  [Reference]     <- already exists, carry over as-is

Tab switching is JS show/hide of sections — no page reloads, no scroll anchors.
All three calculator sections share one localStorage key for the character profile.

### Character Profile (header, persisted)
- Character Name  (text input, editable)
- Character ID    (text input, editable, optional — shown under name)
- Demo data: "Warmachine" with randomized-but-logical material amounts (see below)
- Do NOT pre-populate with any real player ID

Demo character "Warmachine" seed values (rounded, plausible, slightly randomized):
  Gear XP on hand:        ~2,400,000
  Essence Stones on hand: ~18,500
  Mithril on hand:        ~310
  Mythic Gear pieces:     ~7
  (Exact values to be finalized at implementation time — keep them realistic for a mid-game player)

---

## Overview Page (new)

The Overview is the "dashboard" tab. It shows everything in one place.

### Sections:

1. **Materials on Hand** (editable inline)
   - Gear XP, Essence Stones, Mithril, Mythic Gear
   - These are the same inputs currently spread across the three calculators — consolidate here,
     shared state.

2. **Upgrade Summary** (read-only, computed)
   Three collapsible sub-sections (one per calculator):
   - Chief Gear: list of pieces being upgraded, tier from→to, cost per resource
   - Chief Charms: list of charm slots being upgraded, level from→to, cost per resource
   - Hero Gear: list of pieces being upgraded, level/forge from→to, cost per resource
   Each sub-section shows a subtotal row.

3. **Grand Total Cost** strip
   - Gear XP needed | Essence Stones needed | Mithril needed | Mythic Gear needed
   - Net remaining after subtracting Materials on Hand (red if short, green if covered)

4. **After State** (TBD — depends on bonuses research)
   - Once stat bonuses are implemented (#1, #2, #3 below), show a before/after stat comparison
     per upgrade category.
   - Placeholder section until bonuses are ready.

### Print
- "Print / Save PDF" button triggers window.print()
- Print stylesheet: hide nav, hide edit controls, render summary cleanly on paper
- One page per calculator section if content is long

### Export JSON
- "Export" button serializes full state to JSON:
  { version, character, materials, gearTargets, charmTargets, heroGearTargets }
- Triggers a file download (wosky-plan-<name>-<date>.json)

### Import JSON
- "Import" file picker — reads JSON, validates version, loads state into all three calculators
- Warn if version mismatch; never silently corrupt state

---

## 1. Chief Gear — Stat Bonuses per Tier
**Status:** Pending research
**Effort:** Medium
**Description:** Each gear tier (T1–T8+) gives fixed stat bonuses (e.g., +X% Infantry ATK,
+Y% Troop DEF). Once a data table is compiled, display the net stat delta (current vs target) in
the upgrade plan rows and in the Overview "After State" section.
**Research needed:** Pull tier bonus values from WOS wiki or screenshot in-game gear details
per tier/slot.

---

## 2. Chief Charms — Stat Bonuses per Level/Segment
**Status:** Pending research
**Effort:** Medium
**Description:** Each charm level (Lv1.1 through max) gives fixed stat bonuses per slot type.
Same approach as Chief Gear — lookup table → delta display in plan and Overview.
**Research needed:** Charm stat values per level from wiki or in-game.

---

## 3. Hero Gear — Stat Bonuses (Deferred)
**Status:** Deferred — needs deeper research
**Effort:** High
**Description:** Hero gear stats scale across two dimensions: Forge/Mastery level (F1–F15) AND
Level/Empowerment level (L1–L100, E1–E100). 2D lookup table per piece type. Do not attempt
until Chief Gear/Charm bonuses are done and the data pipeline is verified.
**Research needed:** Full stat tables per piece × forge level × empowerment level.
