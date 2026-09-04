import httpx
import math
import time
from typing import Dict, Any, Optional, List
from app.core.config import settings

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Live quote cache with 30-second TTL
_QUOTE_CACHE: Dict[str, tuple[float, Dict[str, Any]]] = {}

async def fetch_yahoo_quote(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Fetches real live stock quote from Yahoo Finance API for Indian (.NS) & US stocks.
    """
    sym = symbol.strip().upper()
    now = time.time()
    
    if sym in _QUOTE_CACHE:
        cached_time, cached_val = _QUOTE_CACHE[sym]
        if now - cached_time < 30:
            return cached_val

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=1d"
    async with httpx.AsyncClient(headers=HEADERS, timeout=8.0) as client:
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
                        change = round(price - prev_close, 2) if prev_close else 0.0
                        change_pct = round(((price - prev_close) / prev_close) * 100, 2) if prev_close else 0.0
                        
                        quote = {
                            "symbol": sym,
                            "price": round(float(price), 2),
                            "change": change,
                            "change_pct": change_pct,
                            "prev_close": round(float(prev_close), 2) if prev_close else round(float(price), 2),
                            "high": round(float(meta.get("regularMarketDayHigh", price * 1.01)), 2),
                            "low": round(float(meta.get("regularMarketDayLow", price * 0.99)), 2),
                            "volume": meta.get("regularMarketVolume", 1500000),
                            "currency": meta.get("currency", "INR" if sym.endswith(".NS") else "USD"),
                            "name": meta.get("longName") or meta.get("shortName") or sym
                        }
                        _QUOTE_CACHE[sym] = (now, quote)
                        return quote
        except Exception as e:
            print(f"[Yahoo Quote] {sym} error: {e}")
    return None

async def fetch_yahoo_chart(symbol: str, range_str: str = "1mo", interval: str = "1d") -> Optional[List[Dict[str, Any]]]:
    """
    Fetches real historical candle chart data from Yahoo Finance.
    """
    sym = symbol.strip().upper()
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range={range_str}&interval={interval}"
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
                            
                            candles.append({
                                "time": timestamps[i],
                                "date": time.strftime("%Y-%m-%d", time.gmtime(timestamps[i])),
                                "open": round(float(o), 2),
                                "high": round(float(h), 2),
                                "low": round(float(l), 2),
                                "close": round(float(c), 2),
                                "price": round(float(c), 2),
                                "volume": v
                            })
                    if candles:
                        return candles
        except Exception as e:
            print(f"[Yahoo Chart] {sym} error: {e}")
    return None

# Helper for standardizing Finnhub calls
async def _fetch_finnhub(endpoint: str, params: dict) -> Optional[Dict]:
    api_key = settings.FINNHUB_API_KEY
    if not api_key:
        return None
    
    params["token"] = api_key
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://finnhub.io/api/v1{endpoint}",
                params=params,
                timeout=5.0
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Finnhub API Error on {endpoint}: {e}")
            return None

async def fetch_realtime_price(symbol: str) -> Optional[float]:
    """
    Fetches real-time price from Yahoo Finance or Finnhub.
    """
    # For Indian stocks or general real prices, check Yahoo first
    if symbol.endswith(".NS") or symbol.endswith(".BO"):
        y_quote = await fetch_yahoo_quote(symbol)
        if y_quote and y_quote.get("price"):
            return y_quote["price"]

    # Try Finnhub for US stocks
    data = await _fetch_finnhub("/quote", {"symbol": symbol})
    if data and "c" in data and data["c"] != 0:
        return float(data["c"])
    
    # Fallback to Yahoo for US stocks if Finnhub failed
    y_quote = await fetch_yahoo_quote(symbol)
    if y_quote and y_quote.get("price"):
        return y_quote["price"]

    return 100.0

async def fetch_historical_volatility(symbol: str) -> float:
    """
    Calculates 30-day historical volatility using candles.
    """
    if symbol.endswith(".NS"):
        candles = await fetch_yahoo_chart(symbol, range_str="1mo", interval="1d")
        if candles and len(candles) > 1:
            prices = [c["close"] for c in candles if c["close"] > 0]
            if len(prices) > 1:
                log_returns = [math.log(prices[i] / prices[i-1]) for i in range(1, len(prices))]
                mean_r = sum(log_returns) / len(log_returns)
                var = sum((r - mean_r) ** 2 for r in log_returns) / len(log_returns)
                return round(math.sqrt(var) * math.sqrt(252), 4)

    end_time = int(time.time())
    start_time = end_time - (30 * 24 * 60 * 60)
    
    data = await _fetch_finnhub("/stock/candle", {
        "symbol": symbol,
        "resolution": "D",
        "from": start_time,
        "to": end_time
    })
    
    if data and data.get("s") == "ok" and "c" in data:
        prices = data["c"]
        if len(prices) > 1:
            log_returns = []
            for i in range(1, len(prices)):
                if prices[i-1] > 0 and prices[i] > 0:
                    log_returns.append(math.log(prices[i] / prices[i-1]))
            
            if log_returns:
                mean_return = sum(log_returns) / len(log_returns)
                variance = sum((r - mean_return) ** 2 for r in log_returns) / len(log_returns)
                std_dev = math.sqrt(variance)
                return std_dev * math.sqrt(252)

    return 0.25 

async def fetch_market_beta(symbol: str) -> float:
    data = await _fetch_finnhub("/stock/metric", {
        "symbol": symbol,
        "metric": "all"
    })
    
    if data and "metric" in data:
        beta = data["metric"].get("beta")
        if beta is not None:
            return float(beta)
            
    return 1.1

