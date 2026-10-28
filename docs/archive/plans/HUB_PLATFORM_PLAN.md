# F.O.N.G. Hub / Platform Layer - Implementation Plan

## Current State
- **Hub**: Static HTML with category filters, featured game rotation, play counter
- **Games**: 19 games with separate implementations, no progression tracking
- **Architecture**: Pure frontend, localStorage for game state and play counts

## Phase 1: Game Discovery & Metadata (Priority: HIGH)

### 1.1 Game Detail Modal System
- **What**: Click any game card → show modal with:
  - Full game description
  - Gameplay mechanics / rules
  - Estimated play time
  - Play count + user rating placeholder
  - How to play video/GIF (optional)
  - Quick play button

- **Implementation**:
  - Create `js/game-details.js` (ES5, IIFE pattern)
  - Modal HTML in `index.html` (hidden by default)
  - Game catalog with extended metadata in `hub-filters.js`
  - CSS modal overlay in `card.css`

### 1.2 Game Descriptions Database
- **What**: Structured game metadata
  - `id`: unique identifier
  - `title`: display name
  - `category`: card/arcade/puzzle/edu
  - `version`: version number
  - `description`: 2-3 sentence marketing copy
  - `mechanics`: array of key features ["insurance", "double-down", etc]
  - `difficulty`: easy/medium/hard
  - `playtime`: "5-10 mins"

- **Implementation**:
  - Store in `js/games-catalog.js`
  - JSON-like object (no external API)
  - Reference by game ID for consistency

### 1.3 Search & Filter Enhancements
- **What**:
  - Search bar in header
  - Filter by difficulty, playtime, mechanics
  - Sort by: newest, most played, trending

- **Implementation**:
  - `js/hub-search.js` for search logic
  - Update `hub-filters.js` to include new filter types
  - Case-insensitive string matching on title/description

---

## Phase 2: User Progression & Stats (Priority: HIGH)

### 2.1 Game Session Tracking
- **What**: Track per-game statistics
  - Total plays
  - Best score / high score (if applicable)
  - Last played timestamp
  - Play duration (if games support it)
  - Win rate (for games with win conditions)

- **Storage**: localStorage key `game_stats_{gameId}`
  ```javascript
  {
    gameId: 'blackjack',
    totalPlays: 42,
    bestScore: 15000,
    lastPlayed: 1707123456789,
    wins: 28,
    losses: 14,
    playDurations: [300, 245, 189, ...]
  }
  ```

- **Implementation**:
  - Create `js/player-stats.js` (ES5)
  - Each game calls `window.recordGameSession(gameId, stats)`
  - Auto-called when game ends or page unloads

### 2.2 User Dashboard / Stats Page
- **What**: New page at `/stats.html` showing:
  - Total lifetime plays across all games
  - Most played games (top 5)
  - Recent games (last 10)
  - Win rate by category
  - Play time trends
  - Achievements / badges (future)

- **Implementation**:
  - `stats.html` (new page)
  - `js/stats-view.js` for calculating aggregates
  - Charts/graphs using simple Canvas or CSS (no chart library)
  - Link in header navigation

### 2.3 Game-Specific High Score Boards
- **What**: In-game access to personal + "top scores"
  - Personal best score
  - Play history (last 10 plays)
  - Session duration trends

- **Implementation**:
  - `js/leaderboard-local.js`
  - Games query this API to show scoreboard
  - Pure localStorage, no server sync

---

## Phase 3: Hub UX Refinements (Priority: MEDIUM)

### 3.1 Game Card Enhancements
- **What**: Add to each card:
  - Play count badge (e.g., "1.2K plays")
  - Quick stat (e.g., "Your best: 2100 pts")
  - Last played date (e.g., "Played 3 days ago")
  - Star rating / favorite toggle

- **Implementation**:
  - Update card HTML structure in `index.html`
  - `js/card-decorator.js` hydrates stat badges
  - Favorite/star uses localStorage key `favorites_{gameId}`

### 3.2 Recommendation Engine
- **What**: "Games you might enjoy" section
  - Based on: last played, category preferences, play frequency
  - Show 3-4 related games in featured area

