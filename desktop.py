"""
XENON desktop launcher: starts the FastAPI backend and opens the UI in an app-style window.

Uses Microsoft Edge or Google Chrome in --app mode (no extra Python GUI wheels).

Prerequisite: build the UI once:
  cd frontend
  npm install
  npm run build
"""
import os
import socket
import subprocess
import sys
import threading
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "backend")
DIST_INDEX = os.path.join(ROOT, "frontend", "dist", "index.html")


def _wait_port(host: str, port: int, timeout: float = 15.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1.0):
                return True
        except OSError:
            time.sleep(0.1)
    return False


def _launch_app_shell(url: str) -> bool:
    """Open Chromium/Edge in standalone app window (looks like a desktop app)."""
    candidates = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
    ]
    for exe in candidates:
        if exe and os.path.isfile(exe):
            try:
                subprocess.Popen(
                    [exe, f"--app={url}", "--new-window"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                return True
            except OSError:
                continue
    return False


def _open_ui_when_ready(url: str) -> None:
    if _wait_port("127.0.0.1", 8000):
        if not _launch_app_shell(url):
            import webbrowser

            print("Could not find Chrome or Edge; opening your default browser instead.")
            webbrowser.open(url)
    else:
        print("Backend did not start on port 8000.")


def main() -> None:
    if not os.path.isfile(DIST_INDEX):
        print("Missing frontend build. Run:")
        print('  cd "frontend" && npm install && npm run build')
        sys.exit(1)

    os.chdir(BACKEND)
    if BACKEND not in sys.path:
        sys.path.insert(0, BACKEND)

    import uvicorn

    url = "http://127.0.0.1:8000/"
    threading.Thread(target=_open_ui_when_ready, args=(url,), daemon=True).start()

    print("Starting XENON desktop server on http://127.0.0.1:8000/ — press Ctrl+C to stop.")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False, log_level="info")


if __name__ == "__main__":
    main()
