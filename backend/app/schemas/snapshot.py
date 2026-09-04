from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class StockSnapshotBase(BaseModel):
    symbol: str
    price: float
    volume: Optional[int] = None
    news_sentiment: Optional[float] = None
    technical_position: Optional[float] = None
    market_beta: Optional[float] = None
    historical_volatility: Optional[float] = None

class StockSnapshotResponse(StockSnapshotBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