- **Implementation**:
  - `js/recommendations.js` (ES5)
  - Algorithm: analyze play history, suggest similar category
  - Update featured section dynamically

### 3.3 Dark/Light Theme Toggle
- **What**: Theme switcher in header
  - Light mode: lighter backgrounds, adjusted colors
  - Persists to localStorage

- **Implementation**:
  - CSS variables already support this (good!)
  - `js/theme-switcher.js` toggles `[data-theme="light"]` on root
  - Add toggle button to header

---

## Phase 4: Hub Analytics (Priority: MEDIUM)

### 4.1 Anonymized Play Analytics
- **What**: Track (locally, no server):
  - When games are played
  - How long sessions last
  - Category preferences
  - Device info (screen size, touch/mouse)
  - Browser storage capacity used

- **Implementation**:
  - `js/analytics-local.js`
  - localStorage: `analytics_summary` (daily rollup)
  - Export as JSON for analysis (manual download)

### 4.2 Hub Landing Page Analytics
- **What**: Track:
  - Featured game click rate
  - Category filter usage
  - Search queries (if implemented)
  - Device viewport breakdown

- **Implementation**:
  - Analytics recorded in hub-filters.js
  - Key: `hub_analytics`
  - Export/view in stats page

---

## Phase 5: Content & SEO (Priority: LOW)

### 5.1 Metadata Updates
- **What**: Add to games-catalog.js:
  - Short description (for search engines, meta tags)
  - Tags (category + mechanics + difficulty)
  - Developer credit
  - Last updated date

### 5.2 Sharing / Social
- **What**:
  - Share buttons (copy link, direct share)
  - Share with score: "I scored 2100 at Blackjack!"
  - OpenGraph meta tags for rich previews

- **Implementation**:
  - `js/game-share.js`
  - Generate shareable link with game ID + screenshot (optional)
  - localStorage for temp share context

---

## Implementation Priority Order

1. **Week 1**: 1.2 (Catalog) + 2.1 (Session tracking) - foundation
2. **Week 2**: 1.1 (Game modal) + 2.2 (Dashboard) - discovery + stats
3. **Week 3**: 3.1 (Card badges) + 3.2 (Recommendations) - UX polish
4. **Week 4**: 4.1 (Analytics) + 3.3 (Theme) - engagement tracking

---

## File Structure (New Files)

```
js/
  ├── games-catalog.js          (Phase 1.2)
  ├── game-details.js           (Phase 1.1)
  ├── hub-search.js             (Phase 1.3)
  ├── player-stats.js           (Phase 2.1)
  ├── stats-view.js             (Phase 2.2)
  ├── leaderboard-local.js      (Phase 2.3)
  ├── card-decorator.js         (Phase 3.1)
  ├── recommendations.js        (Phase 3.2)
  ├── theme-switcher.js         (Phase 3.3)
  ├── analytics-local.js        (Phase 4.1)
  └── game-share.js             (Phase 5.2)

pages/
  └── stats.html               (Phase 2.2)

css/components/
  ├── modal.css                (Phase 1.1)
  ├── stats.css                (Phase 2.2)
  └── recommendations.css      (Phase 3.2)
```

---

## Technical Constraints & Patterns

- **ES5 only**: All new files use strict ES5 (var, function(){}, IIFE pattern)
- **No dependencies**: No jQuery, no framework, no CDN
- **localStorage only**: No IndexedDB or server sync
- **Relative paths**: `./js/...` not `/js/...`
- **Progressive enhancement**: Works without JS (cards still clickable)
- **Mobile first**: min-height 44px touch targets, safe-area support

---

## Next LLM Handoff

The next Claude should:
1. Implement Phase 1.2 + 1.1 (catalog + modal system)
2. Test game detail modal with 3-4 games
3. Create Phase 2.1 integration point: add `recordGameSession()` call to Blackjack as example
4. Document the pattern so other games can integrate

Then move to Phase 2.2 (stats dashboard) if time permits.

**Key files to understand**:
- `hub-filters.js` (game catalog pattern)
- `hub-data.js` (localStorage usage pattern)
- Blackjack's `_updateBalance()` (where to hook session tracking)
