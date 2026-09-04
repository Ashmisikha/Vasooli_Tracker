# test_watchlist_crud.py - Unit test suite for Watchlist CRUD endpoints
import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from load import StockLoader

class TestWatchlistCRUD(unittest.TestCase):
    def setUp(self):
        self.loader = StockLoader()
        self.test_user = "test_unit_user"
        self.test_symbol = "INFY.NS"

    def test_watchlist_crud_flow(self):
        # 1. Ensure clean baseline
        self.loader.remove_from_watchlist(self.test_symbol, user_id=self.test_user)
        self.assertFalse(self.loader.check_in_watchlist(self.test_symbol, user_id=self.test_user))

        # 2. Add stock to watchlist
        success = self.loader.add_to_watchlist(self.test_symbol, user_id=self.test_user, name="Infosys", sector="Technology")
        self.assertTrue(success)

        # 3. Check stock exists in watchlist
        in_wl = self.loader.check_in_watchlist(self.test_symbol, user_id=self.test_user)
        self.assertTrue(in_wl)

        # 4. Get watchlist items
        wl = self.loader.get_watchlist(user_id=self.test_user)
        symbols = [item['symbol'] for item in wl]
        self.assertIn(self.test_symbol, symbols)

        # 5. Remove stock from watchlist
        removed = self.loader.remove_from_watchlist(self.test_symbol, user_id=self.test_user)
        self.assertTrue(removed)
        self.assertFalse(self.loader.check_in_watchlist(self.test_symbol, user_id=self.test_user))

if __name__ == '__main__':
    unittest.main()
