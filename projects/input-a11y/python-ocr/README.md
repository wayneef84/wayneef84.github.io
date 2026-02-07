# Offline OCR Server for Input A11y

This is a Python-based OCR backend using [EasyOCR](https://github.com/JaidedAI/EasyOCR) and Flask. It serves as an offline text recognition engine for the Input A11y web application, providing a robust alternative to browser-based APIs (like `TextDetector`).

## Requirements

*   Python 3.8+
*   `pip`

## Setup

1.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Linux/Mac:
    source venv/bin/activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
    *Note: The first time you run the server, EasyOCR will download the detection and recognition models (approx. 200MB).*

## Usage

1.  **Start the Server:**
    ```bash
    python app.py
    ```
    The server will start on `http://localhost:5000`.

2.  **Connect the Web App:**
    Open `projects/input-a11y/index.html`. The application will automatically detect the running local server and switch to "Local OCR" mode.

## API Endpoints

*   `GET /status`: Checks server health. Returns `{ status: 'online', backend: 'easyocr' }`.
*   `POST /ocr`: Accepts an image file (multipart/form-data with key `image`). Returns JSON with detected text and bounding boxes.

## License

This project includes components licensed under:
*   **EasyOCR:** Apache 2.0
*   **Flask:** BSD-3-Clause
*   **OpenCV:** Apache 2.0

See `LICENSE` file for details.
