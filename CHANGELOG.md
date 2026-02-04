# Changelog

All notable changes to the Fong Family Arcade project will be documented in this file.

## [Unreleased]
### Planned Features
- **God Mode:** Card counting overlay showing probability of next card value (educational feature)

## [Slots v3.1] - 2026-02-04
### Added
- **10 New Themes:** Added diverse themes including Pirate's Gold, Jurassic Jungle, Samurai Spirit, Viking Legends, Steampunk Revolution, Wild West, Fairy Tale, Dragon's Lair, Robot Factory, and Ninja Shadows.
- **Visual Overhaul:**
  - Implemented 3D cylinder rendering for reels to simulate depth.
  - Added "Magic Mist" overlay and ambient particle effects.
  - Introduced "Unicorn Dash" special effect for big wins.
  - Enhanced particle systems for winning lines and scatter symbols.
- **Audio Improvements:** Consolidated all theme background music to a reliable `slotsBG.mp3` source to prevent missing asset errors.
- **Technical:** Implemented cache busting for game assets to ensure users receive the latest visual updates.

## [Arcade v1.4] - 2026-01-14 (Gemini with the patchwork)
### Changed
- **Main Menu:** Complete reorganization of game grid.
- **Branding:** Simplified game titles (e.g., "S Mixer", "Slots") and cleaner footer.
- **Priority:** Moved Card Games, Magic 8 Ball, and Snake to the top row.

## [Blackjack v1.3.0] - 2026-01-14
### Added
- **Card Probabilities:** Card count display now shows percentage chance of drawing each rank based on remaining cards
  - Formula: (cards left in shoe / total remaining) × 100
  - Updates dynamically as cards are dealt
  - Percentage display with 3 decimal precision (no leading zeros)
  - "Ace" label shortened to "A", "10-val" changed to "Σ10" (sigma symbol for sum)
  - **3-column layout:** Card label (bold) | Count (centered) | Probability (centered)
  - Added Σ10 row showing combined probability of drawing any 10-value card (10, J, Q, K)
- **Automatic Reshuffle System:** Configurable threshold triggers shoe rebuild when cards run low
  - Default threshold: 20% of cards remaining
  - Adjustable in Settings (5-50% in 5% increments)
  - Toast message "🔄 Shuffling shoe..." when triggered
  - Resets all card counts and total dealt cards
  - Setting persisted to localStorage
- **Manual Reshuffle:** Added "🔄 Force Reshuffle Shoe" button to Settings menu
  - Resets shoe and card count history
  - Preserves hand history
  - Useful for testing with fractional decks (e.g., 6.5 decks)
  - Also available in debug menu (triple-tap header)
- **Modal Improvements:** Enhanced UX for Settings and History modals
  - Click outside modal to close (cancels changes for Settings)
  - Added Cancel button to Settings modal
  - Cancel button restores original values without saving
- **Shoe-Style Dealing:** Authentic casino shoe dealing mechanics
  - Dealer receives FIRST card face-down (hole card), SECOND card face-up
  - Face-up (revealed) cards positioned 1/8 card closer to player (15px downward)
  - Single-deck mode: If 1 deck or fewer, dealer's first card is dealt face-up (hand-dealt style)
  - Updated insurance logic to check second card (up card) instead of first
- **Fractional Deck Support:** Deck count now accepts decimal values (e.g., 6.5, 4.25)
  - Input validation: Invalid values default to 1 deck
  - Rounded to nearest 0.5 for clean internal values
  - Step="any" to allow any decimal input
  - Min 0.5, max 8 decks

### Fixed
- **Dealer Hole Card Tracking Bug:** Hole card now properly tracked in card count when revealed
  - Fixed race condition in `_handleTurnStart()` where flag was set before tracking
  - Applied same fix pattern to `_handleReveal()` for consistency
  - Hole card now correctly appears in card count history at end of game

## [Blackjack v1.2.2] - 2026-01-14
### Added
- **Hand History Payout:** Shows net gain/loss for each hand (+$X / -$X) with color coding
  - Green for wins, red for losses, gray for pushes
  - Displayed alongside outcome in hand history header

