# OCR Setup Guide

This guide explains how to set up the offline OCR functionality for Input A11y.

## Required Assets

To enable offline text recognition, you must download the following **5 files** and place them in the `projects/input-a11y/assets/` directory.

### 1. Tesseract Library
**Filename:** `tesseract.min.js`
**URL:** `https://unpkg.com/tesseract.js@5.0.3/dist/tesseract.min.js`

### 2. Tesseract Worker
**Filename:** `worker.min.js`
**URL:** `https://unpkg.com/tesseract.js@5.0.3/dist/worker.min.js`

### 3. Tesseract Core (JS Glue)
**Filename:** `tesseract-core.wasm.js`
**URL:** `https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core.wasm.js`

### 4. Tesseract Core (WASM Binary)
**Filename:** `tesseract-core.wasm`
**URL:** `https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core.wasm`
*(Note: This is the actual binary required by the JS glue)*

### 5. Language Data (English)
**Filename:** `eng.traineddata`
**URL:** `https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/eng.traineddata`
*(Note: This file is approximately 4MB)*

## Installation Steps

1.  Navigate to the `projects/input-a11y/assets/` folder.
2.  Download each file from the URLs provided above.
3.  Ensure the filenames match exactly as listed (rename if necessary).
    -   `tesseract.min.js`
    -   `worker.min.js`
    -   `tesseract-core.wasm.js`
    -   `tesseract-core.wasm`
    -   `eng.traineddata`
4.  Once all files are in place, the "Text Scanner" mode in Input A11y will function completely offline.

## Troubleshooting

-   **"Tesseract library not loaded"**: Ensure `tesseract.min.js` is in the `assets/` folder and loaded by `index.html`.
-   **"Failed to load OCR Engine"**: Check that `worker.min.js`, `tesseract-core.wasm.js`, `tesseract-core.wasm`, and `eng.traineddata` are present in `assets/`.
-   **Slow Performance**: OCR is computationally intensive. Ensure your device has sufficient resources.

## License Information

Tesseract.js is licensed under the **Apache License 2.0**.

By downloading and using these assets, you agree to the terms of the Apache License 2.0. A copy of this license is included in this directory as `LICENSE_TESSERACT`.

-   **Tesseract.js**: Apache License 2.0
-   **Tesseract (Core)**: Apache License 2.0
-   **Leptonica**: BSD 2-Clause (BSD-2-Clause)
