# Input A11y - Architecture

**Version:** 0.3.0
**Last Updated:** 2026-02-08

---

## Overview

Input A11y is an offline-first scanning utility with four modes:
1. **OCR Text Scanner** — Live camera text recognition via Tesseract.js or native TextDetector
2. **Barcode/QR Scanner** — Camera-based code scanning via html5-qrcode
3. **QR Generator** — Create QR codes from text input
4. **History** — Persistent log of all scans and generated codes

All processing happens client-side. No data leaves the browser.

---

## Module Architecture

```
index.html
  ├── storage.js      → StorageManager (localStorage)
  ├── scanner.js       → ScannerManager (html5-qrcode)
  ├── ocr-manager.js   → OCRManager (Tesseract.js / TextDetector)
  ├── generator.js     → GeneratorManager (qrcodejs)
  └── app.js           → App controller (tabs, events, UI state)
```

**Load order matters.** `app.js` depends on all other modules being defined first.

---

## Key Design Decisions

### 1. Dual-Driver OCR

`OCRManager` supports two drivers:

| Driver | API | Availability | Offline |
|--------|-----|-------------|---------|
| **Tesseract.js** | `Tesseract.createWorker()` | All browsers | Yes (WASM + trained data) |
| **Native TextDetector** | `TextDetector.detect()` | Chrome/Edge (experimental) | Yes |

Driver resolution: user preference > native (if available) > Tesseract.

### 2. Smart Canvas Pre-Processing Pipeline (v0.2.0)

Raw video frames from digital screens produce garbage OCR results due to anti-aliasing,
sub-pixel rendering, and variable brightness. The Smart Canvas pipeline fixes this:

```
Video Frame
    │
    ▼
[ROI Crop] ─── Extract only the region of interest (configurable %)
    │
    ▼
[Upscale 2.5x] ─── Tesseract needs ~300 DPI equivalent
    │
    ▼
[Grayscale] ─── Remove color noise (ITU-R BT.601 luminance)
    │
    ▼
[Binarize] ─── Threshold at 128: below = black, above = white
    │
    ▼
[Tesseract OCR] ─── Strict Mode: PSM 7, char whitelist, DPI 300
    │
    ▼
[Filter Pipeline] ─── Preprocessing → Regex → Min length → Debounce
    │
    ▼
Callback / UI
```

**Why this works:**
- **Upscaling** gives Tesseract enough pixel data to distinguish characters
- **Binarization** eliminates screen blur, anti-aliasing gradients, and color noise
- **Char whitelist** (A-Z, a-z, 0-9) mathematically prevents garbage symbols like `~`, `|`, `{`
- **PSM 7** tells Tesseract "this is a single line of text" instead of guessing page layout

### 3. Tesseract Strict Mode Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `tessedit_char_whitelist` | `A-Za-z0-9` | Only recognize alphanumeric characters |
| `tessedit_pageseg_mode` | `7` | Treat image as a single text line |
| `user_defined_dpi` | `300` | Force high-density interpretation |

### 4. Dual-Button UI (v0.2.0)

The single "Snapshot" button has been split into two independent controls:

| Button | Purpose | Always Works? |
|--------|---------|---------------|
| **Screenshot Evidence** | Captures raw camera frame as JPEG, saves to history | Yes (no OCR needed) |
| **Scan & Verify** | Runs Smart Canvas pipeline → OCR → shows verification modal | Depends on OCR success |

This separation ensures evidence capture is never blocked by OCR failures.

### 5. Deferred Autoplay

Camera APIs throw `NotAllowedError` on mobile if started without user gesture. The app shows a "Start Scanner" button on first load. After the first interaction, `userHasInteracted` is set and the scanner auto-starts on tab switches.

### 6. Text Filtering Pipeline

OCR results pass through a configurable filter chain:

```
Raw Text → preprocessing (trim/normalize/remove) → alphanumeric strip (optional) → filter mode → exact length check → debounce → callback
```

Filter modes:
- **NONE** — Accept all text
- **REGEX** — Match against a JavaScript regex

Exact Text Length (`ocrMinLength`):
- `0` = off, accept any non-empty text
- Any positive integer = require text to be exactly that many characters

### 7. Snapshot Capture (Legacy)

