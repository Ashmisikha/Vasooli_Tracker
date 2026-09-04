import unittest
import json
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from analyzer import SentimentRiskAnalyzer
from database import init_db, get_watchlist, add_to_watchlist, remove_from_watchlist, save_snapshot, get_recent_snapshots, compute_diff
from sentiment_engine import analyze_text_sentiment
import app as flask_app_module

class TestSentimentRiskAnalyzer(unittest.TestCase):

    def setUp(self):
        init_db()

    def test_sentiment_analysis(self):
        pos = analyze_text_sentiment("Company reports record profits and surges past quarterly revenue expectations")
        self.assertEqual(pos["level"], "Positive")
        self.assertGreater(pos["polarity"], 0.1)

        neg = analyze_text_sentiment("SEC launches fraud investigation amidst massive accounting scandal and class action lawsuit")
        self.assertEqual(neg["level"], "Negative")
        self.assertLess(neg["polarity"], -0.1)

    def test_risk_formula_weights(self):
        analyzer = SentimentRiskAnalyzer("AAPL")
        stock_data = {
            "name": "Apple Inc.",
            "price": 200.0,
            "annualized_volatility": 0.20,
            "beta": 1.2,
            "rsi": 50.0,
            "sma50": 195.0
        }
        # Neutral sentiment (0.0) -> sentiment risk score = (1 - 0) * 50 = 50.0
        sentiment = {"score": 0.0, "level": "Neutral"}
        res = analyzer.calculate_risk(stock_data, sentiment)
        
        breakdown = res["breakdown"]
        # Expected:
        # vol_score = 0.20 * 140 = 28.0
        # beta_score = 1.2 * 50 = 60.0
        # sent_score = 50.0
        # tech_score = 40.0 - 10.0 = 30.0 (price > sma50)
        # total = 0.30*28.0 + 0.20*60.0 + 0.40*50.0 + 0.10*30.0 = 8.4 + 12.0 + 20.0 + 3.0 = 43.4
        expected_total = round(
            0.30 * breakdown["volatility"] +
            0.20 * breakdown["beta"] +
            0.40 * breakdown["sentiment"] +
            0.10 * breakdown["technical"],
            1
        )
        self.assertEqual(res["risk_score"], expected_total)

    def test_sentiment_shift_spike(self):
        """
        Verify the Core Differentiator:
        When sentiment shifts from Positive (+0.7) to Negative (-0.7),
        the risk score spikes significantly.
        """
        stock_data = {
            "name": "Test Co",
            "price": 100.0,
            "annualized_volatility": 0.25,
            "beta": 1.0,
            "rsi": 50.0,
            "sma50": 100.0
        }
        analyzer = SentimentRiskAnalyzer("TEST")
        
        pos_sent = {"score": 0.70, "level": "Positive"}
        pos_res = analyzer.calculate_risk(stock_data, pos_sent)
        
        neg_sent = {"score": -0.70, "level": "Negative"}
        neg_res = analyzer.calculate_risk(stock_data, neg_sent)
        
        spike = neg_res["risk_score"] - pos_res["risk_score"]
        # With 40% weight on sentiment:
        # pos_sent_score = (1 - 0.7) * 50 = 15.0
        # neg_sent_score = (1 - (-0.7)) * 50 = 85.0
        # diff in sentiment component = 70.0
        # diff in overall risk = 0.40 * 70 = 28.0 points!
        self.assertAlmostEqual(spike, 28.0, delta=0.5)
        self.assertGreater(spike, 20.0, "Sentiment shift must cause a dramatic risk score spike!")

    def test_recommendation_thresholds(self):
        analyzer = SentimentRiskAnalyzer("AAPL")
        dummy_pred = {"trend": "Bullish", "target_price_7d": 150.0}
        
        rec_buy = analyzer.get_recommendation(35.0, dummy_pred)
        self.assertEqual(rec_buy["action"], "BUY")
        
        rec_caution = analyzer.get_recommendation(50.0, dummy_pred)
        self.assertEqual(rec_caution["action"], "CAUTION")
        
        rec_avoid = analyzer.get_recommendation(65.0, dummy_pred)
        self.assertEqual(rec_avoid["action"], "AVOID")

    def test_7day_prediction(self):
        analyzer = SentimentRiskAnalyzer("NVDA")
        stock_data = {
            "price": 120.0,
            "sma20": 115.0,
            "sma50": 110.0,
            "rsi": 55.0,
            "annualized_volatility": 0.40
        }
        sentiment = {"score": 0.4, "level": "Positive"}
        pred = analyzer.predict_price(stock_data, sentiment)
        
        self.assertEqual(len(pred["forecast"]), 7)
        self.assertIn("target_price_7d", pred)
        self.assertIn("change_pct", pred)
        self.assertIn(pred["trend"], ["Bullish", "Bearish", "Neutral"])
        
        # Upper bound must be higher than lower bound
        for day in pred["forecast"]:
            self.assertGreater(day["upper_bound"], day["lower_bound"])

    def test_database_and_diff(self):
        # Clean test stock
        test_sym = "TEST_DIFF"
        remove_from_watchlist(test_sym)
        
        # Add to watchlist
        add_to_watchlist(test_sym, name="Diff Test Inc", sector="Testing")
        
        # Initial snapshot
        snap1 = {
            "price": 100.0,
            "risk_score": 35.0,
            "sentiment": {"score": 0.5, "level": "Positive"},
            "breakdown": {"volatility": 30.0, "beta": 40.0, "technical": 30.0},
            "recommendation": {"action": "BUY"},
            "risk_factors": ["Low volatility"]
        }
        save_snapshot(test_sym, snap1)
        
        # Second analysis (shocked)
        current = {
            "price": 92.0,
            "risk_score": 68.0,
            "sentiment": {"score": -0.6, "level": "Negative"},
            "breakdown": {"volatility": 50.0, "beta": 40.0, "technical": 60.0},
            "recommendation": {"action": "AVOID"},
            "risk_factors": ["Hostile Media Sentiment", "Elevated Volatility"]
        }
        
        snaps = get_recent_snapshots(test_sym, limit=2)
        diff = compute_diff(current, snaps[0])
        
        self.assertTrue(diff["has_previous"])
        self.assertEqual(diff["price"]["delta"], -8.0)
        self.assertEqual(diff["risk_score"]["delta"], 33.0)
        self.assertTrue(diff["risk_score"]["spiked"])
        self.assertTrue(diff["sentiment"]["shifted"])
        self.assertEqual(diff["sentiment"]["previous_level"], "Positive")
        self.assertEqual(diff["sentiment"]["current_level"], "Negative")
        self.assertTrue(diff["recommendation"]["changed"])
        self.assertEqual(diff["recommendation"]["previous"], "BUY")
        self.assertEqual(diff["recommendation"]["current"], "AVOID")
        
        # Clean up
        remove_from_watchlist(test_sym)

    def test_flask_api_endpoints(self):
        client = flask_app_module.app.test_client()
        
        # Health check
        res = client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        
        # Watchlist get
        res = client.get("/api/watchlist")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("watchlist", data)
        
        # Sentiment simulation endpoint
        shock_res = client.post("/api/sentiment/simulate", json={
            "symbol": "AAPL",
            "headline": "Company hit with federal investigation and huge product recall"
        })
        self.assertEqual(shock_res.status_code, 200)
        shock_data = json.loads(shock_res.data)
        self.assertIn("impact", shock_data)
        self.assertIn("baseline", shock_data)
        self.assertIn("simulated", shock_data)

if __name__ == "__main__":
    unittest.main()
