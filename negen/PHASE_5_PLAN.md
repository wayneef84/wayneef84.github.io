# Phase 5 Plan: The Meta Layer

**Objective:** Tie all games together into a cohesive "Arcade" experience with a persistent player identity, economy, and installable app shell.

---

## 1. The "FongCoin" Economy
*   **Concept:** A unified currency shared across Blackjack, Poker, and Slots.
*   **Tech:** `negen/data/StorageManager` (Tier 2: IndexedDB).
*   **Feature:** "Daily Bonus" - A global timer resetting every 24h.

## 2. The "Profile" System
*   **Identity:** User chooses an Avatar (Emoji or SVG).
*   **Stats:** Track "Time Played", "Games Won", "High Scores" globally.
*   **Achievements:** "Unlockables" (e.g., Gold Card Deck) for reaching milestones.

## 3. PWA Shell (Progressive Web App)
*   **Goal:** Make the arcade installable on iOS/Android home screens.
*   **Reqs:** `manifest.json`, Service Worker for offline caching (critical for `AssetLoader`).
*   **UI:** A "Launcher" scene in NEGEN that replaces the static `index.html` list.

---

## Vision
By Phase 5, "F.O.N.G." is no longer a list of links, but a single application where the user launches games, earns coins, and tracks progress without leaving the immersive environment.
