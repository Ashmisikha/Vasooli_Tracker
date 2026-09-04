from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from typing import List, Optional

from app.models.watchlist import Watchlist, watchlist_stocks
from app.schemas.watchlist import WatchlistCreate

async def create_watchlist(db: AsyncSession, watchlist: WatchlistCreate, user_id: int) -> Watchlist:
    db_watchlist = Watchlist(name=watchlist.name, user_id=user_id)
    db.add(db_watchlist)
    await db.commit()
    await db.refresh(db_watchlist)
    return db_watchlist

async def get_watchlists_by_user(db: AsyncSession, user_id: int) -> List[Watchlist]:
    stmt = select(Watchlist).where(Watchlist.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_watchlist(db: AsyncSession, watchlist_id: int, user_id: int) -> Optional[Watchlist]:
    stmt = select(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def add_stock_to_watchlist(db: AsyncSession, watchlist_id: int, symbol: str) -> None:
    # Basic insert into association table
    stmt = watchlist_stocks.insert().values(watchlist_id=watchlist_id, symbol=symbol)
    try:
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        # Ignore if already exists (Unique constraint violation)
        await db.rollback()

async def remove_stock_from_watchlist(db: AsyncSession, watchlist_id: int, symbol: str) -> None:
    stmt = delete(watchlist_stocks).where(
        watchlist_stocks.c.watchlist_id == watchlist_id,
        watchlist_stocks.c.symbol == symbol
    )
    await db.execute(stmt)
    await db.commit()

async def get_watchlist_stocks(db: AsyncSession, watchlist_id: int) -> List[str]:
    stmt = select(watchlist_stocks.c.symbol).where(watchlist_stocks.c.watchlist_id == watchlist_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