## [Blackjack v1.2.1] - 2026-01-13
### Fixed
- **Card Counter:** Fixed rank conversion bug - now properly converts 'ACE' to 'A', 'TWO' to '2', etc.
- **Hand History Display:** Complete redesign showing actual cards dealt instead of just bet/result
  - Displays dealer cards + value and player cards + value
  - Cards shown as chips with rank + suit symbol (e.g., "A♥", "K♠")
  - Color-coded: Red suits (♥♦) in red, black suits (♣♠) in black
  - Card-style blocks with better visual hierarchy
  - Initially removed bet/payout (restored in v1.2.2)

## [Blackjack v1.2.0] - 2026-01-13
### Added
- **History Mode:** 📊 button in header opens tracking modal with two tabs
  - **Card Count Tab:** Tracks all dealt cards by rank (A, 2-K), excludes dealer hole card until revealed
  - **Hand History Tab:** Logs each hand with bet, result, and net payout
  - Shows total cards dealt and cards remaining in shoe (6 decks = 312 cards)
  - Color-coded outcomes: Win (green), Lose (red), Push (yellow), Blackjack (gold)
  - Most recent hands displayed first

## [Blackjack v1.1.1] - 2026-01-13
### Fixed
- **Animation Flash:** Eliminated card preview flash before flying animation by using placeholder positioning
- **Button Layout:** Changed Play Again/Change Bet buttons to 50/50 horizontal layout with equal widths
- **Spacing Consistency:** Fixed dealer label/value spacing to match player spacing (10px margins)

## [Blackjack v1.1.0] - 2026-01-13
### Added
- **Insurance Betting:** Side bet when dealer shows Ace (costs half main bet, pays 2:1 if dealer has Blackjack)
- **Insurance UI Modal:** Prompt appears after initial deal with dealer Ace showing
- **Insurance Payout Logic:** Automatic payout calculation and balance adjustment on dealer Blackjack

## [Blackjack v1.0.0] - 2026-01-13
### Added
- **Terminal Check Gate:** Post-action hook checks for immediate win conditions after every card deal
- **Bust Suppression:** Engine skips dealer turn when all players are busted (getNextActor returns null)
- **Mobile UI:** Bottom-up player layout (Cards → Value → Label), top-down dealer layout
- **Value Bubble Logic:** Hide bubbles when value is 0 or no cards present
- **Debug Console:** Triple-tap header to access Force commands (Force BJ, Force Bust, Force Tie, Reset Bank)
- **Test Suite:** Automated ruleset test runner (test_ruleset.html) with 4 Blackjack test suites

### Fixed
- **CRITICAL: Dealer Bust Loop:** Dealer now stops immediately when busted (was continuing to draw cards)
- **Double Down:** Verified correct implementation (deduct bet, deal 1 card, force stand)

## [Letter Tracing v1.2] - 2026-01-09
### Added
- **Audio Architecture:** Implemented A-B-C system (Prefix + Content + Suffix) with cascading overrides (Item > Pack > Global).
- **Settings UI:** Added gear icon toggle and settings panel with voice speed slider.
- **Voice Control:** Added adjustable speech rate (0.25x - 2.0x) using HTML5 range input.
- **Rich Content Format:** Updated `content.js` to support `{name, words, strokes}` object structure alongside legacy arrays.
- **Guidance Defaults:** Renamed "Ghost+" to "Guide" and made it the default startup mode.

### Fixed
- **Mobile Layout:** Fixed critical mobile viewport overflow using `100dvh` and Flexbox `height: 0` strategy on the canvas wrapper.
- **Geometry Logic:**
  - Corrected negative angle calculations for `e`, `f`, `g`, `h`, `m`, `n`, `s`.
  - Capped descender depth at Y=120 for `g`, `j`, `p`, `q`, `y` to prevent UI overlap.
  - Flattened `r` shoulder, balanced `s` weight, lowered `t` ascender, and aligned `w` peaks.

## [Xiangqi v0.3.1] - 2026-01-08
### Added
- AI Color Selector (Play as Red or Black).
- Automatic AI move triggering when AI plays Red.

## [Slots v3.0]
### Added
- 20 unique themes with distinct audio/visuals.
- Dad Mode physics for adjustable win rates.
