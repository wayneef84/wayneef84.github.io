# F.O.N.G. Root Hub - Changelog

All notable changes to the root hub will be documented in this file.

## [Unreleased]
### Added
- **Homepage theme engine (Phase 1):** Customize panel on the homepage with two skins (Classic, Print Shop), eight palettes plus Classic, per-color hex edits, shape and type controls, renaming, hide, pin, custom groups by catalog id, behaviors, and JSON export and import with a strict validator and a preview before applying. Recovery links `?theme=default` and `?safe=1`. Custom CSS and scripts are not supported yet. Added Space Grotesk (OFL) to `assets/fonts/`. See `docs/CUSTOMIZE.md`, `docs/CUSTOMIZE_IDS.md` and `docs/THEMING_SPEC.md`.
- **Shared play stats:** `js/player-stats.js` (`FongStats`) keeps plays, last played and best score per catalog id, on-device only. Old `playcount_*` keys migrate once. See `docs/PLAYER_STATS.md`.

### Fixed
- Header "Plays:" counter showed 0 (nothing wrote the counts it read). It now shows the real total, no 99 cap, large numbers as 1.2k.

### Removed
- Streak counters and flame from the Daily Command Center, and the `fong_streak_*` keys.

## [2.1.0] - 2026-02-15
### Added
- **Documentation Rollout:** Generated `README.md` and `AGENT.md` for 23 games across Priority 1, 2, and 3 tiers, completing the documentation requirement for the active game roster.
- **Storage Infrastructure:** Renamed `db/` to `storage/` to centralize persistence drivers.
- **Falldown Migration:** Updated the `Falldown` game to use the new `FongDB` storage engine (via `storage/`) for high scores and settings, replacing direct synchronous `localStorage` access.

### Verified
- **Falldown:** Game loads and displays the main menu successfully after storage engine migration.
![Falldown Verification](verification/falldown_menu.png)

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
