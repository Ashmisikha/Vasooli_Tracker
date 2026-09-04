from pydantic import BaseModel
from typing import Dict, Optional
from app.schemas.snapshot import StockSnapshotResponse

class AttentionScore(BaseModel):
    symbol: str
    score: float
    reasoning: str
    factors: Dict[str, float]

class RiskAnalysisResponse(BaseModel):
    symbol: str
    current_snapshot: StockSnapshotResponse
    attention: AttentionScore
