from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from datetime import datetime, timezone
from app.models.snapshot import StockSnapshot
from app.schemas.snapshot import StockSnapshotBase
from sqlalchemy import desc

async def create_snapshot(db: AsyncSession, snapshot: StockSnapshotBase) -> StockSnapshot:
    try:
        db_snapshot = StockSnapshot(
            **snapshot.model_dump(),
            timestamp=datetime.now(timezone.utc)
        )
        db.add(db_snapshot)
        await db.commit()
        await db.refresh(db_snapshot)
        return db_snapshot
    except Exception:
        await db.rollback()
        latest = await get_latest_snapshot(db, snapshot.symbol)
        if latest:
            return latest
        raise

async def get_latest_snapshot(db: AsyncSession, symbol: str) -> Optional[StockSnapshot]:
    stmt = select(StockSnapshot).where(StockSnapshot.symbol == symbol).order_by(desc(StockSnapshot.timestamp)).limit(1)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_snapshots_for_symbol(db: AsyncSession, symbol: str, limit: int = 100) -> List[StockSnapshot]:
    stmt = select(StockSnapshot).where(StockSnapshot.symbol == symbol).order_by(desc(StockSnapshot.timestamp)).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
