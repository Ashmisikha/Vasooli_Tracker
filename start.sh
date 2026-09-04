#!/bin/bash

# Smart Market Watchlist Launcher
# CODE 2026 Hackathon

echo "=========================================================="
echo "🚀 Starting Smart Market Watchlist (CODE 2026)"
echo "   Sentiment-Powered Risk Scoring & 7-Day Forecasting"
echo "=========================================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. Check Python virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install -r backend/requirements.txt
fi

# 2. Check Frontend node_modules
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# 3. Start Backend FastAPI on port 8000
echo "Starting FastAPI Backend API on http://127.0.0.1:8000..."
PYTHONPATH=backend .venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Trap Ctrl+C to stop both processes cleanly
trap "echo 'Shutting down services...'; kill $BACKEND_PID; exit" SIGINT SIGTERM EXIT

# 4. Wait 2 seconds for backend to start
sleep 2

# 5. Start Frontend Vite Dev Server on port 3000
echo "Starting Frontend Vite UI on http://localhost:3000..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 3000
