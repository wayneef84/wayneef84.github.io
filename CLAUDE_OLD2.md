# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fong Family Arcade** (formerly Dad's Casino) is a browser-based game collection for the whole family:
- **Letter Tracing** (v5.1): Educational app with A-B-C audio architecture, voice speed control, and rigorous stroke validation.
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system.
- **Xiangqi** (v0.3.1): Fully playable Chinese Chess with AI opponent.
- **Card Games** (Planned): Blackjack, War, Poker, Crazy 8s — built on a shared Card Engine.

---

## 🚧 NEXT TODO: Card Engine System

**Status:** Architecture complete, ready for implementation.
**Owner:** G (Gemini) for frontend/integration, C (Claude) designed the systems architecture.
**Goal:** Build a reusable Card Engine that all card games share (Blackjack first, then War, Poker, Crazy 8s).

### Architecture Overview

The Card Engine separates concerns into three layers:

| Layer | Responsibility | Game-Specific? |
|-------|----------------|----------------|
| **Deck/Pile** | Card storage, shuffling, dealing | No — shared |
| **State Machine** | Turn orchestration, valid transitions | No — shared |
| **Ruleset** | Game logic, win conditions, AI strategy | Yes — per game |

### Folder Structure

```
/games
  /cards
    /shared
      - enums.js         # Suit, Rank enums
      - card.js          # Card data structure
      - deck.js          # Deck template definitions
      - pile.js          # Universal card container
      - player.js        # Base player structure
      - engine.js        # State machine + orchestration
    /blackjack
      - ruleset.js       # Blackjack-specific rules
      - index.html
    /war
      - ruleset.js
      - index.html
    /poker
      - ruleset.js
      - index.html
    /crazy-eights
      - ruleset.js
      - index.html
```

---

### Data Structures

#### Enums (enums.js)

```javascript
const Suit = {
  CLUBS: 'CLUBS',
  DIAMONDS: 'DIAMONDS',
  HEARTS: 'HEARTS',
  SPADES: 'SPADES'
  // Extensible: add STARS, MOONS, etc.
};

const Rank = {
  ACE: 'ACE',
  TWO: 'TWO',
  THREE: 'THREE',
  FOUR: 'FOUR',
  FIVE: 'FIVE',
  SIX: 'SIX',
  SEVEN: 'SEVEN',
  EIGHT: 'EIGHT',
  NINE: 'NINE',
  TEN: 'TEN',
  JACK: 'JACK',
  QUEEN: 'QUEEN',
  KING: 'KING'
  // Extensible: add JOKER, custom ranks
};
```

Note: Enums define identity only. Numeric value is determined by Ruleset per game (Ace = 1 or 11 in Blackjack, Ace = 14 in War).

#### Card (card.js)

```javascript
Card {
  suit: Suit,
  rank: Rank,
  id: string,      // Shorthand: 'KH', '9D', 'AS'
  deckId: string   // References Deck template for cardBack lookup
  // uuid: string  // Optional, for debugging — deferred
}
```

#### Deck (deck.js) — Template Only

Deck is a **blueprint**, not a container. It defines what cards *could* exist:

```javascript
Deck {
  id: string,           // 'standard', 'euchre', 'wild-no-twos'
  suits: Suit[],
  ranks: Rank[],
  cardBack: string      // Image reference or color key
}
```

**Predefined templates:**

| id | suits | ranks | notes |
|----|-------|-------|-------|
| `'standard'` | All 4 | All 13 | 52 cards |
| `'euchre'` | All 4 | 9, 10, J, Q, K, A | 24 cards |
| `'pinochle'` | All 4 | 9, 10, J, Q, K, A | 24 cards (use copies: 2 for 48) |

Games create custom Decks as needed (wild cards, specialty decks).

#### Pile (pile.js) — Universal Card Container

**Properties:**

```javascript
Pile {
  contents: Card[],     // Ordered array
  template: Card[]      // Optional, snapshot for reset
}
```

