#!/bin/bash

# Dad's Casino - Local Server Launcher
# This script starts a local web server from the root to test full navigation

echo "🎰 Starting Dad's Casino Local Server..."
echo ""
echo "Main Menu: http://localhost:8000"
echo "Sprunki: http://localhost:8000/games/sprunki/index.html"
echo "Slots: http://localhost:8000/games/slots.html"
echo ""
echo "Press CTRL+C to stop the server when done."
echo ""

# Navigate to the project root (two levels up from sprunki folder)
cd "$(dirname "$0")/../.."

# Start Python HTTP server and open browser to main menu
open "http://localhost:8000" 2>/dev/null || echo "Please open: http://localhost:8000"
python3 -m http.server 8000
