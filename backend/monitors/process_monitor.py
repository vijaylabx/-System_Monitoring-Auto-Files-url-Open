import psutil
import time
import threading
from datetime import datetime
from backend.database.database import SessionLocal
from backend.database.models import ProcessLog

class ProcessMonitor:
    def __init__(self):
        self.running = False
        self.thread = None
        self.active_processes = {}

    def _get_active_window_title(self):
        import sys
        if sys.platform == "win32":
            try:
                import win32gui
                window = win32gui.GetForegroundWindow()
                return win32gui.GetWindowText(window)
            except ImportError:
                return "win32gui not installed"
            except Exception:
                return "Unknown"
        return "Not Supported on OS"

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._polling_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False

    def _polling_loop(self):
        from backend.config import load_settings
        from backend.notifications.notifier import notifier

        while self.running:
            try:
                current_pids = set()
                # Poll processes
                for proc in psutil.process_iter(['pid', 'name', 'exe']):
                    try:
                        pid = proc.info['pid']
                        name = proc.info['name']
                        exe = proc.info['exe']
                        current_pids.add(pid)
                        
                        # New process detected
                        if pid not in self.active_processes:
                            # Focus Mode Check
                            settings = load_settings()
                            if settings.get("focusMode", False):
                                blocked = [app.strip().lower() for app in settings.get("blockedApps", "").split("\n") if app.strip()]
                                if name and name.lower() in blocked:
                                    try:
                                        import os, signal
                                        os.kill(pid, signal.SIGTERM)
                                        notifier.send("Focus Mode Active", f"Blocked distracting app: {name}", level="warning")
                                        continue
                                    except Exception as e:
                                        print(f"Failed to kill blocked app {name}: {e}")
                            
                            db = SessionLocal()
                            log = ProcessLog(pid=pid, name=name, exe=exe)
                            db.add(log)
                            db.commit()
                            db.refresh(log)
                            db.close()
                            
                            self.active_processes[pid] = {
                                "id": log.id,
                                "start_time": time.time(),
                                "name": name
                            }
                    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                        pass

                # Check for deleted processes
                active_keys = list(self.active_processes.keys())
                for pid in active_keys:
                    if pid not in current_pids:
                        proc_info = self.active_processes.pop(pid)
                        db = SessionLocal()
                        log = db.query(ProcessLog).filter(ProcessLog.id == proc_info["id"]).first()
                        if log:
                            log.end_time = datetime.utcnow()
                            log.duration_seconds = time.time() - proc_info["start_time"]
                            db.commit()
                        db.close()

                time.sleep(2)
            except Exception as e:
                print(f"Process Polling Error: {e}")
                time.sleep(2)

monitor = ProcessMonitor()
