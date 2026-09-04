import math
from typing import Dict, Any
from app.schemas.analysis import AttentionScore
from app.schemas.snapshot import StockSnapshotResponse

# The 4-Factor Risk Engine Weights
WEIGHT_VOLATILITY = 0.3
WEIGHT_BETA = 0.2
WEIGHT_SENTIMENT = 0.3
WEIGHT_TECHNICAL = 0.2

async def calculate_attention_score(
    symbol: str,
    current_snapshot: StockSnapshotResponse,
    previous_snapshot: StockSnapshotResponse = None
) -> AttentionScore:
    """
    Calculates the 0-100 Attention Score based on the 4 factors and stateful diffing.
    """
    
    # Extract factors (using current snapshot)
    # In a real scenario, we compare these against the previous snapshot to detect "meaningful changes".
    vol = current_snapshot.historical_volatility or 0.2
    beta = current_snapshot.market_beta or 1.0
    sentiment = current_snapshot.news_sentiment or 0.0
    tech = current_snapshot.technical_position or 0.0
    
    # 1. Volatility Impact (Higher volatility = higher attention)
    vol_score = min(vol / 0.5, 1.0) * 100 
    
    # 2. Beta Impact (Higher beta = higher attention)
    beta_score = min(abs(beta) / 2.0, 1.0) * 100
    
    # 3. Sentiment Impact (Extreme sentiment (-1 or 1) = higher attention)
    sentiment_score = abs(sentiment) * 100
    
    # 4. Technical Breakdown Impact (e.g., breaking moving averages)
    tech_score = abs(tech) * 100
    
    # Calculate weighted average
    base_score = (
        (vol_score * WEIGHT_VOLATILITY) +
        (beta_score * WEIGHT_BETA) +
        (sentiment_score * WEIGHT_SENTIMENT) +
        (tech_score * WEIGHT_TECHNICAL)
    )
    
    # Stateful Diffing: Boost score if price moved significantly since last check
    price_diff_boost = 0
    if previous_snapshot:
        pct_change = abs((current_snapshot.price - previous_snapshot.price) / previous_snapshot.price)
        # If price changed more than 2% since last check, add boost
        if pct_change > 0.02:
            price_diff_boost = min(pct_change * 1000, 30) # Max 30 points boost
            
    final_score = min(base_score + price_diff_boost, 100.0)
    
    reasoning = "Normal market conditions."
    if final_score > 75:
        reasoning = "High attention required due to significant volatility or extreme sentiment."
    elif price_diff_boost > 10:
        reasoning = "Significant price movement since your last check."

    return AttentionScore(
        symbol=symbol,
        score=round(final_score, 2),
        reasoning=reasoning,
        factors={
            "volatility": round(vol_score, 2),
            "beta": round(beta_score, 2),
            "sentiment": round(sentiment_score, 2),
            "technical": round(tech_score, 2),
            "price_diff_boost": round(price_diff_boost, 2)
        }
    )
