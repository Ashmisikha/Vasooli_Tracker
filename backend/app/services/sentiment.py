import httpx
import datetime
from typing import Dict, List, Optional
from app.core.config import settings
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Initialize VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

async def analyze_news_sentiment(symbol: str) -> float:
    """
    Fetches recent news (last 3 days) for a symbol from Finnhub 
    and calculates an aggregated sentiment score using VADER.
    Returns a score between -1.0 (extremely negative) and 1.0 (extremely positive).
    """
    api_key = settings.FINNHUB_API_KEY
    if not api_key:
        return 0.1 # Default stub
        
    # Get dates for the last 3 days
    today = datetime.date.today()
    three_days_ago = today - datetime.timedelta(days=3)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://finnhub.io/api/v1/company-news",
                params={
                    "symbol": symbol,
                    "from": three_days_ago.strftime("%Y-%m-%d"),
                    "to": today.strftime("%Y-%m-%d"),
                    "token": api_key
                },
                timeout=5.0
            )
            response.raise_for_status()
            news_items = response.json()
            
            if not news_items or not isinstance(news_items, list):
                return 0.1
                
            scores = []
            for item in news_items[:20]: # Analyze up to the 20 most recent articles
                headline = item.get("headline", "")
                summary = item.get("summary", "")
                
                # Combine headline and summary for better context
                text_to_analyze = f"{headline}. {summary}"
                if text_to_analyze.strip() == ".":
                    continue
                    
                sentiment_dict = analyzer.polarity_scores(text_to_analyze)
                scores.append(sentiment_dict['compound'])
                
            if scores:
                # Return the average compound score
                return sum(scores) / len(scores)
                
            return 0.1
        except Exception as e:
            print(f"Finnhub News API Error: {e}")
            return 0.1
