from sqlalchemy import String, Integer, DateTime, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.base import Base

class UserStockCheckpoint(Base):
    __tablename__ = "user_stock_checkpoints"
    __table_args__ = (
        UniqueConstraint('user_id', 'symbol', 'checkpoint_time', name='uq_user_stock_checkpoint'),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    checkpoint_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    price: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    attention_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=True) # 0-100

    user = relationship("User", back_populates="checkpoints")
