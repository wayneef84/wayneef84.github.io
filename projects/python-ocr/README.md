# Offline OCR Tool (EasyOCR)

This project provides a robust, offline-capable Optical Character Recognition (OCR) solution using Python and [EasyOCR](https://github.com/JaidedAI/EasyOCR). It is designed to work without external APIs or binaries like Tesseract, relying instead on PyTorch deep learning models.

## 🚀 Features
*   **Offline:** All processing happens locally. No data is sent to the cloud.
*   **No Tesseract:** Does not require installing system-level binaries (`apt-get install tesseract`).
*   **Multiple Languages:** Supports 80+ languages (configurable).
*   **Dual Interface:** Run via Command Line (CLI) or a Web Browser Interface.

## 📦 Installation

Prerequisites: Python 3.8+

1.  Navigate to this directory:
    ```bash
    cd projects/python-ocr
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *Note: This will install PyTorch. If you have a specific CUDA version, install PyTorch separately first.*

## 🖥️ Usage

### 1. Web Browser Interface (Recommended)
You asked: *"Can we run this python script in a web browser?"*

**Yes!** We use [Streamlit](https://streamlit.io/) to create a local web server. This allows you to interact with the Python script through your browser, upload images, and copy text, while the heavy lifting (OCR) is done by your local Python environment.

Run the app:
```bash
streamlit run app.py
```
This will automatically open `http://localhost:8501` in your default browser.

### 2. Command Line Interface (CLI)
For quick, scriptable usage:

```bash
python cli.py path/to/image.jpg
```

**Options:**
*   `--gpu`: Use GPU acceleration (if CUDA is available).
*   `--langs`: Specify languages (e.g., `--langs en fr`).
*   `--detail`: Show confidence scores and bounding boxes.

## ❓ FAQ

**Q: Can this run strictly client-side (like JavaScript) without a Python backend?**
A: **No.** EasyOCR relies on PyTorch, which is a heavy machine learning framework. While technologies like PyScript (WASM) exist, running full PyTorch models purely in the browser client is currently too slow and resource-intensive for practical use.

**Q: What is the difference between this and "Input A11y"?**
A:
*   **This Project:** Uses deep learning (EasyOCR) for high accuracy and multi-language support. Requires a Python server.
*   **Input A11y:** Uses the browser's built-in `TextDetector` API (Shape Detection API). It is lighter and runs 100% in the browser but has lower accuracy and is only supported in Chrome-based browsers.
