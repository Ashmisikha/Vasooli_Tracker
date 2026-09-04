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
        path = scope.get("path", "")
        if path.startswith("/api/index.py"):
            path = path[13:] or "/"
        elif path.startswith("/api/index"):
            path = path[10:] or "/"
        
        if path != "/" and not path.startswith("/api"):
            path = f"/api{path}"
            
        scope["path"] = path

    await fastapi_app(scope, receive, send)