**Position Logic:**
- `0` = Top (first element)
- `1` = Second from top
- `-1` = Bottom (last element)
- `-2` = Second from bottom
- Wraps like Python list indexing

**Methods:**

| Method | Signature | Behavior |
|--------|-----------|----------|
| `createFrom` | `static createFrom(deck: Deck, copies: number) → Pile` | Factory, builds new pile from template |
| `clone` | `clone() → Pile` | Deep copy of pile and all cards |
| `receive` | `receive(card: Card, position: number) → void` | Add single card at position |
| `give` | `give(position: number) → Card` | Remove and return card from position |
| `addFrom` | `addFrom(sourcePile: Pile) → void` | Move all cards from source (destructive) |
| `cloneFrom` | `cloneFrom(sourcePile: Pile) → void` | Copy all cards from source (non-destructive) |
| `remove` | `remove(filter: { suit?: Suit[], rank?: Rank[] }) → Pile` | Remove matching cards, return as new Pile |
| `setDeckId` | `setDeckId(newId: string) → void` | Re-tag all cards with new deckId |
| `peek` | `peek(position: number) → Card` | View card without removing |
| `filter` | `filter(criteria: { suit?: Suit[], rank?: Rank[] }) → Pile` | Non-destructive, returns new pile |
| `shuffle` | `shuffle() → void` | Randomize contents order |
| `reset` | `reset() → void` | Restore contents from template |
| `count` | `get count → number` | Number of cards in pile |

**Remove Filter Logic:**
- `{ rank: [TWO, THREE] }` → Remove all 2s and 3s (any suit)
- `{ suit: [HEARTS] }` → Remove all Hearts (any rank)
- `{ rank: [ACE], suit: [SPADES] }` → Remove only Ace of Spades
- `{}` or no filter → Remove all cards

#### Player (player.js)

```javascript
Player {
  id: string,
  type: 'human' | 'ai',
  seat: number,         // Table position
  hand: Pile
}
```

Games extend or compose for additional properties (currency, bet history, AI strategy).

---

### State Machine (engine.js)

#### Generic States

| State | Description | Waiting For |
|-------|-------------|-------------|
| `IDLE` | No game in progress | Player to start |
| `BETTING` | Accepting wagers | Player to confirm bet |
| `DEALING` | Cards being distributed | Animation/deal complete |
| `PLAYER_TURN` | Active player choosing action | Player input |
| `SIMULTANEOUS_ACTION` | Multiple actors at once (War) | All actors respond |
| `OPPONENT_TURN` | AI or other player acting | AI decision resolves |
| `RESOLUTION` | Determining winner | Calculation complete |
| `PAYOUT` | Distributing winnings | Animation complete |
| `GAME_OVER` | Round complete | Player to restart or quit |

Not every game uses every state. Ruleset defines which states exist.

#### Transition Rules

```
IDLE → BETTING | DEALING
BETTING → DEALING | IDLE
DEALING → PLAYER_TURN | OPPONENT_TURN | SIMULTANEOUS_ACTION
PLAYER_TURN → PLAYER_TURN | OPPONENT_TURN | RESOLUTION
SIMULTANEOUS_ACTION → RESOLUTION
OPPONENT_TURN → OPPONENT_TURN | PLAYER_TURN | RESOLUTION
RESOLUTION → PAYOUT | GAME_OVER
PAYOUT → GAME_OVER
GAME_OVER → IDLE | BETTING
```

#### Engine Flow

1. State Machine enters `PLAYER_TURN`
2. Engine asks Ruleset: "Who acts now?"
3. Ruleset returns: `{ actorId: 'player2', type: 'human' }`
4. Engine asks Ruleset: "What can player2 do?"
5. Ruleset returns: `['hit', 'stand', 'double']`
6. Engine waits for input (human) or calls AI (computer)
7. Actor chooses `'hit'`
8. Engine asks Ruleset: "Player2 chose 'hit'. Now what?"
9. Ruleset returns action result with next state
10. Engine executes actions, updates state, loops

