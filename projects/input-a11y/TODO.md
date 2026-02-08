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

- [ ] Sanitize image `src` in history rendering — `renderList()` injects `item.image` directly into innerHTML without escaping. Low risk (localStorage only) but should validate data URI format.
- [ ] History item deletion — `StorageManager.removeItem()` exists but no UI exposes it. Add swipe-to-delete or delete button per history item.
- [ ] History size limit — No cap on localStorage history. Large snapshot images (JPEG data URIs) will bloat storage. Consider a max-items limit or image compression.
- [ ] Binarization threshold tuning — Currently hardcoded at 128. Consider making configurable via Settings for different lighting conditions.

## Priority 2 (Enhancements)

- [ ] Batch scan mode — Continuously scan and auto-save without modal interruption
- [ ] Export history — CSV or JSON download of scan history
- [ ] Camera selection — Allow user to pick specific camera (front/back/external) instead of defaulting to environment
- [ ] Multi-language OCR — Support additional Tesseract language packs beyond English
- [ ] Adaptive binarization — Use Otsu's method or local adaptive thresholding instead of global threshold

## Priority 3 (Nice to Have)

- [ ] Dark/light theme toggle
- [ ] Sound feedback option (beep on scan)
- [ ] Share scanned text via Web Share API
- [ ] PWA support (manifest + service worker for true offline)
