from sqlalchemy import String, Integer, DateTime, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.db.base import Base

# Association table for watchlists and stocks (since stocks are identified by symbol strings)
watchlist_stocks = Table(
    "watchlist_stocks",
    Base.metadata,
    Column("watchlist_id", Integer, ForeignKey("watchlists.id", ondelete="CASCADE"), primary_key=True),
    Column("symbol", String(50), primary_key=True),
    Column("added_at", DateTime(timezone=True), server_default=func.now())
)

class Watchlist(Base):
    __tablename__ = "watchlists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="watchlists")
    # For a real Many-to-Many with a 'Stock' model we'd use relationship. 
    # But since we're just storing symbols for stocks, we can manage the association table directly or use a proxy.
