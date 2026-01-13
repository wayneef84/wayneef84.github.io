# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dad's Casino** is a browser-based casino game collection featuring multiple games:
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system
- **Xiangqi** (v0.3.1 - Complete): Fully playable Chinese Chess with AI opponent (Red or Black), 3 difficulty levels, complete rule validation
- Additional games (Blackjack, Craps) are placeholders

---

## Xiangqi (Chinese Chess) - Development Guide

### Project Goals
Mobile-first Chinese Chess game for Dad. The 9x10 board fits portrait orientation perfectly. Turn-based logic game with tunable AI difficulty.

### Architecture: "Logic vs. Juice"
Unlike Slots (80% visuals), Xiangqi is 80% logic. Three distinct concerns:

| File | Role | Responsibility |
|------|------|----------------|
| `rules.js` | The Referee | Move validation, piece movement rules, board state |
| `ai.js` | The Brain | Minimax algorithm, difficulty via search depth |
| `game.js` | The Painter | Canvas rendering, click handling, UI |

### File Structure
```
games/xiangqi/
├── index.html
├── css/
│   └── style.css      # Wood theme (#DEB887), simple layout
└── js/
    ├── rules.js       # Move validation logic
    ├── ai.js          # Minimax engine
    └── game.js        # Main loop & UI handling
```

### Tech Stack
- HTML5 Canvas + Vanilla JS (matches existing S4D conventions)
- No frameworks, no build tools
- Mobile-first, portrait orientation
- Unicode pieces (e.g., 帅, 將) or styled text circles

### AI Difficulty Levels
Difficulty is controlled by Minimax search depth, not different code:
- **Level 1 (Easy):** Depth 1 - Greedy, captures if possible
- **Level 2 (Medium):** Depth 2 - Considers opponent's response
- **Level 3 (Hard):** Depth 4 - Simulates thousands of futures

### Development Phases

**Phase 1: Board & Interaction (No Rules)**
- Draw 9x10 grid with river and palace markings
- Render pieces in starting positions
- Click to select, click to move (no validation)

**Phase 2: Move Validation**
- Implement piece-specific movement rules:
  - General (帅/將): 1 step within palace, no facing
  - Advisor (仕/士): Diagonal within palace
  - Elephant (相/象): Diagonal 2, can't cross river, blockable
  - Horse (馬): "Sun" shape (L-shape), blockable at first step
  - Chariot (車): Straight lines, any distance
  - Cannon (炮): Straight lines, must jump exactly one piece to capture
  - Soldier (兵/卒): Forward only, sideways after crossing river

**Phase 3: AI Integration**
- Implement Minimax with alpha-beta pruning
- Board evaluation function (material + position)
- Difficulty selector in UI

### Current Implementation Status

**Phase 1: Complete ✓**

The foundation is fully implemented in `games/xiangqi/js/game.js`:

**Game Engine:** `XiangqiGame` class
- **Board Initialization** (lines 43-79): Sets up 9x10 board array with all 32 pieces in starting positions
  - Red pieces: 帥 (General), 仕 (Advisor), 相 (Elephant), 馬 (Horse), 車 (Chariot), 炮 (Cannon), 兵 (Soldier)
  - Black pieces: 將 (General), 士 (Advisor), 象 (Elephant), 馬 (Horse), 車 (Chariot), 炮 (Cannon), 卒 (Soldier)
  - Each piece stores: type, player, and Unicode character

**Board Rendering** (lines 88-177):
- **Grid Drawing** (lines 88-134): Intersection-based 9x10 grid with proper line connections
- **River Zone** (lines 136-156): Visual distinction between rows 4-5 with "楚河漢界" text overlay
- **Palace Markings** (lines 158-177): Diagonal X patterns in both 3x3 palace zones (rows 0-2 and 7-9, columns 3-5)

