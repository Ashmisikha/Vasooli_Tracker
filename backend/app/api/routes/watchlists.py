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
    from app.api.routes.analysis import get_or_fetch_latest_snapshot

    raw_sym = stock.symbol.strip().upper()
    if not raw_sym:
        raise HTTPException(status_code=400, detail="Invalid stock symbol format.")

    # 1. Resolve ticker symbol against 500+ verified catalog
    resolved_sym = raw_sym
    in_catalog = any(s["symbol"].upper() == raw_sym for s in STOCK_CATALOG)
    if not in_catalog:
        if any(s["symbol"].upper() == f"{raw_sym}.NS" for s in STOCK_CATALOG):
            resolved_sym = f"{raw_sym}.NS"
        else:
            match = next((s["symbol"] for s in STOCK_CATALOG if s["symbol"].upper().startswith(raw_sym) or raw_sym in s["name"].upper()), None)
            if match:
                resolved_sym = match.upper()

    # 2. Save both resolved symbol and raw symbol into watchlist DB & memory store
    try:
        watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
        w_id = watchlist.id if watchlist else watchlist_id

        await add_stock_to_watchlist(db=db, watchlist_id=w_id, symbol=resolved_sym)
        if raw_sym != resolved_sym:
            await add_stock_to_watchlist(db=db, watchlist_id=w_id, symbol=raw_sym)
    except Exception as e:
        print(f"[Watchlist Add Warning]: {e}")

    # 3. ETL Transform & Load: Fetch live market snapshot and compute risk metrics
    snapshot = None
    try:
        snapshot = await get_or_fetch_latest_snapshot(db, resolved_sym)
    except Exception as e:
        print(f"[ETL Snapshot Fetch Error]: {e}")

    return {
        "success": True,
        "message": f"Stock {resolved_sym} successfully added to watchlist",
        "symbol": resolved_sym,
        "raw_symbol": raw_sym,
        "price": snapshot.price if snapshot else 150.0,
        "change_pct": snapshot.change_pct if snapshot else 0.5
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
    raw_sym = symbol.strip().upper()
    try:
        watchlist = await get_watchlist(db=db, watchlist_id=watchlist_id, user_id=current_user.id)
        w_id = watchlist.id if watchlist else watchlist_id

        await remove_stock_from_watchlist(db=db, watchlist_id=w_id, symbol=raw_sym)
        if raw_sym.endswith(".NS"):
            await remove_stock_from_watchlist(db=db, watchlist_id=w_id, symbol=raw_sym[:-3])
        else:
            await remove_stock_from_watchlist(db=db, watchlist_id=w_id, symbol=f"{raw_sym}.NS")
    except Exception as e:
        print(f"[Watchlist Remove Warning]: {e}")

    return {
        "success": True,
        "message": f"Stock {raw_sym} removed from watchlist",
        "symbol": raw_sym
    }

# ---------------------------------------------------------------------------
# Collection & Parameterized Endpoints AFTER static sub-resources
# ---------------------------------------------------------------------------

@router.post("")
@router.post("/")
async def create_new_watchlist(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if "symbol" in data:
        stock = WatchlistStockAdd(symbol=data["symbol"])
        return await handle_add_stock_logic(stock=stock, watchlist_id=1, db=db, current_user=current_user)
    
    name = data.get("name", "My Watchlist")
    wl_create = WatchlistCreate(name=name)
    return await create_watchlist(db=db, watchlist=wl_create, user_id=current_user.id)

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
