# Letter Tracing Game - Claude Development Guide

## Overview

**Letter Tracing** is an educational app for teaching letter formation with audio feedback. It supports uppercase/lowercase letters, numbers, and word spelling with images.

**Current Version:** 5.1
**Architecture:** A-B-C audio system with rich format data structure
**Status:** Stable - Adding **Word Mode** feature (in progress)

---

## 🎯 CURRENT PRIORITY: Word Mode Implementation

**Goal:** Add side-by-side word spelling mode where users trace each letter in sequence (e.g., K-e-n-z-i-e) with accompanying images.

### Word Mode Requirements

1. **Scrolling Progress Bar:** Show letters in a scrolling window
   - Desktop: 7 letters max visible (center at position 4)
   - Mobile: 5 letters max visible (center at position 3)
   - User-configurable via settings slider (3-9 range)

2. **Audio Behavior:**
   - Middle letters: Say letter name only ("Letter e.")
   - Last letter: Say letter + word ("Letter e. That spells Kenzie!")

3. **Image Display:**
   - Optional image above canvas (20vh height)
   - Responsive aspect ratio
   - Only shown when word has `image` property

4. **Scrolling Algorithm:**
   - Example: "BUTTERFLY" (9 letters, max 7 visible)
   ```
   Position 1: [B] u t t e r f     ← B at position 1
   Position 2: B [u] t t e r f     ← u at position 2
   Position 3: B u [t] t e r f     ← t at position 3
   Position 4: B u t [t] e r f     ← t at position 4 (LOCK)
   Position 5:  u t t [e] r f l    ← Scroll left, e stays at pos 4
   Position 6:  t t e [r] f l y    ← Continue scrolling
   Position 7:  t e r [f] l y      ← Stop scrolling (last 3 visible)
   Position 8:  t e r f [l] y      ← l at position 6
   Position 9:  t e r f l [y]      ← y at position 7 (end)
   ```

5. **Responsive Design:**
   - Desktop breakpoint: 768px
   - Mobile: Smaller window (5 letters), tighter spacing
   - User setting persists to localStorage

---

## Project Structure

```
/games/letter-tracing/
├── index.html           # Main game UI
├── css/
│   └── style.css        # Game styles
├── js/
│   └── game.js          # Core game engine (LetterGame class)
├── assets/
│   └── images/          # Word images (TODO: create this)
│       ├── kenzie.jpg
│       ├── dad.jpg
│       └── giraffe.jpg
└── CLAUDE.md            # This file

/shared/js/
└── letters-data.js      # Letter/word definitions + audio library
```

---

## Architecture

### Data Structure (letters-data.js)

**Three-Tier Audio System:**
```javascript
// Priority: Item > Pack > Global
AUDIO_LIB = {
    PREFIXES: { GENERIC, EXCITED, CALM },
    SUFFIXES: { KENZIE, GENERIC, NONE }
}

PACK_UPPERCASE = {
    id: "uppercase",
    name: "ABC Uppercase",
    audioDefaults: { A: [...], C: [...] },  // Pack-level defaults
    items: {
        "A": [...strokes],                 // Simple format
        "G": {                             // Rich format
            name: "G",
            words: ["Giraffe", "Goat", "Guitar"],
            strokes: [...],
            audioOverride: { A: [...], C: [...] }  // Item-level override
        }
    }
}
```

**Word Pack Format (NEW - To Be Implemented):**
```javascript
PACK_WORDS = {
    id: "words",
    name: "Words",
    audioDefaults: {
        A: AUDIO_LIB.PREFIXES.EXCITED,
        C: [] // No suffix for middle letters
    },
    items: {
        "Kenzie": {
            name: "Kenzie",
            letters: ["K", "e", "n", "z", "i", "e"],  // Letter sequence
            image: "assets/images/kenzie.jpg",        // Optional image path
            audioOverride: {
                C: ["Go Kenzie!", "Kenzilla!"]        // Custom completion audio
            }
        },
        "Dad": {
            name: "Dad",
            letters: ["D", "a", "d"],
            image: "assets/images/dad.jpg"
        },
        "Butterfly": {
            name: "Butterfly",
            letters: ["B", "u", "t", "t", "e", "r", "f", "l", "y"],
            image: "assets/images/butterfly.jpg"
        }
    }
}
```

**Letter Resolution Logic:**
- When user traces "K" in "Kenzie", system looks up "K" strokes from `PACK_UPPERCASE.items.K`
- Tracks progress: `currentWordIndex = 0`, `totalLetters = 6`
- On completion, advances to next letter ("e")

### Game Engine (game.js)

**Core Class: `LetterGame`**

