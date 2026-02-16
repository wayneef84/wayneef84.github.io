# F.O.N.G. Flow

## What is this?

F.O.N.G. Flow is a grid-based puzzle game where players must connect matching colored nodes with continuous pipes without any paths crossing.

**Who should play:** Puzzle enthusiasts looking for a relaxing, spatial-reasoning challenge.

**Why it exists:** To test the Canvas rendering capabilities for smooth, continuous line-drawing via touch-drag events on mobile devices.

---

## Quick Start (30 seconds)

1. Launch the game from the Development section of the Master Hub.

2. Select a grid size (e.g., 5x5 for beginners, up to 9x9 for advanced players).

3. Tap and hold on any colored circular node.

4. Drag your finger to the matching colored node to draw a pipe.

5. Fill the entire board with pipes to complete the level!

**Pro Tip:** Every single empty square on the grid MUST be filled by a pipe to complete the puzzle. If you connected all colors but have an empty space, you must re-route your paths!

---

## Features

- ✨ **Fluid Path Drawing** - Native touch listeners track your finger smoothly across the grid cells to draw uninterrupted SVG/Canvas pipes.

- 🎮 **Dynamic Grid Sizing** - Procedurally generates levels ranging from simple 5x5 grids to massive, complex boards.

- 📱 **Mobile-First Touch** - Built specifically for dragging on a touchscreen; the viewport is locked to prevent accidental scrolling while drawing.

- ⚡ **Collision Detection** - The engine instantly breaks old pipes if you accidentally draw a new path that intersects them.

---

## How to Play

**Objective:**

Connect all matching pairs of colored nodes with continuous paths, ensuring that the entire grid is completely filled and no paths overlap.

**Rules:**

- Pipes cannot intersect or cross over one another.

- A node can only have one pipe connected to it.

- All empty spaces on the board must be covered by a pipe.

**Controls:**

- **Draw:** Touch and drag from one node to another.

- **Erase:** Double-tap a node or an existing pipe to clear it.

---

## Status

- **Version:** 0.8.0

- **Status:** Development

- **Last Updated:** 2026-02-15

- **Mobile Optimized:** Yes (Touch-drag enabled)

- **Tested On:** iOS Safari 12+, Chrome 50+

---

## Troubleshooting

### Common Issues

**Issue:** I connected all the colors, but the level won't end.

- **Solution:** You likely left an empty square on the board. The win condition strictly requires 100% grid coverage.

### Known Limitations

- **Level Generator:** The procedural level generator occasionally creates puzzles with multiple valid solutions, rather than a single unique path.

- **Undo Button:** There is no step-by-step undo; you must clear an entire line if you make a mistake.

---

## Performance & Compatibility

- **Load Time:** Instantaneous.

- **Mobile Support:** Fully optimized for drag-and-drop mechanics.

- **Offline:** 100% offline capable.

---

## Documentation Links

- 📚 [ARCHITECTURE.md](ARCHITECTURE.md) - How the grid matrix tracks path segments

- 🛣️ [TODO.md](TODO.md) - Upcoming features

- 📜 [CHANGELOG.md](CHANGELOG.md) - Version history

- 🧠 [CLAUDE.md](CLAUDE.md) - Developer notes & pathfinding algorithms

- 📋 [INFO.md](INFO.md) - Quick facts & dependencies

---

**Created By:** The C-G-J Alliance (F.O.N.G. Repository)

**License:** Standard MIT / Non-Commercial Family Use