The State Machine is **reusable across all games**. Only the Ruleset changes.

---

### Ruleset Interface

Each game implements this interface:

```javascript
Ruleset {
  // Identity
  gameId: string,
  displayName: string,
  minPlayers: number,
  maxPlayers: number,
  
  // Deck recipes
  decks: Deck[],
  buildGamePile: function → Pile,
  
  // States
  states: State[],
  initialState: State,
  
  // Turn logic
  getNextActor(gameState) → { actorId, type },
  getAvailableActions(gameState, actorId) → string[],
  resolveAction(gameState, actorId, action) → ActionResult,
  
  // Evaluation
  evaluateHand(cards) → value,
  checkWinCondition(gameState) → WinResult | null,
  
  // Optional
  aiStrategy(gameState, actorId) → action,
  timeout: { [state]: seconds }  // Deferred
}
```

---

### Action Types

Actions the Ruleset can trigger for the Engine to execute:

| Action Type | Parameters | Purpose |
|-------------|------------|---------|
| `DEAL` | from, to, count, faceUp | Move cards from pile to player/pile |
| `MOVE` | from, to, cardFilter, position | Move specific cards between locations |
| `REVEAL` | target, cardFilter | Flip cards face-up |
| `SHUFFLE` | target | Randomize a pile |
| `SCORE` | playerId, value | Update player's score |
| `PAYOUT` | playerId, amount | Credit currency |
| `DEDUCT` | playerId, amount | Deduct currency |
| `MESSAGE` | text | Display to UI |

---

### GameState Object

What the Engine tracks:

```javascript
GameState {
  currentState: State,
  players: Player[],
  piles: { [name]: Pile },    // drawPile, discardPile, etc.
  activeActorId: string | null,
  turnHistory: Action[],      // Optional, for undo/replay
  roundNumber: number,
  pot: number                 // If betting
}
```

---

### Data Contract (Frontend Communication)

When cards move, Engine emits state updates:

```javascript
{
  action: 'DEAL' | 'MOVE' | 'REVEAL' | 'SHUFFLE' | 'RESET',
  from: {
    type: 'pile' | 'player',
    id: string
  },
  to: {
    type: 'pile' | 'player',
    id: string
  },
  cards: [
    { suit: 'HEARTS', rank: 'KING', id: 'KH', deckId: 'standard' }
  ],
  position: 'top' | 'bottom' | number,
  faceUp: boolean
}
```

Frontend receives this, animates accordingly, doesn't need to know game logic.

---

### Animation Handling

- **Engine fires ahead**: State updates emit immediately
- **Frontend catches up**: Animates at its own pace
- **Skip option**: Player preference `{ animationSpeed: 'normal' | 'fast' | 'skip' }`
- **Acknowledgment**: Optional `awaitAcknowledgment` flag for critical transitions (e.g., "reveal before insurance decision")

---

### Currency Integration

Don't standardize betting logic (varies too much). Standardize the **currency API**:

```javascript
currency.check(amount) → boolean  // Can they afford this?
currency.deduct(amount) → void    // Take it
currency.credit(amount) → void    // Pay them
currency.reset(default) → void    // Reset to default
```

Each game handles *when* and *why*. Currency system handles the wallet.

---

### Example: Building a Game Deck With Wilds

```javascript
// Define decks
const standardDeck = { id: 'standard', suits: ALL, ranks: ALL, cardBack: 'blue' };
const wildDeck = { id: 'wild', suits: ALL, ranks: ALL, cardBack: 'red' };

// Create working piles
const standardPile = Pile.createFrom(standardDeck, 1);  // 52 cards

const wildPile = Pile.createFrom(wildDeck, 1);          // 52 cards
wildPile.remove({ rank: [Rank.TWO, Rank.THREE] });      // Returns 8 cards, wildPile now 44

// Merge into game pile
const gamePile = new Pile();
gamePile.addFrom(standardPile);  // standardPile now empty
gamePile.addFrom(wildPile);      // wildPile now empty
gamePile.shuffle();

// Result: 96 cards
// Game rules: if card.deckId === 'wild' → treat as wild
```

