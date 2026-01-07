# 🎰 Dad's Slots (V1.0 Gold Master)

**Dad's Slots** is a lightweight, browser-based slot machine game featuring 20 unique themes, particle effects, and a "Dad Mode" physics engine designed for fun, frequent wins.

## 🎮 How to Play (Rules)

### 1. The Objective
Spin the reels to match **3 or more symbols** on an active payline.
* **3 Matches:** Standard Payout.
* **4 Matches:** 3x Multiplier.
* **5 Matches:** 5x Multiplier.

### 2. Special Symbols
* **🃏 Wilds:** Substitute for any symbol except Scatters to create a winning line.
* **🌟 Scatters:** These pay in **any position** (they do not need to be on a line). 3 or more Scatters usually trigger a big payout (Free Spins logic reserved for v1.1).

### 3. Controls
* **BET:** Increase or decrease your wager per spin (Min: $0.20, Max: $5.00).
* **LINES:** Choose how many paylines are active (1-20).
* **SPIN:** Starts the game.
* **QUICK STOP:** Press the **STOP** button while reels are spinning to instantly finish the round.
* **RESET:** If you run out of money, hit the Reset button in the top bar to restore your $100 balance.

### 4. Themes
Select from **20 different themes** using the dropdown menu at the top, including:
* 🦄 Mystical Unicorn
* 🚀 Space Explorer
* 🦁 Wild Animals
* 🍒 Vegas Classic
* ...and 16 more!

---

## 🛠️ Installation & Setup

1.  **Download** the 4 core files:
    * `index.html`
    * `styles.css`
    * `script.js`
    * `themes.js`
2.  **Place them** in the same folder.
3.  **Double-click** `index.html` to play in your web browser.
    * *No server or installation required.*

---

## 📂 File Structure

* **`index.html`**: The game interface and DOM structure. Contains the canvas and the overlay system for glow effects.
* **`styles.css`**: Handles the layout, animations (pulsing, flashing), and responsiveness.
* **`script.js`**: The Core Engine. Handles RNG logic, Canvas drawing (Z-Layering), Win Calculations, and Particle Physics.
* **`themes.js`**: The Database. Contains the configuration for all 20 themes (colors, symbols, weights).

---

## 📝 Credits
* **Version:** 1.0 (Gold Master)
* **Engine:** Canvas 2D / Vanilla JS
* **License:** Open Source