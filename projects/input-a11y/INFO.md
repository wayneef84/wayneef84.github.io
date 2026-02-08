# Input A11y - Project Info

**Version:** 0.1.0
**Type:** Utility
**Status:** Active Development
**Last Updated:** 2026-02-08

---

## Dependencies

### Local Libraries

| Library | Version | License | Path |
|---------|---------|---------|------|
| **html5-qrcode** | — | Apache 2.0 | `games/lib/html5-qrcode.min.js` |
| **qrcodejs** | — | MIT | `games/lib/qrcode.min.js` |
| **Tesseract.js** | 5.1.1 | Apache 2.0 | `projects/input-a11y/assets/tesseract.min.js` |
| **tesseract.js-core** | 5.1.0 | Apache 2.0 | `projects/input-a11y/assets/tesseract-core-simd.*` |
| **tessdata (eng)** | 4.0.0 | Apache 2.0 | `projects/input-a11y/assets/eng.traineddata` |

### CDN Libraries

None. Fully offline.

---

## File Structure

```
projects/input-a11y/
├── index.html           # Main app shell (4 tabs)
├── css/style.css        # Dark theme, mobile-first
├── js/
│   ├── app.js           # Tab orchestration, event binding, UI state
│   ├── scanner.js       # ScannerManager (html5-qrcode wrapper)
│   ├── ocr-manager.js   # OCRManager (Tesseract.js + native TextDetector)
│   ├── storage.js       # StorageManager (localStorage wrapper)
│   └── generator.js     # GeneratorManager (QR code generation)
├── assets/              # Tesseract WASM + language data (offline)
├── README.md
├── OCR_SETUP.md
├── LICENSE              # Project license (MIT)
└── LICENSE_TESSERACT    # Tesseract Apache 2.0 license
```

---

## Compatibility Notes

- All JS files use ES5-compatible IIFE/prototype pattern (except `app.js` which uses `var` + function expressions)
- No build tools required — runs directly in browser
- Camera access requires HTTPS or localhost
