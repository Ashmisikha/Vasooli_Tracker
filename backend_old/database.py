import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watchlist.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT UNIQUE NOT NULL,
        name TEXT,
        sector TEXT,
        user_id TEXT DEFAULT 'default',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        tags TEXT
    )
    """)
    
    # Migration: ensure user_id column exists
    try:
        cursor.execute("ALTER TABLE watchlist ADD COLUMN user_id TEXT DEFAULT 'default'")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        price REAL,
        risk_score REAL,
        sentiment_score REAL,
        sentiment_level TEXT,
        volatility_score REAL,
        beta_score REAL,
        technical_score REAL,
        recommendation TEXT,
        raw_data_json TEXT
    )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_snapshots_symbol ON snapshots(symbol, timestamp DESC)")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_profile (
        user_id TEXT PRIMARY KEY DEFAULT 'default',
        full_name TEXT DEFAULT 'Demo User',
        email TEXT DEFAULT 'demo@vasooli.app',
        phone TEXT DEFAULT '+00 00000 00000',
        dob TEXT DEFAULT '1990-01-01',
        gender TEXT DEFAULT 'Not specified',
        risk_tolerance TEXT DEFAULT 'Moderate',
        investment_goals TEXT DEFAULT 'Wealth Accumulation, Long-term Growth',
        experience_level TEXT DEFAULT 'Intermediate (2-5 years)',
        preferred_sectors TEXT DEFAULT 'Technology, Financials, Healthcare',
        investment_horizon TEXT DEFAULT '3-5 Years',
        asset_classes TEXT DEFAULT 'Equities, ETFs, Mutual Funds',
        watchlist_view TEXT DEFAULT 'Grid',
        notification_preferences TEXT DEFAULT 'Email, Push Notifications',
        investment_style TEXT DEFAULT 'Growth & Value',
        preferred_markets TEXT DEFAULT 'India, US',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Migrations for user_profile columns
    for col, default in [
        ("investment_style", "'Growth & Value'"),
        ("preferred_markets", "'India, US'")
    ]:
        try:
            cursor.execute(f"ALTER TABLE user_profile ADD COLUMN {col} TEXT DEFAULT {default}")
        except sqlite3.OperationalError:
            pass  # Column already exists

    # Seed default user profile if empty — Fix #7: use placeholder demo values only
    cursor.execute("SELECT COUNT(*) as count FROM user_profile WHERE user_id = 'default'")
    if cursor.fetchone()["count"] == 0:
        cursor.execute("""
            INSERT INTO user_profile (user_id, full_name, email, phone, dob, gender, risk_tolerance, investment_goals, experience_level, preferred_sectors, investment_horizon, asset_classes, watchlist_view, notification_preferences, investment_style, preferred_markets)
            VALUES ('default', 'Demo User', 'demo@vasooli.app', '+00 00000 00000', '1990-01-01', 'Not specified', 'Moderate', 'Wealth Accumulation, Long-term Growth', 'Intermediate (2-5 years)', 'Technology, Financials, Healthcare', '3-5 Years', 'Equities, ETFs, Mutual Funds', 'Grid', 'Email, Push Notifications', 'Growth & Value', 'India, US')
        """)

    # Check if watchlist is empty; seed default high-profile tech stocks
    cursor.execute("SELECT COUNT(*) as count FROM watchlist")
    if cursor.fetchone()["count"] == 0:
        default_stocks = [
            ("NVDA", "NVIDIA Corporation", "Semiconductors", "High growth AI semiconductor leader", "AI,Tech,Hardware"),
            ("AAPL", "Apple Inc.", "Consumer Electronics", "Dominant consumer hardware & ecosystem", "BigTech,Consumer"),
            ("TSLA", "Tesla, Inc.", "Automotive & Clean Energy", "High volatility EV & autonomous robotics", "EV,Growth,Auto"),
            ("MSFT", "Microsoft Corporation", "Software & Cloud", "Enterprise software & cloud infrastructure", "Cloud,SaaS,AI"),
            ("AMZN", "Amazon.com, Inc.", "E-Commerce & Cloud", "Global commerce & AWS cloud pioneer", "ECommerce,Cloud")
        ]
        cursor.executemany(
            "INSERT INTO watchlist (symbol, name, sector, notes, tags) VALUES (?, ?, ?, ?, ?)",
            default_stocks
        )
    
    conn.commit()
    conn.close()

def get_user_profile(user_id='default'):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_profile WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        cursor.execute("""
            INSERT INTO user_profile (user_id, full_name, email, phone, dob, gender, risk_tolerance, investment_goals, experience_level, preferred_sectors, investment_horizon, asset_classes, watchlist_view, notification_preferences)
            VALUES (?, 'Demo User', 'demo@vasooli.app', '+00 00000 00000', '1990-01-01', 'Not specified', 'Moderate', 'Wealth Accumulation, Long-term Growth', 'Intermediate (2-5 years)', 'Technology, Financials, Healthcare', '3-5 Years', 'Equities, ETFs, Mutual Funds', 'Grid', 'Email, Push Notifications')
        """, (user_id,))
        conn.commit()
        cursor.execute("SELECT * FROM user_profile WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
    profile = dict(row)
    conn.close()
    return profile

def update_user_profile(user_id='default', data=None):
    if not data:
        return get_user_profile(user_id)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    allowed_fields = [
        "full_name", "email", "phone", "dob", "gender",
        "risk_tolerance", "investment_goals", "experience_level",
        "preferred_sectors", "investment_horizon", "asset_classes",
        "watchlist_view", "notification_preferences",
        "investment_style", "preferred_markets"
    ]
    
    updates = []
    values = []
    for k, v in data.items():
        if k in allowed_fields:
            updates.append(f"{k} = ?")
            values.append(v)
            
    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        values.append(user_id)
        sql = f"UPDATE user_profile SET {', '.join(updates)} WHERE user_id = ?"
        cursor.execute(sql, values)
        conn.commit()
        
    conn.close()
    return get_user_profile(user_id)


def get_watchlist(user_id='default'):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM watchlist ORDER BY symbol ASC")
    rows = cursor.fetchall()
    stocks = [dict(row) for row in rows]
    conn.close()
    return stocks

def add_to_watchlist(symbol, name=None, sector=None, notes=None, tags=None):
    symbol = symbol.strip().upper()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO watchlist (symbol, name, sector, notes, tags) VALUES (?, ?, ?, ?, ?)",
            (symbol, name or symbol, sector or "General", notes or "", tags or "")
        )
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False
    finally:
        conn.close()
    return success

def remove_from_watchlist(symbol):
    symbol = symbol.strip().upper()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM watchlist WHERE symbol = ?", (symbol,))
    deleted = cursor.rowcount > 0
    cursor.execute("DELETE FROM snapshots WHERE symbol = ?", (symbol,))
    conn.commit()
    conn.close()
    return deleted

def save_snapshot(symbol, analysis):
    symbol = symbol.strip().upper()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO snapshots (
            symbol, price, risk_score, sentiment_score, sentiment_level,
            volatility_score, beta_score, technical_score, recommendation, raw_data_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        symbol,
        analysis.get("price", 0.0),
        analysis.get("risk_score", 0.0),
        analysis.get("sentiment", {}).get("score", 0.0),
        analysis.get("sentiment", {}).get("level", "Neutral"),
        analysis.get("breakdown", {}).get("volatility", 0.0),
        analysis.get("breakdown", {}).get("beta", 0.0),
        analysis.get("breakdown", {}).get("technical", 0.0),
        analysis.get("recommendation", {}).get("action", "CAUTION"),
        json.dumps(analysis)
    ))
    conn.commit()
    snapshot_id = cursor.lastrowid
    conn.close()
    return snapshot_id

def get_recent_snapshots(symbol, limit=2):
    symbol = symbol.strip().upper()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM snapshots WHERE symbol = ? ORDER BY id DESC LIMIT ?",
        (symbol, limit)
    )
    rows = cursor.fetchall()
    snapshots = []
    for row in rows:
        d = dict(row)
        try:
            d["raw_data"] = json.loads(d["raw_data_json"]) if d["raw_data_json"] else {}
        except Exception:
            d["raw_data"] = {}
        snapshots.append(d)
    conn.close()
    return snapshots

def compute_diff(current_analysis, previous_snapshot):
    """
    Compares current real-time analysis against the previous saved snapshot.
    Highlights Risk Score spikes, Sentiment shifts, and Price changes.
    """
    if not previous_snapshot:
        return {
            "has_previous": False,
            "message": "First check for this stock. No prior baseline available."
        }
    
    prev_price = previous_snapshot.get("price", 0.0)
    current_price = current_analysis.get("price", 0.0)
    price_delta = round(current_price - prev_price, 2)
    price_delta_pct = round((price_delta / prev_price * 100), 2) if prev_price else 0.0
    
    prev_risk = previous_snapshot.get("risk_score", 0.0)
    curr_risk = current_analysis.get("risk_score", 0.0)
    risk_delta = round(curr_risk - prev_risk, 1)
    
    prev_sentiment_lvl = previous_snapshot.get("sentiment_level", "Neutral")
    curr_sentiment_lvl = current_analysis.get("sentiment", {}).get("level", "Neutral")
    sentiment_shifted = (prev_sentiment_lvl != curr_sentiment_lvl)
    
    prev_sentiment_score = previous_snapshot.get("sentiment_score", 0.0)
    curr_sentiment_score = current_analysis.get("sentiment", {}).get("score", 0.0)
    sentiment_delta = round(curr_sentiment_score - prev_sentiment_score, 2)
    
    # Check for risk spike
    risk_spiked = risk_delta >= 8.0
    risk_eased = risk_delta <= -8.0
    
    # Extract factor differences
    prev_raw = previous_snapshot.get("raw_data", {})
    prev_factors = set(prev_raw.get("risk_factors", []))
    curr_factors = current_analysis.get("risk_factors", [])
    new_factors = [f for f in curr_factors if f not in prev_factors]
    
    prev_rec = previous_snapshot.get("recommendation", "CAUTION")
    curr_rec = current_analysis.get("recommendation", {}).get("action", "CAUTION")
    rec_changed = (prev_rec != curr_rec)
    
    return {
        "has_previous": True,
        "last_checked_at": previous_snapshot.get("timestamp"),
        "price": {
            "previous": prev_price,
            "current": current_price,
            "delta": price_delta,
            "delta_pct": price_delta_pct
        },
        "risk_score": {
            "previous": prev_risk,
            "current": curr_risk,
            "delta": risk_delta,
            "spiked": risk_spiked,
            "eased": risk_eased
        },
        "sentiment": {
            "previous_level": prev_sentiment_lvl,
            "current_level": curr_sentiment_lvl,
            "previous_score": prev_sentiment_score,
            "current_score": curr_sentiment_score,
            "delta": sentiment_delta,
            "shifted": sentiment_shifted
        },
        "recommendation": {
            "previous": prev_rec,
            "current": curr_rec,
            "changed": rec_changed
        },
        "new_risk_factors": new_factors
    }
