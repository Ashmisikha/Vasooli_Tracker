from fastapi import APIRouter, Query, Body
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import time
import httpx
from app.core.config import settings

router = APIRouter()

FINNHUB_BASE = "https://finnhub.io/api/v1"

SYMBOL_MAP = {
    "Technology": ["AAPL", "MSFT", "NVDA", "GOOGL", "META"],
    "EV/Auto": ["TSLA"],
    "Finance": ["JPM", "BAC", "GS"],
    "India": ["RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS"],
    "General": ["AMZN", "AMD", "NFLX"],
}
ALL_TRACKED = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "TSLA", "AMZN", "AMD", "RELIANCE.NS", "HDFCBANK.NS"]

STATIC_FALLBACK = [
    {"id": 1, "title": "NVIDIA Announces Next-Gen Blackwell Ultra Chips; Demand Surges 40%", "publisher": "Tech Wire", "time": "10 mins ago", "sentiment": "Positive", "score": "+0.85", "symbol": "NVDA", "summary": "Enterprise AI server spending drives record GPU order backlog across cloud hyperscalers.", "url": ""},
    {"id": 2, "title": "Federal Reserve Signals Rate Pause Amid Cooling Inflation Indicators", "publisher": "Financial Express", "time": "25 mins ago", "sentiment": "Positive", "score": "+0.62", "symbol": "MSFT", "summary": "Lower borrowing yields provide macro tailwinds for high-growth SaaS and software equities.", "url": ""},
    {"id": 3, "title": "Tesla Advances Autonomous Software Safety Patch Following Highway Safety Review", "publisher": "Auto News Daily", "time": "1 hour ago", "sentiment": "Neutral", "score": "+0.15", "symbol": "TSLA", "summary": "Full self-driving software validation update improves safety metric compliance.", "url": ""},
    {"id": 4, "title": "Reliance Industries Partners with Google Cloud for Enterprise AI Infrastructure", "publisher": "Mint", "time": "2 hours ago", "sentiment": "Positive", "score": "+0.75", "symbol": "RELIANCE.NS", "summary": "Strategic telecom and cloud infrastructure rollout expected to expand digital service margins.", "url": ""},
    {"id": 5, "title": "Apple Reports Strong Services Revenue Milestone in Q3 Earnings Beat", "publisher": "Bloomberg", "time": "3 hours ago", "sentiment": "Positive", "score": "+0.55", "symbol": "AAPL", "summary": "App Store and cloud subscription acceleration offsets minor hardware seasonality.", "url": ""},
    {"id": 6, "title": "Amazon AWS Wins $4B Multi-Year Cloud Migration Deal in Healthcare", "publisher": "Reuters", "time": "4 hours ago", "sentiment": "Positive", "score": "+0.70", "symbol": "AMZN", "summary": "Enterprise cloud adoption momentum accelerates operating income margin expansion.", "url": ""},
    {"id": 7, "title": "HDFC Bank Reports Robust Loan Growth & Expanding Net Interest Margins", "publisher": "Economic Times", "time": "5 hours ago", "sentiment": "Positive", "score": "+0.68", "symbol": "HDFCBANK.NS", "summary": "Retail banking and SME lending drive double-digit deposit and loan book expansion.", "url": ""},
]

def _score_to_sentiment(score: float):
    if score >= 0.25:
        return "Positive", f"+{score:.2f}"
    elif score <= -0.25:
        return "Negative", f"{score:.2f}"
    else:
        return "Neutral", f"{score:+.2f}"

def _fmt_time(ts: int) -> str:
    try:
        dt = datetime.fromtimestamp(ts)
        diff = datetime.now() - dt
        mins = int(diff.total_seconds() / 60)
        if mins < 60:
            return f"{mins} mins ago"
        elif mins < 1440:
            return f"{mins // 60} hour{'s' if mins // 60 > 1 else ''} ago"
        else:
            return dt.strftime("%b %d")
    except:
        return "Recently"

