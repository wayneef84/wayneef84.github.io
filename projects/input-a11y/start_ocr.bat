@echo off
echo Starting Input A11y Offline OCR...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8+ from python.org.
    pause
    exit /b
)

REM Setup Virtual Environment if not exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate Virtual Environment
call venv\\Scripts\\activate.bat

REM Install dependencies
if not exist "venv\\installed" (
    echo Installing dependencies (this may take a while for the first time)...
    pip install -r python-ocr\\requirements.txt
    type nul > venv\\installed
)

REM Start OCR Server in a new window
echo Starting OCR Server...
start "Input A11y OCR Server" python python-ocr\\app.py

REM Wait a moment for server to start
timeout /t 5 >nul

REM Open the Web App
echo Opening Web App...
start index.html

echo Done! The server is running in the background window.
