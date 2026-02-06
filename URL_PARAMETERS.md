# URL Parameter Documentation

**Last Updated:** 2026-01-20

This document describes the URL parameter system for direct navigation to specific letters and words in the Founding & Forging games.

---

## Overview

Both Letter Tracing and Words games support URL parameters for:
- Deep linking to specific content
- Bookmarking exercises
- Sharing specific letters/words with students
- Browser history navigation (back/forward buttons)

---

## Letter Tracing Game

### Base URL
```
games/letter-tracing/index.html
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pack` | string | Yes | Pack ID: `uppercase`, `lowercase`, `numbers`, `shapes`, or `custom` |
| `letter` | string | Yes | The letter/number/shape character to display |

### Examples

**Specific pack + letter:**
```
index.html?pack=lowercase&letter=e
index.html?pack=uppercase&letter=G
index.html?pack=numbers&letter=5
index.html?pack=shapes&letter=❤️
```

**Custom mode (auto-finds pack):**
```
index.html?pack=custom&letter=A
index.html?pack=custom&letter=5
```

When `pack=custom`, the game searches all packs to find the specified letter automatically.

### Behavior

- ✅ Loads specified pack
- ✅ Selects specified letter
- ✅ Updates URL when user changes pack/letter
- ✅ Supports browser back/forward buttons
- ⚠️ If pack or letter not found, loads default (first pack, first letter)
- ⚠️ Emojis in URLs are auto-encoded (e.g., ❤️ becomes `%E2%9D%A4%EF%B8%8F`)

---

## Words Game

### Base URL
```
games/words/words.html
```

### URL Parameters

#### Mode 1: Predefined Word

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `word` | string | Yes | Word from default or custom word lists |

**Examples:**
```
words.html?word=Kenzie
words.html?word=Mom
words.html?word=Dog
```

**Behavior:**
- ✅ Looks up word in default words or custom words (saved in localStorage)
- ✅ Shows word selector dropdown with all available words
- ✅ User can switch between words using dropdown
- ⚠️ If word not found, returns to menu

---

#### Mode 2: Custom Word (Ad-hoc)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Must be `custom` |
| `word` | string | Yes | Any word to trace (not in word list) |
| `emoji` | string | No | Optional emoji to display as image |

**Examples:**
```
words.html?id=custom&word=Grandma
words.html?id=custom&word=Elephant&emoji=🐘
words.html?id=custom&word=Bicycle&emoji=🚲
```

**Behavior:**
- ✅ Skips menu, goes directly to tracing
- ✅ Word selector shows "Custom" only (disabled/grayed out)
- ✅ Emoji parameter overrides default emoji mapping
- ✅ Perfect for sharing one-off practice words
- ⚠️ Word not saved to word list (temporary)

---

## Card Games

### Base URL
```
games/cards/index.html
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `game` | string | No | Game ID: `blackjack`, `war`, `poker`. Defaults to last played or `blackjack`. |

### Examples

**Direct Link to Poker:**
```
index.html?game=poker
```

**Direct Link to War:**
```
index.html?game=war
```

### Behavior

- ✅ Loads the specified game in the shared engine frame.
- ✅ Updates the "Card Games" sidebar selection.
- ✅ Persists selection to `localStorage` (`last_card_game`).

---

## Technical Implementation

### URL Updates

Both games automatically update the URL when users make selections:

**Letter Tracing:**
- Selecting a pack → Updates `pack` parameter
- Selecting a letter → Updates both `pack` and `letter` parameters

**Words:**
- Selecting a word from menu → Sets `word` parameter
- Custom word mode → Sets `id=custom` + `word` + optional `emoji`

### Browser History

Both games use `history.pushState()` to update URLs without page reload:
- ✅ Back button returns to previous letter/word
- ✅ Forward button advances through history
- ✅ Bookmark any letter/word for future access
- ✅ Share URLs via copy/paste

### Event Handling

Both games listen for `popstate` events:
```javascript
window.addEventListener('popstate', function(e) {
    var params = parseURLParams();
    loadFromURL(params);
});
```

---

## Use Cases

### For Teachers

**Create lesson plans:**
```
Lesson 1: Lowercase vowels
- index.html?pack=lowercase&letter=a
- index.html?pack=lowercase&letter=e
- index.html?pack=lowercase&letter=i
- index.html?pack=lowercase&letter=o
- index.html?pack=lowercase&letter=u
```

**Custom word practice:**
```
Student name practice:
- words.html?id=custom&word=Emma&emoji=👧
- words.html?id=custom&word=Liam&emoji=👦
```

### For Students

**Bookmark favorite letters:**
```
My favorites:
- index.html?pack=shapes&letter=❤️
- index.html?pack=lowercase&letter=a
```

**Practice specific words:**
```
words.html?word=Kenzie
words.html?word=Mom
```

### For Debugging

**Test specific letter geometry:**
```
index.html?pack=lowercase&letter=e  ← Test the 'e' fix
index.html?pack=shapes&letter=❤️     ← Test heart shape
```

**Test custom words:**
```
words.html?id=custom&word=Test&emoji=🧪
```

---

## Error Handling

### Letter Tracing

| Error | Behavior |
|-------|----------|
| Invalid pack ID | Loads first available pack |
| Invalid letter | Loads first letter in pack |
| Missing parameters | Loads default (first pack, first letter) |
| Emoji encoding issues | Browser auto-handles URL encoding |

### Words

| Error | Behavior |
|-------|----------|
| Word not found | Returns to menu view |
| Invalid id parameter | Treats as normal word lookup |
| Missing word parameter | Shows menu view |
| Emoji encoding issues | Browser auto-handles URL encoding |

---

## Future Enhancements

Potential additions (from TODO.md):

1. **Multiple letters practice:**
   ```
   index.html?letters=A,e,5,❤️
   ```
   Create custom practice pack with specific letters

2. **Word lists:**
   ```
   words.html?list=family   ← Load "Family" word pack
   words.html?list=animals  ← Load "Animals" word pack
   ```

3. **Settings in URL:**
   ```
   index.html?pack=lowercase&letter=e&mode=strict&speed=1.5
   ```
   Pre-configure guidance mode and voice speed

---

## Examples Summary

### Letter Tracing
```bash
# Specific pack + letter
http://localhost:8000/games/letter-tracing/index.html?pack=lowercase&letter=e

# Auto-find pack
http://localhost:8000/games/letter-tracing/index.html?pack=custom&letter=A

# Shapes with emoji
http://localhost:8000/games/letter-tracing/index.html?pack=shapes&letter=❤️
```

### Words
```bash
# Predefined word
http://localhost:8000/games/words/words.html?word=Kenzie

# Custom word with emoji
http://localhost:8000/games/words/words.html?id=custom&word=Elephant&emoji=🐘

# Custom word without emoji
http://localhost:8000/games/words/words.html?id=custom&word=Practice
```

---

## Testing

Test the URL parameter system at:
- **Letter Tracing:** http://localhost:8000/games/letter-tracing/index.html
- **Words:** http://localhost:8000/games/words/words.html

Try these test URLs:
1. `index.html?pack=lowercase&letter=e`
2. `words.html?id=custom&word=Test&emoji=🧪`
3. Navigate using the games, then use browser back button
4. Bookmark a URL, close browser, reopen bookmark

---

## Notes

- All URL parameters are case-sensitive
- Emoji characters work in URLs (auto-encoded by browser)
- URLs update automatically as users navigate
- Browser history fully supported (back/forward buttons work)
- Custom words in URLs are not saved to localStorage

