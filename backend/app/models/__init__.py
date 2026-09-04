from app.models.user import User
from app.models.watchlist import Watchlist, watchlist_stocks
from app.models.snapshot import StockSnapshot
from app.models.checkpoint import UserStockCheckpoint

# Export models for Alembic to autogenerate migrations
__all__ = ["User", "Watchlist", "watchlist_stocks", "StockSnapshot", "UserStockCheckpoint"]
