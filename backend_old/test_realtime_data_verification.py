import unittest
import json
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import init_db

class TestRealtimeDataVerification(unittest.TestCase):

    def setUp(self):
        init_db()
        self.app = app.test_client()
        self.app.testing = True

    def test_health_endpoint_realtime(self):
        """Verify API health endpoint returns healthy status and total stock count"""
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertGreater(data['total_stocks'], 0)

    def test_stocks_endpoint_realtime_data(self):
        """Verify stocks endpoint returns valid real-time prices, volume, and risk metrics"""
        response = self.app.get('/api/stocks?per_page=10')
        self.assertEqual(response.status_code, 200)
        res_json = json.loads(response.data)
        self.assertIn('data', res_json)
        self.assertIn('total', res_json)
        
        stocks_list = res_json['data']
        self.assertIsInstance(stocks_list, list)
        self.assertGreater(len(stocks_list), 0)

        first = stocks_list[0]
        self.assertIn('symbol', first)
        self.assertIn('price', first)
        self.assertIn('change', first)
        self.assertIn('volume', first)
        self.assertIn('risk_score', first)
        self.assertGreater(first['price'], 0)
        self.assertGreater(first['volume'], 0)

    def test_market_indices_realtime_data(self):
        """Verify real-time index data and 30-day historical chart points"""
        response = self.app.get('/api/market/indices')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertIn('timestamp', data)

        indices = data['data']
        self.assertIn('NIFTY 50', indices)
        self.assertIn('SENSEX', indices)
        self.assertIn('BANK NIFTY', indices)

        nifty = indices['NIFTY 50']
        self.assertGreater(nifty['current'], 0)
        self.assertIn('chart_data', nifty)
        self.assertGreater(len(nifty['chart_data']), 0)

    def test_market_statistics_breadth_sum(self):
        """Verify market breadth counters sum exactly to total stock count"""
        response = self.app.get('/api/market/statistics')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total', data)
        self.assertIn('advancing', data)
        self.assertIn('declining', data)
        self.assertIn('unchanged', data)
        self.assertEqual(data['advancing'] + data['declining'] + data['unchanged'], data['total'])

    def test_watchlist_what_changed_realtime(self):
        """Verify what-changed endpoint computes attention scores & price/risk deltas"""
        response = self.app.get('/api/watchlist/what-changed')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('items', data)

    def test_realtime_news_feed_endpoint(self):
        """Verify real-time news feed returns NLP analyzed headlines and sentiment polarity"""
        response = self.app.get('/api/news?limit=10')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('news', data)
        self.assertGreater(len(data['news']), 0)

        first_news = data['news'][0]
        self.assertIn('title', first_news)
        self.assertIn('sentiment', first_news)
        self.assertIn('score', first_news)
        self.assertIn('symbol', first_news)
        self.assertIn('publisher', first_news)

    def test_market_signal_realtime(self):
        """Verify market signal engine calculates composite score and status breakdown"""
        response = self.app.get('/api/market/signal')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('score', data)
        self.assertIn('signal', data)
        self.assertIn('factors', data)
        self.assertGreaterEqual(data['score'], 0)
        self.assertLessEqual(data['score'], 100)

if __name__ == '__main__':
    unittest.main()