The legacy `snapshot()` method now delegates to `scanAndVerify()` internally. It is kept for backward compatibility but the new dual-button UI is the preferred interface.

### 8. Transactional Settings (v0.3.0)

Settings use a copy-on-edit pattern:
1. On entering Settings tab, `tempSettings` is cloned from `settings`
2. All UI changes modify `tempSettings` only
3. **Save** commits `tempSettings` to `settings` and persists to localStorage
4. **Cancel** discards `tempSettings` and reverts UI
5. **Default** clears localStorage and reloads defaults

The sticky footer shows Save/Cancel/Default buttons. A change counter warns before discarding unsaved edits.

### 9. History CRUD (v0.3.0)

History items support:
- **Image preview** — Click thumbnail to open full-size modal with Save button
- **Edit** — Opens modal with textarea; cancel-reverts if text was changed
- **Delete** — Per-item deletion with confirmation, or bulk clear per category
- **Open URL** — Visible only when URL Input mode is active; copies text + opens URL
- **Click-to-copy** — Clicking any history item copies its content to clipboard

### 10. URL Input Mode (v0.3.0)

When `actionMode` is `URL_INPUT`:
1. Scan result triggers a **verification modal** with candidate text lines
2. Each candidate is stripped of whitespace and deduped
3. User taps a candidate to select it
4. Selected text is saved to history, copied to clipboard, and URL is opened
5. URL construction: `baseUrl + encodeURIComponent(value)` (if `addValueToUrl` is on)

### 11. Red Scan Line & ROI Overlay

- **Scan line** — Red horizontal line dynamically positioned at the vertical center of the ROI box. Falls back to 50% when ROI is disabled. Visible only in OCR modes.
- **ROI overlay** — Dashed teal border with darkened surrounding area (CSS `box-shadow: 0 0 0 9999px`)
- ROI is always auto-centered; user controls width/height percentages only
- Scan line position is updated in `updateRoiOverlay()` alongside the overlay itself

---

## Storage System

Uses `localStorage` with three keys:

| Key | Content |
|-----|---------|
| `input_a11y_settings` | JSON settings object (all preferences) |
| `input_a11y_history_scanned` | Array of scanned items (text, format, timestamp, image) |
| `input_a11y_history_created` | Array of generated QR items |

History items include an `id` field (base36 timestamp + random suffix) for individual deletion.

**Storage limit:** Each category (SCANNED, CREATED) is capped at 50 items (`MAX_HISTORY = 50`). When a new item is added and the list exceeds the cap, the oldest entries are automatically pruned.

### User Preferences

Settings are persisted in `localStorage` under `input_a11y_settings`. Key OCR preferences:

| Setting | Default | Description |
|---------|---------|-------------|
| `ocrDriver` | auto | Preferred OCR driver (`tesseract` or `native`) |
| `ocrConfidence` | 40 | Minimum confidence threshold (0-100) |
| `ocrDebounce` | 3000 | Debounce ms between duplicate results |
| `ocrMinLength` | 0 | Exact text length filter (0 = off, accepts any length) |
| `ocrRoiEnabled` | true | Enable region-of-interest cropping |
| `ocrFilterMode` | NONE | Text filter mode (NONE, REGEX) |
| `ocrPreprocessingMode` | TRIM | Whitespace handling |

---

## Feedback System

On successful scan, the app can trigger:
- **Vibration** — `navigator.vibrate(200)`
- **Green Frame** — CSS class on scanner or full screen
- **Screen Flash** — White flash animation via CSS pseudo-element

Each feedback type can be scoped to scanner-only or full-screen.

---

## Privacy Note

All processing in Input A11y happens entirely on the client side:
- OCR is performed locally via Tesseract.js WebAssembly or the browser's native TextDetector API
- No images, text, or scan data are transmitted to any external server
- All settings and history are stored in the browser's `localStorage`
- The Tesseract language model (`eng.traineddata`) is bundled locally in the `assets/` folder

---

## ES5 Compatibility

Per project coding standards, all modules use:
- `var` instead of `const`/`let`
- IIFE + prototype pattern instead of `class`
- Regular functions instead of arrow functions
- `Promise` chains instead of `async/await`
- `indexOf` instead of `includes`

`app.js` uses `var` and function expressions (not IIFE-wrapped since it's the top-level controller inside a `DOMContentLoaded` listener).
