# Changelog

All notable changes to the Fong Family Arcade project will be documented in this file.

## [Unreleased]

## [Letter Tracing v5.1] - 2026-01-09
### Added
- **Audio Architecture:** Implemented A-B-C system (Prefix + Content + Suffix) with cascading overrides (Item > Pack > Global).
- **Settings UI:** Added gear icon toggle and settings panel with voice speed slider.
- **Voice Control:** Added adjustable speech rate (0.25x - 2.0x) using HTML5 range input.
- **Rich Content Format:** Updated `content.js` to support `{name, words, strokes}` object structure alongside legacy arrays.
- **Guidance Defaults:** Renamed "Ghost+" to "Guide" and made it the default startup mode.

### Fixed
- **Mobile Layout:** Fixed critical mobile viewport overflow using `100dvh` and Flexbox `height: 0` strategy on the canvas wrapper.
- **Geometry Logic:**
  - Corrected negative angle calculations for `e`, `f`, `g`, `h`, `m`, `n`, `s`.
  - Capped descender depth at Y=120 for `g`, `j`, `p`, `q`, `y` to prevent UI overlap.
  - Flattened `r` shoulder, balanced `s` weight, lowered `t` ascender, and aligned `w` peaks.

## [Xiangqi v0.3.1] - 2026-01-08
### Added
- AI Color Selector (Play as Red or Black).
- Automatic AI move triggering when AI plays Red.

## [Slots v3.0]
### Added
- 20 unique themes with distinct audio/visuals.
- Dad Mode physics for adjustable win rates.