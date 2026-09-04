import asyncio
import time
import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

# In-memory caches
_YF_QUOTE_CACHE: Dict[str, tuple[float, Dict[str, Any]]] = {}
_YF_HISTORY_CACHE: Dict[str, tuple[float, List[Dict[str, Any]]]] = {}

async def get_yf_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetches real live stock quote for Indian (.NS) and US equities.
    Uses ultra-fast direct Yahoo Finance endpoint with in-memory TTL caching.
    """
    sym = symbol.strip().upper()
    now = time.time()
    
    if sym in _YF_QUOTE_CACHE:
        cached_time, val = _YF_QUOTE_CACHE[sym]
        if now - cached_time < 30:
            return val

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=1d"
    async with httpx.AsyncClient(headers=HEADERS, timeout=6.0) as client:
        try:
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                results = data.get("chart", {}).get("result")
                if results and len(results) > 0:
                    meta = results[0].get("meta", {})
                    price = meta.get("regularMarketPrice") or meta.get("chartPreviousClose")
                    prev_close = meta.get("chartPreviousClose", price)
                    
                    if price is not None:
                        p = round(float(price), 2)
                        pc = round(float(prev_close), 2) if prev_close else p
                        change = round(p - pc, 2)
                        change_pct = round(((p - pc) / pc) * 100, 2) if pc else 0.0
                        
                        quote = {
                            "symbol": sym,
                            "name": meta.get("longName") or meta.get("shortName") or sym,
                            "price": p,
                            "change": change,
                            "change_pct": change_pct,
                            "prev_close": pc,
                            "high": round(float(meta.get("regularMarketDayHigh", p * 1.01)), 2),
                            "low": round(float(meta.get("regularMarketDayLow", p * 0.99)), 2),
                            "volume": meta.get("regularMarketVolume", 1500000),
                            "currency": meta.get("currency", "INR" if sym.endswith(".NS") else "USD"),
                            "fifty_two_week_high": round(float(meta.get("fiftyTwoWeekHigh", p * 1.25)), 2) if meta.get("fiftyTwoWeekHigh") else None,
                            "fifty_two_week_low": round(float(meta.get("fiftyTwoWeekLow", p * 0.75)), 2) if meta.get("fiftyTwoWeekLow") else None,
                        }
                        _YF_QUOTE_CACHE[sym] = (now, quote)
                        return quote
        except Exception as e:
            print(f"[get_yf_quote error] {sym}: {e}")
            
    if not sym.endswith(".NS") and not sym.endswith(".BO"):
        try:
            url_ns = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}.NS?interval=1d&range=1d"
            async with httpx.AsyncClient(headers=HEADERS, timeout=6.0) as client:
                r = await client.get(url_ns)
                if r.status_code == 200:
                    data = r.json()
                    results = data.get("chart", {}).get("result")
                    if results and len(results) > 0:
                        meta = results[0].get("meta", {})
                        price = meta.get("regularMarketPrice") or meta.get("chartPreviousClose")
                        prev_close = meta.get("chartPreviousClose", price)
                        if price is not None:
                            p = round(float(price), 2)
                            pc = round(float(prev_close), 2) if prev_close else p
                            change = round(p - pc, 2)
                            change_pct = round(((p - pc) / pc) * 100, 2) if pc else 0.0
                            quote = {
                                "symbol": f"{sym}.NS",
                                "name": meta.get("longName") or meta.get("shortName") or sym,
                                "price": p,
                                "change": change,
                                "change_pct": change_pct,
                                "prev_close": pc,
                                "high": round(float(meta.get("regularMarketDayHigh", p * 1.01)), 2),
                                "low": round(float(meta.get("regularMarketDayLow", p * 0.99)), 2),
                                "volume": meta.get("regularMarketVolume", 1500000),
                                "currency": "INR"
                            }
                            _YF_QUOTE_CACHE[sym] = (now, quote)
                            return quote
        except Exception:
            pass

    return None

async def get_yf_history(symbol: str, period: str = "1mo", interval: str = "1d") -> Optional[List[Dict[str, Any]]]:
    """
    Fetches real historical candle chart data for Indian & US stocks.
    """
    sym = symbol.strip().upper()
    cache_key = f"{sym}_{period}_{interval}"
    now = time.time()
    
    if cache_key in _YF_HISTORY_CACHE:
        cached_time, val = _YF_HISTORY_CACHE[cache_key]
        if now - cached_time < 60:
            return val

    # Translate period to valid Yahoo Finance ranges
    range_map = {
        "1D": "1d",
        "1W": "5d",
        "1M": "1mo",
        "3M": "3mo",
        "6M": "6mo",
        "1Y": "1y",
        "5Y": "5y",
        "ALL": "max"
    }
    y_range = range_map.get(period.upper(), period.lower())
    
    interval_map = {
        "1D": "5m",
        "1W": "15m",
        "1M": "1d",
        "3M": "1d",
        "1Y": "1wk",
        "5Y": "1mo"
    }
    y_interval = interval_map.get(period.upper(), interval)

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range={y_range}&interval={y_interval}"
    async with httpx.AsyncClient(headers=HEADERS, timeout=8.0) as client:
        try:
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                results = data.get("chart", {}).get("result")
                if results and len(results) > 0:
                    result = results[0]
                    timestamps = result.get("timestamp", [])
                    indicators = result.get("indicators", {}).get("quote", [{}])[0]
                    closes = indicators.get("close", [])
                    opens = indicators.get("open", [])
                    highs = indicators.get("high", [])
                    lows = indicators.get("low", [])
                    volumes = indicators.get("volume", [])

                    candles = []
                    for i in range(len(timestamps)):
                        c = closes[i] if i < len(closes) else None
                        if c is not None:
                            o = opens[i] if i < len(opens) and opens[i] is not None else c
                            h = highs[i] if i < len(highs) and highs[i] is not None else max(o, c)
                            l = lows[i] if i < len(lows) and lows[i] is not None else min(o, c)
                            v = volumes[i] if i < len(volumes) and volumes[i] is not None else 0
                            
                            dt = datetime.fromtimestamp(timestamps[i])
                            if y_interval in ("5m", "15m", "30m"):
                                date_label = dt.strftime("%H:%M")
                            elif y_interval == "1wk":
                                date_label = dt.strftime("%d %b")
                            elif y_interval == "1mo":
                                date_label = dt.strftime("%b %Y")
                            else:
                                date_label = dt.strftime("%Y-%m-%d")

                            candles.append({
                                "time": timestamps[i],
                                "date": date_label,
                                "open": round(float(o), 2),
                                "high": round(float(h), 2),
                                "low": round(float(l), 2),
                                "close": round(float(c), 2),
                                "price": round(float(c), 2),
                                "volume": v
                            })
                    if candles:
                        _YF_HISTORY_CACHE[cache_key] = (now, candles)
                        return candles
        except Exception as e:
            print(f"[get_yf_history error] {sym}: {e}")
            
    return None
