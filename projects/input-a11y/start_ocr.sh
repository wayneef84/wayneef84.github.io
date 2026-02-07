#!/bin/bash
echo "Starting Input A11y Offline OCR..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install it."
    exit 1
fi

# Setup Venv
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/installed" ]; then
    echo "Installing dependencies..."
    pip install -r python-ocr/requirements.txt
    touch venv/installed
fi

# Start Server
echo "Starting OCR Server..."
python python-ocr/app.py &
SERVER_PID=$!

sleep 5

# Open Browser
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Please open index.html in your browser."
fi

echo "Server is running (PID: $SERVER_PID). Press Ctrl+C to stop."
wait $SERVER_PID
