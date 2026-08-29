#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    MailFlow Local Native Launcher (Linux/Mac)    "
echo "=================================================="

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "✕ Error: Python 3 is not installed. Please install it first."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "✕ Error: Node.js is not installed. Required to build the React SPA."
    exit 1
fi

# 1. Create Python virtual environment if not present
if [ ! -d "venv" ]; then
    echo "Creating virtual environment (venv)..."
    python3 -m venv venv
fi

echo "Installing backend dependencies..."
source venv/bin/activate
pip install -r requirements.txt gunicorn

# 2. Build React SPA if dist folder is missing
if [ ! -d "frontend/dist" ]; then
    echo "Compiling React SPA..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

echo "🚀 Starting MailFlow locally on http://127.0.0.1:5005"
echo "   (SMTP ports 465/587 will connect error-free on your local network!)"

# Open browser automatically
if command -v xdg-open &> /dev/null; then
    xdg-open http://127.0.0.1:5005 &
elif command -v open &> /dev/null; then
    open http://127.0.0.1:5005 &
fi

python app.py
