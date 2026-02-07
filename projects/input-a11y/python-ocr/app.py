from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
import numpy as np
import cv2
import io
import time

app = Flask(__name__)
CORS(app)

# Initialize reader (will download models on first run)
print("Initializing EasyOCR reader...")
reader = easyocr.Reader(['en'], gpu=False) # Use CPU by default for portability
print("EasyOCR reader initialized.")

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'backend': 'easyocr',
        'version': easyocr.__version__
    })

@app.route('/ocr', methods=['POST'])
def ocr():
    start_time = time.time()

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    try:
        file = request.files['image']
        # Read image directly from memory
        in_memory_file = io.BytesIO()
        file.save(in_memory_file)
        data = np.frombuffer(in_memory_file.getvalue(), dtype=np.uint8)
        img = cv2.imdecode(data, cv2.IMREAD_COLOR)

        if img is None:
             return jsonify({'error': 'Invalid image format'}), 400

        # Perform OCR
        # detail=1 returns bounding boxes, text, confidence
        results = reader.readtext(img, detail=1)

        formatted_results = []
        full_text = []

        for (bbox, text, prob) in results:
            # bbox is [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            # We need to convert this to {x, y, width, height} format for frontend compatibility
            xs = [point[0] for point in bbox]
            ys = [point[1] for point in bbox]

            x_min = min(xs)
            y_min = min(ys)
            x_max = max(xs)
            y_max = max(ys)

            formatted_results.append({
                'rawValue': text,
                'boundingBox': {
                    'x': float(x_min),
                    'y': float(y_min),
                    'width': float(x_max - x_min),
                    'height': float(y_max - y_min)
                },
                'confidence': float(prob)
            })
            full_text.append(text)

        processing_time = time.time() - start_time

        return jsonify({
            'success': True,
            'text': '\n'.join(full_text),
            'results': formatted_results,
            'processing_time': processing_time
        })

    except Exception as e:
        print(f"Error during OCR: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible if needed, but localhost is safer default
    app.run(host='0.0.0.0', port=5000, debug=False)
