# F.O.N.G. Jigsaw

Make a jigsaw puzzle from any picture. Made for K, a young puzzler, and fine for everyone else.

## Quick start
1. Open `games/jigsaw/index.html` from the arcade (or any static server).
2. Pick a picture: **Choose a photo**, **Take a photo** (phones), drop a picture on the page, paste one, or tap one of the 8 sample pictures.
3. Pick how many pieces (6 to 300), or tick **Little hands** for 4 to 12 big pieces that snap from far away.
4. Press **Start puzzle** and drag pieces together. Pieces that fit click together and move as one group.

## Privacy
Photos never leave the device. There is no upload, no network request and no CDN. Photos you use are kept in your browser (IndexedDB) so you can keep playing after a reload. The "My pictures" shelf holds the last 12 and each one can be removed.

## Features
- Real jigsaw tabs and blanks (seeded: the same seed always gives the same puzzle), plus Square and Rounded shapes.
- Snapping to neighbours and to the board, transitive groups, soft click sound, glow, optional gentle vibration.
- Zoom and pan (pinch, wheel, buttons, Fit) so 300 pieces work on a phone.
- Shuffle, Edges (gather edge pieces in a row), Ghost picture, Peek (hold to see the picture), Hint (no penalty).
- Optional piece turning (off by default), lock correct pieces (on by default), snap distance slider 5 to 50%.
- No timers, scores, streaks or leaderboards. Time played can be shown but is hidden by default.
- Autosave and resume. Save a puzzle as a single `.json` file to send to someone, and open one.
- Keyboard play: Tab selects a piece, Enter picks up and drops, arrows move, R turns, + - 0 zoom, H hint.

## If something goes wrong
- "This browser is not letting us save": storage is blocked (private mode). You can keep playing and use More, then Save puzzle as file.
- A picture will not open: try a JPG, PNG or WebP. HEIC may not open in every browser.
- Very big photos are shrunk to 1600 pixels on the long side. This is on purpose.

## Tests
`node games/jigsaw/tests/run.js` runs the unit tests for the pure modules (no dependencies).

Docs: [ARCHITECTURE.md](ARCHITECTURE.md) | [DESIGN.md](DESIGN.md) | [INFO.md](INFO.md) | [TODO.md](TODO.md) | [CHANGELOG.md](CHANGELOG.md) | [CLAUDE.md](CLAUDE.md) | [AGENT.md](AGENT.md) | [ASSET_LOG.md](ASSET_LOG.md)
