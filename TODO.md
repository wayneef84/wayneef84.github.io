# Founding & Forging - TODO List

**Last Updated:** 2026-01-20

---

## High Priority Features

### 1. URL Parameters for Direct Navigation (Letters & Words)
**Status:** Not Started
**Games Affected:** Letter Tracing, Words

**Description:**
Add URL parameter support so users can link directly to specific packs, letters, or words.

**Requirements:**
- **Letter Tracing Game:**
  - Support `?pack=<pack_id>&letter=<letter>` parameters
  - Example: `index.html?pack=lowercase&letter=e` loads lowercase 'e' directly
  - Valid pack IDs: `uppercase`, `lowercase`, `numbers`, `shapes`

- **Words Game:**
  - Support `?word=<word>` parameter
  - Example: `words.html?word=Kenzie` loads "Kenzie" directly

- **Both Games:**
  - Update browser history when user selects pack/letter/word
  - Use `history.pushState()` to update URL without page reload
  - Support browser back/forward buttons
  - Handle invalid parameters gracefully (show error message or default view)

**Technical Implementation:**
```javascript
// Parse URL parameters on page load
const params = new URLSearchParams(window.location.search);
const pack = params.get('pack');
const letter = params.get('letter');

// Update URL when user makes selection
function updateURL(pack, letter) {
    const url = new URL(window.location);
    url.searchParams.set('pack', pack);
    url.searchParams.set('letter', letter);
    history.pushState({}, '', url);
}
```

**Benefits:**
- Users can bookmark specific letters/words
- Teachers can share direct links to specific exercises
- Better browser history navigation

---

### 2. Custom Word Images - Enhanced Add Word Modal
**Status:** Not Started
**Game Affected:** Words

**Description:**
Allow users to select custom images when adding new words to the Words game.

**Requirements:**
- **Three image selection methods:**
  1. **Emoji Picker** - Show grid of common emojis to select from
  2. **Image URL** - Input URL for remote image (with resizing/cropping)
  3. **No Image** - Option to skip image (shows default ✨ sparkle)

- **Future (later priority):**
  - **Image Folder** - Browse images from designated folder (requires file system access)

**UI Design:**
```
┌─────────────────────────────────────┐
│  Add New Word                       │
├─────────────────────────────────────┤
│  Word: [Grandma____________]        │
│                                     │
│  Image (optional):                  │
│  ○ Emoji Picker                     │
│  ○ Image URL                        │
│  ○ No Image                         │
│                                     │
│  [Emoji Grid if selected]           │
│  [URL input if selected]            │
│                                     │
│  [Cancel]  [Save]                   │
└─────────────────────────────────────┘
```

**Emoji Picker Implementation:**
- Display 6x6 grid of common emojis (people, animals, objects, etc.)
- Organized by category: Family (👨👩👧👦), Animals (🐕🐱🦒), Objects (⭐❤️🎂)
- Selected emoji shows preview above grid
- Store emoji character in localStorage with word

**Image URL Implementation:**
- Input field for image URL
- Live preview of image (with loading state)
- Image resizing: Automatically crop/resize to standard dimensions (e.g., 400x400px)
- Use CSS `object-fit: cover` and `border-radius: 12px`
- Validate URL returns valid image
- Store URL in localStorage with word

**Data Structure:**
```javascript
// Custom words stored in localStorage
customWords = [
    {
        word: "Grandma",
        imageType: "emoji",
        imageData: "👵"
    },
    {
        word: "Bicycle",
        imageType: "url",
        imageData: "https://example.com/bike.jpg"
    },
    {
        word: "Happy",
        imageType: "none",
        imageData: null
    }
]
```

**Technical Notes:**
- Update `getEmojiForWord()` to check custom word data first
- Update `updateImageDisplay()` to handle URL images
- Add image loading error handling (fallback to ✨ if URL fails)
- Consider image caching for performance

---

## Medium Priority Features

### 3. Theme System
**Status:** Not Started
**Games Affected:** All games

**Description:**
Create customizable themes with backgrounds, templates, and dot styles.

**Components:**

#### A. Background Customization
- Solid colors (color picker)
- Gradient backgrounds (2-color gradients)
- Image backgrounds (tiled or stretched)
- Animated backgrounds (stars, particles, etc.)

