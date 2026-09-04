import os
import sys
import uvicorn

# Ensure backend directory is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Vasooli Tracker Backend Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
