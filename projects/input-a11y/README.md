# Input A11y (OCR & Scanning)

**Version:** 0.3.0
**Policy Classification:** Personal / Non-Commercial
**License:** Apache 2.0 (Tesseract.js) / MIT (App Logic)

Offline-first scanning utility with OCR text recognition, barcode/QR scanning, QR code generation, and persistent scan history. All processing happens client-side — no data leaves the browser.

## Features

- **Smart Canvas OCR** — Upscale, grayscale, binarize pipeline for accurate text recognition from screens
- **Dual OCR Drivers** — Tesseract.js (offline WASM) or native TextDetector (Chrome/Edge)
- **Barcode/QR Scanner** — Auto-detect or target specific formats (Code 128, EAN-13, UPC-A, etc.)
- **QR Generator** — Create and download QR codes from any text
- **Screenshot Evidence** — Capture raw camera frames independent of OCR
- **Scan & Verify** — Manual OCR trigger with candidate verification modal
- **URL Input Mode** — Scan text, verify, and open as URL with configurable base
- **History** — Full CRUD: image preview, edit, delete, Open URL, click-to-copy
- **Configurable** — ROI region, confidence threshold, debounce, exact text length filter, regex filter, whitespace modes
- **Transactional Settings** — Save/Cancel/Default with change counter

## ⚖️ Legal & Compliance

For details on data usage and privacy, please refer to:
*   [**Legal & Policy Framework**](../../legal/README.md)
*   [**Data Policy**](../../legal/DATA_POLICY.md) (See "Input A11y" section)

**Privacy:**
*   All scanned data is processed locally within the browser.
*   No images are uploaded to external servers.
*   Scanned text history is stored in `localStorage`.

## Setup
See [OCR_SETUP.md](OCR_SETUP.md) for offline configuration instructions.

## Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) — System design and key decisions
- [TODO.md](TODO.md) — Roadmap and known issues
- [INFO.md](INFO.md) — Dependencies and file structure
