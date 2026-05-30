#!/bin/bash
echo "Starting Nexus System Monitor & Automation Dashboard..."

# Function to run in a new terminal window depending on OS
open_terminal() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)' && $1\""
    elif command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$(pwd)' && $1; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e bash -c "cd '$(pwd)' && $1; exec bash" &
    else
        # Fallback to run in background in the same terminal
        bash -c "cd '$(pwd)' && $1" &
    fi
}

# Start Backend
echo "Starting Backend..."
open_terminal "cd backend && pip install -r requirements.txt && python ../start_backend.py"

# Wait for backend to initialize
sleep 5

# Start Frontend (Electron)
echo "Starting Frontend..."
open_terminal "cd frontend && npm install && npm run electron:dev"

echo "Nexus is starting up in separate windows!"
