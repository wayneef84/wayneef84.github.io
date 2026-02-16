# F.O.N.G. Root Hub - Changelog

All notable changes to the root hub will be documented in this file.

## [2.1.0] - 2026-02-15
### Added
- **Documentation Rollout:** Generated `README.md` and `AGENT.md` for 23 games across Priority 1, 2, and 3 tiers, completing the documentation requirement for the active game roster.
- **Storage Infrastructure:** Renamed `db/` to `storage/` to centralize persistence drivers.
- **Falldown Migration:** Updated the `Falldown` game to use the new `FongDB` storage engine (via `storage/`) for high scores and settings, replacing direct synchronous `localStorage` access.

### Verified
- **Falldown:** Game loads and displays the main menu successfully after storage engine migration.
![Falldown Verification](../verification/falldown_menu.png)

## [2.0.0] - 2026-02-15
### Added
- Complete UI revamp utilizing the "Modern Dark Arcade" design system.
- `global.css` for standardized color tokens and typography.
- `card.css` for a mobile-first responsive grid.
- Dynamic mapping to the 18 Production-tier games identified in the `GAME_INVENTORY.md`.
- Strict Rule 10 documentation suite.

### Changed
- ⚠️ Removed all absolute pathing. Hub is now fully compliant with `/beta` branch deployments.
- ⚠️ Stripped all external CDN dependencies.

## [1.0.0] - Legacy
### Added
- Initial basic listing of F.O.N.G. games.
