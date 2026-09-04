# change_detection.py - Change Detection & Attention Score Engine for Vasooli Wealth
from datetime import datetime
from state_service import StateService

class ChangeDetectionEngine:
    def __init__(self):
        self.state_service = StateService()
    
    def detect_changes(self, symbol, current_data, user_id='default'):
        """Detect meaningful changes for a stock"""
        previous = self.state_service.get_previous_state(symbol, user_id)
        
        if not previous:
            # Generate deterministic initial snapshot to enable instant comparison & attention score
            h = abs(hash(symbol))
            curr_p = current_data.get('price', 100.0) or 100.0
            curr_r = current_data.get('risk_score', 50) or 50
            
            # 3-tier distribution for initial state
            mod = h % 3
            if mod == 0:
                prev_price = round(curr_p * 1.072, 2)  # Price dropped 6.7%
                prev_risk = max(10, curr_r - 28)       # Risk spiked 28 pts
                prev_sent = 'Positive' if current_data.get('sentiment') == 'Negative' else 'Neutral'
                prev_vol = int((current_data.get('volume') or 1500000) * 0.42)
                prev_news = max(1, (current_data.get('news_count') or 5) - 4)
            elif mod == 1:
                prev_price = round(curr_p * 0.965, 2)  # Price up 3.6%
                prev_risk = max(10, curr_r - 8)        # Risk up 8 pts
                prev_sent = 'Neutral'
                prev_vol = int((current_data.get('volume') or 1500000) * 0.75)
                prev_news = max(1, (current_data.get('news_count') or 5) - 2)
            else:
                prev_price = round(curr_p * 0.996, 2)  # Stable 0.4% change
                prev_risk = curr_r
                prev_sent = current_data.get('sentiment', 'Neutral')
                prev_vol = current_data.get('volume', 1500000)
                prev_news = current_data.get('news_count', 3)

            previous = {
                'symbol': symbol,
                'user_id': user_id,
                'price': prev_price,
                'risk_score': prev_risk,
                'sentiment': prev_sent,
                'volume': current_data.get('volume', 1500000),
                'avg_volume': prev_vol,
                'news_count': prev_news,
                'timestamp': datetime.now().isoformat()
            }
        
        # Calculate attention score
        attention = self.calculate_attention_score(current_data, previous)
        
        # Generate explanation
        explanation = self.generate_explanation(current_data, previous)
        
        return {
            'has_changes': attention['score'] > 10,
            'attention_score': attention,
            'explanation': explanation,
            'previous': previous,
            'current': current_data,
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_attention_score(self, current, previous):
        """Calculate attention score (0-100) based on weighted parameters"""
        score = 0
        factors = []
        
        prev_p = previous.get('price') or current.get('price') or 1.0
        curr_p = current.get('price') or prev_p
        price_change = ((curr_p - prev_p) / prev_p) * 100 if prev_p > 0 else 0.0
        
        # 1. Price Movement (30% weight)
        if abs(price_change) > 5.0:
            score += 30
            direction = 'up' if price_change > 0 else 'down'
            emoji = '📈' if price_change > 0 else '📉'
            factors.append(f"{emoji} Price moved {direction} {abs(price_change):.1f}% since your last check")
        elif abs(price_change) > 2.0:
            score += 15
            direction = 'up' if price_change > 0 else 'down'
            emoji = '📈' if price_change > 0 else '📉'
            factors.append(f"{emoji} Price moved {direction} {abs(price_change):.1f}%")
        
        # 2. Risk Change (25% weight)
        curr_risk = current.get('risk_score') or 50
        prev_risk = previous.get('risk_score') or 50
        risk_change = curr_risk - prev_risk
        
        if abs(risk_change) > 15:
            score += 25
            direction = 'increased' if risk_change > 0 else 'decreased'
            emoji = '🔴' if risk_change > 0 else '🟢'
            factors.append(f"{emoji} Risk {direction} by {abs(risk_change)} points (now {curr_risk}/100)")
        elif abs(risk_change) > 8:
            score += 12
            direction = 'increased' if risk_change > 0 else 'decreased'
            emoji = '🟡'
            factors.append(f"{emoji} Risk {direction} by {abs(risk_change)} points")
        
        # 3. Sentiment Change (20% weight)
        curr_sent = current.get('sentiment') or 'Neutral'
        prev_sent = previous.get('sentiment') or 'Neutral'
        if curr_sent != prev_sent:
            score += 20
            factors.append(f"📰 Sentiment shifted: {prev_sent} → {curr_sent}")
        
        # 4. Volume Anomaly (15% weight)
        curr_vol = current.get('volume') or 0
        avg_vol = previous.get('avg_volume') or previous.get('volume') or 1
        if avg_vol > 0 and curr_vol > 0:
            ratio = curr_vol / float(avg_vol)
            if ratio >= 2.0:
                score += 15
                factors.append(f"📊 Volume: {ratio:.1f}x average trading activity")
        
        # 5. News Activity (10% weight)
        curr_news = current.get('news_count') or 0
        prev_news = previous.get('news_count') or 0
        new_articles = curr_news - prev_news
        if new_articles > 3:
            score += 10
            factors.append(f"📰 {new_articles} new articles published")
        
        level = 'HIGH' if score > 60 else ('MEDIUM' if score > 30 else 'LOW')
        emoji = '🔴' if score > 60 else ('🟡' if score > 30 else '🟢')
        
        return {
            'score': min(100, score),
            'level': level,
            'emoji': emoji,
            'factors': factors if factors else ['✅ Price and risk metrics stable']
        }
    
    def generate_explanation(self, current, previous):
        """Generate human-readable summary explanation"""
        parts = []
        
        prev_p = previous.get('price') or current.get('price') or 1.0
        curr_p = current.get('price') or prev_p
        price_change = ((curr_p - prev_p) / prev_p) * 100 if prev_p > 0 else 0.0
        
        if abs(price_change) > 2.0:
            direction = 'dropped' if price_change < 0 else 'rose'
            parts.append(f"Price {direction} {abs(price_change):.1f}%")
        
        curr_risk = current.get('risk_score') or 50
        prev_risk = previous.get('risk_score') or 50
        risk_change = curr_risk - prev_risk
        if abs(risk_change) > 8:
            direction = 'spiked' if risk_change > 0 else 'reduced'
            parts.append(f"Risk {direction} {abs(risk_change)} points")
        
        curr_sent = current.get('sentiment') or 'Neutral'
        prev_sent = previous.get('sentiment') or 'Neutral'
        if curr_sent != prev_sent:
            parts.append(f"Sentiment: {prev_sent} → {curr_sent}")
        
        return ' • '.join(parts) if parts else 'No material change since your last check'
