# state_service.py - Store and retrieve previous state for change detection
import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watchlist.db")

class StateService:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()
    
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        conn = self._get_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS watchlist_state (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                user_id TEXT DEFAULT 'default',
                price REAL,
                risk_score INTEGER,
                sentiment TEXT,
                volume INTEGER,
                avg_volume INTEGER,
                news_count INTEGER,
                timestamp TEXT,
                UNIQUE(symbol, user_id)
            )
        ''')
        conn.commit()
        conn.close()
    
    def save_state(self, symbol, data, user_id='default'):
        """Save current state for a stock"""
        conn = self._get_connection()
        conn.execute('''
            INSERT OR REPLACE INTO watchlist_state 
            (symbol, user_id, price, risk_score, sentiment, volume, avg_volume, news_count, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            symbol,
            user_id,
            data.get('price', 0.0),
            data.get('risk_score', 50),
            data.get('sentiment', 'Neutral'),
            data.get('volume', 1000000),
            data.get('avg_volume', 1000000),
            data.get('news_count', 0),
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
    
    def get_previous_state(self, symbol, user_id='default'):
        """Get previous state for a stock"""
        conn = self._get_connection()
        result = conn.execute('''
            SELECT * FROM watchlist_state 
            WHERE symbol = ? AND user_id = ?
            ORDER BY timestamp DESC 
            LIMIT 1
        ''', (symbol, user_id)).fetchone()
        conn.close()
        return dict(result) if result else None
    
    def has_previous_state(self, symbol, user_id='default'):
        """Check if previous state exists"""
        return self.get_previous_state(symbol, user_id) is not None