@router.get("")
@router.get("/")
@router.get("/feed")
async def get_news_feed(limit: int = Query(20, ge=1, le=50)):
    api_key = settings.FINNHUB_API_KEY
    if not api_key:
        return {"success": True, "count": len(STATIC_FALLBACK[:limit]), "news": STATIC_FALLBACK[:limit], "timestamp": datetime.now().isoformat(), "source": "fallback"}

    today = datetime.now().strftime("%Y-%m-%d")
    week_ago = (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d")

    all_articles = []
    seen_titles = set()

    async with httpx.AsyncClient(timeout=10.0) as client:
        # Fetch general market news
        try:
            r = await client.get(f"{FINNHUB_BASE}/news", params={"category": "general", "token": api_key})
            if r.status_code == 200:
                items = r.json()
                for item in (items or [])[:15]:
                    title = item.get("headline", "")
                    if title and title not in seen_titles:
                        seen_titles.add(title)
                        all_articles.append({"item": item, "symbol": "MARKET"})
        except Exception as e:
            print(f"[News] General news error: {e}")

        # Fetch per-symbol company news
        for sym in ALL_TRACKED[:6]:
            try:
                r = await client.get(f"{FINNHUB_BASE}/company-news", params={
                    "symbol": sym, "from": week_ago, "to": today, "token": api_key
                })
                if r.status_code == 200:
                    items = r.json()
                    for item in (items or [])[:3]:
                        title = item.get("headline", "")
                        if title and title not in seen_titles:
                            seen_titles.add(title)
                            all_articles.append({"item": item, "symbol": sym})
            except Exception as e:
                print(f"[News] Company news error for {sym}: {e}")

    if not all_articles:
        return {"success": True, "count": len(STATIC_FALLBACK[:limit]), "news": STATIC_FALLBACK[:limit], "timestamp": datetime.now().isoformat(), "source": "fallback"}

    # Sort by datetime descending
    all_articles.sort(key=lambda x: x["item"].get("datetime", 0), reverse=True)

    # Build VADER sentiment scoring
    try:
        from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
        vader = SentimentIntensityAnalyzer()
    except:
        vader = None

    news_list = []
    for idx, entry in enumerate(all_articles[:limit]):
        item = entry["item"]
        sym = entry["symbol"]
        title = item.get("headline", "")
        summary = item.get("summary", "")
        text = f"{title}. {summary}"

        if vader:
            compound = vader.polarity_scores(text)["compound"]
        else:
            compound = 0.1

        sentiment_label, score_str = _score_to_sentiment(compound)

        news_list.append({
            "id": idx + 1,
            "title": title,
            "publisher": item.get("source", "News"),
            "time": _fmt_time(item.get("datetime", int(time.time()))),
            "sentiment": sentiment_label,
            "score": score_str,
            "symbol": sym,
            "summary": summary[:200] if summary else title[:120],
            "url": item.get("url", ""),
            "image": item.get("image", "")
        })

    return {
        "success": True,
        "count": len(news_list),
        "news": news_list,
        "timestamp": datetime.now().isoformat(),
        "source": "finnhub_live"
    }


@router.post("/sentiment/simulate")
async def simulate_sentiment(payload: Dict[str, Any] = Body(...)):
    symbol = payload.get("symbol", "AAPL").upper()
    headline = payload.get("headline", "")
    sentiment_score = payload.get("sentiment_score", -0.70)

    baseline_risk = 42.0
    risk_delta = round(abs(sentiment_score) * 20.0, 1)
    simulated_risk = min(100.0, baseline_risk + (risk_delta if sentiment_score < 0 else -risk_delta / 2))

    return {
        "symbol": symbol,
        "headline_injected": headline,
        "baseline": {
            "risk_score": baseline_risk,
            "sentiment_score": 0.25,
            "sentiment_level": "Positive",
            "recommendation": "BUY"
        },
        "simulated": {
            "risk_score": simulated_risk,
            "sentiment_score": sentiment_score,
            "sentiment_level": "Negative" if sentiment_score < 0 else "Positive",
            "recommendation": "AVOID" if simulated_risk > 65 else ("CAUTION" if simulated_risk > 45 else "BUY"),
            "breakdown": {
                "sentiment": round(abs(sentiment_score) * 40.0, 1),
                "volatility": 35.0,
                "beta": 1.2,
                "technical": 40.0
            },
            "risk_factors": ["Headline sentiment volatility shock", "Transient market reaction risk"],
            "prediction": {"trend": "Downside Pressure" if sentiment_score < 0 else "Upside Catalyst"}
        },
        "impact": {
            "risk_score_delta": risk_delta,
            "is_spike": risk_delta >= 8.0,
            "recommendation_flipped": simulated_risk > 60,
            "explanation": f"The injected headline driven shift to {sentiment_score:+.2f} sentiment altered the composite risk score by {risk_delta} points."
        }
    }
