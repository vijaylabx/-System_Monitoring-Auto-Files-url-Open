import os
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from backend.database.database import SessionLocal
from backend.database.models import FileLog

class DBLoggingEventHandler(FileSystemEventHandler):
    def log_event(self, event_type, path, is_directory):
        try:
            db = SessionLocal()
            log = FileLog(
                file_path=path,
                event_type=event_type,
                is_directory=is_directory
            )
            db.add(log)
            db.commit()
            db.close()
        except Exception as e:
            print(f"File log error: {e}")

    def on_created(self, event):
        self.log_event("created", event.src_path, event.is_directory)

    def on_deleted(self, event):
        self.log_event("deleted", event.src_path, event.is_directory)

    def on_modified(self, event):
        self.log_event("modified", event.src_path, event.is_directory)

    def on_moved(self, event):
        self.log_event("renamed", event.dest_path, event.is_directory)


class FileMonitor:
    def __init__(self, paths_to_watch=None):
        self.observer = Observer()
        self.paths = paths_to_watch or [os.path.expanduser("~/Documents")] # default watch Documents
        self.event_handler = DBLoggingEventHandler()

    def start(self):
        for path in self.paths:
            if os.path.exists(path):
                self.observer.schedule(self.event_handler, path, recursive=True)
        self.observer.start()

    def stop(self):
        self.observer.stop()
        self.observer.join()

monitor = FileMonitor()
