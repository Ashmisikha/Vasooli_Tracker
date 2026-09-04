import sys
import os

# Ensure root and backend directory are in Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, 'backend')

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.responses import FileResponse
from app.main import app as fastapi_app

def get_index_html_path():
    candidates = [
        os.path.join(root_dir, 'frontend', 'dist', 'index.html'),
        os.path.join(root_dir, 'dist', 'index.html'),
        os.path.join(root_dir, 'index.html'),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

async def app(scope, receive, send):
    if scope.get("type") == "http":
        headers = dict(scope.get("headers", []))
        
        forwarded_uri = headers.get(b"x-forwarded-uri", b"").decode("utf-8").split("?")[0]
        real_url = headers.get(b"x-real-url", b"").decode("utf-8").split("?")[0]
        raw_path = scope.get("path", "")
        
        req_path = forwarded_uri or real_url
        
        if req_path:
            is_api = req_path.startswith("/api")
            target_path = req_path
        else:
            if raw_path.startswith("/api/index.py/"):
                target_path = raw_path[13:]
            elif raw_path.startswith("/api/index.py"):
                target_path = raw_path[13:] or "/"
            elif raw_path.startswith("/api/index/"):
                target_path = raw_path[10:]
            else:
                target_path = raw_path
            is_api = target_path.startswith("/api")

        if is_api:
            if not target_path.startswith("/api"):
                target_path = f"/api{target_path}"
            scope["path"] = target_path
            await fastapi_app(scope, receive, send)
            return

        index_path = get_index_html_path()
        if index_path:
            response = FileResponse(index_path)
            await response(scope, receive, send)
            return

    await fastapi_app(scope, receive, send)
