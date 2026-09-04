from textblob import TextBlob
import re

# Domain-specific financial dictionary boosts
FINANCIAL_POSITIVE = {
    "surge", "surges", "surging", "soar", "soars", "soaring", "beat", "beats", "beating",
    "exceed", "exceeds", "record", "growth", "breakthrough", "rally", "rallies", "upgrade",
    "upgraded", "profit", "bullish", "expansion", "dividend", "outperform", "buyback",
    "revenue jumped", "all-time high", "strong demand", "ai momentum", "partnership", "contracts"
}

FINANCIAL_NEGATIVE = {
    "plunge", "plunges", "plunging", "slump", "slumps", "tumble", "tumbles", "miss", "misses",
    "lawsuit", "sued", "probe", "investigation", "sec", "fraud", "accounting", "downgrade",
    "downgraded", "bearish", "layoff", "layoffs", "default", "bankruptcy", "recall", "fine",
    "antitrust", "penalty", "loss", "losses", "warning", "underperform", "resigns", "scandal"
}

def clean_text(text):
    if not text:
        return ""
    # Strip HTML tags or odd characters
    text = re.sub(r'<.*?>', '', text)
    return text.strip()

def analyze_text_sentiment(text):
    """
    Computes sentiment polarity (-1.0 to 1.0) and subjectivity (0.0 to 1.0)
    using TextBlob enhanced with financial context weighting.
    """
    clean = clean_text(text)
    if not clean:
        return {"polarity": 0.0, "subjectivity": 0.0, "level": "Neutral"}
    
    try:
        blob = TextBlob(clean)
        base_polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
    except Exception:
        base_polarity = 0.0
        subjectivity = 0.5

    # Apply financial lexicon weighting
    lower_text = clean.lower()
    fin_score = 0.0
    for word in FINANCIAL_POSITIVE:
        if word in lower_text:
            fin_score += 0.25
    for word in FINANCIAL_NEGATIVE:
        if word in lower_text:
            fin_score -= 0.35
            
    # Combine TextBlob with financial weighting, clamped to [-1.0, 1.0]
    final_polarity = max(-1.0, min(1.0, (base_polarity * 0.6) + (fin_score * 0.4)))
    
    if final_polarity >= 0.15:
        level = "Positive"
    elif final_polarity <= -0.15:
        level = "Negative"
    else:
        level = "Neutral"
        
    return {
        "polarity": round(final_polarity, 3),
        "subjectivity": round(subjectivity, 3),
        "level": level
    }

def analyze_headlines_list(articles):
    """
    Analyzes a list of news items:
    Each item can have 'title', 'publisher', 'link', 'providerPublishTime'.
    Returns aggregated score, level, and individual headline sentiments.
    """
    if not articles:
        return {
            "score": 0.0,
            "level": "Neutral",
            "headlines": [],
            "summary": "No recent news detected; assuming neutral baseline sentiment.",
            "distribution": {"positive": 0, "neutral": 0, "negative": 0}
        }
    
    analyzed = []
    total_polarity = 0.0
    distribution = {"positive": 0, "neutral": 0, "negative": 0}
    
    for item in articles:
        title = item.get("title") or item.get("headline") or ""
        sentiment_res = analyze_text_sentiment(title)
        pol = sentiment_res["polarity"]
        lvl = sentiment_res["level"]
        
        total_polarity += pol
        if lvl == "Positive":
            distribution["positive"] += 1
        elif lvl == "Negative":
            distribution["negative"] += 1
        else:
            distribution["neutral"] += 1
            
        analyzed.append({
            "title": title,
            "publisher": item.get("publisher", "Market News"),
            "link": item.get("link", "#"),
            "published_at": item.get("providerPublishTime"),
            "polarity": pol,
            "level": lvl
        })
        
    avg_polarity = round(total_polarity / len(articles), 3)
    if avg_polarity >= 0.12:
        agg_level = "Positive"
    elif avg_polarity <= -0.12:
        agg_level = "Negative"
    else:
        agg_level = "Neutral"
        
    summary = (
        f"Analyzed {len(articles)} headlines. {distribution['positive']} positive, "
        f"{distribution['negative']} negative, {distribution['neutral']} neutral. "
        f"Overall tone: {agg_level} ({avg_polarity:+0.2f})."
    )
    
    return {
        "score": avg_polarity,
        "level": agg_level,
        "headlines": analyzed,
        "summary": summary,
        "distribution": distribution
    }