**State Properties:**
```javascript
{
    currentPack: Object,        // Active pack (uppercase/lowercase/words)
    currentLetter: String,      // Active letter being traced
    currentWord: Object,        // (NEW) Active word being spelled
    currentLetterIndex: Number, // (NEW) Position in word (0-based)
    wordMode: Boolean,          // (NEW) True if spelling words

    strokes: Array,             // Generated points for current letter
    strokeProgress: Array,      // Completion % per stroke
    strokeDone: Array,          // Boolean completion flags

    guidanceMode: String,       // 'ghost_plus' | 'strict' | 'loose' | 'off'
    voiceRate: Number          // TTS speed (0.25 - 2.0)
}
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `selectLetter(char)` | Load letter strokes, reset progress |
| `selectWord(wordName)` | (NEW) Start word spelling mode |
| `checkWin()` | Validate completion, play audio, advance state |
| `resolveAudioList(type)` | Get audio list (priority: item > pack > global) |
| `generatePoints(instruction)` | Convert stroke definition to canvas points |

---

## Audio System

### A-B-C Architecture

**Component A (Prefix):** Congratulatory phrase
**Component B (Content):** Letter name + associated words
**Component C (Suffix):** Personalized encouragement

**Example Output:**
- Single Letter: "Awesome. G is for Giraffe, and Guitar. Go Kenzie!"
- Middle Word Letter: "Great! Letter e. Keep it up!"
- Last Word Letter: "Super! Letter e. That spells Kenzie!"

### Audio Resolution Flow

```javascript
// Priority cascade
function resolveAudioList(componentType) {
    // 1. Check item.audioOverride[componentType]
    if (item.audioOverride?.[componentType]) return item.audioOverride[componentType];

    // 2. Check pack.audioDefaults[componentType]
    if (pack.audioDefaults?.[componentType]) return pack.audioDefaults[componentType];

    // 3. Check globalAudio[componentType]
    if (globalAudio[componentType]) return globalAudio[componentType];

    return []; // Empty list = silence
}
```

### Word Mode Audio Logic (To Be Implemented)

```javascript
checkWin() {
    if (!allStrokesComplete) return;

    if (this.wordMode) {
        const isLastLetter = (this.currentLetterIndex === this.currentWord.letters.length - 1);

        if (isLastLetter) {
            // Last letter: Full message with word completion
            const prefix = this.resolveAudioList('A');
            const content = `Letter ${this.currentLetter}. That spells ${this.currentWord.name}!`;
            const suffix = this.resolveAudioList('C');
            this.speak([prefix, content, suffix]);
        } else {
            // Middle letter: Just letter name
            const prefix = this.resolveAudioList('A');
            const content = `Letter ${this.currentLetter}.`;
            this.speak([prefix, content]); // No suffix

            // Auto-advance to next letter after 1 second
            setTimeout(() => this.advanceToNextLetter(), 1000);
        }
    } else {
        // Normal mode: Existing behavior (letter + words)
        this.playStandardCompletion();
    }
}
```

---

## UI Layout

### Current Layout (Letter Mode)

```
┌─────────────────────────────────┐
│ HEADER                          │
│ [🏠] [Pack▼] [Mode▼] [⚙️]      │
├─────────────────────────────────┤
│                                 │
│ CANVAS AREA                     │
│ (Letter tracing canvas)         │
│                                 │
├─────────────────────────────────┤
│ LETTER GRID                     │
│ [A] [B] [C] [D] [E] [F] ...     │
└─────────────────────────────────┘
```

### Proposed Layout (Word Mode)

```
┌─────────────────────────────────┐
│ HEADER                          │
│ [🏠] [Pack▼] [Mode▼] [Word🔤] [⚙️]│  ← New toggle
├─────────────────────────────────┤
│ IMAGE AREA (if word has image)  │  ← NEW
│ [🦒 Giraffe photo - 20vh]       │
├─────────────────────────────────┤
│ WORD PROGRESS BAR               │  ← NEW
│ B u t [t] e r f                 │  (Scrolling window)
│ ✓ ✓ ✓  •  ○ ○ ○                 │  (Visual progress)
├─────────────────────────────────┤
│ CANVAS AREA                     │
│ (Currently tracing "t")         │
├─────────────────────────────────┤
│ WORD GRID (instead of letters)  │  ← NEW
│ [Kenzie] [Dad] [Mom] [Dog] ...  │
└─────────────────────────────────┘
```

**Progress Bar States:**
- ✅ **Green checkmark** - Completed letter
- 🔵 **Blue highlight** - Current letter (active)
- ⚪ **Gray dot** - Not started

---

## Scrolling Window Algorithm

### Configuration

```javascript
const WORD_CONFIG = {
    desktop: {
        maxVisible: 7,      // User-adjustable (3-9)
        centerPosition: 4
    },
    mobile: {
        maxVisible: 5,      // User-adjustable (3-9)
        centerPosition: 3
    },
    breakpoint: 768  // px
};
```

### Window Calculation Logic

```javascript
function getVisibleWindow(currentIndex, totalLetters, maxVisible, centerPos) {
    // Short words: Show all letters
    if (totalLetters <= maxVisible) {
        return {
            start: 0,
            end: totalLetters,
            highlightPos: currentIndex
        };
    }

    // Beginning: Letters don't scroll yet
    if (currentIndex < centerPos) {
        return {
            start: 0,
            end: maxVisible,
            highlightPos: currentIndex
        };
    }

    // End: Lock to last N letters
    const lettersRemaining = totalLetters - currentIndex;
    if (lettersRemaining <= maxVisible - centerPos) {
        return {
            start: totalLetters - maxVisible,
            end: totalLetters,
            highlightPos: maxVisible - lettersRemaining
        };
    }

    // Middle: Scroll left, keep highlight centered
    return {
        start: currentIndex - centerPos + 1,
        end: currentIndex - centerPos + 1 + maxVisible,
        highlightPos: centerPos - 1
    };
}
```

### Example Walkthrough

**Word: "BUTTERFLY" (9 letters), maxVisible=7, centerPos=4**

| Step | currentIndex | start | end | Visible Letters | Highlight Position |
|------|-------------|-------|-----|----------------|-------------------|
| 1    | 0           | 0     | 7   | B u t t e r f  | 1 (B)             |
| 2    | 1           | 0     | 7   | B u t t e r f  | 2 (u)             |
| 3    | 2           | 0     | 7   | B u t t e r f  | 3 (t)             |
| 4    | 3           | 0     | 7   | B u t t e r f  | 4 (t) LOCK        |
| 5    | 4           | 1     | 8   | u t t e r f l  | 4 (e)             |
| 6    | 5           | 2     | 9   | t t e r f l y  | 4 (r)             |
| 7    | 6           | 2     | 9   | t t e r f l y  | 5 (f)             |
| 8    | 7           | 2     | 9   | t t e r f l y  | 6 (l)             |
| 9    | 8           | 2     | 9   | t t e r f l y  | 7 (y)             |

---

## Settings UI

### Current Settings

```
┌─────────────────────────────────┐
│ SETTINGS                     [X]│
├─────────────────────────────────┤
│ Voice Speed: 0.9x               │
│ [0.25] ●───────● [2.0]          │
└─────────────────────────────────┘
```

### Proposed Settings (With Word Mode)

```
┌─────────────────────────────────┐
│ SETTINGS                     [X]│
├─────────────────────────────────┤
│ Voice Speed: 0.9x               │
│ [0.25] ●───────● [2.0]          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ WORD MODE                   │ │
│ ├─────────────────────────────┤ │
│ │ Visible Letters             │ │
│ │ [3] ●─────●─────● [9]       │ │ ← Slider
│ │   Mobile: 5  Desktop: 7     │ │ ← Live preview
│ │                             │ │
│ │ ☑ Show Images               │ │ ← Checkbox
│ │   Display pictures with     │ │
│ │   words (when available)    │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Saved to localStorage:**
```javascript
{
    voiceSpeed: 0.9,
    wordMode: {
        desktopMaxVisible: 7,
        mobileMaxVisible: 5,
        showImages: true
    }
}
```

