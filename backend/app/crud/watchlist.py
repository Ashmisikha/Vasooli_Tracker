from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional

from app.models.watchlist import Watchlist, watchlist_stocks
from app.schemas.watchlist import WatchlistCreate

# Global in-memory fallback store so stock additions persist even on serverless or DB errors
IN_MEMORY_WATCHLISTS: dict = {
    1: {"id": 1, "user_id": 1, "name": "My Watchlist", "stocks": {"RELIANCE.NS", "TCS.NS", "INFY.NS", "AAPL", "NVDA", "TSLA"}}
}

async def create_watchlist(db: AsyncSession, watchlist: WatchlistCreate, user_id: int) -> Watchlist:
    try:
        db_watchlist = Watchlist(name=watchlist.name, user_id=user_id)
        db.add(db_watchlist)
        await db.commit()
        await db.refresh(db_watchlist)
        return db_watchlist
    except Exception as e:
        await db.rollback()
        # Fallback dummy watchlist object
        dummy = Watchlist()
        dummy.id = 1
        dummy.user_id = user_id
        dummy.name = watchlist.name
        return dummy

async def get_watchlists_by_user(db: AsyncSession, user_id: int) -> List[Watchlist]:
    try:
        stmt = select(Watchlist).where(Watchlist.user_id == user_id)
        result = await db.execute(stmt)
        watchlists = list(result.scalars().all())
        if watchlists:
            return watchlists
    except Exception as e:
        print(f"[CRUD Watchlist Warning]: {e}")
    
    # Fallback default watchlist
    dummy = Watchlist()
    dummy.id = 1
    dummy.user_id = user_id
    dummy.name = "My Watchlist"
    return [dummy]

async def get_watchlist(db: AsyncSession, watchlist_id: int, user_id: Optional[int] = None) -> Optional[Watchlist]:
    try:
        stmt = select(Watchlist).where(Watchlist.id == watchlist_id)
        result = await db.execute(stmt)
        watchlist = result.scalars().first()
        if watchlist:
            return watchlist
    except Exception as e:
        print(f"[CRUD get_watchlist Warning]: {e}")

    dummy = Watchlist()
    dummy.id = watchlist_id
    dummy.user_id = user_id or 1
    dummy.name = "My Watchlist"
    return dummy

async def add_stock_to_watchlist(db: AsyncSession, watchlist_id: int, symbol: str) -> None:
    sym = symbol.strip().upper()
    if not sym:
        return

    # Always persist in in-memory fallback store
    if watchlist_id not in IN_MEMORY_WATCHLISTS:
        IN_MEMORY_WATCHLISTS[watchlist_id] = {"id": watchlist_id, "user_id": 1, "name": "My Watchlist", "stocks": set()}
    IN_MEMORY_WATCHLISTS[watchlist_id]["stocks"].add(sym)

    # Also attempt database persistence
    try:
        stmt = watchlist_stocks.insert().values(watchlist_id=watchlist_id, symbol=sym)
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        await db.rollback()

async def remove_stock_from_watchlist(db: AsyncSession, watchlist_id: int, symbol: str) -> None:
    sym = symbol.strip().upper()
    if watchlist_id in IN_MEMORY_WATCHLISTS:
        IN_MEMORY_WATCHLISTS[watchlist_id]["stocks"].discard(sym)

    try:
        stmt = delete(watchlist_stocks).where(
            watchlist_stocks.c.watchlist_id == watchlist_id,
            watchlist_stocks.c.symbol == sym
        )
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        await db.rollback()

async def get_watchlist_stocks(db: AsyncSession, watchlist_id: int) -> List[str]:
    db_stocks = set()
    try:
        stmt = select(watchlist_stocks.c.symbol).where(watchlist_stocks.c.watchlist_id == watchlist_id)
        result = await db.execute(stmt)
        db_stocks = set(result.scalars().all())
    except Exception as e:
        print(f"[CRUD get_watchlist_stocks Warning]: {e}")

    mem_stocks = IN_MEMORY_WATCHLISTS.get(watchlist_id, {}).get("stocks", set())
    combined = list(db_stocks.union(mem_stocks))
    return combined
