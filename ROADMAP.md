# Fong Family Arcade - Roadmap

## Blackjack - Next Features

### 1. Shoe Rebuild Threshold ⚙️
**Status:** Planned
**Priority:** Medium

**Current Behavior:**
- Deck shuffled once at game start
- Card count tracks all 312 cards (6 decks)
- No automatic reshuffling

**Proposed Feature:**
- Add configurable "Reshuffle Threshold" in Settings (default: 20%)
- When remaining cards < threshold, trigger automatic reshuffle
- Visual feedback: "Shuffling shoe..." message
- Reset card count tracker on reshuffle
- Setting range: 10% - 50% (increments of 5%)

**Implementation Notes:**
```javascript
// In ruleset.js or engine.js
if (shoe.count < (totalCards * reshuffleThreshold)) {
    this._reshuffleDeck();
    this._emit({ type: 'SHOE_RESHUFFLED' });
}
```

**UI Updates:**
- Add slider to Settings modal: "Reshuffle at: [20%]"
- Show "🔄 Shuffling..." overlay when triggered
- Optional: Show reshuffle count in History modal

---

### 2. Card Themes / Visual Packs 🎨
**Status:** Planned
**Priority:** High

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
    - suits.svg      # Glowing modern suits
    - backing.svg    # Circuit board pattern
    - config.json
  /retro/
    - suits.svg      # Pixel art suits
    - backing.svg    # 8-bit pattern
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

**Included Themes (v1.0):**
- Classic (current default)
- Neon (cyberpunk)
- Retro (pixel art)
- Minimalist (flat colors)

---

### 3. Loading Screen / Splash Animation 🎬
**Status:** Planned
**Priority:** Low

**Options:**

**Option A: CSS-Only Fake Loader**
```html
<div class="loader-overlay">
  <div class="spinning-card">🂠</div>
  <p>Shuffling deck...</p>
</div>
```
- Fade out after 800ms
- No actual loading logic
- Pure visual polish

**Option B: Progressive Asset Loading**
- Load theme images asynchronously
- Show progress bar: "Loading cards... 45%"
- Actually wait for assets before game starts

**Recommendation:** Start with Option A (fake loader) for MVP, upgrade to Option B when adding multiple themes.

---

### 4. Card Count Tab Visibility Toggle
**Status:** Under Review
**Priority:** Low

**Question:** Should card counting feature be removed or made optional?

**Arguments for Removal:**
- Deck reshuffles make counting useless
- Takes up UI space in History modal
- Not relevant to casual play

**Arguments for Keeping:**
- Educational value (teaches card counting basics)
- Can be kept if reshuffle threshold is high (50%+)
- Useful for tracking "hot/cold" decks

**Proposed Compromise:**
- Hide Card Count tab by default
- Add Settings toggle: "Show Card Counter (Educational)"
- When enabled, appears as 3rd tab in History modal

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

1. **Card Count Tab:** Remove entirely, or keep as optional toggle?
2. **Reshuffle Threshold:** Should it apply to all card games or just Blackjack?
3. **Theme Priority:** Which 4 themes should ship in v1.0?
4. **Loading Screen:** Fake loader (fast) or real asset preloading (slower but accurate)?

---

## Changelog Integration

All completed features from this roadmap should be logged in `CHANGELOG.md` with version bumps.