---

## Implementation Checklist

### Phase 1: Data Structure (TODO)
- [ ] Add `PACK_WORDS` to `letters-data.js`
- [ ] Define sample words: Kenzie, Dad, Mom, Dog, Cat, Butterfly, Giraffe
- [ ] Create `assets/images/` directory
- [ ] Add placeholder images (or use emoji fallbacks)
- [ ] Test letter resolution (word "Kenzie" → uppercase "K")

### Phase 2: UI Components (TODO)
- [ ] Add Word Mode toggle button to header
- [ ] Create `WordProgressBar` component (HTML + CSS)
- [ ] Implement scrolling window logic
- [ ] Add visual states (✓ completed, • active, ○ pending)
- [ ] Create image display area (20vh, responsive)
- [ ] Build word grid (replaces letter grid in word mode)

### Phase 3: State Machine (TODO)
- [ ] Add `wordMode`, `currentWord`, `currentLetterIndex` to game state
- [ ] Implement `selectWord(wordName)` method
- [ ] Implement `advanceToNextLetter()` method
- [ ] Update `checkWin()` with word mode logic
- [ ] Handle word completion (celebrate + return to word grid)

### Phase 4: Audio System (TODO)
- [ ] Update `checkWin()` audio logic for middle vs last letter
- [ ] Test "Letter e." (middle) vs "Letter e. That spells Kenzie!" (last)
- [ ] Add custom suffix for word completion

