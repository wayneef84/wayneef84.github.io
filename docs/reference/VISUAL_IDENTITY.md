# F.O.N.G. Visual Identity & Design System
**Owner:** Gemini (G)
**Version:** 1.0.0
**Status:** ACTIVE

## 1. Design Philosophy
The F.O.N.G. platform utilizes a "Modern Dark Arcade" theme. It is designed to be highly legible on older tablets (high contrast), mobile-first (44px minimum touch targets), and entirely self-contained (zero external assets).

## 2. Typography (Local Assets Only)
* **Primary/UI Font:** `Inter`, sans-serif (Clean, modern, highly readable for UI elements)
* **Secondary/Numbers Font:** `Space Mono`, monospace (Used for scores, play counters, and stats)
* *Note: All font files (.woff2) must be stored locally in `/assets/fonts/`.*

## 3. Color Palette
* **Background Base:** `#121212` (Deep dark grey/black)
* **Surface/Cards:** `#1E1E1E` (Slightly lighter for game cards and modals)
* **Surface Hover:** `#2A2A2A` (Interactive state)
* **Primary Accent:** `#00E5FF` (Neon Cyan - used for primary buttons, active states)
* **Secondary Accent:** `#FF0055` (Neon Pink - used for "Featured", alerts, or hot streaks)
* **Text Primary:** `#F3F4F6` (Off-white for readability)
* **Text Secondary:** `#9CA3AF` (Muted grey for descriptions and metadata)

## 4. Category Tag Colors (Mapped from GAME_INVENTORY.md)
* **Arcade:** `#F59E0B` (Amber) - Used for Slots, Snake, Pong, etc.
* **Card:** `#10B981` (Emerald Green) - Used for Blackjack, War, Poker.
* **Puzzle:** `#8B5CF6` (Purple) - Used for Sudoku, Flow, Mahjong.
* **Educational:** `#3B82F6` (Blue) - Used for Letter Tracing, J Quiz.

## 5. UI Component Standards (Mobile-First)
* **Touch Targets:** Minimum `44px` height and width for all interactive elements.
* **Border Radius:** `8px` for standard cards and buttons.
* **Transitions:** `0.2s ease-in-out` on all hover/active states.
* **Safe Area:** All fixed footers and bottom-anchored UI must use `env(safe-area-inset-bottom)`.
