# load.py - Data loading & storage layer
import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "watchlist.db")

class StockLoader:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def _init_database(self):
        """Initialize database with proper schema & indexes"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Stocks table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS stocks (
                symbol TEXT PRIMARY KEY,
                name TEXT,
                sector TEXT,
                country TEXT,
                price REAL,
                change REAL,
                volume INTEGER,
                market_cap INTEGER,
                pe_ratio REAL,
                pb_ratio REAL,
                debt_equity REAL,
                roe REAL,
                revenue_growth REAL,
                profit_growth REAL,
                volatility REAL,
                beta REAL,
                ma_50 REAL,
                ma_200 REAL,
                risk_score INTEGER,
                risk_level TEXT,
                trend TEXT,
                timestamp TEXT
            )
        ''')
        
        # Historical data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS historical_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                price REAL,
                change REAL,
                volume INTEGER,
                risk_score INTEGER,
                timestamp TEXT,
                FOREIGN KEY (symbol) REFERENCES stocks(symbol)
            )
        ''')
        
        # Watchlist table
        cursor.execute('''
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
        ''')
        
        try:
            cursor.execute("ALTER TABLE watchlist ADD COLUMN user_id TEXT DEFAULT 'default'")
        except sqlite3.OperationalError:
            pass  # Column already exists
        
        # User preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id TEXT PRIMARY KEY,
                watchlist_json TEXT,
                settings_json TEXT,
                updated_at TEXT
            )
        ''')
        
        # Performance indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_stocks_country ON stocks(country)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_stocks_risk_score ON stocks(risk_score)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_historical_symbol ON historical_data(symbol)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_historical_timestamp ON historical_data(timestamp DESC)')
        
        conn.commit()
        conn.close()
    
    def load_stock(self, stock_data):
        """Load a single stock record into DB"""
        if not stock_data or not stock_data.get('symbol'):
            return
        
        conn = self.get_connection()
        cursor = conn.cursor()
        
        symbol = stock_data.get('symbol').upper()
        
        cursor.execute('''
            INSERT OR REPLACE INTO stocks (
                symbol, name, sector, country, price, change, volume,
                market_cap, pe_ratio, pb_ratio, debt_equity, roe,
                revenue_growth, profit_growth, volatility, beta,
                ma_50, ma_200, risk_score, risk_level, trend, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            symbol,
            stock_data.get('name', symbol),
            stock_data.get('sector', 'General'),
            stock_data.get('country', 'US'),
            stock_data.get('price', 0.0),
            stock_data.get('change', 0.0),
            stock_data.get('volume', 0),
            stock_data.get('market_cap', 0),
            stock_data.get('pe_ratio'),
            stock_data.get('pb_ratio'),
            stock_data.get('debt_equity'),
            stock_data.get('roe'),
            stock_data.get('revenue_growth'),
            stock_data.get('profit_growth'),
            stock_data.get('volatility', 20.0),
            stock_data.get('beta', 1.0),
            stock_data.get('ma_50'),
            stock_data.get('ma_200'),
            stock_data.get('risk_score', 50),
            stock_data.get('risk_level', 'Medium'),
            stock_data.get('trend', 'Neutral'),
            stock_data.get('timestamp', datetime.now().isoformat())
        ))
        
        # Save historical snapshot entry
        cursor.execute('''
            INSERT INTO historical_data (symbol, price, change, volume, risk_score, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            symbol,
            stock_data.get('price', 0.0),
            stock_data.get('change', 0.0),
            stock_data.get('volume', 0),
            stock_data.get('risk_score', 50),
            stock_data.get('timestamp', datetime.now().isoformat())
        ))
        
        conn.commit()
        conn.close()

    def _prune_historical_data(self, days_to_keep=30):
        """Fix #6: Delete historical_data rows older than days_to_keep.
        Prevents unbounded table growth (501 stocks × every 5 min = ~144k rows/day).
        """
        conn = self.get_connection()
        try:
            conn.execute(
                "DELETE FROM historical_data WHERE timestamp < datetime('now', ?)",
                (f'-{days_to_keep} days',)
            )
            conn.commit()
        except Exception as e:
            print(f"[StockLoader] Pruning error: {e}")
        finally:
            conn.close()

    def load_batch(self, stock_data_list):
        """Load multiple stock records and prune old historical data."""
        for data in stock_data_list:
            self.load_stock(data)
        # Prune once per batch (not per stock) to keep the table bounded
        self._prune_historical_data(days_to_keep=30)

    def get_all_stocks(self):
        """Retrieve all stocks from database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM stocks ORDER BY symbol ASC')
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def get_stock_by_symbol(self, symbol):
        """Retrieve a single stock by symbol"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM stocks WHERE symbol = ?', (symbol.upper(),))
        result = cursor.fetchone()
        conn.close()
        return dict(result) if result else None
    
    def get_stocks_by_sector(self, sector):
        """Retrieve stocks by sector"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM stocks WHERE sector = ? ORDER BY symbol ASC', (sector,))
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def get_historical_data(self, symbol, limit=30):
        """Retrieve historical data for a stock"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM historical_data 
            WHERE symbol = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (symbol.upper(), limit))
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def get_watchlist(self, user_id='default'):
        """Retrieve user's watchlist joined with latest stock status"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT w.id as watchlist_id, w.symbol, w.name as watchlist_name, w.sector as watchlist_sector,
                   w.added_at, w.notes, w.tags, s.*
            FROM watchlist w
            LEFT JOIN stocks s ON w.symbol = s.symbol
            WHERE w.user_id = ?
            ORDER BY w.symbol ASC
        ''', (user_id,))
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def add_to_watchlist(self, symbol, user_id='default', name=None, sector=None, notes=None, tags=None):
        """Add stock to watchlist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        symbol = symbol.upper()
        try:
            cursor.execute('''
                INSERT INTO watchlist (symbol, user_id, name, sector, notes, tags, added_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                symbol,
                user_id,
                name or symbol,
                sector or 'General',
                notes or '',
                tags or '',
                datetime.now().isoformat()
            ))
            conn.commit()
            success = True
        except sqlite3.IntegrityError:
            success = False
        finally:
            conn.close()
        return success

    def remove_from_watchlist(self, symbol, user_id='default'):
        """Remove stock from watchlist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        symbol = symbol.upper()
        cursor.execute('DELETE FROM watchlist WHERE symbol = ? AND user_id = ?', (symbol, user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    def check_in_watchlist(self, symbol, user_id='default'):
        """Check if a stock symbol is in user's watchlist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1 FROM watchlist WHERE symbol = ? AND user_id = ?', (symbol.upper(), user_id))
        row = cursor.fetchone()
        conn.close()
        return row is not None
