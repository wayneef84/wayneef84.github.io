# ⚖️ License Audit Log

**Purpose:** This document tracks the license status of all third-party code, libraries, and assets within the F.O.N.G. repository.
**Maintenance:** All agents (Claude, Gemini, Jules) must update this file whenever a new external dependency is introduced.

## 📜 Project License
The project itself is licensed under the **MIT License**.
- **Holder:** Copyright (c) 2026 Wayne Fong
- **Location:** `/LICENSE` (Root)

---

## 📦 Third-Party Libraries (Local)

Code hosted directly in this repository (e.g., in `lib/` folders).

| File / Path | Library Name | License | License Location | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `games/lib/html5-qrcode.min.js` | **html5-qrcode** | Apache 2.0 | `games/lib/LICENSE.txt` | Camera/Barcode scanning. Author: minhazav. |
| `games/lib/qrcode.min.js` | **qrcodejs** | MIT | `games/lib/LICENSE.txt` | QR Code generation. Author: davidshimjs. |
| `games/cards/shared/poker-evaluator.js` | **Poker Evaluator** | MIT | File Header | Adaptation of standard evaluation logic. Licensed by Wayne Fong as an adaptation. |
| `projects/input-a11y/assets/tesseract.min.js` | **Tesseract.js** (v5.1.1) | Apache 2.0 | `projects/input-a11y/LICENSE_TESSERACT` | Client-side OCR engine. Author: naptha. |
| `projects/input-a11y/assets/worker.min.js` | **Tesseract.js** (v5.1.1) | Apache 2.0 | `projects/input-a11y/LICENSE_TESSERACT` | Tesseract.js web worker. |
| `projects/input-a11y/assets/tesseract-core-simd.*` | **tesseract.js-core** (v5.1.0) | Apache 2.0 | `projects/input-a11y/LICENSE_TESSERACT` | WASM core + glue for Tesseract OCR. |
| `projects/input-a11y/assets/eng.traineddata` | **tessdata** | Apache 2.0 | `projects/input-a11y/LICENSE_TESSERACT` | English language model for Tesseract. |

---

## 🌐 Remote Dependencies (CDN)

Libraries loaded via `script src` from external CDNs. These are not distributed in the repo but are required for functionality.

| Project / File | Library Name | License | Source | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `projects/md-reader/index.html` | **marked** (v4.3.0) | MIT | `cdn.jsdelivr.net` | Markdown parser. |
| `projects/md-reader/index.html` | **highlight.js** (v11.9.0) | BSD 3-Clause | `cdnjs.cloudflare.com` | Syntax highlighting. |
| `projects/shipment-tracker/docs/EXPORT.md` | **SheetJS** | Apache 2.0 | `cdn.sheetjs.com` | *Optional* reference for Excel export. Not active in default app. |

---

## 🛠️ Custom / Adapted Code

Code that might appear external but is confirmed as custom or fully owned.

| File / Path | Status | License | Notes |
| :--- | :--- | :--- | :--- |
| `games/lib/qr-master.js` | **Custom** | MIT (Root) | Wrapper class for QR libraries. Created by F.O.N.G. team. |
| `games/board/js/xiangqi-ai.js` | **Custom** | MIT (Root) | Implementation of standard Minimax/Alpha-Beta algorithms. |
| `projects/code/js/cracker.js` | **Custom** | MIT (Root) | Custom brute-force simulation engine. |
| `projects/md-reader/app.js` | **Custom** | MIT (Root) | Markdown rendering logic and session management. |
| `projects/regex_builder/index.html` | **Custom** | MIT (Root) | Standalone Regex Builder tool. |

---

## 📝 Maintenance Protocol

**When adding a new library:**
1.  **Verify the License:** Ensure it is compatible (MIT, Apache 2.0, BSD, CC0). Avoid GPL if possible ( viral).
2.  **Add License Text:**
    *   If local: Add the full text to `games/lib/LICENSE.txt` (or a specific `LICENSE` file in the project folder).
    *   If adapted: Add a header comment to the file with the license and attribution.
3.  **Update This File:** Add a row to the appropriate table above.
4.  **Log in `AGENTS.md`:** Mention the addition in the session log.
