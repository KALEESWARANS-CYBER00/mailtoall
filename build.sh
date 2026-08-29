#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=========================================="
echo "      MailFlow Unified Build Script       "
echo "=========================================="

echo "1. Installing Python dependencies..."
pip install -r requirements.txt

echo "2. Installing Node.js & building React SPA..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  npm run build
  cd ..
  echo "React SPA successfully built to frontend/dist/"
else
  echo "Error: frontend directory not found!"
  exit 1
fi

echo "=========================================="
echo "      Build complete successfully!        "
echo "=========================================="
