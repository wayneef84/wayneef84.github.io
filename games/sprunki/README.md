# Sprunki Mixer

A web-based music mixer with multiple character packs and sound combinations.

## Quick Start

### Running the Mixer (Avoiding CORS Issues)

The mixer requires loading audio and image files, which browsers block when opening HTML files directly. You need to run a local web server:

#### macOS/Linux:
```bash
./start_server.sh
```

#### Windows:
```batch
start_server.bat
```

#### Manual Method (Any OS):
```bash
# Navigate to the sprunki folder
cd /path/to/games/sprunki

# Start a local server (Python 3)
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000/index.html
```

## Packs Available

### Phase 1 (Standard)
The original 20-character pack with 4 categories:
- **Beats**: Oren, Raddy, Clukr, Fun Bot, Vineria
- **Effects**: Gray, Brud, Garnold, OWAKCX, Sky
- **Melodies**: Sun, Durple, Tree, Simon, Tunner
- **Vocals**: Computer, Wenda, Pinki, Jevin, Black

### UNO Reverse (Test)
A reverse-themed pack using the same audio/visual assets as Phase 1, but with "Reverse" prefixed names. This pack demonstrates how to add new packs without duplicating assets.

## Configuration

All settings are controlled via `config.json`:

- **Packs**: Define asset libraries (themes)
- **Categories**: Define color coding for character types
- **Characters**: Define the roster with audio/image paths
- **Stage Settings**: Control min/max slots and layout

## Adding New Packs

1. Create a new pack entry in `config.json`:
```json
{
  "id": "mypack",
  "label": "My Custom Pack",
  "base_path": "./assets/packs/mypack/"
}
```

2. Add character definitions:
```json
{
  "id": "custom01",
  "name": "My Character",
  "type": "beats",
  "pack_id": "mypack",
  "audio": "audio/custom01.wav",
  "img": "img/custom01.svg"
}
```

3. Place audio files in `assets/packs/mypack/audio/` and images in `assets/packs/mypack/img/`

**Note**: You can reference assets from other packs using relative paths like `../phase1/audio/b01.wav`

## Navigation

- **HOME Button**: Returns to Dad's Casino main menu
- **Pack Selector**: Switch between different character packs (triggers full reset)
- **Stage**: Drag characters from the palette to add them to the mixer
- **Clear Button**: Removes all characters from the stage

## Troubleshooting

### CORS Error
If you see a CORS error in the console, you're opening the HTML file directly. Use one of the server launch scripts above.

### Audio Not Playing
- Ensure you're running a local server (see Quick Start)
- Check browser console for specific errors
- Verify audio files exist at the paths specified in `config.json`

### Images Not Loading
- Ensure you're running a local server
- Check that image paths in `config.json` match actual file locations
- SVG format is recommended for character images

## Technical Details

- **Audio Format**: WAV files (loopable)
- **Image Format**: SVG (scalable vector graphics)
- **Web Audio API**: Used for synchronized audio playback
- **Configuration**: JSON-based, hot-reloadable on pack switch
