import json
import os

SETTINGS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "settings.json")

def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {
        "autoStart": True,
        "darkMode": True,
        "notifications": True,
        "delayBetweenLaunches": 1.5,
        "autoCleanup": True,
    }

def save_settings(data):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(data, f)