#### B. Canvas Templates
- Default template (current layout)
- Custom positioned HTML templates
- Store templates in `/themes/templates/` folder
- Each template is a standalone HTML structure
- Templates define positions of: canvas, progress bar, controls, image area

#### C. Dot/Particle Customization
- **Current:** Colored circles for particles (celebration effect)
- **Proposed:** Custom images for dots/particles
- Options: Stars ⭐, Hearts ❤️, Emojis 🎉, Custom images
- Particle size, color, animation speed settings
- Apply to: Win celebration particles, ghost guide dots

**Theme File Structure:**
```
/themes
  /backgrounds
    - starry-night.jpg
    - ocean-waves.jpg
  /templates
    - default.html
    - compact.html
    - full-screen.html
  /particles
    - star.png
    - heart.png
    - sparkle.png
```

**Theme Configuration Object:**
```javascript
theme = {
    name: "Starry Night",
    background: {
        type: "image",
        src: "themes/backgrounds/starry-night.jpg",
        style: "cover"
    },
    template: "default",
    particles: {
        image: "themes/particles/star.png",
        size: 20,
        count: 50,
        colors: ["#FFD700", "#FFA500"]
    },
    colors: {
        primary: "#4a90e2",
        accent: "#FFD700"
    }
}
```

**Implementation Priority:**
1. Background colors/images (easiest)
2. Particle customization (moderate)
3. Template system (complex - requires layout engine)

**UI for Theme Selection:**
- Settings panel with theme dropdown
- Preview thumbnail for each theme
- Save/load custom themes
- Export/import theme files (JSON)

---

## Card Games Priority

### TODO: Add Rules Editing in Rules Modal
**Status:** Not Started
**Games Affected:** Blackjack, War

**Description:**
Currently the Rules modal (📖) shows current settings but doesn't allow changing them. Add the ability to edit game rules directly from the Rules modal instead of only in Settings.

**Requirements:**
- Add inline edit controls to Rules modal
- Changes apply immediately (or on close)
- Sync with Settings modal values

---

### TODO: Words - Cursive Mode
**Status:** Not Started
**Game:** Words (new feature)

**Description:**
Add a Cursive Mode to the Words game that teaches cursive letter formation. Consider creating a new game grouping called "ABCs" that contains:
- Letter Tracing (existing - print letters)
- Words (existing - word tracing)
- Cursive Mode (new - cursive letter formation)

**Requirements:**
- Cursive letter geometry data (different strokes than print)
- Possibly new stroke types (connected letters, loops)
- Toggle between print and cursive modes
- Consider separate game or mode within Words

---

## Low Priority / Future Ideas

### 4. Multiplayer Support (SQL Backend)
- Real-time word tracing with multiple players
- Leaderboards and scoring system
- Requires backend database and WebSocket connections

### 5. Progressive Difficulty
- Adaptive guidance mode that automatically adjusts based on performance
- Unlock harder letters/words as user progresses

### 6. Custom Letter Packs
- Allow users to create custom letter packs
- Import/export pack files
- Share packs with other users

### 7. Audio Enhancements
- Record custom audio for letters/words
- Multiple voice options (child, adult, robotic)
- Background music options

### 8. Achievement System
- Badges for completing packs
- Streak tracking (consecutive days)
- Share achievements on social media

---

## Completed Features

### ✅ Word Mode Removal from Letter Tracing (2026-01-20)
- Removed Word Mode UI, logic, and CSS from Letter Tracing game
- Moved image display functionality to Words game
- Cleaned up PACK_WORDS from shared letters-data.js

### ✅ Image Display in Words Game (2026-01-20)
- Added emoji icons for words (👧👨👩🐕🐱❤️ etc.)
- Image area above canvas with fallback emojis
- Emoji mapping for common words

### ✅ Letter Geometry Fixes (2026-01-18 - 2026-01-20)
- Fixed 26+ letters across 6 rounds of revisions
- Lowercase 'e' arc symmetry and opening gap
- Heart shape arc direction
- Removed non-functional "words" properties

---

## Notes

- All features should maintain ES5 compatibility (Safari support)
- Mobile-first design for all UI additions
- Test on both Letter Tracing and Words games when applicable
- Update this file as features are completed or priorities change

---

**Contributing:**
When implementing features, please:
1. Create a new branch for the feature
2. Update this TODO list with status
3. Add documentation to relevant files
4. Test on mobile and desktop
5. Commit with clear messages including Co-Authored-By line
