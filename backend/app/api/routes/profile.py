from fastapi import APIRouter, Query, Body, Depends
from typing import Optional, Dict, Any

router = APIRouter()

USER_PROFILE_STORE = {
    "user_id": "default",
    "full_name": "Investor",
    "email": "investor@vasooli.app",
    "phone": "",
    "dob": "",
    "gender": "Not specified",
    "risk_tolerance": "Moderate",
    "investment_goals": "Wealth Accumulation, Long-term Growth",
    "experience_level": "Intermediate (2-5 years)",
    "preferred_sectors": "Technology, Financials, Healthcare",
    "investment_horizon": "3-5 Years",
    "asset_classes": "Equities, ETFs, Mutual Funds",
    "watchlist_view": "Grid",
    "notification_preferences": "Email, Push Notifications"
}

@router.get("")
@router.get("/")
async def get_profile(user_id: str = Query("default")):
    return {"success": True, "data": USER_PROFILE_STORE, "profile": USER_PROFILE_STORE}

@router.put("")
@router.put("/")
@router.post("")
@router.post("/")
async def update_profile(data: Dict[str, Any] = Body(...), user_id: str = Query("default")):
    USER_PROFILE_STORE.update(data)
    return {"success": True, "message": "Profile updated successfully.", "data": USER_PROFILE_STORE, "profile": USER_PROFILE_STORE}

@router.put("/preferences")
@router.post("/preferences")
async def update_preferences(data: Dict[str, Any] = Body(...), user_id: str = Query("default")):
    USER_PROFILE_STORE.update(data)
    return {"success": True, "message": "Preferences updated successfully.", "data": USER_PROFILE_STORE, "profile": USER_PROFILE_STORE}
