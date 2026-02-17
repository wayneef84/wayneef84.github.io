# Blackjack - Changelog

All notable changes to this project are documented here.
Format: [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)

---

## [1.0.6] - 2026-01-31

### Fixed
- **Double Down Availability:** Now correctly limited to first move only (2 cards in hand)
  - Fixed `getAvailableActions` in ruleset.js
  - Fixed insurance code paths that bypassed the check
  - Added explicit disable in `_updateValues` when `player.hand.count > 2`
  - Prevents exploiting double down after hitting
- **Card Animation Flash Bug:** Cards no longer appear at destination before flying
  - Changed `opacity: 0` to `visibility: hidden` for tempSlot
  - Converted arrow functions to regular functions for Safari 9 compatibility
  - Ensures smooth animation on all supported browsers
- **Terminal Check Gate:** Dealer blackjack check removed from `checkWinCondition`
  - Prevents game from ending before insurance is offered
  - Insurance flow now handles dealer blackjack detection separately
  - Maintains correct game flow: deal → insurance offer → resolution

---

## [1.0.5] - 2026-01-15

### Added
- **Reset Deck Button (Betting Area):** Quick access to reset deck during betting phase
  - Indigo gradient styling matches settings button
  - Works alongside existing settings modal button
  - Improves user experience for card counters

### Changed
- **Reshuffle Split:** Separated into two distinct actions
  - **Reset Deck:** Creates new 6-deck shoe, resets card counts (full reset)
  - **Re-shuffle:** Shuffles existing shoe without resetting (preserves deck state)
  - Provides more control over deck management

---

## [1.0.4] - 2026-01-13

### Added
- **Terminal Check Gate:** Game now ends immediately on player bust or blackjack
  - Prevents unnecessary dealer actions
  - Improves game flow and payout logic clarity
  - Matches casino blackjack behavior

### Fixed
- **Bust Suppression:** Dealer now correctly skips turn if player busted
  - `getNextActor()` returns null when player value > 21
  - Prevents dealer from drawing cards unnecessarily
  - Reduces animation time and improves game speed

---

## [1.0.0] - 2026-01-10

### Added
- Initial production release of Blackjack
- Core gameplay: Hit, Stand, Double Down
- Dealer AI (hits on 16 or less, stands on 17+)
- Currency system (starts with $1000)
- Betting system ($1, $5, $25, $50, $100 chips)
- 6-deck shoe with automatic reshuffle
- Mobile responsive design (portrait and landscape)
- ES5 compatible code (no const/let, no arrow functions)
- Touch-optimized UI (60x60px chip targets)
- Safe area support for notch devices
- Comprehensive documentation suite
- Payout system:
  - Win: 1:1 (bet × 1)
  - Blackjack: 3:2 (bet × 1.5)
  - Push: Bet returned
- Value bubbles (hand totals with soft hand indicator)
- Settings modal (reset deck, re-shuffle)
- Balance persistence (localStorage)

### Fixed
- N/A (initial release)

### Changed
- N/A (initial release)

### Removed
- N/A (initial release)

### Known Issues
- No split hands (planned for v1.1.0)
- No insurance bets (planned for v1.1.0)
- No surrender option (planned for v1.2.0)
- No sound effects (planned for v1.2.0)

---

## [0.9.0] - 2026-01-05 (Beta)

### Added
- Beta version for internal testing
- Basic hit/stand mechanics
- Dealer AI implementation
- Betting UI with chip selector
- Card dealing animation
- Win/loss detection

### Fixed
- Fixed issue with dealer drawing when player busted
- Fixed hand value calculation for soft hands
- Fixed bet amount not clearing on new hand

### Changed
- Modified dealer behavior from "hit on soft 17" to "stand on all 17"
- Improved card animation timing (300ms → 200ms for better feel)

---

## Format Guide

### Version Numbering (Semver)
- **MAJOR** (X.0.0): Breaking changes, API changes
- **MINOR** (0.X.0): New features (backwards compatible)
- **PATCH** (0.0.X): Bug fixes (backwards compatible)

### Date Format
ISO 8601: YYYY-MM-DD

### Sections (Use Headings)
- **Added:** New features
- **Changed:** Changes to existing functionality
- **Deprecated:** Features to be removed soon
- **Removed:** Removed features or files
- **Fixed:** Bug fixes
- **Security:** Security improvements

### Important Markers
- ⚠️ **BREAKING CHANGE:** Highlight incompatibilities
- 🔒 **SECURITY:** Highlight security fixes
- 📱 **MOBILE:** Mobile-specific changes

### Example Entry Format
```markdown
## [1.1.0] - 2026-03-01

### Added
- Split hands feature: Play two hands from one pair
- Insurance bet option when dealer shows Ace
- Sound effects for chip placement and card dealing

### Changed
- ⚠️ **BREAKING:** Changed localStorage key from `bj_balance` to `blackjack_balance`
- Performance optimization reduced card animation time by 20%

### Fixed
- Fixed double down button staying enabled after first move
- 📱 Fixed chip buttons overlapping on screens <350px width

### Security
- 🔒 Updated balance validation to prevent negative bets
```

---

**Last Updated:** 2026-02-15
**Maintained By:** Claude (C)
