# Blackjack - Technical Documentation

## Architecture
*   **Framework**: Shared Card Engine (`games/cards/shared/`).
*   **Logic**: `BlackjackRuleset` (`ruleset.js`) implements the specific game rules.
*   **UI**: `BlackjackUI` (`index.html`) handles DOM interaction.

## State Management
*   **Currency**: Persisted in `localStorage` (`blackjack_balance`).
*   **Deck**: Managed by `negen/cards/Deck` or Shared Deck. 6-Deck Shoe standard.

## Dependencies
*   `games/cards/shared/`: Core card classes.
