from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import time
from pathlib import Path
import asyncio
import hashlib
import shutil
import json
import subprocess
import sys
try:
    from dotenv import load_dotenv

    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
except ImportError:
    pass

from database import db_controller
from email_service import send_password_reset_email
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from plyer import notification


app = FastAPI(title="XENON Security")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Scanning Configuration ---
QUARANTINE_DIR = os.path.expanduser("~/XENON_Quarantine")
os.makedirs(QUARANTINE_DIR, exist_ok=True)

# Malware Signatures
KNOWN_MALWARE_HASHES = {
    "4d6f6e8c89c4ad306d8a36814b7e8de1ea1fde1f52b75f80b85295c52bb776df": "Test_Malware_Signature",
    "950005d539ecb787dc4fc225b2f27329f6de3c9f28d5d4d380f7bb0d2a8b9eeb": "Test_Malware_Signature_2",
    "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f": "EICAR-Test-File"
}

def load_malware_hashes():
    """Downloads recent malware hashes from Abuse.ch to bolster detection."""
    url = "https://bazaar.abuse.ch/export/txt/sha256/recent/"
    try:
        import urllib.request
        print("[Shield-X] Downloading advanced threat signatures...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode('utf-8')
            lines = content.splitlines()
            count = 0
            for line in lines:
                line = line.strip()
                if line and not line.startswith('#'):
                    KNOWN_MALWARE_HASHES[line.lower()] = "MalwareBazaar_Signature"
                    count += 1
            print(f"[Shield-X] Successfully loaded {count} advanced threat signatures.")
    except Exception as e:
        print(f"[Shield-X] Warning: Failed to download advanced signatures: {e}")

def calculate_sha256(filepath):
    try:
        if not os.path.isfile(filepath):
            return None
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception:
        return None

def quarantine_file(filepath):
    """Moves a detected threat to the quarantine folder."""
    try:
        if not os.path.exists(filepath):
            return False
        filename = os.path.basename(filepath)
        timestamp = int(time.time())
        quarantine_path = os.path.join(QUARANTINE_DIR, f"{filename}_{timestamp}.quarantine")
        shutil.move(filepath, quarantine_path)
        return True
    except Exception as e:
        print(f"[Error] Failed to quarantine {filepath}: {e}")
        return False

# --- Real-Time Protection (Background Observer) ---
class RealTimeScanHandler(FileSystemEventHandler):
    def on_created(self, event):
        self._process_event(event)

    def on_modified(self, event):
        self._process_event(event)

    def _process_event(self, event):
        if event.is_directory:
            return
        filepath = event.src_path
        time.sleep(0.5) # Wait for file write completion
        
        filename = os.path.basename(filepath)
        file_lower = filename.lower()
        is_malware = False
        
        # Check extensions
        if file_lower.endswith(".locked") or file_lower.endswith(".crypto") or file_lower.endswith(".enc"):
            is_malware = True
        elif ".txt.exe" in file_lower or ".doc.exe" in file_lower or ".pdf.exe" in file_lower:
            is_malware = True

        file_hash = calculate_sha256(filepath)
        if (file_hash and file_hash in KNOWN_MALWARE_HASHES) or is_malware:
            print(f"\n[REAL-TIME ALERT] Threat detected: {filepath}")
            if quarantine_file(filepath):
                print(f"[REAL-TIME ALERT] Successfully quarantined: {filepath}\n")
                
                # Send Desktop Native Pop-up Notification
                malware_name = KNOWN_MALWARE_HASHES.get(file_hash, "Suspicious File") if file_hash else "Suspicious File"
                try:
                    notification.notify(
                        title="Xenon Security Alert",
                        message=f"Malicious download blocked: {filename}\nThreat: {malware_name}",
                        app_name="Xenon Web Shield",
                        timeout=10
                    )
                except Exception as e:
                    print(f"[Shield-X] Failed to send desktop notification: {e}")

real_time_observer = Observer()

@app.on_event("startup")
def startup_event():
    # Load advanced threat signatures on startup asynchronously
    asyncio.create_task(asyncio.to_thread(load_malware_hashes))

    downloads_folder = os.path.expanduser("~/Downloads")
    if os.path.exists(downloads_folder):
        handler = RealTimeScanHandler()
        real_time_observer.schedule(handler, downloads_folder, recursive=False)
        real_time_observer.start()
        print(f"\n[Shield-X] Real-Time Protection started on: {downloads_folder}\n")

@app.on_event("shutdown")
def shutdown_event():
    real_time_observer.stop()
    real_time_observer.join()
    print("[Shield-X] Real-Time Protection stopped.")

# --- Pydantic Models ---
class UserAuth(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


class ForgotPasswordBody(BaseModel):
    email: str


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str


PUBLIC_APP_URL = os.environ.get("APP_PUBLIC_URL", "http://127.0.0.1:8000").rstrip("/")

# --- Authentication Routes ---
@app.post("/api/auth/register")
def register(user: UserCreate):
    success, message = db_controller.create_user(user.first_name, user.last_name, user.email, user.password)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@app.post("/api/auth/login")
def login(user: UserAuth):
    success, data = db_controller.authenticate_user(user.email, user.password)
    if not success:
        raise HTTPException(status_code=401, detail=data)
    return {"message": "Login successful", "user": data}


def _enqueue_reset_email(to_email: str, reset_link: str) -> None:
    ok, err = send_password_reset_email(to_email, reset_link)
    if not ok:
        print(f"[XENON] Failed to send reset email: {err}")


@app.post("/api/auth/forgot-password")
def forgot_password(body: ForgotPasswordBody, background_tasks: BackgroundTasks):
    ok, plain_token, err = db_controller.create_password_reset_request(body.email)
    if not ok:
        raise HTTPException(status_code=503, detail=err or "Database unavailable.")
    if plain_token:
        link = f"{PUBLIC_APP_URL}/reset-password?token={plain_token}"
        background_tasks.add_task(_enqueue_reset_email, body.email.strip().lower(), link)
    return {
        "message": "If an account exists for that email, you will receive password reset instructions shortly."
    }


@app.get("/api/auth/reset/verify")
def verify_reset_token(token: str = Query(..., min_length=8)):
    ok, email, err = db_controller.verify_reset_token(token)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
    return {"valid": True, "email": email}


@app.post("/api/auth/reset-password")
def reset_password(body: ResetPasswordBody):
    ok, msg = db_controller.reset_password_with_token(body.token.strip(), body.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}


# --- Scanning Routes ---

@app.get("/api/scan/url")
def scan_url(url: str):
    """Checks a given URL against a basic heuristics blocklist."""
    url_lower = url.lower()
    
    # Basic list of suspicious keywords/domains for demonstration
    suspicious_keywords = ["malicious", "phishing", "steal", "fake-login", "bad-domain"]
    blocked_domains = ["example-malware.com", "test-phishing.net", "eicar.org"]
    
    is_malicious = False
    reason = ""
    
    for domain in blocked_domains:
        if domain in url_lower:
            is_malicious = True
            reason = f"Domain matched blocked list: {domain}"
            break
            
    if not is_malicious:
        for keyword in suspicious_keywords:
            if keyword in url_lower:
                is_malicious = True
                reason = f"Suspicious keyword detected: {keyword}"
                break
                
    # Provide a test URL that always blocks
    if "xenon-test-malware.com" in url_lower:
        is_malicious = True
        reason = "Test Malware Domain"

    return {
        "url": url,
        "is_malicious": is_malicious,
        "reason": reason
    }

@app.get("/api/scan/select-folder")
async def select_folder():
    script = """\
import tkinter as tk
from tkinter import filedialog
root = tk.Tk()
root.withdraw()
root.wm_attributes('-topmost', 1)
folder_path = filedialog.askdirectory(title='Select Target Folder')
print(folder_path)
"""
    try:
        result = await asyncio.to_thread(subprocess.check_output, [sys.executable, "-c", script], text=True)
        return {"path": result.strip()}
    except Exception as e:
        return {"error": str(e), "path": ""}

@app.websocket("/api/scan/ws")
async def scan_websocket(websocket: WebSocket):
    await websocket.accept()
    
    try:
        data = await websocket.receive_text()
        req = json.loads(data)
        
        if req.get("action") == "start":
            scan_type = req.get("scan_type", "Quick Scan")
            custom_path = req.get("custom_path", "")
            
            stats = {"scanned_files": 0, "threats": 0, "quarantined": 0, "progress": 0}
            
            search_paths = []
            if scan_type == "Full Scan":
                search_paths = [os.path.expanduser("~")]
            elif scan_type == "Custom Scan" and custom_path:
                search_paths = [custom_path]
            elif scan_type == "Custom Scan":
                await websocket.send_json({**stats, "progress": 100, "status": "Error: No path provided.", "complete": True})
                return
            else:
                search_paths = [os.path.expanduser("~/Downloads"), os.path.expanduser("~/Documents")]

            # Phase 1: Counting
            await websocket.send_json({**stats, "status": "Preparing scan..."})
            total_files = 0
            for path in search_paths:
                if os.path.exists(path):
                    for _, _, files in os.walk(path):
                        total_files += len(files)
            
            if total_files == 0:
                await websocket.send_json({**stats, "progress": 100, "status": "No files found.", "complete": True})
                return

            # Phase 2: Scanning & Real-time Malware Detection Logic
            for path in search_paths:
                if not os.path.exists(path): continue
                for root, _, files in os.walk(path):
                    for file in files:
                        filepath = os.path.join(root, file)
                        stats["scanned_files"] += 1
                        stats["progress"] = int((stats["scanned_files"] / total_files) * 100)
                        
                        # --- Malware Detection Core ---
                        file_hash = calculate_sha256(filepath)
                        is_malware = False
                        
                        file_lower = file.lower()
                        heuristic_name = ""
                        
                        # Basic heuristics: suspicious extensions
                        if file_lower.endswith(".locked") or file_lower.endswith(".crypto") or file_lower.endswith(".enc"):
                            is_malware = True
                            heuristic_name = "Heuristic-Ransomware"
                        elif ".txt.exe" in file_lower or ".doc.exe" in file_lower or ".pdf.exe" in file_lower:
                            is_malware = True
                            heuristic_name = "Heuristic-Double-Ext"
                        
                        if (file_hash and file_hash in KNOWN_MALWARE_HASHES) or is_malware:
                            is_malware = True
                            stats["threats"] += 1
                            
                            malware_name = KNOWN_MALWARE_HASHES.get(file_hash, heuristic_name)
                            
                            # Move to quarantine
                            if quarantine_file(filepath):
                                stats["quarantined"] += 1
                                status_msg = f"THREAT DETECTED ({malware_name}) & QUARANTINED: {file}"
                            else:
                                status_msg = f"THREAT DETECTED ({malware_name}) (Quarantine Failed): {file}"
                        else:
                            status_msg = f"Scanning: {file}"

                        # Throttled updates to UI (every 10 files or on threat)
                        if stats["scanned_files"] % 10 == 0 or is_malware or stats["scanned_files"] == total_files:
                            await websocket.send_json({
                                "progress": stats["progress"],
                                "scanned_files": stats["scanned_files"],
                                "threats": stats["threats"],
                                "quarantined": stats["quarantined"],
                                "status": status_msg
                            })
                            await asyncio.sleep(0.005) 

            # Final Completion Signal
            await websocket.send_json({
                "progress": 100,
                "scanned_files": stats["scanned_files"],
                "threats": stats["threats"],
                "quarantined": stats["quarantined"],
                "status": f"Scan Finished. {stats['threats']} threats handled.",
                "complete": True
            })
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e), "complete": True})
    finally:
        try: await websocket.close()
        except: pass


# --- Bundled React UI (desktop / single-port deployment) ---
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_FRONTEND_DIST = os.path.normpath(os.path.join(_BACKEND_DIR, "..", "frontend", "dist"))


def _install_frontend_static_routes() -> None:
    assets_dir = os.path.join(_FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="spa_assets")

    @app.get("/")
    async def spa_root():
        index = os.path.join(_FRONTEND_DIST, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
        raise HTTPException(
            status_code=503,
            detail="Frontend not built. Run: cd frontend && npm run build",
        )

    @app.get("/{spa_path:path}")
    async def spa_shell(spa_path: str):
        if spa_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not found")
        base = Path(_FRONTEND_DIST).resolve()
        try:
            candidate = (base / spa_path).resolve()
        except (OSError, ValueError):
            raise HTTPException(status_code=404, detail="Not found")
        try:
            candidate.relative_to(base)
        except ValueError:
            raise HTTPException(status_code=404, detail="Not found")
        if candidate.is_file():
            return FileResponse(str(candidate))
        index = base / "index.html"
        if index.is_file():
            return FileResponse(str(index))
        raise HTTPException(
            status_code=503,
            detail="Frontend not built. Run: cd frontend && npm run build",
        )


_install_frontend_static_routes()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)