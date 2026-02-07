# Localization (L10N) Strategy

This document outlines the proposed strategy for implementing localization across the F.O.N.G. repository. The goal is to support multiple languages (starting with Spanish and French) while keeping the implementation lightweight and performant.

## 1. Resource Structure

We will store translations in JSON files, located in a centralized `locales/` directory (or `assets/locales/`).

**File Naming:** `[lang_code].json` (e.g., `en.json`, `es.json`)

**Structure:** Nested JSON objects for namespacing.

```json
// en.json
{
  "app": {
    "title": "F.O.N.G.",
    "subtitle": "A collection of games & utilities"
  },
  "nav": {
    "all": "All",
    "cards": "Cards",
    "board": "Board Games"
  },
  "games": {
    "blackjack": {
      "title": "Blackjack",
      "desc": "Beat the dealer to 21."
    }
  }
}
```

## 2. Implementation Architecture

### The `Translator` Class
A lightweight, dependency-free JavaScript class will manage translation.

*   **Responsibility**:
    *   Detect user language (`navigator.language`).
    *   Load/Persist language preference (`localStorage`).
    *   Fetch translation files.
    *   Update the DOM.

### DOM Integration
We will use `data-attributes` to mark elements for translation.

```html
<h1 data-i18n="app.title">F.O.N.G.</h1>
<button data-i18n="nav.cards">Cards</button>
<!-- For attributes like aria-label or title -->
<button aria-label="Toggle Theme" data-i18n-attr="aria-label:ui.toggle_theme"></button>
```

### Workflow
1.  **Init**: `Translator` checks `localStorage` -> `navigator.language` -> Default (`en`).
2.  **Load**: Fetches the corresponding JSON.
3.  **Translate**: Queries `[data-i18n]` and updates `textContent`. Queries `[data-i18n-attr]` and updates attributes.
4.  **Switch**: When user changes language, fetch new JSON and re-run translate function.

## 3. Dynamic Content (JavaScript)
For strings generated in JS (e.g., game status messages), the `Translator` will expose a helper method:

```javascript
const msg = translator.t('games.blackjack.win_msg', { score: 21 });
// Returns: "You won with 21!"
```

## 4. Phase Plan

### Phase 1: Core Implementation
*   Create `shared/js/translator.js`.
*   Create `locales/en.json` (extracting strings from `index.html`).
*   Create `locales/es.json` (machine translated initial version).
*   Integrate into root `index.html`.

### Phase 2: Game Integration
*   Roll out to `games/cards/` and `games/board/`.
*   Refactor game logic to use `translator.t()` for alerts/status.

### Phase 3: Automation (Optional)
*   Script to scan HTML/JS for missing keys.
*   Validation of JSON structure parity.
