import streamlit as st
import numpy as np
from PIL import Image
from ocr_lib import OCRProcessor

# Configure the page
st.set_page_config(page_title="Offline OCR Tool", page_icon="🔍", layout="centered")

st.title("🔍 Offline OCR Tool")
st.markdown("""
Run optical character recognition locally without external cloud APIs.
This tool uses **EasyOCR** (PyTorch) running entirely on your machine.
""")

# Sidebar Settings
st.sidebar.header("Configuration")

# GPU Toggle
use_gpu = st.sidebar.checkbox("Use GPU Acceleration", value=False, help="Requires CUDA-compatible GPU and PyTorch with CUDA support.")

# Language Selection
available_langs = ['en', 'ch_sim', 'ch_tra', 'fr', 'de', 'es', 'it', 'pt', 'ja', 'ko', 'ru', 'ar']
languages = st.sidebar.multiselect(
    "Select Languages",
    available_langs,
    default=['en'],
    help="Select the languages expected in the image."
)

# Caching the model loading to prevent reloading heavily on every interaction
# We use st.cache_resource for objects like ML models that should persist across reruns
@st.cache_resource(show_spinner=False)
def get_processor(langs, gpu):
    # This will only run if the arguments (langs, gpu) change
    return OCRProcessor(languages=langs, use_gpu=gpu)

# Main Interface
uploaded_file = st.file_uploader("Upload an Image", type=['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'])

if uploaded_file is not None:
    # Display the image
    try:
        image = Image.open(uploaded_file)
        st.image(image, caption='Source Image', use_container_width=True)

        # Action Button
        if st.button("Extract Text", type="primary"):
            if not languages:
                st.error("Please select at least one language in the sidebar.")
            else:
                with st.spinner("Loading model and extracting text..."):
                    try:
                        # Initialize or retrieve cached processor
                        processor = get_processor(languages, use_gpu)

                        # Process
                        # Note: The library expects PIL Image or bytes or path.
                        # We pass the PIL Image directly.
                        result = processor.process_image(image, detail=0)

                        full_text = " ".join(result)

                        st.success("Extraction Complete!")
                        st.subheader("Result:")
                        st.text_area("Editable Text", value=full_text, height=300)

                    except Exception as e:
                        st.error(f"An error occurred during processing: {str(e)}")

    except Exception as e:
        st.error(f"Error loading image: {e}")

st.markdown("---")
st.caption("Powered by EasyOCR & Streamlit. Runs locally in your browser session.")
