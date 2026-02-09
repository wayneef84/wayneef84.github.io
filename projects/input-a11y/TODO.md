# Input A11y - TODO / Roadmap

**Last Updated:** 2026-02-08

---

## Priority 0 (Bugs / Blockers)

- [x] ✅ ES5 Compatibility — Convert `scanner.js`, `storage.js`, `generator.js` from ES6 class to IIFE/prototype (2026-02-08, C)
- [x] ✅ Wire up QR Generator — `generateQR()` now calls `generator.generate()`, shows QR output and download button (2026-02-08, C)
- [x] ✅ `negen-theme` body class — Removed dead class from `index.html` (2026-02-08, C)
- [x] ✅ Merge conflict in scanner.js — Resolved ES6 async vs ES5 prototype conflict, kept ES5 version with deviceId support (2026-02-08, C)
- [x] ✅ OCR garbage data on digital screens — Implemented Smart Canvas pipeline (upscale → grayscale → binarize) and Tesseract Strict Mode (PSM 7, char whitelist, DPI 300) (2026-02-08, C)

## Priority 1 (Should Fix)

- [ ] Sanitize image `src` in history rendering — `renderList()` sets `thumb.src = item.image` directly. Low risk (localStorage only) but should validate data URI format.
- [x] ✅ History item deletion — Edit modal with delete button, plus inline delete button per history item (2026-02-08, G/C)
- [x] ✅ History size limit — Auto-prune to 50 items per category on insert. Oldest items dropped first. (2026-02-08, C)
- [ ] Binarization threshold tuning — Currently hardcoded at 128. Consider making configurable via Settings for different lighting conditions.

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
- [ ] PWA support (manifest + service worker for true offline)
