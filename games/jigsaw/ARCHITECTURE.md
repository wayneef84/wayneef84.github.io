# Jigsaw - Architecture

Plain scripts, strict ES5, no build. Pure modules run in the browser (`window.FongJigsaw.*`) and in node (`module.exports`).

## Modules (load order in index.html)
| File | Kind | Job |
|---|---|---|
| `js/geometry.js` | pure | Grid choice, seeded edges, bezier outlines, flattening, point-in-polygon |
| `js/groups.js` | pure | Union-find groups, snapping, hit test, scatter, gather edges, hints |
| `js/model.js` | pure | New game, table layout, serialize, puzzle-file validation, zoom/pan maths |
| `js/images.js` | DOM | Load, EXIF, downscale, IndexedDB shelf (localStorage fallback) |
| `js/audio.js` | DOM | WebAudio tones, guarded vibration |
| `js/samples.js` | DOM | 8 original canvas-drawn pictures |
| `js/render.js` | DOM | Per-piece offscreen bitmaps, one canvas, mip copy when zoomed out |
| `js/input.js` | DOM | Pointer events, pinch/pan/wheel, keyboard |
| `js/ui.js` | DOM | Status line, toast, chips, thumbs, sheet, confetti, download |
| `js/app.js` | DOM | Controller, storage, tools. Exposes `window.FongJigsawApp` (state, view, test helpers) |

## Geometry
The board has its top-left at (0,0). Cells are 100 units wide, height follows the image so the picture is not stretched. Each shared edge is built once in a canonical direction from a hash of (seed, kind, row, col) and walked forward by one piece and backward by its neighbour. Two outlines are therefore the same curve: a tab for one is a blank for the other, with no gaps and no overlap (tests check area sums and point coverage). Tabs reach at most 0.34 of a cell, so every bitmap has that margin.

## Groups and snapping
A group has an offset O and a rotation (quarter turns). Piece (r,c) sits at `O + R(rot) * (c*pw, r*ph)`. All pieces in a group share O, so the alignment error between two groups is just `|O1 - O2|`.

Rules (`Groups.trySnap`), with `snapDistance = snapPct * pw` (default 25%, 5 to 50%, Little hands 45%):
1. Frame: rot is 0 and `|O - boardOrigin| <= snapDistance` -> O becomes the board origin ("anchored").
2. Neighbour: two different groups holding solution-adjacent pieces, same rotation, `|O1 - O2| <= snapDistance` -> merge, taking the anchored or stationary group's offset. Repeat until nothing changes, so merges are transitive.
3. Anchored groups are "locked" (cannot be picked up, drawn under loose pieces) when the Lock setting is on. The state is derived, so toggling Lock applies at once.
4. Complete means one group. If it is not on the board it is moved there.
The boundary is inclusive and the distance is Euclidean.

## Rendering
Each piece is cut once: image clipped to its outline, a bevel and outline baked in. A frame is `setTransform` plus `drawImage` per visible piece, drawn only when needed (rAF on demand). The lifted group gets a shadow by drawing far off canvas and using the shadow offset.

## Storage
- `fong.jigsaw.v2` (localStorage): settings and `serialize()` of the game and a pointer to the picture (`sample`, `pic` id, or `inline`).
- IndexedDB `fong-jigsaw` / `pics`: up to 12 pictures with thumbnails.
- Old `jigsaw_*` keys from v1 are ignored (never read, never deleted).
- Every storage call is wrapped. Failure shows a kind message once and play continues.

## Puzzle file
`{format:"fong-jigsaw", version:2, name, created, puzzle:{seed,cols,rows,imgW,imgH,style}, settings:{count,little,style,snapPct,lock,rotate}, image:"data:image/jpeg;base64,..."}`. Import checks text size (8 MB), JSON, exact schema and ranges, image data URL type, base64 characters and the real file magic bytes (JPEG, PNG, WebP only; SVG refused). Nothing from the file is evaluated, and the name is shown with textContent only.
