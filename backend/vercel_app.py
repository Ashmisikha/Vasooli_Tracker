# backend/vercel_app.py
from app import app

# This is the entry point for Vercel
app = app

# For Vercel serverless
def handler(request, context):
    return app(request)
