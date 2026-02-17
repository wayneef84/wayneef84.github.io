# Blackjack - Roadmap & Issues

---

## Roadmap (Prioritized)

### Priority 1 - Critical (Ship Blockers)
No critical blockers currently. Game is production-ready.

### Priority 2 - High (Nice to Ship)
Should complete soon, enhances core gameplay

- [ ] **Split Hands:** Allow splitting pairs into two separate hands
  - [ ] Detect pairs in initial deal
  - [ ] Duplicate bet for second hand
  - [ ] Manage two hand arrays (left/right or hand[0]/hand[1])
  - [ ] Update UI to show both hands side-by-side
  - [ ] Handle independent actions for each hand
  - Estimated: 8-12 hours
  - Complexity: HIGH (requires refactoring hand management)

- [ ] **Insurance Bet:** Offer insurance when dealer shows Ace
  - [ ] Detect dealer Ace up card after deal
  - [ ] Show Insurance UI (side bet up to half original bet)
  - [ ] Handle insurance payout (2:1 if dealer blackjack)
  - [ ] Integrate with existing blackjack detection
  - Estimated: 4-6 hours
  - Complexity: MEDIUM (partially implemented, needs UI)

- [ ] **Sound Effects:** Add audio feedback for actions
  - [ ] Chip placement sound
  - [ ] Card deal sound
  - [ ] Win/lose sound
  - [ ] Blackjack celebration sound
  - [ ] Use Web Audio API (no CDN)
  - Estimated: 3-4 hours
  - Complexity: LOW

### Priority 3 - Medium (Next Sprint)
Lower priority features, quality-of-life improvements

- [ ] **Surrender:** Allow early fold for half bet return
  - [ ] Add "Surrender" button (first move only)
  - [ ] Return half bet, end round
  - Estimated: 2-3 hours

- [ ] **Multi-hand Play:** Play multiple hands simultaneously
  - [ ] UI redesign for 2-3 hands
  - [ ] Separate bet per hand
  - [ ] Sequential turn management
  - Estimated: 10-15 hours
  - Complexity: HIGH (major UI overhaul)

- [ ] **Statistics Dashboard:** Track session stats
  - [ ] Win/loss/push count
  - [ ] Biggest win/loss
  - [ ] Average bet size
  - [ ] Blackjack frequency
  - [ ] Persist to localStorage
  - [ ] Modal display
  - Estimated: 4-6 hours

- [ ] **Bet Shortcuts:** Quick bet buttons (Last, Min, Max, Clear)
  - [ ] "Repeat Last Bet" button
  - [ ] "Min Bet" ($5 default)
  - [ ] "Max Bet" ($100 or current balance)
  - [ ] "Clear Bet" (already exists)
  - Estimated: 2-3 hours

### Priority 4 - Low (Backlog)
Future ideas, not committing to timeline

- [ ] **Side Bets:** Perfect Pairs, 21+3 poker-style bets
  - Requires separate bet UI and payout logic
  - Estimated: 8-10 hours per side bet

- [ ] **Progressive Jackpot:** Rare event payout pool
  - Requires persistent jackpot tracking across sessions
  - Estimated: 6-8 hours

- [ ] **Theme Switcher:** Multiple color schemes (green, blue, red felt)
  - Defer to shared theme system (when available)
  - Estimated: 3-4 hours

- [ ] **Difficulty Modes:** Easy (dealer hits soft 17), Hard (dealer stands 17+)
  - Estimated: 2-3 hours

---

## Known Issues & Bugs

### Critical Bugs (Fix Immediately)
None currently. All known critical bugs have been resolved.

### High Priority Bugs
None currently.

### Low Priority Issues

- **Small Screen Layout:** On devices <350px width, chip buttons may overlap
  - **Impact:** Minor visual issue, still functional
  - **Workaround:** Use portrait orientation
  - **Fix:** Add media query for extra-small screens
  - **Priority:** LOW (rare screen size)

- **Deck Depletion Edge Case:** If shoe runs out mid-deal (very rare), no error handling
  - **Impact:** Game may crash (never observed in testing)
  - **Workaround:** Reshuffle before shoe depletes (current behavior)
  - **Fix:** Add safety check: if shoe empty, force reshuffle
  - **Priority:** LOW (6-deck shoe rarely depletes)

---

## Performance Concerns

- [ ] **Card Animation on Low-End Devices:** Animation may stutter on Android 4.x or very old devices
  - Symptom: Card flies in choppy motion
  - Cause: Older devices struggle with 60 FPS requestAnimationFrame
  - Solution: Detect device performance, reduce animation duration or disable
  - Priority: LOW (target devices are iOS 12+ and Android 6+)

