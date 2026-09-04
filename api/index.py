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
        
        target_path = ""
        if forwarded_uri and (forwarded_uri.startswith("/api") or forwarded_uri not in ["/", "/index.html"]):
            target_path = forwarded_uri
        elif real_url and (real_url.startswith("/api") or real_url not in ["/", "/index.html"]):
            target_path = real_url

        if not target_path or target_path in ["/", "/index.html"]:
            if raw_path.startswith("/api/index.py/"):
                target_path = raw_path[13:]
            elif raw_path.startswith("/api/index.py"):
                target_path = raw_path[13:]
            elif raw_path.startswith("/api/index/"):
                target_path = raw_path[10:]

        is_api = bool(target_path and target_path.startswith("/api"))

        if is_api:
            scope["path"] = target_path
            await fastapi_app(scope, receive, send)
            return

        index_path = get_index_html_path()
        if index_path:
            response = FileResponse(index_path)
            await response(scope, receive, send)
            return

    await fastapi_app(scope, receive, send)
