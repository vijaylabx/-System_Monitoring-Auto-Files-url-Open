import threading
from backend.config import load_settings

class Notifier:
    def __init__(self):
        self.pending_notifications = []

    def send(self, title, message, level="info"):
        self.pending_notifications.append({
            "title": title,
            "message": message,
            "level": level
        })
        
        # Fire native Windows notification if enabled
        settings = load_settings()
        if settings.get("notifications", True):
            threading.Thread(target=self._push_native, args=(title, message), daemon=True).start()

    def _push_native(self, title, message):
        try:
            from plyer import notification
            notification.notify(
                title=title,
                message=message,
                app_name="Nexus System Monitor",
                timeout=5
            )
        except Exception as e:
            print(f"Failed to push native notification: {e}")

    def get_pending(self):
        # Fetch and clear
        nots = self.pending_notifications.copy()
        self.pending_notifications.clear()
        return nots

notifier = Notifier()
