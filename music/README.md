# Background Music for Slots

This directory contains background music files for different slot machine themes.

## Required Music Files

Place the following MP3 files in this directory:

### Themed Music:
- `fantasy.mp3` - Mystical, magical theme (Used by: Mystical Unicorn)
- `classic.mp3` - Retro casino vibes (Used by: Classic Fruits)
- `ocean.mp3` - Underwater ambiance (Used by: Ocean Adventure)
- `space.mp3` - Futuristic synth (Used by: Space Explorer, Solar System)
- `casino.mp3` - Classic casino sounds (Used by: Card Royale)
- `music.mp3` - Upbeat musical theme (Used by: Music Beats)

### Default Music:
- `default.mp3` - Generic slot machine background music (Used by all other themes)

## Music Specifications

- **Format**: MP3 (recommended) or OGG
- **Duration**: 1-3 minutes (loops automatically)
- **Bitrate**: 128-192 kbps (balance between quality and file size)
- **Volume**: Normalized to prevent clipping
- **Style**: Loopable, ambient, non-intrusive

## Free Music Sources

You can find royalty-free music at:
- [Pixabay Music](https://pixabay.com/music/)
- [FreePD](https://freepd.com/)
- [Incompetech](https://incompetech.com/music/royalty-free/)
- [YouTube Audio Library](https://www.youtube.com/audiolibrary/)

## How It Works

Background music is configured in `/js/themes.js` with the `bgMusic` property:

```javascript
'fantasy': {
    name: 'Mystical Unicorn',
    bgMusic: '../music/fantasy.mp3',
    // ... rest of theme config
}
```

The music:
- Starts when a theme is loaded
- Loops continuously
- Can be toggled with the audio button (🔊)
- Automatically switches when changing themes
- Falls back gracefully if file is missing

## Temporary Solution

While you gather music files, the game will still work but won't have background music. Console warnings will appear if files are missing, but the game remains fully functional.
