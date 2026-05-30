# Nexus - Personal System Monitoring & Workspace Automation Dashboard

Nexus is a modern, locally-hosted desktop monitoring and automation platform for Windows. It provides real-time system performance tracking, application usage analytics, file system monitoring, and a robust "Workspace Automation" launcher—all wrapped in a beautiful Windows 11-inspired glassmorphism UI.

## 🌟 Features

- **System Startup Service**: Runs silently in the background and minimizes to the system tray.
- **Process & Performance Monitoring**: Tracks CPU, RAM, and application usage in real-time using `psutil`. Allows killing rogue processes directly from the dashboard.
- **File System Monitoring**: Tracks created, modified, and deleted files using `watchdog`.
- **Productivity Tracking**: An analytics dashboard to see exactly where you spend your time.
- **Smart Workspace Automation**: A bulk launcher for grouping and opening websites, applications, and directories with a single click. Includes automated focus modes.
- **Modern Dashboard UI**: Built with React, Vite, TailwindCSS, and Framer Motion for a sleek, responsive, and animated user interface.
- **100% Offline & Private**: All data is stored locally in an SQLite database. Nothing is sent to the cloud.

## 🛠 Tech Stack

- **Backend**: Python 3, FastAPI, SQLite3, `psutil`, `watchdog`
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Recharts
- **Desktop Wrapper**: Electron (for seamless desktop integration)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Git](https://git-scm.com/)
- [Python 3.8+](https://www.python.org/downloads/) (Ensure Python is added to your PATH)
- [Node.js](https://nodejs.org/) (v16 or higher)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

*(Note: The `.gitignore` is configured to ignore local databases and settings, so cloning this repo gives you a fresh start!)*

### 2. Backend Setup

The backend is built with Python and FastAPI.

```bash
# Navigate to the backend directory
cd backend

# (Optional but recommended) Create a virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install the required dependencies
pip install -r requirements.txt

# Go back to the root directory
cd ..
```

### 3. Frontend Setup

The frontend is built with React and packaged as a desktop app using Electron.

```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Go back to the root directory
cd ..
```

## 🎮 Running the Application

### The Easy Way (Windows)

We've included a batch script to start both the Python backend and the Electron frontend simultaneously:

```bash
# Just double-click the file in File Explorer, or run in terminal:
start_nexus.bat
```

### The Manual Way

If you prefer to start the services separately (great for debugging):

**Terminal 1 (Backend):**
```bash
# Starts the FastAPI server on port 8000
python start_backend.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
# Starts the Vite dev server and opens the Electron window
npm run electron:dev
```

## 📁 Project Structure

```text
nexus-monitoring/
├── backend/
│   ├── database/       # SQLite schema and query logic
│   ├── monitors/       # File and Process tracking workers
│   ├── analytics/      # Usage insights generation
│   ├── automation/     # Workspace Launcher and Focus Mode logic
│   ├── notifications/  # Desktop notifier service
│   ├── api/            # FastAPI endpoints and routing
│   └── config.py       # Configuration management
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI pieces (Dashboard, Analytics, etc.)
│   │   └── App.jsx     # Main React application
│   ├── main.cjs        # Electron desktop entry point
│   ├── package.json    # Frontend dependencies and scripts
│   └── tailwind.config.js
├── system_monitor.db   # (Ignored) Auto-generated local SQLite DB
├── settings.json       # (Ignored) Your local configuration
├── start_backend.py    # Python API entrypoint
└── start_nexus.bat     # Quick startup script for Windows
```

## 🔒 Privacy & Data

This application operates completely offline. All your data—including process history, file changes, productivity statistics, and custom workspaces—are stored strictly on your local machine in the `system_monitor.db` file. 

The `.gitignore` file is intentionally set up to ignore `system_monitor.db` and `settings.json` so your personal data is never uploaded to version control.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the project, please fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
