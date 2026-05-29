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
        self.current_foreground_window = None

    def _get_active_window_title(self):
        try:
            import win32gui
            window = win32gui.GetForegroundWindow()
            title = win32gui.GetWindowText(window)
            return title
        except ImportError:
            return "win32gui not installed"
        except Exception:
            return "Unknown"

    def start(self):
        if not self.running:
            self.running = True
            self.thread_create = threading.Thread(target=self._wmi_create_loop, daemon=True)
            self.thread_delete = threading.Thread(target=self._wmi_delete_loop, daemon=True)
            self.thread_create.start()
            self.thread_delete.start()

    def stop(self):
        self.running = False

    def _wmi_create_loop(self):
        import wmi, pythoncom
        pythoncom.CoInitialize()
        c = wmi.WMI()
        process_watcher = c.Win32_Process.watch_for("creation")
        
        from backend.config import load_settings
        from backend.notifications.notifier import notifier

        while self.running:
            try:
                new_process = process_watcher(timeout_ms=2000)
                if new_process:
                    pid = int(new_process.ProcessId)
                    name = new_process.Name
                    exe = new_process.ExecutablePath
                    
                    # Focus Mode Check
                    settings = load_settings()
                    if settings.get("focusMode", False):
                        blocked = [app.strip().lower() for app in settings.get("blockedApps", "").split("\n") if app.strip()]
                        if name and name.lower() in blocked:
                            try:
                                import os, signal
                                os.kill(pid, signal.SIGTERM)
                                notifier.send("Focus Mode Active", f"Blocked distracting app: {name}", level="warning")
                                continue # Skip logging this killed process
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
            except wmi.x_wmi_timed_out:
                continue
            except Exception as e:
                print(f"WMI Create Error: {e}")

    def _wmi_delete_loop(self):
        import wmi, pythoncom
        pythoncom.CoInitialize()
        c = wmi.WMI()
        process_watcher = c.Win32_Process.watch_for("deletion")
        while self.running:
            try:
                deleted_process = process_watcher(timeout_ms=2000)
                if deleted_process:
                    pid = int(deleted_process.ProcessId)
                    if pid in self.active_processes:
                        proc_info = self.active_processes.pop(pid)
                        db = SessionLocal()
                        log = db.query(ProcessLog).filter(ProcessLog.id == proc_info["id"]).first()
                        if log:
                            log.end_time = datetime.utcnow()
                            log.duration_seconds = time.time() - proc_info["start_time"]
                            db.commit()
                        db.close()
            except wmi.x_wmi_timed_out:
                continue
            except Exception as e:
                print(f"WMI Delete Error: {e}")

monitor = ProcessMonitor()