### Phase 5: Settings (TODO)
- [ ] Add "Word Mode" section to settings panel
- [ ] Create slider for maxVisible (3-9 range)
- [ ] Add "Show Images" checkbox
- [ ] Implement localStorage persistence
- [ ] Detect screen size on resize (desktop/mobile)

### Phase 6: Testing (TODO)
- [ ] Test short word: "Dad" (3 letters) - no scrolling
- [ ] Test medium word: "Kenzie" (6 letters) - partial scrolling
- [ ] Test long word: "Butterfly" (9 letters) - full scrolling
- [ ] Test mobile layout (5 visible)
- [ ] Test desktop layout (7 visible)
- [ ] Test custom maxVisible settings (3, 4, 8, 9)
- [ ] Test with/without images
- [ ] Test audio sequencing (middle letters → last letter)

---

## Technical Notes

### Canvas Rendering
- Letter strokes are procedurally generated from JSON definitions
- Stroke types: `line`, `arc`, `complex` (multi-part)
- Guidance modes:
  - `ghost_plus` (👻): Semi-transparent guide + dots
  - `strict` (🟢): Strict path validation
  - `loose` (🎨): Relaxed validation
  - `off` (❌): No guides

### Stroke Validation
- Each stroke has array of `{x, y}` points
- User input tracked via `touchmove`/`mousemove`
- Progress calculated by proximity to stroke points
- Particle effects celebrate stroke completion

### Responsive Design
- Canvas resizes to fit viewport (maintains aspect ratio)
- Touch-optimized (no pinch-zoom: `user-scalable=no`)
- Fixed header + scrollable grid (mobile-friendly)

---

## Known Issues & Future Work

### Current Issues
- None critical (v5.1 is stable)

### Future Enhancements
1. **Word Mode** (in progress) - This document
2. **Multi-word sentences** - "I love you" (3 words in sequence)
3. **Custom word builder** - Parents create personalized words
4. **Handwriting analysis** - Track stroke accuracy over time
5. **Multiplayer** - Race to spell words
6. **Themes** - Seasonal letter packs (Halloween, Christmas)

---

## For Claude Agents

### Working on Letter Tracing Tasks
1. **Always read this file first** to understand context
2. **Check `/shared/js/letters-data.js`** for data structure
3. **Test on mobile** - This is a touch-first app
4. **Audio is critical** - Test with volume on
5. **Follow A-B-C architecture** - Don't break audio system

### Common Pitfalls
- ❌ Don't hardcode letter strokes in game.js (use letters-data.js)
- ❌ Don't break audio priority cascade (item > pack > global)
- ❌ Don't assume desktop-only (test mobile layout)
- ❌ Don't skip TTS testing (use Web Speech API)

### Testing Checklist
```bash
# Quick test sequence
1. Open index.html in browser
2. Select "ABC Uppercase" pack
3. Trace letter "G" (has words)
4. Listen for "G is for Giraffe, and Guitar"
5. Switch to "abc Lowercase" pack
6. Trace letter "a" (different audio style)
7. Change voice speed to 0.5x (slower)
8. Switch guidance mode to "Strict"
```

---

## Context for Cloud Repos

**Question from User:**
> "I was trying to do some efficiencies by making new chats when updating different sections to save on context, how do I do that with the cloud repository enabled?"

**Answer:**
Since this project uses cloud repos (git worktrees), here's how to manage context efficiently:

1. **Use this file (`CLAUDE.md`)** for feature-specific context
2. **Root `/CLAUDE.md`** stays focused on card games (per project architecture)
3. **Branch per feature** - Create git branches for isolated work:
   ```bash
   git checkout -b feature/word-mode
   ```
4. **Commit incrementally** - Each phase gets its own commit:
   ```bash
   git commit -m "feat(letters): Add word data structure"
   git commit -m "feat(letters): Implement scrolling progress bar"
   ```
5. **New chat = read this file first** - Each new Claude session should start by reading `games/letter-tracing/CLAUDE.md`

### Multi-Agent Pattern
If you spawn specialized agents:
- **Explore agent**: "Find all audio-related code in letter-tracing"
- **Plan agent**: "Design the scrolling window algorithm"
- **Implementation agent** (you): Execute with full context from this file

---

## Version History

- **v5.1** (Current): A-B-C audio system, rich format support
- **v5.0**: Multi-pack architecture, settings panel
- **v4.0**: Guidance modes, ghost rendering
- **v3.0**: Particle effects, stroke validation
- **v2.0**: Touch support, mobile layout
- **v1.0**: Initial uppercase letter tracing

---

**Last Updated:** 2026-01-18
**Maintained By:** Claude Code (via user Wayne)