- [ ] **Memory Leak (Unconfirmed):** After 100+ hands, memory may increase slightly
  - Symptom: Memory creeps from 5 MB to 7 MB over extended play
  - Cause: Possible event listener accumulation or DOM node retention
  - Solution: Audit event listeners, ensure cleanup on reshuffle
  - Priority: LOW (not confirmed, may be browser garbage collection)

---

## Technical Debt

- [ ] **Extract Inline CSS/JS:** Move CSS and JS from index.html to separate files
  - Location: index.html (entire file is 95KB)
  - Why: Better caching, easier maintenance, cleaner HTML
  - Impact: No functional impact, quality-of-life improvement
  - Estimated: 3-4 hours

- [ ] **Refactor BlackjackUI Class:** Split into UI + Animation modules
  - Location: index.html lines 600-1400 (BlackjackUI)
  - Why: Class is ~800 lines, hard to navigate
  - Impact: Better code organization, easier testing
  - Estimated: 4-6 hours

- [ ] **Hardcoded Constants:** Move bet limits, payouts to config object
  - Location: Scattered throughout ruleset.js and index.html
  - Why: Magic numbers make it hard to adjust game settings
  - Impact: Enables dynamic difficulty or custom rulesets
  - Estimated: 2-3 hours

- [ ] **Shared Engine Upgrade:** Update from v1.0.0 to latest version (if available)
  - Location: INFO.md dependency tracking
  - Why: May include bug fixes or new features
  - Impact: Must verify no breaking changes
  - Estimated: 2-4 hours (testing required)

---

## Accessibility Improvements

- [ ] **Screen Reader Support:** Add ARIA labels for cards and game state
  - [ ] Announce hand values
  - [ ] Announce dealer up card
  - [ ] Announce win/lose/push outcomes
  - Standards: WCAG 2.1 Level AA
  - Estimated: 4-6 hours

- [ ] **Keyboard Navigation:** Enable full game control via keyboard
  - [ ] Tab through chips, buttons
  - [ ] Enter to select chip
  - [ ] Arrow keys to adjust bet
  - [ ] Spacebar to deal/hit/stand
  - Standards: WCAG 2.1 Level AA
  - Estimated: 5-7 hours

- [ ] **High Contrast Mode:** Support OS high contrast settings
  - [ ] Detect prefers-contrast media query
  - [ ] Adjust colors for better visibility
  - Standards: WCAG 2.1 Level AAA
  - Estimated: 2-3 hours

---

## Future Ideas

### Potential Game Modes
- **Speed Blackjack:** Reduce animation time, faster gameplay
- **Tournament Mode:** Fixed number of hands, highest balance wins
- **Double Deck:** Use 2 decks instead of 6 for card counting practice

### Potential Features
- **Card Counting Trainer:** Show running count, true count
- **Basic Strategy Helper:** Hint system for optimal play
- **Replay System:** Review past hands, analyze decisions

### Multiplayer Possibilities
- **Hot Seat Multiplayer:** 2-3 players on same device, take turns
- **Online Multiplayer:** Real-time play against other players (requires server)
- **Dealer Mode:** One player acts as dealer for others

---

## Testing Gaps

- [ ] Edge case: What happens if player bets more than balance? (should be prevented, not tested)
- [ ] Platform: Desktop Chrome/Firefox not recently verified (focus on mobile)
- [ ] Performance under extended play (100+ hands) not measured
- [ ] Mobile device: iPad Mini, Android tablets not verified (only phone testing)
- [ ] Orientation change during card animation not tested (potential visual glitch)

---

## Complete Tasks (Most Recent First)

### Completed Recently
- ✅ Fixed Double Down availability (only on first move, 2 cards) - 2026-01-31 by Claude (C)
- ✅ Fixed card animation flash bug (visibility:hidden instead of opacity:0) - 2026-01-31 by Claude (C)
- ✅ Removed dealer blackjack check from initial deal (Terminal Check Gate fix) - 2026-01-31 by Claude (C)
- ✅ Added Reset Deck button to betting area - 2026-01-15 by Claude (C)
- ✅ Split Reshuffle into Reset Deck + Re-shuffle - 2026-01-14 by Claude (C)
- ✅ Implemented Terminal Check Gate (bust/blackjack ends immediately) - 2026-01-13 by Claude (C)
- ✅ Added bust suppression (dealer skips if player busted) - 2026-01-12 by Claude (C)
- ✅ Initial Blackjack implementation (hit/stand, dealer AI, betting) - 2026-01-10 by Claude (C)

---

**Last Updated:** 2026-02-15
**Maintained By:** Claude (C)
