# 13 Card Poker - Changelog

## v2.0.1 - 2026-11-01
- Keyboard and screen readers: focus stays on the moved card after a tap or swap, selected cards have aria-pressed and "selected" in the label, the status banner only changes when its text changes.
- Cautious NPC now minimizes the category gap between rows.
- Reset bankrolls and changing the NPC count clear the old rows and settlement panel.
- Deal continuation set before the deal call (no stale pointer in reduced motion). Hiding the page while arranging readies the NPC chips.
- `CardAnim.fly` keep and `sweep` back:false now leave the final state (see shared INFO.md).

## v2.0.0 - 2026-11-01
- Free-for-all: you plus 1 to 3 NPCs (Dana cautious, Rafi greedy, Mina balanced) with SVG profile faces.
- Standard Chinese Poker scoring with scoop (+3) and foul (6 to each clean opponent). Royalties not included.
- Coin stakes (ante 1, 2, 5), 100 coin bankrolls that carry over (can go negative), Reset bankrolls.
- Settlement panel: pair table, net results, fewest-payments list.
- Animations through new shared `card-anim.js`: deal, flip, sweep, coin fly, pulse. Respects calm and reduce motion, Skip animations toggle.
- Drag and drop plus tap-to-swap, Auto-arrange. Save key `fong.13card.save`.
- Removed the negen-based `ThirteenCard.js` (ES module, 1 vs 1).
