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

index_html_paths = [
    os.path.join(root_dir, 'dist', 'index.html'),
    os.path.join(root_dir, 'frontend', 'dist', 'index.html')
]

async def app(scope, receive, send):
    if scope.get("type") == "http":
        headers = dict(scope.get("headers", []))
        
        forwarded_uri = headers.get(b"x-forwarded-uri", b"").decode("utf-8").split("?")[0]
        real_url = headers.get(b"x-real-url", b"").decode("utf-8").split("?")[0]
        
        target_path = ""
        if forwarded_uri and forwarded_uri.startswith("/api"):
            target_path = forwarded_uri
        elif real_url and real_url.startswith("/api"):
            target_path = real_url
        else:
            path = scope.get("path", "")
            if path.startswith("/api/index.py/"):
                target_path = path[13:]
            elif path.startswith("/api/index.py"):
                target_path = path[13:] or "/"
            elif path.startswith("/api/index/"):
                target_path = path[10:]
            else:
                target_path = path

        if target_path != "/" and not target_path.startswith("/api"):
            target_path = f"/api{target_path}"

        scope["path"] = target_path

    await fastapi_app(scope, receive, send)






