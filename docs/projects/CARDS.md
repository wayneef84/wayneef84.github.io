# Project: Card Games

**Directory**: `games/cards/`

## Overview
A suite of classic card games (Blackjack, Euchre, War) running on a shared DOM-based engine. It features SVG-based card rendering and deep-linking support.

## Architecture
The architecture allows multiple games to share the same underlying card manipulation logic.

### Shared Engine (`games/cards/shared/`)
*   **`engine.js`**: Core state machine and game loader.
*   **`card.js`**: Represents a single card entity.
*   **`deck.js`**: Manages collections of cards (shuffling, dealing).
*   **`pile.js`**: Manages groups of cards on the table.
*   **`player.js`**: Abstract player class.
*   **`card-assets.js`**: Generates card graphics programmatically using SVG paths (no raster images).

### Games
*   **Blackjack**: `games/cards/blackjack/`
*   **War**: `games/cards/war/`
*   **Euchre**: `games/cards/euchre/`

### Key Features
*   **Deep Linking**: `?game=poker` URL parameter loads specific game modules.
*   **DOM Rendering**: Cards are `<div>` elements manipulated via CSS transforms for animations.
