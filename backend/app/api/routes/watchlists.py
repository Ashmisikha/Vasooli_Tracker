from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.crud.watchlist import (
    create_watchlist, get_watchlists_by_user, get_watchlist, 
    add_stock_to_watchlist, remove_stock_from_watchlist, get_watchlist_stocks
)
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse, WatchlistStockAdd, WatchlistWithStocksResponse
from app.models.user import User

router = APIRouter()

@router.post("", response_model=WatchlistResponse)
@router.post("/", response_model=WatchlistResponse)
async def create_new_watchlist(
    watchlist: WatchlistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await create_watchlist(db=db, watchlist=watchlist, user_id=current_user.id)

@router.get("", response_model=List[WatchlistResponse])
@router.get("/", response_model=List[WatchlistResponse])
async def read_watchlists(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await get_watchlists_by_user(db=db, user_id=current_user.id)

@router.get("/{watchlist_id}", response_model=WatchlistWithStocksResponse)
async def read_watchlist(
    watchlist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    stocks = await get_watchlist_stocks(db=db, watchlist_id=watchlist_id)
    
    # We build the response model manually to combine watchlist and stocks
    response = WatchlistWithStocksResponse.model_validate(watchlist)
    response.stocks = stocks
    return response

@router.post("/{watchlist_id}/stocks")
async def add_stock(
    watchlist_id: int,
    stock: WatchlistStockAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.core.stock_catalog import STOCK_CATALOG
    from app.services.yfinance_service import get_yf_quote

    sym = stock.symbol.strip().upper()
    if not sym or len(sym) < 1 or len(sym) > 15:
        raise HTTPException(status_code=400, detail="Invalid stock symbol format.")

    # 1. Check if stock exists in 500+ verified catalog
    in_catalog = any(s["symbol"].upper() == sym for s in STOCK_CATALOG)
    
    if not in_catalog:
        # 2. Check if it is a verified live exchange symbol
        live_q = await get_yf_quote(sym)
        if not live_q or not live_q.get("price"):
            raise HTTPException(
                status_code=400, 
                detail=f"'{sym}' is not a valid stock. Please choose a recognized stock from the catalog."
            )

    watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    await add_stock_to_watchlist(db=db, watchlist_id=watchlist_id, symbol=sym)
    return {"message": f"Stock {sym} added to watchlist"}


@router.delete("/{watchlist_id}/stocks/{symbol}")
async def remove_stock(
    watchlist_id: int,
    symbol: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist not found")
    
    await remove_stock_from_watchlist(db=db, watchlist_id=watchlist_id, symbol=symbol.upper())
    return {"message": f"Stock {symbol} removed from watchlist"}
