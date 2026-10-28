# Design Specifications: Phase 2 Platform Enhancements

**Date:** 2026-02-06
**Author:** Jules (Creative Director)
**Based on:** HANDOFF_JULES.md & HUB_PLATFORM_PLAN.md

This document outlines the design specifications for the upcoming F.O.N.G. Arcade platform enhancements. It provides the visual and interaction guidelines for implementation.

---

## 1. Game Detail Modal

**Purpose:** Provide a rich, immersive preview of a game before launching it, replacing direct navigation.

### Visual Design

*   **Overlay/Backdrop:**
    *   `background-color: rgba(0, 0, 0, 0.8)` (High opacity for focus)
    *   `backdrop-filter: blur(8px)` (Modern glassmorphism effect)
    *   `z-index: 1000` (Above everything)
    *   Animation: `fadeIn 0.3s ease-out`

*   **Modal Container:**
    *   **Width:** Max 800px on Desktop, 90% on Mobile.
    *   **Height:** Auto, max-height 90vh (scrollable content).
    *   **Background:** `var(--bg-surface)`
    *   **Border:** `1px solid var(--accent-primary)` (Subtle glow)
    *   **Radius:** `16px` (Larger than standard cards)
    *   **Shadow:** `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
    *   Animation: `scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)`

### Layout Structure

```html
<dialog id="game-detail-modal" class="modal-backdrop">
  <div class="modal-content">
    <!-- Close Button: Top Right, large touch target -->
    <button class="modal-close-btn" aria-label="Close">&times;</button>

    <!-- Header Section -->
    <header class="modal-header">
      <div class="modal-category-badge">CATEGORY</div>
      <h2 class="modal-title">Game Title</h2>
      <div class="modal-meta-row">
        <span>v1.0.0</span> • <span>Production Ready</span>
      </div>
    </header>

    <!-- Body Section (Grid on Desktop, Stack on Mobile) -->
    <div class="modal-body">
      <!-- Left/Top: Visuals -->
      <div class="modal-visuals">
        <!-- Placeholder for future video/screenshot -->
        <div class="game-preview-box"></div>
      </div>

      <!-- Right/Bottom: Info -->
      <div class="modal-info">
        <p class="game-description">Full game description goes here...</p>

        <div class="game-stats-grid">
          <div class="stat-item">
            <span class="stat-label">DIFFICULTY</span>
            <span class="stat-value">Medium</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">EST. TIME</span>
            <span class="stat-value">5-10m</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">PLAYS</span>
            <span class="stat-value">1.2K</span>
          </div>
        </div>

        <div class="modal-mechanics">
          <span class="mech-tag">Mechanic 1</span>
          <span class="mech-tag">Mechanic 2</span>
        </div>
      </div>
    </div>

    <!-- Footer: Actions -->
    <footer class="modal-footer">
      <button class="btn-secondary">Add to Favorites</button>
      <a href="#" class="btn-primary btn-large">PLAY NOW <span>►</span></a>
    </footer>
  </div>
