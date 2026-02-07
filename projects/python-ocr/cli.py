import argparse
import sys
from ocr_lib import OCRProcessor

def main():
    parser = argparse.ArgumentParser(description="Extract text from an image using EasyOCR (Offline).")
    parser.add_argument("image_path", help="Path to the image file you want to scan.")
    parser.add_argument("--gpu", action="store_true", help="Enable GPU acceleration (requires CUDA).")
    parser.add_argument("--langs", nargs='+', default=['en'], help="List of languages to detect (default: en).")
    parser.add_argument("--detail", action="store_true", help="Show detailed output (coordinates and confidence).")

    args = parser.parse_args()

    try:
        print(f"Loading OCR engine (Languages: {args.langs})...")
        processor = OCRProcessor(languages=args.langs, use_gpu=args.gpu)

        print(f"Processing image: {args.image_path}...")
        detail_level = 1 if args.detail else 0
        result = processor.process_image(args.image_path, detail=detail_level)

        print("\n" + "=" * 40)
        print("   EXTRACTED TEXT")
        print("=" * 40 + "\n")

        if args.detail:
            for (bbox, text, prob) in result:
                print(f"[Confidence: {prob:.2f}] {text}")
                # print(f"  Box: {bbox}")
        else:
            # Simple text output
            full_text = " ".join(result)
            print(full_text)

        print("\n" + "=" * 40)

    except Exception as e:
        print(f"\nERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
