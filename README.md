# 💰 Vasooli Tracker 💰

## Smart Market Watchlist for CODE 2026


### Overview

Vasooli Tracker is an intelligent market watchlist that helps investors understand what has meaningfully changed since they last checked, and what deserves their attention now.

Most watchlists show stock prices without context. Vasooli remembers your watchlist's previous state, detects meaningful changes, and prioritizes what deserves attention with an Attention Score (0-100).

### Features

#### 1. What Changed Today
- See exactly what changed in your watchlist since your last check
- Attention Score (0-100) prioritizes stocks that need your attention
- High, Medium, and Low priority labels
- Transparent factor breakdown showing WHY each change matters
- No material change filtering for stable stocks

#### 2. Risk Score with 4-Factor Breakdown
- 40 percent News Sentiment — Real-time NLP sentiment analysis from financial news
- 30 percent Volatility — Annualized volatility calculation
- 20 percent Market Beta — Market sensitivity measurement
- 10 percent Technical Position — Moving averages and RSI indicators
- Transparent breakdown shows exactly how each factor contributes to the score

#### 3. Real-time 500+ Stock Universe
- Live prices from Yahoo Finance API
- 500+ Indian and US stocks
- Market breadth: Gainers vs Losers vs Unchanged
- Advance/Decline Ratio with sentiment indicator

#### 4. News Sentiment Intelligence
- Analyzes 25+ financial news articles in real-time
- Multi-factor sentiment breakdown (Revenue, Margin, Guidance, Competition)
- Weighted news sentiment accounts for 40 percent of risk engine scoring

#### 5. Historical Comparison
- Stores previous state for every stock
- Compares current vs previous values
- Shows: Price change, Risk change, Sentiment change, News activity, Volume anomaly
- Since Last Check diff view


### Tech Stack

**Frontend**
- React 18
- Tailwind CSS
- Recharts for charts
- Inter font family
- Axios for API calls

**Backend**
- Flask (Python)
- Yahoo Finance API (yfinance)
- TextBlob for NLP sentiment analysis
- SQLite for state persistence
- Flask-CORS for cross-origin requests

**Data Pipeline**
- Real-time ETL from Yahoo Finance
- 500+ stock universe
- 30-second refresh interval
- Stale-while-revalidate caching

---
## Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | v16 or higher | https://nodejs.org/ |
| Python | v3.8 or higher | https://python.org/ |
| npm | v8 or higher | Comes with Node.js |
| pip | Latest | Comes with Python |
| Git (optional) | Latest | https://git-scm.com/ |

---

## Quick Setup (3 Steps)

### Step 1: Install Backend

cd backend
pip install -r requirements.txt
python app.py
Backend runs on: http://localhost:5000

### Step 2: Install Frontend
Open a new terminal:
cd frontend
npm install
npm start
Frontend runs on: http://localhost:3000

### Step 3: Open Browser
Go to: http://localhost:3000

Click "Try Demo" to start using Vasooli Tracker.
---
### Live Demo: https://vasooli-tracker-inky.vercel.app/dashboard 
---
### Why This Is Different
-Attention Score — Prioritizes, not just tracks
-40% Sentiment Weight — News drives markets
-Transparent Factors — Users see WHY
-Since Last Check — State persistence
-No AI Overclaim — Honest about using TextBlob NLP

### Team
Ashmisikha Piri- RA2311056010222

GitHub: https://github.com/Ashmisikha
LinkedIn: http://www.linkedin.com/in/ashmisikha-piri

### Lin[ks
GitHub: https://github.com/Ashmisikha/Vasooli_Tracker
Live Demo: https://vasooli-tracker-inky.vercel.app/dashboard
