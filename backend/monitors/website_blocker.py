import os
import ctypes

HOSTS_PATH = r"C:\Windows\System32\drivers\etc\hosts"
BLOCK_MARKER_START = "# --- NEXUS BLOCK START ---"
BLOCK_MARKER_END = "# --- NEXUS BLOCK END ---"

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def update_hosts_file(focus_mode: bool, blocked_websites: list):
    try:
        if not os.path.exists(HOSTS_PATH):
            return
            
        with open(HOSTS_PATH, 'r') as f:
            lines = f.readlines()

        # Remove existing blocks
        new_lines = []
        in_block = False
        for line in lines:
            if line.strip() == BLOCK_MARKER_START:
                in_block = True
                continue
            if line.strip() == BLOCK_MARKER_END:
                in_block = False
                continue
            if not in_block:
                new_lines.append(line)

        # Add new blocks if focus mode is on
        if focus_mode and blocked_websites:
            new_lines.append("\n" + BLOCK_MARKER_START + "\n")
            for site in blocked_websites:
                site = site.strip()
                if site:
                    # Block both raw and www subdomains for robustness
                    new_lines.append(f"127.0.0.1 {site}\n")
                    if not site.startswith("www."):
                        new_lines.append(f"127.0.0.1 www.{site}\n")
            new_lines.append(BLOCK_MARKER_END + "\n")

        # Write back to file
        with open(HOSTS_PATH, 'w') as f:
            f.writelines(new_lines)
            
        return True, "Hosts file updated successfully."
    except PermissionError:
        return False, "Permission Denied. Please run Nexus as Administrator to block websites."
    except Exception as e:
        return False, f"Failed to update hosts file: {str(e)}"
