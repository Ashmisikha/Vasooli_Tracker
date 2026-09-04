from pydantic import BaseModel
from datetime import datetime
from typing import List

class WatchlistBase(BaseModel):
    name: str

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WatchlistStockAdd(BaseModel):
    symbol: str

class WatchlistWithStocksResponse(WatchlistResponse):
    stocks: List[str] = []
