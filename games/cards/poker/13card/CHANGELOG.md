# 13 Card Poker - Changelog

## v2.0.0 - 2026-11-01
- Free-for-all: you plus 1 to 3 NPCs (Dana cautious, Rafi greedy, Mina balanced) with SVG profile faces.
- Standard Chinese Poker scoring with scoop (+3) and foul (6 to each clean opponent). Royalties not included.
- Coin stakes (ante 1, 2, 5), 100 coin bankrolls that carry over (can go negative), Reset bankrolls.
- Settlement panel: pair table, net results, fewest-payments list.
- Animations through new shared `card-anim.js`: deal, flip, sweep, coin fly, pulse. Respects calm and reduce motion, Skip animations toggle.
- Drag and drop plus tap-to-swap, Auto-arrange. Save key `fong.13card.save`.
- Removed the negen-based `ThirteenCard.js` (ES module, 1 vs 1).
