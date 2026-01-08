# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dad's Casino** is a browser-based casino game collection featuring multiple games:
- **Slots Game** (v3.0): A 5-reel, 4-row slot machine with 20 themes, bonus features, and Dad Mode physics
- **Sprunki Mixer**: A web-based music mixer with drag-and-drop character system
- Additional games (Blackjack, Craps) are placeholders

## Development Commands

### Running the Application

**Main Casino Hub:**
```bash
# Open index.html directly in browser
open index.html
```

**Slots Game:**
```bash
# Open games/slots.html directly in browser
open games/slots.html
```

**Sprunki Mixer:**
```bash
# IMPORTANT: Must use local server due to CORS restrictions
cd games/sprunki
python3 -m http.server 8000
# Then navigate to http://localhost:8000/index.html

# Or use the provided scripts:
./start_server.sh  # macOS/Linux
start_server.bat   # Windows
```

### Testing Changes

The slots game and main hub are static HTML/CSS/JS and can be tested by refreshing the browser. The Sprunki mixer requires a web server for audio/image loading.

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

### Key File Relationships

- `games/slots.html` loads `js/slots.js` (engine) + `js/themes.js` (data) + `js/slots_audio.js` (sound)
- `js/slots.js` references `THEME_LIBRARY` global from themes.js
- Themes reference background music files in `music/` directory
- `audio/` directory contains unused legacy files (not loaded by current code)

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

## Code Style Conventions

- ES6 class syntax for game engines
- Canvas rendering uses explicit save/restore for transform states
- Animations use requestAnimationFrame loops
- Audio respects browser autoplay policies (requires user gesture)
- No external dependencies (vanilla JS, Web Audio API, Canvas 2D)