---

### Implementation Order

1. **Phase 1**: `enums.js`, `card.js`, `deck.js`, `pile.js` — Core data structures
2. **Phase 2**: `player.js`, `engine.js` — State machine and orchestration
3. **Phase 3**: `blackjack/ruleset.js` — First game implementation
4. **Phase 4**: Frontend integration (G handles canvas, animations, touch)
5. **Phase 5**: Additional games (War, Poker, Crazy 8s)

---

## Letter Tracing - Development Guide

### Architecture

**Core Engine:** `games/letters/js/game.js`
- **Class:** `LetterGame`
- **Responsibility:** Manages canvas rendering, stroke validation, audio playback, and UI state.
- **Guidance Modes:**
  - `Guide` (Default): Shows ghost dot + green target dot.
  - `Strict`: No ghost dot, only green target.
  - `Loose`: Forgiving distance check, no visual cues.
  - `Hard`: No assistance.

**Data Layer:** `games/letters/assets/content.js`
- **Structure:** Cascading Config System (Item > Pack > Global).
- **Rich Item Format:**

    "A": {
        "name": "A",
        "words": ["Apple", "Ant", "Astronaut"], // Used for dynamic audio
        "strokes": [ ... ] // Geometry data
    }

- **Stroke Types:** `line` (start/end), `arc` (cx, cy, rx, ry, start, end), `complex` (nested parts).

**Audio Architecture (A+B+C System):**
Voice feedback is constructed dynamically using three components:
1. **Component A (Prefix):** Random praise (e.g., "Wow!", "Great Job").
2. **Component B (Content):** Educational context (e.g., "A is for Apple, and Ant").
3. **Component C (Suffix):** Personalization (e.g., "Go Kenzie!").

**Resolution Logic:**
- System checks `audioOverride` (Item level) → `audioDefaults` (Pack level) → `globalAudio` (Global level).
- Speed is controlled via a slider (0.25x to 2.0x) modifying the `SpeechSynthesisUtterance.rate`.

### Mobile Layout & Scaling (Critical)

The layout uses a specific CSS strategy to handle mobile browser address bars and ensure options remain visible:

1. **Viewport Height:** Uses `height: 100dvh` (Dynamic Viewport Height) on `body` to adapt to mobile browser chrome.
2. **Flexbox Locking:**
   - Header: `flex-shrink: 0` (Never collapse).
   - Grid: `flex-shrink: 0` (Always visible at bottom).
3. **Canvas Trick:**
   - Wrapper uses `flex-grow: 1` and **`height: 0`**.
   - This forces the canvas container to calculate size based on *remaining* space, rather than pushing the container boundaries outward.

---

## Slots Game - Development Guide

**Core Engine:** `js/slots.js` - The main game engine (SlotMachine class)
- **Scale Manager**: Handles responsive scaling. Uses a fixed reference resolution (480x850).
- **Rendering Pipeline**: Layer 1 (Backgrounds) → Layer 2 (Win Lines) → Layer 3 (Symbols) → Layer 4 (Particles).

**Theme System:** `js/themes.js`
- 20 themes configured with symbols, weights, and colors.
- **Dad Mode**: Adjustable win chance favors high-value symbols.

---

## Xiangqi (Chinese Chess) - Development Guide

**Three-Layer Architecture:**
1. **rules.js (The Referee):** Pure logic, stateless validation. Handles Flying General and blocking rules.
2. **ai.js (The Brain):** Minimax with alpha-beta pruning. Depth-based difficulty (1, 2, 4).
3. **game.js (The Painter):** Canvas rendering, click handling, and UI integration.

