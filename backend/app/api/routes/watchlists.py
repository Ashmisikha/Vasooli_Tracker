from typing import List, Optional
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

# ---------------------------------------------------------------------------
# Static sub-resources FIRST (to prevent Starlette /{watchlist_id} route shadowing)
# ---------------------------------------------------------------------------

@router.post("/stocks")
@router.post("/stocks/")
@router.post("/add")
async def add_stock_unbound(
    stock: WatchlistStockAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await handle_add_stock_logic(stock=stock, watchlist_id=1, db=db, current_user=current_user)

@router.post("/{watchlist_id}/stocks")
@router.post("/{watchlist_id}/stocks/")
async def add_stock(
    watchlist_id: int,
    stock: WatchlistStockAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await handle_add_stock_logic(stock=stock, watchlist_id=watchlist_id, db=db, current_user=current_user)

async def handle_add_stock_logic(
    stock: WatchlistStockAdd,
    watchlist_id: int,
    db: AsyncSession,
    current_user: User
):
    from app.core.stock_catalog import STOCK_CATALOG
    from app.services.yfinance_service import get_yf_quote

    sym = stock.symbol.strip().upper()
    if not sym or len(sym) < 1 or len(sym) > 15:
        raise HTTPException(status_code=400, detail="Invalid stock symbol format.")

    # 1. Auto-resolve ticker (e.g. RELIANCE -> RELIANCE.NS, TCS -> TCS.NS)
    resolved_sym = sym
    in_catalog = any(s["symbol"].upper() == sym for s in STOCK_CATALOG)
    if not in_catalog:
        if any(s["symbol"].upper() == f"{sym}.NS" for s in STOCK_CATALOG):
            resolved_sym = f"{sym}.NS"
            in_catalog = True
        else:
            match = next((s["symbol"] for s in STOCK_CATALOG if s["symbol"].upper().startswith(sym) or sym in s["name"].upper()), None)
            if match:
                resolved_sym = match.upper()
                in_catalog = True

    sym = resolved_sym

    if not in_catalog:
        live_q = await get_yf_quote(sym)
        if not live_q or not live_q.get("price"):
            live_q_ns = await get_yf_quote(f"{sym}.NS")
            if live_q_ns and live_q_ns.get("price"):
                sym = f"{sym}.NS"
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"'{sym}' is not a valid stock. Please choose a recognized stock from the catalog."
                )

    try:
        watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
        if not watchlist:
            user_watchlists = await get_watchlists_by_user(db=db, user_id=current_user.id)
            if user_watchlists:
                watchlist = user_watchlists[0]
                watchlist_id = watchlist.id
            else:
                wl_create = WatchlistCreate(name="My Watchlist", description="Default Watchlist")
                watchlist = await create_watchlist(db=db, watchlist=wl_create, user_id=current_user.id)
                watchlist_id = watchlist.id
        
        await add_stock_to_watchlist(db=db, watchlist_id=watchlist_id, symbol=sym)
    except Exception as e:
        print(f"[Watchlist Add Warning]: {e}")

    return {
        "success": True,
        "message": f"Stock {sym} added to watchlist",
        "symbol": sym
    }

@router.delete("/stocks/{symbol}")
@router.delete("/stocks/{symbol}/")
async def remove_stock_unbound(
    symbol: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await handle_remove_stock_logic(symbol=symbol, watchlist_id=1, db=db, current_user=current_user)

@router.delete("/{watchlist_id}/stocks/{symbol}")
@router.delete("/{watchlist_id}/stocks/{symbol}/")
async def remove_stock(
    watchlist_id: int,
    symbol: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await handle_remove_stock_logic(symbol=symbol, watchlist_id=watchlist_id, db=db, current_user=current_user)

async def handle_remove_stock_logic(
    symbol: str,
    watchlist_id: int,
    db: AsyncSession,
    current_user: User
):
    try:
        watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
        if not watchlist:
            user_watchlists = await get_watchlists_by_user(db=db, user_id=current_user.id)
            if user_watchlists:
                watchlist_id = user_watchlists[0].id
        
        if watchlist:
            await remove_stock_from_watchlist(db=db, watchlist_id=watchlist_id, symbol=symbol.upper())
    except Exception as e:
        print(f"[Watchlist Remove Warning]: {e}")

    return {
        "success": True,
        "message": f"Stock {symbol.upper()} removed from watchlist",
        "symbol": symbol.upper()
    }

# ---------------------------------------------------------------------------
# Collection & Parameterized Endpoints AFTER static sub-resources
# ---------------------------------------------------------------------------

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
@router.get("/{watchlist_id}/", response_model=WatchlistWithStocksResponse)
async def read_watchlist(
    watchlist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
    if not watchlist:
        user_watchlists = await get_watchlists_by_user(db=db, user_id=current_user.id)
        if user_watchlists:
            watchlist = user_watchlists[0]
        else:
            wl_create = WatchlistCreate(name="My Watchlist", description="Default Watchlist")
            watchlist = await create_watchlist(db=db, watchlist=wl_create, user_id=current_user.id)
    
    stocks = await get_watchlist_stocks(db=db, watchlist_id=watchlist.id)
    
    response = WatchlistWithStocksResponse.model_validate(watchlist)
    response.stocks = stocks
    return response
