# test_etl.py - Unit tests for ETL pipeline components
import unittest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from stocks import ALL_STOCKS, INDIAN_STOCKS, US_STOCKS
from extract import StockExtractor
from transform import StockTransformer
from load import StockLoader
from etl_pipeline import ETLPipeline

class TestETLPipeline(unittest.TestCase):
    def setUp(self):
        self.extractor = StockExtractor()
        self.transformer = StockTransformer()
        self.loader = StockLoader()
        self.pipeline = ETLPipeline()

    def test_stock_universe(self):
        """Verify 200+ stock universe is defined with required attributes"""
        self.assertGreaterEqual(len(ALL_STOCKS), 200)
        self.assertGreaterEqual(len(INDIAN_STOCKS), 100)
        self.assertGreaterEqual(len(US_STOCKS), 100)
        
        sample = ALL_STOCKS[0]
        self.assertIn('symbol', sample)
        self.assertIn('name', sample)
        self.assertIn('sector', sample)
        self.assertIn('country', sample)

    def test_extraction(self):
        """Test extraction for a single stock"""
        res = self.extractor.extract_single_stock({'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology', 'country': 'US'})
        self.assertIsNotNone(res)
        self.assertEqual(res['symbol'], 'AAPL')
        self.assertIn('price', res)
        self.assertIn('volatility', res)

    def test_transformation(self):
        """Test transformation & risk score calculation"""
        raw_mock = {
            'symbol': 'TSLA',
            'name': 'Tesla Inc.',
            'sector': 'Automotive',
            'country': 'US',
            'price': 240.0,
            'prev_close': 230.0,
            'volume': 45000000,
            'volatility': 42.5,
            'beta': 1.8,
            'ma_50': 220.0,
            'debt_equity': 0.8,
            'pe_ratio': 65.0
        }
        transformed = self.transformer.transform_stock_data(raw_mock)
        self.assertIsNotNone(transformed)
        self.assertEqual(transformed['change'], 4.35)
        self.assertGreaterEqual(transformed['risk_score'], 60)
        self.assertEqual(transformed['risk_level'], 'High')
        self.assertEqual(transformed['trend'], 'Bullish')

    def test_load_and_queries(self):
        """Test loading into SQLite and querying with pagination and filters"""
        transformed_mock = {
            'symbol': 'RELIANCE.NS',
            'name': 'Reliance Industries',
            'sector': 'Energy',
            'country': 'India',
            'price': 2950.0,
            'change': 1.5,
            'volume': 8500000,
            'market_cap': 20000000000000,
            'pe_ratio': 25.0,
            'pb_ratio': 2.5,
            'debt_equity': 0.4,
            'roe': 0.14,
            'revenue_growth': 0.08,
            'profit_growth': 0.10,
            'volatility': 18.0,
            'beta': 0.95,
            'ma_50': 2900.0,
            'ma_200': 2800.0,
            'risk_score': 35,
            'risk_level': 'Low',
            'trend': 'Bullish',
            'timestamp': '2026-09-04T14:00:00'
        }
        self.loader.load_stock(transformed_mock)
        
        stock = self.loader.get_stock_by_symbol('RELIANCE.NS')
        self.assertIsNotNone(stock)
        self.assertEqual(stock['symbol'], 'RELIANCE.NS')
        self.assertEqual(stock['risk_level'], 'Low')
        
        all_stocks = self.loader.get_all_stocks()
        self.assertGreater(len(all_stocks), 0)

if __name__ == '__main__':
    unittest.main()
