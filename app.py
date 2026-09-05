import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, 'backend')
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from backend.app import app as application
    app = application
except Exception:
    try:
        from flask import Flask, jsonify
        app = Flask(__name__)
        @app.route('/', methods=['GET'])
        @app.route('/index.html', methods=['GET'])
        def root():
            return jsonify({'status': 'running', 'message': 'Vasooli Tracker API is live!'})
    except Exception:
        app = None

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    if app:
        app.run(host='0.0.0.0', port=port)
