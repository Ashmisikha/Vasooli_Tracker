from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.routes import (
    auth_router, watchlists_router, analysis_router,
    market_router, analysis_meta_router, stocks_router,
    news_router, profile_router, watchlist_changes_router
)

import app.models  # noqa: F401 register models for metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (especially for SQLite in /tmp)
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[DB Startup Warning]: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    print(f"[Global Exception Handler]: {error_msg}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "path": str(request.url)}
    )

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(watchlists_router, prefix="/api/v1/watchlists", tags=["watchlists"])
app.include_router(analysis_router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(market_router, prefix="/api/v1/market", tags=["market"])
app.include_router(analysis_meta_router, prefix="/api/v1/market-analysis", tags=["market-analysis"])
app.include_router(stocks_router, prefix="/api/v1/stocks", tags=["stocks"])
app.include_router(news_router, prefix="/api/v1/news", tags=["news"])
app.include_router(profile_router, prefix="/api/v1/profile", tags=["profile"])
app.include_router(watchlist_changes_router, prefix="/api/v1/watchlist", tags=["watchlist-changes"])

@app.post("/api/v1/refresh")
async def refresh_etl():
    from app.core.stock_catalog import refresh_catalog
    refresh_catalog()
    return {"success": True, "message": "ETL pipeline refreshed"}

@app.get("/api")
@app.get("/api/v1")
@app.get("/api/v1/health")
async def root():
    return {"status": "ok", "message": "Welcome to Vasooli Tracker API - Delta & Context Engine"}


