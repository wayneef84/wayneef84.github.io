@echo off
REM Dad's Casino - Local Server Launcher for Windows
REM This script starts a local web server from the root to test full navigation

echo.
echo 🎰 Starting Dad's Casino Local Server...
echo.
echo Main Menu: http://localhost:8000
echo Sprunki: http://localhost:8000/games/sprunki/index.html
echo Slots: http://localhost:8000/games/slots.html
echo.
echo Press CTRL+C to stop the server when done.
echo.

REM Navigate to the project root (two levels up from sprunki folder)
cd /d "%~dp0\..\..\"

REM Start Python HTTP server and open browser to main menu
start http://localhost:8000
python -m http.server 8000
