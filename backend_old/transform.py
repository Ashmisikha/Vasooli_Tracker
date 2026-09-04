# transform.py - Data transformation layer
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class StockTransformer:
    def __init__(self):
        self.transformations = []
    
    def transform_stock_data(self, stock_data):
        """Transform raw stock data into analysis-ready format"""
        if not stock_data:
            return None
        
        transformed = stock_data.copy()
        
        # 1. Calculate price change
        price = transformed.get('price', 0.0)
        prev_close = transformed.get('prev_close', 0.0)
        
        if prev_close and prev_close > 0 and price:
            transformed['change'] = round(((price - prev_close) / prev_close) * 100, 2)
        else:
            transformed['change'] = 0.0
            
        # 2. Add market context volume ratio
        transformed['volume_ratio'] = self._calculate_volume_ratio(transformed)
        
        # 3. Calculate risk score (0-100)
        transformed['risk_score'] = self._calculate_risk_score(transformed)
        
        # 4. Calculate risk level
        risk_score = transformed['risk_score']
        if risk_score > 60:
            transformed['risk_level'] = 'High'
        elif risk_score > 40:
            transformed['risk_level'] = 'Medium'
        else:
            transformed['risk_level'] = 'Low'
        
        # 5. Determine trend
        ma_50 = transformed.get('ma_50')
        if ma_50 and price:
            if price > ma_50 * 1.01:
                transformed['trend'] = 'Bullish'
            elif price < ma_50 * 0.99:
                transformed['trend'] = 'Bearish'
            else:
                transformed['trend'] = 'Neutral'
        else:
            transformed['trend'] = 'Neutral'
        
        return transformed
    
    def _calculate_risk_score(self, data):
        """Calculate comprehensive risk score (0-100)"""
        risk = 0
        
        # Volatility (30% weight)
        volatility = data.get('volatility', 20.0) or 20.0
        if volatility > 40:
            risk += 30
        elif volatility > 25:
            risk += 18
        elif volatility > 15:
            risk += 10
        else:
            risk += 4
        
        # Beta (20% weight)
        beta = data.get('beta', 1.0) or 1.0
        if beta > 1.5:
            risk += 20
        elif beta > 1.0:
            risk += 12
        else:
            risk += 5
        
        # Price position vs Moving Averages (10% weight)
        price = data.get('price', 0)
        ma_50 = data.get('ma_50')
        if price and ma_50:
            if price < ma_50 * 0.9:
                risk += 10
            elif price < ma_50:
                risk += 5
        
        # Volume Ratio (10% weight)
        vol_ratio = data.get('volume_ratio', 1.0)
        if vol_ratio > 2.0:
            risk += 10
        elif vol_ratio > 1.5:
            risk += 5
        
        # Debt/Equity (10% weight)
        debt_equity = data.get('debt_equity')
        if debt_equity is not None:
            if debt_equity > 1.5:
                risk += 10
            elif debt_equity > 0.5:
                risk += 5
        else:
            risk += 3
        
        # P/E Ratio (10% weight)
        pe = data.get('pe_ratio')
        if pe is not None:
            if pe > 40:
                risk += 10
            elif pe > 25:
                risk += 5
        else:
            risk += 3
            
        # Recent Price Change shock penalty (10% weight)
        change = abs(data.get('change', 0.0))
        if change > 5.0:
            risk += 10
        elif change > 2.5:
            risk += 5
        
        return min(100, max(5, int(risk)))
    
    def _calculate_volume_ratio(self, data):
        """Calculate volume vs estimated average"""
        vol = data.get('volume', 0)
        if not vol:
            return 1.0
        
        avg_volume = vol * 0.75
        if avg_volume > 0:
            return round(vol / avg_volume, 2)
        return 1.0
    
    def transform_batch(self, stock_data_list):
        """Transform multiple stock data entries"""
        transformed = []
        for data in stock_data_list:
            if data:
                transformed_data = self.transform_stock_data(data)
                if transformed_data:
                    transformed.append(transformed_data)
        return transformed
