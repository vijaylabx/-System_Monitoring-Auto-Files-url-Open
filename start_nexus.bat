@echo off
echo Starting Nexus System Monitor ^& Automation Dashboard...

:: Start Backend
start cmd /k "cd backend && pip install -r requirements.txt && python ../start_backend.py"

:: Start Frontend (Electron)
timeout /t 5
start cmd /k "cd frontend && npm run electron:dev"