**Piece Rendering** (lines 179-217):
- Circular pieces with player-specific styling (red: #FFE4E1 background, black: #F0F0F0)
- Unicode characters centered in circles
- Selection highlight system with golden glow effect (shadowBlur: 15, color: #FFD700)

**Interaction System** (lines 258-305):
- Click detection with canvas coordinate mapping (accounts for canvas scaling)
- Two-click movement with rule validation
- Player can only select their own pieces (line 260)
- Clicking another own piece switches selection (lines 274-277)
- Invalid moves trigger red flash feedback (lines 300-302, 321-332)
- Selected piece highlighted with golden border and shadow
- Turn tracking system alternates between red and black players

**UI Elements:**
- Turn display updates after each move (games/xiangqi/index.html:21)
- Reset button restores initial board state (games/xiangqi/js/game.js:313-319)
- Mobile-first canvas with wood theme (#DEB887 background)

---

**Phase 2: Complete ✓**

Move validation system fully implemented in `games/xiangqi/js/rules.js`:

**Rules Engine:** `XiangqiRules` object (module pattern)
- **Main Validator** (lines 9-71): `isValidMove()` - Master validation function
  - Bounds checking
  - Player turn enforcement
  - Friendly fire prevention
  - Delegates to piece-specific validators
  - Flying General rule enforcement

**Piece-Specific Movement Rules:**
- **General** (lines 77-89): 1-step orthogonal within palace, no facing opponent general
- **Advisor** (lines 94-105): 1-step diagonal within palace
- **Elephant** (lines 110-133): 2-step diagonal, cannot cross river, blockable at midpoint ("elephant eye")
- **Horse** (lines 139-162): L-shape movement (1 orthogonal + 1 diagonal), blockable at first step ("hobbling")
- **Chariot** (lines 168-176): Any distance orthogonally, path must be clear
- **Cannon** (lines 181-194): Moves like chariot, must jump exactly 1 piece to capture
- **Soldier** (lines 199-221): Forward only before river, can move sideways after crossing

**Special Rules:**
- **Flying General Rule** (lines 227-265): Prevents generals from facing each other on same column with no pieces between
  - Creates temporary board state to test move
  - Scans for both generals after hypothetical move
  - Checks for clear line of sight between them
- **Palace Bounds** (lines 270-280): Helper to validate general/advisor stay in 3x3 palace
- **Path Clearance** (lines 285-308): Helper for chariot movement validation
- **Piece Counting** (lines 313-338): Helper for cannon jump validation

**Integration with Game Engine:**
- `games/xiangqi/index.html` loads rules.js before game.js (line 26)
- `game.js` calls `XiangqiRules.isValidMove()` before executing moves (lines 280-287)
- Invalid moves keep selection active and flash red (line 302)
- Valid moves execute, clear selection, toggle turn (lines 289-299)

---

**Phase 3: Complete ✓**

AI opponent system fully implemented in `games/xiangqi/js/ai.js`:

**AI Engine:** `XiangqiAI` object (269 lines)
- **Minimax Algorithm** (lines 118-149): Recursive game tree search with alpha-beta pruning
  - Negamax variant for cleaner code
  - Alpha-beta pruning reduces search space by ~50-90%
  - Depth-limited search based on difficulty level
  - Returns best move as `{from: {row, col}, to: {row, col}}`

- **Board Evaluation** (lines 154-181): Heuristic position scoring
  - Material counting: General (10000), Chariot (90), Cannon (45), Horse (40), Advisor/Elephant (20), Soldier (10)
  - Positional bonus tables for Soldier, Horse, Chariot, Cannon (lines 11-64)
  - Tables encourage forward progression and center control
  - Black's positions mirrored from Red's perspective

- **Move Generation** (lines 186-204): Legal move enumeration
  - Scans entire board for player's pieces
  - Tests all 90 destination squares per piece
  - Uses `XiangqiRules.isValidMove()` for legality
  - Returns array of all valid moves

- **Difficulty Levels** (lines 262-269):
  - Level 1 (Easy): Depth 1 - Greedy, only looks at immediate captures
  - Level 2 (Medium): Depth 2 - Thinks 1 move ahead, considers opponent response
  - Level 3 (Hard): Depth 4 - Thinks 2 moves ahead, evaluates ~10,000-50,000 positions

**Game Integration** (`game.js` updates):
- AI state tracking: `gameMode` ('pvp' or 'ai'), `aiColor` ('red' or 'black'), `aiDifficulty` (1-3), `isAiThinking` (lines 26-30)
- Mode selector event handler (lines 37-39, 367-380)
- AI color selector event handler (lines 41-46) - resets game on change
- AI difficulty dropdown handler (lines 48-50)
- Automatic AI move trigger after human move (lines 329-332)
- AI thinking delay (500ms) for visual feedback (lines 382-407)
- Click blocking during AI's turn (lines 279-282) - works for any AI color

**UI Enhancements:**
- Game mode toggle: Player vs Player / vs AI (index.html:21-30)
- AI color selector: Choose Red or Black for AI (index.html:33-39, default: Red)
- AI difficulty selector with 3 levels (index.html:41-48)
- "AI is thinking..." status display (game.js:388)
- Styled controls with hover effects (style.css:140-180)
- Auto-reset when changing AI color to prevent confusion

**All Development Phases Complete:**
- ✓ Phase 1: Board rendering and interaction
- ✓ Phase 2: Complete rule validation
- ✓ Phase 3: AI opponent with difficulty levels

---

### Version History

**v0.3.1 - AI Color Selection** (2026-01-08)
- Added AI color selector: Choose whether AI plays Red or Black
- Default changed: AI now plays Red (player is Black) instead of AI playing Black
- AI automatically makes first move when playing as Red (with 100ms delay for UI readiness)
- Updated all game logic to support AI as either color:
  - handleClick() blocks interaction during AI's turn (any color)
  - makeAIMove() dynamically checks AI color
  - handleModeChange() triggers AI move if it's AI's turn on mode switch (100ms delay)
  - resetGame() triggers AI move if AI plays Red (ensures first move on reset/color change)
- Auto-reset when changing AI color to prevent mid-game confusion
- UI shows clear labels: "Red (You are Black)" / "Black (You are Red)"
- Updated game.js (413 lines): Added aiColor state, event handlers, dynamic turn checking
- Updated index.html: Added AI color dropdown selector
- Updated style.css: Styled .aiSetting containers for clean layout
- Bug fix: AI now correctly makes first move when playing as Red

**v0.3.0 - Phase 3: AI Opponent** (2026-01-08)
- Created `games/xiangqi/js/ai.js` (269 lines) - Complete AI engine
- Implemented Minimax algorithm with alpha-beta pruning
- Board evaluation function with material + positional scoring
- Positional bonus tables for strategic piece placement
- Three difficulty levels via search depth (1, 2, 4)
- Move generation scans all legal moves for AI player
- Integrated AI into game.js with automatic move triggering
- Added game mode toggle: Player vs Player / vs AI
- Added AI difficulty selector dropdown (Easy/Medium/Hard)
- AI thinking delay (500ms) for better UX
- Click blocking during AI's turn
- Updated turn display to show "AI is thinking..."
- Added Xiangqi to main casino index (index.html)
- Game is now complete and fully playable solo or 2-player

**v0.2.0 - Phase 2: Move Validation** (2026-01-08)
- Created `games/xiangqi/js/rules.js` (338 lines) - Complete rules engine
- Implemented all 7 piece movement types with special rules:
  - General: Palace bounds + Flying General rule (no facing opponent)
  - Advisor: Diagonal palace movement
  - Elephant: 2-step diagonal with blocking check, river restriction
  - Horse: L-shape with hobbling check
  - Chariot: Orthogonal with path clearance
  - Cannon: Jump-to-capture mechanic
  - Soldier: Forward movement + post-river lateral movement
- Integrated validation into `game.js` handleClick method (lines 280-287)
- Added player turn enforcement (only select own pieces)
- Added piece selection switching (click different piece to switch)
- Added invalid move visual feedback (red flash overlay)
- Game is now fully playable as 2-player local game
- All traditional Xiangqi rules enforced

**v0.1.0 - Phase 1: Board & Interaction** (2026-01-08)
- Created initial file structure: `games/xiangqi/` with HTML, CSS, JS
- Implemented `XiangqiGame` class in `game.js` (337 lines)
- Board rendering: 9x10 grid, river zone, palace X-markings
- All 32 pieces in correct starting positions with Unicode characters
- Canvas-based rendering with wood theme (#DEB887)
- Two-click selection and movement system (no validation)
- Turn tracking and UI controls (turn display, reset button)

### Key Rules Reference
- Red moves first
- Generals cannot "see" each other (no pieces between on same file)
- Stalemate = loss (unlike Western chess)
- Perpetual check = loss for checking side

---

## Development Commands

### Running the Application

**Main Casino Hub:**
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

---

## Architecture

### Slots Game Architecture

**Core Engine:** `js/slots.js` - The main game engine (SlotMachine class)
- **Scale Manager** (lines 101-152): Handles responsive scaling and canvas resizing. Uses a fixed reference resolution (480x850) and scales the entire `#gameScaler` div to fit viewport while maintaining aspect ratio.
- **Game State**: Manages balance, bet, theme, spin animation, and bonus modes
- **Bonus Systems**: Free spins, expanding wilds, cascading wins with multipliers
- **Persistence**: Uses localStorage to save balance, bet amount, and selected theme

**Theme System:** `js/themes.js` - Configuration file defining all 20 themes
- Each theme contains 8 symbols (6 paying symbols + 1 wild + 1 scatter)
- Symbols have: id, name (emoji), value, weight (RNG frequency), color, and flags (isWild, isScatter)
- Themes include paylineColor for win line styling and bgMusic path

**Audio Engine:** `js/slots_audio.js` - Web Audio API-based sound system
- Synthesizes slot machine sounds (clicks, spins, wins)
- Handles background music loading per theme
- Respects browser autoplay policies

**Rendering Pipeline (Critical):**
The game uses a layered rendering approach in `drawGameFrame()` to ensure win lines appear correctly:
1. **Layer 1**: Symbol card backgrounds (dark/glowing based on win state)
2. **Layer 2**: Win lines with animated left-to-right progress, multi-layer glow effects
3. **Layer 3**: Symbol text/emoji with scaling animations
4. **Layer 4**: Particles (Particle and SparkleParticle classes)

This order is critical - win lines drawn over backgrounds but under text prevents visual clipping issues.

**Payline System:**
- 20 predefined payline patterns defined in `evaluateWins()` (lines 342-350)
- Patterns include straight lines, V-shapes, diagonals, and zigzags
- Win evaluation uses checkMatch() which handles wild substitution

**Dad Mode:**
- Adjustable win chance system (`dadModeWinChance` defaults to 50%)
- Influences symbol selection in `getRandomSymbol()` to favor high-value symbols

### Sprunki Mixer Architecture

**Configuration-Driven:** `games/sprunki/config.json`
- Defines packs (asset libraries), categories (beats/effects/melodies/vocals), characters, and stage settings
- Each pack has a `base_path` for asset resolution
- Characters can reference assets from other packs using relative paths (e.g., `../phase1/audio/b01.wav`)

**Single-File Application:** `games/sprunki/index.html`
- All HTML, CSS, and JavaScript in one file
- Uses Web Audio API for synchronized audio playback
- Drag-and-drop interface for adding characters to stage slots

**Asset Organization:**
```
assets/
  packs/
    phase1/
      audio/    # WAV files for each character
      img/      # SVG files for character visuals
    unoreverse/ # Example of asset reuse via relative paths
```

### Xiangqi Architecture

**Current State:** v0.3.1 - All phases complete - Fully playable with AI opponent (selectable color)

**Three-Layer Architecture ("Logic vs. Juice"):**

1. **rules.js - The Referee** (338 lines)
   - Pure logic module, no UI dependencies
   - Exports `XiangqiRules` object with validation methods
   - Stateless - all functions take board state as parameters
   - Returns boolean validation results
   - Handles all piece movement rules and special cases (Flying General, elephant blocking, horse hobbling)

2. **game.js - The Painter** (413 lines)
   - Manages game state (board array, current player, selection, AI mode)
   - Renders everything to canvas
   - Handles user input (click detection, coordinate mapping)
   - Calls rules.js for validation before executing moves
   - Calls ai.js for opponent moves when in AI mode
   - Provides visual feedback (selection glow, invalid move flash, AI thinking status)

3. **ai.js - The Brain** (269 lines) ✓
   - Implements Minimax algorithm with alpha-beta pruning
   - Uses rules.js to validate candidate moves
   - Exports `getBestMove(board, player, difficulty)` function
   - Board evaluation with material + positional scoring
   - Three difficulty levels via search depth (1, 2, 4)

**Core Game Engine:** `games/xiangqi/js/game.js` - XiangqiGame class
- Board represented as 10x9 array (rows x columns)
- Intersection-based coordinate system (pieces sit on line intersections, not in squares)
- Canvas rendering with fixed cell size (45px) and margins (30px)
- No responsive scaling yet (unlike Slots) - fixed canvas dimensions

**Board State:**
- Each cell contains either `null` or a piece object: `{type, player, char}`
- Piece types: 'general', 'advisor', 'elephant', 'horse', 'chariot', 'cannon', 'soldier'
- Players: 'red' (moves first) or 'black'
- Unicode characters for display (e.g., 帥/將, 車, 馬, etc.)

**Rendering Pipeline:**
1. Clear canvas and draw wood background (#DEB887)
2. Draw grid lines (9 vertical, 10 horizontal)
3. Draw river zone decoration (rows 4-5)
4. Draw palace X-markings (both palaces)
5. Draw all pieces with selection highlighting

**Click Handling & Validation:**
- Converts screen coordinates to board grid coordinates using rounding
- Maintains `selectedPiece` state object: `{row, col}`
- Two-click system: select piece → validate move → execute or reject
- Validation flow: game.js → rules.js → return boolean → game.js executes
- Invalid moves flash red overlay (150ms) and keep piece selected
- Valid moves update board, toggle turn, clear selection

**Data Flow:**
```
User Click → game.js (handleClick)
           → rules.js (isValidMove)
           → piece-specific validator
           → Flying General check
           → Boolean result
           → game.js (execute or flash)

### Key File Relationships

- `games/slots.html` loads `js/slots.js` (engine) + `js/themes.js` (data) + `js/slots_audio.js` (sound)
- `js/slots.js` references `THEME_LIBRARY` global from themes.js
- Themes reference background music files in `music/` directory
- `audio/` directory contains unused legacy files (not loaded by current code)
- `games/xiangqi/index.html` loads `js/rules.js` → `js/ai.js` → `js/game.js` (in order)
- `game.js` references global `XiangqiRules` object for move validation
- `game.js` references global `XiangqiAI` object for AI opponent moves
- `ai.js` calls `XiangqiRules.isValidMove()` during move generation
- Data flow: User → game.js → rules.js (validate) → game.js (execute) → ai.js (calculate) → game.js (execute AI move)

---

## Common Development Tasks

### Adding a New Slot Theme

1. Add theme entry to `THEME_LIBRARY` in `js/themes.js`:
```javascript
'mytheme': {
    name: 'My Theme Name',
    paylineColor: '#ff0000',
    bgMusic: '../music/mytheme.mp3', // Optional
    symbols: [
        { id: '1', name: '🎨', value: 5, weight: 100, color: '#color1' },
        // ... 5 more paying symbols (ids 2-6)
        { id: 'W', name: '⭐', value: 200, weight: 15, color: '#colorW', isWild: true },
        { id: 'S', name: '💎', value: 0, weight: 10, color: '#colorS', isScatter: true }
    ]
}
```

2. Theme will automatically appear in the dropdown selector

### Adding a New Sprunki Pack

1. Edit `games/sprunki/config.json`:
   - Add pack definition to `packs` array
   - Add character definitions to `characters` array with `pack_id` matching new pack
   - Characters can reuse assets from other packs using relative paths

2. Place audio files (WAV) and images (SVG) in `assets/packs/yourpack/`

3. Pack will appear in the pack selector dropdown

### Modifying Win Animations

Win line animations are in `slots.js` lines 598-775. The system draws:
- Full line background (subtle, 20% opacity)
- Animated left-to-right portion with 4 layers:
  - Outer glow (pulsing)
  - Main line (bright, with shadow)
  - Center highlight (white)
  - Rainbow shimmer trail (animated dash pattern)
- Glowing endpoint indicator
- Sparkle particles along the line

### Adjusting Game Balance

**Win Frequency:**
- Modify `GAME_CONFIG.math.baseWinChance` (default: 50)
- Or adjust individual symbol weights in themes.js

**Payouts:**
- Modify symbol `value` properties in themes.js
- Win calculation: `symbol.value * matchCount * (currentBet * 0.1)`
- Free spins multiply wins by `freeSpinsMultiplier` (2x/3x/5x)
- Cascades add progressive multiplier

**Economy:**
- `GAME_CONFIG.economy` sets starting balance, min/max bet, bet increment

---

## Important Implementation Notes

### Mobile Scaling (Critical)

The slots game uses a **fixed design resolution** (480x850) and scales the entire game container:
- `#gameScaler` div is scaled via CSS transform in `autoResize()` method
- Canvas is separately resized with device pixel ratio support for retina displays
- Scaling is aggressive in landscape mode (0.9x vs 0.95x in portrait)
- Touch feedback system prevents pull-to-refresh and adds haptic vibration

**Do not** modify canvas dimensions directly. Always work with the display size calculated from container dimensions.

### CORS Restrictions

The Sprunki mixer **must** be served via HTTP server, not file:// protocol. Audio and image loading will fail otherwise.

### Win Line Rendering Bug

Historical issue (resolved in v1.0): Win lines must be drawn **after** symbol backgrounds but **before or after** symbol text. The current implementation draws backgrounds → win lines → text. Do not use `globalCompositeOperation = 'lighter'` as it causes visibility issues with white emoji backgrounds.

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

**Canvas Coordinate Mapping:**
```javascript
// Screen to board conversion (game.js:231-232)
const col = Math.round((clickX - margin) / cellSize);
const row = Math.round((clickY - margin) / cellSize);

// Board to screen conversion (game.js:200)
const x = margin + col * cellSize;
const y = margin + row * cellSize;
```

This is different from Slots which uses a continuous coordinate system. Always work with grid intersections in Xiangqi.

---

## Code Style Conventions

- ES6 class syntax for game engines
- Canvas rendering uses explicit save/restore for transform states
- Animations use requestAnimationFrame loops
- Audio respects browser autoplay policies (requires user gesture)
- No external dependencies (vanilla JS, Web Audio API, Canvas 2D)


---

## Letter Tracing Game - Development Guide

### Project Goals
Educational letter tracing app for a 4-year-old. Help learn uppercase and lowercase letters through guided tracing with positive reinforcement.

### Target User
Young child (pre-K) - UI must be simple, colorful, touch-friendly, and forgiving.

### Architecture

| Component | Description |
|-----------|-------------|
| Letter Selector | A-Z displayed as tappable buttons (upper + lower pairs), 2-3 rows |
| Tracing Canvas | 3-line writing guide (solid-dotted-solid) like handwriting paper |
| Trace Validator | Tracks finger/mouse path, compares to letter outline |
| Reward System | Positive reinforcement animation on completion |

### File Structure
```
games/lettertracing/
├── index.html
├── css/
│   └── style.css      # Bright, kid-friendly colors
└── js/
    ├── letters.js     # Letter path data (SVG paths or point arrays)
    └── game.js        # Main loop, touch tracking, validation
```

### Core Features

**Letter Selector:**
- Grid of A-Z buttons showing "Aa", "Bb", etc.
- Large touch targets (min 48px, preferably bigger for small fingers)
- Visual feedback on tap (bounce/glow)
- Pressing any letter resets the tracing canvas

**3-Line Writing Guide:**
- Top solid line (cap height)
- Middle dotted line (x-height for lowercase)
- Bottom solid line (baseline)
- Letter outline appears as gray/light guide when selected

**Tracing System:**
- Touch/mouse tracking on canvas
- Draw user's stroke in a bright color (crayon-style?)
- Tolerance for imperfect tracing (kids won't be precise)
- Detect "close enough" completion

**Completion Reward:**
- Celebratory animation (stars, confetti, character cheering)
- Audio praise ("Great job!", "You did it!")
- Option to try again or pick new letter

### Development Phases

**Phase 1: Layout & Letter Selection**
- Build responsive layout (selector + canvas areas)
- Create A-Z button grid with Aa/Bb pairs
- Tapping a letter logs to console (no tracing yet)

**Phase 2: 3-Line Canvas & Letter Outlines**
- Draw the 3-line writing guide
- Create letter outline data (start with A, B, C)
- Display selected letter as traceable outline

**Phase 3: Touch Tracking**
- Capture touch/mouse events on canvas
- Draw strokes following finger
- Basic "did they trace it?" detection

**Phase 4: Polish & Rewards**
- Completion detection with tolerance
- Celebration animations
- Sound effects (optional, respect autoplay)
- Expand to full A-Z letter set

### Technical Considerations
- **Touch events**: Use pointer events for unified mouse/touch handling
- **Letter paths**: Could use SVG path data or simplified point arrays
- **Tolerance**: Compare user stroke to target path with distance threshold
- **Mobile-first**: Portrait orientation, large touch targets
```

---

Want me to generate the full updated `CLAUDE.md` file with this merged in, or are you good to copy/paste this section yourself?

Then your CLI prompt would be:
```
Start Letter Tracing Phase 1: Create games/lettertracing/ folder and build 
the layout with A-Z letter selector grid (showing Aa, Bb, etc.) and a 
placeholder canvas area below. Large colorful buttons, mobile-friendly. 
Tapping a letter logs to console for now.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fong Family Arcade** (formerly Dad's Casino) is a browser-based game collection for the whole family:
- **Letter Tracing** (v1.0): Educational app with 5 guidance modes, particle rewards, and rigorous stroke validation.
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system.
- **Xiangqi** (v0.3.1): Fully playable Chinese Chess with AI opponent.

---

From Google's Gemini -- Update and merge please

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Fong Family Arcade** (formerly Dad's Casino) is a browser-based game collection for the whole family:
- **Letter Tracing** (v5.1): Educational app with A-B-C audio architecture, voice speed control, and rigorous stroke validation.
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics.
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system.
- **Xiangqi** (v0.3.1): Fully playable Chinese Chess with AI opponent.

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