</dialog>
```

### CSS Implementation Notes
*   Use `display: grid` for the `modal-body` on desktop (2 columns).
*   Switch to `display: flex; flex-direction: column` on mobile (< 768px).
*   Ensure `modal-close-btn` is at least 44x44px.
*   **Accessibility:** Trap focus within modal when open. Close on `Escape` key and backdrop click.

---

## 2. Stats Dashboard (`stats.html`)

**Purpose:** A dedicated hub for player progression, showing lifetime stats and achievements.

### Layout Strategy

*   **Page Layout:** Standard `global-nav` followed by a dashboard grid.
*   **Grid System:** Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop).

### Sections

1.  **Player Overview (Hero Card)**
    *   Full width card at the top.
    *   **Content:**
        *   "Total Plays": Large typography (`clamp(2rem, 5vw, 4rem)`), font `Space Mono`.
        *   "Favorite Category": Icon + Text.
        *   "Member Since": Date.

2.  **Recent Activity (List)**
    *   Vertical list of last 5-10 games played.
    *   **Row Layout:** `[Icon/Img] [Game Name] [Date/Time Ago] [Score/Result]`.
    *   **Styling:** Zebra striping or hover effects on rows.

3.  **Top Games (Cards)**
    *   Horizontal scroll or Grid of "Most Played".
    *   Similar to main game cards but emphasizes *your* stats (e.g., "50 Plays", "High Score: 200").

4.  **Trends (Simple Charts)**
    *   **Visual:** CSS-based bar charts (flexbox with percentage heights) or simple SVG sparklines.
    *   **Metric:** "Plays per Day" (Last 7 days).

### HTML Structure (`stats.html` skeleton)

```html
<main class="dashboard-container">
  <!-- Hero Stat -->
  <section class="stat-card hero-stat">
    <h3>Lifetime Plays</h3>
    <div class="big-number">1,243</div>
    <div class="sub-text">Top 5% of players</div>
  </section>

  <!-- Split View -->
  <div class="dashboard-grid">

    <!-- Recent Activity -->
    <section class="stat-card">
      <h3>Recent Activity</h3>
      <ul class="activity-list">
        <li class="activity-item">
          <span class="game-name">Blackjack</span>
          <span class="time-ago">2m ago</span>
          <span class="result win">WIN (+500)</span>
        </li>
        <!-- ... -->
      </ul>
    </section>

    <!-- Category Breakdown -->
    <section class="stat-card">
      <h3>Play Styles</h3>
      <div class="category-bars">
        <div class="cat-bar" style="--width: 40%; --color: var(--cat-card)">
          <span>Card (40%)</span>
        </div>
        <div class="cat-bar" style="--width: 30%; --color: var(--cat-arcade)">
          <span>Arcade (30%)</span>
        </div>
      </div>
    </section>
  </div>
</main>
```

---

## 3. Game Card Enhancements

**Purpose:** Increase information density and engagement on the main hub.

### Visual Additions

1.  **Quick Stats Badge (Top Right)**
    *   **Appearance:** Small pill, dark background `rgba(0,0,0,0.6)`.
    *   **Content:** Icon (Play button) + Count (e.g., "1.2k").
    *   **CSS:** `position: absolute; top: 1rem; right: 1rem;`

2.  **Personal Best (Bottom Overlay)**
    *   **Appearance:** Slide-up overlay or persistent footer line on card hover.
    *   **Content:** "Your Best: 15,400" (Gold text).

3.  **Favorite Toggle (Top Left)**
    *   **Appearance:** Star icon.
    *   **State:** Outline (default), Filled Yellow (active).
    *   **Interaction:** Click stops propagation (doesn't open game).

### Updated Card CSS

```css
.game-card {
  position: relative; /* Context for absolute badges */
  /* ... existing styles ... */
}

.card-badge-plays {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.7);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-fav-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  background: none;
  border: none;
  color: var(--text-secondary); /* Default */
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
}
.card-fav-btn.active {
  color: #FFD700; /* Gold */
}
```

---

## 4. Theme Toggle & Accessibility

**Purpose:** Allow user preference for Light/Dark mode.

### Implementation

*   **Location:** Global Header (Right side, next to Stats).
*   **Component:** Icon-only button (Sun/Moon).
*   **Animation:** Rotate/Swap icon.

### Design Specs

*   **Dark Mode (Default):**
    *   Icon: Moon (or Sun to switch to light?) -> usually "Sun" icon implies "Switch to Light".
    *   `--bg-base`: `#121212`
    *   `--text-primary`: `#F3F4F6`

*   **Light Mode (New Variables):**
    *   `--bg-base`: `#F9FAFB` (Cool Gray 50)
    *   `--bg-surface`: `#FFFFFF`
    *   `--bg-surface-hover`: `#F3F4F6`
    *   `--text-primary`: `#111827`
    *   `--text-secondary`: `#4B5563`
    *   `--accent-primary`: `#00B5CC` (Darker Cyan for contrast)

### Toggle Button HTML

```html
<button id="theme-toggle" class="nav-btn" aria-label="Toggle Dark Mode">
  <!-- SVG Icon here -->
  <svg class="icon-sun">...</svg>
  <svg class="icon-moon">...</svg>
</button>
```

### JS Logic (Pseudocode)

```javascript
// On Load
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

// On Toggle
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}
```

---

## Implementation Priority

1.  **Phase 1.1:** Modal Structure & CSS.
2.  **Phase 3.3:** Theme Toggle (Global CSS variables update).
3.  **Phase 3.1:** Card Badges (Requires JS injection).
4.  **Phase 2.2:** Stats Page (Full new page).

This specification is ready for the Implementation Agent (Claude #3).
