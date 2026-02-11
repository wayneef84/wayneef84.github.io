# Input A11y - TODO / Roadmap

**Last Updated:** 2026-02-09

---

## Priority 0 (Bugs / Blockers)

- [x] ✅ ES5 Compatibility — Convert `scanner.js`, `storage.js`, `generator.js` from ES6 class to IIFE/prototype (2026-02-08, C)
- [x] ✅ Wire up QR Generator — `generateQR()` now calls `generator.generate()`, shows QR output and download button (2026-02-08, C)
- [x] ✅ `negen-theme` body class — Removed dead class from `index.html` (2026-02-08, C)
- [x] ✅ Merge conflict in scanner.js — Resolved ES6 async vs ES5 prototype conflict, kept ES5 version with deviceId support (2026-02-08, C)
- [x] ✅ OCR garbage data on digital screens — Implemented Smart Canvas pipeline (upscale → grayscale → binarize) and Tesseract Strict Mode (PSM 7, char whitelist, DPI 300) (2026-02-08, C)
- [x] ✅ Detection Overlay UI — When scanner detects valid text, display green pulsing box with detected value overlaying the camera. Click to navigate/copy, click outside or Escape to dismiss and resume scanning. Auto-pauses scanning to prevent system hang. (2026-02-09, C)
- [x] ✅ Transparent Verify Modal — Converted verification modal to semi-transparent overlay style with backdrop blur. Click outside to dismiss and resume scanning. (2026-02-09, C)
- [x] ✅ Min Character Length (not exact) — Changed from exact match to minimum length requirement. Click the on-screen indicator to quickly adjust via prompt. (2026-02-09, C)
- [x] ✅ Quick Settings Overlay — Click the character count indicator to open a visual overlay with +/- buttons for min length and toggle buttons for text transformation (Original/UPPERCASE/lowercase). No more prompts! (2026-02-09, C)
- [x] ✅ Text Transformation — OCR results can be auto-transformed to UPPERCASE, lowercase, or left as Original. Applied after whitespace processing but before filtering. (2026-02-09, C)

## Priority 1 (Should Fix)

- [ ] Sanitize image `src` in history rendering — `renderList()` sets `thumb.src = item.image` directly. Low risk (localStorage only) but should validate data URI format.
- [x] ✅ History item deletion — Edit modal with delete button, plus inline delete button per history item (2026-02-08, G/C)
- [x] ✅ History size limit — Auto-prune to 50 items per category on insert. Oldest items dropped first. (2026-02-08, C)
- [ ] Binarization threshold tuning — Currently hardcoded at 128. Consider making configurable via Settings for different lighting conditions.
- [x] ✅ Auto-restart camera after modal/tab return — `visibilitychange` API restarts scanner when user returns from `window.open` or tab switch. No more manual reload needed. (2026-02-08, C)
- [x] ✅ Tesseract worker memory leak — Added `beforeunload` handler to call `ocrManager.terminate()`. Prevents worker accumulation on page refreshes. (2026-02-08, C)
- [x] ✅ Accessibility (ARIA) — Added `role="dialog"`, `aria-modal`, `aria-label` to all modals. Added `aria-live` to scan status and toasts. Added `aria-label` to all icon-only buttons. Escape key closes all modals. (2026-02-08, C)

- [x] ✅ `StorageManager.clearSettings()` missing — Added method; was causing crash on "Default" button (2026-02-08, C)

## Priority 2 (Enhancements)

- [ ] Batch scan mode — Continuously scan and auto-save without modal interruption
- [ ] Export history — CSV or JSON download of scan history
- [x] ✅ Camera selection — Video source dropdown with auto-detect + manual selection (2026-02-08, G/C)
- [ ] Multi-language OCR — Support additional Tesseract language packs beyond English
- [ ] Adaptive binarization — Use Otsu's method or local adaptive thresholding instead of global threshold

## Priority 3 (Nice to Have)

- [ ] Dark/light theme toggle
- [ ] Sound feedback option (beep on scan)
- [ ] Share scanned text via Web Share API
- [x] ✅ PWA support — Manifest + service worker with offline-first caching. App installs to home screen on mobile. (2026-02-09, C)
