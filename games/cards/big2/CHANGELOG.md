# Big 2 Changelog

## [Unreleased]
### Added
- Players option: 2, 3 or 4 (AI fills the other seats).
- Who starts option: Lowest card (default) or Last winner.
- Deal rules for 3 players (17 each plus a face-up pickup card) and 2 players (17 each, 18 spare, one turned up).
- Deal panel with the face-up card, spare pile and who picked up, with a small CSS animation (off for reduced motion and calm mode).
- Saved options in `fong.big2.opts` (also holds the last winner), registered in `js/gamesaves.js`.
- `Big2Deal` and `Big2Options` in `big2.js`. Tests: `node tests/big2-deal.test.js`.
- Docs: README, MANUAL, INFO, ARCHITECTURE, TECHNICAL, TODO, CHANGELOG, CLAUDE, AGENT.

### Changed
- The start card comes from the active ruleset suit order. Singapore (spades lowest) now starts with the 3 of spades instead of the 3 of diamonds.
- The opening play must include the picked-up card when it is the start card, or the lowest dealt card when nobody holds the start card.
- Triple penalty applies to a player who never played, whatever the dealt hand size.
