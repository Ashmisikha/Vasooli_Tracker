from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import (
    auth_router, watchlists_router, analysis_router,
    market_router, analysis_meta_router, stocks_router,
    news_router, profile_router, watchlist_changes_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json"
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

@app.get("/")
async def root():
    return {"message": "Welcome to Vasooli Tracker API - Delta & Context Engine"}
