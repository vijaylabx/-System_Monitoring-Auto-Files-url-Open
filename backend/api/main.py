from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.automation.workspace_manager import manager as ws_manager
from backend.analytics.insights import engine as analytics_engine
from backend.notifications.notifier import notifier
from backend.monitors.process_monitor import monitor as proc_monitor
from backend.monitors.file_monitor import monitor as file_monitor
from backend.monitors.website_blocker import update_hosts_file
import psutil
import time
from backend.config import load_settings, save_settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="System Monitor API")

last_net = psutil.net_io_counters()
last_net_time = time.time()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    proc_monitor.start()
    file_monitor.start()

    # Initial Hosts File Setup for Focus Mode
    settings = load_settings()
    focus_mode = settings.get("focusMode", False)
    blocked_websites = [s for s in settings.get("blockedWebsites", "").split("\n") if s.strip()]
    success, msg = update_hosts_file(focus_mode, blocked_websites)
    if not success:
        print(f"Warning: {msg}")

    # 1. Database Auto-Cleanup Routine
    import threading, schedule, time
    from datetime import datetime, timedelta
    from backend.database.database import SessionLocal
    from backend.database.models import ProcessLog, FileLog

    def cleanup_old_logs():
        try:
            db = SessionLocal()
            cutoff = datetime.utcnow() - timedelta(days=30)
            db.query(ProcessLog).filter(ProcessLog.start_time < cutoff).delete()
            db.query(FileLog).filter(FileLog.timestamp < cutoff).delete()
            db.commit()
            db.close()
            print("Cleanup task completed.")
        except Exception as e:
            print("Cleanup task failed:", e)

    # Run once at startup, then schedule daily
    cleanup_old_logs()
    schedule.every().day.do(cleanup_old_logs)

    def run_schedule():
        while True:
            schedule.run_pending()
            time.sleep(3600) # Check every hour

    threading.Thread(target=run_schedule, daemon=True).start()

@app.on_event("shutdown")
def shutdown_event():
    proc_monitor.stop()
    file_monitor.stop()

@app.get("/api/system/stats")
def get_system_stats():
    global last_net, last_net_time
    current_net = psutil.net_io_counters()
    current_time = time.time()
    
    dt = current_time - last_net_time
    if dt > 0:
        up_speed = (current_net.bytes_sent - last_net.bytes_sent) / dt
        down_speed = (current_net.bytes_recv - last_net.bytes_recv) / dt
    else:
        up_speed = 0
        down_speed = 0
        
    last_net = current_net
    last_net_time = current_time

    return {
        "cpu": psutil.cpu_percent(interval=None),
        "ram": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "net_up": round((up_speed * 8) / 1_000_000, 1),
        "net_down": round((down_speed * 8) / 1_000_000, 1)
    }

@app.get("/api/system/processes")
def get_live_processes():
    procs = []
    for proc in psutil.process_iter(['pid', 'name', 'memory_percent', 'cpu_percent']):
        try:
            procs.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    # Sort by memory percent and get top 10
    procs = sorted(procs, key=lambda p: p['memory_percent'] or 0, reverse=True)[:10]
    return procs

@app.get("/api/workspaces")
def get_workspaces():
    return ws_manager.get_all_workspaces()

@app.post("/api/workspaces")
def create_workspace(data: dict):
    return ws_manager.create_workspace(data.get("name"), data.get("config"))

@app.post("/api/workspaces/{workspace_id}/launch")
def launch_workspace(workspace_id: int):
    return ws_manager.launch_workspace(workspace_id)

@app.delete("/api/workspaces/{workspace_id}")
def delete_workspace(workspace_id: int):
    return ws_manager.delete_workspace(workspace_id)

@app.get("/api/analytics/summary")
def get_analytics_summary():
    return analytics_engine.get_daily_summary()

@app.get("/api/notifications/pending")
def get_pending_notifications():
    return notifier.get_pending()

@app.get("/api/settings")
def get_settings():
    return load_settings()
@app.delete("/api/system/database")
def wipe_database():
    try:
        db = SessionLocal()
        db.query(ProcessLog).delete()
        db.query(FileLog).delete()
        db.commit()
        db.close()
        notifier.send("Database Cleared", "All analytics data has been wiped.")
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
@app.post("/api/settings")
def update_settings(settings: dict):
    save_settings(settings)
    
    # Update Hosts file for Website Blocker
    focus_mode = settings.get("focusMode", False)
    blocked_websites = [s for s in settings.get("blockedWebsites", "").split("\n") if s.strip()]
    success, msg = update_hosts_file(focus_mode, blocked_websites)
    
    if not success:
        notifier.send("Settings Saved (Partial)", "App blocking active, but website blocking requires Administrator privileges.", level="warning")
    else:
        notifier.send("Settings Updated", "Your preferences and Focus Mode have been successfully saved.")
        
    return {"status": "success"}
