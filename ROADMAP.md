# Fong Family Arcade - Roadmap

## Blackjack - Next Features

### 1. Shoe Reshuffle System ⚙️
**Status:** Planned
**Priority:** Medium

**Current Behavior:**
- Deck shuffled once at game start
- Card count tracks all 312 cards (6 decks)
- No automatic reshuffling

**Proposed Feature:**
- Add configurable "Cards Remaining Before Reshuffle" in Settings (default: 52 cards)
- When `shoe.count < reshuffleThreshold`, trigger automatic reshuffle **before next hand**
- Visual feedback: Toast message "🔄 Shuffling shoe..." (2 second display)
- Reset card count tracker to zero on reshuffle
- Setting range: 26 - 156 cards (increments of 26 = 1/2 deck)

**Implementation Notes:**
```javascript
// In index.html, check before dealing (not mid-hand)
_startNewHand() {
    const threshold = this.reshuffleThreshold || 52; // Default 1 deck
    if (this.engine.piles.shoe.count < threshold) {
        this._reshuffleDeck(); // Rebuild shoe, shuffle, reset count
        this._showMessage('🔄 Shuffling shoe...', 'info');
        setTimeout(() => this._continueNewHand(), 2000);
    } else {
        this._continueNewHand();
    }
}
```

**UI Updates:**
- Add input to Settings modal: "Reshuffle when cards remaining < [52]"
- Show brief toast overlay when reshuffle occurs
- Card count tab resets to zero after reshuffle

---

### 2. Card Themes / Visual Packs 🎨
**Status:** Planned (Deferred to v2.0)
**Priority:** Low (Nice-to-have)

**Goal:**
Allow user to change card appearance (suits + backing) with live toggle.

**Folder Structure:**
```
/games/cards/themes/
  /classic/
    - suits.svg      # Standard ♥♦♣♠ designs
    - backing.svg    # Red checkered pattern
    - config.json    # Theme metadata
  /neon/
    - suits.svg      # Glowing modern suits (cyberpunk aesthetic)
    - backing.svg    # Circuit board pattern
    - config.json
```

**Theme Config Format:**
```json
{
  "id": "classic",
  "name": "Classic",
  "suitColors": {
    "HEARTS": "#dc2626",
    "DIAMONDS": "#dc2626",
    "CLUBS": "#000000",
    "SPADES": "#000000"
  },
  "cardBackground": "#ffffff",
  "cardBorder": "#000000",
  "backingImage": "backing.svg"
}
```

**Implementation Plan:**
1. Create `ThemeManager` class in `games/cards/shared/themes.js`
2. Update `card-assets.js` to accept theme parameter
3. Add theme selector dropdown to game header (next to ⚙️)
4. Store theme preference in localStorage
5. Support live theme switching (re-render all cards)

**Planned Themes:**
- Classic (current default) - v1.0
- Neon/Cyberpunk - Future
- Retro (pixel art) - Future
- Minimalist (flat colors) - Future

**Note:** Neon/cyberpunk is a good option but deferred until core gameplay is polished.

---

### 3. Loading Screen / Splash Animation 🎬
**Status:** Planned (Return to later)
**Priority:** Low

**Options:**

**Option A: CSS Progress Bar (Preferred)**
```html
<div class="loader-overlay">
  <div class="progress-bar-container">
    <div class="progress-bar" style="width: 0%"></div>
  </div>
  <p>Loading...</p>
</div>
```
- Animate width 0% → 100% over 800ms
- Fade out when complete
- Visual polish only (no actual asset loading)

**Option B: Progressive Asset Loading**
- Load theme images asynchronously
- Show real progress: "Loading cards... 45%"
- Actually wait for assets before game starts
- Only needed if themes become large/slow

**Option C: Spinning Card Icon**
```html
<div class="loader-overlay">
  <div class="spinning-card">🂠</div>
  <p>Shuffling deck...</p>
</div>
```
- Rotate animation
- Simple and fast

**Recommendation:** Start with Option A (progress bar) for MVP, upgrade to Option B only if performance issues arise with themes.

---

### 4. Card Count Tab Handling
**Status:** Needs Decision
**Priority:** Medium

**Question:** What to do with card counting when deck reshuffles?

**Option A: Keep Visible, Reset on Reshuffle**
- Card Count tab stays visible
- When reshuffle occurs, counts reset to 0
- Toast message: "🔄 Shoe reshuffled - counts reset"
- Educational value preserved (teaches basics until reshuffle)

**Option B: Hide by Default, Toggle in Settings**
- Hide Card Count tab by default
- Add Settings toggle: "Show Card Counter (Educational)"
- When enabled, appears in History modal
- Resets on reshuffle

**Option C: Remove Entirely**
- Delete Card Count tab
- Only keep Hand History
- Simplifies UI

**User Input Needed:** Which option do you prefer?

**Recommendation:** Option A (Keep visible, reset on reshuffle) - maintains educational value while being honest about deck reshuffling making it less useful for strategy.

---

## Card Engine - Global Improvements

### 5. Multi-Hand Support (Split) 🃏
**Status:** Deferred to v2.0
**Priority:** High (post-launch)

Required for:
- Blackjack: Split pairs
- Poker variants
- Multi-player games

See `CLAUDE.md` section "Multi-Hand Architecture" for full implementation plan.

---

### 6. Multiplayer via SQL/WebSocket 🌐
**Status:** Future Consideration
**Priority:** Low

Would enable:
- Real-time Big 2 games
- Online Euchre tournaments
- Persistent game state across devices

**Tech Stack Candidates:**
- Backend: Supabase (PostgreSQL + real-time)
- WebSocket: Socket.io or Supabase Realtime
- Auth: Optional (guest mode vs accounts)

---

## Other Games

### 7. War - Nested War Animation
**Status:** Planned
**Priority:** Medium

Add visual flair for Double/Triple War scenarios.

### 8. Big 2 - House Rules Config UI
**Status:** Planned
**Priority:** Medium

Allow users to configure:
- First move criteria (3♦ vs 3♠)
- Suit ranking order
- Scoring system

### 9. Euchre - Trump Suit Selector
**Status:** Planned
**Priority:** Medium

Build partner AI and trick-taking logic.

---

## Questions for User

1. **Card Count Tab:** Keep visible with reset on reshuffle (Option A), hide by default with toggle (Option B), or remove entirely (Option C)?
2. **Reshuffle Threshold:** Should it apply to all card games or just Blackjack?
3. **Loading Screen Priority:** Implement now or defer until themes are added?

## User Feedback Summary (2026-01-14)

- ✅ **Payout in history:** Implemented (v1.2.2)
- ✅ **Hole card tracking:** Already working correctly
- 🔄 **Deck reshuffle:** Should trigger before dealing when `remaining < threshold` (default: 52 cards / 1 deck)
- 🎨 **Neon/Cyberpunk theme:** Good option but deferred to later
- 📊 **Loading bar:** "like a bar I guess" - Progress bar preferred, defer implementation
- ❓ **Card count visibility:** Awaiting decision on how to handle with reshuffles

---

## Changelog Integration

All completed features from this roadmap should be logged in `CHANGELOG.md` with version bumps.
