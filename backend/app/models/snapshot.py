from sqlalchemy import String, Integer, DateTime, Numeric, BigInteger, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from app.db.base import Base

class StockSnapshot(Base):
    __tablename__ = "stock_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    price: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    volume: Mapped[int] = mapped_column(BigInteger, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # 4-Factor Risk Engine Data
    news_sentiment: Mapped[float] = mapped_column(Numeric(5, 4), nullable=True)
    technical_position: Mapped[float] = mapped_column(Numeric(5, 4), nullable=True)
    market_beta: Mapped[float] = mapped_column(Numeric(5, 4), nullable=True)
    historical_volatility: Mapped[float] = mapped_column(Numeric(5, 4), nullable=True)
