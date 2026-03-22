# calc-v2 TODO

## 1. Chief Gear — Stat Bonuses per Tier
**Status:** Pending research
**Effort:** Medium
**Description:** Each gear tier (T1–T8+) gives fixed stat bonuses (e.g., +X% Infantry ATK, +Y% Troop DEF). Once a data table is compiled, display the net stat delta (current vs target) in the upgrade plan rows.
**Research needed:** Pull tier bonus values from WOS wiki or screenshot the in-game gear details screen for each tier/slot.

---

## 2. Chief Charms — Stat Bonuses per Level/Segment
**Status:** Pending research
**Effort:** Medium
**Description:** Each charm level (Lv1.1 through Lv6.6 etc.) gives fixed stat bonuses per slot type. Same approach as Chief Gear — lookup table → delta display in plan.
**Research needed:** Charm stat values per level from wiki or in-game.

---

## 3. Hero Gear — Stat Bonuses (Deferred)
**Status:** Deferred — needs deeper research
**Effort:** High
**Description:** Hero gear stats scale across two dimensions: Forge/Mastery level (F1–F15) AND Level/Empowerment level (L1–L100, E1–E100). This means a 2D lookup table per piece type. Do not attempt until Chief Gear/Charm bonuses are done and the data can be verified.
**Research needed:** Full stat tables per piece × forge level × empowerment level.

---

## 4. Combined Single-File Calculator
**Status:** Ready to implement when feature set is stable
**Effort:** Medium
**Description:** Merge gear.html, charms.html, and hero-gear.html into one page (e.g., `all.html` or replace `index.html`). Three collapsible sections, one grand-total strip across all four resources (Gear XP, Essence Stones, Mithril, Mythic Gear). Single page load, unified upgrade path view. CSS and nav already shared — merge is mechanical. Hold until bonuses (#1–#3) are settled so the combined file doesn't need to be re-merged.
