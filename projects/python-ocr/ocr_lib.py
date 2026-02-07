import easyocr
import numpy as np
from PIL import Image
import io
import os

class OCRProcessor:
    def __init__(self, languages=['en'], use_gpu=False):
        """
        Initialize the EasyOCR Reader.

        Args:
            languages (list): List of language codes (default: ['en'])
            use_gpu (bool): Whether to use GPU for inference (default: False)
        """
        print(f"Initializing EasyOCR with languages={languages}, gpu={use_gpu}...")
        self.reader = easyocr.Reader(languages, gpu=use_gpu)
        print("EasyOCR initialized successfully.")

    def process_image(self, image_input, detail=0):
        """
        Processes an image and returns the text.

        Args:
            image_input: Can be a file path (str), bytes, or a PIL Image object.
            detail (int): 0 for simple text list, 1 for detailed output (boxes, text, conf).

        Returns:
            list: The extracted text or detailed results.
        """
        try:
            image_to_process = None

            # Handle different input types
            if isinstance(image_input, str):
                if not os.path.exists(image_input):
                    raise FileNotFoundError(f"Image file not found: {image_input}")
                image_to_process = image_input # EasyOCR handles paths directly

            elif isinstance(image_input, bytes):
                # Convert bytes to numpy array via Pillow
                image = Image.open(io.BytesIO(image_input))
                image_to_process = np.array(image)

            elif isinstance(image_input, Image.Image):
                image_to_process = np.array(image_input)

            else:
                raise ValueError("Unsupported image input type. Use file path, bytes, or PIL Image.")

            # Perform OCR
            result = self.reader.readtext(image_to_process, detail=detail)

            return result

        except Exception as e:
            print(f"Error during OCR processing: {e}")
            raise e

    def get_text_only(self, result):
        """Helper to join simple text list into a single string."""
        if isinstance(result, list) and len(result) > 0:
            if isinstance(result[0], str):
                return " ".join(result)
            elif isinstance(result[0], (list, tuple)):
                # Detail=1 format: ([[x,y],...], 'text', conf)
                return " ".join([item[1] for item in result])
        return ""
