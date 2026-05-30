import json
import os
import sys
import subprocess
import webbrowser
import threading
import time

def open_file_or_folder(path):
    if sys.platform == "win32":
        os.startfile(path)
    elif sys.platform == "darwin":
        subprocess.call(["open", path])
    else:
        subprocess.call(["xdg-open", path])
from backend.database.database import SessionLocal
from backend.database.models import Workspace

class WorkspaceManager:
    def __init__(self):
        pass

    def get_all_workspaces(self):
        db = SessionLocal()
        workspaces = db.query(Workspace).all()
        db.close()
        return [
            {
                "id": ws.id,
                "name": ws.name,
                "config": json.loads(ws.config_json)
            } for ws in workspaces
        ]

    def create_workspace(self, name, config):
        db = SessionLocal()
        ws = Workspace(name=name, config_json=json.dumps(config))
        db.add(ws)
        db.commit()
        db.close()
        return {"status": "success", "message": f"Workspace '{name}' created."}

    def delete_workspace(self, workspace_id):
        db = SessionLocal()
        ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        if ws:
            db.delete(ws)
            db.commit()
            db.close()
            return {"status": "success"}
        db.close()
        return {"status": "error", "message": "Not found"}

    def launch_workspace(self, workspace_id):
        db = SessionLocal()
        ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
        db.close()
        
        if not ws:
            return {"status": "error", "message": "Workspace not found"}

        config = json.loads(ws.config_json)
        
        # Run launch in a background thread to avoid blocking API
        threading.Thread(target=self._execute_launch, args=(config,), daemon=True).start()
        
        return {"status": "success", "message": f"Launching '{ws.name}'..."}

    def _execute_launch(self, config):
        from backend.config import load_settings
        settings = load_settings()
        delay = settings.get("delayBetweenLaunches", 1.5)
        
        # 1. Launch websites
        websites = config.get("websites", [])
        if websites:
            for url in websites:
                webbrowser.open(url)
                time.sleep(0.5)
        
        # 2. Open Folders
        folders = config.get("folders", [])
        for folder in folders:
            if os.path.exists(folder):
                try:
                    open_file_or_folder(folder)
                    time.sleep(0.5)
                except Exception as e:
                    print(f"Failed to open folder {folder}: {e}")

        # 3. Launch Applications
        apps = config.get("applications", [])
        for app in apps:
            app = app.strip()
            if not app: continue
            
            # Clean path just in case they copied as path (which adds outer quotes)
            clean_path = app
            if clean_path.startswith('"') and clean_path.endswith('"'):
                clean_path = clean_path[1:-1]
            elif clean_path.startswith("'") and clean_path.endswith("'"):
                clean_path = clean_path[1:-1]
            
            try:
                if os.path.exists(clean_path):
                    # Open the valid file, executable, shortcut (.lnk), or folder natively
                    open_file_or_folder(clean_path)
                    time.sleep(delay)
                else:
                    # If path doesn't exist, it might be a system command in PATH or contain arguments
                    subprocess.Popen(app, shell=True)
                    time.sleep(delay)
            except Exception as e:
                print(f"Failed to launch {app}: {e}")

        # Send notification when done
        from backend.notifications.notifier import notifier
        notifier.send("Workspace Launched", "All applications and websites have been successfully started.")

manager = WorkspaceManager()
