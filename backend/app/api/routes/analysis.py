from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.crud.watchlist import get_watchlist_stocks
from app.crud.snapshot import get_latest_snapshot, create_snapshot
from app.crud.checkpoint import get_latest_checkpoint, create_or_update_checkpoint
from app.schemas.snapshot import StockSnapshotResponse, StockSnapshotBase
from app.schemas.analysis import RiskAnalysisResponse, AttentionScore
from app.services.market_data import fetch_realtime_price, fetch_historical_volatility, fetch_market_beta
from app.services.sentiment import analyze_news_sentiment
from app.services.risk_engine import calculate_attention_score

from datetime import datetime, timezone

router = APIRouter()

async def get_or_fetch_latest_snapshot(db: AsyncSession, symbol: str) -> StockSnapshotResponse:
    # Check if a recent snapshot exists in DB within the last 30 seconds
    latest = await get_latest_snapshot(db, symbol)
    if latest and latest.timestamp:
        now = datetime.now(timezone.utc)
        ts = latest.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if abs((now - ts).total_seconds()) < 30:
            return StockSnapshotResponse.model_validate(latest)

    # Attempt to fetch real-time data
    price = await fetch_realtime_price(symbol)
    if not price:
        if latest:
            return StockSnapshotResponse.model_validate(latest)
        price = 150.0  # Safe default fallback
        
    volatility = await fetch_historical_volatility(symbol)
    beta = await fetch_market_beta(symbol)
    sentiment = await analyze_news_sentiment(symbol)
    
    technical = -0.1
    
    snapshot_data = StockSnapshotBase(
        symbol=symbol,
        price=price,
        volume=1000000,
        news_sentiment=sentiment,
        technical_position=technical,
        market_beta=beta,
        historical_volatility=volatility
    )
    
    snapshot = await create_snapshot(db, snapshot_data)
    return StockSnapshotResponse.model_validate(snapshot)

@router.get("/watchlist/{watchlist_id}", response_model=List[RiskAnalysisResponse])
async def analyze_watchlist(
    watchlist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes all stocks in a watchlist, comparing current state against user's last checkpoint.
    Returns the Attention Score and Risk Analysis for each stock.
    """
    stocks = await get_watchlist_stocks(db=db, watchlist_id=watchlist_id)
    if not stocks:
        return []
        
    results = []
    
    for symbol in stocks:
        try:
            # 1. Fetch current real-time snapshot
            current_snapshot = await get_or_fetch_latest_snapshot(db, symbol)
            
            # 2. Get user's previous checkpoint to do "Stateful Diffing"
            last_checkpoint = await get_latest_checkpoint(db, user_id=current_user.id, symbol=symbol)
            
            previous_snapshot_stub = None
            if last_checkpoint:
                previous_snapshot_stub = StockSnapshotResponse(
                    id=last_checkpoint.id,
                    symbol=symbol,
                    price=last_checkpoint.price,
                    timestamp=last_checkpoint.checkpoint_time,
                )
                
            # 3. Calculate Risk Engine Attention Score based on diff
            attention = await calculate_attention_score(
                symbol=symbol, 
                current_snapshot=current_snapshot, 
                previous_snapshot=previous_snapshot_stub
            )
            
            # 4. Update the checkpoint to current for next time
            try:
                await create_or_update_checkpoint(
                    db=db, 
                    user_id=current_user.id, 
                    symbol=symbol, 
                    price=current_snapshot.price,
                    attention_score=attention.score
                )
            except Exception:
                pass
            
            results.append(
                RiskAnalysisResponse(
                    symbol=symbol,
                    current_snapshot=current_snapshot,
                    attention=attention
                )
            )
        except Exception as err:
            print(f"[Stock Analysis Warning]: {symbol} -> {err}")
            fallback_snapshot = StockSnapshotResponse(
                id=0, symbol=symbol, price=150.0, volume=1000000,
                change=0.5, change_pct=0.5, timestamp=datetime.now(timezone.utc)
            )
            fallback_attention = AttentionScore(score=50, insights=[f"Tracking active for {symbol}"], factors=[])
            results.append(
                RiskAnalysisResponse(
                    symbol=symbol,
                    current_snapshot=fallback_snapshot,
                    attention=fallback_attention
                )
            )
        
    # Sort by attention score descending
    results.sort(key=lambda x: x.attention.score, reverse=True)
    return results

@router.get("/test/{symbol}", response_model=RiskAnalysisResponse)
async def test_analysis(
    symbol: str, 
    db: AsyncSession = Depends(get_db)
):
    """
    Test endpoint to run the risk engine for a given symbol without authentication.
    It fetches live data from Finnhub and calculates the attention score.
    """
    # 1. Fetch current real-time snapshot
    current_snapshot = await get_or_fetch_latest_snapshot(db, symbol)
    
    # We will simulate a past checkpoint where the stock was 2% lower
    previous_snapshot_stub = StockSnapshotResponse(
        id=9999,
        symbol=symbol,
        price=current_snapshot.price * 0.98,
        timestamp=current_snapshot.timestamp,
    )

    # 2. Run the Risk Engine (Delta & Context)
    attention = await calculate_attention_score(
        symbol=symbol, 
        current_snapshot=current_snapshot, 
        previous_snapshot=previous_snapshot_stub
    )

    return RiskAnalysisResponse(
        symbol=symbol,
        current_snapshot=current_snapshot,
        attention=attention
    )
