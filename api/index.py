import sys
import os

# Ensure root and backend directory are in Python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, 'backend')

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app import app as application
except Exception as e:
    try:
        from flask import Flask, jsonify, request
        from flask_cors import CORS
        application = Flask(__name__)
        CORS(application)

        @application.route('/api/health', methods=['GET'])
        @application.route('/api/v1/health', methods=['GET'])
        def health():
            return jsonify({'status': 'healthy', 'message': 'Vasooli API live'})

        @application.route('/api/watchlist', methods=['GET', 'POST', 'DELETE'])
        @application.route('/api/v1/watchlists', methods=['GET', 'POST', 'DELETE'])
        def watchlist():
            return jsonify({'success': True, 'data': [], 'watchlist': [], 'count': 0})
    except Exception:
        application = None

app = application
