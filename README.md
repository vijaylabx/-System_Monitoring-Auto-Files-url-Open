# Nexus - Personal System Monitoring & Workspace Automation Dashboard

A modern desktop monitoring and automation platform for Windows.

## Features
- **System Startup Service**: Runs silently in background, minmizes to tray.
- **File System Monitoring**: Tracks created, modified, deleted files using watchdog.
- **Process Monitoring**: Tracks CPU, RAM, and application usage using psutil.
- **Smart Workspace Automation**: A bulk launcher for websites, applications, and folders.
- **Productivity Tracking**: Analytics dashboard to see where you spend your time.
- **Modern Dashboard UI**: Built with React, TailwindCSS, and Framer Motion for a Windows 11 inspired glassmorphism design.

## Project Structure
```text
project/
├── backend/
│   ├── database/ (SQLite schema and logic)
│   ├── monitors/ (File and Process tracking)
│   ├── analytics/ (AI-style insights)
│   ├── automation/ (Workspace Launcher)
│   ├── notifications/ (Notifier service)
│   └── api/ (FastAPI endpoints)
├── frontend/ (React + Vite + Electron + Tailwind)
│   ├── src/
│   │   ├── components/ (Dashboard, Workspaces, Analytics, etc.)
│   │   └── App.jsx
│   └── main.cjs (Electron entry point)
├── system_monitor.db (Auto-generated SQLite DB)
├── start_backend.py (Python entrypoint)
└── start_nexus.bat (Quick startup script)
```

## Installation & Setup

1. **Backend Setup**
   Ensure Python 3.8+ is installed.
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Frontend Setup**
   Ensure Node.js is installed.
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

You can easily start everything with the batch script:
```bash
./start_nexus.bat
```

Alternatively, you can run them separately:
- **Backend**: `python start_backend.py`
- **Frontend (Electron)**: `cd frontend && npm run electron:dev`

## Security & Privacy
This application operates completely offline. All data, including process history, file changes, and productivity statistics, are stored locally in the `system_monitor.db` SQLite database. No cloud services are used.
