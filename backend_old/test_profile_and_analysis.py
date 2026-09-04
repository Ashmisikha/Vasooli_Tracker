import unittest
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import init_db, get_user_profile, update_user_profile

class TestProfileAndMarketAnalysis(unittest.TestCase):

    def setUp(self):
        init_db()
        self.app = app.test_client()
        self.app.testing = True

    def test_get_profile(self):
        response = self.app.get('/api/profile?user_id=default')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('data', data)
        self.assertEqual(data['data']['user_id'], 'default')

    def test_update_profile(self):
        update_payload = {
            'full_name': 'Test User',
            'risk_tolerance': 'Aggressive',
            'investment_goals': 'Crypto & High Growth'
        }
        # Protected route — must send the API token (same default used in app.py)
        response = self.app.put('/api/profile?user_id=default',
                                data=json.dumps(update_payload),
                                content_type='application/json',
                                headers={'Authorization': 'Bearer demo-vasooli-key'})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['full_name'], 'Test User')
        self.assertEqual(data['data']['risk_tolerance'], 'Aggressive')

    def test_market_analysis_overview(self):
        response = self.app.get('/api/market-analysis/overview?timeframe=1W')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['timeframe'], '1W')
        self.assertIn('indices', data)
        self.assertIn('breadth', data)
        self.assertGreater(len(data['indices']), 0)

    def test_market_analysis_risk_distribution(self):
        response = self.app.get('/api/market-analysis/risk-distribution')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('distribution', data)
        self.assertIn('low_risk', data['distribution'])
        self.assertIn('medium_risk', data['distribution'])
        self.assertIn('high_risk', data['distribution'])

    def test_market_analysis_sentiment(self):
        response = self.app.get('/api/market-analysis/sentiment')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('overall_score', data)
        self.assertIn('sentiment_level', data)

    def test_market_analysis_sectors(self):
        response = self.app.get('/api/market-analysis/sectors')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('sectors', data)

    def test_market_analysis_insights(self):
        response = self.app.get('/api/market-analysis/insights')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('insights', data)
        self.assertGreater(len(data['insights']), 0)

    def test_market_breadth_endpoint(self):
        response = self.app.get('/api/market/breadth')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('advancing_count', data)
        self.assertIn('declining_count', data)
        self.assertIn('status_message', data)

    def test_market_signal_endpoint(self):
        response = self.app.get('/api/market/signal')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('score', data)
        self.assertIn('signal', data)
        self.assertIn('explanation', data)

    def test_market_indices_endpoint(self):
        response = self.app.get('/api/market/indices')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('indices', data)
        # indices list may be empty in sandbox (no network); just verify structure
        self.assertIsInstance(data['indices'], list)

    def test_watchlist_what_changed_endpoint(self):
        response = self.app.get('/api/watchlist/what-changed')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('items', data)

    def test_market_statistics_endpoint(self):
        response = self.app.get('/api/market/statistics')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('total', data)
        self.assertIn('advancing', data)
        self.assertIn('declining', data)
        self.assertIn('unchanged', data)
        self.assertEqual(data['advancing'] + data['declining'] + data['unchanged'], data['total'])
        self.assertIn('top_gainers', data)
        self.assertIn('top_losers', data)
        self.assertIn('breadth_ratio', data)

if __name__ == '__main__':
    unittest.main()
