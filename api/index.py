import sys
import os
from urllib.parse import urlparse

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

def extract_path(val: str) -> str:
    if not val:
        return ""
    val = val.split("?")[0]
    if val.startswith("http://") or val.startswith("https://"):
        return urlparse(val).path
    return val

async def app(scope, receive, send):
    if scope.get("type") == "http":
        headers = dict(scope.get("headers", []))
        
        forwarded_uri = extract_path(headers.get(b"x-forwarded-uri", b"").decode("utf-8"))
        real_url = extract_path(headers.get(b"x-real-url", b"").decode("utf-8"))
        raw_path = scope.get("path", "")
        
        req_path = ""
        if forwarded_uri and forwarded_uri not in ["/api/index.py", "/api/index"]:
            req_path = forwarded_uri
        elif real_url and real_url not in ["/api/index.py", "/api/index"]:
            req_path = real_url
        
        if not req_path:
            if raw_path.startswith("/api/index.py/"):
                req_path = f"/api/{raw_path[14:]}"
            elif raw_path.startswith("/api/index.py"):
                req_path = f"/api{raw_path[13:]}" if raw_path[13:] else "/"
            else:
                req_path = raw_path

        # If request path is an API endpoint, route to FastAPI
        if req_path.startswith("/api/") or req_path in ["/api", "/api/v1"]:
            if not req_path.startswith("/api"):
                req_path = f"/api{req_path}"
            scope["path"] = req_path
            await fastapi_app(scope, receive, send)
            return

        # Otherwise serve frontend React app (index.html)
        index_path = get_index_html_path()
        if index_path:
            response = FileResponse(index_path)
            await response(scope, receive, send)
            return

    await fastapi_app(scope, receive, send)
