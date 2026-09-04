import sys
import os

# Ensure project root and backend directory are in Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, 'backend')

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app as fastapi_app
    app = fastapi_app
except Exception as e:
    import traceback
    err_tb = traceback.format_exc()
    print(f"[API Index Import Error]: {e}\n{err_tb}")
    
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Serverless Import Error",
                "details": str(e),
                "traceback": err_tb.splitlines()[-6:]
            }
        )
