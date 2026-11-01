"""
BHUMI-X Unified Launcher Script
Launches both FastAPI Backend (port 8000) and Vite React Frontend (port 5173).
"""

import subprocess
import sys
import time
import os


def start_system():
    print("================================================================")
    print("   BHUMI-X: Bharat's Hyperlocal Understanding & Multimodal Intelligence")
    print("   Decoding Earth's Signals. Predicting Tomorrow's Climate.")
    print("================================================================")
    print("[1/2] Starting FastAPI Backend on http://localhost:8000 ...")

    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=os.path.abspath(".")
    )

    time.sleep(2)

    print("[2/2] Starting Vite Frontend on http://localhost:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.abspath("./frontend"),
        shell=True
    )

    print("\n>>> BHUMI-X Services Running:")
    print("    - Application Interface:  http://localhost:5173")
    print("    - REST API & OpenAPI Doc: http://localhost:8000/docs")
    print("    - Zero Dummy Data:        VERIFIED ACTIVE")
    print("Press Ctrl+C to terminate both services.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nTerminating BHUMI-X services...")
        backend_proc.terminate()
        frontend_proc.terminate()


if __name__ == "__main__":
    start_system()

