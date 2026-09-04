from fastapi import APIRouter, Query, Depends
from typing import Optional, Dict, Any, List
from datetime import datetime

router = APIRouter()

WHAT_CHANGED_ITEMS = [
    {
        "symbol": "NVDA",
        "title": "Positive Earnings Acceleration & AI Chip Demand",
        "category": "Sentiment Shift",
        "impact": "+12.4% Momentum",
        "timestamp": "15 mins ago",
        "attention_score": 78
    },
    {
        "symbol": "TSLA",
        "title": "Safety Review Validation Update Released",
        "category": "Risk Dynamics",
        "impact": "Low Volatility Impact",
        "timestamp": "45 mins ago",
        "attention_score": 64
    },
    {
        "symbol": "RELIANCE.NS",
        "title": "Enterprise Cloud Expansion Agreement Signed",
        "category": "Strategic Growth",
        "impact": "+3.5% Target Revision",
        "timestamp": "2 hours ago",
        "attention_score": 55
    }
]

@router.get("/what-changed")
async def get_what_changed():
    return {
        "success": True,
        "items": WHAT_CHANGED_ITEMS,
        "changes": WHAT_CHANGED_ITEMS,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/changes")
async def get_watchlist_changes(user_id: str = Query("default")):
    return {
        "success": True,
        "changes": WHAT_CHANGED_ITEMS,
        "items": WHAT_CHANGED_ITEMS,
        "timestamp": datetime.now().isoformat()
    }