**Coordinates:**
- Uses intersection-based coordinates (0-9 rows, 0-8 cols).
- Click detection snaps to nearest intersection using `Math.round()`.

---

## Sprunki Mixer - Development Guide

**Configuration:** `games/sprunki/config.json`
- Defines packs, characters, and asset paths.
- **CORS Warning:** Must be served via HTTP server (not file://) due to Web Audio API restrictions.

---

## Common Development Tasks

### Adding a New Letter/Shape
1. Edit `games/letters/assets/content.js`.
2. Define the geometry in `strokes`.
   - **Tip:** For "humps" (m, n, h), use `180 -> 360` degrees to arc *over* the top.
   - **Tip:** For descenders (g, j, p, q, y), cap vertical lines at `Y=120` to prevent overshooting the writing lines.
   - **Tip:** For shoulders (r), ensure retrace goes high (Y=60) before arcing to create a distinct stem.
3. Add `words` array for audio context.

### Adjusting Letter Audio
1. To change global praise, edit `AUDIO_LIB.PREFIXES` in `content.js`.
2. To change a specific letter, add `"audioOverride": { "A": ["..."], "C": ["..."] }` to the item object.

### Adding a New Slot Theme
1. Add theme entry to `THEME_LIBRARY` in `js/themes.js`.
2. Theme will automatically appear in the dropdown selector.

### Adding a New Sprunki Pack
1. Edit `games/sprunki/config.json`.
2. Place audio files (WAV) and images (SVG) in `assets/packs/yourpack/`.
3. Pack will appear in the pack selector dropdown.

---

## Documentation Standards

### Changelog Management
**Do not** append version history to this `CLAUDE.md` file.
1. Create/Update a file named `CHANGELOG.md` in the root directory.
2. Log all significant changes, bug fixes, and version bumps there.
3. Keep `CLAUDE.md` reserved for architectural guidance, code patterns, and "How-To" reference.

### Code Style
- **JS:** ES6 Classes for engines, Vanilla JS, no build steps.
- **CSS:** Flexbox for layout, `dvh` for mobile heights.
- **Canvas:** Use `requestAnimationFrame` for loops.
- **Comments:** Comment complex math (especially geometry in Letters/Xiangqi).

---

## Development Commands

### Running the Application

**Main Arcade Hub:**
```bash
open index.html
```

**Slots Game:**
```bash
open games/slots.html
```

**Sprunki Mixer:**
```bash
# IMPORTANT: Must use local server due to CORS restrictions
cd games/sprunki
python3 -m http.server 8000
# Then navigate to http://localhost:8000/index.html
```

**Xiangqi:**
```bash
open games/xiangqi/index.html
```

**Letter Tracing:**
```bash
open games/letters/index.html
```

---

## Important Implementation Notes

### Mobile Scaling (Critical)

The slots game uses a **fixed design resolution** (480x850) and scales the entire game container:
- `#gameScaler` div is scaled via CSS transform in `autoResize()` method
- Canvas is separately resized with device pixel ratio support for retina displays
- Touch feedback system prevents pull-to-refresh and adds haptic vibration

**Do not** modify canvas dimensions directly. Always work with the display size calculated from container dimensions.

### CORS Restrictions

The Sprunki mixer **must** be served via HTTP server, not file:// protocol. Audio and image loading will fail otherwise.

### localStorage Keys

- `dadsSlotsSave`: Stores `{balance, bet, theme}` for slots game

### Xiangqi Board Coordinates

**Critical:** Xiangqi uses intersection-based coordinates, not square-based like Western chess.

- Board is 9 columns × 10 rows (9 vertical lines, 10 horizontal lines)
- Pieces sit **on intersections**, not in squares
- Coordinate system: `board[row][col]` where row 0 = Red's back rank, row 9 = Black's back rank
- Click detection uses `Math.round()` to snap to nearest intersection
- Palace zones: Red (rows 0-2, cols 3-5), Black (rows 7-9, cols 3-5)
- River: Between rows 4 and 5