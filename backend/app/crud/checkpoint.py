from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from app.models.checkpoint import UserStockCheckpoint
from sqlalchemy import desc

async def create_or_update_checkpoint(
    db: AsyncSession, 
    user_id: int, 
    symbol: str, 
    price: float, 
    attention_score: float = None
) -> UserStockCheckpoint:
    # See if a recent checkpoint exists for this session, or just create a new one
    # For simplicity, we just create a new checkpoint on every login/check
    db_checkpoint = UserStockCheckpoint(
        user_id=user_id,
        symbol=symbol,
        price=price,
        attention_score=attention_score
    )
    db.add(db_checkpoint)
    await db.commit()
    await db.refresh(db_checkpoint)
    return db_checkpoint

async def get_latest_checkpoint(db: AsyncSession, user_id: int, symbol: str) -> Optional[UserStockCheckpoint]:
    stmt = select(UserStockCheckpoint).where(
        UserStockCheckpoint.user_id == user_id,
        UserStockCheckpoint.symbol == symbol
    ).order_by(desc(UserStockCheckpoint.checkpoint_time)).limit(1)
    
    result = await db.execute(stmt)
    return result.scalars().first()
